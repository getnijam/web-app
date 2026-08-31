import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EXPLORER_TEST_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldBanIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { QuarantineEntry } from '@/client';
import { listProjectQuarantineOptions } from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { displayFile, formatDate } from '@/lib/format';
import { QuarantineHistoryStrip } from './QuarantineHistoryStrip';
import { useQuarantine } from './use-quarantine';

/** Passing this many consecutive runs makes a test a candidate to come back out. */
const READY_AFTER_PASSES = 10;

/** "Quarantined by Ada on Mar 2, 2025", falling back when the user is gone. */
function byLine(entry: QuarantineEntry): string {
  const who = entry.quarantinedBy?.name ?? entry.quarantinedBy?.email ?? 'a removed user';
  return `Quarantined by ${who} on ${formatDate(entry.createdAt)}`;
}

function EntryRow({
  entry,
  orgId,
  projectId,
}: {
  entry: QuarantineEntry;
  orgId: string;
  projectId: string;
}) {
  const isAdmin = useIsOrgAdmin(orgId);
  const { unquarantine, isPending } = useQuarantine(projectId);
  // The whole point of the ledger: say when a test looks ready to come back out, rather
  // than letting it sit here forever the way a `test.skip()` does.
  const ready = entry.consecutivePasses >= READY_AFTER_PASSES;

  return (
    <Flex direction="col" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <Flex align="start" gap={3}>
        <HugeiconsIcon icon={ShieldBanIcon} size={18} className="mt-0.5 shrink-0 text-info" />
        <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
          <Flex
            as={Link}
            to={EXPLORER_TEST_ROUTE}
            params={{ orgId, projectId, testId: entry.testId } as never}
            align="center"
            gap={1.5}
            className="min-w-0 text-sm font-medium hover:underline"
          >
            <Text as="span" truncate className="min-w-0">
              {entry.title ?? entry.testId}
            </Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="shrink-0 opacity-60" />
          </Flex>
          {entry.file && (
            <Text as="span" truncate className="font-mono text-xs text-muted-foreground">
              {displayFile(entry.file)}
            </Text>
          )}
          <Text variant="caption" color="muted">
            {byLine(entry)}
          </Text>
          {entry.reason && (
            <Text variant="caption" color="muted" className="italic">
              {entry.reason}
            </Text>
          )}
        </Flex>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            loading={isPending}
            onClick={() => unquarantine(entry.testId)}
            className="shrink-0"
          >
            Remove
          </Button>
        )}
      </Flex>

      <Flex align="center" justify="between" gap={3} wrap className="pl-7">
        <QuarantineHistoryStrip history={entry.history} orgId={orgId} projectId={projectId} />
        {ready && (
          <Text variant="caption" className="text-success">
            Passed {entry.consecutivePasses} runs in a row, ready to come out
          </Text>
        )}
      </Flex>
    </Flex>
  );
}

/**
 * Every test currently quarantined in a project: what it is, who parked it and when, and
 * how it has behaved since. This is the ledger that `test.skip()` never gives you, so the
 * un-quarantine prompt is the point of the view, not decoration.
 */
export function QuarantineList({ orgId, projectId }: { orgId: string; projectId: string }) {
  const q = useQuery(listProjectQuarantineOptions({ path: { projectId } }));

  if (q.isLoading) {
    return (
      <Flex direction="col" gap={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </Flex>
    );
  }
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  if (q.data.entries.length === 0) {
    return (
      <EmptyState
        title="Nothing is quarantined"
        description="Quarantine a flaky or failing test and it keeps running, but its failures stop marking the run as failed. It shows up here with who parked it and how it has behaved since."
      />
    );
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      {q.data.entries.map((e) => (
        <EntryRow key={e.testId} entry={e} orgId={orgId} projectId={projectId} />
      ))}
    </Card>
  );
}
