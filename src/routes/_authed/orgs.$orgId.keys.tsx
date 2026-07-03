import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { ORG_KEYS_INGESTION_ROUTE, ORG_KEYS_MCP_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudUploadIcon, AiChat02Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/keys')({
  head: () => privateSeo('Secret keys'),
  notFoundComponent: DashboardNotFound,
  component: SecretKeysLayout,
});

/**
 * Secret-keys shell: heading + a line-variant tab bar that routes between the
 * two strictly-separated key kinds (`/keys/ingestion`, `/keys/mcp`). The tabs
 * are real router links (`TabsTrigger asChild` → `<Link>`); the active tab is
 * driven by the URL, not local state, so deep-linking and back/forward work.
 * Plain `variant="line"`, the component's own underline indicator, no overrides.
 */
function SecretKeysLayout() {
  const { orgId } = Route.useParams();
  const active = useRouterState({
    select: (s) => (s.location.pathname.endsWith('/mcp') ? 'mcp' : 'ingestion'),
  });

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Secret keys</Text>
        <Text color="muted">
          Ingestion keys upload your runs from CI; read keys let AI agents query them over MCP. The
          two are strictly separated, a leaked key of one kind can never do the other&rsquo;s job.
        </Text>
      </Flex>

      <Tabs value={active}>
        <TabsList variant="line" className="justify-start gap-5">
          <TabsTrigger value="ingestion" asChild className="flex-none px-1 after:bg-primary">
            <Link to={ORG_KEYS_INGESTION_ROUTE} params={{ orgId }}>
              <HugeiconsIcon icon={CloudUploadIcon} size={16} />
              Ingestion keys
            </Link>
          </TabsTrigger>
          <TabsTrigger value="mcp" asChild className="flex-none px-1 after:bg-primary">
            <Link to={ORG_KEYS_MCP_ROUTE} params={{ orgId }}>
              <HugeiconsIcon icon={AiChat02Icon} size={16} />
              Read keys (MCP)
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </Flex>
  );
}
