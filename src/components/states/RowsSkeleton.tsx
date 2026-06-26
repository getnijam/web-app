import { Flex } from '@/components/ui/flex';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Divider-row skeletons for list panels (members, secret keys, …), a leading
 * glyph (round avatar or square icon), two text lines, and a trailing chip.
 */
export function RowsSkeleton({ rows = 3, round = false }: { rows?: number; round?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Flex
          key={i}
          align="center"
          gap={3}
          className="border-b border-border px-5 py-4 last:border-b-0"
        >
          <Skeleton className={cn('size-9.5 shrink-0', round ? 'rounded-full' : 'rounded-lg')} />
          <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </Flex>
          <Skeleton className="h-6 w-20 rounded-full" />
        </Flex>
      ))}
    </>
  );
}
