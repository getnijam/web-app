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

/**
 * The catalog of product-analytics events. **This is the source of truth** — to track a new
 * user action, add one entry here (a `snake_case` name → its property shape), then call
 * `track('your_event', { … })` from the click/mutation handler. The value type is the event's
 * properties; use {@link NoProps} for events that carry no properties.
 *
 * Keep names verb-led and past-tense (the action already happened), and keep properties to
 * low-cardinality, non-PII facts (booleans, enums, counts) — never raw emails, tokens, or names.
 */
export type AnalyticsEvents = {
  signed_up: { method: 'password' | 'google' | 'github' };
  logged_in: { method: 'password' | 'google' | 'github' };
  logged_out: NoProps;
  password_changed: { was_set: boolean };
  two_factor_enabled: NoProps;
  two_factor_disabled: NoProps;
  backup_codes_regenerated: NoProps;
  project_created: { has_repository_url: boolean };
};

// An event with no properties. `keyof` is `never` (unlike `Record<string, never>`, whose
// `keyof` is `string`), which is what lets `track('evt')` typecheck with no second argument.
type NoProps = Record<never, never>;

type EventName = keyof AnalyticsEvents;
// Events whose props type has no keys (e.g. `Record<string, never>`) take no second arg.
type TrackArgs<K extends EventName> = keyof AnalyticsEvents[K] extends never
  ? [event: K]
  : [event: K, props: AnalyticsEvents[K]];

/**
 * Record a user action. No-op until `initBetterStackAnalytics()` has run (so it's silent in
 * dev and SSR-free prerender), and typed against {@link AnalyticsEvents} so the event name and
 * its properties always match. Fire-and-forget — never awaited, never throws.
 */
export function track<K extends EventName>(...args: TrackArgs<K>): void {
  if (!window.betterstack) return;
  const [event, props] = args;
  window.betterstack('track', event, props ?? {});
}

/** Associate the current session with the signed-in user (pairs with `Sentry.setUser`). */
export function identify(user: { id: string; email: string }): void {
  window.betterstack?.('user', { id: user.id, email: user.email });
}

/** Clear the identified user on sign-out (pairs with `Sentry.setUser(null)`). */
export function resetAnalyticsUser(): void {
  window.betterstack?.('user', null);
}
