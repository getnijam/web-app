import * as Sentry from '@sentry/react';
import { isApiError } from '@/lib/api-error';

type NetworkCallKind = 'query' | 'mutation';

// API error codes we never send to Better Stack, expected client outcomes that aren't
// worth tracking (they're still logged to the console + breadcrumb). Add codes here to
// ignore them. Other candidates if they get noisy: 'VALIDATION_FAILED', 'EMAIL_NOT_VERIFIED'.
const IGNORED_CODES = new Set<string>([
  'INVALID_CREDENTIALS', // wrong email/password on the login form, fully expected
  'UNAUTHORIZED', // logged-out `getMe` probe fired by the auth gate, constant + expected
]);

/**
 * Pull the Hey API operation id out of a query/mutation key, they look like
 * `[{ _id: 'getMe', baseUrl }]`. Generated mutations don't set a key, so mutation
 * failures fall back to the bare kind.
 */
function operationFromKey(key: unknown): string | undefined {
  if (Array.isArray(key) && key[0] && typeof key[0] === 'object' && '_id' in key[0]) {
    return String((key[0] as { _id: unknown })._id);
  }
  return undefined;
}

/** A loggable message for any thrown value (API envelope, Error, or other). */
function describe(error: unknown): string {
  if (isApiError(error)) return error.error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Log a failed network call (anything that isn't 2xx). The generated API client uses
 * `throwOnError`, so every query and mutation rejects on a non-2xx response or a network
 * failure, and never on a 2xx. Wired into the React Query caches (see `main.tsx`), this
 * logs exactly "everything except 2xx", in one place.
 *
 * - **Console**: every failure (so they're visible in dev and the prod console).
 * - **Better Stack** (via the Sentry SDK; a no-op in dev): a breadcrumb plus a captured
 *   event for **every** non-2xx, 4xx, 5xx, and network failures, `level`-tagged so client
 *   errors (`warning`) stay separable from server/network ones (`error`). (The frontend
 *   captures everything; the backend, by contrast, only reports unhandled exceptions.)
 */
export function logNetworkError(kind: NetworkCallKind, error: unknown, key?: unknown): void {
  // React Query surfaces request cancellations as errors too, those aren't failures.
  if (error instanceof Error && error.name === 'AbortError') return;

  const operation = operationFromKey(key);
  const code = isApiError(error) ? error.error.code : undefined;
  const message = describe(error);

  // No structured API error → a network/parse failure; a 5xx surfaces as INTERNAL_ERROR.
  // Everything else is a handled 4xx (client error).
  const isServerOrNetwork = !isApiError(error) || code === 'INTERNAL_ERROR';
  const level: 'error' | 'warning' = isServerOrNetwork ? 'error' : 'warning';

  const where = operation ? `${kind} ${operation}` : kind;
  const line = `[network] ${where} failed${code ? ` (${code})` : ''}: ${message}`;
  if (isServerOrNetwork) console.error(line, error);
  else console.warn(line);

  Sentry.addBreadcrumb({
    category: 'network',
    type: 'http',
    level,
    message: line,
    data: { kind, operation, code },
  });
  // Capture every non-2xx (4xx + 5xx + network) to Better Stack, except ignored codes,
  // which still got the console log + breadcrumb above.
  if (code && IGNORED_CODES.has(code)) return;
  const tags = {
    network: true,
    kind,
    ...(operation ? { operation } : {}),
    ...(code ? { errorCode: code } : {}),
  };
  if (isApiError(error)) {
    // The API throws a plain `{ error: {...} }` envelope, not an Error, wrap it in a
    // synthetic Error whose *name* is the code so Better Stack titles + groups the event by
    // code (e.g. "INVALID_CREDENTIALS: …"). The raw envelope rides along in `extra`.
    const apiException = new Error(message);
    apiException.name = code ?? 'ApiError';
    Sentry.captureException(apiException, {
      level,
      tags,
      extra: { operation, apiError: error.error },
    });
  } else {
    // A real Error/TypeError (network/parse failure), capture as-is to keep its stack.
    Sentry.captureException(error, { level, tags });
  }
}
