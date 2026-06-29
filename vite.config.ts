import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
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

export default defineConfig({
  plugins: [
    // Split each route's component into its own lazy chunk (loaded on navigation)
    // instead of shipping the whole app as one bundle. See the `vite:preloadError`
    // handler in main.tsx, which reloads when a deploy has removed a stale chunk.
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
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
