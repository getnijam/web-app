import { createFileRoute } from '@tanstack/react-router';
import { IntegrationsList } from '@/components/integrations/IntegrationsList';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/integrations/')({
  head: () => privateSeo('Integrations'),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { orgId } = Route.useParams();
  return <IntegrationsList orgId={orgId} />;
}
