/* =========================================================
   ENGAGE: buttons that help visitors take action:
   share, the organization finder,
   "Kopyahin ang Liham", and the footer share buttons + year.
   Texts and links are in learn-data.js.
   ========================================================= */
(function () {
  'use strict';
  const D = window.LearnData, ORGS = D.ORGS, FINDER = D.FINDER, LETTER = D.LETTER;
  const showToast = window.Learn.showToast;

  /* ---------- share ---------- */
  document.getElementById('shareBtn').addEventListener('click', function () {
    const url = location.href.replace(/learn\.html.*$/, '');
    const data = { title: D.SHARE.title, text: D.SHARE.text, url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { showToast('NAKOPYA ANG LINK!'); }, function () { showToast(url); });
    } else showToast(url);
  });


  /* ---------- organization finder ("Hanapin ang organisasyong para sa iyo") ---------- */
  const finderResult = document.getElementById('finderResult');
  document.querySelectorAll('.finder-opts [data-who]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      document.querySelectorAll('.finder-opts [data-who]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      const f = FINDER[btn.dataset.who];
      if (btn.dataset.who === 'donor') {
        finderResult.innerHTML = '<h4>' + f.title + '</h4><p>Pumunta sa aming listahan ng mga NGO at fund na tumatanggap ng donasyon para sa mga magsasaka.</p><p><a class="px-btn small red" href="#donate"><i class="ico ico-heart" aria-hidden="true"></i> TINGNAN ANG MGA PUWEDENG DONASYUNAN</a></p>';
        return;
      }
      finderResult.innerHTML = '<h4>' + f.title + '</h4><ul class="link-list">' + f.orgs.map(function (k) {
        return '<li><a href="' + ORGS[k].url + '" target="_blank" rel="noopener">' + ORGS[k].name + '</a></li>';
      }).join('') + '</ul><p>' + f.tip + '</p>';
    });
  });

  /* ---------- letter to lawmakers ---------- */
  document.getElementById('letterBtn').addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(LETTER).then(function () { showToast('NAKOPYA ANG LIHAM!'); }, function () { showToast('Hindi makopya. Subukang muli'); });
    else showToast('Hindi suportado ang pagkopya sa browser na ito');
  });

  /* ---------- footer: share buttons + year ---------- */
  (function () {
    const url = location.href.replace(/learn\.html.*$/, '').replace(/#.*$/, '');
    const text = D.SHARE.text;
    document.getElementById('shareFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    document.getElementById('shareX').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
    document.getElementById('shareMail').href = 'mailto:?subject=' + encodeURIComponent(D.SHARE.title) + '&body=' + encodeURIComponent(text + '\n\n' + url);
    document.getElementById('shareCopy').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { showToast('NAKOPYA ANG LINK!'); });
    });
    document.getElementById('year').textContent = new Date().getFullYear();
  })();
})();
