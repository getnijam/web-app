import { createFileRoute, redirect } from '@tanstack/react-router';

/** Entering an org lands on its projects (Home). */
export const Route = createFileRoute('/_authed/orgs/$orgId/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/orgs/$orgId/projects', params: { orgId: params.orgId } });
  },
});
