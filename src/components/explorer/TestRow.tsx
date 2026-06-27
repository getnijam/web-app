import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { TestCaseSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { displayFile, formatDuration } from '@/lib/format';
import { testStatusMeta } from '@/components/runs/test-status';

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : formatDuration(Math.round(ms / 1000));
}

/** Which list the test detail was opened from, drives its "back" link. */
export type TestDetailOrigin = 'explorer' | 'flaky' | 'failing';

/**
 * One test case in the explorer; links to the test detail. When `flakeCount`
 * (flaky-tests page) or `failCount` (failing-tests page) is given it shows that
 * count pill instead of the retry pill, otherwise the row is identical to the
 * explorer's. `from` records the originating list so the detail page's back
 * button points there (defaults to the explorer).
 */
export function TestRow({
  test,
  orgId,
  projectId,
  flakeCount,
  failCount,
  isGroupEnabled = false,
  from = 'explorer',
}: {
  test: TestCaseSummary;
  orgId: string;
  projectId: string;
  flakeCount?: number;
  failCount?: number;
  isGroupEnabled?: boolean;
  from?: TestDetailOrigin;
}) {
  const meta = testStatusMeta(test.status);

  // The trailing pill: flake count (flaky page), fail count (failing page), or
  // the retry count (explorer), at most one applies, so pick it before render.
  const renderPill = () => {
    if (flakeCount != null)
      return (
        <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
          {flakeCount} {flakeCount === 1 ? 'flake' : 'flakes'}
        </span>
      );
    if (failCount != null)
      return (
        <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
          {failCount} {failCount === 1 ? 'failure' : 'failures'}
        </span>
      );
    if (test.retries > 0)
      return (
        <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
          {test.retries}× retry
        </span>
      );
    return null;
  };

  return (
    <Flex
      as={Link}
      to="/orgs/$orgId/projects/$projectId/explorer/$testId"
      params={{ orgId, projectId, testId: test.testId } as never}
      search={{ from } as never}
      align="center"
      gap={3}
      data-hover-item
      className={cn(
        'border-b border-border px-4 py-3',
        'transition-colors last:border-b-0',
        { 'pl-12': isGroupEnabled },
      )}
    >
      <HugeiconsIcon icon={meta.icon} size={18} className={cn('shrink-0', meta.color)} />
      <Flex direction="col" gap={0.5} className="min-w-0 flex-1 leading-tight">
        <Text as="span" truncate className="text-sm font-medium">
          {test.title}
        </Text>
        {!isGroupEnabled && (
          <Text as="span" truncate className="font-mono text-xs text-muted-foreground">
            {displayFile(test.file)}
          </Text>
        )}
      </Flex>
      {renderPill()}
      <Text as="span" className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
        {formatMs(test.durationMs)}
      </Text>
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-muted-foreground" />
    </Flex>
  );
}
