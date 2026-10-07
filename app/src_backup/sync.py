#!/usr/bin/env python3
"""Keep a pristine copy of the three files whose edits keep getting rolled back
by the workspace snapshot, and restore them on demand.

  python3 app/src_backup/sync.py save     # current src -> backup
  python3 app/src_backup/sync.py restore  # backup -> src
"""
import filecmp
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), 'src')
FILES = ['App.jsx', 'data.js', 'media.js', 'store.jsx', 'screens/Home.jsx', 'screens/Profile.jsx',
         'screens/Create.jsx', 'components/Chrome.jsx', 'styles.css', 'useDragScroll.js', 'files.js']


def flat(rel):
    """second copy under a different name — the nested one has been wiped before"""
    return os.path.join(HERE, 'flat_' + rel.replace('/', '_') + '.txt')


def sync(direction):
    for rel in FILES:
        a, b, f = os.path.join(SRC, rel), os.path.join(HERE, rel), flat(rel)
        os.makedirs(os.path.dirname(b), exist_ok=True)
        if direction == 'save':
            shutil.copy2(a, b)
            shutil.copy2(a, f)
            print('saved   ', rel)
        else:
            src = b if os.path.exists(b) else (f if os.path.exists(f) else None)
            if not src:
                print('missing ', rel); continue
            same = os.path.exists(a) and filecmp.cmp(a, src, shallow=False)
            shutil.copy2(src, a)
            if os.path.abspath(src) != os.path.abspath(f):
                shutil.copy2(src, f)
            if os.path.abspath(b) != os.path.abspath(src):
                os.makedirs(os.path.dirname(b), exist_ok=True)
                shutil.copy2(src, b)
            print(('same    ' if same else 'restored'), rel, '' if src == b else '(from flat copy)')


if __name__ == '__main__':
    sync(sys.argv[1] if len(sys.argv) > 1 else 'restore')
