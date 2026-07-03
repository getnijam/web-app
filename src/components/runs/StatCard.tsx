import type { ReactNode } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** A single summary metric: tinted icon tile + label + big value + caption. */
export function StatCard({
  icon,
  tint,
  label,
  value,
  caption,
}: {
  icon: IconSvgElement;
  tint: string; // tinted classes, e.g. 'bg-success/10 text-success'
  label: string;
  value: ReactNode;
  caption: string;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Flex align="center" gap={3}>
        <Flex align="center" justify="center" className={cn('size-10 shrink-0 rounded-lg', tint)}>
          <HugeiconsIcon icon={icon} size={20} strokeWidth={1.9} />
        </Flex>
        <Flex direction="col" className="min-w-0">
          <Text as="span" className="text-xs font-medium text-muted-foreground">
            {label}
          </Text>
          <Text as="span" className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </Text>
        </Flex>
      </Flex>
      <Text as="span" className="text-xs text-muted-foreground">
        {caption}
      </Text>
    </Card>
  );
}
