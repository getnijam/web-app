import { Link, useParams, useRouterState, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon } from '@hugeicons/core-free-icons';
import { getProjectOptions, getRunOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { useShellNav, ROUTE_TITLES } from './use-shell-nav';

/** Breadcrumb separator. */
function Sep() {
  return <span className="shrink-0 text-muted-foreground">/</span>;
}

function Breadcrumbs() {
  const { orgId, inProject, projectId, active } = useShellNav();
  // Run detail / file pages live under the same `active: 'runs'` section, so the
  // breadcrumb's depth comes from the route's own params/search, not `active`.
  const { runId } = useParams({ strict: false }) as { runId?: string };
  const { path: filePath } = useSearch({ strict: false }) as { path?: string };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFile = pathname.endsWith('/file');

  const project = useQuery({
    ...getProjectOptions({ path: { id: projectId ?? '' } }),
    enabled: Boolean(projectId),
  });
  const run = useQuery({
    ...getRunOptions({ path: { id: runId ?? '' } }),
    enabled: Boolean(runId),
  });

  if (!inProject) {
    // The Projects (home) root is shown as an icon to save space; other top-level
    // pages keep their text title.
    if (active === 'home') {
      return (
        <Flex as="span" align="center" className="text-foreground">
          <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8} className="shrink-0" />
          <span className="sr-only">Projects</span>
        </Flex>
      );
    }
    return (
      <Text as="span" className="text-sm font-semibold">
        {ROUTE_TITLES[active]}
      </Text>
    );
  }

  const projectName = project.data?.name ?? 'Project';
  const onRunLeaf = active === 'runs' && Boolean(runId);
  const commit = run.data?.run.commitSha ? `#${run.data.run.commitSha.slice(0, 7)}` : 'Run';
  const fileName = filePath ? (filePath.split('/').pop() ?? filePath) : '';

  // The crumbs after the project link: a run-detail page shows the commit (and
  // file, on the file view); any other section shows its title.
  const leafCrumbs = () => {
    if (!onRunLeaf) {
      return (
        <>
          <Sep />
          <Text as="span" className="shrink-0 font-semibold">
            {ROUTE_TITLES[active]}
          </Text>
        </>
      );
    }
    if (isFile) {
      return (
        <>
          {/* No "Runs" crumb, the project link above already points to the runs list. */}
          <Sep />
          <Link
            to="/orgs/$orgId/projects/$projectId/runs/$runId"
            params={{ orgId, projectId: projectId!, runId: runId! }}
            className="shrink-0 font-mono text-muted-foreground hover:text-foreground"
          >
            {commit}
          </Link>
          <Sep />
          <Text as="span" truncate className="min-w-0 font-mono font-semibold">
            {fileName}
          </Text>
        </>
      );
    }
    return (
      <>
        {/* No "Runs" crumb, the project link above already points to the runs list. */}
        <Sep />
        <Text as="span" className="shrink-0 font-mono font-semibold">
          {commit}
        </Text>
      </>
    );
  };

  return (
    <Flex align="center" gap={2} className="min-w-0 text-sm">
      <Flex
        as={Link}
        to="/orgs/$orgId/projects"
        params={{ orgId } as never}
        align="center"
        aria-label="Projects"
        title="Projects"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8} />
      </Flex>
      <Sep />
      <Link
        to="/orgs/$orgId/projects/$projectId/runs"
        params={{ orgId, projectId: projectId! }}
        className="min-w-0 shrink truncate text-muted-foreground hover:text-foreground"
      >
        {projectName}
      </Link>

      {leafCrumbs()}
    </Flex>
  );
}

export function TopBar() {
  return (
    <Flex
      as="header"
      align="center"
      className="h-15 shrink-0 gap-3.5 border-b border-border bg-background/85 px-7 backdrop-blur"
    >
      {/* Desktop toggles via the sidebar's edge handle (AppShell); the top-bar
          trigger is the mobile affordance, where the sidebar is a sheet. */}
      <SidebarTrigger className="-ml-1 text-muted-foreground md:hidden" />
      <Breadcrumbs />

      <Flex align="center" gap={2.5} className="ml-auto">
        {/* Mobile: the cycling icon-only button (same as the home nav); ≥md: the full track. */}
        <ThemeSegmentedControl minified className="md:hidden" />
        <ThemeSegmentedControl className="hidden md:inline-flex" />
      </Flex>
    </Flex>
  );
}
