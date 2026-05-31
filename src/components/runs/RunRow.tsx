import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import type { RunSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/users/UserAvatar';
import { timeAgo, formatDuration } from '@/lib/format';
import { CountDots } from './CountDots';
import { runDisplayStatus, runDurationSec, RUN_BAR_CLASS, RUN_PILL } from './run-status';

/** One run in the history list. The whole row links to the run detail; the
 *  View-on-CI link sits above the overlay so it stays independently clickable. */
export function RunRow({
  run,
  orgId,
  projectId,
}: {
  run: RunSummary;
  orgId: string;
  projectId: string;
}) {
  const ds = runDisplayStatus(run);
  const pill = RUN_PILL[ds];
  const dur = runDurationSec(run);
  const author = run.authorEmail ?? run.authorName ?? 'unknown';

  return (
    <Flex
      align="center"
      className="group relative border-b border-border transition-colors last:border-b-0 hover:bg-accent/40"
    >
      <Link
        to="/orgs/$orgId/projects/$projectId/runs/$runId"
        params={{ orgId, projectId, runId: run.id }}
        aria-label={`Run ${run.commitSha ? run.commitSha.slice(0, 7) : run.id}`}
        className="absolute inset-0 z-0"
      />
      {/* short, rounded status indicator (vertically centered) */}
      <div className={cn('ml-3 h-9 w-1 shrink-0 rounded-full', RUN_BAR_CLASS[ds])} />
      <Flex align="center" gap={4} wrap className="min-w-0 flex-1 px-4 py-3">
        <Flex direction="col" gap={1} className="min-w-0 flex-1">
          <Flex align="center" gap={2} className="min-w-0">
            <Text as="span" variant="code" className="font-medium">
              #{run.commitSha ? run.commitSha.slice(0, 7) : '———'}
            </Text>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                pill.cls,
              )}
            >
              <span className={cn('size-1.75 rounded-full', pill.dot)} />
              {pill.label}
            </span>
            {run.shardTotal != null && run.shardTotal > 1 && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {run.shardTotal} shards
              </span>
            )}
          </Flex>
          <Flex align="center" gap={2.5} wrap className="min-w-0 text-xs text-muted-foreground">
            <span>{timeAgo(run.startedAt)}</span>
            <Flex align="center" gap={1} className="min-w-0">
              <HugeiconsIcon icon={GitBranchIcon} size={13} className="shrink-0" />
              <span className="truncate font-mono">{run.branch ?? 'no branch'}</span>
            </Flex>
            <Flex align="center" gap={1.5} className="min-w-0">
              <UserAvatar name={run.authorName} email={author} size="sm" />
              <span className="truncate">{author}</span>
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center" gap={4} className="shrink-0">
          {dur !== null && (
            <Text as="span" className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatDuration(dur)}
            </Text>
          )}
          {run.stats && (
            <CountDots
              passed={run.stats.passed}
              failed={run.stats.failed}
              flaky={run.stats.flaky}
            />
          )}
          {run.ciRunUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Open run in new tab"
                  className="relative z-10 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <a href={run.ciRunUrl} target="_blank" rel="noreferrer">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open run in new tab</TooltipContent>
            </Tooltip>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
