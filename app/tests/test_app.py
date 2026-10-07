#!/usr/bin/env python3
"""Functional test pass: drive the real UI and capture evidence."""
import asyncio, os, sys
from playwright.async_api import async_playwright

OUT = '/tmp/nova-shots'
URL = 'http://localhost:5173/'
errors = []


async def open_search(pg):
    """Search lives behind the Profile menu now (the Moments header has no button)."""
    await pg.locator('.tab').nth(2).click()          # Profile
    await pg.wait_for_timeout(650)
    await pg.locator('.btn.sq').first.click()        # profile menu
    await pg.wait_for_selector('.sheet', timeout=5000)
    await pg.locator('.menurow', has_text='Search').first.click()
    await pg.wait_for_selector('.overlay', timeout=5000)
    await pg.wait_for_timeout(650)

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        ctx = await b.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=2)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errors.append('PAGEERROR: %s' % e))
        pg.on('console', lambda m: errors.append('CONSOLE.%s: %s' % (m.type, m.text)) if m.type == 'error' else None)

        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post', timeout=15000)
        await pg.wait_for_timeout(700)

        def log(*a): print(*a, flush=True)

        # ---------- 1. desktop shell ----------
        await pg.screenshot(path=f'{OUT}/01-desktop.png')
        log('desktop: posts =', await pg.locator('.post').count(),
            '| tabs =', await pg.locator('.tab').count())

        # ---------- 2. like ----------
        post = pg.locator('.post').first
        heart = post.locator('.act').first
        before = await post.locator('.likes').inner_text()
        await heart.click()
        await pg.wait_for_timeout(500)
        after = await post.locator('.likes').inner_text()
        log('like:', before, '->', after, '| OK' if before != after else '| FAIL')
        await pg.screenshot(path=f'{OUT}/02-liked.png')

        # ---------- 3. comment ----------
        await post.locator('.act').nth(1).click()
        await pg.wait_for_selector('.cmt-input input')
        await pg.fill('.cmt-input input', 'Testing from automation — looks great.')
        await pg.wait_for_timeout(120)
        n_before = await pg.locator('.cmt').count()
        await pg.click('.sendbtn')
        await pg.wait_for_timeout(500)
        n_after = await pg.locator('.cmt').count()
        log('comment:', n_before, '->', n_after, '| OK' if n_after > n_before else '| FAIL')
        await pg.screenshot(path=f'{OUT}/03-comments.png')
        await pg.click('.sheet-head .iconbtn')
        await pg.wait_for_timeout(400)

        # ---------- 4. story viewer ----------
        await pg.locator('.rail .story').nth(1).click()
        await pg.wait_for_selector('.storyview', timeout=5000)
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f'{OUT}/04-story.png')
        bars = await pg.locator('.sv-bars .fill').count()
        await pg.locator('.sv-tapzone').nth(1).click()
        await pg.wait_for_timeout(400)
        log('stories: bars =', bars)
        await pg.locator('.sv-top .cvbtn').click()
        await pg.wait_for_timeout(400)

        # ---------- 5. search overlay (no longer a tab, nor a Moments button) ----------
        await open_search(pg)
        await pg.screenshot(path=f'{OUT}/05-discover.png')
        await pg.fill('.searchbar input', 'spoliarium')
        await pg.wait_for_timeout(500)
        found = await pg.locator('.explore .tile').count()
        log('search "spoliarium": results =', found, '| OK' if found > 0 else '| FAIL')
        await pg.screenshot(path=f'{OUT}/06-search.png')

        await pg.locator('.overlay .iconbtn.ghost').first.click()   # back out of search
        await pg.wait_for_timeout(500)

        # ---------- 6. activity overlay via the profile menu ----------
        await pg.locator('.tab').nth(2).click()          # Profile
        await pg.wait_for_timeout(700)
        await pg.locator('.btn.sq').first.click()
        await pg.wait_for_selector('.sheet')
        await pg.get_by_text('Activity').first.click()
        await pg.wait_for_selector('.overlay', timeout=5000)
        await pg.wait_for_timeout(700)
        rows = await pg.locator('.act-row').count()
        log('activity rows =', rows)
        await pg.screenshot(path=f'{OUT}/07-activity.png')

        # ---------- 7. compose ----------
        await pg.locator('.overlay .iconbtn.ghost').first.click()
        await pg.wait_for_timeout(500)
        await pg.locator('.tab').nth(1).click()
        await pg.wait_for_timeout(400)
        await pg.locator('.picker .pcell').nth(3).click()
        await pg.fill('.fieldbox textarea', 'Automation test post — the grid system holds up.')
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=f'{OUT}/08-compose.png')
        await pg.locator('.submitbar .btn').click()
        await pg.wait_for_timeout(800)
        mine = await pg.locator('.pgrid .tile').count()
        log('after share → profile grid tiles =', mine, '| OK' if mine > 0 else '| FAIL')
        await pg.screenshot(path=f'{OUT}/09-after-post.png')

        # ---------- 8. creator profile + follow ----------
        await pg.locator('.tab').nth(0).click()          # back to Home
        await pg.wait_for_timeout(600)
        await open_search(pg)
        await pg.fill('.searchbar input', 'mabini')
        await pg.wait_for_timeout(700)
        await pg.locator('.personrow').first.click()
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'{OUT}/10-creator.png')
        follow = pg.locator('.btn.primary').first
        t1 = await follow.inner_text()
        await follow.click()
        await pg.wait_for_timeout(500)
        t2 = await follow.inner_text()
        log('follow button:', t1, '->', t2, '| OK' if t1 != t2 else '| FAIL')
        await pg.screenshot(path=f'{OUT}/11-followed.png')
        await pg.locator('.cover-bar .cvbtn').first.click()
        await pg.wait_for_timeout(400)

        # ---------- 9. persistence ----------
        await pg.reload(wait_until='networkidle')
        await pg.wait_for_selector('.post')
        await pg.locator('.tab').nth(2).click()
        await pg.wait_for_timeout(700)
        kept = await pg.locator('.pgrid .tile').count()
        log('after reload, profile tiles =', kept, '| OK (persisted)' if kept > 0 else '| FAIL')
        await pg.screenshot(path=f'{OUT}/12-profile.png')

        await ctx.close()

        # ---------- 10. mobile / real-device mode ----------
        ctx2 = await b.new_context(
            viewport={'width': 390, 'height': 844}, device_scale_factor=3,
            is_mobile=True, has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
        )
        m = await ctx2.new_page()
        m.on('pageerror', lambda e: errors.append('MOBILE PAGEERROR: %s' % e))
        await m.goto(URL, wait_until='networkidle')
        await m.wait_for_selector('.post', timeout=15000)
        await m.wait_for_timeout(900)
        await m.screenshot(path=f'{OUT}/20-mobile-home.png')
        cls = await m.evaluate("document.body.className")
        log('mobile body class =', repr(cls))
        await m.locator('.tab').nth(2).click()
        await m.wait_for_timeout(700)
        await m.screenshot(path=f'{OUT}/21-mobile-profile.png')
        await m.locator('.tab').nth(0).click()
        await m.wait_for_timeout(400)
        await m.locator('.post .act').first.click()
        await m.wait_for_timeout(600)
        await m.screenshot(path=f'{OUT}/22-mobile-feed.png')
        await ctx2.close()
        await b.close()

    print('\n--- errors ---')
    print('\n'.join(errors) if errors else 'none')
    return 1 if errors else 0

sys.exit(asyncio.run(main()))
