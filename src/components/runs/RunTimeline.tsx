import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import type { RunTimelineBar, RunTimelineGroup } from '@/client';
import { getRunTimelineOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { RunDetailBodySkeleton } from './RunSkeletons';
import { cn } from '@/lib/utils';
import { formatDuration, displayFile } from '@/lib/format';

type BarStatus = RunTimelineBar['status'];

const chartConfig = {
  passed: { label: 'Passed', color: 'var(--success)' },
  failed: { label: 'Failed', color: 'var(--destructive)' },
  flaky: { label: 'Flaky', color: 'var(--warning)' },
  skipped: { label: 'Skipped', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

const STATUS_FILL: Record<BarStatus, string> = {
  passed: 'var(--success)',
  failed: 'var(--destructive)',
  flaky: 'var(--warning)',
  skipped: 'var(--muted-foreground)',
};

const STATUS_DOT: Record<BarStatus, string> = {
  passed: 'bg-success',
  failed: 'bg-destructive',
  flaky: 'bg-warning',
  skipped: 'bg-muted-foreground',
};

const ROW_HEIGHT = 30;
const AXIS_HEIGHT = 34;
const timeOfDay = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : formatDuration(ms / 1000);
}

function groupLabel(group: RunTimelineGroup): string {
  const files = `${group.fileCount} ${group.fileCount === 1 ? 'file' : 'files'}`;
  return `${group.projectName ?? 'Tests'} · ${files}`;
}

/** One spec file as a single Gantt row: a transparent offset, then its span. */
type FileRow = {
  file: string; // full path: unique within a group, used as the y-axis category key
  offset: number;
  duration: number;
  status: BarStatus;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  startedAt: string;
};

/** Flatten a project's lanes into one row per file, ordered by start time. */
function buildGroupRows(group: RunTimelineGroup): FileRow[] {
  return group.lanes
    .flatMap((lane) => lane.bars)
    .map((bar) => ({
      file: bar.file,
      offset: bar.offsetMs,
      duration: bar.durationMs,
      status: bar.status,
      passed: bar.passed,
      failed: bar.failed,
      flaky: bar.flaky,
      skipped: bar.skipped,
      startedAt: bar.startedAt,
    }))
    .sort((a, b) => a.offset - b.offset || a.file.localeCompare(b.file));
}

/** Y-axis label: the file's basename, trimmed so long paths don't blow out the axis. */
function fileTick(file: string): string {
  const base = file.split('/').pop() ?? file;
  return base.length > 28 ? `…${base.slice(-27)}` : base;
}

/**
 * A group = one browser project. Every spec file is its own row, positioned by its
 * real start offset and span, so files that run in parallel overlap on the clock.
 * We deliberately don't split into shard/worker lanes: the data has no per-worker
 * id, so faking sequential "machines" would misrepresent parallel runs.
 */
function GroupChart({ group, wallMs }: { group: RunTimelineGroup; wallMs: number }) {
  const rows = buildGroupRows(group);
  const height = rows.length * ROW_HEIGHT + AXIS_HEIGHT;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height }}>
      <BarChart
        layout="vertical"
        data={rows}
        margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
        barCategoryGap="28%"
      >
        <XAxis
          type="number"
          domain={[0, wallMs]}
          orientation="top"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          interval="preserveStartEnd"
          tickFormatter={(v: number) => formatDuration(v / 1000)}
        />
        <YAxis
          type="category"
          dataKey="file"
          width={170}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={fileTick}
        />
        {/* Transparent offset pushes the visible span to the file's start time. */}
        <Bar dataKey="offset" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar
          dataKey="duration"
          stackId="a"
          radius={2}
          minPointSize={(value) => ((value ?? 0) > 0 ? 2 : 0)}
          isAnimationActive={false}
        >
          {rows.map((row, i) => (
            <Cell key={i} fill={STATUS_FILL[row.status]} />
          ))}
        </Bar>
        <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.35 }} content={<TimelineTooltip />} />
      </BarChart>
    </ChartContainer>
  );
}

type TooltipItem = { payload?: FileRow };

function TimelineTooltip({ active, payload }: { active?: boolean; payload?: TooltipItem[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const counts: Array<{ label: string; value: number; status: BarStatus }> = [
    { label: 'Passed', value: row.passed, status: 'passed' },
    { label: 'Failed', value: row.failed, status: 'failed' },
    { label: 'Flaky', value: row.flaky, status: 'flaky' },
    { label: 'Skipped', value: row.skipped, status: 'skipped' },
  ];

  return (
    <div className="min-w-56 rounded-xl bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10">
      <Flex align="center" gap={2} className="mb-2">
        <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[row.status])} />
        <Text as="span" variant="code" className="truncate text-xs font-medium text-foreground">
          {displayFile(row.file)}
        </Text>
      </Flex>
      <Flex direction="col" gap={1}>
        {counts
          .filter((c) => c.value > 0)
          .map((c) => (
            <Flex key={c.label} align="center" gap={1.5} className="leading-relaxed">
              <span className={cn('size-2 rounded-sm', STATUS_DOT[c.status])} />
              <Text as="span" className="text-muted-foreground">
                {c.label}
              </Text>
              <b className="ml-auto font-mono font-semibold tabular-nums text-foreground">
                {c.value}
              </b>
            </Flex>
          ))}
        <Flex align="center" gap={1.5} className="mt-1 border-t border-border/60 pt-1.5">
          <Text as="span" className="text-muted-foreground">
            Started
          </Text>
          <b className="ml-auto font-mono font-medium tabular-nums text-foreground">
            {timeOfDay.format(new Date(row.startedAt))}
          </b>
        </Flex>
        <Flex align="center" gap={1.5}>
          <Text as="span" className="text-muted-foreground">
            Duration
          </Text>
          <b className="ml-auto font-mono font-medium tabular-nums text-foreground">
            {formatMs(row.duration)}
          </b>
        </Flex>
      </Flex>
    </div>
  );
}

function LegendDot({ status, label }: { status: BarStatus; label: string }) {
  return (
    <Flex align="center" gap={1.5}>
      <span className={cn('size-2 rounded-sm', STATUS_DOT[status])} />
      <Text as="span" className="text-xs text-muted-foreground">
        {label}
      </Text>
    </Flex>
  );
}

/**
 * Run timeline: every spec file drawn as its own Gantt row on the run's wall clock,
 * grouped by browser project. Built on Recharts via the shadcn chart wrapper. Owns
 * its own query + loading/error/empty states.
 */
export function RunTimeline({ runId }: { runId: string }) {
  const q = useQuery(getRunTimelineOptions({ path: { id: runId } }));

  function renderBody() {
    if (q.isLoading) return <RunDetailBodySkeleton />;
    if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;

    const groups = q.data.groups.filter((g) => g.fileCount > 0);
    if (groups.length === 0)
      return (
        <EmptyState
          title="No timeline data"
          description="This run has no recorded test executions to place on a timeline yet."
        />
      );

    const wallMs = Math.max(q.data.wallMs, 1000);
    return (
      <Flex direction="col" gap={6}>
        {groups.map((group) => (
          <Flex key={group.projectName ?? '__none'} direction="col" gap={2}>
            <Text as="span" className="text-sm font-medium text-foreground">
              {groupLabel(group)}
            </Text>
            <GroupChart group={group} wallMs={wallMs} />
          </Flex>
        ))}
      </Flex>
    );
  }

  return (
    // Flush, no wrapping card: the timeline drops straight into the detail pane
    // (or the single column), matching RunFileTests. A card here would read as
    // card-in-card and its overflow clip would cut off the hover tooltip.
    <Flex direction="col" gap={6} className="min-w-0">
      <Flex align="center" justify="between" gap={3} wrap>
        <Text variant="h4">Timeline</Text>
        <Flex align="center" gap={4} wrap>
          <LegendDot status="passed" label="Passed" />
          <LegendDot status="failed" label="Failed" />
          <LegendDot status="flaky" label="Flaky" />
          <LegendDot status="skipped" label="Skipped" />
        </Flex>
      </Flex>

      {renderBody()}
    </Flex>
  );
}
