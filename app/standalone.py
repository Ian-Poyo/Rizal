#!/usr/bin/env python3
"""Bundle the built app into ONE self-contained index.html that runs from file://
(for GitHub Pages, a USB stick, or the Arena file preview)."""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(ROOT, 'standalone', 'index.html')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

html = open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()


def read(p):
    return open(p, encoding='utf-8').read()


def b64(p, mime):
    with open(p, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


# 1. inline the stylesheet
m = re.search(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', html)
if m:
    css = read(os.path.join(DIST, m.group(1).lstrip('./')))
    html = html.replace(m.group(0), '<style>\n%s\n</style>' % css)

# 2. inline the module
m = re.search(r'<script type="module"[^>]*src="([^"]+)"[^>]*></script>', html)
if not m:
    m = re.search(r'<script type="module" crossorigin src="([^"]+)"></script>', html)
if not m:
    print('could not find the module script in dist/index.html'); sys.exit(1)
js = read(os.path.join(DIST, m.group(1).lstrip('./'))).replace('</script>', '<\\/script>')
html = html.replace(m.group(0), '<script type="module">\n%s\n</script>' % js)

# 3. inline the manifest + icons
manifest = read(os.path.join(ROOT, 'public', 'manifest.webmanifest'))
html = re.sub(r'<link rel="manifest"[^>]*>',
              '<link rel="manifest" href="%s">' % b64(os.path.join(ROOT, 'public', 'manifest.webmanifest'),
                                                      'application/manifest+json'),
              html)
for name, size in (('apple-touch-icon', 'icon-180.png'), ('icon', 'icon-192.png')):
    html = re.sub(r'<link rel="%s"[^>]*>' % name,
                  '<link rel="%s" href="%s">' % (name, b64(os.path.join(ROOT, 'public', size), 'image/png')),
                  html)

# 4. the manifest's own icon paths must point at data URIs as well (already relative -> fine on http,
#    and harmless on file:// since install is unavailable there)
open(OUT, 'w', encoding='utf-8').write(html)

leftover = re.findall(r'(?:src|href)="\.?/?(?:assets|icon)[^"]*"', html)
print('standalone: %s  (%.0f KB)' % (OUT, os.path.getsize(OUT) / 1024))
print('unresolved asset refs:', leftover if leftover else 'none')
print('import.meta refs:', len(re.findall(r'import\.meta', js)))
