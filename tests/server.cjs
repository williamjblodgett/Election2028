const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split('?')[0]);
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
}).listen(4173, '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
