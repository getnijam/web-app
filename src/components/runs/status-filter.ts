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
