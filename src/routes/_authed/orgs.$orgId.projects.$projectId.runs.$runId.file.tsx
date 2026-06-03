import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import type { ArtifactSummary } from '@/client';
import { getRunOptions, getRunFileTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { displayFile } from '@/lib/format';
import { RunFileSkeleton } from '@/components/runs/RunSkeletons';
import { CountDots } from '@/components/runs/CountDots';
import { AttemptBlock } from '@/components/runs/AttemptBlock';
import { ArtifactPreviewModal } from '@/components/runs/ArtifactPreviewModal';
import { testStatusMeta } from '@/components/runs/test-status';
import { cn } from '@/lib/utils';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/runs/$runId/file')({
  head: () => privateSeo('Run file'),
  component: FileDetailPage,
  validateSearch: (search: Record<string, unknown>): { path: string } => ({
    path: typeof search.path === 'string' ? search.path : '',
  }),
});

function FileDetailPage() {
  const { orgId, projectId, runId } = Route.useParams();
  const { path } = Route.useSearch();
  const [preview, setPreview] = useState<ArtifactSummary | null>(null);

  const run = useQuery(getRunOptions({ path: { id: runId } }));
  const fileTests = useQuery(getRunFileTestsOptions({ path: { runId }, query: { file: path } }));

  if (run.isLoading || fileTests.isLoading) return <RunFileSkeleton />;
  if (run.error || !run.data) return <ErrorState error={run.error} onRetry={() => run.refetch()} />;
  if (fileTests.error || !fileTests.data) {
    return <ErrorState error={fileTests.error} onRetry={() => fileTests.refetch()} />;
  }

  const runData = run.data.run;
  const fileSummary = run.data.files.find((f) => f.file === path);
  const tests = fileTests.data.tests;
  const firstNonPassing = tests.find((t) => t.status !== 'passed');
  const commit = runData.commitSha ? runData.commitSha.slice(0, 7) : '———';

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      {/* back bar */}
      <Flex align="center" justify="between" gap={3}>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link
            to="/orgs/$orgId/projects/$projectId/runs/$runId"
            params={{ orgId, projectId, runId }}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />#{commit}
          </Link>
        </Button>
        {runData.ciRunUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={runData.ciRunUrl} target="_blank" rel="noreferrer">
              View run on {runData.ciProvider ?? 'CI'}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
            </a>
          </Button>
        )}
      </Flex>

      {/* header */}
      <Flex align="center" justify="between" gap={3} wrap>
        <Text variant="code" className="min-w-0 truncate text-lg font-semibold">
          {displayFile(path)}
        </Text>
        {fileSummary && (
          <CountDots
            passed={fileSummary.passed}
            failed={fileSummary.failed}
            flaky={fileSummary.flaky}
            skipped={fileSummary.skipped}
          />
        )}
      </Flex>

      {/* tests accordion */}
      {tests.length === 0 ? (
        <EmptyState title="No tests" description="This file has no recorded tests in this run." />
      ) : (
        <Accordion
          type="multiple"
          defaultValue={firstNonPassing ? [firstNonPassing.testId] : []}
          // Each test is its own bordered card (below), so drop the shadcn root's
          // container border/rounding — otherwise it doubles up as an outer box.
          className="flex flex-col gap-2 overflow-visible rounded-none border-0"
        >
          {tests.map((t) => {
            const meta = testStatusMeta(t.status);
            return (
              <AccordionItem
                key={t.testId}
                value={t.testId}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <Flex align="center" gap={3} className="min-w-0 flex-1">
                    <HugeiconsIcon icon={meta.icon} size={18} className={cn('shrink-0', meta.color)} />
                    <Text as="span" truncate className="min-w-0 flex-1 text-left text-sm font-medium">
                      {t.title}
                    </Text>
                    {t.attempts.length > 1 && (
                      <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                        {t.attempts.length} attempts
                      </span>
                    )}
                    <span className={cn('shrink-0 text-xs font-medium', meta.color)}>
                      {meta.label}
                    </span>
                  </Flex>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Flex direction="col" gap={3}>
                    {t.attempts.map((a) => (
                      <AttemptBlock
                        key={a.id}
                        attempt={a}
                        shardTotal={runData.shardTotal}
                        onPreview={setPreview}
                      />
                    ))}
                  </Flex>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <ArtifactPreviewModal artifact={preview} onOpenChange={(o) => !o && setPreview(null)} />
    </Flex>
  );
}
