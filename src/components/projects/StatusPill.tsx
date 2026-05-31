import { cn } from '@/lib/utils';

export type PillStatus = 'pass' | 'fail' | 'flaky' | 'new';

const MAP: Record<PillStatus, { label: string; cls: string; dot: string }> = {
  pass: { label: 'Passing', cls: 'bg-success/15 text-success', dot: 'bg-success' },
  fail: { label: 'Failing', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  flaky: { label: 'Flaky', cls: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  new: { label: 'No runs', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

export function StatusPill({ status }: { status: PillStatus }) {
  const { label, cls, dot } = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.75 text-xs font-semibold',
        cls,
      )}
    >
      <span className={cn('size-1.75 rounded-full', dot)} />
      {label}
    </span>
  );
}
