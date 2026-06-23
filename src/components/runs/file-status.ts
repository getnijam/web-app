import type { RunFileSummary } from '@/client';

export type FileStatus = 'passed' | 'failed' | 'flaky';

/** A spec file's single rolled-up status (failed wins, then flaky, else passed). */
export function fileStatus(f: RunFileSummary): FileStatus {
  if (f.failed > 0) return 'failed';
  if (f.flaky > 0) return 'flaky';
  return 'passed';
}
