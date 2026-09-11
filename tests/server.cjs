const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.ttf':'font/ttf' };
const server = http.createServer((req, res) => {
  let requested;
  try {requested=decodeURIComponent(req.url.split('?')[0]);}catch(_){res.writeHead(400);res.end('Bad request');return;}
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  let target = path.resolve(root, relative);
  if (!target.startsWith(root+path.sep) || !fs.existsSync(target)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  if(fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  if(!fs.existsSync(target)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
}).listen(Number(process.env.PORT || 4173), '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
