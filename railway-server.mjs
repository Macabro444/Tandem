import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as proxyRequest } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = process.env.FRONTEND_DIST || join(rootDir, 'frontend', 'dist');
const backendDir = process.env.BACKEND_DIR || join(rootDir, 'backend');
const backendEntry = process.env.BACKEND_ENTRY || join(backendDir, 'dist', 'src', 'main.js');
const pythonDir = process.env.PYTHON_DIR || join(rootDir, 'python');
const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python3';
const publicPort = Number(process.env.PORT || 8080);

const children = [
  spawn(process.execPath, [backendEntry], {
    cwd: backendDir,
    env: { ...process.env, PORT: '3000' },
    stdio: 'inherit',
  }),
  spawn(pythonExecutable, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: pythonDir,
    env: process.env,
    stdio: 'inherit',
  }),
];

for (const child of children) {
  child.on('exit', (code, signal) => {
    console.error(`Internal service stopped (code=${code}, signal=${signal})`);
    process.exit(code || 1);
  });
}

const nestPrefixes = ['/auth', '/empresas', '/users', '/contratos', '/cuestionarios-empresa'];
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function proxy(req, res, port) {
  const upstream = proxyRequest({
    hostname: '127.0.0.1',
    port,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${port}` },
  }, (upstreamResponse) => {
    res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
    upstreamResponse.pipe(res);
  });

  upstream.on('error', (error) => {
    console.error(`Proxy error on port ${port}:`, error.message);
    if (!res.headersSent) {
      res.writeHead(503, { 'content-type': 'application/json' });
    }
    res.end(JSON.stringify({ message: 'Service temporarily unavailable' }));
  });
  req.pipe(upstream);
}

function serveFrontend(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = resolve(frontendDir, `.${safePath}`);

  if (!filePath.startsWith(resolve(frontendDir)) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(frontendDir, 'index.html');
  }

  res.writeHead(200, {
    'content-type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    'cache-control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=86400',
  });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    proxy(req, res, 8000);
    return;
  }

  if (nestPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    proxy(req, res, 3000);
    return;
  }

  serveFrontend(req, res);
});

server.listen(publicPort, '0.0.0.0', () => {
  console.log(`Tandem gateway listening on port ${publicPort}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; stopping services`);
  for (const child of children) child.kill(signal);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
