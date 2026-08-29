import { createFileRoute } from '@tanstack/react-router';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  getProjectOptions,
  getProjectSlackSettingsOptions,
  getProjectGithubSettingsOptions,
  getProjectGitlabSettingsOptions,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { ProjectSlackSettings } from '@/components/integrations/ProjectSlackSettings';
import { ProjectGitHubSettings } from '@/components/integrations/ProjectGitHubSettings';
import { ProjectGitLabSettings } from '@/components/integrations/ProjectGitLabSettings';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute(
  '/_authed/orgs/$orgId/projects/$projectId/settings/integrations',
)({
  head: () => privateSeo('Project integrations'),
  component: ProjectIntegrationsSettingsPage,
});

/**
 * The per-project overrides for each org integration: which channel a project posts
 * to, whether it posts at all, and which branches it reports on. The org-wide
 * connection itself lives under Integrations in the org nav, these panels only
 * narrow it for one project.
 */
function ProjectIntegrationsSettingsPage() {
  const { orgId, projectId } = Route.useParams();
  const project = useQuery(getProjectOptions({ path: { id: projectId } }));

  // Each panel renders nothing until its own settings query resolves, which read as
  // an empty page now that they're the whole tab rather than a tail below General.
  // Observing the same three queries here (same keys, so they share one fetch with
  // the panels) lets the tab hold a single loading state and bring them in together.
  const settings = useQueries({
    queries: [
      getProjectSlackSettingsOptions({ path: { projectId } }),
      getProjectGithubSettingsOptions({ path: { projectId } }),
      getProjectGitlabSettingsOptions({ path: { projectId } }),
    ],
  });

  const error = project.error ?? settings.find((q) => q.error)?.error;
  const loading = project.isLoading || settings.some((q) => q.isLoading);

  if (loading) return <LoadingState />;
  if (error || !project.data) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void project.refetch();
          settings.forEach((q) => void q.refetch());
        }}
      />
    );
  }

  return (
    <Flex direction="col" gap={6}>
      <ProjectSlackSettings
        orgId={orgId}
        projectId={project.data.id}
        projectName={project.data.name}
      />
      <ProjectGitHubSettings
        orgId={orgId}
        projectId={project.data.id}
        projectName={project.data.name}
      />
      <ProjectGitLabSettings
        orgId={orgId}
        projectId={project.data.id}
        projectName={project.data.name}
      />
    </Flex>
  );
}
