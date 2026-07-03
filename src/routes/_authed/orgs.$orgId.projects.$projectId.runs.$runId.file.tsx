import { createFileRoute, Link } from '@tanstack/react-router';
import { RUN_ROUTE } from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { getRunOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states/ErrorState';
import { RunFileSkeleton } from '@/components/runs/RunSkeletons';
import { RunFileTests } from '@/components/runs/RunFileTests';
import { RunSplitLayout } from '@/components/runs/RunSplitLayout';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { type RunStatusFilter } from '@/components/runs/status-filter';
import { privateSeo } from '@/lib/seo';

const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed', 'flaky'];

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/$runId/file')({
  head: () => privateSeo('Run file'),
  component: FileDetailPage,
  // `path` selects the spec file. `status` is the spec-list filter carried by the
  // left pane in the web split (mirrors the run route so it survives the jump here).
  validateSearch: (search: Record<string, unknown>): { path: string; status?: RunStatusFilter } => {
    const s = search.status as RunStatusFilter;
    return {
      path: typeof search.path === 'string' ? search.path : '',
      status: STATUSES.includes(s) && s !== 'all' ? s : undefined,
    };
  },
});

/**
 * The tests inside a spec file. On web it renders side-by-side with the run detail
 * (the whole thing is this one route, so the URL is shareable); on mobile it renders
 * on its own with the run back bar, the same file view minus the second pane.
 */
function FileDetailPage() {
  const { orgId, projectId, runId } = Route.useParams();
  const { path } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { isMobile } = useIsMobile();

  const run = useQuery(getRunOptions({ path: { id: runId } }));

  if (run.isLoading) return <RunFileSkeleton />;
  if (run.error || !run.data) return <ErrorState error={run.error} onRetry={() => run.refetch()} />;

  const runData = run.data.run;
  const fileSummary = run.data.files.find((f) => f.file === path);
  const commit = runData.commitSha ? runData.commitSha.slice(0, 7) : '---';

  if (isMobile) {
    return (
      <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
        {/* back bar */}
        <Flex align="center" justify="between" gap={3}>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 rounded-lg text-muted-foreground"
          >
            <Link to={RUN_ROUTE} params={{ orgId, projectId, runId }}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />#{commit}
            </Link>
          </Button>
          {runData.ciRunUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={runData.ciRunUrl} target="_blank" rel="noreferrer">
                View run on {runData.ciProvider ?? 'CI'}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
              </a>
            </Button>
          )}
        </Flex>

        <RunFileTests
          orgId={orgId}
          projectId={projectId}
          runId={runId}
          path={path}
          fileSummary={fileSummary}
          shardTotal={runData.shardTotal}
        />
      </Flex>
    );
  }

  // Web: full-height split from the top, run detail left + this file's tests right.
  return (
    <RunSplitLayout orgId={orgId} projectId={projectId} runId={runId} selectedFile={path}>
      <RunFileTests
        orgId={orgId}
        projectId={projectId}
        runId={runId}
        path={path}
        fileSummary={fileSummary}
        shardTotal={runData.shardTotal}
        onClose={() =>
          navigate({
            to: RUN_ROUTE,
            params: { orgId, projectId, runId },
          })
        }
      />
    </RunSplitLayout>
  );
}
