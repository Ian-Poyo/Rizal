#!/usr/bin/env python3
"""Verify the four latest changes."""
import asyncio, sys
from playwright.async_api import async_playwright

OUT = '/tmp/nova-shots'
URL = 'http://localhost:5173/'
errs = []


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=2)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: %s' % e))
        pg.on('console', lambda m: errs.append('CONSOLE: %s' % m.text) if m.type == 'error' else None)
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post', timeout=20000)
        await pg.wait_for_timeout(900)

        # ---- 1. search row gone ----
        print('search row on Home :', await pg.locator('.searchrow').count(), '| filter btn:',
              await pg.locator('.fbtn').count(), '| (both should be 0)')

        # ---- 2. Home header fully removed (round 5) + Moments header label-only (round 6) ----
        print('home appbar (want 0)  :', await pg.locator('.appbar').count())
        print('greeting (want 0)     :', await pg.locator('.greet').count(),
              '| theme chip on Home:', await pg.locator('.themebtn').count())
        first = await pg.evaluate("document.querySelector('.scroller').children[1].className")
        print('feed starts with      :', first, '| OK' if 'rail-head' in first else '| FAIL')
        print('rail-head buttons(0)  :', await pg.locator('.rail-head .m').count(),
              '| "See all" text:', await pg.get_by_text('See all').count())

        # ---- 3. theme chip contrast, measured where the chip actually lives (profile cover bar) ----
        def lum(c):
            c = c.replace('rgb(', '').replace('rgba(', '').replace(')', '').split(',')
            r, g, bl = [int(float(x)) / 255 for x in c[:3]]
            f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)

        def ratio(a, c):
            la, lc = lum(a), lum(c)
            hi, lo = max(la, lc), min(la, lc)
            return round((hi + 0.05) / (lo + 0.05), 2)

        await pg.locator('.tab').nth(2).click()
        await pg.wait_for_timeout(1000)
        chip = pg.locator('.cover-bar .cvbtn[aria-label="Toggle appearance"]')

        for mode in ('dark', 'light'):
            ic = await pg.evaluate("""() => {
                const b = document.querySelector('.cover-bar .cvbtn[aria-label="Toggle appearance"]');
                const svg = b.querySelector('svg');
                return { icon: svg.querySelector('circle') ? 'sun' : 'moon',
                         fg: getComputedStyle(svg).color,
                         chip: getComputedStyle(b).backgroundColor };
            }""")
            r = ratio(ic['fg'], ic['chip'])
            want = 'sun' if mode == 'dark' else 'moon'
            print(f"theme chip {mode:5} : shows {ic['icon']:4} (want {want}) fg={ic['fg']} chip={ic['chip']} contrast={r}:1",
                  '| OK' if r >= 3 and ic['icon'] == want else '| CHECK')
            await pg.screenshot(path=f'{OUT}/B-{mode}-themechip.png')
            await chip.click()
            await pg.wait_for_timeout(800)

        # make sure we are back in dark for the remaining checks
        if await pg.evaluate("document.documentElement.dataset.theme") != 'dark':
            await chip.click()
            await pg.wait_for_timeout(700)
        print('theme now            :', await pg.evaluate("document.documentElement.dataset.theme"))

        # ---- 4. About is one description ----
        await pg.locator('.tab').nth(2).click()
        await pg.wait_for_timeout(1000)
        rows = await pg.locator('.about-row').count()
        desc = pg.locator('.bio-desc')
        txt = await desc.inner_text() if await desc.count() else ''
        print('about rows (want 0):', rows)
        print('about description  :', txt[:96] + ('…' if len(txt) > 96 else ''))
        print('has sub-labels     :', await pg.locator('.albl').count())
        await pg.screenshot(path=f'{OUT}/B-profile-about.png')

        # edit sheet has a single description field
        await pg.locator('.btn.primary').first.click()
        await pg.wait_for_selector('.sheet')
        await pg.wait_for_timeout(400)
        labels = await pg.locator('.editrow .lbl').all_inner_texts()
        print('edit fields        :', labels)
        await pg.screenshot(path=f'{OUT}/B-edit-sheet.png')
        ta = pg.locator('.editrow textarea')
        await ta.nth(1).fill('Testing the new single description field for the About section.')
        await pg.locator('.sheet-head button').last.click()
        await pg.wait_for_timeout(900)
        print('after save         :', (await pg.locator('.bio-desc').inner_text())[:60])

        # migration from old object-shaped data
        legacy = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            raw.users = raw.users.map(u => u.id === 'joserizal'
              ? { ...u, about: { family: 'Married', siblings: 'One brother', work: 'Designer' } } : u);
            localStorage.setItem('nova.app.v5', JSON.stringify(raw));
            return true;
        }""")
        await pg.reload(wait_until='networkidle')
        await pg.wait_for_selector('.post'); await pg.wait_for_timeout(900)
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(900)
        print('legacy about saved :', (await pg.locator('.bio-desc').inner_text())[:52])

        await b.close()
    print('\n--- errors ---')
    print('\n'.join(errs) if errs else 'none')
    return 1 if errs else 0


sys.exit(asyncio.run(main()))
