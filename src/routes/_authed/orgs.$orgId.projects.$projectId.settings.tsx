import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { PROJECT_SETTINGS_ROUTE, PROJECT_SETTINGS_INTEGRATIONS_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, PlugSocketIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/settings')({
  head: () => privateSeo('Project settings'),
  // A layout route catches its own unmatched children (e.g. /settings/garbage), so it
  // needs its own dashboard 404, otherwise it falls back to the public marketing 404.
  notFoundComponent: DashboardNotFound,
  component: ProjectSettingsLayout,
});

/**
 * Project-settings shell: heading + a line-variant tab bar routing between General
 * (`/settings`) and Integrations (`/settings/integrations`). The per-project Slack,
 * GitHub and GitLab panels moved onto their own tab because stacking them under the
 * general settings made a single very long page. Mirrors the Org-settings layout,
 * tabs are real router links so the active tab is URL-driven (deep-linkable,
 * back/forward works).
 */
function ProjectSettingsLayout() {
  const { orgId, projectId } = Route.useParams();
  const active = useRouterState({
    select: (s) => (s.location.pathname.endsWith('/integrations') ? 'integrations' : 'general'),
  });

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Project settings</Text>
        <Text color="muted">Configure how this project's runs are displayed and ingested.</Text>
      </Flex>

      <Tabs value={active}>
        <TabsList variant="line" className="justify-start gap-5">
          <TabsTrigger value="general" asChild className="flex-none px-1 after:bg-primary">
            <Link to={PROJECT_SETTINGS_ROUTE} params={{ orgId, projectId }}>
              <HugeiconsIcon icon={Settings01Icon} size={16} />
              General
            </Link>
          </TabsTrigger>
          <TabsTrigger value="integrations" asChild className="flex-none px-1 after:bg-primary">
            <Link to={PROJECT_SETTINGS_INTEGRATIONS_ROUTE} params={{ orgId, projectId }}>
              <HugeiconsIcon icon={PlugSocketIcon} size={16} />
              Integrations
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </Flex>
  );
}
