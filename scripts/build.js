/* =========================================================
   BUILD: copies ONLY what the live site needs into dist/.
   Run with:  npm run build      then upload the dist/ folder.

   Left out on purpose:
     assets/RealVideos/  original screen recordings (about 1 GB)
     assets/teampic/     full-size original photos
     scripts/, README.md, package.json, dotfiles, .DS_Store
   Stops if `npm run check` finds a problem (em dash, emoji,
   unfilled placeholder), so a broken page never goes live.
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

// 0. remove any old build first, so a failed build never leaves a stale dist/ to upload
fs.rmSync(OUT, { recursive: true, force: true });

// 1. the same checks as `npm run check`
try {
  execFileSync(process.execPath, [path.join(__dirname, 'check-text.js')], { stdio: 'inherit' });
} catch (e) {
  console.error('\nBuild stopped: fix the problems above first.');
  process.exit(1);
}

// 2. what the site needs
const FILES = ['index.html', 'learn.html', 'favicon.ico', 'site.webmanifest'];
const DIRS = ['assets/css', 'assets/js', 'assets/fonts', 'assets/icons', 'assets/team', 'assets/video'];

let count = 0, bytes = 0;
function copy(rel) {
  const from = path.join(ROOT, rel), to = path.join(OUT, rel);
  if (fs.statSync(from).isDirectory()) {
    fs.readdirSync(from).forEach(function (n) { if (!n.startsWith('.')) copy(path.join(rel, n)); });
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  count++; bytes += fs.statSync(from).size;
}
FILES.concat(DIRS).forEach(copy);

console.log('Built dist/: ' + count + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB.');
console.log('Upload the dist/ folder (Netlify: drag it onto app.netlify.com/drop).');
