import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * A flat settings section for the account dialog, just a heading, stacked fields,
 * and an optional right-aligned action. No card or row borders (sections are
 * separated by the dialog's dividers), so it reads compact in a modal.
 */
export function AccountSection({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex direction="col" gap={4}>
      <Flex direction="col" gap={0.5}>
        <Text variant="h4">{title}</Text>
        {description && (
          <Text as="span" className="text-sm text-muted-foreground">
            {description}
          </Text>
        )}
      </Flex>
      <Flex direction="col" gap={4}>
        {children}
      </Flex>
      {footer && <Flex justify="end">{footer}</Flex>}
    </Flex>
  );
}
