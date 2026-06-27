import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, File01Icon } from '@hugeicons/core-free-icons';
import type { TestCaseSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { displayFile } from '@/lib/format';
import { CountDots } from '@/components/runs/CountDots';
import { TestRow } from '@/components/explorer/TestRow';

type FileStatus = 'passed' | 'failed' | 'flaky';

const ICON_TINT: Record<FileStatus, string> = {
  passed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  flaky: 'bg-warning/10 text-warning',
};

interface Counts {
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
}

function tally(tests: TestCaseSummary[]): Counts {
  const c: Counts = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
  for (const t of tests) c[t.status]++;
  return c;
}

function fileStatus(c: Counts): FileStatus {
  if (c.failed > 0) return 'failed';
  if (c.flaky > 0) return 'flaky';
  return 'passed';
}

/**
 * One collapsible file group in the test explorer: a header row (filename + test
 * count + status pills) that expands, via the right-chevron, into the file's test
 * rows. Collapsed by default; pass `defaultOpen` to start expanded (e.g. while a
 * search is active so matches are visible).
 */
export function FileGroup({
  file,
  tests,
  orgId,
  projectId,
  defaultOpen = false,
}: {
  file: string;
  tests: TestCaseSummary[];
  orgId: string;
  projectId: string;
  defaultOpen?: boolean;
}) {
  const counts = tally(tests);
  const st = fileStatus(counts);
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-border last:border-b-0">
      <CollapsibleTrigger
        data-hover-item
        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
        />
        <Flex
          align="center"
          justify="center"
          className={cn('size-9 shrink-0 rounded-lg', ICON_TINT[st])}
        >
          <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.9} />
        </Flex>
        <Text as="span" truncate className="min-w-0 flex-1 font-mono text-sm">
          {displayFile(file)}
        </Text>
        <Text as="span" className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {tests.length} {tests.length === 1 ? 'test' : 'tests'}
        </Text>
        <CountDots
          passed={counts.passed}
          failed={counts.failed}
          flaky={counts.flaky}
          skipped={counts.skipped}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* pl-7 = the header's chevron (size-4) + gap-3, so each row's status icon
            lines up directly under the file icon above. */}
        {/* No opaque fill here: the explorer's sliding hover highlight sits behind
            the rows (-z-10), so a background would hide it. The pl-12 indent + the
            top border still mark these as nested. */}
        <Flex direction="col" className="border-t border-border">
          {tests.map((t) => (
            <TestRow isGroupEnabled key={t.testId} test={t} orgId={orgId} projectId={projectId} />
          ))}
        </Flex>
      </CollapsibleContent>
    </Collapsible>
  );
}
