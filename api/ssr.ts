// Vercel serverless function: adapts the TanStack Start SSR server to Vercel.
//
// `npm run build` emits a Web `fetch` handler at dist/server/server.js (Start ships no
// host adapter). The static client assets are served from dist/client
// (vercel.json `outputDirectory`); Vercel serves a matching file first, so only the SSR
// routes (/, /pricing, ...) fall through to this function. `includeFiles: dist/server/**`
// in vercel.json ships the built server + its route chunks with the function.
//
// BEST-EFFORT: verify on a Vercel preview deploy (the one unproven piece is the function
// bundling of the Vite-built server). The same server is proven to run as a standalone
// Node server via `npm run start` (server.mjs), so deploying to a Node host
// (Railway / Render / Fly) is the fallback if the Vercel function needs more work.
import server from '../dist/server/server.js';

export default function handler(request: Request): Response | Promise<Response> {
  return server.fetch(request);
}
