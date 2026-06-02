import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { Flex } from '@/components/ui/flex';
import { ErrorState } from '@/components/states/ErrorState';

/**
 * Full-page error fallback for the top-level / router error boundaries. Reuses
 * {@link ErrorState}. Set `capture` to report to Sentry from here (the router
 * error path) — leave it off when a `Sentry.ErrorBoundary` already captured the
 * error, to avoid double-reporting.
 */
export function FullPageError({
  error,
  onReset,
  capture = false,
}: {
  error: unknown;
  onReset?: () => void;
  capture?: boolean;
}) {
  useEffect(() => {
    if (capture) Sentry.captureException(error);
  }, [error, capture]);

  return (
    <Flex align="center" justify="center" className="min-h-svh bg-background p-6">
      <ErrorState error={error} onRetry={onReset} />
    </Flex>
  );
}
