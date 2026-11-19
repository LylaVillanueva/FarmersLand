/* =========================================================
   UNDERGROUND: pixel soil layers, roots, stones and minerals
   behind the Kasaysayan section (<canvas id="underground">).
   Minerals and their labels are listed in ORES below.
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX;
  const reduceMotion = window.Learn.reduceMotion;
  const sec = document.getElementById('kasaysayan');
  const cv = document.getElementById('underground');
  if (!sec || !cv) return;
  const S = 4; // css px per art pixel
  const ctx = cv.getContext('2d');
  let base = null, sparkles = [], visible = false, timer = 0;

  function rng(seed) { // mulberry32, same layout on every visit
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const ORES = [
    { name: 'GINTO', c: '#f8cf55', hi: '#fde89c', lo: '#c9902a', shine: true },
    { name: 'PILAK', c: '#d3d8de', hi: '#ffffff', lo: '#9aa3ad', shine: true },
    { name: 'TANSO', c: '#c87a45', hi: '#e9a77a', lo: '#5fae8a' },
    { name: 'NIKEL', c: '#8fb39a', hi: '#c3dccb', lo: '#5f7f6a' },
    { name: 'KARBON', c: '#2a2226', hi: '#5a5058', lo: '#141012' },
    { name: 'MINERAL', c: '#b5533c', hi: '#e48a6a', lo: '#7a2e22', gem: true, shine: true },
    { name: 'MINERAL', c: '#7cd6e0', hi: '#d4f6fa', lo: '#3f9aa8', gem: true, shine: true }
  ];

  function build() {
    const w = Math.ceil(sec.clientWidth / S), h = Math.ceil(sec.clientHeight / S);
    if (!w || !h) return;
    cv.width = w; cv.height = h;
    base = PX.makeCanvas(w, h);
    const x = base.getContext('2d');
    const r = rng(1988);
    const R = function (px, py, pw, ph, c) { x.fillStyle = c; x.fillRect(Math.round(px), Math.round(py), pw, ph); };
    sparkles = [];

    // soil strata, darker with depth, wavy dithered boundaries
    const BANDS = ['#8a6136', '#805a33', '#76522f', '#6b4a2b', '#614327', '#573c23', '#4c351f'];
    const n = BANDS.length;
    for (let px = 0; px < w; px++) {
      let prev = 0;
      for (let k = 0; k < n; k++) {
        const y = k === n - 1 ? h : Math.round(h * (k + 1) / n + Math.sin(px * 0.05 + k) * 4 + Math.sin(px * 0.13 + k * 2) * 2);
        R(px, prev, 1, y - prev, BANDS[k]);
        if (k > 0 && px % 2 === 0) R(px, prev, 1, 1, BANDS[k - 1]);
        if (k > 0 && px % 4 === 1) R(px, prev + 1, 1, 1, BANDS[k - 1]);
        prev = y;
      }
    }
    // speckle texture
    for (let i = 0; i < w * h / 40; i++) R(r() * w, r() * h, 1, 1, r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.10)');

    // roots hanging from the surface
    for (let i = 0; i < Math.max(6, w / 14); i++) {
      let rx = r() * w, ry = 0;
      const len = 18 + r() * 40, col = r() < 0.6 ? '#4e2f1b' : '#b08a5a';
      for (let s = 0; s < len; s++) {
        R(rx, ry, 1, 1, col);
        ry += 1; rx += r() < 0.33 ? -1 : r() < 0.5 ? 1 : 0;
        if (r() < 0.06) { let bx = rx, by = ry; const d = r() < 0.5 ? -1 : 1; for (let b = 0; b < 6 + r() * 8; b++) { bx += d; by += r() < 0.6 ? 1 : 0; R(bx, by, 1, 1, col); } }
      }
    }

    // pebbles
    for (let i = 0; i < w * h / 700; i++) {
      const px = r() * w, py = 40 + r() * (h - 40), sz = 1 + Math.floor(r() * 2);
      R(px, py, sz + 1, sz, r() < 0.5 ? '#9c7a52' : '#3f2c1c');
      R(px, py, 1, 1, 'rgba(255,255,255,.18)');
    }
    // stones
    for (let i = 0; i < w * h / 4500; i++) {
      const px = r() * w, py = 30 + r() * (h - 30), rr = 2 + Math.floor(r() * 4);
      PX.blob(x, px, py, rr, '#5a5058', 1); PX.blob(x, px - 0.5, py - 0.5, rr - 1, '#7d7682', 1);
      R(px - rr / 2, py - rr / 2, 2, 1, '#a59fae');
    }

    // mineral deposits, mostly in the empty side spaces beside the timeline
    const mid = w / 2, half = Math.min(w / 2, (820 / 2 + 40) / S);
    const sideW = mid - half;
    const wide = sideW >= 24;
    const count = Math.round(h / (wide ? 22 : 60));
    const placed = [], labels = [];
    for (let i = 0; i < count; i++) {
      const ore = ORES[Math.floor(r() * ORES.length)];
      let px;
      if (wide) px = r() < 0.5 ? 6 + r() * (sideW - 16) : mid + half + 10 + r() * (sideW - 16);
      else px = 4 + r() * (w - 8);
      const py = 50 + r() * (h - 70);
      if (placed.some(function (q) { return Math.abs(q[0] - px) < 16 && Math.abs(q[1] - py) < 16; })) continue;
      placed.push([px, py]);
      // host rock
      PX.blob(x, px, py, 5 + Math.floor(r() * 3), '#3a2a1e', 1);
      PX.blob(x, px - 1, py - 1, 4, '#4a3828', 1);
      // ore
      for (let k = 0; k < 3 + Math.floor(r() * 4); k++) {
        const ox = px + Math.round((r() - 0.5) * 9), oy = py + Math.round((r() - 0.5) * 7);
        if (ore.gem) {
          R(ox, oy - 2, 1, 1, ore.hi); R(ox - 1, oy - 1, 3, 1, ore.c); R(ox - 1, oy, 3, 1, ore.c);
          R(ox, oy + 1, 1, 1, ore.lo); R(ox - 1, oy - 1, 1, 1, ore.hi);
        } else {
          R(ox, oy, 2, 2, ore.c); R(ox, oy, 1, 1, ore.hi); R(ox + 1, oy + 1, 1, 1, ore.lo);
        }
        if (ore.shine && r() < 0.5) sparkles.push({ x: ox, y: oy, p: r() * 12 });
      }
      // gold veins
      if (ore.name === 'GINTO') {
        let vx = px, vy = py;
        for (let s = 0; s < 14 + r() * 18; s++) { vx += r() < 0.7 ? 1 : 0; vy += r() < 0.5 ? 1 : 0; R(vx + 4, vy + 3, 1, 1, s % 5 ? '#d9a93a' : '#fde89c'); }
      }
      // label
      const tw = PX.textWidth(ore.name);
      const lx = Math.round(Math.max(1, Math.min(w - tw - 5, px - tw / 2))), ly = Math.round(py + 8);
      const free = !labels.some(function (b) { return lx < b[0] + b[2] + 4 && lx + tw + 4 > b[0] && ly < b[1] + 14 && ly + 14 > b[1]; });
      if (wide && free && r() < 0.45) {
        labels.push([lx, ly, tw]);
        R(lx - 2, ly - 2, tw + 4, 9, 'rgba(30,20,14,.75)');
        PX.drawText(x, ore.name, lx, ly, '#e9cf9f');
      }
    }
    draw(0);
  }

  function draw(t) {
    if (!base) return;
    ctx.drawImage(base, 0, 0);
    const f = t / 150;
    for (const s of sparkles) {
      const ph = (f + s.p) % 12;
      if (ph < 1.6) {
        ctx.fillStyle = '#fffbe6';
        ctx.fillRect(s.x, s.y - 1, 1, 3); ctx.fillRect(s.x - 1, s.y, 3, 1);
      }
    }
  }
  function tick() {
    if (window.Learn.motionPaused()) { timer = 0; return; }
    draw(performance.now()); timer = visible ? setTimeout(tick, 150) : 0;
  }

  let rebuildT = 0;
  const rebuild = function () { clearTimeout(rebuildT); rebuildT = setTimeout(build, 120); };
  if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(sec);
  else addEventListener('resize', rebuild);
  build();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !timer) tick();
    }).observe(sec);
  }
  window.Learn.onMotion(function (p) { if (!p && visible && !timer) tick(); });
})();
