import type { MouseEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  EXPLORER_ROUTE,
  FAILING_ROUTE,
  FLAKY_ROUTE,
  LOGIN_ROUTE,
  ORG_BILLING_ROUTE,
  ORG_INTEGRATIONS_ROUTE,
  ORG_KEYS_ROUTE,
  ORG_PROJECTS_ROUTE,
  ORG_SETTINGS_ROUTE,
  PROJECT_SETTINGS_ROUTE,
  RUNS_ROUTE,
} from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Home01Icon,
  Building03Icon,
  SquareLock02Icon,
  CreditCardIcon,
  PlugSocketIcon,
  ArrowLeft01Icon,
  Task01Icon,
  TestTubesIcon,
  AlertSquareIcon,
  CancelSquareIcon,
  Settings01Icon,
  Book02Icon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons';
import { getProjectOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { glyphFor } from '@/lib/project-glyph';
import { ProjectGlyphIcon } from '@/components/projects/ProjectGlyphIcon';
import { Logo } from '@/components/auth/Logo';
import { AccountMenu } from '@/components/users/AccountMenu';
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
          <Link to={ORG_PROJECTS_ROUTE} params={{ orgId }}>
            <NavGlyph icon={Home01Icon} active={active === 'home'} />
            <span>Projects</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'keys'} className={NAV_ACTIVE}>
          <Link to={ORG_KEYS_ROUTE} params={{ orgId }}>
            <NavGlyph icon={SquareLock02Icon} active={active === 'keys'} />
            <span>Secret keys</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'integrations'} className={NAV_ACTIVE}>
          <Link to={ORG_INTEGRATIONS_ROUTE} params={{ orgId }}>
            <NavGlyph icon={PlugSocketIcon} active={active === 'integrations'} />
            <span>Integrations</span>
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
      {project.isLoading ? (
        <Skeleton className="size-6.5 shrink-0 rounded-lg" />
      ) : (
        <Flex
          align="center"
          justify="center"
          className={cn(
            'size-6.5 shrink-0 rounded-lg font-mono text-xs font-bold',
            glyph ? 'text-primary-foreground' : 'bg-primary/15 text-primary',
          )}
          style={glyph ? { background: glyph.background } : undefined}
        >
          {glyph ? (
            <ProjectGlyphIcon iconKey={glyph.iconKey} size={14} strokeWidth={1.9} />
          ) : (
            initialsFrom(name)
          )}
        </Flex>
      )}
      <Flex direction="col" gap={1} className="min-w-0 flex-1 leading-tight">
        {project.isLoading ? (
          <>
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </>
        ) : (
          <>
            <Text as="span" truncate className="text-sm font-semibold">
              {name}
            </Text>
            <Text as="span" className="font-mono text-xs text-muted-foreground">
              {runCount} {runCount === 1 ? 'run' : 'runs'}
            </Text>
          </>
        )}
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
  return (
    <Flex direction="col" gap={1.5}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            {/* Stop the delegated close-on-nav: this switches the sidebar to the
                org-level nav, so the mobile sheet should stay open to show it. */}
            <Link to={ORG_PROJECTS_ROUTE} params={{ orgId }} onClick={(e) => e.stopPropagation()}>
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
            <Link to={RUNS_ROUTE} params={{ orgId, projectId }}>
              <NavGlyph icon={Task01Icon} active={active === 'runs'} />
              <span>Runs</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div>
        <SidebarGroupLabel>Explorer</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={active === 'explorer'} className={NAV_ACTIVE}>
              <Link to={EXPLORER_ROUTE} params={{ orgId, projectId }}>
                <NavGlyph icon={TestTubesIcon} active={active === 'explorer'} />
                <span>Test explorer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={active === 'flaky'} className={NAV_ACTIVE}>
              <Link to={FLAKY_ROUTE} params={{ orgId, projectId }}>
                <NavGlyph icon={AlertSquareIcon} active={active === 'flaky'} />
                <span>Flaky tests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={active === 'failing'} className={NAV_ACTIVE}>
              <Link to={FAILING_ROUTE} params={{ orgId, projectId }}>
                <NavGlyph icon={CancelSquareIcon} active={active === 'failing'} />
                <span>Failing tests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Flex>
  );
}

/**
 * The settings entry, pinned to the sidebar footer above Docs: project settings
 * inside a project, org settings otherwise. `onNavigate` closes the mobile sheet.
 */
function SettingsNavItem({
  inProject,
  orgId,
  projectId,
  active,
  onNavigate,
}: {
  inProject: boolean;
  orgId: string;
  projectId?: string;
  active: SubRoute;
  onNavigate: () => void;
}) {
  if (inProject && projectId) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active === 'psettings'} className={NAV_ACTIVE}>
          <Link to={PROJECT_SETTINGS_ROUTE} params={{ orgId, projectId }} onClick={onNavigate}>
            <NavGlyph icon={Settings01Icon} active={active === 'psettings'} />
            <span>Project settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active === 'org'} className={NAV_ACTIVE}>
        <Link to={ORG_SETTINGS_ROUTE} params={{ orgId }} onClick={onNavigate}>
          <NavGlyph icon={Building03Icon} active={active === 'org'} />
          <span>Org settings</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { orgId, inProject, projectId, active } = useShellNav();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  // On mobile the sidebar is an off-canvas sheet; tapping a nav link should
  // dismiss it. Delegate at the content/footer level so every link is covered,
  // but ignore non-link clicks (e.g. the project chip). The OrgSwitcher and
  // AccountMenu live outside this and intentionally stay open, tapping them
  // opens their own dropdowns, which would be unusable if the sheet closed.
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const closeMobileOnNav = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) closeMobile();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Flex align="center" className="px-2 py-1">
          <Logo label="Nijam.dev" />
        </Flex>
        {/* Inside a project the project chip + "Back to projects" carry the context,
            so the org switcher is redundant, hide it there. */}
        {!inProject && <OrgSwitcher orgId={orgId} />}
      </SidebarHeader>

      <SidebarContent onClick={closeMobileOnNav}>
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
          <SettingsNavItem
            inProject={inProject}
            orgId={orgId}
            projectId={projectId}
            active={active}
            onNavigate={closeMobile}
          />
          {!inProject && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={active === 'billing'} className={NAV_ACTIVE}>
                <Link to={ORG_BILLING_ROUTE} params={{ orgId }} onClick={closeMobile}>
                  <NavGlyph icon={CreditCardIcon} active={active === 'billing'} />
                  <span>Billing &amp; usage</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild title="Nijam documentation">
              <a
                href="https://docs.nijam.dev"
                target="_blank"
                rel="noreferrer"
                onClick={closeMobile}
              >
                <NavGlyph icon={Book02Icon} active={false} />
                <span>Docs</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={14}
                  strokeWidth={2}
                  className="ml-auto shrink-0 text-muted-foreground"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <AccountMenu variant="sidebar" onSignedOut={() => navigate({ to: LOGIN_ROUTE })} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
