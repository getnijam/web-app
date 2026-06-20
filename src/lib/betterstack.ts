/**
 * Better Stack product analytics (user-action tracking) for the SPA — separate from the
 * error monitoring in `sentry.ts`. Loads Better Stack's `b.js` and initializes the global
 * `betterstack` command queue.
 *
 * Config comes from env, not hardcoded: the source token is `VITE_BETTERSTACK_ANALYTICS_TOKEN`
 * (a public client key, inlined into the bundle at build — set it on Vercel for prod, in `.env`
 * for local), and `environment` is derived from the build mode (`import.meta.env.MODE`). Enabled
 * for **production** builds only, so a normal `npm run dev` is a true no-op (no script load, no
 * tracking). To test locally, set `VITE_MONITORING_DEV=true` (+ the token) and restart the dev
 * server. No token → no init.
 */

type BetterStackQueue = {
  (...args: unknown[]): void;
  q?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    betterstack?: BetterStackQueue;
  }
}

export function initBetterStackAnalytics(): void {
  const enabledInDev = import.meta.env.VITE_MONITORING_DEV === 'true';
  if (!import.meta.env.PROD && !enabledInDev) return;
  const token = import.meta.env.VITE_BETTERSTACK_ANALYTICS_TOKEN;
  if (!token) return;

  // Stub the command queue so calls made before `b.js` loads are buffered and replayed.
  const queue: BetterStackQueue =
    window.betterstack ??
    ((...args: unknown[]) => {
      (queue.q = queue.q ?? []).push(args);
    });
  window.betterstack = queue;
  queue.l = Date.now();

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://betterstack.net/b.js?t=${encodeURIComponent(token)}`;
  (document.head ?? document.getElementsByTagName('head')[0]).appendChild(script);

  queue('init', { environment: import.meta.env.MODE });
}
