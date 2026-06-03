import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { listProjectFlakyTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TestRow } from '@/components/explorer/TestRow';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/flaky')({
  head: () => privateSeo('Flaky tests'),
  component: FlakyPage,
});

function FlakyPage() {
  const { orgId, projectId } = Route.useParams();
  const q = useQuery(listProjectFlakyTestsOptions({ path: { projectId } }));

  const tests = q.data?.tests ?? [];
  const runWindow = q.data?.runWindow ?? 0;
  const runs = `${runWindow} ${runWindow === 1 ? 'run' : 'runs'}`;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Flaky tests</Text>
        <Text color="muted">
          {q.data
            ? `${tests.length} flaky ${tests.length === 1 ? 'test' : 'tests'} in the last ${runs}`
            : 'Tests with inconsistent results across recent runs.'}
        </Text>
      </Flex>

      {q.isLoading ? (
        <FlakySkeleton />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : tests.length === 0 ? (
        <EmptyState
          title="No flaky tests"
          description="Nothing flaked across the recent runs — nice and stable."
        />
      ) : (
        <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
          {tests.map((t) => (
            <TestRow
              key={t.testId}
              test={t}
              orgId={orgId}
              projectId={projectId}
              flakeCount={t.flakeCount}
            />
          ))}
        </Flex>
      )}
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
