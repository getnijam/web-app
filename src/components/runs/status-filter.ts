// Shared status-filter vocabulary used by both the runs list (server-side filter)
// and the run detail spec-file filter (FE-only). Kept in its own module so the
// value export (STATUS_OPTIONS) doesn't trip react-refresh in the components.

export type RunStatusFilter = 'all' | 'passed' | 'failed' | 'flaky';

export const STATUS_OPTIONS: { value: RunStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'flaky', label: 'Flaky' },
];

// The runs list doesn't offer a Flaky verdict filter: a run that recovered from
// flakiness is a Passed run there. Flakiness is filtered per-test *inside* a run
// (the spec-file filter still uses the full STATUS_OPTIONS above).
export const RUN_LIST_STATUS_OPTIONS = STATUS_OPTIONS.filter((o) => o.value !== 'flaky');
