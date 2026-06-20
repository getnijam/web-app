import * as Sentry from '@sentry/react';
import { isApiError } from '@/lib/api-error';

type NetworkCallKind = 'query' | 'mutation';

/**
 * Pull the Hey API operation id out of a query/mutation key — they look like
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
 * failure — and never on a 2xx. Wired into the React Query caches (see `main.tsx`), this
 * logs exactly "everything except 2xx", in one place.
 *
 * - **Console**: every failure (so they're visible in dev and the prod console).
 * - **Better Stack** (via the Sentry SDK; a no-op in dev): a breadcrumb for every failure
 *   so the failed-call timeline rides along with any captured error/replay, plus a
 *   captured event for **actual errors only** — server errors (5xx / `INTERNAL_ERROR`) and
 *   network/parse failures. Expected 4xx client errors (validation, 401/403/404, …) are
 *   logged to the console + breadcrumb but never raised as Better Stack issues.
 */
export function logNetworkError(kind: NetworkCallKind, error: unknown, key?: unknown): void {
  // React Query surfaces request cancellations as errors too — those aren't failures.
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
  // Capture only ACTUAL errors to Better Stack — server errors (5xx / INTERNAL_ERROR) and
  // network/parse failures. Expected 4xx client errors stay console + breadcrumb only.
  if (isServerOrNetwork) {
    const tags = {
      network: true,
      kind,
      ...(operation ? { operation } : {}),
      ...(code ? { errorCode: code } : {}),
    };
    if (isApiError(error)) {
      // A 5xx comes through as a plain `{ error: {...} }` envelope (INTERNAL_ERROR), not an
      // Error — wrap it in a synthetic Error whose *name* is the code so Better Stack titles
      // + groups by code. The raw envelope rides along in `extra`.
      const apiException = new Error(message);
      apiException.name = code ?? 'ApiError';
      Sentry.captureException(apiException, {
        level,
        tags,
        extra: { operation, apiError: error.error },
      });
    } else {
      // A real Error/TypeError (network/parse failure) — capture as-is to keep its stack.
      Sentry.captureException(error, { level, tags });
    }
  }
}
