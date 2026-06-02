import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { listProjectTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TestRow } from '@/components/explorer/TestRow';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/explorer')({
  head: () => privateSeo('Test explorer'),
  component: ExplorerPage,
});

function ExplorerPage() {
  const { orgId, projectId } = Route.useParams();
  const q = useQuery(listProjectTestsOptions({ path: { projectId } }));
  const [query, setQuery] = useState('');

  const tests = q.data?.tests ?? [];
  const specFileCount = q.data?.specFileCount ?? 0;
  const term = query.trim().toLowerCase();
  const filtered = term
    ? tests.filter(
        (t) => t.title.toLowerCase().includes(term) || t.file.toLowerCase().includes(term),
      )
    : tests;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-4xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Test explorer</Text>
        <Text color="muted">
          {tests.length} {tests.length === 1 ? 'test case' : 'test cases'} across {specFileCount}{' '}
          {specFileCount === 1 ? 'spec file' : 'spec files'}
        </Text>
      </Flex>

      {q.isLoading ? (
        <ExplorerSkeleton />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : tests.length === 0 ? (
        <EmptyState
          title="No test cases yet"
          description="Run your suite and your tests will show up here."
        />
      ) : (
        <Flex direction="col" gap={4}>
          <Input
            type="search"
            placeholder="Find a test…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filtered.length === 0 ? (
            <EmptyState title="No matches" description="No test matches your search." />
          ) : (
            <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
              {filtered.map((t) => (
                <TestRow key={t.testId} test={t} orgId={orgId} projectId={projectId} />
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}

function ExplorerSkeleton() {
  return (
    <Flex direction="col" gap={4}>
      <Skeleton className="h-9 w-full rounded-lg" />
      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        {Array.from({ length: 8 }).map((_, i) => (
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
            <Skeleton className="h-3 w-10 rounded-md" />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
