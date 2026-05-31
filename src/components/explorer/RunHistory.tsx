import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon } from '@hugeicons/core-free-icons';
import type { TestHistoryEntry } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { timeAgo, formatDuration } from '@/lib/format';
import { testStatusMeta } from '@/components/runs/test-status';

const STATUS_BG: Record<string, string> = {
  passed: 'bg-success',
  failed: 'bg-destructive',
  flaky: 'bg-warning',
  skipped: 'bg-muted-foreground/40',
};

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : formatDuration(Math.round(ms / 1000));
}

/**
 * A test's run history: a chronological pass/fail/flaky strip + a newest-first
 * list, each row linking to that run's file detail (this test's spec file).
 */
export function RunHistory({
  history,
  orgId,
  projectId,
  file,
}: {
  history: TestHistoryEntry[];
  orgId: string;
  projectId: string;
  file: string;
}) {
  const newest = [...history].reverse();
  return (
    <Flex direction="col" gap={3}>
      {/* chronological strip (oldest → newest) */}
      <Flex gap={1} wrap>
        {history.map((h) => (
          <span
            key={h.runId}
            title={`${h.status} · ${timeAgo(h.startedAt)}`}
            className={cn('size-3 rounded-sm', STATUS_BG[h.status] ?? 'bg-muted')}
          />
        ))}
      </Flex>

      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        {newest.map((h) => {
          const meta = testStatusMeta(h.status);
          return (
            <Link
              key={h.runId}
              to="/orgs/$orgId/projects/$projectId/runs/$runId/file"
              params={{ orgId, projectId, runId: h.runId }}
              search={{ path: file }}
              className="flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-accent"
            >
              <HugeiconsIcon icon={meta.icon} size={16} className={cn('shrink-0', meta.color)} />
              <Text as="span" variant="code" className="shrink-0 text-sm font-medium">
                #{h.commitSha ? h.commitSha.slice(0, 7) : '———'}
              </Text>
              <Flex align="center" gap={1} className="min-w-0 text-xs text-muted-foreground">
                <HugeiconsIcon icon={GitBranchIcon} size={12} className="shrink-0" />
                <span className="truncate font-mono">{h.branch ?? 'no branch'}</span>
              </Flex>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {timeAgo(h.startedAt)}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {formatMs(h.durationMs)}
              </span>
            </Link>
          );
        })}
      </Flex>
    </Flex>
  );
}
