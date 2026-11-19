/* =========================================================
   NAVIGATION: ALAMIN / KUMILOS / TUNGKOL dropdowns, the mobile
   "stage select" menu, the scroll progress bar, and highlighting the
   section you're reading. Menu items are in learn.html (<header class="nav">).
   Exposes window.Learn.nav = { setMenu, isMenuOpen }
   ========================================================= */
(function () {
  'use strict';
  /* ---------- nav: grouped dropdowns, mobile stage select, scroll spy ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('navLinks');
  const groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  const mobileNav = function () { return matchMedia('(max-width: 1000px)').matches; };
  function closeGroups(except) {
    groups.forEach(function (g) {
      if (g === except) return;
      g.classList.remove('open');
      g.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
    });
  }
  groups.forEach(function (g) {
    const btn = g.querySelector('.nav-group-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = !g.classList.contains('open');
      closeGroups(g);
      g.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { const first = g.querySelector('.nl'); if (first && e.detail === 0) first.focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-group')) closeGroups(); });
  function setMenu(open) {
    links.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<i class="ico ico-x" aria-hidden="true"></i> ISARA' : '<i class="ico ico-menu" aria-hidden="true"></i> MENU';
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) {
    if (!e.target.closest('a')) return;
    closeGroups();
    if (links.classList.contains('open')) setMenu(false);
  });
  addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const openGroup = groups.find(function (g) { return g.classList.contains('open'); });
    if (openGroup) { closeGroups(); openGroup.querySelector('.nav-group-btn').focus(); }
    if (links.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  addEventListener('resize', function () { if (!mobileNav() && links.classList.contains('open')) setMenu(false); });

  const navItems = Array.prototype.slice.call(document.querySelectorAll('.nl'));
  const bar = document.getElementById('navProgress');
  let spyQueued = false;
  function spy() {
    spyQueued = false;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    bar.style.width = (Math.min(1, scrollY / max) * 100).toFixed(2) + '%';
    const line = innerHeight * 0.4;
    let current = null, best = -Infinity;
    navItems.forEach(function (a) {
      const el = document.getElementById(a.dataset.target);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top <= line && top > best) { best = top; current = a; }
    });
    navItems.forEach(function (a) {
      const on = a === current;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    groups.forEach(function (g) { g.classList.toggle('has-active', !!(current && g.contains(current))); });
  }
  addEventListener('scroll', function () { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
  addEventListener('resize', spy);
  spy();

  window.Learn.nav = { setMenu: setMenu, isMenuOpen: function () { return links.classList.contains('open'); } };
})();
