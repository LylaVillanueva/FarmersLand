/* =========================================================
   SECTION DECOR: pixel backgrounds for the advocacy page
   green sections -> a Philippine field (palay, mais, gumamela,
                    sampaguita, saging, pinya, paru-paro)
   blue sections  -> open sky over the land: clouds, maya birds,
                    a saranggola, and yamang lupa (mountains, rice
                    terraces, coconut trees, bahay kubo)
   Decorations stay in the empty side spaces and along the bottom
   so they never sit behind text.
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX;
  const S = 4; // css px per art pixel
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function label(ctx, text, x, y, boxes, w) {
    const tw = PX.textWidth(text);
    const lx = Math.round(Math.max(1, Math.min(w - tw - 3, x - tw / 2))), ly = Math.round(y);
    if (boxes.some(function (b) { return lx < b[0] + b[2] + 6 && lx + tw + 6 > b[0] && ly < b[1] + 12 && ly + 12 > b[1]; })) return;
    boxes.push([lx, ly, tw]);
    R(ctx, lx - 2, ly - 2, tw + 4, 9, 'rgba(42,26,20,.72)');
    PX.drawText(ctx, text, lx, ly, '#fff6dc');
  }

  /* ---------- sprites ---------- */
  const BUTTERFLY = [
    { map: ['w.w', 'wbw', '.b.'], colors: { w: '#f8cf55', b: '#2a1a14' } },
    { map: ['...', 'wbw', '.b.'], colors: { w: '#f8cf55', b: '#2a1a14' } }
  ];
  let sprites = null;
  function buildSprites() {
    if (sprites) return sprites;
    sprites = { fly: [], flyB: [] };
    BUTTERFLY.forEach(function (f) {
      sprites.fly.push(PX.spriteFromMap(f.map, f.colors));
      sprites.flyB.push(PX.spriteFromMap(f.map, { w: '#f2f2f2', b: '#2a1a14' }));
    });
    return sprites;
  }

  /* ---------- field plants (x = centre, y = ground line) ---------- */
  function mound(ctx, x, y, w) { R(ctx, x - w / 2, y - 1, w, 2, '#5fa646'); R(ctx, x - w / 2 + 2, y - 2, w - 4, 1, '#6bb64e'); }
  const PLANTS = {
    PALAY: function (ctx, x, y, r) {
      mound(ctx, x, y, 14);
      for (let i = -2; i <= 2; i++) {
        const sx = x + i * 2, top = y - 10 - Math.round(r() * 5);
        R(ctx, sx, top, 1, y - top, i % 2 ? '#5fae48' : '#4f9e3c');
        const d = i < 0 ? -1 : 1;
        R(ctx, sx + d, top + 1, 1, 1, '#e8c45a'); R(ctx, sx + d * 2, top + 2, 1, 1, '#e8c45a');
        R(ctx, sx + d * 2, top + 3, 1, 1, '#c9a03a'); R(ctx, sx + d, top, 1, 1, '#f2d77a');
      }
      return 16;
    },
    MAIS: function (ctx, x, y) {
      mound(ctx, x, y, 12);
      R(ctx, x, y - 26, 2, 26, '#5fae48'); R(ctx, x + 1, y - 26, 1, 26, '#4f9e3c');
      for (let k = 0; k < 4; k++) {
        const ly = y - 6 - k * 5, d = k % 2 ? -1 : 1;
        for (let j = 1; j <= 5; j++) R(ctx, x + (d > 0 ? 1 + j : -j), ly - (j > 3 ? 1 : 0) + (j > 4 ? 2 : 0), 1, 1, '#6fbf52');
      }
      R(ctx, x + 2, y - 17, 3, 6, '#f2cf4a'); R(ctx, x + 2, y - 17, 1, 6, '#e0b23a');
      R(ctx, x + 2, y - 12, 3, 2, '#8fcf63'); R(ctx, x + 3, y - 19, 1, 2, '#8a5c33');
      R(ctx, x - 1, y - 29, 4, 3, '#d9b05a'); R(ctx, x, y - 30, 1, 1, '#d9b05a');
      return 28;
    },
    GUMAMELA: function (ctx, x, y, r) {
      PX.blob(ctx, x, y - 6, 6, '#3b873a', 1); PX.blob(ctx, x - 1, y - 7, 4, '#56a643', 1);
      for (let k = 0; k < 3; k++) {
        const fx = x - 4 + Math.round(r() * 8), fy = y - 10 + Math.round(r() * 5);
        R(ctx, fx - 1, fy, 3, 1, '#d8333a'); R(ctx, fx, fy - 1, 1, 3, '#d8333a');
        R(ctx, fx - 1, fy - 1, 1, 1, '#b8282d'); R(ctx, fx + 1, fy + 1, 1, 1, '#b8282d');
        R(ctx, fx, fy, 1, 1, '#f8cf55');
      }
      return 13;
    },
    SAMPAGUITA: function (ctx, x, y, r) {
      PX.blob(ctx, x, y - 5, 5, '#3b873a', 1); PX.blob(ctx, x + 1, y - 6, 3, '#56a643', 1);
      for (let k = 0; k < 5; k++) {
        const fx = x - 4 + Math.round(r() * 8), fy = y - 9 + Math.round(r() * 5);
        R(ctx, fx, fy - 1, 1, 3, '#ffffff'); R(ctx, fx - 1, fy, 3, 1, '#ffffff'); R(ctx, fx, fy, 1, 1, '#f3eadb');
      }
      return 11;
    },
    SAGING: function (ctx, x, y) {
      mound(ctx, x, y, 12);
      R(ctx, x - 1, y - 20, 3, 20, '#8fae5a'); R(ctx, x + 1, y - 20, 1, 20, '#73914a');
      [[-1, -22], [1, -24], [-1, -18], [1, -16]].forEach(function (l) {
        for (let j = 0; j < 9; j++) R(ctx, x + l[0] * (1 + j), y + l[1] - Math.round(Math.sin(j / 3) * 3) + (j > 5 ? j - 5 : 0), 1, 2, j % 3 ? '#5fae48' : '#4f9e3c');
      });
      for (let j = 0; j < 4; j++) R(ctx, x + 2, y - 15 + j * 2, 3, 2, j % 2 ? '#9ccf5a' : '#86bd48');
      R(ctx, x + 3, y - 7, 2, 3, '#8a2a4a');
      return 26;
    },
    PINYA: function (ctx, x, y) {
      mound(ctx, x, y, 10);
      R(ctx, x - 3, y - 9, 7, 8, '#e2b13c'); R(ctx, x - 2, y - 10, 5, 1, '#e2b13c'); R(ctx, x - 2, y - 1, 5, 1, '#c99a2a');
      for (let yy = y - 9; yy < y - 1; yy += 2) for (let xx = x - 3 + (yy % 4 ? 1 : 0); xx < x + 4; xx += 2) R(ctx, xx, yy, 1, 1, '#b8862a');
      [[-3, -14], [-1, -16], [1, -17], [3, -15], [0, -13]].forEach(function (l) { PX.line(ctx, x, y - 10, x + l[0], y + l[1], '#4f9e3c'); });
      return 18;
    }
  };
  const PLANT_NAMES = Object.keys(PLANTS);

  /* ---------- builders ---------- */
  function zones(sec, w) {
    const wrap = sec.querySelector('.wrap');
    const inner = wrap ? wrap.querySelector('.cards, .faq, .versus, .timeline') : null;
    const contentW = Math.min(sec.clientWidth, (inner ? inner.getBoundingClientRect().width : 820) + 48);
    const half = contentW / 2 / S, mid = w / 2;
    const head = sec.querySelector('.sec-head');
    return {
      mid: mid, half: half, side: mid - half, wide: mid - half >= 22,
      headBottom: head ? (head.getBoundingClientRect().bottom - sec.getBoundingClientRect().top) / S : 30
    };
  }

  function buildField(x, w, h, r, z) {
    const boxes = [];
    // grass texture
    for (let i = 0; i < w * h / 55; i++) {
      const gx = r() * w, gy = r() * h;
      R(x, gx, gy, 1, 2, r() < 0.5 ? '#6bb64e' : '#8fd06a');
      if (r() < 0.3) R(x, gx + 1, gy - 1, 1, 2, '#6bb64e');
    }
    // tiny wildflowers
    for (let i = 0; i < w * h / 900; i++) R(x, r() * w, r() * h, 1, 1, ['#ffffff', '#f8cf55', '#e06a6a'][Math.floor(r() * 3)]);

    function plant(px, py, withLabel, above) {
      const name = PLANT_NAMES[Math.floor(r() * PLANT_NAMES.length)];
      const tall = PLANTS[name](x, px, py, r);
    }
    // side gardens
    if (z.wide) {
      const placed = [];
      const n = Math.round(h / 26);
      for (let i = 0; i < n; i++) {
        const left = r() < 0.5;
        const px = left ? 6 + r() * (z.side - 14) : z.mid + z.half + 8 + r() * (z.side - 14);
        const py = 36 + r() * (h - 50);
        if (placed.some(function (q) { return Math.abs(q[0] - px) < 14 && Math.abs(q[1] - py) < 30; })) continue;
        placed.push([px, py]);
        plant(px, py, false, false);
      }
    }
    // a garden row along the bottom edge
    for (let px = 6 + r() * 8; px < w - 6; px += 16 + r() * 18) plant(px, h - 2, false, true);

    // butterflies (paru-paro)
    const flies = [];
    for (let i = 0; i < Math.max(3, Math.round(h / 90)); i++) {
      flies.push({ x0: r() * w, y0: 20 + r() * (h - 40), ax: 10 + r() * 25, ay: 6 + r() * 12, sp: 0.0004 + r() * 0.0005, ph: r() * 6, white: r() < 0.35 });
    }
    return function (ctx, t) {
      const sp = buildSprites();
      flies.forEach(function (f, i) {
        const fx = f.x0 + Math.sin(t * f.sp + f.ph) * f.ax, fy = f.y0 + Math.sin(t * f.sp * 1.7 + f.ph) * f.ay;
        const frame = Math.floor(t / 140 + i) % 2;
        ctx.drawImage((f.white ? sp.flyB : sp.fly)[frame], Math.round(fx), Math.round(fy));
      });
    };
  }

  function cloudShape(ctx, cx, cy, sz) {
    R(ctx, cx + sz * 0.3, cy, sz * 0.3, 3, '#ffffff');
    R(ctx, cx + sz * 0.12, cy + 3, sz * 0.7, 3, '#ffffff');
    R(ctx, cx, cy + 6, sz, 4, '#ffffff');
    R(ctx, cx + sz * 0.55, cy + 6, sz * 0.45, 4, '#f1f7fc');
    R(ctx, cx + sz * 0.06, cy + 10, sz * 0.88, 2, '#dbe9f4');
  }
  function coconut(ctx, x, y, hgt, lean) {
    for (let k = 0; k < hgt; k++) R(ctx, x + Math.round(lean * k * k / (hgt * 2)), y - k, 2, 1, k % 3 ? '#8a6136' : '#6b4428');
    const tx = x + Math.round(lean * hgt / 2), ty = y - hgt;
    [[-7, 3], [-5, -2], [0, -4], [5, -2], [7, 3], [3, 4], [-3, 4]].forEach(function (f) { PX.line(ctx, tx, ty, tx + f[0], ty + f[1], '#4f9e3c'); });
    PX.line(ctx, tx, ty - 1, tx + 6, ty - 2, '#6fbf52');
    R(ctx, tx - 1, ty + 1, 2, 2, '#6b4428'); R(ctx, tx + 1, ty + 1, 2, 2, '#5a3a22');
  }

  // blue sections: open sky over the land, clouds, maya birds, a saranggola,
  // and a strip of yamang lupa (mountains, rice terraces, coconut trees, bahay kubo)
  function buildSky(x, w, h, r, z) {
    const BANDS = ['#cbe5f6', '#d3e9f7', '#dbedf9', '#e2f1fa', '#e9f5fb', '#f0f8fc'];
    const landH = 26, skyH = h - landH;
    const bh = Math.ceil(skyH / BANDS.length);
    R(x, 0, 0, w, h, BANDS[BANDS.length - 1]);
    BANDS.forEach(function (c, i) {
      R(x, 0, i * bh, w, bh, c);
      if (i) for (let px = (i % 2) * 2; px < w; px += 4) R(x, px, i * bh, 2, 1, BANDS[i - 1]);
    });
    // a few still clouds in the side spaces
    if (z.wide) {
      for (let i = 0; i < h / 70; i++) {
        const left = r() < 0.5, sz = 16 + r() * Math.min(26, z.side - 8);
        cloudShape(x, left ? 2 + r() * Math.max(1, z.side - sz - 4) : z.mid + z.half + 4 + r() * Math.max(1, z.side - sz - 6), 20 + r() * (skyH - 50), sz);
      }
    }
    // ---- yamang lupa along the bottom ----
    const g = h - landH;
    for (let px = 0; px < w; px++) { // far mountains
      const mh = Math.round(14 + 8 * Math.sin(px * 0.035 + 1) + 5 * Math.sin(px * 0.09));
      R(x, px, g + 18 - mh, 1, mh, '#9fcfb0'); R(x, px, g + 18 - mh, 1, 1, '#b9dcc5');
    }
    for (let px = 0; px < w; px++) { // rice terraces: stepped bands
      const th = Math.round(10 + 6 * Math.sin(px * 0.05 + 2.4));
      for (let k = 0; k < th; k += 3) {
        R(x, px, g + 22 - k, 1, 3, k % 6 ? '#7cc35a' : '#6bb64e');
        if (px % 2 === 0) R(x, px, g + 22 - k, 1, 1, '#9bd772');
      }
    }
    R(x, 0, g + 22, w, landH - 22, '#7cc35a'); R(x, 0, g + 22, w, 1, '#9bd772');
    for (let px = 3; px < w; px += 5) R(x, px, g + 24, 1, 1, '#5fa646');
    // coconut trees + a bahay kubo here and there
    for (let px = 6 + r() * 20; px < w - 8; px += 26 + r() * 40) {
      if (r() < 0.75) coconut(x, Math.round(px), g + 23, 14 + Math.round(r() * 8), r() < 0.5 ? -1 : 1);
      else x.drawImage(PX.art.hut, Math.round(px) - 8, g + 7, 16, 16);
    }

    // moving things: drifting clouds, maya birds, a saranggola (kite)
    const clouds = [];
    for (let i = 0; i < Math.max(3, Math.round(w / 90)); i++) clouds.push({ x0: r() * (w + 80), y: 6 + r() * Math.min(60, skyH * 0.3), sz: 18 + r() * 22, sp: 0.0015 + r() * 0.002 });
    const flocks = [];
    for (let i = 0; i < Math.max(2, Math.round(h / 160)); i++) flocks.push({ x0: r() * w, y: 20 + r() * (skyH - 40), sp: 0.006 + r() * 0.006, n: 3 + Math.floor(r() * 3) });
    const kite = z.wide ? { x: z.mid + z.half + Math.max(10, z.side * 0.5), y: Math.min(skyH - 40, 40 + r() * 60) } : null;

    return function (ctx, t) {
      const span = w + 80;
      clouds.forEach(function (c) {
        const cx = (((c.x0 + t * c.sp) % span) + span) % span - 60;
        ctx.globalAlpha = 0.85; cloudShape(ctx, cx, c.y, c.sz); ctx.globalAlpha = 1;
      });
      flocks.forEach(function (f, i) {
        const fx = (((f.x0 + t * f.sp) % (w + 40)) + w + 40) % (w + 40) - 20;
        for (let k = 0; k < f.n; k++) {
          const bx = Math.round(fx - k * 5), by = Math.round(f.y + (k % 2) * 3 + Math.sin(t / 400 + k) * 1);
          const up = (Math.floor(t / 180) + k + i) % 2;
          R(ctx, bx, by, 1, 1, '#4e3626');
          R(ctx, bx - 1, by - up, 1, 1, '#4e3626'); R(ctx, bx + 1, by - up, 1, 1, '#4e3626');
        }
      });
      if (kite) {
        const kx = Math.round(kite.x + Math.sin(t / 900) * 3), ky = Math.round(kite.y + Math.sin(t / 650) * 2);
        // diamond kite
        for (let k = 0; k < 5; k++) { R(ctx, kx - k, ky + k, k * 2 + 1, 1, k < 3 ? '#d24a4a' : '#f8cf55'); }
        for (let k = 0; k < 6; k++) { R(ctx, kx - 5 + k, ky + 5 + k, 11 - k * 2, 1, k < 2 ? '#f8cf55' : '#4a9ad8'); }
        R(ctx, kx, ky, 1, 11, '#8a5c33'); R(ctx, kx - 4, ky + 4, 9, 1, '#8a5c33');
        for (let k = 0; k < 10; k++) R(ctx, kx + Math.round(Math.sin(t / 300 + k / 2) * 2), ky + 11 + k, 1, 1, k % 3 === 0 ? '#d24a4a' : '#8a5c33');
        PX.line(ctx, kx, ky + 6, Math.min(w - 2, kx + 18), g + 6, 'rgba(255,255,255,.6)');
      }
    };
  }

  /* ---------- wiring ---------- */
  function setup(cv) {
    const sec = cv.parentElement, kind = cv.dataset.decor;
    const ctx = cv.getContext('2d');
    let base = null, anim = null, visible = false, timer = 0;
    function build() {
      const w = Math.ceil(sec.clientWidth / S), h = Math.ceil(sec.clientHeight / S);
      if (!w || !h) return;
      cv.width = w; cv.height = h;
      base = PX.makeCanvas(w, h);
      const bx = base.getContext('2d');
      const seed = kind === 'sky' ? 7107 : 1946;
      const r = rng(seed + sec.id.length * 13);
      const z = zones(sec, w);
      if (kind === 'sky') anim = buildSky(bx, w, h, r, z);
      else { R(bx, 0, 0, w, h, '#7cc35a'); anim = buildField(bx, w, h, r, z); }
      draw(reduceMotion ? 0 : performance.now());
    }
    function draw(t) {
      if (!base) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0);
      if (anim) anim(ctx, t);
    }
    function tick() {
      if (window.Learn.motionPaused()) { timer = 0; return; }
      draw(performance.now()); timer = visible ? setTimeout(tick, 90) : 0;
    }
    let rt = 0;
    const rebuild = function () { clearTimeout(rt); rt = setTimeout(build, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(sec); else addEventListener('resize', rebuild);
    build();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !timer) tick(); }).observe(sec);
    }
    window.Learn.onMotion(function (p) { if (!p && visible && !timer) tick(); });
  }
  document.querySelectorAll('canvas.decor').forEach(setup);
})();
