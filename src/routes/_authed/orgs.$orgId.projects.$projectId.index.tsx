import { createFileRoute, redirect } from '@tanstack/react-router';

/** Opening a project defaults to its Runs page. */
export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/orgs/$orgId/projects/$projectId/runs',
      params: { orgId: params.orgId, projectId: params.projectId },
    });
  },
});
