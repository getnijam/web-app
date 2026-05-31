import type { ReactNode } from 'react';
import type { RunAggregate } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/format';

function Metric({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <Flex direction="col" gap={0.5} className="min-w-0">
      <Text as="span" className={cn('text-xl font-semibold tabular-nums', color)}>
        {value}
      </Text>
      <Text as="span" className="text-xs text-muted-foreground">
        {label}
      </Text>
    </Flex>
  );
}

/** Run-level aggregate counts + duration, shown above the spec-files list. */
export function RunSummaryBar({ summary }: { summary: RunAggregate }) {
  return (
    <Flex
      align="center"
      gap={8}
      wrap
      className="rounded-2xl border border-border bg-card px-5 py-4"
    >
      <Metric label="Total tests" value={summary.total} />
      <Metric label="Passed" value={summary.passed} color="text-success" />
      <Metric label="Failed" value={summary.failed} color="text-destructive" />
      <Metric label="Flaky" value={summary.flaky} color="text-warning" />
      <Metric label="Skipped" value={summary.skipped} color="text-muted-foreground" />
      <Metric
        label="Duration"
        value={summary.durationSec === null ? '—' : formatDuration(summary.durationSec)}
      />
    </Flex>
  );
}
