import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getProjectOptions } from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { RunOverview } from '@/components/runs/RunOverview';
import { RunSplitLayout } from '@/components/runs/RunSplitLayout';
import { RunTimeline } from '@/components/runs/RunTimeline';
import { EmptyState } from '@/components/states/EmptyState';
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

  // The timeline is Playwright-only (it needs per-attempt timing/browser data the
  // other reporters don't send). Non-Playwright projects get the plain file view
  // with no timeline and no Files/Timeline tabs. Null framework = Playwright.
  const project = useQuery(getProjectOptions({ path: { id: projectId } }));
  const timelineEnabled = (project.data?.testFramework ?? 'playwright') === 'playwright';

  // Mobile is a single column; Playwright projects get a Files/Timeline tab bar,
  // others just the spec-file list.
  if (isMobile) {
    return (
      <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
        <RunOverview
          orgId={orgId}
          projectId={projectId}
          runId={runId}
          showTimelineTabs={timelineEnabled}
        />
      </Flex>
    );
  }

  // Web: the spec-file list stays on the left. For Playwright the detail pane shows
  // the run timeline by default; otherwise it's the "pick a file" prompt. Clicking a
  // file routes to `/file`, which swaps the pane for that file's tests either way.
  return (
    <RunSplitLayout orgId={orgId} projectId={projectId} runId={runId}>
      {timelineEnabled ? (
        <RunTimeline runId={runId} />
      ) : (
        <Flex align="center" justify="center" className="h-full">
          <Card className="max-w-md px-6">
            <EmptyState
              title="Select a spec file"
              description="Pick a file on the left to see its tests, failures, and artifacts."
            />
          </Card>
        </Flex>
      )}
    </RunSplitLayout>
  );
}
