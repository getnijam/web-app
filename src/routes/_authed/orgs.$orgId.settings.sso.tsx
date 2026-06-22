import { createFileRoute } from '@tanstack/react-router';
import { SsoSettings } from '@/components/sso/SsoSettings';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/settings/sso')({
  head: () => privateSeo('Single sign-on'),
  component: SsoTab,
});

function SsoTab() {
  const { orgId } = Route.useParams();
  return <SsoSettings orgId={orgId} />;
}
