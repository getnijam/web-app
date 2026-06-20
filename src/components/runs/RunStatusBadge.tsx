import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { RUN_PILL, type RunDisplayStatus } from './run-status';
import { StatusDot } from './StatusDot';

/** Status badge for a run: tinted shadcn Badge + a dot that pulses while live. */
export function RunStatusBadge({
  status,
  className,
}: {
  status: RunDisplayStatus;
  className?: string;
}) {
  const { label, cls } = RUN_PILL[status];
  return (
    <Badge className={cn('gap-1.5 font-semibold', cls, className)}>
      <StatusDot status={status} />
      {label}
    </Badge>
  );
}
