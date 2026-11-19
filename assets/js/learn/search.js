/* =========================================================
   SITE SEARCH: the "HANAP" button and the "/" shortcut.
   Searches headings and text of every section.
   ========================================================= */
(function () {
  'use strict';
  const reduceMotion = window.Learn.reduceMotion;

  /* ---------- site search ---------- */
  const overlay = document.getElementById('searchOverlay');
  const sInput = document.getElementById('searchInput');
  const sResults = document.getElementById('searchResults');
  let index = null, lastFocus = null;
  const norm = function (t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }; // ignore accents (á -> a)
  function buildIndex() {
    index = [];
    document.querySelectorAll('.sec, .hero').forEach(function (sec) {
      const head = sec.querySelector('.sec-title, .hero-title');
      const secName = head ? head.textContent.replace(/\s+/g, ' ').trim() : '';
      sec.querySelectorAll('h2, h3, h4, p, li, summary, .vs-row > div').forEach(function (el) {
        if (el.closest('.nav, .finder-result') || el.querySelector('h2, h3, h4, p, li')) return;
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        if (text.length < 3) return;
        index.push({ el: el, text: text, n: norm(text), sec: secName });
      });
    });
  }
  function escapeHtml(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function snippet(item, q) {
    const i = item.n.indexOf(q);
    const start = Math.max(0, i - 40), end = Math.min(item.text.length, i + q.length + 70);
    const pre = (start > 0 ? '…' : '') + item.text.slice(start, i), hit = item.text.slice(i, i + q.length), post = item.text.slice(i + q.length, end) + (end < item.text.length ? '…' : '');
    return escapeHtml(pre) + '<mark>' + escapeHtml(hit) + '</mark>' + escapeHtml(post);
  }
  function runSearch() {
    if (!index) buildIndex();
    const q = norm(sInput.value.trim());
    sResults.innerHTML = '';
    if (q.length < 2) return;
    const seen = new Set();
    const hits = index.filter(function (it) { return it.n.indexOf(q) > -1; }).filter(function (it) {
      if (seen.has(it.text)) return false; seen.add(it.text); return true;
    }).slice(0, 14);
    if (!hits.length) { sResults.innerHTML = '<li class="search-empty">Walang nahanap para sa “' + escapeHtml(sInput.value.trim()) + '”. Subukan ang ibang salita.</li>'; return; }
    hits.forEach(function (it) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="sr-sec">' + escapeHtml(it.sec) + '</span><span>' + snippet(it, q) + '</span>';
      b.addEventListener('click', function () {
        closeSearch(false);
        const det = it.el.closest('details'); if (det) det.open = true;
        it.el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        const target = it.el.closest('.px-box') || it.el;
        target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
      });
      li.appendChild(b); sResults.appendChild(li);
    });
  }
  function openSearch(q) {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('menu-open');
    if (typeof q === 'string') sInput.value = q;
    runSearch();
    setTimeout(function () { sInput.focus(); sInput.select(); }, 0);
  }
  function closeSearch(restore) {
    overlay.hidden = true;
    document.body.classList.remove('menu-open');
    if (restore !== false && lastFocus) lastFocus.focus();
  }
  sInput.addEventListener('input', runSearch);
  sInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { const first = sResults.querySelector('button'); if (first) first.click(); }
    if (e.key === 'ArrowDown') { const first = sResults.querySelector('button'); if (first) { e.preventDefault(); first.focus(); } }
  });
  sResults.addEventListener('keydown', function (e) {
    const btns = Array.prototype.slice.call(sResults.querySelectorAll('button'));
    const i = btns.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i < btns.length - 1) { e.preventDefault(); btns[i + 1].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? btns[i - 1] : sInput).focus(); }
  });
  document.getElementById('searchClose').addEventListener('click', function () { closeSearch(); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  document.querySelector('.nav-search').addEventListener('click', function () { if (window.Learn.nav.isMenuOpen()) window.Learn.nav.setMenu(false); openSearch(); });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) { closeSearch(); return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && overlay.hidden && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); openSearch(); }
  });
})();
