import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Skeleton } from '@/components/ui/skeleton';

/** Full projects page: header + a grid of project-card skeletons. */
export function ProjectsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex align="end" justify="between" gap={4} wrap>
        <Flex direction="col" gap={2}>
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </Flex>
        <Flex gap={3}>
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </Flex>
      </Flex>

      <Grid cols={[1, 1, 2, 2, 3]} gap={4.5}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-4 p-5">
            <Flex align="center" gap={3}>
              <Skeleton className="size-10 rounded-xl" />
              <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </Flex>
            </Flex>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Flex align="center" gap={4}>
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="ml-auto h-3 w-12 rounded-md" />
            </Flex>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
