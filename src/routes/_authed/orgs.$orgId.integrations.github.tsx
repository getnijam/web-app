import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { getOrgGithubIntegrationQueryKey } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { GitHubDetail } from '@/components/integrations/GitHubDetail';
import { notify } from '@/lib/notify';
import { privateSeo } from '@/lib/seo';

// `?connected=1` / `?error=...` are set by the App setup-callback redirect.
type Search = { connected?: boolean; error?: string };

export const Route = createFileRoute('/_authed/orgs/$orgId/integrations/github')({
  head: () => privateSeo('GitHub'),
  validateSearch: (search: Record<string, unknown>): Search => ({
    connected: search.connected === '1' || search.connected === true ? true : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: GitHubPage,
});

const SETUP_ERRORS: Record<string, string> = {
  denied: 'The GitHub installation was cancelled.',
  failed: "We couldn't complete the GitHub connection. Please try again.",
  claimed: 'That GitHub installation is already linked to another Nijam organization.',
};

function GitHubPage() {
  const { orgId } = Route.useParams();
  const { connected, error } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Surface the install outcome once, refetch status, then strip the query params.
  useEffect(() => {
    if (!connected && !error) return;
    if (connected) {
      void queryClient.invalidateQueries({
        queryKey: getOrgGithubIntegrationQueryKey({ path: { orgId } }),
      });
      notify.success('GitHub connected', {
        description: 'PR checks and comments will post on your next run.',
      });
    } else if (error) {
      notify.error("Couldn't connect GitHub", {
        description: SETUP_ERRORS[error] ?? 'Please try again.',
      });
    }
    navigate({
      to: '/orgs/$orgId/integrations/github',
      params: { orgId },
      search: {},
      replace: true,
    });
  }, [connected, error, orgId, navigate, queryClient]);

  return (
    <Flex direction="col" gap={5} className="mx-auto w-full max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
        <Link to="/orgs/$orgId/integrations" params={{ orgId }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Integrations
        </Link>
      </Button>

      <GitHubDetail orgId={orgId} />
    </Flex>
  );
}
