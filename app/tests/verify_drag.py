"""Round-6 browser verification: See-all gone; Moments + Highlights drag-scroll (mouse)."""
import asyncio, os
from playwright.async_api import async_playwright

URL = 'http://localhost:5173/'
OUT = '/tmp/nova-shots'
os.makedirs(OUT, exist_ok=True)
ok, bad = [], []


def check(name, cond, extra=''):
    (ok if cond else bad).append(f'{name}{(" -> " + str(extra)) if extra else ""}')
    print(('PASS  ' if cond else 'FAIL  ') + name + (f'  [{extra}]' if extra else ''))


async def drag(page, sel, dx, steps=14):
    box = await page.locator(sel).first.bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    for i in range(1, steps + 1):
        await page.mouse.move(cx + dx * i / steps, cy, steps=1)
    await page.mouse.up()
    await page.wait_for_timeout(500)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_timeout(700)

        # ---------- structure ----------
        check('no "See all" text anywhere', await pg.get_by_text('See all').count() == 0)
        check('.rail-head is label-only (0 .m buttons)', await pg.locator('.rail-head .m').count() == 0)
        check('Moments header still present',
              (await pg.locator('.rail-head .t').first.inner_text()).strip() == 'Moments')
        first = await pg.evaluate("document.querySelector('.scroller').children[1].className")
        check('feed starts with rail-head after pullind', 'rail-head' in first, first)
        check('content flush at top of screen (no header gap)', await pg.evaluate(
            """(() => { const s=document.querySelector('.rail-head').getBoundingClientRect();
                 const p=document.querySelector('.pullind').getBoundingClientRect();
                 return Math.round(s.top - p.bottom) === 0 && Math.round(s.top) <= 0 })()"""))
        sw, cw = await pg.evaluate(
            "(() => {const r=document.querySelector('.rail'); return [r.scrollWidth, r.clientWidth]})()")
        check('rail overflows (scrollable)', sw > cw + 20, f'{sw} > {cw}')
        check('rail has grab cursor + pan-x', await pg.evaluate(
            "(() => {const c=getComputedStyle(document.querySelector('.rail'));"
            " return c.cursor==='grab' && c.touchAction==='pan-x'})()"))
        await pg.screenshot(path=f'{OUT}/E1-home-dark.png')

        # ---------- drag left (right-to-left) ----------
        await drag(pg, '.rail', -130)
        sl = await pg.evaluate("document.querySelector('.rail').scrollLeft")
        check('rail drags right-to-left', sl > 60, f'scrollLeft={round(sl)}')
        await pg.screenshot(path=f'{OUT}/E2-home-dragged.png')

        # ---------- drag back ----------
        await drag(pg, '.rail', 120)
        sl2 = await pg.evaluate("document.querySelector('.rail').scrollLeft")
        check('rail drags back left-to-right', sl2 < sl - 40, f'scrollLeft={sl2:.0f} < {sl:.0f}')

        # ---------- momentum + click swallow (down/up on the SAME tile) ----------
        box = await pg.locator('.rail .story').nth(1).bounding_box()
        cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        await pg.mouse.move(cx, cy); await pg.mouse.down()
        await pg.mouse.move(cx - 45, cy, steps=6); await pg.mouse.move(cx, cy, steps=6)
        await pg.mouse.up(); await pg.wait_for_timeout(600)
        check('drag does not fire the story click', await pg.locator('.storyview').count() == 0)
        check('still on Home after drag', await pg.locator('.rail').count() == 1)
        check('no inertia runaway (scrollLeft finite)', (await pg.evaluate(
            "document.querySelector('.rail').scrollLeft")) >= 0)

        # ---------- plain click still opens a story (fresh load, no drag yet) ----------
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(600)
        await pg.locator('.rail .story').nth(2).click()
        await pg.wait_for_timeout(500)
        check('tap opens story on a clean load', await pg.locator('.storyview').count() == 1)
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(600)
        await drag(pg, '.rail', -90)
        await pg.locator('.rail .story').nth(4).click()
        await pg.wait_for_timeout(500)
        check('plain tap opens story viewer', await pg.locator('.storyview').count() == 1)
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(600)

        # ---------- profile highlights ----------
        await pg.locator('.tabbar .tab').nth(2).click()
        await pg.wait_for_timeout(700)
        check('Highlights header label-only (no See all / no New)', await pg.locator('.sec-head .m').count() == 0)
        hsw, hcw = await pg.evaluate(
            "(() => {const r=document.querySelector('.hlights'); return [r.scrollWidth, r.clientWidth]})()")
        check('hlights overflows', hsw > hcw + 20, f'{hsw} > {hcw}')
        # the profile grew with the young-Rizal record — bring the rail into view before dragging
        await pg.locator('.hlights').scroll_into_view_if_needed()
        await pg.wait_for_timeout(400)
        await drag(pg, '.hlights', -130)
        hsl = await pg.evaluate("document.querySelector('.hlights').scrollLeft")
        check('hlights drags right-to-left', hsl > 40, f'scrollLeft={round(hsl)}')
        await pg.screenshot(path=f'{OUT}/E3-profile-highlights-dark.png')

        await pg.locator('.hlights .hl-item').nth(1).click()
        await pg.wait_for_timeout(500)
        check('plain tap opens highlight viewer', await pg.locator('.storyview').count() == 1)
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(600)

        # ---------- light theme ----------
        await pg.locator('.tabbar .tab').nth(2).click(); await pg.wait_for_timeout(600)
        await pg.locator('.cover-bar .cvbtn').nth(1).click()
        await pg.wait_for_timeout(600)
        check('light theme applied', await pg.evaluate(
            "document.documentElement.getAttribute('data-theme')") == 'light')
        await pg.locator('.tabbar .tab').nth(0).click(); await pg.wait_for_timeout(600)
        check('rail still draggable in light theme', await pg.evaluate(
            "getComputedStyle(document.querySelector('.rail')).cursor") == 'grab')
        await drag(pg, '.rail', -120)
        check('light-theme rail drags', (await pg.evaluate(
            "document.querySelector('.rail').scrollLeft")) > 40)
        await pg.screenshot(path=f'{OUT}/E4-home-light.png')

        check('no console / page errors', not errs, '; '.join(errs[:3]))
        await b.close()

    print(f'\n{len(ok)} passed, {len(bad)} failed')
    for f in bad:
        print('  FAILED:', f)


asyncio.run(main())
