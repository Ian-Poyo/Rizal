#!/usr/bin/env python3
"""The young-Rizal profile rubric + the Mi ultimo adios picture swap.

Run with the dev server up:  python3 app/tests/test_young.py
"""
import asyncio
from playwright.async_api import async_playwright

URL = 'http://localhost:5173/'
OUT = '/tmp/nova-shots'
errs, ok, bad = [], [], []


def check(label, cond, extra=None):
    (ok if cond else bad).append(label)
    print(f'{"OK  " if cond else "FAIL"} {label}' + ('' if extra is None else f'  -> {extra}'))


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 822}, device_scale_factor=2,
                                  is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: %s' % e))
        pg.on('console', lambda m: errs.append('CONSOLE: %s' % m.text) if m.type == 'error' else None)
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post', timeout=20000)
        await pg.wait_for_timeout(900)

        # ---------- 1. home feed: the young-Rizal post and its hashtag ----------
        first_cap = await pg.locator('.post').first.locator('.cap').inner_text()
        check('newest post is the poem post', 'Sa Aking Mga Kabata' in first_cap, first_cap[:70])
        check('caption carries the required line', 'If Young Rizal Had Social Media' in first_cap)
        tg = await pg.locator('.post').first.locator('.ptags .tg').all_inner_texts()
        check('hashtag chip in the feed', '#YoungRizal' in tg, tg)

        # ---------- 2. profile: the nine-field rubric ----------
        await pg.locator('.tabbar .tab').nth(2).click()
        await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/young-01-profile-top.png')
        name = (await pg.locator('.prof-name').inner_text()).strip()
        check('full legal name', name.startswith('José Protacio Rizal Mercado y Alonso Realonda'), name[:60])
        bio = await pg.locator('.prof-bio').inner_text()
        bl = bio.upper()
        check('young-Rizal bio', bio.count('.') >= 3 and 'Calamba' in bio, bio[:90].replace('\n', ' '))
        check('Family line', 'FAMILY' in bl and 'Teodora Alonso Realonda' in bio and 'Paciano' in bio)
        check('Childhood interests line', 'CHILDHOOD INTERESTS' in bl and 'drawing' in bio)
        check('no childhood-events list left in the description',
              await pg.locator('.bio-note .ev li').count() == 0
              and 'CHILDHOOD EVENTS' not in bl)
        av = await pg.evaluate("getComputedStyle(document.querySelector('.pfp .in')).backgroundImage")
        check('profile photo is a real image', 'av-rizal' in av or 'data:image' in av, av)
        check('About paragraph kept (round 11)', (await pg.locator('.bio-desc').count()) == 1)

        # the Posts stat is the real count — not a padded number (round 22)
        await pg.locator('.scroller').first.evaluate('(el) => el.scrollTo(0, 560)')
        await pg.wait_for_timeout(500)
        stat = (await pg.locator('.stat').first.inner_text()).split('\n')[0].strip().replace(',', '')
        tiles = await pg.locator('.pgrid .tile').count()
        check('Posts stat = 5, the real number', stat == '5', stat)
        check('Posts stat equals the grid', int(stat) == tiles, f'{stat} vs {tiles}')

        await pg.locator('.scroller').first.evaluate('(el) => el.scrollTo(0, 470)')
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'{OUT}/young-02-records.png')

        # ---------- 3. highlights open ----------
        await pg.locator('.scroller').first.evaluate('(el) => el.scrollTo(0, 980)')
        await pg.wait_for_timeout(600)
        titles = await pg.locator('.hl-item .hl-label').all_inner_texts()
        check('the childhood highlight is named Childhood', 'Childhood' in titles, titles)
        await pg.locator('.hl-item', has_text='Childhood').first.click()
        await pg.wait_for_selector('.storyview')
        await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/young-03-highlight-viewer.png')
        check('highlight viewer opens the poster', await pg.locator('.storyview').count() == 1)
        await pg.keyboard.press('Escape')
        await pg.wait_for_timeout(500)

        # ---------- 4. post sheet: the hashtag chips ----------
        await pg.locator('.scroller').first.evaluate('(el) => el.scrollTo(0, 0)')
        await pg.wait_for_timeout(400)
        await pg.locator('.pgrid .tile').first.click()
        await pg.wait_for_selector('.sheet')
        await pg.wait_for_timeout(900)
        sheet = await pg.locator('.sheet').inner_text()
        check('post sheet shows the hashtag', '#YoungRizal' in sheet, sheet[:60].replace('\n', ' '))
        await pg.keyboard.press('Escape')
        await pg.wait_for_timeout(600)

        # ---------- 5. the "Mi ultimo adios" post shows Fort Santiago, not a stray photo ----------
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post')
        await pg.wait_for_timeout(1200)
        post = pg.locator('.post').filter(has_text='Fort Santiago')
        check('Mi ultimo adios post is present', await post.count() == 1, await post.count())
        info = await post.first.evaluate("""(el) => {
            const im = el.querySelector('img'); const r = im.getBoundingClientRect();
            return { src: im.currentSrc.split('/').pop().split('?')[0], nw: im.naturalWidth, nh: im.naturalHeight,
                     w: Math.round(r.width), h: Math.round(r.height) };
        }""")
        check('it uses work-ultimo.jpg', info['src'] == 'work-ultimo.jpg', info)
        check('frame matches the picture (4:3, no crop)',
              abs(info['w'] / info['h'] - info['nw'] / info['nh']) < 0.02, info)
        check('drawn at full width, not upscaled', info['w'] <= info['nw'], info)
        cap = await post.first.locator('.cap').inner_text()
        check('caption names the place in the picture', 'Rizal Shrine' in cap and 'Fort Santiago' in cap, cap[:80])
        check('location chip says Fort Santiago',
              'Fort Santiago' in await post.first.locator('.media-tag').inner_text())
        await post.first.scroll_into_view_if_needed()
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'{OUT}/young-04-ultimo-post.png')

        # ---------- 6. the family + Madrid highlights (round 20) ----------
        await pg.locator('.tabbar .tab').nth(2).click()
        await pg.wait_for_timeout(900)
        titles = await pg.locator('.hl-item .hl-label').all_inner_texts()
        check('Painters highlight replaced by Family', 'Painters' not in titles and 'Family' in titles, titles)
        check('childhood events are a highlight now', 'Childhood' in titles, titles)
        await pg.locator('.scroller').first.evaluate('(el) => el.scrollTo(0, 980)')
        await pg.wait_for_timeout(500)
        await pg.locator('.hl-item', has_text='Family').first.click()
        await pg.wait_for_selector('.storyview')
        await pg.wait_for_timeout(800)
        head = await pg.locator('.storyview .wh').inner_text()
        check('Family reel has five photos', '5 photos' in head, head)
        c1 = (await pg.locator('.sv-caption').inner_text()).split('\n')[0]
        check('Family slide 1 is the Calamba house', 'Calamba' in c1 and '1861' in c1, c1[:70])
        check('highlight slides carry captions', len(c1) > 30)
        fit = await pg.evaluate("getComputedStyle(document.querySelector('.storyview img.full')).objectFit")
        check('highlight viewer uses contain', fit == 'contain', fit)
        await pg.screenshot(path=f'{OUT}/young-05-family-highlight.png')
        await pg.keyboard.press('Escape')
        await pg.wait_for_timeout(500)
        await pg.locator('.hl-item', has_text='Childhood').first.click()
        await pg.wait_for_selector('.storyview')
        await pg.wait_for_timeout(800)
        head = await pg.locator('.storyview .wh').inner_text()
        check('Childhood reel has five photos (3-5 events)', '5 photos' in head, head)
        ccaps = []
        for i in range(5):
            ccaps.append((await pg.locator('.sv-caption').inner_text()).split('\n')[0])
            if i < 4:
                await pg.locator('.storyview').click(position={'x': 320, 'y': 400})
                await pg.wait_for_timeout(600)
        joined2 = ' '.join(ccaps)
        check('event 1 = the alphabet at his mother\u2019s knee', '1864' in ccaps[0] and 'mother' in ccaps[0], ccaps[0][:70])
        check('event 2 = Antipolo', 'Antipolo' in ccaps[1], ccaps[1][:60])
        check('event 3 = Bi\u00f1an', 'Bi' in ccaps[2] and 'Justiniano Cruz' in ccaps[2], ccaps[2][:60])
        check('event 4 = Gomburza', 'Gomburza' in ccaps[3] and '1872' in ccaps[3], ccaps[3][:60])
        check('event 5 = Ateneo Municipal', 'Ateneo Municipal' in ccaps[4], ccaps[4][:60])
        check('every event slide carries a caption', all(len(c) > 40 for c in ccaps), [len(c) for c in ccaps])
        imgs = await pg.evaluate("""async () => {
            const im = document.querySelector('.storyview img.full');
            return { ok: im.complete && im.naturalWidth > 0, nw: im.naturalWidth };
        }""")
        check('every event slide has a real picture', imgs['ok'], imgs)
        await pg.screenshot(path=f'{OUT}/young-07-childhood-highlight.png')
        await pg.keyboard.press('Escape')
        await pg.wait_for_timeout(500)

        await pg.locator('.hl-item', has_text='Madrid').first.click()
        await pg.wait_for_selector('.storyview')
        await pg.wait_for_timeout(800)
        m1 = (await pg.locator('.sv-caption').inner_text()).split('\n')[0]
        check('Madrid slide 1 is the Universidad Central record',
              'Universidad Central' in m1 and '1884' in m1 and '1885' in m1, m1[:80])
        await pg.screenshot(path=f'{OUT}/young-06-madrid-highlight.png')
        await pg.keyboard.press('Escape')
        await pg.wait_for_timeout(600)

        # ---------- 6b. the stat is honest on the other profiles too ----------
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post')
        await pg.wait_for_timeout(900)
        for i in range(3):
            who = await pg.locator('.post').nth(i).locator('.post-sub').inner_text()
            if 'joserizal' in who:
                continue
            await pg.evaluate("(k) => document.querySelectorAll('.post')[k].querySelector('.post-who').click()", i)
            await pg.wait_for_timeout(800)
            st = int((await pg.locator('.stat').first.inner_text()).split('\n')[0].strip().replace(',', ''))
            tl = await pg.locator('.pgrid .tile').count()
            check(f'@{who.split("·")[0].strip()}: stat matches its grid', st == tl, f'{st} vs {tl}')
            break

        # ---------- 7. nothing is cropped anywhere in the feed ----------
        wrong = await pg.evaluate("""async () => {
            const out = [];
            for (const im of document.querySelectorAll('.post img')) {
                if (!im.complete) await new Promise(r => im.onload = r);
                if (!im.naturalWidth) { out.push({ src: im.currentSrc.slice(-40), why: 'broken' }); continue; }
                const r = im.getBoundingClientRect();
                if (r.height && Math.abs((r.width / r.height) - (im.naturalWidth / im.naturalHeight)) > 0.03) {
                    out.push({ src: im.currentSrc.slice(-40), why: 'cropped frame' });
                }
            }
            return out;
        }""")
        check('every feed image decoded and drawn at its own ratio', not wrong, wrong)
        check('no console / page errors', not errs, '; '.join(errs[:3]))
        await b.close()

    print(f'\n{len(ok)} passed, {len(bad)} failed')
    if bad:
        print('failed:', bad)
    return 1 if bad or errs else 0


raise SystemExit(asyncio.run(main()))
