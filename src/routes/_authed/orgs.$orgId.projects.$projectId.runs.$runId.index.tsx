import { createFileRoute } from '@tanstack/react-router';
import { Flex } from '@/components/ui/flex';
import { RunOverview } from '@/components/runs/RunOverview';
import { RunSplitLayout } from '@/components/runs/RunSplitLayout';
import { RunTimeline } from '@/components/runs/RunTimeline';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { type RunStatusFilter } from '@/components/runs/status-filter';
import { privateSeo } from '@/lib/seo';

const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed', 'flaky'];

/** Which view of the run is shown: the spec-file list (default) or the timeline. */
export type RunView = 'files' | 'timeline';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/$runId/')({
  head: () => privateSeo('Run'),
  // The spec-file status filter and the view mode live in the URL so they survive
  // refresh and are shareable; the defaults ('all' / 'files') stay out of the URL.
  validateSearch: (search: Record<string, unknown>): { status?: RunStatusFilter; view?: RunView } => {
    const s = search.status as RunStatusFilter;
    const v = search.view as RunView;
    return {
      status: STATUSES.includes(s) && s !== 'all' ? s : undefined,
      view: v === 'timeline' ? 'timeline' : undefined,
    };
  },
  component: RunDetailPage,
});

/**
 * The run detail. On web the spec-file list shows the master-detail split (with an
 * empty prompt on the right until a spec file is opened, which routes to `/file`);
 * the timeline is a single full-width column. On mobile it's always one column, and
 * opening a file navigates to the file page.
 */
function RunDetailPage() {
  const { orgId, projectId, runId } = Route.useParams();
  const { isMobile } = useIsMobile();

  // Mobile is a single column with a Files/Timeline tab bar (no detail pane).
  if (isMobile) {
    return (
      <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
        <RunOverview orgId={orgId} projectId={projectId} runId={runId} showTimelineTabs />
      </Flex>
    );
  }

  // Web: the spec-file list stays on the left and the detail pane shows the run
  // timeline by default; clicking a file routes to `/file`, which swaps the pane
  // for that file's tests.
  return (
    <RunSplitLayout orgId={orgId} projectId={projectId} runId={runId}>
      <RunTimeline runId={runId} />
    </RunSplitLayout>
  );
}
