import { Link } from '@tanstack/react-router';
import { Flex } from '@/components/ui/flex';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RunStatusFilter } from './status-filter';

type CountKind = 'passed' | 'failed' | 'flaky' | 'skipped';

/** Where a clickable pill should jump — the run, with its status filter applied. */
type CountLink = { orgId: string; projectId: string; runId: string };

const PILL: Record<CountKind, string> = {
  passed: 'border-success/40 bg-success/15 text-success',
  failed: 'border-destructive/40 bg-destructive/15 text-destructive',
  flaky: 'border-warning/40 bg-warning/15 text-warning',
  skipped: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground',
};

// Each pill maps to the run-detail spec-file filter. `skipped` has no filter, so
// it never becomes a link.
const KIND_STATUS: Partial<Record<CountKind, RunStatusFilter>> = {
  passed: 'passed',
  failed: 'failed',
  flaky: 'flaky',
};

// Tooltip copy, with singular/plural agreement (e.g. "1 test is flaky" vs
// "3 tests are flaky").
const LABEL: Record<CountKind, (n: number) => string> = {
  passed: (n) => `${n} ${n === 1 ? 'test' : 'tests'} passed`,
  failed: (n) => `${n} ${n === 1 ? 'test' : 'tests'} failed`,
  flaky: (n) => `${n} ${n === 1 ? 'test is' : 'tests are'} flaky`,
  skipped: (n) => `${n} ${n === 1 ? 'test' : 'tests'} skipped`,
};

/** A single count as an outlined, color-tinted badge — a link when `link` is set. */
function CountPill({ value, kind, link }: { value: number; kind: CountKind; link?: CountLink }) {
  const className = cn(
    'rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums',
    PILL[kind],
  );
  const status = KIND_STATUS[kind];
  const trigger =
    link && status ? (
      <Link
        to="/orgs/$orgId/projects/$projectId/runs/$runId"
        params={{ orgId: link.orgId, projectId: link.projectId, runId: link.runId }}
        search={{ status }}
        aria-label={`Open run showing only ${status} tests`}
        // z-10 lifts the pill above the row's full-area overlay link so it's
        // independently clickable; the subtle scale signals it's interactive.
        className={cn(className, 'relative z-10 cursor-pointer transition-transform hover:scale-110')}
      >
        {value}
      </Link>
    ) : (
      <span className={className}>{value}</span>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{LABEL[kind](value)}</TooltipContent>
    </Tooltip>
  );
}

/**
 * passed/failed/flaky/skipped counts as small tinted pills; all but passed hidden
 * when zero. Pass `link` to make passed/failed/flaky deep-link into the run with
 * that status filter applied (skipped stays a plain badge — it has no filter).
 */
export function CountDots({
  passed,
  failed,
  flaky,
  skipped = 0,
  link,
}: {
  passed: number;
  failed: number;
  flaky: number;
  skipped?: number;
  link?: CountLink;
}) {
  return (
    <Flex align="center" gap={1.5} className="shrink-0">
      <CountPill value={passed} kind="passed" link={link} />
      {failed > 0 && <CountPill value={failed} kind="failed" link={link} />}
      {flaky > 0 && <CountPill value={flaky} kind="flaky" link={link} />}
      {skipped > 0 && <CountPill value={skipped} kind="skipped" />}
    </Flex>
  );
}
