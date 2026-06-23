import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { RunFileSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { displayFile } from '@/lib/format';
import { CountDots } from './CountDots';
import { fileStatus, type FileStatus } from './file-status';

const ICON_TINT: Record<FileStatus, string> = {
  passed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  flaky: 'bg-warning/10 text-warning',
};

/** One spec file in the run detail — links to the file detail (8b). */
export function SpecFileRow({
  file,
  orgId,
  projectId,
  runId,
}: {
  file: RunFileSummary;
  orgId: string;
  projectId: string;
  runId: string;
}) {
  const st = fileStatus(file);
  return (
    <Flex
      as={Link}
      to="/orgs/$orgId/projects/$projectId/runs/$runId/file"
      params={{ orgId, projectId, runId } as never}
      search={{ path: file.file } as never}
      align="center"
      gap={3}
      className="border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent"
    >
      <Flex
        align="center"
        justify="center"
        className={cn('size-9 shrink-0 rounded-lg', ICON_TINT[st])}
      >
        <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.9} />
      </Flex>
      <Text as="span" truncate className="min-w-0 flex-1 font-mono text-sm">
        {displayFile(file.file)}
      </Text>
      <CountDots
        passed={file.passed}
        failed={file.failed}
        flaky={file.flaky}
        skipped={file.skipped}
      />
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-muted-foreground" />
    </Flex>
  );
}
