import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  SourceCodeIcon,
} from '@hugeicons/core-free-icons';
import type { TestCaseSummary, TestSourceRef } from '@/client';
import {
  getProjectTestOptions,
  getRunSourceOptions,
  listProjectTestsOptions,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { CodeBlock } from '@/components/explorer/CodeBlock';
import { RunHistory } from '@/components/explorer/RunHistory';
import { testStatusMeta } from '@/components/runs/test-status';
import { displayFile } from '@/lib/format';
import { gitFileUrl } from '@/lib/git';
import { cn } from '@/lib/utils';

export const Route = createFileRoute(
  '/_authed/orgs/$orgId/projects/$projectId/explorer_/$testId',
)({ component: TestDetailPage });

function TestDetailPage() {
  const { orgId, projectId, testId } = Route.useParams();
  const q = useQuery(getProjectTestOptions({ path: { projectId, testId } }));
  const list = useQuery(listProjectTestsOptions({ path: { projectId } }));

  if (q.isLoading) return <DetailSkeleton />;
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;

  const { test, history, latestRun, source } = q.data;
  const meta = testStatusMeta(test.status);
  const ref = source ?? latestRun;
  const viewSrc = ref ? gitFileUrl(ref, test.file, source?.line ?? test.line) : null;

  const tests = list.data?.tests ?? [];
  const idx = tests.findIndex((t) => t.testId === testId);
  const prev = idx > 0 ? tests[idx - 1] : undefined;
  const next = idx >= 0 && idx < tests.length - 1 ? tests[idx + 1] : undefined;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-6xl">
      <Flex align="center" justify="between" gap={3}>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link to="/orgs/$orgId/projects/$projectId/explorer" params={{ orgId, projectId }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Test explorer
          </Link>
        </Button>
        <Flex align="center" gap={1.5}>
          <StepButton testId={prev?.testId} dir="prev" orgId={orgId} projectId={projectId} />
          <StepButton testId={next?.testId} dir="next" orgId={orgId} projectId={projectId} />
        </Flex>
      </Flex>

      {/* header */}
      <Flex align="start" justify="between" gap={4}>
        <Flex direction="col" gap={2} className="min-w-0">
          <Flex align="center" gap={2.5} className="min-w-0">
            <HugeiconsIcon icon={meta.icon} size={22} className={cn('shrink-0', meta.color)} />
            <Text variant="h2" truncate className="min-w-0">
              {test.title}
            </Text>
          </Flex>
          <Flex align="center" gap={2} wrap className="text-sm text-muted-foreground">
            <Text as="span" className="font-mono">
              {displayFile(test.file)}
            </Text>
            {test.line != null && (
              <>
                <span>·</span>
                <span>line {test.line}</span>
              </>
            )}
            <span>·</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                meta.pill,
              )}
            >
              {meta.label}
            </span>
          </Flex>
        </Flex>
        {viewSrc && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={viewSrc} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={SourceCodeIcon} size={15} />
              View source
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
            </a>
          </Button>
        )}
      </Flex>

      {/* source (2/3) + history (1/3) */}
      <Grid cols={[1, 1, 3]} gap={4} className="items-start">
        <div className="min-w-0 md:col-span-2">
          <SourcePanel source={source} test={test} />
        </div>
        <RunHistory history={history} orgId={orgId} projectId={projectId} file={test.file} />
      </Grid>
    </Flex>
  );
}

function StepButton({
  testId,
  dir,
  orgId,
  projectId,
}: {
  testId: string | undefined;
  dir: 'prev' | 'next';
  orgId: string;
  projectId: string;
}) {
  const icon = dir === 'prev' ? ArrowLeft01Icon : ArrowRight01Icon;
  const label = dir === 'prev' ? 'Previous test' : 'Next test';
  if (!testId) {
    return (
      <Button variant="outline" size="icon-lg" className="rounded-xl" disabled aria-label={label}>
        <HugeiconsIcon icon={icon} size={16} />
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="icon-lg" className="rounded-xl" aria-label={label}>
      <Link
        to="/orgs/$orgId/projects/$projectId/explorer/$testId"
        params={{ orgId, projectId, testId }}
      >
        <HugeiconsIcon icon={icon} size={16} />
      </Link>
    </Button>
  );
}

function SourcePanel({ source, test }: { source: TestSourceRef | null; test: TestCaseSummary }) {
  const src = useQuery({
    ...getRunSourceOptions({ path: { runId: source?.id ?? '' }, query: { file: test.file } }),
    enabled: Boolean(source),
  });

  if (!source) {
    return <EmptyPanel>Source not uploaded — enable uploadSource in the reporter.</EmptyPanel>;
  }
  if (src.isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (src.error || !src.data) return <EmptyPanel>Source not available for this version.</EmptyPanel>;
  return (
    <CodeBlock
      code={src.data.content}
      name={displayFile(test.file)}
      highlightLine={source.line}
    />
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      justify="center"
      className="min-h-48 rounded-2xl border border-dashed border-border px-6 text-center"
    >
      <Text color="muted" className="text-sm">
        {children}
      </Text>
    </Flex>
  );
}

function DetailSkeleton() {
  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-6xl">
      <Flex align="center" justify="between">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </Flex>
      <Flex direction="col" gap={2}>
        <Skeleton className="h-7 w-80 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </Flex>
      <Grid cols={[1, 1, 3]} gap={4}>
        <Skeleton className="h-96 w-full rounded-2xl md:col-span-2" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </Grid>
    </Flex>
  );
}
