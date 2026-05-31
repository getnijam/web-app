import { HugeiconsIcon } from '@hugeicons/react';
import type { ArtifactSummary, AttemptSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/format';
import { attemptStatusMeta } from './test-status';
import { ArtifactsRow } from './ArtifactsRow';

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : formatDuration(Math.round(ms / 1000));
}

/** One attempt: status + duration, error trace (if failed), and artifacts. */
export function AttemptBlock({
  attempt,
  onPreview,
}: {
  attempt: AttemptSummary;
  onPreview: (artifact: ArtifactSummary) => void;
}) {
  const meta = attemptStatusMeta(attempt.status);
  return (
    <Flex direction="col" gap={3} className="rounded-xl border border-border bg-muted/30 p-4">
      <Flex align="center" gap={2}>
        <Text as="span" className="text-sm font-semibold">
          Attempt {attempt.retry + 1}
        </Text>
        <Flex align="center" gap={1.5}>
          <HugeiconsIcon icon={meta.icon} size={15} className={meta.color} />
          <Text as="span" className={cn('text-xs font-medium', meta.color)}>
            {meta.label}
          </Text>
        </Flex>
        <Text as="span" className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {formatMs(attempt.durationMs)}
        </Text>
      </Flex>

      {attempt.errorMessage && (
        <pre className="scroll-area max-h-80 overflow-auto rounded-lg bg-destructive/10 p-3 font-mono text-xs whitespace-pre-wrap text-destructive">
          {attempt.errorMessage}
        </pre>
      )}

      <ArtifactsRow artifacts={attempt.artifacts} onPreview={onPreview} />
    </Flex>
  );
}
