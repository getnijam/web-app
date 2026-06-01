import type { ReactNode } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type MeterTone = 'default' | 'warning' | 'danger';

// Recolor the Progress fill via its data-slot (default fill is `bg-primary`).
const INDICATOR: Record<MeterTone, string> = {
  default: '',
  warning: '[&_[data-slot=progress-indicator]]:bg-warning',
  danger: '[&_[data-slot=progress-indicator]]:bg-destructive',
};

/**
 * One labelled usage row: title + value on top, an optional progress bar, and a
 * muted hint below. Pass `percent={null}` for uncapped metrics (no bar).
 */
export function UsageMeter({
  icon,
  label,
  value,
  percent,
  hint,
  tone = 'default',
}: {
  icon?: IconSvgElement;
  label: string;
  value: ReactNode;
  percent: number | null;
  hint?: ReactNode;
  tone?: MeterTone;
}) {
  return (
    <Flex direction="col" gap={2.5} className="border-b border-border px-5 py-5 last:border-b-0">
      <Flex align="center" justify="between" gap={3}>
        <Flex align="center" gap={2}>
          {icon && (
            <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} className="text-muted-foreground" />
          )}
          <Text as="span" className="text-sm font-semibold">
            {label}
          </Text>
        </Flex>
        <Text as="span" className="font-mono text-sm text-muted-foreground">
          {value}
        </Text>
      </Flex>
      {percent !== null && <Progress value={percent} className={cn('h-2', INDICATOR[tone])} />}
      {hint && (
        <Text as="span" className="text-xs text-muted-foreground text-pretty">
          {hint}
        </Text>
      )}
    </Flex>
  );
}
