import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon, UserMultiple02Icon, ShieldKeyIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/settings')({
  head: () => privateSeo('Organization settings'),
  // A layout route catches its own unmatched children (e.g. /settings/garbage), so it
  // needs its own dashboard 404 — otherwise it falls back to the public marketing 404.
  notFoundComponent: DashboardNotFound,
  component: OrgSettingsLayout,
});

/**
 * Org-settings shell: heading + a line-variant tab bar routing between General
 * (`/settings`), Users (`/settings/users`), and Single sign-on (`/settings/sso`).
 * Tabs are real router links so the active tab is URL-driven (deep-linkable,
 * back/forward works). Mirrors the Secret-keys layout.
 */
function OrgSettingsLayout() {
  const { orgId } = Route.useParams();
  const active = useRouterState({
    select: (s) => {
      const p = s.location.pathname;
      if (p.endsWith('/users')) return 'users';
      if (p.endsWith('/sso')) return 'sso';
      return 'general';
    },
  });

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Organization settings</Text>
        <Text color="muted">Manage your organization's profile, members, and single sign-on.</Text>
      </Flex>

      <Tabs value={active}>
        <TabsList variant="line" className="justify-start gap-5">
          <TabsTrigger value="general" asChild className="flex-none px-1 after:bg-primary">
            <Link to="/orgs/$orgId/settings" params={{ orgId }}>
              <HugeiconsIcon icon={Building03Icon} size={16} />
              General
            </Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild className="flex-none px-1 after:bg-primary">
            <Link to="/orgs/$orgId/settings/users" params={{ orgId }}>
              <HugeiconsIcon icon={UserMultiple02Icon} size={16} />
              Users
            </Link>
          </TabsTrigger>
          <TabsTrigger value="sso" asChild className="flex-none px-1 after:bg-primary">
            <Link to="/orgs/$orgId/settings/sso" params={{ orgId }}>
              <HugeiconsIcon icon={ShieldKeyIcon} size={16} />
              Single sign-on
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </Flex>
  );
}
