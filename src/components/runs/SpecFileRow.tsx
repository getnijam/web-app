import { Link } from '@tanstack/react-router';
import { RUN_FILE_ROUTE } from '@/lib/routes';
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

/**
 * One spec file in the run detail. Always links to the file route (`?path=`); on
 * web that route renders it beside the run detail (with `selected` highlighting the
 * open row), on mobile it opens on its own.
 */
export function SpecFileRow({
  file,
  orgId,
  projectId,
  runId,
  selected,
}: {
  file: RunFileSummary;
  orgId: string;
  projectId: string;
  runId: string;
  selected?: boolean;
}) {
  const st = fileStatus(file);
  return (
    <Flex
      as={Link}
      to={RUN_FILE_ROUTE}
      params={{ orgId, projectId, runId } as never}
      search={{ path: file.file } as never}
      // Rows share the file route's pathname (only `?path=` differs), so match on
      // search too, else the router marks every row active / aria-current="page".
      activeOptions={{ exact: true, includeSearch: true } as never}
      align="center"
      gap={3}
      data-hover-item
      className={cn(
        'border-b border-border px-4 py-3 transition-colors last:border-b-0',
        selected && 'bg-accent',
      )}
    >
      <Flex
        align="center"
        justify="center"
        className={cn('size-9 shrink-0 rounded-lg', ICON_TINT[st])}
      >
        <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.9} />
      </Flex>
      <Text
        as="span"
        truncate
        className={cn(
          'min-w-0 flex-1 font-mono text-sm',
          selected && 'font-medium text-foreground',
        )}
      >
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
