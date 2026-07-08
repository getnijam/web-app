import { Fragment, type ReactNode } from 'react';
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
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { ReporterSnippet } from '@/components/projects/ReporterSnippet';
import { RunStats } from '@/components/runs/RunStats';
import {
  RunFilters,
  type RunStatusFilter,
  type RunFilterValues,
} from '@/components/runs/RunFilters';
import { RunsPager } from '@/components/runs/RunsPager';
import { RunRow } from '@/components/runs/RunRow';
import { HoverHighlight } from '@/components/ui/hover-highlight';
import {
  RunsPageSkeleton,
  RunsListSkeleton,
  RunFiltersSkeleton,
} from '@/components/runs/RunSkeletons';
import { timeAgo } from '@/lib/format';
import { gitBranchUrl } from '@/lib/git';
import {
  validateDateRangeSearch,
  searchToRange,
  rangeToSearch,
  rangeToQuery,
} from '@/lib/date-range';
import { privateSeo } from '@/lib/seo';

// Fields are optional so navigating to this route (cards, sidebar, redirect)
// needs no search params; they're normalized to concrete values at read-time.
interface RunsSearch {
  status?: RunStatusFilter;
  branch?: string;
  user?: string;
  environment?: string;
  /** Inclusive run-date range as YYYY-MM-DD (local calendar days). */
  from?: string;
  to?: string;
  page?: number;
}

// No 'flaky' verdict filter on the runs list (a flaky-recovered run is Passed here);
// a stale ?status=flaky URL falls back to 'all'. Flakiness is filtered inside a run.
const STATUSES: RunStatusFilter[] = ['all', 'passed', 'failed'];
const PAGE_SIZE = 20;

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/')({
  head: () => privateSeo('Runs'),
  component: RunsPage,
  validateSearch: (search: Record<string, unknown>): RunsSearch => {
    const page = Number(search.page);
    const { from, to } = validateDateRangeSearch(search);
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
      from,
      to,
      page: Number.isInteger(page) && page >= 1 ? page : 1,
    };
  },
});

function RunsPage() {
  const { orgId, projectId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const status = search.status ?? 'all';
  // A flaky-recovered run is shown as Passed, so the Passed tab must include it: send
  // both statuses (the API ORs an array). Other tabs pass through as a single value.
  const statusQuery: RunStatusFilter | RunStatusFilter[] =
    status === 'passed' ? ['passed', 'flaky'] : status;
  const page = search.page ?? 1;

  const project = useQuery(getProjectOptions({ path: { id: projectId } }));
  const filters = useQuery(getProjectRunFiltersOptions({ path: { projectId } }));
  const runs = useQuery(
    listProjectRunsOptions({
      path: { projectId },
      query: {
        status: statusQuery,
        branch: search.branch,
        user: search.user,
        environment: search.environment,
        ...rangeToQuery({ from: search.from, to: search.to }),
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
    status !== 'all' ||
    !!search.branch ||
    !!search.user ||
    !!search.environment ||
    !!search.from ||
    !!search.to;
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
        <ReporterSnippet
          orgId={orgId}
          projectId={projectId}
          framework={proj.testFramework ?? 'playwright'}
        />
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
          <Card className="flex flex-col overflow-hidden">
            <HoverHighlight inset={4} highlightClassName="rounded-lg bg-accent">
              {runs.data.runs.map((run) => (
                <RunRow key={run.id} run={run} orgId={orgId} projectId={projectId} />
              ))}
            </HoverHighlight>
          </Card>
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
        {/* Filter options come from the backend, skeleton the bar until they load,
            then keep it available regardless of the run list (re)fetching. */}
        {filters.isLoading ? (
          <RunFiltersSkeleton />
        ) : (
          <RunFilters
            values={values}
            options={filters.data ?? { branches: [], users: [], environments: [], hasUnset: false }}
            total={total}
            projectTotal={stats?.runCount ?? total}
            onChange={onFilterChange}
            dateRange={searchToRange({ from: search.from, to: search.to })}
            onDateRangeChange={(range) =>
              navigate({ search: (prev) => ({ ...prev, ...rangeToSearch(range), page: 1 }) })
            }
          />
        )}

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
  const stats = proj.stats;
  // The last run's actual branch (not the project's default), this line describes
  // the last run, so a feature-branch run shows its branch. Linked out to the
  // provider (github/gitlab) when we have enough git context to build the URL.
  const branchHref = stats
    ? gitBranchUrl({
        repository: stats.repository,
        branch: stats.branch,
        ciProvider: stats.ciProvider,
        ciRunUrl: stats.ciRunUrl,
      })
    : null;

  const segments: ReactNode[] = [];
  if (stats) segments.push(`last run ${timeAgo(stats.lastRunAt)}`);
  if (stats?.branch) {
    segments.push(
      branchHref ? (
        <a
          key="branch"
          href={branchHref}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline"
        >
          on {stats.branch}
        </a>
      ) : (
        `on ${stats.branch}`
      ),
    );
  }
  if (stats?.ciProvider) segments.push(`via ${stats.ciProvider}`);

  return (
    <Flex align="start" justify="between" gap={4} className="flex-wrap">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Runs</Text>
        {segments.length > 0 && (
          <Text color="muted">
            {segments.map((seg, i) => (
              <Fragment key={i}>
                {i > 0 && ' · '}
                {seg}
              </Fragment>
            ))}
          </Text>
        )}
      </Flex>
      <Button variant="outline" size="sm" loading={refreshing} onClick={onRefresh}>
        {!refreshing && <HugeiconsIcon icon={RefreshIcon} size={15} />}
        Refresh
      </Button>
    </Flex>
  );
}
