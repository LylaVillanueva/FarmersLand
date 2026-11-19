/* =========================================================
   HERO + FOOTER SCENES: the animated farm at the top of the page
   and the little farmer walking above the footer.
   Only animates while each canvas is on screen.
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX, C = PX.C, S = PX.sprites, A = PX.art;
  const reduceMotion = window.Learn.reduceMotion;

  /* ---------- hero scene ---------- */
  const hero = document.getElementById('heroCanvas');
  const hctx = hero.getContext('2d');
  const HH = 160, HG = 134;
  let HW = 320, plot = null, heroVisible = true;
  const walker = { x: 0, dir: 1, pause: 0, anim: 0 };

  function sizeHero() {
    const r = hero.getBoundingClientRect();
    HW = Math.max(140, Math.min(480, Math.round(HH * r.width / Math.max(1, r.height))));
    hero.width = HW; hero.height = HH;
    hctx.imageSmoothingEnabled = false;
    plot = PX.makePlot(Math.round(HW * 0.42));
    if (!walker.x) walker.x = HW * 0.62;
  }

  function drawHero(t) {
    PX.drawBackground(hctx, { W: HW, H: HH, ground: HG, cam: 0, t: t });
    const narrow = HW < 260;
    // hut on the right
    hctx.drawImage(A.hut, HW - (narrow ? 48 : 70), HG - A.hut.height + 2);
    // field
    hctx.drawImage(plot, Math.round(HW * 0.46), HG - 18);
    // fellow farmers at work: a carabao plowing + someone planting
    const px0 = Math.round(HW * 0.46), pw = Math.round(HW * 0.42);
    if (pw > 90) {
      PX.drawPlanter(hctx, px0 + 4, HG - 6, t, 3, 1, 0);
      PX.drawPlowTeam(hctx, px0 + 50, px0 + pw - 30, HG - 6, t, 0, 0);
    } else {
      PX.drawPlanter(hctx, px0 + pw - 22, HG - 6, t, 3, -1, 0);
    }
    if (!narrow) PX.drawCarabao(hctx, Math.round(HW * 0.08), HG - 2, t, 1);
    // history stump
    PX.drawStumpLabel(hctx, Math.round(HW * 0.40), HG - 13, 'LUPA');
    hctx.drawImage(S.flower, Math.round(HW * 0.40) + 9, HG - 25 + Math.round(Math.sin(t / 300) * 1.5));
    // floating hearts
    [[0.56, 52], [0.74, 64], [0.88, 46]].forEach(function (p, i) {
      const bob = Math.round(Math.sin(t / 260 + i * 2) * 2);
      hctx.drawImage(S.coin, Math.round(HW * p[0]), HG - p[1] + bob);
    });
    // the farmer, pacing his field
    let img;
    if (walker.pause > 0) img = S.front;
    else {
      const f = Math.floor(walker.anim) % 4;
      const set = walker.dir > 0 ? [S.walkA, S.stand, S.walkB, S.stand] : [S.walkAL, S.standL, S.walkBL, S.standL];
      img = set[f];
    }
    hctx.fillStyle = 'rgba(42,26,20,.25)';
    hctx.fillRect(Math.round(walker.x - 5), HG - 1, 10, 2);
    hctx.drawImage(img, Math.round(walker.x - img.width / 2), HG - img.height);
  }

  function stepWalker(k) {
    const minX = HW * 0.5, maxX = HW * 0.86;
    if (walker.pause > 0) { walker.pause -= k; return; }
    walker.x += walker.dir * 0.45 * k;
    walker.anim += 0.1 * k;
    if (walker.x > maxX || walker.x < minX) {
      walker.x = Math.max(minX, Math.min(maxX, walker.x));
      walker.dir *= -1;
      walker.pause = 90;
    }
  }

  /* ---------- footer walker ---------- */
  const wcv = document.getElementById('walker');
  const wctx = wcv.getContext('2d');
  const WH = 32, WG = 26;
  let WW = 300;
  const fw = { x: -20, anim: 0 };
  function sizeWalker() {
    const r = wcv.getBoundingClientRect();
    WW = Math.max(100, Math.round(WH * r.width / Math.max(1, r.height)));
    wcv.width = WW; wcv.height = WH;
    wctx.imageSmoothingEnabled = false;
  }
  function drawWalker(k, t) {
    wctx.fillStyle = C.sky[4]; wctx.fillRect(0, 0, WW, WH);
    for (let i = 0; i < WW; i += 40) {
      const b = A.bushes[Math.floor(PX.hash(i) * A.bushes.length)];
      if (PX.hash(i * 2.3) > 0.45) wctx.drawImage(b, i + Math.round(PX.hash(i) * 12), WG - b.height + 3);
    }
    wctx.fillStyle = C.grass; wctx.fillRect(0, WG, WW, WH - WG);
    wctx.fillStyle = C.grassTop; wctx.fillRect(0, WG, WW, 2);
    fw.x += 0.5 * k; fw.anim += 0.12 * k;
    if (fw.x > WW + 20) fw.x = -20;
    const set = [S.walkA, S.stand, S.walkB, S.stand];
    const img = set[Math.floor(fw.anim) % 4];
    wctx.drawImage(img, Math.round(fw.x - 8), WG - img.height + 1);
    // trail of sprouts he has planted
    wctx.fillStyle = C.sprout;
    for (let x = 6; x < fw.x - 12; x += 14) { wctx.fillRect(x, WG - 3, 1, 3); wctx.fillRect(x - 1, WG - 3, 1, 1); wctx.fillRect(x + 1, WG - 4, 1, 1); }
  }

  /* ---------- loop (only while something is on screen) ---------- */
  let walkerVisible = false, last = performance.now();
  function frame(now) {
    const k = Math.max(0, Math.min(3, (now - last) / 16.667));
    last = now;
    if (!window.Learn.motionPaused()) {
      if (heroVisible) { stepWalker(k); drawHero(now); }
      if (walkerVisible) drawWalker(k, now);
    }
    requestAnimationFrame(frame);
  }
  function resizeAll() { sizeHero(); sizeWalker(); const t0 = reduceMotion ? 0 : performance.now(); drawHero(t0); drawWalker(0, t0); }
  addEventListener('resize', resizeAll);
  resizeAll();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);
    new IntersectionObserver(function (es) { walkerVisible = es[0].isIntersecting; }).observe(wcv);
  } else { walkerVisible = true; }
  if (reduceMotion) { drawHero(0); drawWalker(0, 0); }
  requestAnimationFrame(frame);   // idles while motion is paused
})();
