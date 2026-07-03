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
      <Flex direction="col" gap={6} className="min-w-0 flex-1 overflow-y-auto">
        <RunOverview
          orgId={orgId}
          projectId={projectId}
          runId={runId}
          selectedFile={selectedFile}
        />
      </Flex>
      <div className="min-w-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-5">
        {children}
      </div>
    </Flex>
  );
}
