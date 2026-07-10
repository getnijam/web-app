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
// has already removed. Vite fires `vite:preloadError` when that import 404s; reload once
// to fetch the fresh build. `preventDefault()` stops Vite from also throwing.
//
// Loop guard: if a chunk STILL 404s right after we reloaded, the deploy is serving broken
// assets (not a stale open tab), so reloading again would loop forever and take the page
// down. We can't use sessionStorage in this environment, so we read the navigation type:
// suppress the reload only when THIS document already came from a reload moments ago. A
// failure long after load is a fresh transient (e.g. a mid-session deploy), so we still
// reload once then.
const RELOAD_LOOP_WINDOW_MS = 10_000;
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const justReloaded = nav?.type === 'reload' && performance.now() < RELOAD_LOOP_WINDOW_MS;
  if (justReloaded) return; // already reloaded and it failed again → stop, don't loop
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
