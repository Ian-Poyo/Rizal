# Nova — iPhone social app

A working React app that looks and behaves like a native iOS social app.
Run it, build it, ship it as one file.

## Run

```bash
cd app
npm install          # node_modules is never kept in the workspace
npx vite --host 0.0.0.0 --port 5173 --strictPort
```

Open the printed URL (or the live preview if you are in the workspace viewer).

## Build

```bash
cd app
npx vite build              # -> app/dist/
python3 standalone.py       # -> app/standalone/index.html  (one portable file)
```

`/home/user/nova-app.html` is that single-file build — double-click it, no server needed,
all CSS/JS/images/fonts inlined.

## What's here

| Path | What it is |
| --- | --- |
| `app/src/` | the app: screens, components, store, icons, styles |
| `app/public/` | app icons + web manifest |
| `app/tests/` | optional Playwright checks (screenshots go to `/tmp`, never the workspace) |
| `app/src_backup/` | known-good copies of the files this workspace keeps rolling back + `sync.py` |
| `nova-app.html` | the whole app in one file |

## The app

Three tabs — **Home** (Moments rail, For You / Following feed), **Create** (pick photos,
write a caption, share), **Profile** (highlights, single About description, posts / reels /
tagged / saved). Search and Activity open as overlays. Dark and light themes; the theme
toggle sits on the profile cover bar. Posts, likes, comments, follows, stories, highlights
and profile edits all persist to `localStorage`.

## The content

The app ships with a **Rizal-era cast**: the signed-in account is José Rizal, and the
people he follows are the reform movement and the revolution — Marcelo H. del Pilar,
Graciano López Jaena, Juan Luna, Félix Resurrección Hidalgo, Andrés Bonifacio,
Apolinario Mabini, Emilio Aguinaldo, Melchora Aquino (Tandang Sora), Gregoria de Jesús,
Teodora Alonso, Pio Valenzuela and Mariano Ponce.

- **Moments rail** — a story ring per figure, each opening their own portrait or a
  document from the period.
- **Feed** — Spoliarium, La Solidaridad, the Kartilya, the 1887 Noli, *Mi último adiós*,
  *La barca de Aqueronte*, with captions and comments written around what each person
  actually did.
- **Profiles** — bio, dates, description and highlights per figure.
- **Highlights / composer library** — the era's canvases, printed documents, the two
  childhood markers, the family, and the Madrid years. Highlight photos may carry a
  caption: `items` holds either an image or `{ media, caption }`, and the viewer shows
  the caption on the slide.

Every image is public domain from Wikimedia Commons / Wikipedia (portraits and the
canvases themselves); they are downscaled copies in `app/src/media/`. Swap one by
dropping a file at the same path, or change the words in `app/src/data.js` — nothing
else refers to them by name.

The Moments and Highlights rails drag side to side with a mouse and swipe natively on
touch — see `app/src/useDragScroll.js`.

Content is placeholder and swappable: every name, caption and image lives in
`app/src/data.js` plus `app/src/media/`.

**Everything visual is user input.** Upload from the device and it persists in
`localStorage` (downscaled via `app/src/files.js`):

| What | Where |
| --- | --- |
| Profile photo (centre-cropped square), cover photo, category | Profile → ⋯ menu → Edit profile |
| Name, handle, bio, link, description | same sheet |
| Your story | Home → the `+` badge on the "Your story" tile (tap the tile to watch it) |
| Highlight photos | Profile → New highlight → the dashed **Upload** cell |
| Feed posts | Create tab → pick from your device |

"Reset demo data" (profile ⋯ menu) restores all the sample content.

The shipped profile picture (`app/src/media/av-rizal.jpg`) is the public-domain circa-1890s
photograph of José Rizal (Wikimedia Commons, "Jose Rizal full.jpg"), cropped square to
400x400. To swap any image, drop a replacement at the same path — `media.js` imports
them all, so the filename is the only thing that matters.

## The young Rizal (the signed-in profile)

`@joserizal` is written up as the **young** Rizal, filed under the full legal name —
**José Protacio Rizal Mercado y Alonso Realonda** — and the profile carries the whole
record (all of it in `app/src/data.js`, on the `joserizal` user):

| Field | Where it shows | Content |
| --- | --- | --- |
| Profile photo | avatar | the c.1890s photograph (round 13, historical image) |
| Bio | first paragraph of the description | 2–3 sentences on his childhood in Calamba |
| About | second paragraph of the description | the adult record: studies, the two novels, Dapitan, 1896 |
| Family | `FAMILY` label | Francisco Mercado Rizal & Teodora Alonso Realonda; the ten siblings |
| Childhood interests | `CHILDHOOD INTERESTS` label | reading, drawing, writing, painting, clay modelling, arnis, riding, languages |
| Childhood events | the **Childhood** highlight | five dated events, ~1864 to 1877 — one picture per event, the event text as the slide caption |

Three fictional posts sit on top of the feed, each pinned to a documented event:

| Post | Event | Image |
| --- | --- | --- |
| `p11` | the first poem, *Sa Aking Mga Kabata* | the 1906 printed text of the poem (`young-kabata.jpg`) |
| `p12` | school days in Biñan under Maestro Justiniano Cruz, 1871 | the Biñan historical marker (`young-binan.jpg`) |
| `p13` | the Gomburza execution and his mother's arrest, 1872 | the NHCP marker at Luneta (`young-gomburza.jpg`) |

Rizal's own highlights are curated, not generic: **Noli**, **Madrid** (the Universidad
Central on Calle San Bernardo — licentiate in medicine 21 June 1884, licentiate in
philosophy and letters 1885; and the painting and sculpture lessons at the Real Academia
de Bellas Artes de San Fernando), **1896**, **Family** and **Young Rizal**. **Childhood** carries the five childhood events — Calamba ~1864,
Antipolo 1869, Biñan 1871, the Gomburza execution 1872 and Ateneo Municipal 1872–77 — one
photograph per event, with the event itself as the caption. **Family** steps through the
Calamba house, Teodora Alonso's house in San Nicolas, Paciano's shrine
in Los Baños, Trinidad's marker (Katipunan, relief work, founder of the Asociación
Feminista Filipina 1905) and the family's last farewell at Fort Santiago — where the
alcohol stove was handed over, and which one of the sisters then went looking for the
grave at Paco (Narcisa, not Trinidad: the captions keep that straight).

The caption of `p11` carries the line **"If Young Rizal Had Social Media…"** and the one
hashtag **`#YoungRizal`**; it is typed into the caption (so it highlights in the feed) and
also sits in `post.tags` (so the post sheet shows it as a chip). A fifth highlight,
**Young Rizal**, collects the three childhood images, and `youngrizal` leads the trending
list in Search.


### Test suites

`python3 app/tests/<name>.py` with the dev server up:

`verify_drag.py` · `test_app.py` · `test_app2.py` · `test_theme.py` · `test_changes.py` ·
`test_uploads.py` · `test_young.py` (the young-Rizal profile + the *Mi último adiós* picture).

`python3 app/tests/media_audit.py` needs no server: it checks every image decodes and is
big enough, that every `RATIO` in `media.js` matches the file on disk (nothing gets
cropped), that no imported image is dead, and that nothing resembles the stray photo that
once sat in `work-ultimo.jpg` (`tests/stray-reference.jpg`).

### Counts

The Posts figure on a profile is the number of posts that account actually holds — it is
counted from `data.posts`, never padded. Followers and following are sample numbers, since
there is no server behind the app.

### Image credits

The portraits, canvases and documents are public domain (Wikimedia Commons / Wikipedia).
The modern photographs added for the family and Madrid highlights are CC BY-SA and are
credited in the header of `app/src/media.js` — Tsambaproductions (Calamba shrine,
CC BY-SA 3.0), Zarate123 (Teodora house, CC BY-SA 4.0), Ryomaandres (Paciano shrine,
CC BY-SA 4.0), Kej Andrés (Trinidad marker, CC BY-SA 4.0), Alloizajean (Rizal Park
martyrdom tableau, CC BY-SA 4.0), Luis García / Zaqarbal (Universidad Central,
CC BY-SA 3.0), Carlos Delgado (Academia de San Fernando, CC BY-SA 3.0 es),
Tsambaproductions again (Calamba house interior, CC BY-SA 3.0), Jeff Basina (Antipolo
Cathedral, CC BY-SA 4.0) and Ryomaandres again (the old Ateneo Municipal site marker,
CC BY-SA 3.0).

### Setup notes

- `node_modules`, installed browsers and pip packages are **never** preserved — reinstall first.
- If `app/src/screens/*.jsx`, `app/src/components/Chrome.jsx` or `app/src/styles.css` look
  like older versions, run `python3 app/src_backup/sync.py restore`. After editing those
  files, run `python3 app/src_backup/sync.py save` to refresh the backups.
