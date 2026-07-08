import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  ChartBarStackedIcon,
  File01Icon,
  GitBranchIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { getRunOptions } from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverHighlight } from '@/components/ui/hover-highlight';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { UserAvatar } from '@/components/users/UserAvatar';
import { RunDetailBodySkeleton, RunDetailColumnSkeleton } from './RunSkeletons';
import { RunSummaryBar } from './RunSummaryBar';
import { RunStatusBadge } from './RunStatusBadge';
import { RunTimeline } from './RunTimeline';
import { AttemptSwitcher } from './AttemptSwitcher';
import { SpecFileRow } from './SpecFileRow';
import { fileStatus } from './file-status';
import { STATUS_OPTIONS, type RunStatusFilter } from './status-filter';
import { type RunView } from '@/routes/_authed/orgs.$orgId.projects.$projectId.runs.$runId.index';
import { runDisplayStatus } from './run-status';
import { timeAgo, displayAuthor } from '@/lib/format';
import { gitBranchUrl, gitProviderIcon } from '@/lib/git';
import { RUNS_ROUTE } from '@/lib/routes';

const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed', 'flaky'];

/**
 * The run-detail column: back bar, header, attempt switcher, summary, and the
 * spec-files list. Owns the run query (polling + clubbed-attempt switching) and
 * its own loading/error states, and returns a container-free fragment so it can be
 * dropped into either the standalone run page or the left half of the file page's
 * side-by-side split. The spec-file status filter reads/writes the current route's
 * `?status=` (works on whichever route is hosting it); `selectedFile` highlights
 * the open row when shown beside the file pane.
 */
export function RunOverview({
  orgId,
  projectId,
  runId,
  selectedFile,
  showTimelineTabs = false,
}: {
  orgId: string;
  projectId: string;
  runId: string;
  selectedFile?: string;
  /**
   * Single-column (mobile) mode: render a Files/Timeline tab bar here. On web the
   * timeline lives permanently in the split's detail pane, so this stays false and
   * this column is just the spec-file list.
   */
  showTimelineTabs?: boolean;
}) {
  const navigate = useNavigate();
  // Read/write `?status=`/`?view=` on whatever route hosts this component (run or file).
  const search = useSearch({ strict: false }) as { status?: RunStatusFilter; view?: RunView };
  const status: RunStatusFilter =
    search.status && STATUSES.includes(search.status) ? search.status : 'all';
  const setStatus = (next: string) =>
    navigate({
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        status: next === 'all' ? undefined : next,
      })) as never,
      replace: true,
    });
  // The timeline is a run-page-only view; when this column sits beside an open file
  // (`selectedFile`), we always show the spec-file list.
  const view: RunView = search.view === 'timeline' && !selectedFile ? 'timeline' : 'files';
  const setView = (next: RunView) =>
    navigate({
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        view: next === 'timeline' ? 'timeline' : undefined,
      })) as never,
      replace: true,
    });

  // While the run is in-progress, poll every 30s so Running→Failing→terminal updates
  // live. Stops once finalized. keepPreviousData: switching clubbed attempts changes
  // the runId (a new query key), so instead of blanking we keep the prior attempt and
  // only skeleton the body while the next loads.
  const q = useQuery({
    ...getRunOptions({ path: { id: runId } }),
    refetchInterval: (query) => (query.state.data?.run.finishedAt ? false : 30_000),
    placeholderData: keepPreviousData,
  });

  if (q.isLoading) return <RunDetailColumnSkeleton />;
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;

  const switching = q.isPlaceholderData;
  const { run, summary, files, group } = q.data;
  const ds = runDisplayStatus(run);
  const author = displayAuthor(run.authorEmail, run.authorName);
  const branchHref = gitBranchUrl(run);

  const visibleFiles = status === 'all' ? files : files.filter((f) => fileStatus(f) === status);
  const activeLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label.toLowerCase() ?? status;

  function renderFiles() {
    if (files.length === 0)
      return (
        <EmptyState
          title="No test results"
          description="This run has no recorded test executions yet."
        />
      );
    if (visibleFiles.length === 0)
      return (
        <EmptyState
          title={`No ${activeLabel} spec files`}
          description="No spec files match this filter, clear it to see the rest."
        />
      );
    return visibleFiles.map((f) => (
      <SpecFileRow
        key={f.file}
        file={f}
        orgId={orgId}
        projectId={projectId}
        runId={runId}
        selected={f.file === selectedFile}
      />
    ));
  }

  function renderSpecFilesPanel() {
    return (
      <Card className="flex flex-col overflow-hidden">
        <Flex
          align="center"
          justify="between"
          gap={3}
          wrap
          className="border-b border-border px-5 py-4"
        >
          <Flex align="center" gap={3}>
            <Text variant="h4">Spec files</Text>
            <Text as="span" className="text-sm text-muted-foreground tabular-nums">
              {status === 'all' ? files.length : `${visibleFiles.length} of ${files.length}`}
            </Text>
          </Flex>
          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              {STATUS_OPTIONS.map((o) => (
                <TabsTrigger key={o.value} value={o.value}>
                  {o.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Flex>

        {/* Make it obvious the list is filtered, with a one-click way out. */}
        {status !== 'all' && (
          <Flex
            align="center"
            justify="between"
            gap={2}
            className="border-b border-border bg-muted/40 px-5 py-2.5"
          >
            <Text as="span" className="text-sm text-muted-foreground">
              Showing only <span className="font-medium text-foreground">{activeLabel}</span> spec
              files
            </Text>
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 text-muted-foreground"
              onClick={() => setStatus('all')}
            >
              Show all
            </Button>
          </Flex>
        )}

        <HoverHighlight inset={4} highlightClassName="rounded-lg bg-accent">
          {renderFiles()}
        </HoverHighlight>
      </Card>
    );
  }

  // Mobile only: a Files/Timeline tab bar (line variant, like the keys page) that
  // swaps this single column's body. On web the timeline is always in the detail
  // pane, so this isn't rendered there.
  function renderTabbed() {
    return (
      <Tabs value={view} onValueChange={(v) => setView(v as RunView)}>
        <TabsList variant="line" className="justify-start gap-5">
          <TabsTrigger value="files" className="flex-none px-1 after:bg-primary">
            <HugeiconsIcon icon={File01Icon} size={16} />
            Files
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex-none px-1 after:bg-primary">
            <HugeiconsIcon icon={ChartBarStackedIcon} size={16} />
            Timeline
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="mt-4">
          {renderSpecFilesPanel()}
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <RunTimeline runId={runId} />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <>
      {/* back bar */}
      <Flex align="center" justify="between" gap={3}>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 rounded-lg text-muted-foreground"
        >
          <Link to={RUNS_ROUTE} params={{ orgId, projectId }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Runs
          </Link>
        </Button>
        <Flex align="center" gap={2}>
          <Button variant="outline" size="sm" loading={q.isRefetching} onClick={() => q.refetch()}>
            {!q.isRefetching && <HugeiconsIcon icon={RefreshIcon} size={15} />}
            Refresh
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
      </Flex>

      {/* header */}
      <Flex align="start" justify="between" gap={4} className="flex-wrap">
        <Flex direction="col" gap={2}>
          <Flex align="center" gap={2.5} wrap>
            <RunStatusBadge status={ds} />
            <Text variant="code" className="text-lg font-semibold">
              #{run.commitSha ? run.commitSha.slice(0, 7) : '---'}
            </Text>
            {run.attemptCount > 1 && (
              <Text
                as="span"
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {run.attemptCount} attempts
              </Text>
            )}
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
            {run.triggeredBy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Flex align="center" gap={1.5} className="cursor-help">
                    <UserAvatar name={run.triggeredBy} email="" size="sm" />
                    <span>{run.triggeredBy}</span>
                  </Flex>
                </TooltipTrigger>
                <TooltipContent>Triggered by {run.triggeredBy}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Flex align="center" gap={1.5} className="cursor-help">
                  <UserAvatar name={run.authorName} email={author} size="sm" />
                  <span>{author}</span>
                </Flex>
              </TooltipTrigger>
              <TooltipContent>Last commit by {author}</TooltipContent>
            </Tooltip>
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
            {/* No shard/machine breakdown reported (pytest, or an un-sharded run):
                surface that execution was still distributed rather than one lane. */}
            {(run.shardTotal == null || run.shardTotal <= 1) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">Ran across multiple machines</span>
                </TooltipTrigger>
                <TooltipContent>
                  No shard breakdown was reported, so tests may have run in parallel across workers
                  or machines.
                </TooltipContent>
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </Flex>

      {group && (
        <AttemptSwitcher group={group} orgId={orgId} projectId={projectId} currentRunId={runId} />
      )}

      {switching ? (
        <RunDetailBodySkeleton />
      ) : (
        <>
          <RunSummaryBar summary={summary} />
          {showTimelineTabs ? renderTabbed() : renderSpecFilesPanel()}
        </>
      )}
    </>
  );
}
