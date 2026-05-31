import { Flex } from '@/components/ui/flex';
import { cn } from '@/lib/utils';

type CountKind = 'passed' | 'failed' | 'flaky' | 'skipped';

const PILL: Record<CountKind, string> = {
  passed: 'border-success/40 bg-success/15 text-success',
  failed: 'border-destructive/40 bg-destructive/15 text-destructive',
  flaky: 'border-warning/40 bg-warning/15 text-warning',
  skipped: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground',
};

/** A single count as an outlined, color-tinted badge. */
function CountPill({ value, kind }: { value: number; kind: CountKind }) {
  return (
    <span
      className={cn(
        'rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums',
        PILL[kind],
      )}
    >
      {value}
    </span>
  );
}

/** passed/failed/flaky/skipped counts as small tinted pills; all but passed hidden when zero. */
export function CountDots({
  passed,
  failed,
  flaky,
  skipped = 0,
}: {
  passed: number;
  failed: number;
  flaky: number;
  skipped?: number;
}) {
  return (
    <Flex align="center" gap={1.5} className="shrink-0">
      <CountPill value={passed} kind="passed" />
      {failed > 0 && <CountPill value={failed} kind="failed" />}
      {flaky > 0 && <CountPill value={flaky} kind="flaky" />}
      {skipped > 0 && <CountPill value={skipped} kind="skipped" />}
    </Flex>
  );
}
