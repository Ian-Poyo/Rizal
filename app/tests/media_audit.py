#!/usr/bin/env python3
"""Media audit — no offline/standalone run needed.

1. Every image the app imports exists, decodes, and is big enough to show.
2. Every `ratio:` in data.js matches the file on disk (so nothing is cropped).
3. Every media import in media.js is actually used somewhere (no dead files).
4. No image resembles the known stray selfie that once poisoned work-ultimo.jpg.

Run:  python3 app/tests/media_audit.py
"""
import glob, os, re, sys
from PIL import Image

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(APP, 'src')
MEDIA = os.path.join(SRC, 'media')
STRAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stray-reference.jpg')

ok, bad = [], []


def check(label, cond, extra=None):
    (ok if cond else bad).append(label)
    print(f'{"OK  " if cond else "FAIL"} {label}' + ('' if extra is None else f'  -> {extra}'))


def ahash(p, s=16):
    im = Image.open(p).convert('L').resize((s, s), Image.LANCZOS)
    px = list(im.getdata())
    avg = sum(px) / len(px)
    return sum(1 << i for i, v in enumerate(px) if v > avg)


# ---------- 1. files exist, decode, and are usable ----------
files = sorted(glob.glob(os.path.join(MEDIA, '*.jpg')))
sizes = {}
for f in files:
    try:
        im = Image.open(f)
        im.load()
        sizes[os.path.basename(f)] = im.size
    except Exception as e:
        check(f'{os.path.basename(f)} decodes', False, e)
tiny = {k: v for k, v in sizes.items() if min(v) < 300}
check('every image decodes', len(sizes) == len(files), f'{len(sizes)}/{len(files)}')
check('no unusably small images', not tiny, tiny)

# ---------- 2. data.js ratios match disk ----------
media_js = open(os.path.join(SRC, 'media.js')).read()
imports = dict(re.findall(r"import (\w+) from '\./media/([\w.-]+)';", media_js))
ratio_block = re.search(r'export const RATIO = \{(.*?)\};', media_js, re.S).group(1)
ratios = {m[0]: (m[1], m[2]) for m in re.findall(r'(\w+):\s*([\d.]+)\s*/\s*([\d.]+)', ratio_block)}
bad_ratio = []
for name, (w, h) in ratios.items():
    f = imports.get(name)
    if not f or f not in sizes:
        bad_ratio.append((name, 'missing file'))
        continue
    dw, dh = sizes[f]
    if abs(dw / dh - float(w) / float(h)) > 0.01:
        bad_ratio.append((name, f'declared {w}/{h} vs disk {dw}x{dh}'))
check('declared ratios match the files on disk', not bad_ratio, bad_ratio)

data_js = open(os.path.join(SRC, 'data.js')).read()
missing = [r for r in re.findall(r'RATIO\.(\w+)', data_js) if r not in ratios]
check('every ratio used in data.js is defined', not missing, missing)

# ---------- 3. no dead media ----------
referenced = set(re.findall(r'M\.(\w+)', data_js)) | set(re.findall(r'\[M\]|M\.(\w+)', data_js))
dead = [n for n in imports if n not in referenced]
check('every imported image is referenced', not dead, dead)

# ---------- 4. the stray selfie stays out ----------
if os.path.exists(STRAY):
    ref = ahash(STRAY)
    hits = [(os.path.basename(f), bin(ahash(f) ^ ref).count('1')) for f in files]
    hits = [h for h in hits if h[1] <= 12]
    check('no image resembles the stray reference', not hits, hits)
else:
    print('note: no stray-reference.jpg kept — hash sweep skipped')

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:
    print('failed:', bad)
sys.exit(1 if bad else 0)
