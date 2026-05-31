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

/** One test case in the explorer; links to the test detail. */
export function TestRow({
  test,
  orgId,
  projectId,
}: {
  test: TestCaseSummary;
  orgId: string;
  projectId: string;
}) {
  const meta = testStatusMeta(test.status);
  return (
    <Link
      to="/orgs/$orgId/projects/$projectId/explorer/$testId"
      params={{ orgId, projectId, testId: test.testId }}
      className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent"
    >
      <HugeiconsIcon icon={meta.icon} size={18} className={cn('shrink-0', meta.color)} />
      <Flex direction="col" gap={0.5} className="min-w-0 flex-1 leading-tight">
        <Text as="span" truncate className="text-sm font-medium">
          {test.title}
        </Text>
        <Text as="span" truncate className="font-mono text-xs text-muted-foreground">
          {displayFile(test.file)}
        </Text>
      </Flex>
      {test.retries > 0 && (
        <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
          {test.retries}× retry
        </span>
      )}
      <Text as="span" className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {formatMs(test.durationMs)}
      </Text>
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}
