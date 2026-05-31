import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Flex direction="col" align="center" justify="center" gap={2} className="py-16 text-center">
      <Text weight="medium" color="default">
        {title}
      </Text>
      {description && (
        <Text color="muted" className="max-w-sm">
          {description}
        </Text>
      )}
      {action && <Flex className="mt-2">{action}</Flex>}
    </Flex>
  );
}
