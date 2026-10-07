# Nova — a working iOS social app

Not a mockup. This is a **functional app**: real state, real navigation, real interactions,
persisted between visits. Same design system as the concept board, now running.

---

## Run it

```bash
cd app
npm install
npm run dev          # → http://localhost:5173
```

Production build:

```bash
npm run build        # → app/dist          (deploy to any static host)
python3 standalone.py # → app/standalone/index.html  (one file, works from file://)
```

**On iPhone:** open the site in Safari → Share → **Add to Home Screen**. It launches
full-screen with no browser chrome, respects the notch/home-indicator insets, and behaves
like a native app. On a phone it drops the desktop device frame and runs edge to edge.

---

## What actually works

| Interaction | Behaviour |
|---|---|
| **Tab bar** | Five destinations: Home, Discover, Create, Activity, Profile |
| **Like** | Tap the heart, or double-tap the photo. Counts update live; the Dynamic Island flashes a "Liked" pill; haptics on supported devices |
| **Save** | Bookmark fills and the post lands in **Profile → Saved** |
| **Comments** | Open the post sheet, type, send. The comment is appended and counted everywhere |
| **Follow / Unfollow** | On cards, creator profiles and Discover. Counts adjust and the **Following** feed rebuilds instantly |
| **Follow creators** | A dismissible **Follow** button in the feed header plus a creator row in search |
| **For You / Following** | Real filters over the same data set |
| **Moments rail** | Tap a story → full-screen viewer, animated progress bars, tap left/right to move, live-activity pill in the Dynamic Island, marks seen |
| **Compose** | Pick from the library or upload from your phone (downscaled), choose Post or Reel, caption, tags, location → publishes to the feed *and* your profile. Reels land in the Reels tab |
| **Search** | Live search across creators, captions, tags and locations |
| **Activity** | Likes, comments, follows and mentions; unread badge clears when you visit |
| **Edit profile** | Change name, handle, bio and link — updates everywhere, including your own posts |
| **Delete** | Open your own post → the follow button becomes delete |
| **Share** | Uses the native share sheet on iOS; falls back to copying the link |
| **Pull to refresh** | Drag down from the top of the feed for a skeleton reload |
| **Persistence** | Everything is kept in `localStorage` — likes, comments, follows, new posts, edited profile survive a reload |
| **Reset demo** | Profile → ••• → *Reset demo data* restores the original state in place |
| **Light / dark mode** | One tap on the header switch. Animates the whole app *and* the desktop stage behind the phone; the choice is remembered. Also available on every profile's top bar and in the ••• menu |
| **Profile sub-sections** | An **About** card breaks the profile into labelled parts — **Family**, **Siblings**, Work, Education, Lives in, Interests. Shows three, then *Show N more*. Editable from Edit profile |
| **Highlights** | A row of circular highlights on every profile. Tap one for the full-screen viewer with progress bars. On your own profile, **New** opens a picker to build a highlight from the library — long-press-free, just tap photos and name it |
| **Stories play continuously** | Finishing one creator's story rolls into the next in the rail; each is marked seen as it plays |

---

## Appearance

- **Toggle** — the header switch replaced the notifications bell (the Activity tab still
  carries the unread badge). Sun ⇄ moon crossfades on a spring.
- **Lighter blue** — the accent moved from `#3d86ff` to `#5b9bff`, with `#8ab7ff` for
  gradients and `#93bcff` for accent text, all tuned per theme.
- **Glassmorphism** — both the header and the nav bar are true translucent glass:
  `backdrop-filter: blur(30–34px) saturate(190%)`, a 1px glass border, an inner top
  highlight and a soft drop shadow, over a `--glass-chrome` tint that stays legible in
  both themes. Content visibly scrolls *underneath* them.
- **Scroll-aware header** — on a profile the floating cover buttons fade out as the cover
  leaves, and a glass name bar slides down in their place.

## Screens

- **Home** — greeting header, badged notifications, search, filter, Moments rail, To-You /
  Following tabs, feed with multi-image carousels, double-tap-to-like, follow buttons, sticky header.
- **Discover** — trending tags, filter toggle, search results split into creators and posts,
  dense explore grid with reels and wide tiles.
- **Create** — drop zone, device upload, photo library, Post/Reel switch, caption, tags, location, publish.
- **Activity** — typed notification rows with avatar badges and post thumbnails.
- **Profile** — cover, ring-clipped avatar (never cut off), verified + Pro chips, bio with link,
  live stats, Follow/Message/DM, **Highlights rail**, **About sub-sections**, four tabs
  (Posts / Reels / Tagged / Saved), asymmetric photo grid, floating cover controls.
- **Overlays** — post sheet with media, actions, comments and composer; story viewer;
  profile menu; edit-profile sheet; toasts.

## Design system

```
Theme    dark + light, driven by :root[data-theme] custom properties
Colour   dark  bg #000 · surface #121319 / #1a1c24 / #22252f · text #fff / #9ba2b2 / #6b7284
         light bg #fff · surface #f3f6fc / #eef2fa / #e2e9f6 · text #0b0d12 / #5c6675 / #8a93a3
         accent #5b9bff (light #4d90ff) · like #ff5c7a · ok #2fd07a
Glass    --glass-chrome blur(30-34px) saturate(190%) + 1px border + inner highlight
Type     Inter variable, 100–900 (SF Pro substitute)
Shape    12–15 pt controls · 22 pt media · 43 pt glass · 62 pt body
Chrome   status bar 53 pt · app bar 54 pt · tab bar 92 pt + safe-area
Icons    one 24 pt stroked set (~30 glyphs), round caps
Motion   spring easing on sheets, island, pills, like pop, story progress
```

On desktop the app sits inside the same iPhone hardware frame and blue editorial stage as
the concept board — so the static presentation and the live product match exactly.

## Architecture

```
app/
  index.html                 PWA shell: manifest, apple meta, icons
  public/manifest.webmanifest + icon-180/192/512.png
  vite.config.js             assets inlined → single-file builds
  standalone.py              dist → one portable index.html
  src/
    main.jsx  App.jsx        root, device frame, mobile detection
    store.jsx                all state: posts, users, follows, notifications, stories,
                             ui flags, toasts, island, persistence, every action
    data.js                  seed content (users, posts, comments, stories, notifications)
    Icons.jsx                the icon set
    media.js + media/*.jpg   photography and avatars
    styles.css               full design system
    components/  Post.jsx  Chrome.jsx  PostSheet.jsx  StoryViewer.jsx (stories + highlights)
    screens/     Home.jsx  Discover.jsx  Create.jsx  Activity.jsx  Profile.jsx
```

State lives in one context provider (`store.jsx`) — swapping the seed data in `data.js`
for an API layer is the only change needed to make it real.

## Tests

```bash
python3 test_app.py    # desktop: like, comment, story, search, activity, compose, follow, persistence
python3 test_app2.py   # second pass: feed follow, sheet, profile tabs, edit, reset
```

Both drive the real UI in Chromium at desktop and iPhone viewports and report console
errors — currently **zero**.

## Round-6 additions

- `src/useDragScroll.js` — pointer-drag scrolling for the horizontal rails (`.rail` on
  Home, `.hlights` on Profile). Mouse/trackpad only: `pointerType === 'touch'` bows out
  so touch keeps the native swipe. Momentum on release, and a drag swallows the click
  that follows it so dragging never opens a story/highlight. It deliberately does **not**
  use `setPointerCapture` — capturing on pointerdown re-targets the following `click`
  to the scroller, which silently breaks every tap inside the rail.
- Times / Highlights section headers are label-only; the rails are the affordance.
- `src_backup/sync.py` — this workspace periodically rolls back `screens/Home.jsx`,
  `screens/Profile.jsx`, `components/Chrome.jsx` and `styles.css` to older copies.
  Run `python3 ../src_backup/sync.py save` after editing them, and
  `python3 ../src_backup/sync.py restore` to put the good copies back.

