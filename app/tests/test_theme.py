#!/usr/bin/env python3
"""Verify the new work: avatar clipping, About sub-sections, Highlights, theme switch, glass chrome."""
import asyncio, sys
from playwright.async_api import async_playwright
OUT = '/tmp/nova-shots'; URL='http://localhost:5173/'
errs=[]

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':1280,'height':900}, device_scale_factor=2)
        pg=await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: %s'%e))
        pg.on('console', lambda m: errs.append('CONSOLE: %s'%m.text) if m.type=='error' else None)
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post'); await pg.wait_for_timeout(700)

        # ---- 1. Home has no header at all; the theme toggle lives on the profile cover bar ----
        print('home appbar (want 0) :', await pg.locator('.appbar').count())
        print('home greeting (want 0):', await pg.locator('.greet').count(),
              '| theme chip on Home:', await pg.locator('.themebtn').count())

        # ---- 2. profile: avatar not clipped + about + highlights, then the theme switch ----
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(900)
        start = await pg.evaluate("document.documentElement.dataset.theme")
        chip = pg.locator('.cover-bar .cvbtn[aria-label="Toggle appearance"]')
        await chip.click(); await pg.wait_for_timeout(800)
        light = await pg.evaluate("document.documentElement.dataset.theme")
        print(f'theme {start} -> {light} | OK' if start != light else 'THEME FAIL')
        await pg.screenshot(path=f'{OUT}/70-light-profile.png')

        # glass chrome must still be translucent in light mode
        blur = await pg.evaluate("getComputedStyle(document.querySelector('.tabbar')).backdropFilter")
        cover = await pg.evaluate("getComputedStyle(document.querySelector('.cover-bar .cvbtn')).backgroundColor")
        print('tabbar backdrop      :', blur)
        print('cover-bar chip bg    :', cover)
        await pg.locator('.tab').nth(0).click(); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'{OUT}/70-light-home.png')
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'{OUT}/71-light-profile.png')

        # is the avatar fully visible (not covered by the cover scrim)?
        av = await pg.evaluate("""() => {
            const p = document.querySelector('.pfp');
            const r = p.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width/2, r.top + 6);
            return { inside: p.contains(top), w: Math.round(r.width), h: Math.round(r.height) };
        }""")
        print('avatar box           :', av, '| OK (clickable at top)' if av['inside'] else '| CLIPPED/COVERED')

        about = (await pg.locator('.bio-desc').inner_text())[:60] if await pg.locator('.bio-desc').count() else ''
        hl = await pg.locator('.hl-item').count()
        print('about description    :', about)
        print('highlights           :', hl)
        print('about sub-labels gone:', await pg.locator('.albl').count() == 0)
        await pg.screenshot(path=f'{OUT}/72-light-about-highlights.png')

        # ---- 3. highlight viewer ----
        await pg.locator('.hl-item').nth(2).click()
        await pg.wait_for_selector('.storyview', timeout=5000); await pg.wait_for_timeout(1400)
        title = await pg.locator('.sv-top .nm').inner_text()
        bars = await pg.locator('.sv-bars i').count()
        print(f'highlight viewer     : "{title}" bars={bars} | OK' if bars>1 else 'VIEWER FAIL')
        await pg.screenshot(path=f'{OUT}/73-light-highlight.png')
        await pg.locator('.sv-tapzone').nth(1).click(); await pg.wait_for_timeout(900)
        print('advanced to slide 2  :', await pg.locator('.sv-caption').inner_text())
        await pg.locator('.sv-top .cvbtn').last.click(); await pg.wait_for_timeout(400)

        # ---- 4. create a highlight ----
        await pg.locator('.hl-item').first.click()   # the "New" tile
        await pg.wait_for_selector('.sheet', timeout=5000); await pg.wait_for_timeout(400)
        await pg.fill('.fieldbox input', '1898')
        await pg.locator('.picker .pcell').nth(0).click()
        await pg.locator('.picker .pcell').nth(3).click()
        await pg.wait_for_timeout(300)
        await pg.locator('.sheet-head button').click()  # Create
        await pg.wait_for_timeout(900)
        labels = await pg.locator('.hl-label').all_inner_texts()
        print('highlights after add :', labels, '| OK' if '1898' in labels else '| FAIL')
        await pg.screenshot(path=f'{OUT}/74-highlight-created.png')

        # ---- 5. edit profile persists the about fields ----
        await pg.locator('.btn.primary').first.click()
        await pg.wait_for_selector('.sheet'); await pg.wait_for_timeout(400)
        rows = await pg.locator('.editrow .lbl').all_inner_texts()
        print('edit sheet fields    :', rows)
        await pg.locator('.editrow textarea').nth(1).fill('Rewritten description for the test.')
        await pg.locator('.sheet-head button').last.click()
        await pg.wait_for_timeout(800)
        txt = await pg.locator('.bio-desc').inner_text()
        print('about updated        :', 'OK' if 'Rewritten description for the test.' in txt else 'FAIL', '->', txt[:60])
        await pg.screenshot(path=f'{OUT}/75-about-edited.png')

        # ---- 6. back to dark, check creator profile + glass again ----
        await pg.evaluate("document.querySelector('.scroller').scrollTop = 0")   # clear the sticky profbar
        await pg.wait_for_timeout(400)
        await pg.locator('.cover-bar .cvbtn[aria-label="Toggle appearance"]').click(); await pg.wait_for_timeout(800)
        dark = await pg.evaluate("document.documentElement.dataset.theme")
        print('profile toggle       : now', dark, '| OK' if dark=='dark' else '| FAIL')
        await pg.locator('.tab').nth(0).click(); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'{OUT}/76-dark-home.png')
        await pg.locator('.post-who').nth(1).click(); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/77-dark-creator.png')
        print('creator highlights   :', await pg.locator('.hl-item').count())
        print('creator about        :', (await pg.locator('.bio-desc').inner_text())[:48])
        await b.close()
    print('\n--- errors ---'); print('\n'.join(errs) if errs else 'none')
    return 1 if errs else 0
sys.exit(asyncio.run(main()))
