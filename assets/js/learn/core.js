/* =========================================================
   CORE: shared helpers for the learn page. Load this first
   (after pixel-engine.js and learn-data.js).
   Exposes window.Learn = { PX, reduceMotion, showToast,
                            motionPaused, onMotion, setMotionPaused }
   ========================================================= */
(function () {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast: small message at the bottom of the screen ---------- */
  const toast = document.getElementById('toast');
  let toastTimer = 0;
  function showToast(msg) {
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2400);
  }


  /* ---------- motion switch (WCAG 2.2.2: moving content can be paused) ----------
     Starts paused for people who turned on "reduce motion" in their system.
     Clicking the moving marquee banner flips it; animations listen with onMotion(). */
  let paused = reduceMotion;
  const listeners = [];
  function setMotionPaused(p) {
    paused = !!p;
    document.documentElement.classList.toggle('motion-paused', paused);
    const btn = document.getElementById('motionBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? 'Ituloy ang galaw ng mga animasyon' : 'Ihinto ang galaw ng mga animasyon');
      btn.title = paused ? 'Pindutin para ituloy ang galaw' : 'Pindutin para ihinto ang galaw';
    }
    listeners.forEach(function (fn) { fn(paused); });
  }
  const motionBtn = document.getElementById('motionBtn');
  if (motionBtn) {
    motionBtn.addEventListener('click', function () { setMotionPaused(!paused); });
    motionBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMotionPaused(!paused); }
    });
  }
  setMotionPaused(paused);

  window.Learn = {
    PX: window.PX, reduceMotion: reduceMotion, showToast: showToast,
    motionPaused: function () { return paused; },
    onMotion: function (fn) { listeners.push(fn); },
    setMotionPaused: setMotionPaused
  };
})();
