import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';

// Source-map upload to **Better Stack** (Sentry-compatible, via the Sentry Vite plugin).
// Runs only when the build env carries a Better Stack Telemetry API token (set on Vercel,
// never committed). The `SENTRY_*` env vars hold Better Stack's values from
// Errors → Applications → [app] → Advanced settings:
//   SENTRY_URL    , Better Stack source-map endpoint (e.g. https://eu-fsn-3-sourcemaps.betterstackdata.com)
//   SENTRY_ORG    , Better Stack team id
//   SENTRY_PROJECT, Better Stack application id
//   SENTRY_AUTH_TOKEN, Better Stack Telemetry API token (secret)
// With a token: maps are emitted 'hidden' (no public sourceMappingURL), uploaded to Better
// Stack, then deleted from the output so they never ship to users. No token → no maps, no upload.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const uploadSourceMaps = !!sentryAuthToken;

// A unique id per build, baked into the bundle (`__BUILD_ID__`) and written to
// `version.json`. The deployment-update hook polls version.json and compares it to
// `__BUILD_ID__` to detect when a newer build has shipped. On Vercel this is the
// commit SHA (stable per deploy); locally it falls back to the build timestamp.
const buildId = process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());

// Writes /version.json into the build output (build-only; not served in dev).
const emitVersionJson: Plugin = {
  name: 'nijam:emit-version-json',
  generateBundle() {
    this.emitFile({
      type: 'asset' as const,
      fileName: 'version.json',
      source: JSON.stringify({ buildId }),
    });
  },
};

export default defineConfig({
  plugins: [
    // TanStack Start: SSR + the same file-based routing (it subsumes the router
    // plugin's code-splitting). `getRouter` (src/router.tsx) is the shared factory;
    // src/client.tsx is our custom client entry (browser-only init then hydrate); the
    // server entry uses Start's default. Must come before the React plugin.
    tanstackStart({
      router: { entry: './router.tsx' },
      // entry-client (not client.tsx) so it doesn't collide with the generated `@/client` dir.
      client: { entry: './entry-client.tsx' },
    }),
    nitro(),
    react(),
    tailwindcss(),
    emitVersionJson,
    ...(uploadSourceMaps
      ? [
          sentryVitePlugin({
            url: process.env.SENTRY_URL,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
            sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
          }),
        ]
      : []),
  ],
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  build: {
    sourcemap: uploadSourceMaps ? 'hidden' : false,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
