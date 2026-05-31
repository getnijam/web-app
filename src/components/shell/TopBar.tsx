import { Link, useParams, useRouterState, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { getProjectOptions, getRunOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
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

  return (
    <Flex align="center" gap={2} className="min-w-0 text-sm">
      <Link
        to="/orgs/$orgId/projects"
        params={{ orgId }}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        Projects
      </Link>
      <Sep />
      <Link
        to="/orgs/$orgId/projects/$projectId/runs"
        params={{ orgId, projectId: projectId! }}
        className="min-w-0 shrink truncate text-muted-foreground hover:text-foreground"
      >
        {projectName}
      </Link>

      {onRunLeaf ? (
        isFile ? (
          <>
            {/* No "Runs" crumb — the project link above already points to the runs list. */}
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
        ) : (
          <>
            {/* No "Runs" crumb — the project link above already points to the runs list. */}
            <Sep />
            <Text as="span" className="shrink-0 font-mono font-semibold">
              {commit}
            </Text>
          </>
        )
      ) : (
        <>
          <Sep />
          <Text as="span" className="shrink-0 font-semibold">
            {ROUTE_TITLES[active]}
          </Text>
        </>
      )}
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
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <Breadcrumbs />

      <Flex align="center" gap={2.5} className="ml-auto">
        {/* Presentational for now — wired to a real search endpoint in a later phase. */}
        <InputGroup className="w-auto min-w-57.5">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search tests, runs, projects…"
            aria-label="Search"
          />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>

        <ThemeSegmentedControl />
      </Flex>
    </Flex>
  );
}
