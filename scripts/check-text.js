/* =========================================================
   CHECK TEXT: fails if any file uses an em dash, en dash or emoji,
   or if a page still has an unfilled placeholder like [ilagay ...].
   Run with:  npm run check
   House rule: no em dashes, no en dashes, no emoji anywhere.
   Use a comma, colon, period or hyphen instead of a dash, and the
   pixel icons (<i class="ico ico-play">) instead of emoji/symbols.
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXT = new Set(['.html', '.css', '.js', '.json', '.md', '.svg', '.webmanifest']);
const SKIP = new Set(['node_modules', '.git']);

function isBad(ch) {
  const c = ch.codePointAt(0);
  return c === 0x2014 || c === 0x2013 || c === 0x2015 || c === 0x2012 // dashes
    || (c >= 0x1F000 && c <= 0x1FAFF)   // emoji
    || (c >= 0x2600 && c <= 0x27BF)     // symbols & dingbats (hearts, stars, checks)
    || (c >= 0x2B00 && c <= 0x2BFF)
    || (c >= 0x25A0 && c <= 0x25FF)     // triangles that render as emoji on phones
    || (c >= 0x2190 && c <= 0x21FF)     // arrows
    || (c >= 0x2300 && c <= 0x23FF)
    || c === 0xFE0F || c === 0x200D;    // emoji modifiers
}
const BAD_ENTITIES = /&mdash;|&ndash;|&#821[12];|\\u201[34]/g;
// placeholders that must be filled before going live, e.g. [ilagay ang email ng team]
const PLACEHOLDER = /\[ilagay [^\]]*\]|\[Pangalan\]/gi;

const problems = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!EXT.has(path.extname(name)) || full === __filename) continue;
    fs.readFileSync(full, 'utf8').split('\n').forEach(function (line, i) {
      for (const ch of line) if (isBad(ch)) problems.push(path.relative(ROOT, full) + ':' + (i + 1) + '  "' + ch + '"');
      const ents = line.match(BAD_ENTITIES);
      if (ents) ents.forEach(function (e) { problems.push(path.relative(ROOT, full) + ':' + (i + 1) + '  ' + e); });
      if (/\.(html?|js)$/.test(full)) {
        const ph = line.match(PLACEHOLDER);
        if (ph) ph.forEach(function (p) { problems.push(path.relative(ROOT, full) + ':' + (i + 1) + '  unfilled placeholder ' + p); });
      }
    });
  }
}
walk(ROOT);

if (problems.length) {
  console.error('Found ' + problems.length + ' problem(s) (em dash, emoji, or unfilled placeholder):\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('OK: no em dashes, emoji or unfilled placeholders.');
