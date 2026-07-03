import { Link } from '@tanstack/react-router';
import { RUN_FILE_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon } from '@hugeicons/core-free-icons';
import type { TestHistoryEntry } from '@/client';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { HoverHighlight } from '@/components/ui/hover-highlight';
import { cn } from '@/lib/utils';
import { timeAgo, formatDuration, formatDateTime } from '@/lib/format';
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
 * A test's run history card: a header with the pass tally, a chronological
 * pass/fail/flaky strip, and a newest-first list, each row linking to that
 * run's file detail (this test's spec file).
 */
export function RunHistory({
  history,
  orgId,
  projectId,
  file,
  className,
  onNavigate,
}: {
  history: TestHistoryEntry[];
  orgId: string;
  projectId: string;
  file: string;
  /** Constrain the card height; the run list then scrolls inside it. */
  className?: string;
  /** Fired when a run row is clicked (e.g. to close the sheet hosting this list). */
  onNavigate?: () => void;
}) {
  const newest = [...history].reverse();
  // Flaky runs ultimately passed (after a retry), so they count as passed, not failed.
  const passed = history.filter((h) => h.status === 'passed' || h.status === 'flaky').length;

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <Flex
        align="center"
        justify="between"
        gap={3}
        className="shrink-0 border-b border-border px-4 py-3"
      >
        <Text as="span" className="text-sm font-semibold">
          Run history
        </Text>
        <Text as="span" className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {passed} / {history.length} passed
        </Text>
      </Flex>

      {/* chronological strip (oldest → newest), filling the card width */}
      {history.length > 0 && (
        <Flex gap={1} className="shrink-0 border-b border-border px-4 py-3">
          {history.map((h) => (
            <span
              key={h.runId}
              title={`${h.status} · ${timeAgo(h.startedAt)}`}
              className={cn('h-8 max-w-2.5 flex-1 rounded-full', STATUS_BG[h.status] ?? 'bg-muted')}
            />
          ))}
        </Flex>
      )}

      <HoverHighlight
        inset={4}
        highlightClassName="rounded-lg bg-accent"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {newest.map((h) => {
          const meta = testStatusMeta(h.status);
          return (
            <Flex
              as={Link}
              key={h.runId}
              to={RUN_FILE_ROUTE}
              params={{ orgId, projectId, runId: h.runId } as never}
              search={{ path: file } as never}
              onClick={onNavigate}
              data-hover-item
              align="stretch"
              gap={3}
              className="border-b border-border px-4 py-3 transition-colors last:border-b-0"
            >
              <span
                className={cn('w-1 shrink-0 rounded-full', STATUS_BG[h.status] ?? 'bg-muted')}
              />
              <Flex direction="col" gap={1} className="min-w-0 flex-1">
                <Flex align="center" justify="between" gap={2}>
                  <Text as="span" variant="code" truncate className="text-sm font-semibold">
                    #{h.commitSha ? h.commitSha.slice(0, 7) : '---'}
                  </Text>
                  <Flex align="center" gap={2.5} className="shrink-0">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {formatMs(h.durationMs)}
                    </span>
                    <Flex
                      as="span"
                      inline
                      align="center"
                      className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', meta.pill)}
                    >
                      {meta.label}
                    </Flex>
                  </Flex>
                </Flex>
                <span className="text-xs text-muted-foreground">{formatDateTime(h.startedAt)}</span>
                <Flex align="center" gap={1} className="min-w-0 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={GitBranchIcon} size={12} className="shrink-0" />
                  <span className="truncate font-mono">{h.branch ?? 'no branch'}</span>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </HoverHighlight>
    </Card>
  );
}
