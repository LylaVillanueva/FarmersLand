/* =========================================================
   PAGE ART: draws the small pixel pictures in the HTML
   • <canvas data-icon="sprout"> ... icons (defined in learn-data.js)
     special names: "coin" (heart coin), "farmer" (Tatay Ramon's face)
   • <canvas class="avatar" data-avatar="tatay|0|1|2|3"> ... team avatars
   ========================================================= */
(function () {
  'use strict';
  const PX = window.PX, S = PX.sprites, ICONS = window.LearnData.ICONS;

  /* ---------- icons ---------- */
  document.querySelectorAll('canvas[data-icon]').forEach(function (cv) {
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const name = cv.dataset.icon;
    if (name === 'farmer') { cv.width = 16; cv.height = 16; ctx.imageSmoothingEnabled = false; ctx.drawImage(S.front, 0, 0, 16, 16, 0, 0, 16, 16); return; }
    const def = ICONS[name];
    const src = name === 'coin' ? S.coin : (def ? PX.spriteFromMap(def.map, def.colors) : null);
    if (src) ctx.drawImage(src, 0, 0);
  });

  /* ---------- team photos: skeleton until each photo has loaded ---------- */
  document.querySelectorAll('img.avatar.photo').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('is-loading');
    const done = function () { img.classList.remove('is-loading'); };
    img.addEventListener('load', done); img.addEventListener('error', done);
  });

  /* ---------- team avatars (pixel art for anyone without a photo): "tatay" or a shirt colour 0-3 ---------- */
  document.querySelectorAll('canvas.avatar').forEach(function (cv) {
    const key = cv.dataset.avatar;
    const set = key === 'tatay' ? null : PX.npc.v[Number(key) % PX.npc.v.length];
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(set ? PX.farmerSet(PX.VARIANTS[Number(key) % PX.VARIANTS.length]).front : S.front, 0, 0);
  });
})();
