import { createFileRoute } from '@tanstack/react-router';
import { Text } from '@/components/ui/text';
import { OrgDomainVerification } from '@/components/orgs/OrgDomainVerification';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/settings/domains')({
  head: () => privateSeo('Domains'),
  component: DomainsTab,
});

function DomainsTab() {
  const { orgId } = Route.useParams();
  const isAdmin = useIsOrgAdmin(orgId);
  if (!isAdmin) {
    return (
      <Text color="muted" className="text-sm">
        Only admins can manage domains.
      </Text>
    );
  }
  return <OrgDomainVerification orgId={orgId} />;
}
