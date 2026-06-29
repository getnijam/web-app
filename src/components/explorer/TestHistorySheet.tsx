import { useQuery } from '@tanstack/react-query';
import { getProjectTestOptions } from '@/client/@tanstack/react-query.gen';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { RunHistory } from '@/components/explorer/RunHistory';
import { displayFile } from '@/lib/format';

/**
 * A right-side sheet showing a single test's cross-run history (the same card as the
 * test-explorer detail). Fetches lazily on open. Opened from the run-file accordion.
 */
export function TestHistorySheet({
  open,
  onOpenChange,
  test,
  orgId,
  projectId,
  file,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: { testId: string; title: string } | null;
  orgId: string;
  projectId: string;
  file: string;
}) {
  const q = useQuery({
    ...getProjectTestOptions({ path: { projectId, testId: test?.testId ?? '' } }),
    enabled: open && !!test,
  });

  const renderBody = () => {
    if (!open || !test) return null;
    if (q.isLoading) return <Skeleton className="size-full rounded-2xl" />;
    if (q.error || !q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
    return (
      <RunHistory
        history={q.data.history}
        orgId={orgId}
        projectId={projectId}
        file={file}
        className="h-full border-0 bg-transparent"
        onNavigate={() => onOpenChange(false)}
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border">
          <SheetTitle className="truncate pr-8">{test?.title ?? 'Run history'}</SheetTitle>
          <SheetDescription className="truncate font-mono text-xs">
            {displayFile(file)}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden p-4">{renderBody()}</div>
      </SheetContent>
    </Sheet>
  );
}
