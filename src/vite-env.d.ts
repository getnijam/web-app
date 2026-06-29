/// <reference types="vite/client" />

// Build id baked in at build time (see vite.config.ts `define`). Matched against
// /version.json to detect when a newer deployment has shipped.
declare const __BUILD_ID__: string;
