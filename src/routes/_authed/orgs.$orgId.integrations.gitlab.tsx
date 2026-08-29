import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ORG_INTEGRATIONS_GITLAB_ROUTE, ORG_INTEGRATIONS_ROUTE } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { getOrgGitlabIntegrationQueryKey } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { GitLabDetail } from '@/components/integrations/GitLabDetail';
import { notify } from '@/lib/notify';
import { privateSeo } from '@/lib/seo';

// `?connected=1` / `?error=...` are set by the OAuth callback redirect.
type Search = { connected?: boolean; error?: string };

export const Route = createFileRoute('/_authed/orgs/$orgId/integrations/gitlab')({
  head: () => privateSeo('GitLab'),
  validateSearch: (search: Record<string, unknown>): Search => ({
    connected: search.connected === '1' || search.connected === true ? true : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: GitLabPage,
});

const SETUP_ERRORS: Record<string, string> = {
  denied: 'The GitLab authorization was cancelled.',
  failed: "We couldn't complete the GitLab connection. Please try again.",
};

function GitLabPage() {
  const { orgId } = Route.useParams();
  const { connected, error } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Surface the connect outcome once, refetch status, then strip the query params.
  useEffect(() => {
    if (!connected && !error) return;
    if (connected) {
      void queryClient.invalidateQueries({
        queryKey: getOrgGitlabIntegrationQueryKey({ path: { orgId } }),
      });
      notify.success('GitLab connected', {
        description: 'Commit statuses and MR notes will post on your next run.',
      });
    } else if (error) {
      notify.error("Couldn't connect GitLab", {
        description: SETUP_ERRORS[error] ?? 'Please try again.',
      });
    }
    navigate({
      to: ORG_INTEGRATIONS_GITLAB_ROUTE,
      params: { orgId },
      search: {},
      replace: true,
    });
  }, [connected, error, orgId, navigate, queryClient]);

  return (
    <Flex direction="col" gap={5} className="mx-auto w-full max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
        <Link to={ORG_INTEGRATIONS_ROUTE} params={{ orgId }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Integrations
        </Link>
      </Button>

      <GitLabDetail orgId={orgId} />
    </Flex>
  );
}
