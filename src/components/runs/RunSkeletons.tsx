import { Flex } from '@/components/ui/flex';
import { Skeleton } from '@/components/ui/skeleton';

/** N divider rows mirroring RunRow, inside the same bordered container. */
export function RunsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: rows }).map((_, i) => (
        <Flex key={i} align="center" className="border-b border-border last:border-b-0">
          <Skeleton className="ml-3 h-9 w-1 rounded-full" />
          <Flex align="center" gap={4} className="min-w-0 flex-1 px-4 py-3">
            <Flex direction="col" gap={2} className="min-w-0 flex-1">
              <Flex align="center" gap={2}>
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </Flex>
              <Flex align="center" gap={2.5}>
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </Flex>
            </Flex>
            <Skeleton className="hidden h-3 w-12 rounded-md sm:block" />
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="h-6 w-9 rounded-md" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

/**
 * The filter bar's loading state, shown while the backend-sourced filter options
 * (branches/users/environments) load, so the bar reads as "loading" rather than
 * briefly empty. Pills mirror the status tabs + selects + date pill.
 */
export function RunFiltersSkeleton() {
  return (
    <Flex align="center" gap={3} wrap>
      <Skeleton className="h-8 w-72 rounded-lg" />
      <Skeleton className="h-8 w-44 rounded-4xl" />
      <Skeleton className="h-8 w-48 rounded-4xl" />
      <Skeleton className="h-8 w-57.5 rounded-4xl" />
    </Flex>
  );
}

/** Full runs page: header + filter bar + list (used while the project loads). */
export function RunsPageSkeleton() {
  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={2}>
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </Flex>
      <RunFiltersSkeleton />
      <RunsListSkeleton />
    </Flex>
  );
}

/**
 * Just the run-detail body: the summary bar + spec-files panel. Used on its own when
 * the back bar, header, and attempt switcher stay mounted (switching between clubbed
 * attempts), so only the parts that actually change reload, not the whole page.
 */
export function RunDetailBodySkeleton() {
  return (
    <>
      <Flex gap={8} wrap className="rounded-2xl border border-border bg-card px-5 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Flex key={i} direction="col" gap={1.5}>
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="h-3 w-14 rounded-md" />
          </Flex>
        ))}
      </Flex>

      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        <Flex align="center" className="border-b border-border px-5 py-4">
          <Skeleton className="h-5 w-24 rounded-md" />
        </Flex>
        {Array.from({ length: 5 }).map((_, i) => (
          <Flex
            key={i}
            align="center"
            gap={3}
            className="border-b border-border px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
            <Skeleton className="ml-auto h-6 w-10 rounded-md" />
          </Flex>
        ))}
      </Flex>
    </>
  );
}

/**
 * The run-detail column, back bar + header + summary + spec-files panel, without a
 * page container. Rendered by RunOverview so it works both standalone (run page)
 * and as the left half of the file page's side-by-side split.
 */
export function RunDetailColumnSkeleton() {
  return (
    <>
      <Flex align="center" justify="between">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-40 rounded-md" />
      </Flex>

      <Flex direction="col" gap={2}>
        <Flex align="center" gap={2.5}>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-md" />
        </Flex>
        <Skeleton className="h-4 w-80 rounded-md" />
      </Flex>

      <RunDetailBodySkeleton />
    </>
  );
}

/** File detail: back bar + header + a stack of test rows. */
export function RunFileSkeleton() {
  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex align="center" justify="between">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-40 rounded-md" />
      </Flex>

      <Flex align="center" justify="between" gap={3} wrap>
        <Skeleton className="h-6 w-72 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </Flex>

      <Flex direction="col" gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Flex
            key={i}
            align="center"
            gap={3}
            className="rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-4 w-80 rounded-md" />
            <Skeleton className="ml-auto h-4 w-14 rounded-md" />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
