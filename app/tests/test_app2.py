#!/usr/bin/env python3
"""Second pass: the interactions a first pass missed."""
import asyncio, os, sys
from playwright.async_api import async_playwright
OUT = '/tmp/nova-shots'; URL='http://localhost:5173/'; errors=[]

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':1280,'height':900}, device_scale_factor=2)
        pg=await ctx.new_page()
        pg.on('pageerror', lambda e: errors.append('PAGEERROR: %s'%e))
        pg.on('console', lambda m: errors.append('CONSOLE: %s'%m.text) if m.type=='error' else None)
        await pg.goto(URL, wait_until='networkidle')
        await pg.wait_for_selector('.post'); await pg.wait_for_timeout(600)

        # follow from a feed post card
        before = await pg.locator('.followbtn').first.inner_text()
        await pg.locator('.followbtn').first.click(); await pg.wait_for_timeout(500)
        after = await pg.locator('.followbtn').first.inner_text()
        print('feed-card follow:', before, '->', after, '| OK' if before!=after else '| FAIL')

        # following tab should now include that creator
        await pg.locator('.feedtab').nth(1).click(); await pg.wait_for_timeout(500)
        n = await pg.locator('.post').count()
        print('following tab posts =', n)
        await pg.screenshot(path=f'{OUT}/30-following-tab.png')

        # comment count row opens the sheet
        await pg.locator('.feedtab').nth(0).click(); await pg.wait_for_timeout(400)
        await pg.locator('.cmts.link').first.click()
        await pg.wait_for_selector('.sheet', timeout=5000)
        modal = await pg.locator('.sheet').count()
        print('post sheet opens:', modal, '| OK' if modal else '| FAIL')
        await pg.screenshot(path=f'{OUT}/31-sheet.png')
        await pg.click('.sheet-head .iconbtn'); await pg.wait_for_timeout(400)

        # save a post, then check Saved tab on the creator profile
        await pg.locator('.post').nth(1).locator('.act').nth(3).click(); await pg.wait_for_timeout(500)

        # profile tabs: reels / tagged / saved
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(600)
        for i,name in enumerate(['posts','reels','tagged','saved']):
            await pg.locator('.ptab').nth(i).click(); await pg.wait_for_timeout(400)
            tiles = await pg.locator('.pgrid .tile').count()
            empty = await pg.locator('.empty').count()
            print(f'profile tab {name}: tiles={tiles} empty={empty}')

        # saved tab should now hold the post we bookmarked
        await pg.locator('.ptab').nth(3).click(); await pg.wait_for_timeout(500)
        saved = await pg.locator('.pgrid .tile').count()
        print('saved tiles =', saved, '| OK' if saved>0 else '| FAIL')
        await pg.screenshot(path=f'{OUT}/32-saved-tab.png')

        # edit profile save
        await pg.locator('.ptab').nth(0).click(); await pg.wait_for_timeout(300)
        await pg.locator('.btn.primary').first.click()
        await pg.wait_for_selector('.sheet'); await pg.wait_for_timeout(300)
        box = pg.locator('.editrow:has(.lbl:text-is("Name")) input')   # not the Category row
        await box.fill('José R.'); await pg.wait_for_timeout(200)
        await pg.locator('.sheet-head button').click()
        await pg.wait_for_timeout(700)
        name = await pg.locator('.prof-name').inner_text()
        print('edited name =', repr(name.strip()[:20]), '| OK' if 'José R.' in name else '| FAIL')

        # followers count sanity after toggles
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(500)
        stats = await pg.locator('.stat').all_inner_texts()
        print('profile stats =', [s.replace('\\n',' ').strip() for s in stats])

        # persistence
        await pg.reload(wait_until='networkidle'); await pg.wait_for_selector('.post'); await pg.wait_for_timeout(700)
        await pg.locator('.tab').nth(2).click(); await pg.wait_for_timeout(600)
        nm = await pg.locator('.prof-name').inner_text()
        print('after reload name =', repr(nm.strip()[:20]), '| OK (persisted)' if 'José R.' in nm else '| FAIL')

        # reset demo data
        await pg.locator('.btn.sq').first.click(); await pg.wait_for_selector('.sheet'); await pg.wait_for_timeout(300)
        await pg.get_by_text('Reset demo data').first.click(); await pg.wait_for_timeout(900)
        nm2 = await pg.locator('.prof-name').inner_text()
        print('after reset name =', repr(nm2.strip()[:28]), '| OK' if nm2.strip().startswith('José Protacio Rizal Mercado y Alonso Realonda') else '| FAIL')
        await pg.screenshot(path=f'{OUT}/33-after-reset.png')
        await b.close()
    print('\n--- errors ---'); print('\n'.join(errors) if errors else 'none')
    return 1 if errors else 0
sys.exit(asyncio.run(main()))
