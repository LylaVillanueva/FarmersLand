/* =========================================================
   INTRO GAME: "Tunay na Reporma para sa Lupa"
   Walk with Tatay Ramon across the farm. Each post is a moment
   in history; each heart coin is an "Alam mo ba?" fact. The walk
   ends at the hacienda fence: the land he tills isn't his.

   To change the story, facts, farmers or level layout, edit
     game-data.js, this file is only the game logic.
   CONTENTS: canvas sizing · world · state · UI refs · sound
     · story scenes · dialog · input · flow · particles · update · draw · loop
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX, C = PX.C, S = PX.sprites, A = PX.art;

  /* ---------- canvas & sizing ---------- */
  const H = window.GameData.WORLD.H, GROUND = window.GameData.WORLD.GROUND;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 288;

  function resize() {
    W = Math.max(200, Math.min(400, Math.round(H * innerWidth / innerHeight)));
    canvas.width = W; canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    const scale = Math.min(innerWidth / W, innerHeight / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
  }
  addEventListener('resize', resize);
  resize();

  /* ---------- world (content lives in game-data.js) ---------- */
  const D = window.GameData;
  const START_X = D.WORLD.START_X, END_X = D.WORLD.END_X, FENCE_X = D.WORLD.FENCE_X, WORLD_W = D.WORLD.WORLD_W;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const INTRO = D.INTRO.map(function (l) { return l === '{controls}' ? (isTouch ? D.CONTROLS.touch : D.CONTROLS.keyboard) : l; });
  const PLOTS = D.PLOTS.map(function (p) { return Object.assign({ img: PX.makePlot(p.w) }, p); });
  const FIELD_Y = GROUND - 6; // farmers' feet sit inside the soil beds
  const NPCS = D.NPCS, STATIONS = D.STATIONS, HEARTS = D.HEARTS, FINALE = D.FINALE;

  /* ---------- state ---------- */
  let state = 'title';           // title | play | dialog | video | ending
  let hearts, stations, collected, finaleSeen, particles, cam;
  const P = { x: START_X, y: GROUND, vy: 0, dir: 1, on: true, anim: 0, moving: false };

  function resetWorld() {
    hearts = HEARTS.map(function (h) { return Object.assign({ got: false }, h); });
    stations = STATIONS.map(function (s) { return Object.assign({ seen: false }, s); });
    collected = 0; finaleSeen = false; particles = [];
    P.x = START_X; P.y = GROUND; P.vy = 0; P.dir = 1; P.on = true; P.anim = 0;
    cam = 0;
    updateHud();
  }

  /* ---------- UI refs ---------- */
  const $ = function (id) { return document.getElementById(id); };
  const ui = {
    title: $('title'), hud: $('hud'), dialog: $('dialog'), ending: $('ending'), touch: $('touch'),
    name: $('dialogName'), tag: $('dialogTag'), text: $('dialogText'), portrait: $('portrait'),
    heartCount: $('heartCount'), heartTotal: $('heartTotal'), endHearts: $('endHearts'), endTotal: $('endTotal'),
    progress: $('progressBar'), mute: $('muteBtn')
  };
  ui.heartTotal.textContent = ui.endTotal.textContent = HEARTS.length;
  if (isTouch) { document.body.classList.add('touch'); $('titleHint').hidden = true; }   // no Enter key on phones

  function updateHud() {
    ui.heartCount.textContent = collected;
    const pct = Math.max(0, Math.min(1, (P.x - START_X) / (END_X - START_X)));
    ui.progress.style.width = (pct * 100).toFixed(1) + '%';
  }

  /* ---------- sound (tiny chiptune blips) ---------- */
  let actx = null, muted = false;
  try { muted = localStorage.getItem('trpl-muted') === '1'; } catch (e) { /* storage unavailable */ }
  function setMuteLabel() { ui.mute.innerHTML = '<i class="ico ico-sound" aria-hidden="true"></i> ' + (muted ? 'OFF' : 'ON'); ui.mute.setAttribute('aria-pressed', String(muted)); }
  setMuteLabel();
  function initAudio() {
    if (actx) return;
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
  }
  function tone(f, d, vol, slide, type) {
    if (muted || !actx) return;
    const t0 = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.linearRampToValueAtTime(f + slide, t0 + d);
    g.gain.setValueAtTime(vol || 0.04, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(actx.destination);
    o.start(t0); o.stop(t0 + d + 0.02);
  }
  const sfx = {
    coin: function () { tone(988, 0.08, 0.04); setTimeout(function () { tone(1319, 0.18, 0.04); }, 70); },
    jump: function () { tone(300, 0.14, 0.03, 320); },
    blip: function () { tone(520 + Math.random() * 80, 0.03, 0.015); },
    post: function () { tone(523, 0.08, 0.035); setTimeout(function () { tone(659, 0.12, 0.035); }, 80); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tone(f, 0.22, 0.04); }, i * 130); }); }
  };
  ui.mute.addEventListener('click', function () {
    muted = !muted; setMuteLabel();
    try { localStorage.setItem('trpl-muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
    ui.mute.blur();
  });

  /* ---------- dialog ---------- */
  const dlg = { lines: [], i: 0, shown: 0, full: '', onDone: null, blipAt: 0, scenes: null };

  /* ---------- story scenes (pixel illustrations in the dialog box) ---------- */
  const scn = { panel: $('scenePanel'), canvas: $('sceneCanvas'), caption: $('sceneCaption'), id: null, def: null };
  const sctx = scn.canvas.getContext('2d');
  sctx.imageSmoothingEnabled = false;
  function showScene(id) {
    if (id === scn.id) return;
    scn.id = id;
    scn.def = id ? window.StoryScenes.get(id) : null;
    if (!scn.def) { scn.panel.hidden = true; return; }
    scn.panel.hidden = false;
    scn.caption.textContent = scn.def.caption;
    scn.canvas.setAttribute('aria-label', 'Paglalarawan: ' + scn.def.alt);
    scn.def.draw(sctx, performance.now());
  }
  const pctx = ui.portrait.getContext('2d');
  pctx.imageSmoothingEnabled = false;

  function drawPortrait(kind) {
    pctx.clearRect(0, 0, 20, 16);
    if (kind === 'heart') pctx.drawImage(S.coin, 4, 2);
    else {
      pctx.drawImage(S.front, 0, 0, 16, 13, 2, 2, 16, 13);
      if (kind === 'post') pctx.drawImage(S.flower, 11, 7);
    }
  }

  function openDialog(lines, meta, onDone) {
    state = 'dialog';
    dlg.lines = lines; dlg.i = 0; dlg.onDone = onDone || null; dlg.scenes = meta.scenes || null;
    scn.id = undefined;
    ui.name.textContent = meta.name;
    ui.tag.textContent = meta.tag || '';
    drawPortrait(meta.portrait);
    ui.dialog.hidden = false;
    clearKeys();
    setLine();
  }
  function setLine() {
    dlg.full = dlg.lines[dlg.i]; dlg.shown = 0; ui.text.textContent = '';
    showScene(dlg.scenes ? dlg.scenes[dlg.i] : null);
    renderGloss(dlg.full);
  }

  /* ---------- glossary: "?" dropdowns explaining hard words ---------- */
  const glossEl = document.getElementById('dialogGloss');
  const GLOSS = (D.GLOSSARY || []).map(function (g) { return { re: new RegExp(g.find, 'i'), term: g.term, def: g.def }; });
  function renderGloss(text) {
    const hits = GLOSS.filter(function (g) { return g.re.test(text); }).slice(0, 3);
    glossEl.textContent = '';
    glossEl.hidden = !hits.length;
    hits.forEach(function (g) {
      const det = document.createElement('details');
      const sum = document.createElement('summary');
      const q = document.createElement('span'); q.className = 'gloss-q'; q.textContent = '?';
      sum.appendChild(q);
      sum.appendChild(document.createTextNode(' Ano ang “' + g.term + '”?'));
      const p = document.createElement('p'); p.textContent = g.def;
      det.appendChild(sum); det.appendChild(p);
      glossEl.appendChild(det);
    });
  }
  function toggleGloss() {
    const all = glossEl.querySelectorAll('details');
    const open = !Array.prototype.some.call(all, function (d) { return d.open; });
    all.forEach(function (d) { d.open = open; });
  }
  // clicking a "?" opens it without moving the dialog forward
  glossEl.addEventListener('click', function (e) { e.stopPropagation(); });
  function advance() {
    if (state !== 'dialog') return;
    if (dlg.shown < dlg.full.length) { dlg.shown = dlg.full.length; ui.text.textContent = dlg.full; return; }
    dlg.i++;
    if (dlg.i >= dlg.lines.length) {
      ui.dialog.hidden = true;
      state = 'play';
      clearKeys();
      const cb = dlg.onDone; dlg.onDone = null;
      if (cb) cb();
    } else setLine();
  }
  ui.dialog.addEventListener('click', advance);
  canvas.addEventListener('click', function () { if (state === 'dialog') advance(); });

  /* ---------- input ---------- */
  const keys = { left: false, right: false, jump: false };
  let jumpQueued = false;
  function clearKeys() { keys.left = keys.right = keys.jump = false; jumpQueued = false; }

  addEventListener('keydown', function (e) {
    const k = e.key;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(k) > -1) e.preventDefault();
    if (state === 'title') {
      if (k === 'Enter' || k === ' ') startGame();
      return;
    }
    if (state === 'dialog') {
      if (k === '?' || k === 'h' || k === 'H') { toggleGloss(); return; }
      if (e.target.closest && e.target.closest('#dialogGloss')) return; // Enter/Space on a "?" just opens it
      if (!e.repeat && (k === 'Enter' || k === ' ' || k === 'ArrowUp' || k === 'z' || k === 'e')) advance();
      return;
    }
    if (state !== 'play') return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = true;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = true;
    if ((k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W') && !e.repeat) jumpQueued = true;
    if (k === 'm' || k === 'M') ui.mute.click();
  });
  addEventListener('keyup', function (e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
  });
  addEventListener('blur', clearKeys);

  ui.touch.querySelectorAll('[data-key]').forEach(function (btn) {
    const key = btn.dataset.key;
    const down = function (e) {
      e.preventDefault();
      if (state === 'dialog') { if (key === 'jump') advance(); return; }
      if (key === 'jump') jumpQueued = true; else keys[key] = true;
    };
    const up = function (e) { e.preventDefault(); if (key !== 'jump') keys[key] = false; };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

  /* ---------- flow ---------- */
  function startGame() {
    initAudio();
    resetWorld();
    ui.title.hidden = true;
    ui.ending.hidden = true;
    ui.hud.hidden = false;
    ui.touch.hidden = !isTouch;
    state = 'play';
    sfx.post();
    openDialog(INTRO, { name: 'TATAY RAMON', tag: 'ANG MAGSASAKA', portrait: 'farmer', scenes: [null, 'toil', 'toil', null] });
  }
  /* ---------- real videos: warning first, game paused until closed ---------- */
  function showRealVideo(id) {
    if (!window.RealVideos) return;
    state = 'video';
    clearKeys();
    window.RealVideos.open(id, { onClose: function () {
      if (state === 'video') state = 'play';
      clearKeys();
      canvas.focus && canvas.focus({ preventScroll: true });
    } });
  }

  function showEnding() {
    state = 'ending';
    ui.dialog.hidden = true;
    ui.hud.hidden = true;
    ui.touch.hidden = true;
    ui.endHearts.textContent = collected;
    ui.ending.hidden = false;
    sfx.win();
    $('learnBtn').focus({ preventScroll: true });
  }
  $('startBtn').addEventListener('click', startGame);
  $('replayBtn').addEventListener('click', startGame);
  $('skipBtn').addEventListener('click', function () { $('skipBtn').blur(); showEnding(); });

  /* ---------- particles ---------- */
  function burst(x, y, colors, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.4;
      particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.8, life: 40 + Math.random() * 20, c: colors[i % colors.length], s: Math.random() < 0.5 ? 1 : 2 });
    }
  }

  /* ---------- update ---------- */
  function update(k) {
    if (state !== 'play') return;
    const ax = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    P.moving = ax !== 0;
    if (ax) P.dir = ax;
    P.x = Math.max(12, Math.min(END_X, P.x + ax * 1.15 * k));
    if (jumpQueued && P.on) { P.vy = -3.6; P.on = false; sfx.jump(); }
    jumpQueued = false;
    P.vy += 0.18 * k;
    P.y += P.vy * k;
    if (P.y >= GROUND) { P.y = GROUND; P.vy = 0; P.on = true; }
    if (P.moving) P.anim += 0.13 * k; else P.anim = 0;

    // heart coins
    for (const h of hearts) {
      if (h.got) continue;
      if (Math.abs(h.x - P.x) < 9 && P.y - 20 < h.y + 6 && P.y > h.y - 6) {
        h.got = true; collected++;
        sfx.coin();
        burst(h.x, h.y, [C.coinY, C.coinL, C.heart], 14);
        updateHud();
        openDialog([h.fact], { name: 'ALAM MO BA?', tag: 'PUSO ' + collected + '/' + HEARTS.length, portrait: 'heart' });
        return;
      }
    }
    // history posts
    for (const s of stations) {
      if (!s.seen && P.x >= s.x - 6) {
        s.seen = true;
        sfx.post();
        burst(s.x, GROUND - 22, [C.coinY, '#ffffff'], 8);
        openDialog(s.lines, { name: 'TATAY RAMON', tag: s.label + ' · ' + s.tag, portrait: 'post', scenes: s.scenes },
          s.video ? function () { showRealVideo(s.video); } : null);
        return;
      }
    }
    // the fence
    if (!finaleSeen && P.x >= END_X - 1) {
      finaleSeen = true;
      P.dir = 1;
      openDialog(FINALE, { name: 'TATAY RAMON', tag: 'ANG BAKOD', portrait: 'farmer' }, showEnding);
      return;
    }
    updateHud();
  }

  /* ---------- draw ---------- */
  function drawWorld(t) {
    const r = Math.round;
    // hacienda + cane field behind the fence
    ctx.drawImage(A.hacienda, r(FENCE_X + 70 - cam), GROUND - A.hacienda.height + 3);
    ctx.drawImage(A.cane, r(FENCE_X + 6 - cam), GROUND - A.cane.height + 2);
    // hut
    ctx.drawImage(A.hut, r(22 - cam), GROUND - A.hut.height + 2);
    // plots
    for (const p of PLOTS) {
      const sx = r(p.x - cam);
      if (sx > W || sx + p.w < 0) continue;
      ctx.drawImage(p.img, sx, GROUND - 18);
    }
    // fellow farmers + carabaos
    for (const n of NPCS) {
      const nx = (n.type === 'team' ? n.min : n.x) - cam;
      const nw = n.type === 'team' ? (n.max - n.min) + 60 : 32;
      if (nx > W + 40 || nx + nw < -40) continue;
      if (n.type === 'carabao') PX.drawCarabao(ctx, nx, n.y, t, n.dir);
      else if (n.type === 'scarecrow') PX.drawScarecrow(ctx, nx, FIELD_Y, t);
      else if (n.type === 'plant') PX.drawPlanter(ctx, nx, FIELD_Y, t, n.v, n.dir, n.off);
      else if (n.type === 'hoe') PX.drawHoer(ctx, nx, FIELD_Y, t, n.v, n.dir, n.off);
      else if (n.type === 'team') PX.drawPlowTeam(ctx, n.min, n.max, FIELD_Y, t, n.v, cam);
    }
    // stations (stumps + flower coins)
    for (const s of stations) {
      const sx = r(s.x - 14 - cam);
      if (sx > W + 10 || sx < -40) continue;
      PX.drawStumpLabel(ctx, sx, GROUND - 13, s.label);
      const bob = Math.round(Math.sin(t / 300 + s.x) * 1.5);
      ctx.drawImage(S.flower, sx + 9, GROUND - 25 + bob);
      if (!s.seen && Math.floor(t / 400) % 2 === 0) {
        ctx.fillStyle = C.ink; ctx.fillRect(sx + 10, GROUND - 40, 9, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sx + 11, GROUND - 39, 7, 9);
        PX.drawText(ctx, '!', sx + 14, GROUND - 37, C.heart);
      }
    }
    // fence + sign
    ctx.fillStyle = '#d6c59e';
    ctx.fillRect(r(FENCE_X - cam), GROUND - 15, WORLD_W - FENCE_X, 2);
    ctx.fillRect(r(FENCE_X - cam), GROUND - 8, WORLD_W - FENCE_X, 2);
    for (let fx = FENCE_X; fx < WORLD_W; fx += 10) {
      const sx = r(fx - cam);
      if (sx < -4 || sx > W) continue;
      ctx.fillStyle = '#efe4c8'; ctx.fillRect(sx, GROUND - 20, 3, 21);
      ctx.fillStyle = '#c9b88e'; ctx.fillRect(sx + 2, GROUND - 20, 1, 21);
      ctx.fillStyle = '#efe4c8'; ctx.fillRect(sx + 1, GROUND - 21, 1, 1);
    }
    ctx.drawImage(A.sign, r(FENCE_X - 40 - cam), GROUND - A.sign.height + 2);
    // hearts
    for (const h of hearts) {
      if (h.got) continue;
      const sx = r(h.x - 6 - cam);
      if (sx > W || sx < -12) continue;
      const bob = Math.round(Math.sin(t / 260 + h.x) * 2);
      ctx.drawImage(S.coin, sx, r(h.y - 6 + bob));
    }
  }

  function drawPlayer(t) {
    let img;
    if (state === 'title' || state === 'ending' || (state === 'dialog' && P.on)) img = S.front;
    else if (!P.on) img = P.dir > 0 ? S.walkA : S.walkAL;
    else if (P.moving) {
      const f = Math.floor(P.anim) % 4;
      const set = P.dir > 0 ? [S.walkA, S.stand, S.walkB, S.stand] : [S.walkAL, S.standL, S.walkBL, S.standL];
      img = set[f];
    } else img = P.dir > 0 ? S.stand : S.standL;
    const sx = Math.round(P.x - img.width / 2 - cam);
    const sy = Math.round(P.y - img.height);
    // shadow
    const lift = Math.min(1, (GROUND - P.y) / 30);
    ctx.fillStyle = 'rgba(42,26,20,' + (0.25 - lift * 0.15).toFixed(2) + ')';
    ctx.fillRect(Math.round(P.x - 5 + lift * 2 - cam), GROUND - 1, Math.round(10 - lift * 4), 2);
    // idle breathing on title
    const breathe = (state === 'title' && Math.floor(t / 600) % 2) ? 1 : 0;
    ctx.drawImage(img, sx, sy + breathe, img.width, img.height - breathe);
  }

  function drawParticles(k) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * k; p.y += p.vy * k; if (!p.screen) p.vy += 0.05 * k; p.life -= k;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.fillStyle = p.c;
      ctx.fillRect(Math.round(p.x - (p.screen ? 0 : cam)), Math.round(p.y), p.s, p.s);
    }
  }

  /* ---------- main loop ---------- */
  let last = performance.now();
  function frame(now) {
    const k = Math.max(0, Math.min(3, (now - last) / 16.667));
    last = now;

    update(k);

    if (state === 'title') cam = 0;
    else cam = Math.max(0, Math.min(WORLD_W - W, Math.round(P.x - W * 0.42)));

    if (state === 'dialog') {
      const before = Math.floor(dlg.shown);
      dlg.shown = Math.min(dlg.full.length, dlg.shown + 0.75 * k);
      const now2 = Math.floor(dlg.shown);
      if (now2 !== before) {
        ui.text.textContent = dlg.full.slice(0, now2);
        if (now2 - dlg.blipAt >= 3) { sfx.blip(); dlg.blipAt = now2; }
      }
      if (now2 < dlg.blipAt) dlg.blipAt = 0;
      if (scn.def && !scn.panel.hidden) scn.def.draw(sctx, now);
    }

    if (state === 'ending' && Math.random() < 0.25 * k) {
      particles.push({ x: Math.random() * W, y: H + 2, vx: (Math.random() - 0.5) * 0.3, vy: -0.6 - Math.random() * 0.6, life: 200, c: [C.coinY, C.heart, '#ffffff', C.grassTop][Math.floor(Math.random() * 4)], s: 2, screen: true });
    }

    PX.drawBackground(ctx, { W: W, H: H, ground: GROUND, cam: cam, t: now });
    drawWorld(now);
    drawPlayer(now);
    drawParticles(state === 'ending' ? k * 0.4 : k);

    requestAnimationFrame(frame);
  }

  resetWorld();
  requestAnimationFrame(frame);
})();
