import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getProjectOptions } from '@/client/@tanstack/react-query.gen';

/** Project layout — warms the project query for the breadcrumb + sidebar switcher. */
export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId')({
  loader: ({ context, params }) =>
    context.queryClient
      .ensureQueryData(getProjectOptions({ path: { id: params.projectId } }))
      .catch(() => null),
  component: () => <Outlet />,
});
