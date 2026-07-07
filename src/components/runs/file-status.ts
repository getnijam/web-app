import type { RunFileSummary } from '@/client';

export type FileStatus = 'passed' | 'failed' | 'flaky' | 'pending';

/** A spec file's single rolled-up status (planned-but-not-run = pending; then
 *  failed wins, then flaky, else passed). */
export function fileStatus(f: RunFileSummary): FileStatus {
  if (f.pending) return 'pending';
  if (f.failed > 0) return 'failed';
  if (f.flaky > 0) return 'flaky';
  return 'passed';
}
