import { createFileRoute } from '@tanstack/react-router';
import { ByocSettings } from '@/components/byoc/ByocSettings';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/settings/byoc')({
  head: () => privateSeo('Bring your own cloud'),
  component: ByocTab,
});

function ByocTab() {
  const { orgId } = Route.useParams();
  return <ByocSettings orgId={orgId} />;
}
