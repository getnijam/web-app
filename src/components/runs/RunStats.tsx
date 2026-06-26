import { CheckmarkCircle02Icon, Layers01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import type { ProjectStats } from '@/client';
import { Grid } from '@/components/ui/grid';
import { formatDuration } from '@/lib/format';
import { StatCard } from './StatCard';

/** The three project-wide summary metrics shown above the run list. */
export function RunStats({ stats }: { stats: NonNullable<ProjectStats> }) {
  const windowSize = Math.min(15, stats.runCount);
  const window = `across the last ${windowSize} run${windowSize === 1 ? '' : 's'}`;

  return (
    <Grid cols={[1, 3]} gap={4}>
      <StatCard
        icon={CheckmarkCircle02Icon}
        tint="bg-success/10 text-success"
        label="Success rate"
        value={`${stats.passRate}%`}
        caption={window}
      />
      <StatCard
        icon={Layers01Icon}
        tint="bg-primary/10 text-primary"
        label="Total tests"
        value={stats.testsCount}
        caption="in the latest run"
      />
      <StatCard
        icon={Clock01Icon}
        tint="bg-info/10 text-info"
        label="Avg time"
        value={stats.avgDurationSec === null ? '-' : formatDuration(stats.avgDurationSec)}
        caption={window}
      />
    </Grid>
  );
}
