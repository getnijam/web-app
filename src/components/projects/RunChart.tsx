import { Bar, BarChart } from 'recharts';
import type { RunBar } from '@/client';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Flex } from '@/components/ui/flex';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

const tipTimeFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const chartConfig = {
  passed: { label: 'Passed', color: 'var(--success)' },
  flaky: { label: 'Flaky', color: 'var(--warning)' },
  failed: { label: 'Failed', color: 'var(--destructive)' },
  skipped: { label: 'Skipped', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

/**
 * Stacked passed/failed run chart — one bar per run (height ∝ total tests),
 * green passed on the bottom + red failed on top, with a hover tooltip. Built on
 * Recharts via the shadcn `chart` wrapper (per the preset); not hand-drawn SVG.
 */
export function RunChart({ runs, height = 78 }: { runs: RunBar[]; height?: number }) {
  if (runs.length === 0) return null;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height }}>
      <BarChart
        accessibilityLayer
        data={runs}
        margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        barCategoryGap="26%"
      >
        {/* One continuous bar per run — color is the only separation between
            segments (no per-segment radius). The segments are disjoint and sum
            to total. Bottom → top: passed, flaky, failed, skipped. */}
        <Bar dataKey="passed" stackId="run" fill="var(--color-passed)" isAnimationActive={false} />
        <Bar dataKey="flaky" stackId="run" fill="var(--color-flaky)" isAnimationActive={false} />
        <Bar dataKey="failed" stackId="run" fill="var(--color-failed)" isAnimationActive={false} />
        <Bar
          dataKey="skipped"
          stackId="run"
          fill="var(--color-skipped)"
          isAnimationActive={false}
        />
        <ChartTooltip cursor content={<RunTooltip />} />
      </BarChart>
    </ChartContainer>
  );
}

function RunTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RunBar }>;
}) {
  if (!active || !payload?.length) return null;
  const run = payload[0]!.payload;

  return (
    <div className="min-w-37.5 rounded-md border border-border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="mb-1.5 font-mono text-xs text-muted-foreground">
        {tipTimeFmt.format(new Date(run.startedAt))}
      </div>
      <TipRow dotClass="bg-success" label="Passed" value={run.passed} />
      <TipRow dotClass="bg-destructive" label="Failed" value={run.failed} />
      {run.flaky > 0 && <TipRow dotClass="bg-warning" label="Flaky" value={run.flaky} />}
      {run.skipped > 0 && (
        <TipRow dotClass="bg-muted-foreground" label="Skipped" value={run.skipped} />
      )}
      {run.durationSec !== null && (
        <Flex align="center" gap={1.5} className="mt-1 text-muted-foreground">
          Duration
          <b className="ml-auto font-semibold text-foreground tabular-nums">
            {formatDuration(run.durationSec)}
          </b>
        </Flex>
      )}
    </div>
  );
}

function TipRow({ dotClass, label, value }: { dotClass: string; label: string; value: number }) {
  return (
    <Flex align="center" gap={1.5} className="leading-relaxed">
      <span className={cn('size-2 rounded-sm', dotClass)} />
      {label}
      <b className="ml-auto font-semibold tabular-nums">{value}</b>
    </Flex>
  );
}
