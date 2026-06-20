import { cn } from '@/lib/utils';

import { RUN_PILL, type RunDisplayStatus } from './run-status';

/** Live, in-progress statuses whose dot animates with a radar ping. */
const PULSING: ReadonlySet<RunDisplayStatus> = new Set(['running', 'failing']);

/** The colored status dot used inside run pills — pulses while a run is live. */
export function StatusDot({ status }: { status: RunDisplayStatus }) {
  const { dot } = RUN_PILL[status];
  if (!PULSING.has(status)) {
    return <span className={cn('size-1.75 rounded-full', dot)} />;
  }
  return (
    <span className="relative inline-flex size-1.75">
      <span
        className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-75', dot)}
      />
      <span className={cn('relative inline-flex size-1.75 rounded-full', dot)} />
    </span>
  );
}
