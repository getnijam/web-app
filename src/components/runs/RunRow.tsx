import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitBranchIcon,
  ArrowUpRight01Icon,
  MoreVerticalIcon,
  Delete02Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons';
import type { RunSummary } from '@/client';
import { deleteRunMutation, listProjectRunsQueryKey } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { ConfirmDeleteDialog } from '@/components/settings/ConfirmDeleteDialog';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/users/UserAvatar';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { timeAgo, formatDuration, displayAuthor } from '@/lib/format';
import { CountDots } from './CountDots';
import { RunStatusBadge } from './RunStatusBadge';
import { runDisplayStatus, runDurationSec, RUN_BAR_CLASS } from './run-status';

/** One run in the history list. The whole row links to the run detail. On desktop the
 *  actions menu (Open run source / Delete run) reveals on hover; on mobile (no hover)
 *  the same actions live in a long-press context menu. Deleting a run is admin-only. */
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
  const dur = runDurationSec(run);
  const author = displayAuthor(run.authorEmail, run.authorName);

  const isAdmin = useIsOrgAdmin(orgId);
  const { isMobile } = useIsMobile();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const shortSha = run.commitSha ? run.commitSha.slice(0, 7) : run.id.slice(0, 7);
  const ciRunUrl = run.ciRunUrl;

  const remove = useMutation({
    ...deleteRunMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listProjectRunsQueryKey({ path: { projectId } }),
      });
      setDeleteOpen(false);
      notify.success('Run deleted', {
        description: `Run #${shortSha} and all of its executions and artifacts have been removed.`,
      });
    },
    onError: (err) => {
      setDeleteOpen(false);
      notify.error("Couldn't delete run", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  // The menu only appears when there's something to do: open the CI run or
  // (for admins) delete the run.
  const showMenu = !!ciRunUrl || isAdmin;

  const row = (
    <Flex
      align="center"
      data-hover-item
      className="group relative border-b border-border transition-colors last:border-b-0"
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
              #{run.commitSha ? run.commitSha.slice(0, 7) : '---'}
            </Text>
            <RunStatusBadge status={ds} className="shrink-0" />
            {run.shardTotal != null && run.shardTotal > 1 && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {run.shardTotal} shards
              </span>
            )}
            {run.environment && (
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {run.environment}
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
            <Text as="span" className="font-mono text-xs text-muted-foreground tabular-nums">
              {formatDuration(dur)}
            </Text>
          )}
          {run.stats && (
            <CountDots
              passed={run.stats.passed}
              failed={run.stats.failed}
              flaky={run.stats.flaky}
              skipped={run.stats.skipped}
              link={{ orgId, projectId, runId: run.id }}
            />
          )}
          {/* Desktop: hover-revealed actions menu. Mobile uses the context menu below. */}
          {showMenu && !isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Run actions"
                  className="relative z-10 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ciRunUrl && (
                  <DropdownMenuItem asChild>
                    <a href={ciRunUrl} target="_blank" rel="noreferrer">
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
                      Open run source
                    </a>
                  </DropdownMenuItem>
                )}
                {ciRunUrl && isAdmin && <DropdownMenuSeparator />}
                {isAdmin && (
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                    Delete run
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <>
      {isMobile ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem asChild>
              <Link
                to="/orgs/$orgId/projects/$projectId/runs/$runId"
                params={{ orgId, projectId, runId: run.id }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
                Open in new tab
              </Link>
            </ContextMenuItem>
            {ciRunUrl && (
              <ContextMenuItem asChild>
                <a href={ciRunUrl} target="_blank" rel="noopener noreferrer">
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
                  Open run source
                </a>
              </ContextMenuItem>
            )}
            {isAdmin && <ContextMenuSeparator />}
            {isAdmin && (
              <ContextMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <HugeiconsIcon icon={Delete02Icon} size={16} />
                Delete run
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        row
      )}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this run?"
        description={
          <>
            Run #{shortSha} and all of its executions, attachments, and stored files will be
            permanently deleted. This can&rsquo;t be undone.
          </>
        }
        confirmText="delete"
        confirmLabel="Delete run"
        loading={remove.isPending}
        onConfirm={() => remove.mutate({ path: { id: run.id } })}
      />
    </>
  );
}
