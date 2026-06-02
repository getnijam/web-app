import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';

// Source-map upload runs only when the build env carries SENTRY_AUTH_TOKEN (set on
// Vercel). Local/CI builds without it skip the plugin AND skip emitting maps, so
// nothing changes for everyday `vite build`. With a token: maps are emitted
// 'hidden' (no public sourceMappingURL), uploaded to Sentry, then deleted from the
// output so they never ship to users.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const withSentry = !!sentryAuthToken;

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    ...(withSentry
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
            sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
          }),
        ]
      : []),
  ],
  build: {
    sourcemap: withSentry ? 'hidden' : false,
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
