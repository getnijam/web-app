import { createFileRoute, redirect } from '@tanstack/react-router';
import { RUNS_ROUTE } from '@/lib/routes';

/** Opening a project defaults to its Runs page. */
export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: RUNS_ROUTE,
      params: { orgId: params.orgId, projectId: params.projectId },
    });
  },
});
