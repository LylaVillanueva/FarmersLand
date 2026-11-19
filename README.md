# Tunay na Reporma para sa Lupa

A pixel-art advocacy website made by students. It has two pages:

- **`index.html`**: a short intro game. Tatay Ramon walks through the history of
  land reform in the Philippines.
- **`learn.html`**: the "Alamin Pa" advocacy site: the problem, history, demands,
  FAQ, how to help, the organizations to join, resources and dates to remember.

No frameworks and no build step: plain HTML, CSS and JavaScript.

## Running it

```bash
npm start          # http://localhost:3000
npm run dev        # same, and opens your browser
PORT=8080 npm start
```

You can also just open `index.html` in a browser.

**Publishing:** upload the whole folder to any static host (GitHub Pages, Netlify,
Vercel, …). `scripts/` and `package.json` are only for running it locally.

## Folder structure

```
pixelffarmer/
├── index.html                  Intro game page
├── learn.html                  Advocacy site
├── assets/
│   ├── css/
│   │   ├── base.css            Shared: colours, fonts, pixel boxes & buttons
│   │   ├── game.css            Game page only
│   │   └── learn.css           Advocacy site only (numbered contents at the top)
│   └── js/
│       ├── shared/
│       │   └── pixel-engine.js All pixel art: farmer, scenery, carabao, font…
│       ├── game/
│       │   ├── game-data.js    Story, history posts, facts, farmers, layout
│       │   ├── story-scenes.js Pictures shown in the dialog box
│       │   └── game.js         Game logic
│       └── learn/
│           ├── learn-data.js   Icons, finder, calendar dates, letter, share text
│           ├── core.js         Shared helpers (toast, reveal animation)
│           ├── page-art.js     Draws the icons and team avatars
│           ├── hero.js         Animated farm at the top + walker above the footer
│           ├── underground.js  Soil & minerals behind "Kasaysayan"
│           ├── section-decor.js Field (green) and sky (blue) backgrounds
│           ├── nav.js          Menu, dropdowns, progress bar
│           ├── search.js       Site search
│           ├── calendar.js     "Mga Petsang Dapat Tandaan"
│           └── engage.js       Share, organization finder, letter
├── scripts/
│   └── dev-server.js           Local server for `npm start`
├── package.json
├── .editorconfig               Editor formatting rules
└── .gitignore
```

Files marked hold the content you are most likely to edit.

## How do I change…?

| I want to change… | Edit this |
| --- | --- |
| What Tatay Ramon says, the history posts, the "Alam mo ba?" facts | `assets/js/game/game-data.js` |
| Where farmers, carabaos and the scarecrow stand in the game | `assets/js/game/game-data.js` -> `NPCS` |
| A picture shown in a game dialog | `assets/js/game/story-scenes.js` (and the `scenes` list in `game-data.js`) |
| Text on the advocacy site (sections, timeline, FAQ, donate/join links, references) | `learn.html`: each section starts with a `<!-- ===== NAME ===== -->` banner |
| Team names, roles and quotes | `learn.html` -> `ANG TEAM` (`id="team"`), one `<article class="member">` per person |
| Team photos | `assets/team/<name>.jpg`, square 400 x 400 (cropped copies of the originals in `assets/teampic/`). All four members have photos |
| Organization finder suggestions | `assets/js/learn/learn-data.js` -> `ORGS`, `FINDER` |
| Calendar dates | `assets/js/learn/learn-data.js` -> `DATES` |
| The letter to lawmakers | `assets/js/learn/learn-data.js` -> `LETTER` |
| Menu items | `learn.html` -> `<header class="nav">` |
| Colours or fonts for the whole site | `assets/css/base.css` -> section 1, design tokens |
| The farmer's look | `assets/js/shared/pixel-engine.js` -> `FARMER`, `FRONT`, `SIDE_TOP` |
| **Real videos** (Mendiola, Hacienda Luisita, Pax Silica): warnings, credits, source links | `assets/js/shared/real-videos.js` -> `VIDEOS` |

## Conventions

- **File names:** lowercase-with-dashes (`game-data.js`).
- **Indent:** 2 spaces, UTF-8, LF line endings (set in `.editorconfig`).
- **Scripts:** each file is a self-contained `(function () { 'use strict'; … })();`
  block. Files share things through a few globals:
  - `window.PX`: the pixel engine
  - `window.GameData` and `window.LearnData`: editable content
  - `window.Learn`: learn-page helpers
- **Script order:** load order matters. It is listed in a comment above the
  `<script>` tags in each HTML file.
- **Comments:** every file starts with a header saying what it does. The longer
  files list their contents at the top.

## Accessibility and colour rules

- **Contrast:** body text must reach 4.5:1 (WCAG AA). On the green sections use
  dark text; links use `--info` (#2b62a0).
- **Semantic colours** (in `base.css`): `--danger` red = violence, warnings,
  "kulang/huwad"; `--success` green = good outcome, "tunay", next date;
  `--warning` = caution; `--info` blue = links and help. Do not use red for
  ordinary buttons (that is why MAG-DONATE is gold).
- **Motion:** anything that moves for more than 5 seconds must stop when the
  visitor clicks the moving red marquee banner (it is the pause/play control). New animations check
  `Learn.motionPaused()` and listen with `Learn.onMotion()`; `.blink` stops
  after 5 seconds.
- **Loading:** use the `.is-loading` skeleton only where something really
  loads (videos, photos). Do not add fake skeletons to instant content.

## Deploying

1. `npm run build` (runs `npm run check` first and stops on any problem).
2. Upload the `dist/` folder, **not** the project folder. The project folder is
   about 1.1 GB because of the original recordings in `assets/RealVideos/`;
   `dist/` is about 73 MB.
   - Netlify: drag `dist/` onto app.netlify.com/drop.
   - Netlify or Vercel from GitHub: build command `npm run build`,
     publish/output directory `dist`.

## Privacy

The site collects nothing: no cookies, no analytics, no forms, and no
requests to other servers (fonts are hosted in `assets/fonts/`). One
on-device setting uses local storage: `trpl-muted` (game sound).
The privacy pop-up (`assets/js/shared/privacy.js`, opened by any
`data-privacy` link) describes exactly this. If you ever add analytics, embeds,
a form or cookies, update that file first and add a consent prompt for
anything that tracks visitors.

Before deploying, run `npm run check`. It fails on em dashes, emoji, and
unfilled placeholders such as `[ilagay ang email ng team]`.

## Real videos

Real footage always opens behind a full-screen warning (`real-videos.js`).
Nothing downloads until the viewer presses PANOORIN, and HUWAG MUNA is the
default focus. The clips in `assets/video/` were trimmed and compressed from
the screen recordings in `assets/RealVideos/` with macOS's built-in tool:

    avconvert -s assets/RealVideos/mediola.mov -p Preset640x480 -o assets/video/mendiola-1987.mp4 --start 63.8 --duration 61

The original recordings are about 1.3 GB and have no sound. They are in
`.gitignore`; leave the `assets/RealVideos` folder out when you upload the site.

## Sources

The references used for the content are linked in the footer of `learn.html`
under **Mga Sanggunian**.
# FarmersLand
