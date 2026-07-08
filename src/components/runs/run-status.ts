import type { RunAttemptSummary, RunSummary } from '@/client';

export type RunDisplayStatus = 'passed' | 'failed' | 'running' | 'failing' | 'canceled';

// A run whose tests all ultimately passed is a success, even if some were flaky:
// flakiness is surfaced as a count + an in-run filter, never as the run's headline
// verdict. So a rolled-up "flaky" group maps to Passed here.
const ROLLED_UP: Record<string, RunDisplayStatus> = {
  passed: 'passed',
  failed: 'failed',
  flaky: 'passed',
  running: 'running',
};

/** Map a run to a display status (row bar / pill). Filtering itself is server-side. */
export function runDisplayStatus(run: RunSummary): RunDisplayStatus {
  // Clubbed re-run: the cross-attempt rolled-up status wins (a failed test fixed on a
  // retry flips the run to passed/flaky). Null for a standalone run.
  const rolledUp = run.rolledUpStatus ? ROLLED_UP[run.rolledUpStatus] : undefined;
  if (rolledUp) return rolledUp;
  // Still running: red "Failing" once a failure has landed, else blue "Running".
  if (!run.finishedAt || run.status === 'running') return run.hadFailure ? 'failing' : 'running';
  // Abandoned run auto-swept by the server (idle >1h, never finalized).
  if (run.status === 'canceled') return 'canceled';
  // Passed even with flaky tests is still a Passed run (flakiness is a count, not a verdict).
  if (run.status === 'passed') return 'passed';
  return 'failed'; // failed | timedout | interrupted
}

/** Left status-bar color. */
export const RUN_BAR_CLASS: Record<RunDisplayStatus, string> = {
  passed: 'bg-success',
  failed: 'bg-destructive',
  failing: 'bg-destructive',
  running: 'bg-info',
  canceled: 'bg-muted-foreground',
};

/** Status-pill label + tinted classes. */
export const RUN_PILL: Record<RunDisplayStatus, { label: string; cls: string; dot: string }> = {
  passed: { label: 'Passed', cls: 'bg-success/15 text-success', dot: 'bg-success' },
  failed: { label: 'Failed', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  failing: { label: 'Failing', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  running: { label: 'Running', cls: 'bg-info/15 text-info', dot: 'bg-info' },
  canceled: { label: 'Canceled', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

/** Map a single clubbed attempt to a display status (for the attempt switcher). */
export function attemptDisplayStatus(a: RunAttemptSummary): RunDisplayStatus {
  if (!a.finishedAt || a.status === 'running') return 'running';
  if (a.status === 'canceled') return 'canceled';
  if (a.status === 'passed') return 'passed';
  return 'failed'; // failed | timedout | interrupted
}

/** Wall-clock run duration in seconds, or null when still running. */
export function runDurationSec(run: RunSummary): number | null {
  if (!run.finishedAt) return null;
  return Math.max(
    0,
    Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000),
  );
}
