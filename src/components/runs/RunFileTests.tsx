import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import type { ArtifactSummary, RunFileSummary } from '@/client';
import { getRunFileTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { displayFile } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CountDots } from './CountDots';
import { AttemptBlock } from './AttemptBlock';
import { ArtifactPreviewModal } from './ArtifactPreviewModal';
import { testStatusMeta } from './test-status';
import { TestHistorySheet } from '@/components/explorer/TestHistorySheet';

/**
 * The tests inside one spec file: header (path + counts), the attempts accordion,
 * and the artifact-preview / test-history modals. Deliberately chrome-free (no back
 * bar, no "View run on CI"), so it drops into either the standalone file page on
 * mobile or the run detail's side-by-side pane on web. Passing `onClose` adds a
 * small close control to the header (used by the web pane to clear the selection).
 */
export function RunFileTests({
  orgId,
  projectId,
  runId,
  path,
  fileSummary,
  shardTotal,
  onClose,
}: {
  orgId: string;
  projectId: string;
  runId: string;
  path: string;
  fileSummary?: RunFileSummary;
  shardTotal?: number | null;
  onClose?: () => void;
}) {
  const [preview, setPreview] = useState<ArtifactSummary | null>(null);
  // The test whose cross-run history is shown in the side sheet (null = closed).
  const [historyTest, setHistoryTest] = useState<{ testId: string; title: string } | null>(null);

  const fileTests = useQuery(getRunFileTestsOptions({ path: { runId }, query: { file: path } }));

  function renderTests() {
    if (fileTests.isLoading) {
      return (
        <Flex direction="col" gap={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </Flex>
      );
    }
    if (fileTests.error || !fileTests.data) {
      return <ErrorState error={fileTests.error} onRetry={() => fileTests.refetch()} />;
    }

    const tests = fileTests.data.tests;
    if (tests.length === 0) {
      return (
        <EmptyState title="No tests" description="This file has no recorded tests in this run." />
      );
    }
    const firstNonPassing = tests.find((t) => t.status !== 'passed');

    return (
      <Accordion
        type="multiple"
        defaultValue={firstNonPassing ? [firstNonPassing.testId] : []}
        // Each test is its own bordered card (below), so drop the shadcn root's
        // container border/rounding, otherwise it doubles up as an outer box.
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
              <AccordionTrigger
                iconPosition="start"
                className="items-center justify-start gap-3 px-4 py-3 hover:no-underline"
                action={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="mr-2 shrink-0 text-muted-foreground"
                        onClick={() => setHistoryTest({ testId: t.testId, title: t.title })}
                        aria-label={`Open history for ${t.title}`}
                      >
                        <HugeiconsIcon icon={Clock01Icon} size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open history</TooltipContent>
                  </Tooltip>
                }
              >
                <Flex align="center" gap={3} className="min-w-0 flex-1">
                  <HugeiconsIcon
                    icon={meta.icon}
                    size={18}
                    className={cn('shrink-0', meta.color)}
                  />
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
                      shardTotal={shardTotal}
                      onPreview={setPreview}
                    />
                  ))}
                </Flex>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }

  return (
    <Flex direction="col" gap={6} className="min-w-0">
      {/* header */}
      <Flex align="center" justify="between" gap={3} wrap>
        <Text variant="code" title={path} className="min-w-0 truncate text-lg font-semibold">
          {displayFile(path)}
        </Text>
        <Flex align="center" gap={2} className="shrink-0">
          {fileSummary && (
            <CountDots
              passed={fileSummary.passed}
              failed={fileSummary.failed}
              flaky={fileSummary.flaky}
              skipped={fileSummary.skipped}
            />
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={onClose}
              aria-label="Close file"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </Button>
          )}
        </Flex>
      </Flex>

      {renderTests()}

      <ArtifactPreviewModal artifact={preview} onOpenChange={(o) => !o && setPreview(null)} />
      <TestHistorySheet
        open={!!historyTest}
        onOpenChange={(o) => !o && setHistoryTest(null)}
        test={historyTest}
        orgId={orgId}
        projectId={projectId}
        file={path}
      />
    </Flex>
  );
}
