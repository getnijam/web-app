import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getRunLocationOptions } from '@/client/@tanstack/react-query.gen';
import { LoadingState } from '@/components/states/LoadingState';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { RUN_ROUTE } from '@/lib/routes';
import { privateSeo } from '@/lib/seo';

/**
 * Short run link `/r/:runId`. The reporter prints this in CI logs (short enough that
 * GitHub doesn't ellipsize it); it resolves the run's org + project and redirects to
 * the full dashboard URL. Auth is handled by the `_authed` layout, an unauthenticated
 * visitor bounces through login and lands back here.
 */
export const Route = createFileRoute('/_authed/r/$runId')({
  head: () => privateSeo('Run'),
  component: RunShortLinkPage,
});

function RunShortLinkPage() {
  const { runId } = Route.useParams();
  const q = useQuery({ ...getRunLocationOptions({ path: { id: runId } }), retry: false });

  if (q.isLoading) return <LoadingState />;
  if (q.error || !q.data) return <DashboardNotFound />;
  return (
    <Navigate
      to={RUN_ROUTE}
      params={{ orgId: q.data.orgId, projectId: q.data.projectId, runId: q.data.runId }}
      replace
    />
  );
}
