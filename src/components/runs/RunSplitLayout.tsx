import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { RunOverview } from './RunOverview';

/**
 * Web master-detail shell: the run detail on the left, a detail pane on the right,
 * each a full-height column that scrolls on its own. Used by both the run route
 * (empty right pane) and the file route (the selected file's tests), so the left
 * half is identical whether or not a file is open.
 */
export function RunSplitLayout({
  orgId,
  projectId,
  runId,
  selectedFile,
  children,
}: {
  orgId: string;
  projectId: string;
  runId: string;
  selectedFile?: string;
  /** The right pane content (file tests, or an empty-state prompt). */
  children: ReactNode;
}) {
  return (
    <Flex gap={6} className="h-full min-h-0 w-full">
      {/* The scroll container is a plain block, not the flex column: a flex parent
          would give the spec-files Card (overflow-hidden) an auto min-height of 0 and
          shrink+clip it to fit instead of letting this column overflow and scroll.
          The inner flex only owns the gap; it grows to its natural content height. */}
      <div className="scroll-area min-w-0 flex-1 overflow-y-auto">
        <Flex direction="col" gap={6}>
          <RunOverview
            orgId={orgId}
            projectId={projectId}
            runId={runId}
            selectedFile={selectedFile}
          />
        </Flex>
      </div>
      {/* A plain full-height divider, not another card: the file pane's contents are
          already bordered cards, so wrapping them in one more reads as card-in-card. */}
      <div aria-hidden className="w-px shrink-0 self-stretch bg-border" />
      {/* overflow-x-hidden: the pane scrolls vertically only. `overflow-y-auto` alone
          promotes overflow-x to auto, and the responsive timeline chart sits flush at
          100% width, so any sub-pixel spill would draw a spurious horizontal scrollbar. */}
      <div className="scroll-area min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
    </Flex>
  );
}
