import { createFileRoute } from '@tanstack/react-router';
import { Flex } from '@/components/ui/flex';
import { RunOverview } from '@/components/runs/RunOverview';
import { RunSplitLayout } from '@/components/runs/RunSplitLayout';
import { EmptyState } from '@/components/states/EmptyState';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { type RunStatusFilter } from '@/components/runs/status-filter';
import { privateSeo } from '@/lib/seo';

const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed', 'flaky'];

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/$runId/')({
  head: () => privateSeo('Run'),
  // The spec-file status filter lives in the URL so it survives refresh and is
  // shareable; 'all' is the default and stays out of the URL.
  validateSearch: (search: Record<string, unknown>): { status?: RunStatusFilter } => {
    const s = search.status as RunStatusFilter;
    return { status: STATUSES.includes(s) && s !== 'all' ? s : undefined };
  },
  component: RunDetailPage,
});

/**
 * The run detail. On web it always shows the master-detail split (with an empty
 * prompt on the right until a spec file is opened, which routes to `/file`); on
 * mobile it's a single column, and opening a file navigates to the file page.
 */
function RunDetailPage() {
  const { orgId, projectId, runId } = Route.useParams();
  const { isMobile } = useIsMobile();

  if (isMobile) {
    return (
      <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
        <RunOverview orgId={orgId} projectId={projectId} runId={runId} />
      </Flex>
    );
  }

  return (
    <RunSplitLayout orgId={orgId} projectId={projectId} runId={runId}>
      <Flex align="center" justify="center" className="h-full">
        <EmptyState
          title="Select a spec file"
          description="Pick a file on the left to see its tests, failures, and artifacts."
        />
      </Flex>
    </RunSplitLayout>
  );
}
