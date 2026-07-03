import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** A titled settings card with an optional header `action` (right-aligned, e.g.
 *  a Create button) and an optional sticky-style footer (Save row).
 *  Set `danger` for a mild red treatment on destructive ("danger zone") panels. */
export function SettingsPanel({
  title,
  action,
  footer,
  danger = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  footer?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', danger && 'border-destructive/40')}>
      <Flex
        align="center"
        justify="between"
        gap={3}
        className={cn(
          'border-b px-5 py-4',
          danger ? 'border-destructive/20 bg-destructive/5' : 'border-border',
        )}
      >
        <Text variant="h4" color={danger ? 'danger' : undefined}>
          {title}
        </Text>
        {action}
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
    </Card>
  );
}
