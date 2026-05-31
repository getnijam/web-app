import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/** A titled settings card with an optional sticky-style footer (Save row). */
export function SettingsPanel({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
      <Flex align="center" className="border-b border-border px-5 py-4">
        <Text variant="h4">{title}</Text>
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
