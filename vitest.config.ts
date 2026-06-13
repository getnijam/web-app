import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Dogfood: when CI provides the ingest creds, also report this unit run to Nijam (the
// GitHub App then posts a check/comment on the PR). Inert locally without them — a plain
// `vitest run` just uses the default reporter, no warnings, no network.
const reporters: Array<string | [string, Record<string, unknown>]> = ['default'];
if (process.env.NIJAM_API_KEY && process.env.NIJAM_PROJECT_ID) {
  reporters.push([
    '@nijam/vitest-reporter',
    {
      apiKey: process.env.NIJAM_API_KEY,
      projectId: process.env.NIJAM_PROJECT_ID,
      // Optional override (defaults to api.nijam.dev); lets CI/local point elsewhere.
      apiUrl: process.env.NIJAM_API_URL,
    },
  ]);
}

// Standalone config (not the app's vite.config.ts) so unit tests don't pull in the
// router/Tailwind/Sentry build plugins — we only need the `@` alias to resolve imports.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    // Pure-function unit tests — no DOM needed. (Component tests would add jsdom.)
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Capture each test's source line so the Nijam dashboard can show/link it.
    includeTaskLocation: true,
    reporters,
  },
});
