import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { listProjectFlakyTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TestRow } from '@/components/explorer/TestRow';
import { HoverHighlight } from '@/components/ui/hover-highlight';
import { DateRangeFilter } from '@/components/explorer/DateRangeFilter';
import {
  validateDateRangeSearch,
  searchToRange,
  rangeToSearch,
  rangeToQuery,
} from '@/lib/date-range';
import { testMatchesQuery } from '@/lib/test-search';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/flaky')({
  head: () => privateSeo('Flaky tests'),
  validateSearch: validateDateRangeSearch,
  component: FlakyPage,
});

function FlakyPage() {
  const { orgId, projectId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const q = useQuery({
    ...listProjectFlakyTestsOptions({ path: { projectId }, query: rangeToQuery(search) }),
    // Retain the prior data across a filter change so the filter row stays mounted
    // (it keys off `tests.length`); the list itself still shows a skeleton while the
    // new data loads, see `isPlaceholderData` in renderList.
    placeholderData: keepPreviousData,
  });

  const [query, setQuery] = useState('');

  const tests = q.data?.tests ?? [];
  const term = query.trim().toLowerCase();
  const filtered = tests.filter((t) => testMatchesQuery(t, term));

  // The search + date filters are client-side, so they stay available the whole
  // time the list is loading (first load and filter-change refetches alike); only
  // a settled, unfiltered, empty project hides them. They never wait on data.
  const filterActive = Boolean(search.from || search.to);
  // Always show the search + date filter (unless the query errored): even with no
  // results the date range stays adjustable to look in a different window.
  const showControls = !q.error;

  // Default window is the last 2 weeks; a date filter overrides it (the pill shows
  // the chosen range, so the subtitle drops the window phrase).
  const windowSuffix = filterActive ? '' : ' in the last 2 weeks';
  const summary = `${tests.length} flaky ${tests.length === 1 ? 'test' : 'tests'}${windowSuffix}`;
  const placeholder = filterActive
    ? 'Tests with inconsistent results in the selected range.'
    : 'Tests with inconsistent results in the last 2 weeks.';

  const renderList = () => {
    if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
    if (q.isLoading || q.isPlaceholderData) return <FlakySkeleton />;
    if (tests.length === 0)
      return <EmptyState title="No flaky tests" description="Nothing flaked, nice and stable." />;
    if (filtered.length === 0)
      return <EmptyState title="No matches" description="No flaky test matches your search." />;
    return (
      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        <HoverHighlight inset={4} highlightClassName="rounded-lg bg-accent">
          {filtered.map((t) => (
            <TestRow
              key={t.testId}
              test={t}
              orgId={orgId}
              projectId={projectId}
              flakeCount={t.flakeCount}
              from="flaky"
            />
          ))}
        </HoverHighlight>
      </Flex>
    );
  };

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Flaky tests</Text>
        <Text color="muted">{q.data ? summary : placeholder}</Text>
      </Flex>

      <Flex direction="col" gap={4}>
        {showControls && (
          // Search + date side by side on web, stacked on mobile.
          <Flex direction="col" gap={2} className="sm:flex-row sm:items-center">
            <Input
              placeholder="Search by test or suite name…"
              className="flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              startIcon={<HugeiconsIcon icon={Search01Icon} size={16} />}
              clearable
              onClear={() => setQuery('')}
            />
            <DateRangeFilter
              value={searchToRange(search)}
              onChange={(range) => navigate({ search: rangeToSearch(range) })}
            />
          </Flex>
        )}
        {renderList()}
      </Flex>
    </Flex>
  );
}

function FlakySkeleton() {
  return (
    <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: 6 }).map((_, i) => (
        <Flex
          key={i}
          align="center"
          gap={3}
          className="border-b border-border px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-5 rounded-full" />
          <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
            <Skeleton className="h-4 w-64 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </Flex>
          <Skeleton className="h-5 w-16 rounded-full" />
        </Flex>
      ))}
    </Flex>
  );
}
