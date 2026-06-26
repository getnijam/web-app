import { createFileRoute, redirect } from '@tanstack/react-router';

// Bare `/keys` lands on the ingestion tab, the default the sidebar "Secret
// keys" link points at. Redirect in beforeLoad so there's no blank-Outlet flash.
export const Route = createFileRoute('/_authed/orgs/$orgId/keys/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/orgs/$orgId/keys/ingestion', params: { orgId: params.orgId } });
  },
});
