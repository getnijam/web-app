import { createFileRoute, redirect } from '@tanstack/react-router';
import { ORG_PROJECTS_ROUTE } from '@/lib/routes';

/** Entering an org lands on its projects (Home). */
export const Route = createFileRoute('/_authed/orgs/$orgId/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: ORG_PROJECTS_ROUTE, params: { orgId: params.orgId } });
  },
});
