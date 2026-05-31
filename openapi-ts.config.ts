import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // The API serves its spec at the live /openapi.json endpoint (no file on disk),
  // so default to the local API. Override with NIJAM_SPEC_URL for other targets.
  input: process.env.NIJAM_SPEC_URL ?? 'http://localhost:8787/openapi.json',
  output: { path: 'src/client', format: 'prettier' },
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
});
