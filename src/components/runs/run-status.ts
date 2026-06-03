import type { RunSummary } from '@/client';

export type RunDisplayStatus = 'passed' | 'failed' | 'flaky' | 'running' | 'failing' | 'canceled';

/** Map a run to a display status (row bar / pill). Filtering itself is server-side. */
export function runDisplayStatus(run: RunSummary): RunDisplayStatus {
  // Still running: red "Failing" once a failure has landed, else blue "Running".
  if (!run.finishedAt || run.status === 'running') return run.hadFailure ? 'failing' : 'running';
  // Abandoned run auto-swept by the server (idle >1h, never finalized).
  if (run.status === 'canceled') return 'canceled';
  if (run.status === 'passed') return (run.stats?.flaky ?? 0) > 0 ? 'flaky' : 'passed';
  return 'failed'; // failed | timedout | interrupted
}

/** Left status-bar color. */
export const RUN_BAR_CLASS: Record<RunDisplayStatus, string> = {
  passed: 'bg-success',
  flaky: 'bg-warning',
  failed: 'bg-destructive',
  failing: 'bg-destructive',
  running: 'bg-info',
  canceled: 'bg-muted-foreground',
};

/** Status-pill label + tinted classes. */
export const RUN_PILL: Record<RunDisplayStatus, { label: string; cls: string; dot: string }> = {
  passed: { label: 'Passed', cls: 'bg-success/15 text-success', dot: 'bg-success' },
  flaky: { label: 'Flaky', cls: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  failed: { label: 'Failed', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  failing: { label: 'Failing', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  running: { label: 'Running', cls: 'bg-info/15 text-info', dot: 'bg-info' },
  canceled: { label: 'Canceled', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

/** Wall-clock run duration in seconds, or null when still running. */
export function runDurationSec(run: RunSummary): number | null {
  if (!run.finishedAt) return null;
  return Math.max(
    0,
    Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000),
  );
}
