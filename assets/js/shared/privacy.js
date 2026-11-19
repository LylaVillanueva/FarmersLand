/* =========================================================
   PRIVACY POP-UP: the privacy policy, shown in a pop-up on
   both pages (no separate page). Any element with the
   attribute data-privacy opens it.

   Keep this text true to what the code does. If the site ever
   adds analytics, a form, embeds or cookies, update it first
   (and add a consent prompt if anything tracks visitors).
   ========================================================= */
(function () {
  'use strict';

  const CONTACT = 'resqrsaves@gmail.com';   // email ng team para sa tanong sa privacy
  const UPDATED = 'Nobyembre 19, 2026';

  const SECTIONS = [
    ['1. ANO ANG KINOKOLEKTA NAMIN',
      'Wala. Hindi namin hinihingi ang iyong pangalan, email, numero, lokasyon o anumang personal na impormasyon. Walang sign-up, walang form na ipinapadala sa amin, at walang tracking o analytics sa site.'],
    ['2. COOKIES',
      'Hindi gumagamit ng cookies ang site na ito, kaya wala ring cookie banner. Walang ads at walang third-party tracker.'],
    ['3. ANG NAIIWAN SA IYONG DEVICE',
      'Isang maliit na setting lang ang itinatabi sa browser mo (local storage): <code>trpl-muted</code>, kung naka-ON o OFF ang tunog ng laro. Hindi ito ipinapadala sa amin o kanino man. Para burahin, i-clear ang site data ng website na ito sa settings ng iyong browser.'],
    ['4. MGA NANGYAYARI LANG SA BROWSER MO',
      'Ang paghahanap (HANAP), ang calendar file (.ics), ang pagkopya ng liham, at ang pagbabahagi ng link ay ginagawa sa device mo mismo. Walang ipinapadala sa amin.'],
    ['5. MGA FONT, LARAWAN AT VIDEO',
      'Lahat ng font, larawan at video ay naka-host sa site na ito. Walang ibang serbisyo ang kinokontak ng browser mo kapag binuksan mo ang mga pahina. Ang mga video ay naglo-load lang kapag pinindot mo ang PANOORIN.'],
    ['6. MGA LINK PAPUNTA SA IBANG SITE',
      'May mga link kami sa YouTube, mga balita, mga batas at mga organisasyon. Kapag pinindot mo ang mga ito, aalis ka sa aming site at ang patakaran sa privacy ng site na iyon ang masusunod.'],
    ['7. ANG HOST NG WEBSITE',
      'Ang serbisyong nagho-host ng website ay maaaring magtala ng karaniwang server logs (gaya ng IP address, uri ng browser at oras ng pagbisita) para sa seguridad at pagpapatakbo ng site. Hindi namin ginagamit ang mga ito para kilalanin ka.'],
    ['8. DATA PRIVACY ACT',
      'Iginagalang namin ang Data Privacy Act of 2012 (Republic Act No. 10173). Dahil wala kaming kinokolektang personal na impormasyon, wala kaming iniimbak, ibinabahagi o ibinebenta.'],
    ['9. MAKIPAG-UGNAYAN',
      'Para sa mga tanong tungkol sa privacy, sumulat sa <a href="mailto:' + CONTACT + '">' + CONTACT + '</a>.']
  ];

  let dlg = null, lastFocus = null;

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'privacy-dialog px-box';
    dlg.setAttribute('aria-labelledby', 'privacyTitle');
    dlg.innerHTML =
      '<div class="pv-head">' +
        '<h2 id="privacyTitle">PATAKARAN SA PRIVACY</h2>' +
        '<button type="button" class="px-btn small paper pv-close" aria-label="Isara"><i class="ico ico-x" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="pv-body">' +
        '<p class="pv-lead">Hindi kami nangongolekta ng personal na impormasyon. Walang account, walang form, walang analytics, at walang cookies.</p>' +
        '<p class="pv-date">Huling binago: ' + UPDATED + '</p>' +
        SECTIONS.map(function (s) { return '<h3>' + s[0] + '</h3><p>' + s[1] + '</p>'; }).join('') +
      '</div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.pv-close').addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });   // click outside the box
    dlg.addEventListener('close', function () {
      document.body.classList.remove('pv-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    });
    // keep game controls from reacting while it is open
    dlg.addEventListener('keydown', function (e) { e.stopPropagation(); });
    dlg.addEventListener('keyup', function (e) { e.stopPropagation(); });
  }

  function open() {
    if (!dlg) build();
    lastFocus = document.activeElement;
    document.body.classList.add('pv-open');
    dlg.showModal();                      // Esc closes it; focus stays inside
    dlg.querySelector('.pv-body').scrollTop = 0;
  }
  function close() { if (dlg && dlg.open) dlg.close(); }

  document.addEventListener('click', function (e) {
    const t = e.target.closest && e.target.closest('[data-privacy]');
    if (t) { e.preventDefault(); e.stopPropagation(); open(); }
  });

  window.Privacy = { open: open, close: close };
})();
