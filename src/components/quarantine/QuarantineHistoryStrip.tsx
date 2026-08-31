import { Link } from '@tanstack/react-router';
import { RUN_ROUTE } from '@/lib/routes';
import type { QuarantineHistoryEntry } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const DOT: Record<string, string> = {
  passed: 'bg-success',
  failed: 'bg-destructive',
  flaky: 'bg-warning',
  skipped: 'bg-muted-foreground/40',
};

const LABEL: Record<string, string> = {
  passed: 'Passed',
  failed: 'Failed',
  flaky: 'Flaky',
  skipped: 'Skipped',
};

/**
 * A quarantined test's recent runs as a compact strip, oldest on the left so it reads
 * left-to-right like a timeline. Each dot links to its run. This is the evidence behind
 * the un-quarantine prompt: a run of green here is what says the test is ready to come
 * back out.
 */
export function QuarantineHistoryStrip({
  history,
  orgId,
  projectId,
}: {
  history: QuarantineHistoryEntry[];
  orgId: string;
  projectId: string;
}) {
  if (history.length === 0) {
    return (
      <Text variant="caption" color="muted">
        No runs yet
      </Text>
    );
  }
  // The API returns newest first; render oldest first so the strip reads as time passing.
  const ordered = [...history].reverse();
  return (
    <Flex align="center" gap={1} className="shrink-0">
      {ordered.map((h) => (
        <Tooltip key={h.runId}>
          <TooltipTrigger asChild>
            <Link
              to={RUN_ROUTE}
              params={{ orgId, projectId, runId: h.runId }}
              aria-label={`${LABEL[h.status] ?? h.status} on ${formatDateTime(h.startedAt)}`}
              className={cn(
                'size-2 rounded-full transition-transform hover:scale-150',
                DOT[h.status] ?? 'bg-muted-foreground/40',
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            {LABEL[h.status] ?? h.status} · {formatDateTime(h.startedAt)}
          </TooltipContent>
        </Tooltip>
      ))}
    </Flex>
  );
}
