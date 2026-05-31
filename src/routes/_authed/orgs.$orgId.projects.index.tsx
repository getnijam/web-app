import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import {
  listOrgProjectsOptions,
  listOrgProjectsQueryKey,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states/ErrorState';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectsSkeleton } from '@/components/projects/ProjectsSkeleton';
import { NewProjectDialog } from '@/components/projects/NewProjectDialog';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/')({ component: ProjectsPage });

function ProjectsPage() {
  const { orgId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery(listOrgProjectsOptions({ path: { orgId } }));
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <ProjectsSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  const projects = data?.projects ?? [];
  const failing = projects.filter((p) => p.stats?.status === 'fail').length;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-content">
      <Flex align="end" justify="between" gap={4} wrap>
        <Flex direction="col" gap={1}>
          <Text variant="h1">Projects</Text>
          <Text color="muted" className="text-sm">
            {projects.length} test {projects.length === 1 ? 'project' : 'projects'}
            {failing > 0 && ` · ${failing} currently failing`}
          </Text>
        </Flex>
        <Flex align="center" gap={3} wrap>
          <Flex align="center" className="mr-1 gap-3.5 text-xs text-muted-foreground">
            <Flex align="center" gap={1.5}>
              <span className="size-2.25 rounded-sm bg-success" />
              Passed
            </Flex>
            <Flex align="center" gap={1.5}>
              <span className="size-2.25 rounded-sm bg-destructive" />
              Failed
            </Flex>
          </Flex>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: listOrgProjectsQueryKey({ path: { orgId } }),
              })
            }
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
            Sync
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New project
          </Button>
        </Flex>
      </Flex>

      {projects.length === 0 ? (
        <Flex
          direction="col"
          align="center"
          justify="center"
          gap={3}
          className="rounded-2xl border border-dashed border-border py-20 text-center"
        >
          <Text weight="semibold">Create your first project</Text>
          <Text color="muted" className="max-w-md">
            A project gives you an ID to point the reporter at. Once your tests run in CI, their
            results show up here.
          </Text>
          <Button onClick={() => setDialogOpen(true)} className="mt-1">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New project
          </Button>
        </Flex>
      ) : (
        <Grid cols={[1, 1, 2, 2, 3]} gap={4.5}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} orgId={orgId} />
          ))}
        </Grid>
      )}

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} orgId={orgId} />
    </Flex>
  );
}
