/* =========================================================
   DEV SERVER: a tiny static file server, no dependencies.
   It serves the project folder (one level up from /scripts).
     npm start            -> http://localhost:3000
     npm run dev          -> same, and opens your browser
     PORT=8080 npm start  -> use another port
   You don't need this to publish the site: upload the project
   folder to any static host (GitHub Pages, Netlify…).
   ========================================================= */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = path.join(__dirname, '..'); // serve the project folder (where index.html is)
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const file = path.join(ROOT, path.normalize(urlPath));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404: hindi nahanap: ' + urlPath);
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    // Range requests let browsers seek in videos (Safari needs them to play at all)
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      let start = m[1] ? Number(m[1]) : st.size - Number(m[2]);
      let end = m[1] && m[2] ? Number(m[2]) : st.size - 1;
      if (start < 0) start = 0;
      if (start >= st.size || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
        return res.end();
      }
      end = Math.min(end, st.size - 1);
      res.writeHead(206, {
        'Content-Type': type, 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1
      });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=${PORT + 1} npm start`);
  } else console.error(err);
  process.exit(1);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n  TUNAY NA REPORMA PARA SA LUPA');
  console.log(`  Laro (game):      ${url}/`);
  console.log(`  Alamin Pa (site): ${url}/learn.html`);
  console.log('  Press Ctrl+C to stop.\n');
  if (process.argv.includes('--open')) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${cmd} ${url}`);
  }
});
