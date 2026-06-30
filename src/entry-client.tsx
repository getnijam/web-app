import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { initSentry } from '@/lib/sentry';
import { initBetterStackAnalytics } from '@/lib/betterstack';

// The client entry runs only in the browser, so this is the home for one-time
// browser-only init that used to sit at the top of main.tsx. Error monitoring +
// analytics first (both no-op in dev / without their tokens).
initSentry();
initBetterStackAnalytics();

// With code-split routes, an open tab may try to load a lazy chunk that a newer deploy
// has already removed. Vite fires `vite:preloadError` when that import 404s; reload to
// fetch the fresh build. `preventDefault()` stops Vite from also throwing.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

// Hydrate the server-rendered document. StartClient resolves the router from the
// `getRouter` factory (src/router.tsx) wired by the Start Vite plugin.
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
