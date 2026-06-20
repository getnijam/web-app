import * as Sentry from '@sentry/react';

/**
 * Initialize Better Stack error monitoring for the SPA (via the Sentry SDK). The DSN comes
 * from `VITE_SENTRY_DSN` (set it on Vercel for prod; in `.env` for local). Enabled for
 * **production** builds (so normal `npm run dev` is a true no-op — no network, no SDK
 * overhead); to test locally, set `VITE_MONITORING_DEV=true` (+ the DSN) and restart the
 * dev server. No DSN → no init. Captures errors + performance traces, and records a
 * **session replay only when an error occurs**, with all text/inputs masked and media
 * blocked (no PII).
 */
export function initSentry(): void {
  const enabledInDev = import.meta.env.VITE_MONITORING_DEV === 'true';
  if (!import.meta.env.PROD && !enabledInDev) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}
