import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { getOrgSlackIntegrationQueryKey } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { SlackDetail } from '@/components/integrations/SlackDetail';
import { notify } from '@/lib/notify';
import { privateSeo } from '@/lib/seo';

// `?connected=1` / `?error=...` are set by the OAuth callback redirect.
type Search = { connected?: boolean; error?: string };

export const Route = createFileRoute('/_authed/orgs/$orgId/integrations/slack')({
  head: () => privateSeo('Slack'),
  validateSearch: (search: Record<string, unknown>): Search => ({
    connected: search.connected === '1' || search.connected === true ? true : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: SlackPage,
});

const OAUTH_ERRORS: Record<string, string> = {
  denied: 'The Slack authorization was cancelled.',
  failed: "We couldn't complete the Slack connection. Please try again.",
};

function SlackPage() {
  const { orgId } = Route.useParams();
  const { connected, error } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Surface the OAuth outcome once, refetch status, then strip the query params.
  useEffect(() => {
    if (!connected && !error) return;
    if (connected) {
      void queryClient.invalidateQueries({
        queryKey: getOrgSlackIntegrationQueryKey({ path: { orgId } }),
      });
      notify.success('Slack connected', {
        description: 'Pick a default channel below to start posting your run results.',
      });
    } else if (error) {
      notify.error("Couldn't connect Slack", {
        description: OAUTH_ERRORS[error] ?? 'Please try again.',
      });
    }
    navigate({
      to: '/orgs/$orgId/integrations/slack',
      params: { orgId },
      search: {},
      replace: true,
    });
  }, [connected, error, orgId, navigate, queryClient]);

  return (
    <Flex direction="col" gap={5} className="mx-auto w-full max-w-5xl">
      <Link
        to="/orgs/$orgId/integrations"
        params={{ orgId }}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Integrations
      </Link>

      <SlackDetail orgId={orgId} />
    </Flex>
  );
}
