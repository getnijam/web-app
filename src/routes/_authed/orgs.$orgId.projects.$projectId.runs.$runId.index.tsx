import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  GitBranchIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { getRunOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { UserAvatar } from '@/components/users/UserAvatar';
import { RunDetailSkeleton } from '@/components/runs/RunSkeletons';
import { RunSummaryBar } from '@/components/runs/RunSummaryBar';
import { SpecFileRow } from '@/components/runs/SpecFileRow';
import { runDisplayStatus, RUN_PILL } from '@/components/runs/run-status';
import { cn } from '@/lib/utils';
import { timeAgo, displayAuthor } from '@/lib/format';
import { gitBranchUrl, gitProviderIcon } from '@/lib/git';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/$runId/')({
  head: () => privateSeo('Run'),
  component: RunDetailPage,
});

function RunDetailPage() {
  const { orgId, projectId, runId } = Route.useParams();
  // While the run is in-progress, poll every 30s so Running→Failing→terminal updates
  // live (sharded runs stay open until their post-matrix /complete step). Stops once
  // finalized/canceled.
  const q = useQuery({
    ...getRunOptions({ path: { id: runId } }),
    refetchInterval: (query) => (query.state.data?.run.finishedAt ? false : 30_000),
  });

  if (q.isLoading) return <RunDetailSkeleton />;
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;

  const { run, summary, files } = q.data;
  const pill = RUN_PILL[runDisplayStatus(run)];
  const author = displayAuthor(run.authorEmail, run.authorName);
  const branchHref = gitBranchUrl(run);

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      {/* back bar */}
      <Flex align="center" justify="between" gap={3}>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link to="/orgs/$orgId/projects/$projectId/runs" params={{ orgId, projectId }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Runs
          </Link>
        </Button>
        {run.ciRunUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={run.ciRunUrl} target="_blank" rel="noreferrer">
              View run on {run.ciProvider ?? 'CI'}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
            </a>
          </Button>
        )}
      </Flex>

      {/* header */}
      <Flex align="start" justify="between" gap={4} className="flex-wrap">
        <Flex direction="col" gap={2}>
          <Flex align="center" gap={2.5} wrap>
            <Flex
              as="span"
              inline
              align="center"
              gap={1.5}
              className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', pill.cls)}
            >
              <span className={cn('size-1.75 rounded-full', pill.dot)} />
              {pill.label}
            </Flex>
            <Text variant="code" className="text-lg font-semibold">
              #{run.commitSha ? run.commitSha.slice(0, 7) : '———'}
            </Text>
            {run.shardTotal != null && run.shardTotal > 1 && (
              <Text
                as="span"
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {run.shardTotal} shards
              </Text>
            )}
          </Flex>
          <Flex align="center" gap={2.5} wrap className="text-sm text-muted-foreground">
            <span>{timeAgo(run.startedAt)}</span>
            <Flex align="center" gap={1}>
              <HugeiconsIcon icon={GitBranchIcon} size={14} className="shrink-0" />
              {run.branch && branchHref ? (
                <a
                  href={branchHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono transition-colors hover:text-foreground hover:underline"
                >
                  {run.branch}
                </a>
              ) : (
                <span className="font-mono">{run.branch ?? 'no branch'}</span>
              )}
            </Flex>
            <Flex align="center" gap={1.5}>
              <UserAvatar name={run.authorName} email={author} size="sm" />
              <span>{author}</span>
            </Flex>
            {run.ciProvider && (
              <Flex align="center" gap={1}>
                <HugeiconsIcon
                  icon={gitProviderIcon(run.ciProvider)}
                  size={14}
                  className="shrink-0"
                />
                <span>via {run.ciProvider}</span>
              </Flex>
            )}
          </Flex>
        </Flex>
        <Button variant="outline" size="sm" loading={q.isRefetching} onClick={() => q.refetch()}>
          {!q.isRefetching && <HugeiconsIcon icon={RefreshIcon} size={15} />}
          Refresh
        </Button>
      </Flex>

      <RunSummaryBar summary={summary} />

      {/* spec files */}
      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        <Flex align="center" justify="between" className="border-b border-border px-5 py-4">
          <Text variant="h4">Spec files</Text>
          <Text as="span" className="text-sm text-muted-foreground tabular-nums">
            {files.length}
          </Text>
        </Flex>
        {files.length === 0 ? (
          <EmptyState
            title="No test results"
            description="This run has no recorded test executions yet."
          />
        ) : (
          files.map((f) => (
            <SpecFileRow key={f.file} file={f} orgId={orgId} projectId={projectId} runId={runId} />
          ))
        )}
      </Flex>
    </Flex>
  );
}
