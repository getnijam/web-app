import type { RunFileSummary } from '@/client';
import type { RunStatusFilter } from './status-filter';

export type FileStatus = 'passed' | 'failed' | 'flaky' | 'quarantined' | 'pending';

/** A spec file's single rolled-up status (planned-but-not-run = pending; then blocking
 *  failures win, then quarantined failures, then flaky, else passed). */
export function fileStatus(f: RunFileSummary): FileStatus {
  if (f.pending) return 'pending';
  // Quarantined failures are a subset of `failed`, so a file whose failures are ALL
  // quarantined is not a blocking failure; it is green but not clean.
  if (f.failed - f.quarantined > 0) return 'failed';
  if (f.quarantined > 0) return 'quarantined';
  if (f.flaky > 0) return 'flaky';
  return 'passed';
}

/**
 * Does a spec file belong under the run-detail filter?
 *
 * `passed` and `failed` match the file's single rolled-up verdict, but `flaky` and
 * `quarantined` match "contains any". A file with one real failure and one quarantined
 * failure rolls up to `failed`, yet it genuinely does hold a quarantined test, and the
 * point of those two filters is to FIND those tests rather than to classify the file.
 */
export function matchesStatusFilter(f: RunFileSummary, status: RunStatusFilter): boolean {
  if (status === 'all') return true;
  if (status === 'quarantined') return f.quarantined > 0;
  if (status === 'flaky') return f.flaky > 0;
  return fileStatus(f) === status;
}
