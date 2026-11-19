/* =========================================================
   PIXEL ENGINE: shared by the game (index.html) and the
   advocacy site (learn.html). Everything is drawn with plain
   rectangles at low resolution, then scaled up crisp.

   HOW SPRITES WORK: each sprite is a list of text rows. Every
   letter is one pixel whose colour comes from a palette object
   (e.g. FARMER), and '.' is transparent. Edit the rows to redraw.

   CONTENTS
     palette (C) · helpers · pixel font (GLYPHS) · farmer sprites
     · coins · scenery (clouds, trees, hut, hacienda, sign…)
     · background layers · carabao & fellow farmers · scarecrow

   Exposes window.PX, the drawing toolkit used by every other script.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- palette (taken from the reference art) ---------- */
  const C = {
    sky: ['#cbe5f6', '#d6ebf8', '#e0f0fa', '#e9f5fb', '#f2f9fd'],
    cloud: '#ffffff', cloudMid: '#f1f7fc', cloudShade: '#dbe9f4',
    hillFar: '#b7de96', hillFarTop: '#cfeab3',
    hillNear: '#7dc05a', hillNearTop: '#99d172', hillNearDark: '#64a948',
    treeD: '#3b873a', treeM: '#56a643', treeL: '#7ec659',
    trunk: '#6b4428', trunkD: '#4e2f1b',
    grass: '#7cc35a', grassTop: '#9bd772', grassD: '#62aa48', grassDD: '#4c903a',
    soil: '#8a6136', soilTop: '#a3773f', soilD: '#6b4727', soilDD: '#4f331b',
    sprout: '#4f9e3c', sproutL: '#8fd36a',
    post: '#3d2525', postTop: '#5c3a36', postRing: '#704846', postD: '#2a1818', postText: '#e9cf9f',
    coinO: '#e5952a', coinY: '#f8cf55', coinL: '#fde89c', heart: '#a3262a',
    ink: '#2a1a14'
  };

  /* ---------- helpers ---------- */
  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').imageSmoothingEnabled = false;
    return c;
  }
  function spriteFromMap(map, colors) {
    const h = map.length;
    const w = Math.max.apply(null, map.map(function (r) { return r.length; }));
    const c = makeCanvas(w, h);
    const x = c.getContext('2d');
    for (let r = 0; r < h; r++) {
      for (let i = 0; i < map[r].length; i++) {
        const col = colors[map[r][i]];
        if (col) { x.fillStyle = col; x.fillRect(i, r, 1, 1); }
      }
    }
    return c;
  }
  function flipCanvas(src) {
    const c = makeCanvas(src.width, src.height);
    const x = c.getContext('2d');
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0);
    return c;
  }
  function blob(ctx, cx, cy, r, color, step) {
    step = step || 2;
    ctx.fillStyle = color;
    for (let y = -r; y <= r; y += step) {
      for (let x = -r; x <= r; x += step) {
        if (x * x + y * y <= r * r) ctx.fillRect(Math.round(cx + x), Math.round(cy + y), step, step);
      }
    }
  }

  /* ---------- tiny 5px pixel font (for signs & post labels) ---------- */
  const GLYPHS = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'], G: ['.##', '#..', '#.#', '#.#', '.##'],
    I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
    L: ['#..', '#..', '#..', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
    N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
    W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
    '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'],
    '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'],
    '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
    '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '##.'],
    '!': ['#', '#', '#', '.', '#'],
    C: ['.##', '#..', '#..', '#..', '.##'], E: ['###', '#..', '##.', '#..', '###'],
    F: ['###', '#..', '##.', '#..', '#..'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    T: ['###', '.#.', '.#.', '.#.', '.#.'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    J: ['..#', '..#', '..#', '#.#', '.#.'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    '?': ['##.', '..#', '.#.', '...', '.#.'], '-': ['...', '...', '###', '...', '...'],
    '.': ['.', '.', '.', '.', '#'], ',': ['.', '.', '.', '#', '#']
  };
  function textWidth(str) {
    let w = 0;
    for (const ch of str) { const g = GLYPHS[ch]; w += (g ? g[0].length : 2) + 1; }
    return Math.max(0, w - 1);
  }
  function drawText(ctx, str, x, y, color, s) {
    s = s || 1;
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of str) {
      const g = GLYPHS[ch];
      if (!g) { cx += 3 * s; continue; }
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < g[r].length; c++) {
          if (g[r][c] === '#') ctx.fillRect(cx + c * s, y + r * s, s, s);
        }
      }
      cx += (g[0].length + 1) * s;
    }
  }

  /* ---------- the farmer (from the reference sprite) ---------- */
  const FARMER = {
    H: '#7a4a2c', h: '#a8774f', S: '#a8693f', s: '#7d4a2b', E: '#2b1a14',
    B: '#4a9ad8', b: '#3578b5', P: '#1f2840', F: '#3a2020', G: '#7cc35a'
  };
  const FRONT = [
    '.....HHhhHH.....',
    '....HHHHHHHH....',
    '.HHHHHHHHHHHHHH.',
    'HHHHSSSSSSSSHHHH',
    '....SSSSSSSS....',
    '....SESSSSES....',
    '....SSSSSSSS....',
    '.....SSssSS.....',
    '......SSSS......',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '...SBBBBBBBBS...',
    '...SBBBBBBBBS...',
    '..GSBBBBBBBBS...',
    '.GGSbbbbbbbbS...',
    '....PPPPPPPP....',
    '....PPPPPPPP....',
    '....PPP..PPP....',
    '....SSS..SSS....',
    '....SSS..SSS....',
    '...FFFF..FFFF...'
  ];
  const SIDE_TOP = [
    '......HHH.......',
    '.....HhHHH......',
    '..HHHHHHHHHHH...',
    '....HSSSSS......',
    '....SSSSES......',
    '....SSSSSSS.....',
    '.....SSsS.......',
    '......SS........',
    '.....BBBBB......',
    '.....BBBBB......',
    '.....BBSBB......',
    '.....BBSSSG.....',
    '.....BBBBBGG....',
    '.....bbbbb......',
    '.....PPPPP......',
    '.....PPPPP......'
  ];
  const LEGS = {
    stand: ['.....PP.PP......', '.....SS.SS......', '.....SS.SS......', '....FFF.FFF.....'],
    a:     ['....PP...PP.....', '...SS.....SS....', '...SS.....SS....', '..FFF.....FFF...'],
    b:     ['......PPP.......', '......SSS.......', '......SS........', '.....FFF........']
  };

  const COIN_MAP = [
    '....oooo....',
    '..ooyyyyoo..',
    '.oylyyyyyyo.',
    '.oyRRyyRRyo.',
    'oyRRRRRRRRyo',
    'oyRRRRRRRRyo',
    'oyyRRRRRRyyo',
    'oyyyRRRRyyyo',
    '.oyyyRRyyyo.',
    '.oyyyyyyyyo.',
    '..ooyyyyoo..',
    '....oooo....'
  ];
  const FLOWER_MAP = [
    '....o....',
    '...oyo...',
    '..oylyo..',
    '.oyyRyyo.',
    'oyyRRRyyo',
    '.oyyRyyo.',
    '..oyyyo..',
    '...oyo...',
    '....o....'
  ];
  const COIN_COLORS = { o: C.coinO, y: C.coinY, l: C.coinL, R: C.heart };

  const sprites = {};
  function buildSprites() {
    sprites.front = spriteFromMap(FRONT, FARMER);
    sprites.stand = spriteFromMap(SIDE_TOP.concat(LEGS.stand), FARMER);
    sprites.walkA = spriteFromMap(SIDE_TOP.concat(LEGS.a), FARMER);
    sprites.walkB = spriteFromMap(SIDE_TOP.concat(LEGS.b), FARMER);
    sprites.standL = flipCanvas(sprites.stand);
    sprites.walkAL = flipCanvas(sprites.walkA);
    sprites.walkBL = flipCanvas(sprites.walkB);
    sprites.coin = spriteFromMap(COIN_MAP, COIN_COLORS);
    sprites.flower = spriteFromMap(FLOWER_MAP, COIN_COLORS);
  }

  /* ---------- prerendered scenery ---------- */
  function makeCloud(s) {
    const c = makeCanvas(s, 16), x = c.getContext('2d');
    const R = function (a, y, b, hh, col) { x.fillStyle = col; x.fillRect(Math.round(s * a), y, Math.round(s * (b - a)), hh); };
    R(0.30, 0, 0.56, 3, C.cloud);
    R(0.16, 3, 0.82, 3, C.cloud);
    R(0.04, 6, 0.96, 4, C.cloud);
    R(0.00, 10, 1.00, 4, C.cloud);
    R(0.55, 10, 1.00, 4, C.cloudMid);
    R(0.06, 14, 0.94, 2, C.cloudShade);
    return c;
  }
  function makeTree(seed) {
    const w = 48, h = 60, c = makeCanvas(w, h), x = c.getContext('2d');
    const r = 11 + Math.round(hash(seed) * 5);
    x.fillStyle = C.trunk; x.fillRect(21, 32, 6, 28);
    x.fillStyle = C.trunkD; x.fillRect(25, 32, 2, 28);
    blob(x, 24, 22, r, C.treeD); blob(x, 14, 30, r - 4, C.treeD); blob(x, 34, 30, r - 4, C.treeD);
    blob(x, 22, 20, r - 3, C.treeM); blob(x, 13, 28, r - 7, C.treeM); blob(x, 32, 27, r - 6, C.treeM);
    blob(x, 18, 15, r - 7, C.treeL); blob(x, 10, 25, 3, C.treeL);
    return c;
  }
  function makeBush(seed) {
    const c = makeCanvas(30, 16), x = c.getContext('2d');
    const r = 6 + Math.round(hash(seed + 3) * 3);
    blob(x, 10, 10, r, C.treeD); blob(x, 19, 9, r + 1, C.treeD);
    blob(x, 10, 9, r - 2, C.treeM); blob(x, 18, 8, r - 1, C.treeM);
    blob(x, 15, 5, 3, C.treeL);
    return c;
  }
  function makePlot(w) {
    const c = makeCanvas(w, 22), x = c.getContext('2d');
    x.fillStyle = C.soil; x.fillRect(2, 7, w - 4, 12); x.fillRect(0, 11, w, 8);
    x.fillStyle = C.soilTop; x.fillRect(2, 5, w - 4, 2);
    x.fillStyle = C.soilD;
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < w; i += 8) x.fillRect(i + (row % 2) * 4, 10 + row * 3, 5, 1);
    }
    x.fillStyle = C.soilDD; x.fillRect(0, 19, w, 3);
    for (let i = 6; i < w - 5; i += 7) {
      const tall = hash(i * 1.3 + w) > 0.5 ? 1 : 0;
      x.fillStyle = C.sprout;
      x.fillRect(i, 2 - tall, 1, 4 + tall);
      x.fillRect(i - 2, 1 - tall, 2, 1); x.fillRect(i + 1, 1 - tall, 2, 1);
      x.fillStyle = C.sproutL;
      x.fillRect(i - 2, 0 - tall, 1, 1); x.fillRect(i + 2, 0 - tall, 1, 1);
      if (hash(i + w) > 0.4) { x.fillStyle = C.sprout; x.fillRect(i + 3, 12, 2, 2); x.fillStyle = C.sproutL; x.fillRect(i + 3, 12, 1, 1); }
    }
    return c;
  }
  function makeHut() {
    const c = makeCanvas(54, 54), x = c.getContext('2d');
    x.fillStyle = C.trunk; [10, 22, 32, 42].forEach(function (px) { x.fillRect(px, 42, 3, 12); });
    x.fillStyle = '#7a5230'; x.fillRect(6, 40, 42, 3);
    x.fillStyle = '#c9a06a'; x.fillRect(10, 22, 34, 18);
    x.fillStyle = '#b38653'; for (let i = 12; i < 44; i += 4) x.fillRect(i, 22, 1, 18);
    x.fillStyle = '#8a5c33'; x.fillRect(13, 26, 10, 8);
    x.fillStyle = '#4e2f1b'; x.fillRect(14, 27, 8, 6); x.fillRect(29, 26, 9, 14);
    x.fillStyle = '#e0b97f'; x.fillRect(17, 27, 1, 6); x.fillRect(14, 29, 8, 1);
    for (let r = 0; r < 20; r++) {
      const hw = Math.round(5 + r * 1.3), cx = 27;
      x.fillStyle = Math.floor(r / 3) % 2 ? '#b8874f' : '#a37440';
      x.fillRect(cx - hw, 4 + r, hw * 2, 1);
      x.fillStyle = '#7d5530';
      x.fillRect(cx - hw, 4 + r, 1, 1); x.fillRect(cx + hw - 1, 4 + r, 1, 1);
    }
    x.fillStyle = '#7d5530'; x.fillRect(0, 23, 54, 1);
    x.fillStyle = C.trunk; x.fillRect(22, 2, 10, 3);
    x.fillStyle = '#8a5c33'; x.fillRect(30, 43, 1, 11); x.fillRect(36, 43, 1, 11);
    for (let y = 45; y < 54; y += 3) x.fillRect(30, y, 7, 1);
    return c;
  }
  function makeStump() {
    const c = makeCanvas(28, 16), x = c.getContext('2d');
    x.fillStyle = C.post; x.fillRect(2, 3, 24, 10); x.fillRect(0, 10, 28, 6);
    x.fillStyle = C.postTop; x.fillRect(4, 0, 20, 1); x.fillRect(2, 1, 24, 2);
    x.fillStyle = C.postRing; x.fillRect(7, 1, 14, 1);
    x.fillStyle = C.postD; x.fillRect(22, 3, 4, 10); x.fillRect(23, 10, 5, 6); x.fillRect(0, 15, 28, 1);
    return c;
  }
  function makeHacienda() {
    const w = 130, h = 80, c = makeCanvas(w, h), x = c.getContext('2d');
    const wall = '#f1e6cc', wallD = '#d9c9a5', white = '#ffffff', glass = '#3d4f66';
    // roof (upper)
    for (let r = 0; r < 13; r++) {
      x.fillStyle = r % 3 === 2 ? '#8f3a28' : '#b14a34';
      x.fillRect(32 - r * 1.7 | 0, 3 + r, (66 + r * 3.4) | 0, 1);
    }
    x.fillStyle = '#7a2f20'; x.fillRect(10, 16, 110, 2);
    // upper floor
    x.fillStyle = wall; x.fillRect(16, 18, 98, 22);
    x.fillStyle = wallD; x.fillRect(16, 37, 98, 3);
    [26, 46, 76, 96].forEach(function (wx) {
      x.fillStyle = white; x.fillRect(wx - 1, 22, 10, 12);
      x.fillStyle = glass; x.fillRect(wx, 23, 8, 10);
      x.fillStyle = white; x.fillRect(wx + 4, 23, 1, 10); x.fillRect(wx, 27, 8, 1);
    });
    // balcony
    x.fillStyle = '#7a2f20'; x.fillRect(2, 40, 126, 2);
    x.fillStyle = wallD; x.fillRect(2, 42, 126, 2);
    x.fillStyle = white; for (let i = 4; i < 128; i += 4) x.fillRect(i, 36, 1, 4);
    x.fillRect(2, 35, 126, 1);
    // ground floor
    x.fillStyle = wall; x.fillRect(6, 44, 118, 32);
    x.fillStyle = '#cbb98f'; x.fillRect(4, 75, 122, 5);
    [20, 45, 82, 107].forEach(function (cx) {
      x.fillStyle = white; x.fillRect(cx, 44, 4, 31);
      x.fillStyle = '#e2d6b8'; x.fillRect(cx + 3, 44, 1, 31);
    });
    [28, 90].forEach(function (wx) {
      x.fillStyle = white; x.fillRect(wx - 1, 51, 12, 15);
      x.fillStyle = glass; x.fillRect(wx, 52, 10, 13);
      x.fillStyle = white; x.fillRect(wx + 5, 52, 1, 13); x.fillRect(wx, 58, 10, 1);
    });
    x.fillStyle = '#4e2a18'; x.fillRect(56, 52, 18, 23);
    x.fillStyle = '#6b3a22'; x.fillRect(58, 54, 6, 21); x.fillRect(66, 54, 6, 21);
    x.fillStyle = C.coinY; x.fillRect(63, 64, 1, 2); x.fillRect(66, 64, 1, 2);
    x.fillStyle = white; x.fillRect(55, 50, 20, 2);
    return c;
  }
  function makeCane(w) {
    const h = 46, c = makeCanvas(w, h), x = c.getContext('2d');
    for (let i = 0; i < w; i += 3) {
      const t = 28 + Math.round(hash(i * 0.37) * 16);
      x.fillStyle = '#7aa84a'; x.fillRect(i, h - t, 2, t);
      x.fillStyle = '#5b8a37'; for (let y = h - t + 4; y < h; y += 6) x.fillRect(i, y, 2, 1);
      x.fillStyle = hash(i) > 0.5 ? '#8fcf63' : '#5f9a3c';
      for (let k = 0; k < 4; k++) x.fillRect(i - 3 + k * 2, h - t + 2 + k, 2, 1);
      x.fillStyle = '#9edb70'; x.fillRect(i + 1, h - t - 2, 1, 3);
    }
    return c;
  }
  function makeSign() {
    const c = makeCanvas(64, 36), x = c.getContext('2d');
    x.fillStyle = C.trunk; x.fillRect(10, 20, 3, 16); x.fillRect(51, 20, 3, 16);
    x.fillStyle = '#8a5c33'; x.fillRect(0, 0, 64, 22);
    x.fillStyle = '#e3b56e'; x.fillRect(2, 2, 60, 18);
    x.fillStyle = '#c9974f'; x.fillRect(2, 18, 60, 2);
    drawText(x, 'PRIBADO', Math.round((64 - textWidth('PRIBADO')) / 2), 4, '#8c1f1f');
    drawText(x, 'BAWAL PUMASOK', Math.round((64 - textWidth('BAWAL PUMASOK')) / 2), 11, '#8c1f1f');
    return c;
  }

  const art = {};
  function buildArt() {
    art.clouds = {};
    art.trees = [0, 1, 2, 3].map(function (i) { return makeTree(i + 1); });
    art.bushes = [0, 1, 2].map(function (i) { return makeBush(i + 1); });
    art.hut = makeHut();
    art.stump = makeStump();
    art.hacienda = makeHacienda();
    art.cane = makeCane(300);
    art.sign = makeSign();
  }
  function cloud(s) { return art.clouds[s] || (art.clouds[s] = makeCloud(s)); }

  /* ---------- background layers ---------- */
  const CLOUDS = [
    { x: 10, y: 10, s: 60 }, { x: 120, y: 32, s: 76 }, { x: 236, y: 8, s: 44 },
    { x: 330, y: 38, s: 66 }, { x: 452, y: 18, s: 54 }
  ];
  const CLOUD_SPAN = 560;
  const skyCache = {};

  function skyLayer(W, ground) {
    const key = W + 'x' + ground;
    if (skyCache[key]) return skyCache[key];
    const c = makeCanvas(W, ground), x = c.getContext('2d');
    const bh = Math.ceil(ground / C.sky.length);
    C.sky.forEach(function (col, i) {
      x.fillStyle = col; x.fillRect(0, i * bh, W, bh);
      if (i > 0) {
        x.fillStyle = C.sky[i - 1];
        for (let px = 0; px < W; px += 4) { x.fillRect(px, i * bh, 2, 2); x.fillRect(px + 2, i * bh + 2, 2, 2); }
      }
    });
    skyCache[key] = c;
    return c;
  }

  /* ---------- distant mountains + a smiling sun (game and hero) ---------- */
  const MTN_W = 420;            // mountain strip width (tiles seamlessly)
  const MTN = [[0, 92], [110, 80], [210, 92], [310, 84], [MTN_W, 92]];   // low peaks that just peek over the hills
  const mtnCache = {};
  function mountainTop(x) {      // smooth (cosine) curve through MTN
    for (let i = 0; i < MTN.length - 1; i++) {
      const a = MTN[i], b = MTN[i + 1];
      if (x >= a[0] && x <= b[0]) {
        const k = (x - a[0]) / (b[0] - a[0]), s = (1 - Math.cos(k * Math.PI)) / 2;
        return a[1] + (b[1] - a[1]) * s;
      }
    }
    return 92;
  }
  // pale blue-green so they read as far behind the hills
  function mountainLayer(g) {
    if (mtnCache[g]) return mtnCache[g];
    const c = makeCanvas(MTN_W, g), x = c.getContext('2d');
    for (let px = 0; px < MTN_W; px++) {
      const top = Math.round(mountainTop(px));
      const lit = mountainTop(px + 1) < mountainTop(px);
      x.fillStyle = lit ? '#cfe6d8' : '#c2dfcd'; x.fillRect(px, top, 1, g - top);   // pale, close to the sky
      x.fillStyle = '#b1d3be'; x.fillRect(px, top, 1, 1);
    }
    mtnCache[g] = c;
    return c;
  }
  function smileySun(ctx, cx, cy, t, size) {
    const r = size || 13;
    // eight rays all around, gently pulsing
    ctx.fillStyle = '#e5952a';
    const pulse = Math.floor(t / 600) % 2;
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(function (deg, i) {
      const a = deg * Math.PI / 180, r0 = r + 4 + ((i + pulse) % 2), r1 = r0 + 4;
      for (let k = r0; k <= r1; k++) ctx.fillRect(Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k), 1, 1);
    });
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = Math.hypot(x, y);
        if (d > r + 0.3) continue;
        ctx.fillStyle = d > r - 1.2 ? '#e5952a' : (x + y < -6 ? '#fbd56a' : '#f6b93f');
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
    // face: two eyes and a smile
    ctx.fillStyle = '#5e3518';
    ctx.fillRect(cx - 5, cy - 4, 2, 3); ctx.fillRect(cx + 4, cy - 4, 2, 3);
    [[-6, 2], [-5, 3], [-4, 4], [-3, 5], [-2, 5], [-1, 6], [0, 6], [1, 6], [2, 5], [3, 5], [4, 4], [5, 3], [6, 2]].forEach(function (p) {
      ctx.fillRect(cx + p[0], cy + p[1], 1, 1);
    });
    if (r >= 11) {                             // cheeks (only on the big sun)
      ctx.fillStyle = 'rgba(229,149,42,.45)';
      ctx.fillRect(cx - 9, cy + 1, 3, 2); ctx.fillRect(cx + 7, cy + 1, 3, 2);
    }
  }
  function drawGround(ctx, W, H, g, cam) {
    ctx.fillStyle = C.grass; ctx.fillRect(0, g, W, H - g);
    ctx.fillStyle = C.grassTop; ctx.fillRect(0, g, W, 2);
    [7, 14, 21].forEach(function (dy, row) {
      if (g + dy >= H) return;
      for (let j = Math.floor((cam - 30) / 24); j <= Math.ceil((cam + W) / 24); j++) {
        const hv = hash(j * 1.9 + row * 31);
        if (hv < 0.45) continue;
        ctx.fillStyle = row === 2 ? C.grassDD : C.grassD;
        ctx.fillRect(Math.round(j * 24 + hv * 10 - cam), g + dy, 6 + Math.round(hv * 14), 2);
      }
    });
  }

  // ONE background for the game and the Alamin Pa hero, so moving between them feels seamless
  function drawBackground(ctx, o) {
    const W = o.W, H = o.H, g = o.ground, cam = o.cam || 0, t = o.t || 0;
    ctx.drawImage(skyLayer(W, g), 0, 0);
    const mtn = mountainLayer(g), mx = -Math.round(cam * 0.06) % MTN_W;
    for (let x = mx - MTN_W; x < W; x += MTN_W) ctx.drawImage(mtn, x, 0);

    // clouds (slow parallax + drift)
    CLOUDS.forEach(function (cl) {
      const sx = (((cl.x - cam * 0.1 + t * 0.003) % CLOUD_SPAN) + CLOUD_SPAN) % CLOUD_SPAN - 80;
      if (sx < W) ctx.drawImage(cloud(cl.s), Math.round(sx), cl.y);
    });
    // smiling sun in front of the clouds so its face is never hidden;
    // stays put like a faraway sun, clear of the title card and the HUD
    smileySun(ctx, W - 44, 38, t);

    // far hills
    for (let sx = 0; sx < W; sx += 3) {
      const wx = sx + cam * 0.2;
      let hh = 34 + 14 * Math.sin(wx * 0.018) + 8 * Math.sin(wx * 0.047 + 1.3);
      hh = Math.round(hh / 3) * 3;
      ctx.fillStyle = C.hillFar; ctx.fillRect(sx, g - hh, 3, hh);
      ctx.fillStyle = C.hillFarTop; ctx.fillRect(sx, g - hh, 3, 3);
    }
    // near hills
    for (let sx = 0; sx < W; sx += 3) {
      const wx = sx + cam * 0.4;
      let hh = 20 + 10 * Math.sin(wx * 0.025 + 2) + 7 * Math.sin(wx * 0.061);
      hh = Math.round(hh / 3) * 3;
      ctx.fillStyle = C.hillNear; ctx.fillRect(sx, g - hh, 3, hh);
      ctx.fillStyle = C.hillNearTop; ctx.fillRect(sx, g - hh, 3, 3);
      const k = Math.floor(wx / 3);
      if (hash(k) > 0.82) { ctx.fillStyle = C.hillNearDark; ctx.fillRect(sx, g - hh + 6 + Math.round(hash(k + 1) * 8), 3, 3); }
    }
    // trees
    const tp = cam * 0.55;
    for (let i = Math.floor((tp - 60) / 64); i <= Math.ceil((tp + W + 60) / 64); i++) {
      if (hash(i * 3.1) < 0.35) continue;
      const tr = art.trees[Math.floor(hash(i * 7.7) * art.trees.length)];
      ctx.drawImage(tr, Math.round(i * 64 + hash(i) * 30 - tp), g - tr.height + 4);
    }
    // bushes
    const bp = cam * 0.85;
    for (let i = Math.floor((bp - 40) / 40); i <= Math.ceil((bp + W + 40) / 40); i++) {
      if (hash(i * 5.3) < 0.4) continue;
      const b = art.bushes[Math.floor(hash(i * 2.9) * art.bushes.length)];
      ctx.drawImage(b, Math.round(i * 40 + hash(i * 1.7) * 20 - bp), g - b.height + 3);
    }
    drawGround(ctx, W, H, g, cam);
  }

  function drawStumpLabel(ctx, x, y, label) {
    ctx.drawImage(art.stump, x, y);
    const tw = textWidth(label);
    drawText(ctx, label, x + Math.round((28 - tw) / 2) - 1, y + 6, C.postText);
  }

  /* =========================================================
     NPCs, carabao + fellow farmers
     ========================================================= */
  const CARABAO_COLORS = { K: '#5f5864', k: '#463f4b', L: '#7d7682', H: '#e6dcc4', h: '#b9a98a', E: '#1a1416', n: '#2e2830', T: '#463f4b' };
  const CARABAO_BODY = [
    '..................HHh',
    '.................H...hh',
    '.....................hKK',
    '....................KKKKKK',
    '..KKKKKKKKKKKKKKKKKKKKKKEKK',
    '.KLLLLLKKKKKKKKKKKKKKKKKKKKK',
    '.KLLKKKKKKKKKKKKKKKKKKKKKKKKn',
    'TKKKKKKKKKKKKKKKKKKKKKKKKKKnn',
    'T.KKKKKKKKKKKKKKKKKKKK..KKnn',
    'T.KKKKKKKKKKKKKKKKKKKK',
    '..kkkkkkkkkkkkkkkkkkkk'
  ];
  const CARABAO_LEGS = {
    a: ['..kKK..kK.......kKK..kK', '..kK...kK.......kK...kK', '..kK...kK.......kK...kK', '..nn...nn.......nn...nn'],
    b: ['...kKkK..........kKkK', '...kKkK..........kKkK', '...kKkK..........kKkK', '...nnnn..........nnnn']
  };
  // fellow farmers: same body, different shirts / hats / skin
  const VARIANTS = [
    { B: '#c84a3a', b: '#9e3529', H: '#d8b36a', h: '#f0d48e', S: '#9a5e38', s: '#74442a', P: '#3a2f28' },
    { B: '#eeeae0', b: '#cfc8b8', H: '#c9a35a', h: '#e6c983', S: '#a8693f', s: '#7d4a2b', P: '#5a4a3a' },
    { B: '#5aa36a', b: '#3f7d4f', H: '#5a3a22', h: '#7a5432', S: '#b97a4b', s: '#8a5530', P: '#1f2840' },
    { B: '#e07fa0', b: '#b85c7c', H: '#d8b36a', h: '#f0d48e', S: '#8f5634', s: '#6a3d24', P: '#3a3f4a' }
  ];
  // bent over, planting rice seedlings (faces right)
  const PLANT_TOP = [
    '..................', '..................', '..................', '..................', '..................',
    '..........HHH.....',
    '........HHhHHHH...',
    '.....BBBBHSSSHH...',
    '....BBBBBBSSES....',
    '....BBBBBBBSSS....',
    '....PPPBBBBBS.....'
  ];
  const PLANT_LOW = {
    a: ['....PPPP...SS.....', '....PPPP....S.....', '.....PP.....SG....', '.....SSS.....G....'],
    b: ['....PPPP...SS.....', '....PPPP...S......', '.....PP...SG......', '.....SSS...G......']
  };
  const PLANT_LEGS = ['.....S.S..........', '.....S.S..........', '.....S.S..........', '.....S.S..........', '....FF.FF.........'];

  const npc = {};
  function buildNpcs() {
    const tailSwish = CARABAO_BODY.map(function (r, i) {
      if (i === 6) return 'T' + r.slice(1);
      if (i === 9) return '.' + r.slice(1);
      return r;
    });
    npc.carabaoA = spriteFromMap(CARABAO_BODY.concat(CARABAO_LEGS.a), CARABAO_COLORS);
    npc.carabaoB = spriteFromMap(CARABAO_BODY.concat(CARABAO_LEGS.b), CARABAO_COLORS);
    npc.carabaoSwish = spriteFromMap(tailSwish.concat(CARABAO_LEGS.a), CARABAO_COLORS);
    npc.carabaoAL = flipCanvas(npc.carabaoA);
    npc.carabaoBL = flipCanvas(npc.carabaoB);
    npc.carabaoSwishL = flipCanvas(npc.carabaoSwish);
    npc.v = VARIANTS.map(farmerSet);
  }
  // full sprite set for a farmer with the given palette overrides ({} = Tatay Ramon)
  function farmerSet(v) {
    const pal = Object.assign({}, FARMER, v);
    const o = {
      front: spriteFromMap(FRONT, pal),
      stand: spriteFromMap(SIDE_TOP.concat(LEGS.stand), pal),
      walkA: spriteFromMap(SIDE_TOP.concat(LEGS.a), pal),
      walkB: spriteFromMap(SIDE_TOP.concat(LEGS.b), pal),
      plantA: spriteFromMap(PLANT_TOP.concat(PLANT_LOW.a, PLANT_LEGS), pal),
      plantB: spriteFromMap(PLANT_TOP.concat(PLANT_LOW.b, PLANT_LEGS), pal)
    };
    Object.keys(o).forEach(function (k) { o[k + 'L'] = flipCanvas(o[k]); });
    return o;
  }

  function line(ctx, x0, y0, x1, y1, color) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    ctx.fillStyle = color;
    for (let n = 0; n < 400; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // resting carabao, tail swishing now and then. x = left edge, y = feet
  function drawCarabao(ctx, x, y, t, dir) {
    const swish = Math.floor(t / 450 + x) % 5 === 0;
    const img = dir < 0 ? (swish ? npc.carabaoSwishL : npc.carabaoAL) : (swish ? npc.carabaoSwish : npc.carabaoA);
    ctx.fillStyle = 'rgba(42,26,20,.2)'; ctx.fillRect(Math.round(x + 2), Math.round(y - 1), 24, 2);
    ctx.drawImage(img, Math.round(x), Math.round(y - img.height));
  }

  // a farmer bent over planting. x = left edge, y = feet
  function drawPlanter(ctx, x, y, t, variant, dir, offset) {
    const v = npc.v[variant % npc.v.length];
    const f = Math.floor(t / 520 + (offset || 0) * 2) % 2;
    const img = dir < 0 ? (f ? v.plantBL : v.plantAL) : (f ? v.plantB : v.plantA);
    ctx.drawImage(img, Math.round(x), Math.round(y - img.height));
  }

  // a farmer swinging a hoe. x = left edge, y = feet
  function drawHoer(ctx, x, y, t, variant, dir, offset) {
    const v = npc.v[variant % npc.v.length];
    const img = dir < 0 ? v.standL : v.stand;
    x = Math.round(x); y = Math.round(y);
    const top = y - img.height;
    ctx.drawImage(img, x, top);
    const up = ((t / 800 + (offset || 0)) % 1) < 0.55;
    const m = function (lx) { return dir < 0 ? x + 15 - lx : x + lx; };
    if (up) {
      line(ctx, m(10), top + 12, m(13), top + 1, '#8a5c33');
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(Math.min(m(12), m(15)), top, 3, 2);
    } else {
      line(ctx, m(10), top + 11, m(17), top + 17, '#8a5c33');
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(m(17) - (dir < 0 ? 1 : 0), top + 17, 2, 3);
      ctx.fillStyle = C.soilTop; ctx.fillRect(m(19), top + 17, 1, 1); ctx.fillRect(m(18), top + 15, 1, 1);
    }
  }

  // carabao pulling a plow with a farmer behind it, pacing between minX and maxX.
  function drawPlowTeam(ctx, minX, maxX, y, t, variant, cam) {
    cam = cam || 0;
    const range = Math.max(1, maxX - minX), p = (t * 0.012) % (range * 2);
    const dir = p < range ? 1 : -1;
    const ax = (dir > 0 ? minX + p : minX + range * 2 - p) - cam; // anchor = carabao rear
    const step = Math.floor(t / 200) % 2;
    const v = npc.v[variant % npc.v.length];
    const L = function (lx) { return dir > 0 ? ax + lx : ax - lx; };
    y = Math.round(y);
    // furrow trail behind the plow
    ctx.fillStyle = C.soilDD;
    const tx0 = dir > 0 ? Math.max(minX - cam, L(-40)) : L(-8), tx1 = dir > 0 ? L(-8) : Math.min(maxX + 28 - cam, L(-40));
    if (tx1 > tx0) ctx.fillRect(Math.round(tx0), y - 1, Math.round(tx1 - tx0), 1);
    // carabao
    const cimg = dir > 0 ? (step ? npc.carabaoB : npc.carabaoA) : (step ? npc.carabaoBL : npc.carabaoAL);
    ctx.drawImage(cimg, Math.round(dir > 0 ? L(0) : L(0) - cimg.width), y - cimg.height);
    // yoke + rope + plow
    line(ctx, L(18), y - 12, L(-6), y - 3, '#c9a46a');
    ctx.fillStyle = '#6b4428'; ctx.fillRect(Math.round(Math.min(L(19), L(21))), y - 15, 2, 4);
    ctx.fillStyle = '#9aa3ad'; ctx.fillRect(Math.round(Math.min(L(-9), L(-5))), y - 2, 4, 2);
    line(ctx, L(-7), y - 3, L(-14), y - 10, '#8a5c33');
    // farmer
    const fimg = dir > 0 ? (step ? v.walkA : v.walkB) : (step ? v.walkAL : v.walkBL);
    ctx.drawImage(fimg, Math.round(dir > 0 ? L(-25) : L(-25) - 16), y - fimg.height);
  }

  /* ---------- scarecrow (panakot) ---------- */
  const SCARECROW_COLORS = {
    P: '#6b4428', p: '#4e2f1b', H: '#d8b36a', h: '#b88f46', F: '#e3c48a', f: '#c9a46a',
    E: '#2a1a14', M: '#8a5c33', S: '#c84a3a', s: '#9e3529', W: '#4a9ad8', Y: '#f0d48e', y: '#d9b05a'
  };
  const SCARECROW_TOP = [
    '......hHHh......',
    '.....HHHHHH.....',
    '..hHHHHHHHHHHh..',
    '.....FFFFFF.....',
    '.....FEFFEF.....',
    '.....FFFFFF.....',
    '.....FMfMfF.....',
    '......FFFF......',
    '......YPPY......',
    'YSSSSSSSSSSSSSSY',
    'yYsSSSSSSSSSSsYy',
    '....SSSSWWSS....',
    '....SSSSWWSS....',
    '....sSSSSSSs....',
    '....YyYyYyYy....',
    '.....y.YP.y.....'
  ];
  const SCARECROW_POLE = ['.......PP.......', '.......Pp.......', '.......Pp.......', '.......Pp.......',
    '.......Pp.......', '.......Pp.......', '.......Pp.......', '.......Pp.......', '.......Pp.......', '.......Pp.......'];
  let scarecrowTop = null, scarecrowPole = null;
  // x = left edge, y = where the pole meets the ground
  function drawScarecrow(ctx, x, y, t) {
    if (!scarecrowTop) {
      scarecrowTop = spriteFromMap(SCARECROW_TOP, SCARECROW_COLORS);
      scarecrowPole = spriteFromMap(SCARECROW_POLE, SCARECROW_COLORS);
    }
    x = Math.round(x); y = Math.round(y);
    const sway = [0, 1, 0, -1][Math.floor(t / 700) % 4];
    const poleTop = y - scarecrowPole.height, top = poleTop - scarecrowTop.height + 1;
    ctx.drawImage(scarecrowPole, x, poleTop);
    ctx.drawImage(scarecrowTop, x + sway, top);
    // a little maya bird resting on the right arm, flapping now and then
    const bx = x + sway + 13, by = top + 7;
    const flap = Math.floor(t / 160) % 25 < 3;
    ctx.fillStyle = '#6b4a35'; ctx.fillRect(bx, by, 3, 2);
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(bx + 2, by - 1, 2, 2);
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(bx + 3, by - 1, 1, 1);
    ctx.fillStyle = '#e5952a'; ctx.fillRect(bx + 4, by, 1, 1);
    ctx.fillStyle = '#4e3626';
    if (flap) { ctx.fillRect(bx - 1, by - 2, 2, 1); ctx.fillRect(bx, by - 3, 1, 1); }
    else ctx.fillRect(bx - 1, by + 1, 2, 1);
  }

  function init() { buildSprites(); buildArt(); buildNpcs(); }
  init();

  window.PX = {
    C: C, hash: hash, makeCanvas: makeCanvas, spriteFromMap: spriteFromMap, flipCanvas: flipCanvas,
    blob: blob, drawText: drawText, textWidth: textWidth, makePlot: makePlot,
    drawBackground: drawBackground, drawStumpLabel: drawStumpLabel, smileySun: smileySun,
    line: line, farmerSet: farmerSet, VARIANTS: VARIANTS,
    drawCarabao: drawCarabao, drawScarecrow: drawScarecrow, drawPlanter: drawPlanter, drawHoer: drawHoer, drawPlowTeam: drawPlowTeam, npc: npc,
    sprites: sprites, art: art, FARMER: FARMER
  };
})();
