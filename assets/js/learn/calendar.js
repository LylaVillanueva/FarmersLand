/* =========================================================
   CALENDAR: builds the "Mga Petsang Dapat Tandaan" cards, the
   "Susunod na petsa" line in the footer, and the .ics download.
   The dates themselves are in learn-data.js (DATES).
   ========================================================= */
(function () {
  'use strict';
  const D = window.LearnData, DATES = D.DATES, MONTHS = D.MONTHS, MONTHS_LONG = D.MONTHS_LONG;
  const showToast = window.Learn.showToast;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  function nextOccurrence(e) {
    const d = new Date(today.getFullYear(), e.m - 1, e.d);
    if (d < today) d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  const upcoming = DATES.slice().sort(function (a, b) { return nextOccurrence(a) - nextOccurrence(b); })[0];
  const calGrid = document.getElementById('calGrid');
  DATES.forEach(function (e) {
    const li = document.createElement('li');
    const isNext = e === upcoming;
    li.className = 'cal-card px-box' + (isNext ? ' next' : '');
    li.innerHTML = '<div class="cal-date" aria-hidden="true"><span class="m">' + MONTHS[e.m - 1] + '</span><span class="d">' + e.d + '</span></div>' +
      '<div class="cal-body">' + (isNext ? '<span class="cal-next-tag">SUSUNOD</span>' : '') + '<h3>' + e.title + '</h3><p><span class="sr-only">' + MONTHS_LONG[e.m - 1] + ' ' + e.d + ': </span>' + e.text + '</p></div>';
    calGrid.appendChild(li);
  });
  const nd = nextOccurrence(upcoming);
  const days = Math.round((nd - today) / 86400000);
  document.getElementById('nextDate').textContent = MONTHS_LONG[upcoming.m - 1] + ' ' + upcoming.d + ': ' + upcoming.title + (days === 0 ? ' (ngayon!)' : ' (' + days + ' araw)');

  document.getElementById('icsBtn').addEventListener('click', function () {
    const pad = function (n) { return String(n).padStart(2, '0'); };
    const y = today.getFullYear();
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tunay na Reporma para sa Lupa//Kalendaryo//FIL', 'CALSCALE:GREGORIAN'];
    DATES.forEach(function (e, i) {
      const start = y + pad(e.m) + pad(e.d);
      const endD = new Date(y, e.m - 1, e.d + 1);
      const end = endD.getFullYear() + pad(endD.getMonth() + 1) + pad(endD.getDate());
      lines.push('BEGIN:VEVENT', 'UID:trpl-' + i + '@tunay-na-reporma', 'DTSTAMP:' + y + '0101T000000Z',
        'DTSTART;VALUE=DATE:' + start, 'DTEND;VALUE=DATE:' + end, 'RRULE:FREQ=YEARLY',
        'SUMMARY:' + e.title, 'DESCRIPTION:' + e.text.replace(/,/g, '\\,'), 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'mga-petsa-ng-magsasaka.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    showToast('NA-DOWNLOAD ANG KALENDARYO');
  });
})();
