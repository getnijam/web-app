import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Home01Icon,
  Building03Icon,
  UserMultiple02Icon,
  SquareLock02Icon,
  CreditCardIcon,
  ArrowLeft01Icon,
  PulseIcon,
  TestTube01Icon,
  RepeatIcon,
  Settings01Icon,
  Book02Icon,
  ArrowDown01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { logout } from '@/client';
import { getMeOptions, getMeQueryKey, getProjectOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { glyphFor } from '@/lib/project-glyph';
import { Logo } from '@/components/auth/Logo';
import { UserAvatar } from '@/components/users/UserAvatar';
import { UserSettingsDialog } from '@/components/users/UserSettingsDialog';
import { OrgSwitcher } from './OrgSwitcher';
import { useShellNav, initialsFrom, type SubRoute } from './use-shell-nav';

/**
 * Recolors shadcn's default active treatment to the brand primary and adds the
 * 3px left rail from the design. `data-active:` resolves to `[data-active="true"]`
 * via the custom variant in globals.css, so only the active item picks this up.
 * The rail lives in the group's 8px gutter (`-left-2`) so it sits at the sidebar
 * edge with a gap before the pill; `overflow-visible` lets it escape the button's
 * own `overflow-hidden` (the attribute-bumped specificity beats the base rule).
 */
const NAV_ACTIVE =
  'data-active:bg-sidebar-primary/15 data-active:font-semibold data-active:text-sidebar-primary data-active:overflow-visible ' +
  'data-active:before:absolute data-active:before:-left-2 data-active:before:top-1.5 data-active:before:bottom-1.5 ' +
  "data-active:before:w-0.75 data-active:before:rounded-full data-active:before:bg-sidebar-primary data-active:before:content-['']";

/** Nav-item icon, tinted primary when its row is active. */
function NavGlyph({ icon, active }: { icon: IconSvgElement; active: boolean }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={18}
      strokeWidth={1.8}
      className={cn('shrink-0', active ? 'text-sidebar-primary' : 'text-muted-foreground')}
    />
  );
}

function HomeNav({ orgId, active }: { orgId: string; active: SubRoute }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'home'} className={NAV_ACTIVE}>
          <Link to="/orgs/$orgId/projects" params={{ orgId }}>
            <NavGlyph icon={Home01Icon} active={active === 'home'} />
            <span>Projects</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'org'} className={NAV_ACTIVE}>
          <Link to="/orgs/$orgId/settings" params={{ orgId }}>
            <NavGlyph icon={Building03Icon} active={active === 'org'} />
            <span>Org settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'users'} className={NAV_ACTIVE}>
          <Link to="/orgs/$orgId/users" params={{ orgId }}>
            <NavGlyph icon={UserMultiple02Icon} active={active === 'users'} />
            <span>Users</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'keys'} className={NAV_ACTIVE}>
          <Link to="/orgs/$orgId/keys" params={{ orgId }}>
            <NavGlyph icon={SquareLock02Icon} active={active === 'keys'} />
            <span>Secret keys</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'billing'} className={NAV_ACTIVE}>
          <Link to="/orgs/$orgId/billing" params={{ orgId }}>
            <NavGlyph icon={CreditCardIcon} active={active === 'billing'} />
            <span>Billing</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ProjectSwitcherChip({ projectId }: { projectId: string }) {
  const project = useQuery(getProjectOptions({ path: { id: projectId } }));
  const data = project.data;
  const name = data?.name ?? 'Project';
  const glyph = data ? glyphFor(data) : null;
  const runCount = data?.stats?.runCount ?? 0;

  return (
    <Flex
      align="center"
      gap={2.5}
      className="rounded-lg border border-sidebar-border bg-card px-2.5 py-2"
    >
      <Flex
        align="center"
        justify="center"
        className={cn(
          'size-6.5 shrink-0 rounded-lg font-mono text-xs font-bold',
          glyph ? 'text-primary-foreground' : 'bg-primary/15 text-primary',
        )}
        style={glyph ? { background: glyph.gradient } : undefined}
      >
        {glyph?.icon ? (
          <HugeiconsIcon icon={glyph.icon} size={14} strokeWidth={1.9} />
        ) : (
          initialsFrom(name)
        )}
      </Flex>
      <Flex direction="col" className="min-w-0 leading-tight">
        <Text as="span" truncate className="text-sm font-semibold">
          {name}
        </Text>
        <Text as="span" className="font-mono text-xs text-muted-foreground">
          {runCount} {runCount === 1 ? 'run' : 'runs'}
        </Text>
      </Flex>
    </Flex>
  );
}

function ProjectNav({
  orgId,
  projectId,
  active,
}: {
  orgId: string;
  projectId: string;
  active: SubRoute;
}) {
  const project = useQuery(getProjectOptions({ path: { id: projectId } }));
  const flakyCount = project.data?.stats?.flakyCount ?? 0;

  return (
    <Flex direction="col" gap={1.5}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/orgs/$orgId/projects" params={{ orgId }}>
              <NavGlyph icon={ArrowLeft01Icon} active={false} />
              <span>Back to projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProjectSwitcherChip projectId={projectId} />

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={active === 'runs'} className={NAV_ACTIVE}>
            <Link to="/orgs/$orgId/projects/$projectId/runs" params={{ orgId, projectId }}>
              <NavGlyph icon={PulseIcon} active={active === 'runs'} />
              <span>Runs</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={active === 'explorer'} className={NAV_ACTIVE}>
            <Link to="/orgs/$orgId/projects/$projectId/explorer" params={{ orgId, projectId }}>
              <NavGlyph icon={TestTube01Icon} active={active === 'explorer'} />
              <span>Test explorer</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={active === 'flaky'} className={NAV_ACTIVE}>
            <Link to="/orgs/$orgId/projects/$projectId/flaky" params={{ orgId, projectId }}>
              <NavGlyph icon={RepeatIcon} active={active === 'flaky'} />
              <span>Flaky tests</span>
            </Link>
          </SidebarMenuButton>
          {flakyCount > 0 && (
            <SidebarMenuBadge className="bg-destructive/15 font-semibold text-destructive">
              {flakyCount}
            </SidebarMenuBadge>
          )}
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={active === 'psettings'} className={NAV_ACTIVE}>
            <Link to="/orgs/$orgId/projects/$projectId/settings" params={{ orgId, projectId }}>
              <NavGlyph icon={Settings01Icon} active={active === 'psettings'} />
              <span>Project settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Flex>
  );
}

function ProfileButton() {
  // Identity is session-stable; keep it fresh so the topbar gate's cached /me is
  // reused on mount instead of refetching (login/logout invalidate it explicitly).
  const me = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () => logout({ throwOnError: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      navigate({ to: '/login' });
    },
  });

  const user = me.data?.user;
  const email = user?.email ?? '';
  const name = user?.name ?? (email ? email.split('@')[0] : 'Account');

  return (
    <div className="relative">
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full left-0 z-50 mb-2 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            <Flex
              align="center"
              gap={2.5}
              className="mb-1.5 border-b border-border px-2 pt-2 pb-2.5"
            >
              <UserAvatar
                size="sm"
                className="size-7.5 rounded-full"
                userId={user?.id}
                email={email}
                name={name}
                hasAvatar={user?.hasAvatar}
                avatarUpdatedAt={user?.avatarUpdatedAt}
              />
              <Flex direction="col" className="min-w-0 leading-tight">
                <Text as="span" truncate className="text-sm font-semibold">
                  {name}
                </Text>
                <Text as="span" truncate className="text-xs text-muted-foreground">
                  {email}
                </Text>
              </Flex>
            </Flex>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.8} />
              User settings
            </button>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-accent disabled:opacity-60"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.8} />
              Log out
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border bg-card p-2 text-left transition-colors',
          open && 'bg-accent',
        )}
      >
        <UserAvatar
          size="sm"
          className="size-8 rounded-full text-sm"
          userId={user?.id}
          email={email}
          name={name}
          hasAvatar={user?.hasAvatar}
          avatarUpdatedAt={user?.avatarUpdatedAt}
        />
        <Flex direction="col" className="min-w-0 leading-tight">
          <Text as="span" truncate className="text-sm font-semibold">
            {name}
          </Text>
          <Text as="span" truncate className="text-xs text-muted-foreground">
            {email}
          </Text>
        </Flex>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          strokeWidth={1.8}
          className={cn(
            'ml-auto shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export function AppSidebar() {
  const { orgId, inProject, projectId, active } = useShellNav();

  return (
    <Sidebar>
      <SidebarHeader>
        <Flex align="center" className="px-2 py-1">
          <Logo label="Nijam.dev" />
        </Flex>
        <OrgSwitcher orgId={orgId} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {inProject && projectId ? (
            <ProjectNav orgId={orgId} projectId={projectId} active={active} />
          ) : (
            <HomeNav orgId={orgId} active={active} />
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild title="Reporter docs on npm">
              <a
                href="https://www.npmjs.com/package/@nijam/pw-reporter"
                target="_blank"
                rel="noreferrer"
              >
                <NavGlyph icon={Book02Icon} active={false} />
                <span>Docs</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <ProfileButton />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
