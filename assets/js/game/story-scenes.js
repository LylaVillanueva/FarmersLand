/* =========================================================
   STORY SCENES: pixel illustrations shown inside the game's
   dialog box, matching what Tatay Ramon is saying.
   Drawings are shown directly (no warning). Depictions of violence
   stay non-graphic: aftermath, memorials, candles. Only REAL footage
   gets a warning screen (see assets/js/shared/real-videos.js).
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX, C = PX.C, A = PX.art;
  const W = 160, H = 72;
  const TATAY = PX.farmerSet({});
  const V = PX.npc.v;
  let TOIL_PLOT = null;

  /* ---------- drawing helpers ---------- */
  function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function sky(ctx, cols, h) {
    const bh = Math.ceil(h / cols.length);
    cols.forEach(function (c, i) {
      R(ctx, 0, i * bh, W, bh, c);
      if (i > 0) { ctx.fillStyle = cols[i - 1]; for (let x = 0; x < W; x += 4) ctx.fillRect(x, i * bh, 2, 1); }
    });
  }
  function ground(ctx, y, c, top) { R(ctx, 0, y, W, H - y, c); R(ctx, 0, y, W, 1, top || c); }
  function spr(ctx, img, x, feet) { ctx.drawImage(img, Math.round(x), Math.round(feet - img.height)); }
  function text(ctx, s, x, y, c) { PX.drawText(ctx, s, Math.round(x), Math.round(y), c); }
  function centered(ctx, s, cx, y, c) { text(ctx, s, cx - PX.textWidth(s) / 2, y, c); }
  // sign on a stick: board centred on cx with its top at `top`, stick down to `bottom`
  function placard(ctx, cx, top, bottom, s, fg, bg) {
    const bw = PX.textWidth(s) + 4;
    R(ctx, cx, top + 8, 1, Math.max(0, bottom - top - 8), '#8a5c33');
    R(ctx, cx - bw / 2 - 1, top - 1, bw + 2, 9, C.ink);
    R(ctx, cx - bw / 2, top, bw, 7, bg || '#fff6dc');
    text(ctx, s, cx - bw / 2 + 2, top + 1, fg || C.heart);
  }
  function sack(ctx, x, y) {
    R(ctx, x + 1, y - 8, 6, 8, '#d9c08a'); R(ctx, x, y - 6, 8, 6, '#d9c08a');
    R(ctx, x + 5, y - 6, 3, 6, '#c4a873'); R(ctx, x + 2, y - 9, 4, 1, '#9a7f4a');
    R(ctx, x + 3, y - 10, 2, 1, '#9a7f4a');
  }
  function candle(ctx, x, y, t, i) {
    const flick = PX.hash(i * 3.7 + Math.floor(t / 140)) > 0.5 ? 1 : 0;
    ctx.fillStyle = 'rgba(248,207,85,.22)'; ctx.fillRect(x - 2, y - 10, 6, 7);
    R(ctx, x, y - 4, 2, 4, '#f3eadb'); R(ctx, x + 1, y - 4, 1, 4, '#d9cfbd');
    R(ctx, x, y - 6 - flick, 2, 2, '#f8cf55'); R(ctx, x, y - 7 - flick, 1, 1, '#fde89c');
  }
  function flower(ctx, x, y, c) { R(ctx, x, y - 2, 1, 2, '#4f9e3c'); R(ctx, x - 1, y - 3, 3, 1, c); R(ctx, x, y - 4, 1, 1, c); }
  function hat(ctx, x, y) { R(ctx, x + 3, y - 3, 2, 1, '#d8b36a'); R(ctx, x + 1, y - 2, 6, 1, '#d8b36a'); R(ctx, x, y - 1, 8, 1, '#b88f46'); }
  function slipper(ctx, x, y, c) { R(ctx, x, y, 3, 1, c); R(ctx, x + 4, y + 1, 3, 1, c); }
  function puff(ctx, x, y, r, c) { PX.blob(ctx, x, y, r, c, 2); }
  function lampPost(ctx, x, top, base, lit) {
    R(ctx, x, top, 2, base - top, '#3d3d48'); R(ctx, x - 2, top, 6, 2, '#3d3d48');
    R(ctx, x - 1, top + 2, 4, 2, lit ? '#f8cf55' : '#bfc6cc');
    if (lit) { ctx.fillStyle = 'rgba(248,207,85,.18)'; ctx.fillRect(x - 6, top + 2, 14, 12); }
  }
  function railing(ctx, y, post, rail) {
    R(ctx, 0, y, W, 1, rail); R(ctx, 0, y + 4, W, 1, rail);
    for (let x = 2; x < W; x += 8) R(ctx, x, y, 2, 7, post);
  }
  function fieldRows(ctx, y0, y1, soil, sprout) {
    for (let y = y0; y < y1; y += 4) {
      R(ctx, 0, y, W, 2, soil);
      if (sprout) for (let x = (y % 8); x < W; x += 7) R(ctx, x, y - 1, 1, 2, sprout);
    }
  }

  /* ---------- the scenes ---------- */
  const SCENES = {
    // matches the game world (same sky, sun, mountains, hut, plots) so the intro has no sudden change
    toil: {
      caption: 'ARAW-ARAW, BUONG BUHAY',
      alt: 'Maaraw na umaga sa bukid: nakangiting araw, malalayong bundok, bahay kubo at kalabaw. Nakayuko si Tatay Ramon sa taniman at tumutulo ang pawis.',
      draw: function (ctx, t) {
        sky(ctx, C.sky, 54);
        // distant hazy mountains (same colours as the game background)
        for (let x = 0; x < W; x++) {
          const top = Math.round(30 + 5 * Math.sin(x / 26) + 3 * Math.sin(x / 9 + 1));
          R(ctx, x, top, 1, 54 - top, '#a3cab4'); R(ctx, x, top, 1, 1, '#8fbba3');
        }
        PX.smileySun(ctx, 128, 14, t, 9);
        // rolling hills
        for (let x = 0; x < W; x += 2) {
          const far = Math.round(40 + 3 * Math.sin(x / 14));
          R(ctx, x, far, 2, 54 - far, C.hillFar); R(ctx, x, far, 2, 1, C.hillFarTop);
          const near = Math.round(46 + 2 * Math.sin(x / 10 + 2));
          R(ctx, x, near, 2, 54 - near, C.hillNear); R(ctx, x, near, 2, 1, C.hillNearTop);
        }
        ground(ctx, 54, C.grass, C.grassTop);
        // bahay kubo, carabao and a soil plot, like the start of the game
        ctx.drawImage(A.hut, 2, 22, 34, 34);
        PX.drawCarabao(ctx, 34, 64, t, 1);
        ctx.drawImage(TOIL_PLOT || (TOIL_PLOT = PX.makePlot(86)), 70, 50);   // built once
        // Tatay Ramon bent over the plot, sweating
        const f = Math.floor(t / 520) % 2;
        spr(ctx, f ? TATAY.plantB : TATAY.plantA, 96, 66);
        const drop = (t / 40) % 10;
        R(ctx, 109, 56 + drop, 1, 2, '#7cc4f0');
        R(ctx, 108, 57 + ((drop + 5) % 10), 1, 1, '#7cc4f0');
      }
    },

    enkomyenda: {
      caption: 'DEKADA 1570: ENKOMYENDA',
      alt: 'Isang kautusan ng Hari na may pulang selyo. Binabakuran ang lupang dating sama-samang sinasaka ng barangay habang nakatingin ang mga magsasaka.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 44);
        R(ctx, 0, 36, W, 8, C.hillNear);
        ground(ctx, 44, C.grass, C.grassTop);
        fieldRows(ctx, 50, 72, '#86c766', '#4f9e3c');
        // barangay huts
        ctx.drawImage(A.hut, 2, 18, 28, 28); ctx.drawImage(A.hut, 26, 22, 24, 24);
        // new fence cutting across the land + colonial banner
        for (let x = 60; x < W; x += 7) { R(ctx, x, 40, 2, 14, '#6b4428'); }
        R(ctx, 60, 43, W - 60, 1, '#8a5c33'); R(ctx, 60, 49, W - 60, 1, '#8a5c33');
        R(ctx, 66, 14, 1, 30, '#4e2f1b');
        const wave = Math.floor(t / 300) % 2;
        R(ctx, 67, 14 + wave, 14, 3, '#b8282d'); R(ctx, 67, 17 + wave, 14, 3, '#f2c230'); R(ctx, 67, 20 + wave, 14, 3, '#b8282d');
        // royal decree
        R(ctx, 96, 4, 58, 3, '#c9b88e'); R(ctx, 96, 47, 58, 3, '#c9b88e');
        R(ctx, 98, 6, 54, 42, C.ink); R(ctx, 99, 7, 52, 40, '#fff6dc');
        centered(ctx, 'ENKOMYENDA', 125, 10, '#7a1f1f');
        for (let y = 19; y < 38; y += 4) R(ctx, 103, y, 44 - (y % 8 ? 8 : 0), 1, '#c9b88e');
        PX.blob(ctx, 140, 40, 4, '#a3262a', 1); R(ctx, 139, 39, 2, 2, '#e06a6a');
        centered(ctx, '1570S', 112, 39, C.ink);
        // farmers watching
        spr(ctx, TATAY.stand, 32, 70); spr(ctx, V[2].stand, 44, 70); spr(ctx, V[3].stand, 18, 70);
      }
    },

    asyenda: {
      caption: 'ASYENDA AT SISTEMANG KASAMA',
      alt: 'Malawak na asyenda ng tabako at tubo. Nakayuko ang mga kasamá sa pagtatanim habang ang may-ari, sa ilalim ng payong, ang kumukuha ng malaking bahagi ng ani.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 30);
        ctx.drawImage(A.cane, 0, 0, 300, 46, 0, 8, 160, 26);
        ground(ctx, 34, '#8a6136', '#a3773f');
        // tobacco rows
        for (let y = 38; y < 56; y += 9) {
          for (let x = 4 + (y % 2) * 6; x < 92; x += 12) {
            R(ctx, x + 2, y, 1, 6, '#3f7d2f');
            R(ctx, x, y + 1, 2, 3, '#62a842'); R(ctx, x + 3, y, 3, 4, '#62a842'); R(ctx, x + 1, y + 3, 4, 2, '#4f9a3c');
          }
        }
        // sign
        R(ctx, 104, 16, 1, 18, '#6b4428'); R(ctx, 146, 16, 1, 18, '#6b4428');
        placard(ctx, 125, 12, 12, 'ASYENDA', '#7a1f1f', '#e3b56e');
        // kasamá at work
        const f = Math.floor(t / 520) % 2;
        spr(ctx, f ? V[0].plantB : V[0].plantA, 8, 70);
        spr(ctx, f ? TATAY.plantA : TATAY.plantB, 30, 70);
        spr(ctx, f ? V[3].plantB : V[3].plantA, 52, 70);
        sack(ctx, 74, 70);
        // landowner under a parasol, with most of the harvest
        spr(ctx, V[1].standL, 136, 70);
        PX.line(ctx, 144, 49, 144, 60, '#6b4428');
        R(ctx, 136, 47, 17, 2, '#e06a6a'); R(ctx, 138, 46, 13, 1, '#e06a6a'); R(ctx, 141, 45, 7, 1, '#c84a3a');
        [[104, 70], [113, 70], [122, 70], [108, 62], [117, 62]].forEach(function (s) { sack(ctx, s[0], s[1]); });
        PX.line(ctx, 84, 56, 98, 56, C.ink); R(ctx, 96, 54, 1, 5, C.ink); R(ctx, 97, 55, 1, 3, C.ink);
        centered(ctx, 'UPA', 91, 48, '#a3262a');
      }
    },

    revolution: {
      caption: '1896: REBOLUSYON',
      alt: 'Mga magsasaka at mamamayan na nakataas ang kamay, pinupunit ang kanilang sedula, sa ilalim ng pulang bandila na may araw at letrang K.',
      draw: function (ctx, t) {
        sky(ctx, ['#f2a950', '#f4b860', '#f6c873', '#f8d78a'], 46);
        PX.blob(ctx, 130, 40, 16, '#fde89c', 2);
        R(ctx, 0, 40, W, 6, '#c9a45e');
        ground(ctx, 46, '#a3773f', '#b88a4c');
        // flag
        R(ctx, 30, 6, 1, 40, '#4e2f1b');
        const wave = Math.floor(t / 280) % 2;
        R(ctx, 31, 6 + wave, 26, 14, '#b8282d');
        PX.blob(ctx, 38, 13 + wave, 3, '#ffffff', 1);
        text(ctx, 'K', 47, 11 + wave, '#ffffff');
        // crowd, arms up with torn cedulas
        [[4, 0], [18, 1], [40, 2], [56, 3], [70, 0], [86, 1], [100, 2], [116, 3], [132, 1]].forEach(function (p, i) {
          const set = i === 4 ? TATAY : V[p[1]];
          const bob = (Math.floor(t / 260) + i) % 2;
          spr(ctx, set.front, p[0], 70 - bob);
          R(ctx, p[0] + 2, 52 - bob, 1, 4, '#a8693f'); R(ctx, p[0] + 1, 50 - bob, 3, 2, '#ffffff');
        });
        // flying paper pieces
        for (let i = 0; i < 10; i++) {
          const x = (i * 17 + t * 0.02) % W, y = 10 + ((i * 13 + t * 0.015) % 34);
          R(ctx, x, y, 2, 1, '#ffffff');
        }
        centered(ctx, '1896', 120, 8, '#7a1f1f');
      }
    },

    'us-era': {
      caption: 'PANAHON NG AMERIKANO: LUMAWAK ANG ASYENDA',
      alt: 'Isang malaking sentral ng asukal na umuusok. Pasan ng mga magsasaka ang tubo, habang ang mga sako ay ikinakarga sa barko para i-export.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        // sea + ship
        R(ctx, 112, 34, 48, 10, '#5d9fd0');
        for (let x = 112; x < W; x += 6) R(ctx, x + (Math.floor(t / 300) % 2) * 2, 37, 3, 1, '#8cc1e6');
        R(ctx, 120, 26, 36, 8, '#3d3d48'); R(ctx, 124, 22, 22, 4, '#efe4c8'); R(ctx, 140, 16, 3, 6, '#a3262a');
        R(ctx, 124, 30, 28, 1, '#5a5a66');
        // sugar central
        R(ctx, 20, 18, 60, 24, '#b9a98a'); R(ctx, 20, 18, 60, 2, '#8f8068');
        for (let x = 26; x < 76; x += 10) R(ctx, x, 24, 5, 6, '#4b3a33');
        R(ctx, 64, 0, 6, 20, '#8f5a44');
        for (let i = 0; i < 4; i++) puff(ctx, 68 + i * 6 + ((t / 120) % 6), 2 - i, 3 + i, 'rgba(110,110,120,.6)');
        R(ctx, 30, 6, 30, 10, C.ink); R(ctx, 31, 7, 28, 8, '#fff6dc');
        centered(ctx, 'CENTRAL', 45, 8, '#3d4f66');
        ground(ctx, 42, '#c9a46a', '#d9b77c');
        // cane field + farmers carrying cane
        ctx.drawImage(A.cane, 0, 0, 100, 46, 0, 40, 30, 20);
        const k = (t * 0.02) % 30;
        [0, 1].forEach(function (i) {
          const x = 30 + i * 22 + k;
          spr(ctx, (Math.floor(t / 220) + i) % 2 ? V[i * 2].walkA : V[i * 2].walkB, x, 70);
          R(ctx, x + 2, 49, 14, 2, '#7aa84a'); R(ctx, x + 1, 48, 2, 1, '#8fcf63');
        });
        // export crates
        [[96, 70], [104, 70], [100, 63]].forEach(function (c) { R(ctx, c[0], c[1] - 7, 8, 7, '#b88a4c'); R(ctx, c[0], c[1] - 4, 8, 1, '#8a5c33'); });
        placard(ctx, 128, 50, 70, 'EXPORT', C.ink, '#e3b56e');
      }
    },

    pd27: {
      caption: 'BAYAD NANG HULUGAN',
      alt: 'Inaabot ni Tatay Ramon ang sako ng palay sa panginoong maylupa na may hawak na listahan ng utang.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        R(ctx, 0, 34, W, 8, C.hillNear);
        ground(ctx, 42, C.grass, C.grassTop);
        fieldRows(ctx, 46, 58, '#86c766', '#4f9e3c');
        // sign
        R(ctx, 114, 18, 1, 14, '#6b4428');
        placard(ctx, 118, 8, 8, 'HULOG', '#8c1f1f', '#e3b56e');
        // landlord behind his table
        spr(ctx, V[1].standL, 120, 66);
        R(ctx, 98, 52, 40, 3, '#6b4428'); R(ctx, 100, 55, 2, 11, '#4e2f1b'); R(ctx, 134, 55, 2, 11, '#4e2f1b');
        R(ctx, 104, 48, 14, 4, '#fff6dc'); R(ctx, 110, 48, 1, 4, '#c9b88e');
        for (let i = 0; i < 3; i++) R(ctx, 105, 49 + i, 4, 1, '#8a6136');
        R(ctx, 124, 49, 4, 3, '#e5952a'); R(ctx, 125, 48, 3, 1, '#f8cf55');
        // tatay hands over a sack
        spr(ctx, TATAY.stand, 54, 66);
        const lift = Math.floor(t / 600) % 2;
        sack(ctx, 70, 60 - lift);
        sack(ctx, 40, 66); sack(ctx, 30, 66);
        PX.line(ctx, 82, 40, 94, 40, C.ink); R(ctx, 92, 38, 1, 5, C.ink); R(ctx, 93, 39, 1, 3, C.ink);
      }
    },

    'mendiola-march': {
      caption: 'MENDIOLA - ENERO 22, 1987',
      alt: 'Libu-libong magsasaka ang nagmamartsa sa tulay ng Mendiola, may hawak na plakard na LUPA at HUSTISYA.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa', '#e9f5fb'], 44);
        for (let x = 0; x < W; x += 14) R(ctx, x, 22 + Math.round(PX.hash(x) * 10), 12, 24, '#c9d6e0');
        // gate at the end of the road
        R(ctx, 136, 14, 24, 2, '#2a2a33');
        for (let x = 137; x < W; x += 3) { R(ctx, x, 14, 1, 34, '#2a2a33'); R(ctx, x, 12, 1, 2, '#2a2a33'); }
        lampPost(ctx, 30, 18, 48, false); lampPost(ctx, 104, 18, 48, false);
        railing(ctx, 41, '#6a6a76', '#8a8a96');
        R(ctx, 0, 48, W, H - 48, '#8a8a92');
        for (let x = 0; x < W; x += 16) R(ctx, x, 66, 8, 1, '#d9d9de');
        // the march
        const shift = (t * 0.006) % 18;
        const signs = ['LUPA', null, 'HUSTISYA', null, 'LUPA', null, 'LUPA', null];
        for (let row = 0; row < 2; row++) {
          for (let i = -1; i < 8; i++) {
            const x = i * 18 + shift + (row ? 9 : 0);
            const feet = row ? 64 : 56;
            const v = (i + 8 + row) % 4;
            const f = (Math.floor(t / 220) + i + row) % 2;
            const set = (i + row) % 3 === 0 ? TATAY : V[v];
            spr(ctx, f ? set.walkA : set.walkB, x, feet);
            const s = signs[(i + 8 + row * 3) % 8];
            if (s && row === 0) placard(ctx, x + 10, feet - 31, feet - 10, s);
          }
        }
      }
    },

    'mendiola-after': {
      caption: '13 ANG NAPATAY - HUSTISYA',
      alt: 'Takipsilim sa Mendiola. Nakakalat sa kalsada ang mga naiwang plakard, salakot at tsinelas. Labintatlong kandila ang nakasindi bilang alaala.',
      draw: function (ctx, t) {
        sky(ctx, ['#241a16', '#33241d', '#4a3024', '#653d2a', '#7d4c30'], 46);
        for (let x = 0; x < W; x += 14) R(ctx, x, 22 + Math.round(PX.hash(x) * 10), 12, 24, '#2e221c');
        R(ctx, 136, 14, 24, 2, '#17110e');
        for (let x = 137; x < W; x += 3) R(ctx, x, 14, 1, 34, '#17110e');
        lampPost(ctx, 30, 18, 48, true); lampPost(ctx, 104, 18, 48, true);
        railing(ctx, 41, '#2a211c', '#40332b');
        R(ctx, 0, 48, W, H - 48, '#48403a');
        for (let x = 0; x < W; x += 16) R(ctx, x, 66, 8, 1, '#6a6670');
        // what was left behind
        R(ctx, 10, 60, 22, 7, C.ink); R(ctx, 11, 61, 20, 5, '#d9cfb8'); text(ctx, 'LUPA', 13, 61, '#7a1f1f');
        R(ctx, 112, 62, 1, 6, '#6b4428');
        R(ctx, 118, 57, 38, 9, C.ink); R(ctx, 119, 58, 36, 7, '#d9cfb8'); text(ctx, 'HUSTISYA', 121, 59, '#7a1f1f');
        hat(ctx, 40, 66); hat(ctx, 96, 69); hat(ctx, 70, 70);
        slipper(ctx, 52, 68, '#3578b5'); slipper(ctx, 84, 63, '#9e3529'); slipper(ctx, 22, 69, '#5a4a3a');
        // 13 candles
        for (let i = 0; i < 13; i++) {
          const x = 22 + i * 7;
          candle(ctx, x, 56, t, i);
          if (i % 2 === 0) flower(ctx, x + 3, 58, i % 4 ? '#ffffff' : '#e06a6a');
        }
      }
    },

    carp: {
      caption: 'CARP: MAY MGA BUTAS',
      alt: 'Isang malaking dokumento ng CARP na puno ng butas. Sa likod nito ay ang malaking asyenda; sa ibaba, mga magsasakang nakatingala.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 44);
        ctx.drawImage(A.cane, 0, 0, 160, 40, 92, 26, 68, 18);
        ctx.drawImage(A.hacienda, 96, 6, 65, 40);
        ground(ctx, 46, C.grass, C.grassTop);
        // the document
        const bob = Math.floor(t / 700) % 2;
        R(ctx, 28, 3 + bob, 58, 56, C.ink);
        R(ctx, 29, 4 + bob, 56, 54, '#fff6dc');
        R(ctx, 29, 4 + bob, 56, 9, '#a3262a');
        centered(ctx, 'CARP', 57, 6 + bob, '#ffffff');
        centered(ctx, 'RA 6657', 57, 15 + bob, C.ink);
        for (let y = 23; y < 56; y += 4) R(ctx, 33, y + bob, 48 - (y % 8 ? 10 : 0), 1, '#c9b88e');
        // the holes (loopholes)
        [[42, 30, 5], [68, 38, 6], [48, 49, 4]].forEach(function (h) {
          PX.blob(ctx, h[0], h[1] + bob, h[2] + 1, '#c9b88e', 1);
          PX.blob(ctx, h[0], h[1] + bob, h[2], '#2a1a14', 1);
        });
        text(ctx, 'SDO', 52, 27 + bob, '#a3262a');
        text(ctx, 'EXEMPT', 33, 40 + bob, '#a3262a');
        // farmers looking up
        spr(ctx, V[2].stand, 4, 70); spr(ctx, TATAY.stand, 12, 70);
        spr(ctx, V[3].standL, 88, 70);
      }
    },

    'luisita-strike': {
      caption: 'HACIENDA LUISITA - NOB 16, 2004',
      alt: 'Mga manggagawang-bukid ng Hacienda Luisita, nakapiket sa harap ng saradong tarangkahan, may hawak na bandilang WELGA.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        ctx.drawImage(A.cane, 0, 18);
        ctx.drawImage(A.cane, 150, 18);
        // gate
        R(ctx, 100, 12, 6, 48, '#efe4c8'); R(ctx, 148, 12, 6, 48, '#efe4c8');
        R(ctx, 98, 4, 58, 10, C.ink); R(ctx, 99, 5, 56, 8, '#e3b56e');
        centered(ctx, 'HACIENDA', 127, 6, '#7a1f1f');
        for (let x = 108; x < 148; x += 4) R(ctx, x, 16, 1, 44, '#3d3d48');
        R(ctx, 106, 30, 42, 1, '#3d3d48');
        ground(ctx, 58, '#c9a46a', '#d9b77c');
        // picket line
        const sway = Math.floor(t / 500) % 2;
        R(ctx, 24, 30 + sway, 1, 30, '#6b4428'); R(ctx, 72, 30 + sway, 1, 30, '#6b4428');
        R(ctx, 24, 30 + sway, 49, 11, C.ink); R(ctx, 25, 31 + sway, 47, 9, '#a3262a');
        centered(ctx, 'WELGA', 49, 33 + sway, '#ffffff');
        [[8, 0], [20, 1], [36, 2], [52, 3], [68, 0], [84, 1]].forEach(function (p, i) {
          const set = i === 2 ? TATAY : V[p[1]];
          spr(ctx, (i % 2) ? set.front : set.stand, p[0], 68);
        });
      }
    },

    'luisita-after': {
      caption: '7 ANG NAPATAY - HUSTISYA',
      alt: 'Makapal na usok ng tear gas sa harap ng tarangkahan ng asyenda. Isang trak na may water cannon. Ang bandilang WELGA ay nakahandusay sa lupa, katabi ang pitong kandila.',
      draw: function (ctx, t) {
        sky(ctx, ['#8a8f96', '#979ca2', '#a6abb0'], 40);
        ctx.globalAlpha = 0.55; ctx.drawImage(A.cane, 0, 18); ctx.drawImage(A.cane, 150, 18); ctx.globalAlpha = 1;
        R(ctx, 100, 12, 6, 48, '#c9c3b2'); R(ctx, 148, 12, 6, 48, '#c9c3b2');
        R(ctx, 98, 4, 58, 10, C.ink); R(ctx, 99, 5, 56, 8, '#b89a6a');
        centered(ctx, 'HACIENDA', 127, 6, '#5a1a1a');
        for (let x = 108; x < 148; x += 4) R(ctx, x, 16, 1, 44, '#2a2a33');
        ground(ctx, 58, '#a89474', '#b8a484');
        // water-cannon truck
        R(ctx, 112, 40, 30, 14, '#3d4a5a'); R(ctx, 142, 44, 12, 10, '#33404e'); R(ctx, 144, 45, 6, 4, '#8aa0b4');
        R(ctx, 116, 54, 6, 5, '#17110e'); R(ctx, 134, 54, 6, 5, '#17110e'); R(ctx, 146, 54, 6, 5, '#17110e');
        R(ctx, 108, 38, 8, 2, '#3d4a5a');
        for (let i = 0; i < 9; i++) {
          const k = (i + t / 70) % 9;
          R(ctx, 106 - k * 4, 38 + k * k * 0.25, 2, 1, '#bfe2f5');
        }
        // fallen banner, 7 candles
        R(ctx, 18, 63, 49, 6, C.ink); R(ctx, 19, 64, 47, 4, '#7a1f1f');
        text(ctx, 'WELGA', 34, 64, '#d9cfb8');
        hat(ctx, 72, 66); slipper(ctx, 84, 68, '#3578b5'); slipper(ctx, 10, 69, '#9e3529');
        for (let i = 0; i < 7; i++) {
          candle(ctx, 22 + i * 10, 60, t, i);
          flower(ctx, 26 + i * 10, 61, i % 2 ? '#ffffff' : '#e06a6a');
        }
        // drifting tear gas
        for (let i = 0; i < 6; i++) {
          const x = ((i * 31 + t * 0.01) % 190) - 15;
          puff(ctx, x, 34 + (i % 3) * 7, 7 + (i % 2) * 2, 'rgba(230,233,236,.55)');
        }
      }
    },

    court: {
      caption: '2012: IPAMAHAGI ANG LUPA',
      alt: 'Mga magsasakang naghihintay sa harap ng gusali ng Korte Suprema, may hawak na plakard na LUPA at IPAMAHAGI.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 44);
        // building
        for (let r = 0; r < 10; r++) R(ctx, 70 - r * 4, 4 + r, 20 + r * 8, 1, '#e9e3d4');
        R(ctx, 32, 14, 96, 3, '#d4ccba');
        centered(ctx, 'KORTE SUPREMA', 80, 17, C.ink);
        R(ctx, 30, 23, 100, 2, '#d4ccba');
        for (let x = 36; x < 128; x += 13) { R(ctx, x, 25, 5, 24, '#f6f2e8'); R(ctx, x + 4, 25, 1, 24, '#d4ccba'); }
        R(ctx, 30, 25, 100, 24, 'rgba(0,0,0,.05)');
        for (let i = 0; i < 3; i++) R(ctx, 24 - i * 3, 49 + i * 3, 112 + i * 6, 3, i % 2 ? '#d4ccba' : '#e9e3d4');
        ground(ctx, 58, '#b9b3a4', '#c9c3b4');
        // farmers waiting
        const wait = Math.floor(t / 900) % 2;
        spr(ctx, TATAY.front, 18, 70); spr(ctx, V[0].stand, 34, 70); spr(ctx, V[3].front, 120, 70); spr(ctx, V[2].standL, 136, 70);
        placard(ctx, 44, 37 + wait, 60, 'LUPA');
        placard(ctx, 128, 38, 60, 'IPAMAHAGI');
      }
    },

    carper: {
      caption: 'TAPOS NA ANG PALUGIT',
      alt: 'Isang kalendaryong may malaking ekis sa Hunyo 30, 2014. Sa tabi, mga lupang may tandang pananong at isang magsasakang may hawak na papel ng utang.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        ground(ctx, 40, C.grass, C.grassTop);
        fieldRows(ctx, 44, 72, '#86c766', null);
        // calendar
        R(ctx, 8, 4, 48, 52, C.ink); R(ctx, 9, 5, 46, 50, '#fff6dc'); R(ctx, 9, 5, 46, 9, '#a3262a');
        centered(ctx, 'HUNYO', 32, 7, '#ffffff');
        PX.drawText(ctx, '30', 21, 19, C.ink, 2);
        centered(ctx, '2014', 32, 44, C.ink);
        PX.line(ctx, 12, 16, 52, 52, '#a3262a'); PX.line(ctx, 13, 16, 53, 52, '#a3262a');
        PX.line(ctx, 52, 16, 12, 52, '#a3262a'); PX.line(ctx, 53, 16, 13, 52, '#a3262a');
        // unresolved plots
        [[74, 50], [104, 54], [136, 48], [90, 66], [124, 66]].forEach(function (p, i) {
          R(ctx, p[0], p[1] - 10, 1, 10, '#6b4428');
          R(ctx, p[0] - 3, p[1] - 16, 7, 7, C.ink); R(ctx, p[0] - 2, p[1] - 15, 5, 5, '#fff6dc');
          if (Math.floor(t / 500 + i) % 3) text(ctx, '?', p[0] - 1, p[1] - 15, '#a3262a');
        });
        // farmer with debt notice
        spr(ctx, TATAY.front, 60, 70);
        R(ctx, 54, 52, 12, 9, C.ink); R(ctx, 55, 53, 10, 7, '#ffffff'); R(ctx, 56, 55, 8, 1, '#c9b88e'); R(ctx, 56, 57, 6, 1, '#c9b88e');
        placard(ctx, 32, 60, 60, 'UTANG');
      }
    },

    tenant: {
      caption: 'ANG ANI AY HINDI SA KANILA',
      alt: 'Halos lahat ng sako ng ani ay napupunta sa panginoong maylupa bilang upa; isang sako lang ang naiiwan sa pamilya ng magsasaka.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        R(ctx, 0, 34, W, 6, C.hillNear);
        ground(ctx, 40, '#c9b25a', '#d9c26a');
        for (let x = 2; x < W; x += 5) R(ctx, x, 41, 1, 3, '#a8923a');
        // farmer family + one sack
        spr(ctx, V[3].stand, 4, 68); spr(ctx, TATAY.stand, 18, 68);
        sack(ctx, 36, 68);
        R(ctx, 30, 66, 4, 2, '#f3eadb');
        // landlord + pile
        spr(ctx, V[1].standL, 140, 68);
        [[104, 68], [113, 68], [122, 68], [108, 60], [117, 60], [112, 52]].forEach(function (s) { sack(ctx, s[0], s[1]); });
        // sacks travelling as rent
        PX.line(ctx, 46, 34, 96, 34, C.ink); R(ctx, 94, 32, 1, 5, C.ink); R(ctx, 95, 33, 1, 3, C.ink);
        centered(ctx, 'UPA', 71, 25, '#a3262a');
        const k = (t * 0.03) % 50;
        sack(ctx, 46 + k, 46);
      }
    },

    conversion: {
      caption: 'PINAALIS SA SARILING SAKAHAN',
      alt: 'Isang bulldozer ang dumudurog sa palayan para gawing subdivision. Isang pamilyang magsasaka ang nakatayo sa gilid, bitbit ang kanilang gamit. May nakatirik na plakard na HUSTISYA at isang kandila.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 40);
        // subdivision houses
        for (let i = 0; i < 4; i++) {
          const x = 96 + i * 16;
          R(ctx, x, 26, 14, 14, ['#f2d7d0', '#d7e6f2', '#e9e3c4', '#d9efd2'][i]);
          for (let r = 0; r < 5; r++) R(ctx, x - 1 + r, 21 + r, 16 - r * 2, 1, '#a8442f');
          R(ctx, x + 5, 33, 4, 7, '#6b4428');
        }
        R(ctx, 100, 8, 1, 10, '#6b4428'); R(ctx, 152, 8, 1, 10, '#6b4428');
        R(ctx, 98, 4, 57, 9, C.ink); R(ctx, 99, 5, 55, 7, '#ffffff');
        centered(ctx, 'SUBDIVISION', 127, 6, '#3d4f66');
        ground(ctx, 40, '#8a6136', '#a3773f');
        // field: crushed on the right, still green on the left
        for (let x = 2; x < 70; x += 6) { R(ctx, x, 44, 1, 3, '#4f9e3c'); R(ctx, x - 1, 43, 1, 1, '#8fd36a'); }
        for (let x = 74; x < W; x += 7) R(ctx, x, 46, 3, 1, '#6b4727');
        // bulldozer
        const bx = 76 + Math.round(Math.sin(t / 900) * 3);
        R(ctx, bx + 6, 40, 26, 12, '#f2b630'); R(ctx, bx + 14, 32, 12, 9, '#f2b630'); R(ctx, bx + 16, 34, 8, 5, '#9fc6de');
        R(ctx, bx + 4, 52, 30, 6, '#2a2a33'); for (let x = bx + 6; x < bx + 32; x += 4) R(ctx, x, 54, 2, 2, '#5a5a66');
        R(ctx, bx - 2, 42, 4, 14, '#8a8f96'); R(ctx, bx + 2, 46, 4, 2, '#5a5a66');
        R(ctx, bx + 26, 28, 2, 5, '#3d3d48');
        // family on the side, belongings bundled
        spr(ctx, TATAY.stand, 0, 68); spr(ctx, V[3].stand, 13, 68);
        R(ctx, 15, 44, 10, 5, '#c84a3a'); R(ctx, 17, 43, 6, 1, '#9e3529');
        // memorial
        placard(ctx, 52, 50, 68, 'HUSTISYA');
        candle(ctx, 60, 68, t, 1);
        flower(ctx, 46, 69, '#ffffff');
      }
    },

    // what farmland is turned into: three panels side by side
    landuse: {
      caption: 'HINDI LANG SUBDIVISION',
      alt: 'Tatlong larawan ng dating sakahan: isang minahang hukay na may excavator, isang tambak ng basura na may trak, at isang gusaling data center na may bakod.',
      draw: function (ctx, t) {
        R(ctx, 0, 0, W, H, C.ink);
        const blink = Math.floor(t / 300);
        // panel 1: minahan (open pit + excavator)
        sky(ctx, ['#cbe5f6', '#d6ebf8'], 24);
        R(ctx, 0, 24, 52, 48, '#8a6136');
        for (let s = 0; s < 4; s++) R(ctx, 6 + s * 5, 34 + s * 7, 40 - s * 10, 7, ['#7a5430', '#6b4727', '#5e3f22', '#4d3319'][s]);
        R(ctx, 30, 28, 14, 7, '#f2b630'); R(ctx, 33, 25, 7, 4, '#f2b630'); R(ctx, 35, 26, 4, 2, '#9fc6de');
        R(ctx, 28, 35, 18, 3, '#2a2a33'); R(ctx, 22, 24, 9, 2, '#f2b630'); R(ctx, 20, 25, 2, 7, '#f2b630'); R(ctx, 18, 31, 5, 3, '#5a5a66');
        if (blink % 2) puff(ctx, 14, 40, 3, 'rgba(255,246,220,.5)');
        // panel 2: basura (dump mound + truck)
        R(ctx, 52, 0, 2, H, C.ink);
        R(ctx, 54, 0, 52, 30, '#cfd6c8'); R(ctx, 54, 30, 52, 42, '#8a7a5c');
        for (let r = 0; r < 12; r++) R(ctx, 62 + r * 1.5, 52 - r * 2, 34 - r * 3, 2, r % 2 ? '#6d6a5e' : '#7d7868');
        for (let i = 0; i < 22; i++) R(ctx, 60 + PX.hash(i * 1.7) * 38, 30 + PX.hash(i * 2.3) * 24, 2, 1, ['#c84a3a', '#4a9ad8', '#f8cf55', '#ffffff', '#5aa36a'][i % 5]);
        R(ctx, 56, 56, 14, 7, '#3d6b4f'); R(ctx, 70, 58, 6, 5, '#3d6b4f'); R(ctx, 71, 59, 3, 2, '#9fc6de');
        R(ctx, 58, 63, 3, 3, '#2a2a33'); R(ctx, 70, 63, 3, 3, '#2a2a33');
        for (let i = 0; i < 4; i++) R(ctx, 70 + i * 7 + (blink + i) % 3, 20 + (i * 5 + blink) % 6, 1, 1, '#2a2a33');
        // panel 3: data center (windowless block + blinking lights + fence)
        R(ctx, 106, 0, 2, H, C.ink);
        R(ctx, 108, 0, 52, 46, '#cbe5f6'); R(ctx, 108, 46, 52, 26, '#8a6136');
        R(ctx, 112, 20, 44, 26, '#bfc6cc'); R(ctx, 112, 20, 44, 2, '#8a8f96');
        for (let x = 116; x < 152; x += 8) R(ctx, x, 16, 5, 4, '#8a8f96');
        for (let i = 0; i < 12; i++) {
          const on = PX.hash(i * 5.1 + blink) > 0.4;
          R(ctx, 116 + (i % 6) * 6, 26 + Math.floor(i / 6) * 8, 3, 2, on ? (i % 3 ? '#5aa36a' : '#4a9ad8') : '#5a5a66');
        }
        for (let x = 108; x < W; x += 4) R(ctx, x, 44, 1, 8, '#5a5a66');
        R(ctx, 108, 45, 52, 1, '#5a5a66'); R(ctx, 108, 49, 52, 1, '#5a5a66');
        // labels
        // labels along the bottom (the caption sits top-left)
        placard(ctx, 26, 62, 62, 'MINAHAN');
        placard(ctx, 80, 62, 62, 'BASURA');
        placard(ctx, 134, 62, 62, 'DATA CENTER');
      }
    },

    // Pax Silica: a planned data center hub beside farmland in Capas, Tarlac
    datacenter: {
      caption: 'PAX SILICA, CAPAS, TARLAC',
      alt: 'Isang malaking gusaling data center na may kumikislap na ilaw at mahabang bakod na may karatulang PAX SILICA HUB. Sa kaliwa, isang palayan at isang pamilyang magsasaka na may hawak na plakard na LUPA AY BUHAY.',
      draw: function (ctx, t) {
        sky(ctx, ['#cbe5f6', '#d6ebf8', '#e0f0fa'], 38);
        // hills behind
        for (let x = 0; x < W; x++) R(ctx, x, 30 - Math.round(4 * Math.sin(x / 14)), 1, 10, '#9fc79a');
        ground(ctx, 38, '#8a6136', '#a3773f');
        // rice field on the left
        fieldRows(ctx, 40, 70, '#7a5430', '#5aa36a');
        // the hub
        R(ctx, 70, 12, 86, 30, '#d7dbe0'); R(ctx, 70, 12, 86, 2, '#8a8f96'); R(ctx, 70, 40, 86, 2, '#8a8f96');
        for (let x = 74; x < 152; x += 10) { R(ctx, x, 7, 7, 5, '#8a8f96'); R(ctx, x + 1, 8, 5, 1, '#5a5a66'); }
        const blink = Math.floor(t / 260);
        for (let i = 0; i < 24; i++) {
          const on = PX.hash(i * 3.3 + blink) > 0.45;
          R(ctx, 76 + (i % 12) * 6, 18 + Math.floor(i / 12) * 10, 3, 2, on ? (i % 4 ? '#5aa36a' : '#4a9ad8') : '#9aa0a8');
        }
        // fence across the land
        for (let x = 64; x < W; x += 4) R(ctx, x, 40, 1, 14, '#5a5a66');
        R(ctx, 64, 41, W - 64, 1, '#5a5a66'); R(ctx, 64, 47, W - 64, 1, '#5a5a66'); R(ctx, 64, 53, W - 64, 1, '#5a5a66');
        placard(ctx, 116, 44, 44, 'PAX SILICA HUB', '#3d4f66', '#ffffff');
        // family outside the fence, their sign held up above them
        spr(ctx, TATAY.stand, 10, 68); spr(ctx, V[1].stand, 24, 68);
        placard(ctx, 38, 30, 68, 'LUPA AY BUHAY');
      }
    }
  };

  window.StoryScenes = { W: W, H: H, get: function (id) { return SCENES[id] || null; } };
})();
