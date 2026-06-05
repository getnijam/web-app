import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon } from '@hugeicons/core-free-icons';
import type { ProjectSummary } from '@/client';
import {
  listProjectRunsOptions,
  getProjectOptions,
  getProjectRunFiltersOptions,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { ReporterSnippet } from '@/components/projects/ReporterSnippet';
import { ProjectIdChip } from '@/components/projects/ProjectIdChip';
import { RunStats } from '@/components/runs/RunStats';
import {
  RunFilters,
  type RunStatusFilter,
  type RunFilterValues,
} from '@/components/runs/RunFilters';
import { RunsPager } from '@/components/runs/RunsPager';
import { RunRow } from '@/components/runs/RunRow';
import { RunsPageSkeleton, RunsListSkeleton } from '@/components/runs/RunSkeletons';
import { timeAgo, repoFromUrl } from '@/lib/format';
import { privateSeo } from '@/lib/seo';

// Fields are optional so navigating to this route (cards, sidebar, redirect)
// needs no search params; they're normalized to concrete values at read-time.
interface RunsSearch {
  status?: RunStatusFilter;
  branch?: string;
  user?: string;
  environment?: string;
  page?: number;
}

const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed', 'flaky'];
const PAGE_SIZE = 20;

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/')({
  head: () => privateSeo('Runs'),
  component: RunsPage,
  validateSearch: (search: Record<string, unknown>): RunsSearch => {
    const page = Number(search.page);
    return {
      status: STATUSES.includes(search.status as RunStatusFilter)
        ? (search.status as RunStatusFilter)
        : 'all',
      branch: typeof search.branch === 'string' && search.branch ? search.branch : undefined,
      user: typeof search.user === 'string' && search.user ? search.user : undefined,
      environment:
        typeof search.environment === 'string' && search.environment
          ? search.environment
          : undefined,
      page: Number.isInteger(page) && page >= 1 ? page : 1,
    };
  },
});

function RunsPage() {
  const { orgId, projectId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const status = search.status ?? 'all';
  const page = search.page ?? 1;

  const project = useQuery(getProjectOptions({ path: { id: projectId } }));
  const filters = useQuery(getProjectRunFiltersOptions({ path: { projectId } }));
  const runs = useQuery(
    listProjectRunsOptions({
      path: { projectId },
      query: {
        status,
        branch: search.branch,
        user: search.user,
        environment: search.environment,
        page,
        pageSize: PAGE_SIZE,
      },
    }),
  );

  if (project.isLoading) return <RunsPageSkeleton />;
  if (project.error || !project.data) {
    return <ErrorState error={project.error} onRetry={() => project.refetch()} />;
  }

  const proj = project.data;
  const stats = proj.stats;
  const filtersActive =
    status !== 'all' || !!search.branch || !!search.user || !!search.environment;
  const total = runs.data?.total ?? 0;
  // Manual refresh of the project stats + filters + run list. Spins only on a
  // user/background refetch (isRefetching), never on the initial skeleton load.
  const refreshing = runs.isRefetching || project.isRefetching || filters.isRefetching;
  const refresh = () => {
    void runs.refetch();
    void project.refetch();
    void filters.refetch();
  };

  // No runs at all (and no filters narrowing them away) → onboarding snippet.
  if (!runs.isLoading && !runs.error && total === 0 && !filtersActive) {
    return (
      <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
        <Header proj={proj} onRefresh={refresh} refreshing={refreshing} />
        <ReporterSnippet projectId={projectId} />
      </Flex>
    );
  }

  const values: RunFilterValues = {
    status,
    branch: search.branch,
    user: search.user,
    environment: search.environment,
  };
  const onFilterChange = (patch: Partial<RunFilterValues>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) });
  const onPage = (page: number) => navigate({ search: (prev) => ({ ...prev, page }) });

  const renderRuns = () => {
    if (runs.isLoading) return <RunsListSkeleton />;
    if (runs.error) return <ErrorState error={runs.error} onRetry={() => runs.refetch()} />;
    if (runs.data && runs.data.runs.length > 0)
      return (
        <>
          <Flex
            direction="col"
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {runs.data.runs.map((run) => (
              <RunRow key={run.id} run={run} orgId={orgId} projectId={projectId} />
            ))}
          </Flex>
          <RunsPager page={runs.data.page} totalPages={runs.data.totalPages} onPage={onPage} />
        </>
      );
    return (
      <EmptyState
        title="No runs match these filters"
        description="Try a different status, branch, user, or environment."
      />
    );
  };

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Header proj={proj} onRefresh={refresh} refreshing={refreshing} />

      {stats && <RunStats stats={stats} />}

      <Flex direction="col" gap={3}>
        <RunFilters
          values={values}
          options={filters.data ?? { branches: [], users: [], environments: [], hasUnset: false }}
          total={total}
          projectTotal={stats?.runCount ?? total}
          onChange={onFilterChange}
        />

        {renderRuns()}
      </Flex>
    </Flex>
  );
}

function Header({
  proj,
  onRefresh,
  refreshing,
}: {
  proj: ProjectSummary;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const repo = repoFromUrl(proj.repositoryUrl);
  const parts = [
    repo,
    proj.stats ? `last run ${timeAgo(proj.stats.lastRunAt)}` : null,
    proj.defaultBranch ? `on ${proj.defaultBranch}` : null,
    proj.stats?.ciProvider ? `via ${proj.stats.ciProvider}` : null,
  ].filter(Boolean);

  return (
    <Flex align="start" justify="between" gap={4} className="flex-wrap">
      <Flex direction="col" gap={1} className="min-w-0">
        <Text variant="h1">Runs</Text>
        {parts.length > 0 && <Text color="muted">{parts.join(' · ')}</Text>}
        <ProjectIdChip value={proj.id} className="mt-1 w-fit max-w-full" />
      </Flex>
      <Button variant="outline" size="sm" loading={refreshing} onClick={onRefresh}>
        {!refreshing && <HugeiconsIcon icon={RefreshIcon} size={15} />}
        Refresh
      </Button>
    </Flex>
  );
}
