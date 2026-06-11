import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiChat02Icon, ArrowRight01Icon, WebhookIcon } from '@hugeicons/core-free-icons';
import {
  getOrgSlackIntegrationOptions,
  installOrgSlackMutation,
  getOrgGithubIntegrationOptions,
  installOrgGithubMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { SlackLogo } from './SlackLogo';
import { GitHubLogo } from './GitHubLogo';
import { TeamsLogo } from './TeamsLogo';
import { DiscordLogo } from './DiscordLogo';

const TRIGGER_SUMMARY: Record<string, string> = {
  every: 'every run',
  fail: 'runs with failures',
  failflaky: 'failures or flaky tests',
  regression: 'regressions',
};

const COMING_SOON = [
  {
    key: 'teams',
    name: 'Microsoft Teams',
    desc: 'Post run summaries into Teams channels.',
    logo: <TeamsLogo size={22} />,
  },
  {
    key: 'discord',
    name: 'Discord',
    desc: 'Send results to a Discord server channel.',
    logo: <DiscordLogo size={22} />,
  },
  {
    key: 'webhook',
    name: 'Webhooks',
    desc: 'POST run events as JSON to any HTTPS endpoint.',
    logo: <HugeiconsIcon icon={WebhookIcon} size={20} className="text-muted-foreground" />,
  },
];

interface Entry {
  key: string;
  name: string;
  to: string;
  desc: string;
  connectedBlurb: string;
  logo: (size: number) => ReactNode;
  configured: boolean;
  connected: boolean;
  status: 'connected' | 'error' | null;
  connectLabel: string;
  connect: () => void;
  installing: boolean;
}

function CardRow({ children }: { children: ReactNode }) {
  return (
    <Flex align="center" gap={3.5} className="border-b border-border px-5 py-4 last:border-b-0">
      {children}
    </Flex>
  );
}

export function IntegrationsList({ orgId }: { orgId: string }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const slack = useQuery(getOrgSlackIntegrationOptions({ path: { orgId } }));
  const github = useQuery(getOrgGithubIntegrationOptions({ path: { orgId } }));

  const slackInstall = useMutation({
    ...installOrgSlackMutation(),
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) =>
      notify.error("Couldn't connect Slack", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });
  const githubInstall = useMutation({
    ...installOrgGithubMutation(),
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) =>
      notify.error("Couldn't connect GitHub", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  if (slack.isLoading || github.isLoading) return <LoadingState />;
  if (slack.error || !slack.data || github.error || !github.data) {
    return (
      <ErrorState
        error={slack.error ?? github.error}
        onRetry={() => {
          void slack.refetch();
          void github.refetch();
        }}
      />
    );
  }

  const slackData = slack.data;
  const githubData = github.data;
  const slackChannel = slackData.defaultChannel ? `#${slackData.defaultChannel.name}` : 'a channel';
  const slackSummary = TRIGGER_SUMMARY[slackData.triggerMode] ?? 'failures or flaky tests';

  const entries: Entry[] = [
    {
      key: 'slack',
      name: 'Slack',
      to: '/orgs/$orgId/integrations/slack',
      desc: 'Post run summaries into your Slack channels.',
      connectedBlurb: `Posting ${slackSummary} to ${slackChannel} · ${slackData.teamName ?? ''}`,
      logo: (s) => <SlackLogo size={s} />,
      configured: slackData.configured,
      connected: slackData.connected,
      status: slackData.status,
      connectLabel: slackData.connected ? 'Reconnect' : 'Add to Slack',
      connect: () => slackInstall.mutate({ path: { orgId } }),
      installing: slackInstall.isPending,
    },
    {
      key: 'github',
      name: 'GitHub',
      to: '/orgs/$orgId/integrations/github',
      desc: 'Post a PR check and results comment when tests run on a pull request.',
      connectedBlurb: githubData.accountLogin
        ? `Posting PR checks & comments · ${githubData.accountLogin}`
        : 'Posting PR checks & comments',
      logo: (s) => <GitHubLogo size={s} />,
      configured: githubData.configured,
      connected: githubData.connected,
      status: githubData.status,
      connectLabel: githubData.connected ? 'Reconnect' : 'Install GitHub App',
      connect: () => githubInstall.mutate({ path: { orgId } }),
      installing: githubInstall.isPending,
    },
  ];

  const connected = entries.filter((e) => e.connected);
  const available = entries.filter((e) => !e.connected);

  const connectButton = (e: Entry) => {
    if (!isAdmin)
      return <Text className="text-sm text-muted-foreground">Ask an admin to connect.</Text>;
    if (!e.configured)
      return (
        <Text className="text-sm text-muted-foreground">Not available on this server yet.</Text>
      );
    return (
      <Button
        variant={e.connected ? 'outline' : 'default'}
        loading={e.installing}
        onClick={e.connect}
      >
        {e.logo(16)}
        {e.connectLabel}
      </Button>
    );
  };

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Integrations</Text>
        <Text color="muted">
          Connect Nijam to the tools your team already lives in — Slack notifications, GitHub PR
          checks &amp; comments, and AI agents via MCP.
        </Text>
      </Flex>

      {connected.length > 0 && (
        <Flex direction="col" gap={2}>
          <Text
            as="span"
            className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Connected
          </Text>
          <Flex
            direction="col"
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {connected.map((e) => (
              <Flex
                key={e.key}
                as={Link}
                to={e.to}
                params={{ orgId } as never}
                align="center"
                gap={3.5}
                className="border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-accent"
              >
                <Flex
                  as="span"
                  align="center"
                  justify="center"
                  className="size-9 shrink-0 rounded-lg bg-muted"
                >
                  {e.logo(22)}
                </Flex>
                <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
                  <Flex align="center" gap={2}>
                    <Text as="span" className="text-sm font-semibold">
                      {e.name}
                    </Text>
                    <Badge
                      variant={e.status === 'error' ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          e.status === 'error' ? 'bg-destructive' : 'bg-success',
                        )}
                      />
                      {e.status === 'error' ? 'Needs attention' : 'Connected'}
                    </Badge>
                  </Flex>
                  <Text as="span" className="truncate text-xs text-muted-foreground">
                    {e.connectedBlurb}
                  </Text>
                </Flex>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      <Flex direction="col" gap={2}>
        <Text
          as="span"
          className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          Available
        </Text>
        <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
          {available.map((e) => (
            <CardRow key={e.key}>
              <Flex
                as="span"
                align="center"
                justify="center"
                className="size-9 shrink-0 rounded-lg bg-muted"
              >
                {e.logo(22)}
              </Flex>
              <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
                <Text as="span" className="text-sm font-semibold">
                  {e.name}
                </Text>
                <Text as="span" className="text-xs text-muted-foreground">
                  {e.desc}
                </Text>
              </Flex>
              {connectButton(e)}
            </CardRow>
          ))}
          {/* The MCP server has no server-side connection state — the setup
              (a read key + a copy-paste command) lives on the keys page. */}
          <CardRow>
            <Flex
              as="span"
              align="center"
              justify="center"
              className="size-9 shrink-0 rounded-lg bg-muted"
            >
              <HugeiconsIcon icon={AiChat02Icon} size={20} className="text-muted-foreground" />
            </Flex>
            <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
              <Text as="span" className="text-sm font-semibold">
                MCP server
              </Text>
              <Text as="span" className="text-xs text-muted-foreground">
                Let AI agents query your runs — failures, history, flakiness — from any MCP-capable
                client.
              </Text>
            </Flex>
            <Button asChild variant="outline">
              <Link to="/orgs/$orgId/keys/mcp" params={{ orgId } as never}>
                Set up
              </Link>
            </Button>
          </CardRow>
          {COMING_SOON.map((c) => (
            <CardRow key={c.key}>
              <Flex
                as="span"
                align="center"
                justify="center"
                className="size-9 shrink-0 rounded-lg bg-muted"
              >
                {c.logo}
              </Flex>
              <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
                <Text as="span" className="text-sm font-semibold">
                  {c.name}
                </Text>
                <Text as="span" className="text-xs text-muted-foreground">
                  {c.desc}
                </Text>
              </Flex>
              <Badge variant="outline">Coming soon</Badge>
            </CardRow>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
