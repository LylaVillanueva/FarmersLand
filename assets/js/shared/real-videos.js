/* =========================================================
   REAL VIDEOS: totoong footage, always behind a warning screen.
   Used by the game (index.html) and Alamin Pa (learn.html).

   How it works
     RealVideos.open('mendiola', { onClose: fn })
       1. shows a full-screen WARNING with what the video contains
          (level 'ask' shows only a simple question, no warning)
       2. only if the viewer presses PANOORIN does the video load
       3. Esc, HUWAG MUNA or ISARA closes it and calls onClose

   To add a video: put the .mp4 in assets/video/ and add an entry
   to VIDEOS below. Keep every warning specific and truthful.
   The source files the clips were cut from are in assets/RealVideos
   (large, do not upload those).
   ========================================================= */
(function () {
  'use strict';

  /* ---------- the videos ---------- */
  const VIDEOS = {
    mendiola: {
      src: 'assets/video/mendiola-1987.mp4',
      title: 'MENDIOLA MASSACRE, ENERO 22, 1987',
      level: 'graphic',
      shows: [
        'Totoong footage ng araw ng masaker sa Mendiola.',
        'Mga magsasakang nagkukubli at tumatakas habang binubuwag ang kanilang martsa.',
        'Mga taong nakahandusay sa kalsada at isang sugatang isinasakay sa jeep.'
      ],
      sound: false,
      credit: 'Mula sa "Mendiola Massacre (A 1987 Documentary)", in-upload ni Edgardo Sicat (RiderGaroX) sa YouTube.',
      sourceUrl: 'https://www.youtube.com/watch?v=kb1ph5c-npQ'
    },
    luisita: {
      src: 'assets/video/luisita-2004.mp4',
      title: 'HACIENDA LUISITA, NOBYEMBRE 16, 2004',
      level: 'graphic',
      shows: [
        'Totoong footage ng marahas na pagbuwag sa welga ng mga manggagawang-bukid.',
        'Mga taong tumatakbo, nadadapa at nagtatago sa tubuhan.',
        'Usok at kaguluhan; maaaring makabagabag ang mabilis at nanginginig na kuha.'
      ],
      sound: false,
      credit: 'Video mula sa News5 (YouTube).',
      sourceUrl: 'https://www.youtube.com/watch?v=9ILBPR-vPNg'
    },
    pax: {
      src: 'assets/video/pax-silica-2026.mp4',
      title: 'PAX SILICA: MGA TAGA-SITIO BINYAYAN',
      level: 'ask',           // no warning: just ask if they want to watch
      ask: 'Gusto mo bang manood ng maikling bahagi ng dokumentaryo ni Jessica Soho tungkol sa mga residenteng nangangambang mapaalis sa kanilang lupa?',
      shows: [],
      sound: true,
      credit: 'Mula sa "Pax Silica, makabubuti ba o makasasama?" (KMJS Special Reports), Kapuso Mo, Jessica Soho, GMA Public Affairs.',
      sourceUrl: 'https://www.youtube.com/watch?v=uBJecTjQKLU'
    }
  };

  const LEVELS = {
    graphic: { label: 'BABALA: TOTOONG KARAHASAN', note: 'Hindi angkop sa mga bata. Kung bata ang manonood, panoorin ito kasama ang magulang o guro.' },
    emotional: { label: 'BABALA: SENSITIBONG NILALAMAN', note: 'Totoong mga tao at totoong pighati ang makikita rito.' },
    ask: { label: '', note: '' }   // a simple question, no warning
  };

  /* ---------- the modal (built once, reused) ---------- */
  let root = null, lastFocus = null, onClose = null, current = null, openedAt = 0;
  // ignore clicks for a moment after opening, so a fast or held Enter from the game
  // cannot press PANOORIN or HUWAG MUNA by accident
  function tooSoon() { return Date.now() - openedAt < 500; }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build() {
    root = el('div', 'rv');
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'rvTitle');
    root.innerHTML =
      '<div class="rv-box px-box">' +
        '<div class="rv-warn">' +
          '<p class="rv-level rv-w"><i class="ico ico-warn" aria-hidden="true"></i> <span id="rvLevel"></span></p>' +
          '<h2 class="rv-title" id="rvTitle"></h2>' +
          '<p class="rv-ask" id="rvAsk"></p>' +
          '<p class="rv-lead rv-w">Ang video na ito ay naglalaman ng:</p>' +
          '<ul class="rv-shows rv-w" id="rvShows"></ul>' +
          '<p class="rv-note rv-w" id="rvNote"></p>' +
          '<ul class="rv-facts">' +
            '<li class="rv-w">Ito ay totoong video, hindi drawing.</li>' +
            '<li id="rvSilent">Walang tunog ang video na ito.</li>' +
            '<li class="rv-w">Puwede mong ihinto o isara ito anumang oras.</li>' +
          '</ul>' +
          '<p class="rv-help rv-w">Kung nababagabag ka, may makakausap ka: <strong>NCMH Crisis Hotline 1553</strong> (24/7).</p>' +
          '<div class="rv-actions">' +
            '<button type="button" class="px-btn red" id="rvPlay"></button>' +
            '<button type="button" class="px-btn paper" id="rvSkip"></button>' +
          '</div>' +
        '</div>' +
        '<div class="rv-player" hidden>' +
          '<div class="rv-frame"><video id="rvVideo" controls playsinline preload="none"></video>' +
            '<p class="rv-loading" id="rvLoading" role="status">NAGLO-LOAD ANG VIDEO...</p></div>' +
          '<p class="rv-credit" id="rvCredit"></p>' +
          '<div class="rv-actions"><button type="button" class="px-btn paper" id="rvClose"><i class="ico ico-x" aria-hidden="true"></i> ISARA</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    root.querySelector('#rvPlay').addEventListener('click', function () { if (!tooSoon()) play(); });
    root.querySelector('#rvSkip').addEventListener('click', function () { if (!tooSoon()) close(); });
    root.querySelector('#rvClose').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    root.addEventListener('keydown', function (e) {
      e.stopPropagation();                 // keep game controls from reacting
      if (e.repeat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return; }
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') trapFocus(e);
    });
    root.addEventListener('keyup', function (e) { e.stopPropagation(); });
  }

  function trapFocus(e) {
    const f = Array.prototype.filter.call(root.querySelectorAll('button, video, a[href]'), function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(id, opts) {
    const v = VIDEOS[id];
    if (!v) return;
    if (!root) build();
    current = v;
    onClose = (opts && opts.onClose) || null;
    lastFocus = document.activeElement;
    openedAt = Date.now();
    const lv = LEVELS[v.level];
    root.querySelector('#rvLevel').textContent = lv.label;
    root.querySelector('#rvTitle').textContent = v.title;
    root.querySelector('#rvShows').innerHTML = v.shows.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    root.querySelector('#rvNote').textContent = lv.note;
    const asking = v.level === 'ask';
    root.querySelector('#rvAsk').textContent = asking ? v.ask : '';
    root.querySelector('#rvPlay').innerHTML = (asking ? '<i class="ico ico-play" aria-hidden="true"></i> OO, PANOORIN' : '<i class="ico ico-eye" aria-hidden="true"></i> PANOORIN');
    root.querySelector('#rvSkip').textContent = asking ? 'HINDI MUNA' : 'HUWAG MUNA';
    root.querySelector('#rvSilent').hidden = !!v.sound;
    root.classList.toggle('is-graphic', v.level === 'graphic');
    root.classList.toggle('is-ask', asking);
    root.querySelector('.rv-warn').hidden = false;
    root.querySelector('.rv-player').hidden = true;
    root.hidden = false;
    document.body.classList.add('rv-open');
    // warnings: safest default is not watching; a plain question: default is watching
    root.querySelector(asking ? '#rvPlay' : '#rvSkip').focus();
  }

  function play() {
    const video = root.querySelector('#rvVideo');
    // skeleton until the first frame is ready (the clips are 10 to 46 MB)
    const frame = root.querySelector('.rv-frame'), loading = root.querySelector('#rvLoading');
    frame.classList.add('is-loading'); loading.hidden = false; loading.textContent = 'NAGLO-LOAD ANG VIDEO...';
    const ready = function () { frame.classList.remove('is-loading'); loading.hidden = true; };
    video.onloadeddata = ready;
    video.onerror = function () { frame.classList.remove('is-loading'); loading.textContent = 'Hindi ma-load ang video. Subukang muli mamaya.'; };
    video.muted = !current.sound;          // the silent clips stay muted; Pax Silica plays with sound
    video.preload = 'auto';                // nothing downloads until PANOORIN is pressed
    video.src = current.src;
    const credit = esc(current.credit) + (current.sourceUrl ? ' <a href="' + esc(current.sourceUrl) + '" target="_blank" rel="noopener">Tingnan ang orihinal</a>' : '');
    root.querySelector('#rvCredit').innerHTML = credit;
    root.querySelector('.rv-warn').hidden = true;
    root.querySelector('.rv-player').hidden = false;
    video.play().catch(function () { /* the viewer can press play */ });
    video.focus();
  }

  function close() {
    if (!root || root.hidden) return;
    const video = root.querySelector('#rvVideo');
    video.pause(); video.removeAttribute('src'); video.load();
    root.hidden = true;
    document.body.classList.remove('rv-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    const cb = onClose; onClose = null; current = null;
    if (cb) cb();
  }

  /* any button with data-real-video="id" opens that video */
  document.addEventListener('click', function (e) {
    const b = e.target.closest && e.target.closest('[data-real-video]');
    if (b) { e.preventDefault(); open(b.getAttribute('data-real-video')); }
  });

  window.RealVideos = { open: open, close: close, isOpen: function () { return !!root && !root.hidden; }, VIDEOS: VIDEOS };
})();
