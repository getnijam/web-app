import { Link } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, WebhookIcon } from '@hugeicons/core-free-icons';
import {
  getOrgSlackIntegrationOptions,
  installOrgSlackMutation,
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
import { TeamsLogo } from './TeamsLogo';
import { DiscordLogo } from './DiscordLogo';

const TRIGGER_SUMMARY: Record<string, string> = {
  every: 'every run',
  fail: 'runs with failures',
  failflaky: 'failures or flaky tests',
  regression: 'regressions',
};

// Other destinations — not yet available (mirrors the design's catalog). Brand
// logos sit on a neutral tile so their own colors read true; the webhook uses
// the Hugeicons glyph tinted with a token.
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

function CardRow({ children }: { children: React.ReactNode }) {
  return (
    <Flex align="center" gap={3.5} className="border-b border-border px-5 py-4 last:border-b-0">
      {children}
    </Flex>
  );
}

export function IntegrationsList({ orgId }: { orgId: string }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const status = useQuery(getOrgSlackIntegrationOptions({ path: { orgId } }));

  const install = useMutation({
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

  if (status.isLoading) return <LoadingState />;
  if (status.error || !status.data) {
    return <ErrorState error={status.error} onRetry={() => status.refetch()} />;
  }

  const data = status.data;
  const connected = data.connected;
  const channelLabel = data.defaultChannel ? `#${data.defaultChannel.name}` : 'a channel';
  const summary = TRIGGER_SUMMARY[data.triggerMode] ?? 'failures or flaky tests';

  const connectButton = isAdmin ? (
    <Button
      variant={connected ? 'outline' : 'default'}
      loading={install.isPending}
      disabled={!data.configured}
      onClick={() => install.mutate({ path: { orgId } })}
    >
      <SlackLogo size={16} />
      {connected ? 'Reconnect' : 'Add to Slack'}
    </Button>
  ) : (
    <Text className="text-sm text-muted-foreground">Ask an admin to connect.</Text>
  );

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Integrations</Text>
        <Text color="muted">
          Send test-run notifications to the tools your team already lives in.
        </Text>
      </Flex>

      {!data.configured && (
        <Text color="muted" className="text-sm">
          Slack isn&rsquo;t available on this server yet.
        </Text>
      )}

      {connected ? (
        <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
          <Flex align="center" className="border-b border-border px-5 py-3">
            <Text variant="h4">Connected</Text>
          </Flex>
          <Link
            to="/orgs/$orgId/integrations/slack"
            params={{ orgId }}
            className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <SlackLogo size={22} />
            </span>
            <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
              <Flex align="center" gap={2}>
                <Text as="span" className="text-sm font-semibold">
                  Slack
                </Text>
                <Badge
                  variant={data.status === 'error' ? 'destructive' : 'secondary'}
                  className="gap-1"
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      data.status === 'error' ? 'bg-destructive' : 'bg-success',
                    )}
                  />
                  {data.status === 'error' ? 'Needs attention' : 'Connected'}
                </Badge>
              </Flex>
              <Text as="span" className="truncate text-xs text-muted-foreground">
                Posting {summary} to {channelLabel} · {data.teamName}
              </Text>
            </Flex>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              className="shrink-0 text-muted-foreground"
            />
          </Link>
        </Flex>
      ) : (
        <Flex
          direction="col"
          align="center"
          gap={3}
          className="rounded-2xl border border-border bg-card px-6 py-10 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <SlackLogo size={32} />
          </span>
          <Text variant="h4">Connect your first integration</Text>
          <Text color="muted" className="max-w-md text-sm">
            Connect Slack to start posting passing, flaky and failing runs straight into your
            team&rsquo;s channels — every message links back to its results on Nijam.
          </Text>
          {connectButton}
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
          {!connected && (
            <CardRow>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <SlackLogo size={22} />
              </span>
              <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
                <Text as="span" className="text-sm font-semibold">
                  Slack
                </Text>
                <Text as="span" className="text-xs text-muted-foreground">
                  Post run summaries into your Slack channels.
                </Text>
              </Flex>
              {connectButton}
            </CardRow>
          )}
          {COMING_SOON.map((c) => (
            <CardRow key={c.key}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                {c.logo}
              </span>
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
