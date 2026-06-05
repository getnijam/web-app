import type { ReactNode } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import type { FlakyTrendPoint } from '@/client';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';

/** Below this many flaky tests there's too little worth charting. */
const MIN_TESTS = 5;

const chartConfig = {
  count: { label: 'Flaky tests', color: 'var(--warning)' },
} satisfies ChartConfig;

const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
// `date` is a plain YYYY-MM-DD; anchor at noon UTC so the label can't slip a day.
const fmtDay = (d: string) => dayFmt.format(new Date(`${d}T12:00:00Z`));

/**
 * Flaky-tests-per-day bar chart for the last 30 days, with the total on top.
 * Shown once the project has at least {@link MIN_TESTS} flaky tests; below that
 * there's not enough to plot. Built on Recharts via the shadcn `chart` wrapper.
 */
export function FlakyTrendChart({
  flakyTestCount,
  points,
  loading,
}: {
  flakyTestCount: number;
  points: FlakyTrendPoint[];
  loading: boolean;
}) {
  if (flakyTestCount < MIN_TESTS) return <NotEnough />;
  if (loading) {
    return (
      <Panel>
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </Panel>
    );
  }
  if (points.length === 0) return <NotEnough />;

  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <Panel>
      <Flex direction="col" gap={0.5}>
        <Flex align="baseline" gap={2}>
          <Text as="span" className="text-2xl font-semibold tabular-nums">
            {total}
          </Text>
          <Text as="span" color="muted" className="text-sm">
            flaky {total === 1 ? 'test' : 'tests'} · last 30 days
          </Text>
        </Flex>
        <Text as="span" color="muted" className="text-xs">
          Grouped by day ({points.length} {points.length === 1 ? 'day' : 'days'} with flakiness)
        </Text>
      </Flex>
      <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
        <BarChart
          accessibilityLayer
          data={points}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            tickFormatter={fmtDay}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} isAnimationActive={false} />
          <ChartTooltip cursor content={<FlakyTip />} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <Flex direction="col" gap={4} className="rounded-2xl border border-border bg-card p-4.5">
      {children}
    </Flex>
  );
}

function NotEnough() {
  return (
    <Panel>
      <Text as="span" className="text-sm font-semibold">
        Flaky trend
      </Text>
      <Flex
        align="center"
        justify="center"
        className="h-40 rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center"
      >
        <Text color="muted" className="text-sm">
          Not enough data to show in graphical representation.
        </Text>
      </Flex>
    </Panel>
  );
}

function FlakyTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FlakyTrendPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="mb-1 font-mono text-xs text-muted-foreground">{fmtDay(p.date)}</div>
      <Flex align="center" gap={1.5}>
        <span className="size-2 rounded-sm bg-warning" />
        Flaky tests
        <b className="ml-auto font-semibold tabular-nums">{p.count}</b>
      </Flex>
    </div>
  );
}
