import { createFileRoute, redirect } from '@tanstack/react-router';
import { ORG_KEYS_INGESTION_ROUTE } from '@/lib/routes';

// Bare `/keys` lands on the ingestion tab, the default the sidebar "Secret
// keys" link points at. Redirect in beforeLoad so there's no blank-Outlet flash.
export const Route = createFileRoute('/_authed/orgs/$orgId/keys/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: ORG_KEYS_INGESTION_ROUTE, params: { orgId: params.orgId } });
  },
});
