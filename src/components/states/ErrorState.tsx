import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { errorMessage } from '@/lib/api-error';

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Flex direction="col" align="center" justify="center" gap={3} className="py-16">
      <Text color="danger">{errorMessage(error)}</Text>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Flex>
  );
}

/** Inline banner variant for form-level errors. */
export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <Text
      as="p"
      role="alert"
      color="danger"
      className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2"
    >
      {children}
    </Text>
  );
}
