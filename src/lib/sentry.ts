import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error monitoring for the SPA. Enabled only for **production**
 * builds that actually carry a DSN — so dev and any DSN-less build are a true
 * no-op (no network, no SDK overhead). Captures errors + performance traces, and
 * records a **session replay only when an error occurs**, with all text/inputs
 * masked and media blocked so no PII is recorded.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || !import.meta.env.PROD) return;

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
