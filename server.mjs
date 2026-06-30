// Production Node server for the TanStack Start build.
//
// `npm run build` emits a Web `fetch` handler at dist/server/server.js (SSR) plus the
// static client assets in dist/client. Start ships no host adapter, so this small
// runner wires them together: serve a static file from dist/client when one matches,
// otherwise hand the request to the SSR handler. Runs on any Node host (Railway,
// Render, Fly, a container) and is what `npm run start` uses for a local prod check.
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import handler from './dist/server/server.js';

const CLIENT_DIR = './dist/client';
const MIME = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
};

/** Serve a static asset from dist/client; returns true if it handled the request. */
async function serveStatic(req, res) {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (path === '/' || path.endsWith('/')) return false;
  // normalize() + the leading-join guards against path traversal.
  const filePath = join(CLIENT_DIR, normalize(path));
  if (!filePath.startsWith('dist/client')) return false;
  try {
    if (!(await stat(filePath)).isFile()) return false;
  } catch {
    return false;
  }
  const body = await readFile(filePath);
  res.writeHead(200, {
    'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
    // Hashed asset filenames are immutable; everything else stays revalidated.
    'cache-control': filePath.includes('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
  });
  res.end(body);
  return true;
}

const server = createServer(async (req, res) => {
  try {
    if (await serveStatic(req, res)) return;
    const url = `http://${req.headers.host}${req.url}`;
    const init = { method: req.method, headers: req.headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = Readable.toWeb(req);
      init.duplex = 'half';
    }
    const response = await handler.fetch(new Request(url, init));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end();
  } catch (err) {
    console.error('[server] request failed', err);
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Nijam web (prod) listening on http://localhost:${port}`));
