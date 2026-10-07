"""Every image + profile field must be user input, and survive a reload."""
import asyncio
from playwright.async_api import async_playwright

# fixture images live in /tmp; make them here so the suite is self-contained
import subprocess, sys
subprocess.run([sys.executable, '-c', '''
from PIL import Image, ImageDraw
for path, size, col in [("/tmp/up-avatar.png",(600,800),(230,90,60)),("/tmp/up-cover.png",(1400,700),(60,150,120)),
                        ("/tmp/up-story.png",(900,1200),(120,90,220)),("/tmp/up-hl.png",(800,800),(220,170,60))]:
    im = Image.new("RGB", size, col); d = ImageDraw.Draw(im)
    d.ellipse((size[0]*0.25, size[1]*0.25, size[0]*0.75, size[1]*0.75), fill=(255,255,255)); im.save(path)
'''], check=False)

OUT = []
def check(name, cond, extra=''):
    OUT.append((name, cond))
    print(('PASS  ' if cond else 'FAIL  ') + name + (f'  [{extra}]' if extra else ''))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('http://localhost:5173/', wait_until='networkidle')
        await pg.wait_for_timeout(900)

        # ---------------- 1. your story (Home) ----------------
        await pg.locator('.rail .story').first.locator('input[type=file]').set_input_files('/tmp/up-story.png')
        await pg.wait_for_timeout(1200)
        story = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            const s = (raw.stories || []).find(x => x.userId === 'joserizal');
            return s ? { mine: true, isData: s.media.startsWith('data:image/jpeg'), len: s.media.length } : { mine: false };
        }""")
        check('story upload saved as data URL', story.get('mine') and story.get('isData'), story)
        cls = await pg.evaluate("document.querySelector('.rail .story .grad-ring').className")
        check('your story ring is no longer "seen"', 'seen' not in cls, cls)
        await pg.locator('.rail .story').first.click()
        await pg.wait_for_timeout(900)
        check('tapping your story opens the viewer', await pg.locator('.storyview').count() == 1)
        vis = await pg.evaluate("!!document.querySelector('.storyview img.full')")
        check('viewer shows the uploaded photo', vis)
        await pg.locator('.sv-top .cvbtn').click(); await pg.wait_for_timeout(500)

        # ---------------- 2. profile: photo, cover, category ----------------
        await pg.locator('.tabbar .tab').nth(2).click(); await pg.wait_for_timeout(900)
        await pg.locator('.btn.sq').first.click(); await pg.wait_for_timeout(600)
        await pg.locator('.sheet .menurow:has-text("Edit profile")').click(); await pg.wait_for_timeout(700)
        labels = await pg.evaluate("[...document.querySelectorAll('.sheet .editrow .lbl')].map(e => e.innerText.trim())")
        check('sheet has Photo / Cover / Category rows',
              all(k in labels for k in ('Photo', 'Cover', 'Category')), labels)
        await pg.locator('.editrow:has-text("Photo") input[type=file]').set_input_files('/tmp/up-avatar.png')
        await pg.wait_for_timeout(900)
        await pg.locator('.editrow:has-text("Cover") input[type=file]').set_input_files('/tmp/up-cover.png')
        await pg.wait_for_timeout(900)
        await pg.locator('.editrow:has-text("Category") input').fill('Historical research')
        await pg.locator('.editrow:has-text("Name") input').fill('José Rizal')
        await pg.locator('.editrow:has-text("Handle") input').fill('joserizal')
        saved = await pg.evaluate("""() => {
            const b = [...document.querySelectorAll('.sheet-head button')].pop();
            b.click(); return true;
        }""")
        await pg.wait_for_timeout(1000)
        prof = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            const m = raw.users.find(u => u.id === 'joserizal');
            return { avatar: m.avatar.startsWith('data:image/jpeg'), cover: m.cover.startsWith('data:image/jpeg'),
                     name: m.name, handle: m.handle, category: m.category };
        }""")
        check('avatar is the uploaded photo', prof['avatar'], prof)
        check('cover is the uploaded photo', prof['cover'])
        check('name / handle / category are user text', prof['name'] == 'José Rizal' and prof['handle'] == 'joserizal' and prof['category'] == 'Historical research', prof)
        shown = await pg.evaluate("getComputedStyle(document.querySelector('.pfp .in')).backgroundImage.slice(0,30)")
        check('profile renders the uploaded avatar', 'data:image' in shown, shown)
        overlay = await pg.evaluate("getComputedStyle(document.querySelector('.cover img')).objectFit")
        check('cover photo fills the banner', overlay == 'cover')

        # ---------------- 3. highlight from an uploaded photo ----------------
        await pg.locator('.hl-item').first.click(); await pg.wait_for_timeout(700)
        check('highlight sheet has an Upload cell', await pg.locator('.pcell.addcell').count() == 1)
        await pg.locator('.pcell.addcell input[type=file]').set_input_files('/tmp/up-hl.png')
        await pg.wait_for_timeout(1000)
        check('uploaded photo appears selected', await pg.locator('.picker .pcell.on').count() >= 1)
        await pg.locator('.fieldbox input').fill('Uploaded')
        await pg.locator('.sheet-head button').last.click(); await pg.wait_for_timeout(1000)
        hl = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            const h = (raw.highlights['joserizal'] || [])[0];
            return h ? { title: h.title, isData: h.cover.startsWith('data:image/jpeg') } : null;
        }""")
        check('highlight created from the upload', hl and hl['title'] == 'Uploaded' and hl['isData'], hl)

        # ---------------- 4. everything survives a reload ----------------
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(1200)
        after = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            const m = raw.users.find(u => u.id === 'joserizal');
            const st = (raw.stories || []).find(x => x.userId === 'joserizal');
            const h = (raw.highlights['joserizal'] || [])[0];
            return { av: m.avatar.startsWith('data:'), cov: m.cover.startsWith('data:'),
                     name: m.name, story: !!st, hl: h && h.title };
        }""")
        check('photo, cover, story and highlight persist', after['av'] and after['cov'] and after['story'] and after['hl'] == 'Uploaded', after)
        await pg.locator('.tabbar .tab').nth(2).click(); await pg.wait_for_timeout(1000)
        check('profile still shows the user name', (await pg.locator('.prof-name').inner_text()).strip().startswith('José R'))
        await pg.screenshot(path='/tmp/uploads-profile.png')

        # ---------------- 5. reset demo brings the samples back ----------------
        await pg.locator('.btn.sq').first.click(); await pg.wait_for_timeout(600)
        await pg.locator('.sheet .menurow:has-text("Reset demo data")').click(); await pg.wait_for_timeout(1200)
        reset = await pg.evaluate("""() => {
            const raw = JSON.parse(localStorage.getItem('nova.app.v5'));
            const m = raw.users.find(u => u.id === 'joserizal');
            return { av: m.avatar.startsWith('data:'), name: m.name, story: (raw.stories||[]).some(s => s.userId === 'joserizal') };
        }""")
        check('reset restores the sample profile', not reset['av'] and reset['name'].startswith('José Protacio Rizal') and not reset['story'], reset)

        check('no console / page errors', not errs, '; '.join(errs[:3]))
        await b.close()

    bad = [n for n, c in OUT if not c]
    print(f'\n{len(OUT)-len(bad)} passed, {len(bad)} failed')
    for n in bad: print('  FAILED:', n)

asyncio.run(main())
