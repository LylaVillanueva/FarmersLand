# Tunay na Reporma para sa Lupa

Hangga't may magsasakang walang lupa, hindi pa tapos ang laban sa tunay na reporma.

This is our advocacy website for genuine land reform in the Philippines. We are
students from the Technological University of the Philippines. We believe that
knowing the farmers' story is how we start to understand why the country stays
poor, and we wanted a way to tell it that people would actually finish.
(Repository name: FarmersLand.)

The site has two parts:

- **The game (`index.html`).** You play as Tatay Ramon, a farmer who walks
  across his farm and tells the history of land reform, from the encomienda to
  Pax Silica.
- **Alamin Pa (`learn.html`).** The full story: the problem, the timeline, what
  "genuine" reform means, the farmers' demands, a FAQ, how to help, the
  organizations you can join or donate to, and the dates farmers remember.

Everything is plain HTML, CSS and JavaScript. All the pixel art is drawn with
code, so there are no image files for the scenery or the characters.

## The team

| Name | What they did |
| --- | --- |
| Lyla Jane L. Villanueva | Leader, game and UX |
| Paul Nathan R. Valeña | Design and UI |
| Anne Janelle P. Fronda | Research and writing |
| Krishna Coleen P. Vengua | Research and writing |

Questions or corrections: resqrsaves@gmail.com

## Running it on your computer

You need Node.js 16 or newer. Nothing else gets installed.

```bash
npm start          # http://localhost:3000
npm run dev        # same, and opens your browser
PORT=8080 npm start
npm run check      # looks for em dashes, emoji and unfilled placeholders
npm run build      # makes the dist/ folder for deploying
```

## Deploying

1. Run `npm run build`. It runs `npm run check` first and stops if anything
   is wrong, so a broken page never goes live.
2. Upload the **`dist/` folder**, not the whole project. The project folder is
   over 1 GB because of our original screen recordings. `dist/` is only the 41
   files the site needs (about 75 MB).
   - Netlify: drag `dist/` onto app.netlify.com/drop.
   - Netlify or Vercel from GitHub: build command `npm run build`, publish
     directory `dist`.

Run `npm run build` again every time you change something.

## Where things are

```
pixelffarmer/
├── index.html                   The game
├── learn.html                   Alamin Pa
├── favicon.ico, site.webmanifest
├── assets/
│   ├── css/
│   │   ├── base.css             Shared colours, fonts, pixel boxes, buttons, icons
│   │   ├── game.css             Game only
│   │   └── learn.css            Alamin Pa only
│   ├── js/
│   │   ├── shared/
│   │   │   ├── pixel-engine.js  All the pixel art, the sky, sun and mountains
│   │   │   ├── real-videos.js   The video player and its warnings
│   │   │   └── privacy.js       The privacy pop-up
│   │   ├── game/
│   │   │   ├── game-data.js     Tatay Ramon's lines, history posts, facts
│   │   │   ├── story-scenes.js  Pictures inside the dialog box
│   │   │   └── game.js          How the game runs
│   │   └── learn/
│   │       ├── learn-data.js    Organizations, calendar dates, letter
│   │       ├── core.js          Small helpers and the pause-motion switch
│   │       ├── page-art.js      Icons and team photos
│   │       ├── hero.js          The farm at the top of Alamin Pa
│   │       ├── underground.js   Soil and minerals behind the timeline
│   │       ├── section-decor.js Field and sky backgrounds
│   │       ├── nav.js           Menu and progress bar
│   │       ├── search.js        HANAP
│   │       ├── calendar.js      Mga Petsang Dapat Tandaan
│   │       └── engage.js        Share buttons, organization finder, letter
│   ├── fonts/                   Press Start 2P and VT323 (open licence included)
│   ├── icons/                   Favicon and phone home-screen icons
│   ├── team/                    Our photos, cropped for the site
│   ├── teampic/                 Original photos (not uploaded)
│   ├── video/                   The three video clips the site plays
│   └── RealVideos/              Original recordings (not uploaded)
└── scripts/
    ├── dev-server.js            The local server for npm start
    ├── check-text.js            npm run check
    └── build.js                 npm run build
```

## Changing things

Most text lives in two data files, so you rarely need to touch the code.

| To change... | Open |
| --- | --- |
| What Tatay Ramon says, the history posts, the "Alam mo ba?" facts | `assets/js/game/game-data.js` |
| The "?" explanations of hard words in the game | `game-data.js` -> `GLOSSARY` |
| Where farmers and carabaos stand in the game | `game-data.js` -> `NPCS` |
| A picture in the game's dialog box | `assets/js/game/story-scenes.js` |
| Any text on Alamin Pa | `learn.html` (each section starts with a big comment) |
| Organizations, calendar dates, the letter to lawmakers | `assets/js/learn/learn-data.js` |
| Team names, roles and quotes | `learn.html`, section `ANG TEAM` |
| Team photos | `assets/team/` (square, 400 x 400) |
| Video warnings, credits and source links | `assets/js/shared/real-videos.js` |
| The privacy text or contact email | `assets/js/shared/privacy.js` |
| Colours and fonts for the whole site | `assets/css/base.css`, section 1 |

After any change, refresh the browser and run `npm run check`.

## Rules we follow

- **Facts need a source.** Every number and date on the site comes from a law,
  a report or a news article listed under Mga Sanggunian in the footer. If we
  can't find a source, we don't write it.
- **Readable for everyone.** Body text is dark enough to read (at least 4.5:1
  contrast). Everything works with a keyboard. Anything that moves can be
  stopped by clicking the red moving banner under the top scene, and it starts
  stopped for people who turned on "reduce motion" on their device.
- **Colours mean one thing.** Red is for violence and warnings, green is for
  good outcomes, blue is for links, gold is for attention. That is why the
  donate button is gold, not red.
- **Real footage gets a warning.** The Mendiola and Hacienda Luisita videos show
  real violence, so they open behind a full warning with a crisis hotline. The
  Pax Silica clip only asks if you want to watch. Drawings in the game don't
  need warnings. Nothing downloads until someone presses play.

## Privacy

The site collects nothing. No cookies, no analytics, no forms, and it never
contacts another server (we host our own fonts). The only thing it remembers
is whether the game's sound is on, and that stays in the visitor's browser.
The privacy pop-up says exactly this. If we ever add analytics or a form, we
update `privacy.js` first and ask visitors for consent.

## The videos

| Clip | From | Sound |
| --- | --- | --- |
| Mendiola, January 22, 1987 | "Mendiola Massacre (A 1987 Documentary)", Edgardo Sicat on YouTube | No |
| Hacienda Luisita, November 16, 2004 | News5 on YouTube | No |
| Pax Silica, 2026 | "Pax Silica, makabubuti ba o makasasama?", Kapuso Mo, Jessica Soho (GMA) | Yes |

We trimmed and compressed them from our screen recordings with macOS's built-in
`avconvert`, for example:

    avconvert -s assets/RealVideos/mediola.mov -p Preset640x480 -o assets/video/mendiola-1987.mp4 --start 63.8 --duration 61

The footage belongs to its owners. We credit and link every clip inside the
player. Ask the owners for permission before promoting the site widely.

Lupa para sa nagbubungkal. Hustisya para sa magsasaka.
