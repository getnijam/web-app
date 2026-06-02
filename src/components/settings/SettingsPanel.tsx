import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** A titled settings card with an optional sticky-style footer (Save row).
 *  Set `danger` for a mild red treatment on destructive ("danger zone") panels. */
export function SettingsPanel({
  title,
  footer,
  danger = false,
  children,
}: {
  title: string;
  footer?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Flex
      direction="col"
      className={cn(
        'overflow-hidden rounded-2xl border bg-card',
        danger ? 'border-destructive/40' : 'border-border',
      )}
    >
      <Flex
        align="center"
        className={cn(
          'border-b px-5 py-4',
          danger ? 'border-destructive/20 bg-destructive/5' : 'border-border',
        )}
      >
        <Text variant="h4" color={danger ? 'danger' : undefined}>
          {title}
        </Text>
      </Flex>
      <div>{children}</div>
      {footer && (
        <Flex
          align="center"
          justify="end"
          gap={3}
          className="border-t border-border bg-muted/30 px-5 py-4"
        >
          {footer}
        </Flex>
      )}
    </Flex>
  );
}
