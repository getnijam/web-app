// Shared status-filter vocabulary used by both the runs list (server-side filter)
// and the run detail spec-file filter (FE-only). Kept in its own module so the
// value export (STATUS_OPTIONS) doesn't trip react-refresh in the components.

export type RunStatusFilter = 'all' | 'passed' | 'failed' | 'flaky' | 'quarantined';

export const STATUS_OPTIONS: { value: RunStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'flaky', label: 'Flaky' },
  { value: 'quarantined', label: 'Quarantined' },
];

// The runs list offers neither Flaky nor Quarantined as a verdict: both are green runs
// there (a run that recovered from flakiness passed, and a quarantined failure does not
// block). Both are filtered per-test *inside* a run, where the full STATUS_OPTIONS apply.
const LIST_EXCLUDED: RunStatusFilter[] = ['flaky', 'quarantined'];
export const RUN_LIST_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (o) => !LIST_EXCLUDED.includes(o.value),
);

/**
 * The accepted `?status=` values, derived from the option lists above rather than
 * re-listed. They were previously hand-copied into four `validateSearch`/guard consts,
 * which silently dropped `quarantined` when it was added: an unrecognised value falls
 * back to "all", so the filter looked wired up but never applied. Derive, don't repeat.
 */
export const RUN_DETAIL_STATUSES: RunStatusFilter[] = STATUS_OPTIONS.map((o) => o.value);
export const RUN_LIST_STATUSES: RunStatusFilter[] = RUN_LIST_STATUS_OPTIONS.map((o) => o.value);

/** Narrow an unknown `?status=` to a valid filter, or undefined (= the default, "all"). */
export function parseStatusFilter(
  value: unknown,
  allowed: RunStatusFilter[],
): RunStatusFilter | undefined {
  const v = value as RunStatusFilter;
  return allowed.includes(v) && v !== 'all' ? v : undefined;
}
