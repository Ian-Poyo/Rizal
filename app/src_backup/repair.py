#!/usr/bin/env python3
"""Re-apply About-as-description + drag rails (idempotent)."""
SRC = '/home/user/app/src'


def patch(path, pairs, label, optional=False):
    full = f'{SRC}/{path}'
    s = open(full, encoding='utf-8').read()
    done = 0
    for a, b in pairs:
        if a in s:
            s = s.replace(a, b)
            done += 1
        elif b not in s:
            if optional:
                continue
            raise AssertionError(f'{label} NOT FOUND: ' + a[:100])
    open(full, 'w', encoding='utf-8').write(s)
    print(f'ok   {label}  ({done} applied)')


# ---------------------------------------------------------------- Profile
patch('screens/Profile.jsx', [
    ("import { PHOTO_POOL, ABOUT_LABELS } from '../data';",
     "import { PHOTO_POOL } from '../data';\nimport useDragScroll from '../useDragScroll';"),
    ("  const [aboutOpen, setAboutOpen] = useState(false);\n", ""),
    ("    setTab('posts'); setMsg(''); setAboutOpen(false);", "    setTab('posts'); setMsg('');"),
    ("""  const about = user.about || {};
  const aboutRows = ABOUT_LABELS.filter(([k]) => about[k]);
  const shownRows = aboutOpen ? aboutRows : aboutRows.slice(0, 3);""",
     """  const about = typeof user.about === 'string' ? user.about : '';"""),
    ("""  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef(null);""",
     """  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef(null);
  const hlRef = useDragScroll();"""),
    ('        <div className="hlights">', '        <div className="hlights" ref={hlRef}>'),
], 'Profile — description + draggable highlights')

# the about block itself (after the state edits above)
full = f'{SRC}/screens/Profile.jsx'
s = open(full, encoding='utf-8').read()
if 'aboutRows.length ?' in s:
    a = """          {/* ---------------- about / profile sub-sections ---------------- */}
          {aboutRows.length ? (
            <div className="about">
              <div className="about-head">
                <span className="t">About</span>
                {isMe ? <button className="edit" onClick={() => uiSet({ editOpen: true })}>Edit</button> : null}
              </div>

              {shownRows.map(([key, label]) => (
                <div className="about-row" key={key}>
                  <span className="albl">{label}</span>
                  <span className="aval">{about[key]}</span>
                </div>
              ))}

              {aboutRows.length > 3 ? (
                <button className="morebtn" onClick={() => setAboutOpen((o) => !o)}>
                  {aboutOpen ? 'Show less' : `Show ${aboutRows.length - 3} more`}
                </button>
              ) : null}
            </div>
          ) : null}"""
    b = """          {/* ---------------- about — a single description ---------------- */}
          {about ? (
            <div className="about">
              <div className="about-head">
                <span className="t">About</span>
                {isMe ? <button className="edit" onClick={() => uiSet({ editOpen: true })}>Edit</button> : null}
              </div>
              <p className="about-desc">{about}</p>
            </div>
          ) : null}"""
    assert a in s, 'about block not found'
    s = s.replace(a, b)
    open(full, 'w', encoding='utf-8').write(s)
    print('ok   Profile — about block replaced')

# ---------------------------------------------------------------- Chrome
patch('components/Chrome.jsx', [
    ("import { ABOUT_LABELS } from '../data';\n", ""),
    ("""  const blank = {
    name: me.name, handle: me.handle, bio: me.bio, link: me.link || '',
    ...Object.fromEntries(ABOUT_LABELS.map(([k]) => [k, (me.about && me.about[k]) || ''])),
  };""",
     """  const blank = {
    name: me.name, handle: me.handle, bio: me.bio, link: me.link || '',
    about: typeof me.about === 'string' ? me.about : '',
  };"""),
    ("""        const { name, handle, bio, link, ...about } = f;
        updateProfile({ name, handle, bio, link, about });""",
     """        updateProfile(f);"""),
    ("""      <div className="sec-label">About — profile sections</div>
      {ABOUT_LABELS.map(([key, label]) => (
        <div className="editrow" key={key}>
          <span className="lbl">{label}</span>
          <span className="box">
            <input
              value={f[key]}
              placeholder={key === 'family' ? 'Married · two kids' : key === 'siblings' ? 'One brother, one sister' : ''}
              onChange={(e) => setF({ ...f, [key]: e.target.value })}
            />
          </span>
        </div>
      ))}
      <div style={{ height: 26 }} />""",
     """      <div className="sec-label">About — description</div>
      <div className="editrow" style={{ alignItems: 'flex-start' }}>
        <span className="lbl" style={{ paddingTop: 12 }}>Description</span>
        <span className="box" style={{ height: 'auto' }}>
          <textarea
            value={f.about}
            placeholder="Tell people about yourself — family, work, where you live…"
            onChange={(e) => setF({ ...f, about: e.target.value })}
          />
        </span>
      </div>
      <div style={{ height: 26 }} />"""),
], 'Chrome — description field', optional=True)

# ---------------------------------------------------------------- styles
patch('styles.css', [
    (""".rail{display:flex;gap:14px;padding:2px 16px 6px;overflow-x:auto;scrollbar-width:none}
.rail::-webkit-scrollbar{display:none}""",
     """.rail{display:flex;gap:14px;padding:2px 16px 6px;overflow-x:auto;scrollbar-width:none;
  cursor:grab;touch-action:pan-x;user-select:none;-webkit-user-select:none}
.rail::-webkit-scrollbar{display:none}
.rail.dragging{cursor:grabbing;scroll-behavior:auto}
.rail.dragging *{pointer-events:none}"""),
    (""".hlights{display:flex;gap:14px;padding:4px 18px 2px;overflow-x:auto;scrollbar-width:none}
.hlights::-webkit-scrollbar{display:none}""",
     """.hlights{display:flex;gap:14px;padding:4px 18px 2px;overflow-x:auto;scrollbar-width:none;
  cursor:grab;touch-action:pan-x;user-select:none;-webkit-user-select:none}
.hlights::-webkit-scrollbar{display:none}
.hlights.dragging{cursor:grabbing;scroll-behavior:auto}
.hlights.dragging *{pointer-events:none}"""),
    ("""/* home header — just the app logo, centred */
.appbar.logobar{justify-content:center;padding:0 14px}
.logo{display:flex;align-items:center;gap:7px;color:var(--txt);animation:fadeIn .45s ease}
.logo .mark{color:var(--accent-text)}
.logo .wordmark{font-size:18px;font-weight:740;letter-spacing:-.6px;line-height:1}""",
     """/* Home has no app bar — the feed starts at the top of the safe area.
   On a real device keep clear of the notch / Dynamic Island. */
body.is-mobile .scroller.full{padding-top:env(safe-area-inset-top, 0px)}"""),
], 'styles — drag states + safe area', optional=True)

print('\nall set')
