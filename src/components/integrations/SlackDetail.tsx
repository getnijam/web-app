import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import type { SlackStatusResponse } from '@/client';
import {
  getOrgSlackIntegrationOptions,
  getOrgSlackIntegrationQueryKey,
  listOrgSlackChannelsOptions,
  updateOrgSlackIntegrationMutation,
  disconnectOrgSlackMutation,
  testOrgSlackMutation,
  installOrgSlackMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { SlackLogo } from './SlackLogo';
import { SlackPreview, type PreviewState } from './SlackPreview';
import { Segmented } from './Segmented';

type TriggerMode = SlackStatusResponse['triggerMode'];
type DetailLevel = SlackStatusResponse['detailLevel'];
type Layout = SlackStatusResponse['layout'];

const TRIGGERS: { key: TriggerMode; label: string; desc: string; summary: string }[] = [
  {
    key: 'every',
    label: 'Every run',
    desc: 'Post a summary after every run.',
    summary: 'every run',
  },
  {
    key: 'fail',
    label: 'Only failures',
    desc: 'Post when a run has failed tests.',
    summary: 'runs with failures',
  },
  {
    key: 'failflaky',
    label: 'Failures or flaky',
    desc: 'Post when a run has failed or flaky tests.',
    summary: 'failures or flaky tests',
  },
  {
    key: 'regression',
    label: 'Regressions only',
    desc: 'Post on the first failure after a passing run.',
    summary: 'regressions',
  },
];

function triggerSummary(mode: TriggerMode): string {
  return TRIGGERS.find((t) => t.key === mode)?.summary ?? 'failures or flaky tests';
}

export function SlackDetail({ orgId }: { orgId: string }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const status = useQuery(getOrgSlackIntegrationOptions({ path: { orgId } }));

  if (status.isLoading) return <LoadingState />;
  if (status.error || !status.data) {
    return <ErrorState error={status.error} onRetry={() => status.refetch()} />;
  }
  // Remount on (re)connect so the draft re-seeds from the fresh server config.
  return (
    <SlackDetailInner
      key={`${status.data.connected}:${status.data.connectedAt ?? ''}`}
      orgId={orgId}
      isAdmin={isAdmin}
      data={status.data}
    />
  );
}

interface Draft {
  triggerMode: TriggerMode;
  detailLevel: DetailLevel;
  layout: Layout;
  channelId: string | null;
  channelName: string | null;
}

function SlackDetailInner({
  orgId,
  isAdmin,
  data,
}: {
  orgId: string;
  isAdmin: boolean;
  data: SlackStatusResponse;
}) {
  const queryClient = useQueryClient();
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState>('fail');

  // Local draft of the editable config. Changes stay local until Save commits
  // them in one PATCH — nothing is persisted per keystroke/click.
  const [draft, setDraft] = useState<Draft>(() => ({
    triggerMode: data.triggerMode,
    detailLevel: data.detailLevel,
    layout: data.layout,
    channelId: data.defaultChannel?.id ?? null,
    channelName: data.defaultChannel?.name ?? null,
  }));

  const dirty =
    draft.triggerMode !== data.triggerMode ||
    draft.detailLevel !== data.detailLevel ||
    draft.layout !== data.layout ||
    (draft.channelId ?? null) !== (data.defaultChannel?.id ?? null);

  const queryKey = getOrgSlackIntegrationQueryKey({ path: { orgId } });
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  // Channel options (admin-only endpoint). Loaded only once connected.
  const channels = useQuery({
    ...listOrgSlackChannelsOptions({ path: { orgId } }),
    enabled: data.connected && isAdmin,
  });

  // Single commit of the whole draft. The PATCH returns the fresh config, which we
  // write straight to the cache so `data` matches the draft instantly — `dirty`
  // resolves to false with no flicker and no extra refetch.
  const save = useMutation({
    ...updateOrgSlackIntegrationMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('Slack settings saved', {
        description: draft.channelName
          ? `Posting ${triggerSummary(draft.triggerMode)} to #${draft.channelName}.`
          : `Posting ${triggerSummary(draft.triggerMode)}.`,
      });
    },
    onError: (err) =>
      notify.error("Couldn't save Slack settings", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const handleSave = () =>
    save.mutate({
      path: { orgId },
      body: {
        triggerMode: draft.triggerMode,
        detailLevel: draft.detailLevel,
        layout: draft.layout,
        ...(draft.channelId
          ? {
              defaultChannelId: draft.channelId,
              defaultChannelName: draft.channelName ?? draft.channelId,
            }
          : {}),
      },
    });

  const reconnect = useMutation({
    ...installOrgSlackMutation(),
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) =>
      notify.error("Couldn't start Slack reconnect", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const disconnect = useMutation({
    ...disconnectOrgSlackMutation(),
    onSuccess: async () => {
      setDisconnectOpen(false);
      await invalidate();
      notify.success('Slack disconnected', {
        description: `${data.teamName ?? 'The workspace'} was disconnected. Runs will no longer post to Slack.`,
      });
    },
    onError: (err) => {
      setDisconnectOpen(false);
      notify.error("Couldn't disconnect Slack", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  const test = useMutation({
    ...testOrgSlackMutation(),
    onSuccess: () =>
      notify.success('Test message sent', {
        description: `Check ${draft.channelName ?? 'your channel'} in Slack — a sample message should be waiting.`,
      }),
    onError: (err) =>
      notify.error("Couldn't send test message", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex direction="col" gap={6}>
      {/* Header — title + Save */}
      <Flex align="center" justify="between" gap={4} className="flex-wrap">
        <Flex direction="col" gap={1}>
          <Text variant="h1">Slack</Text>
          <Text color="muted">Auto-post run results to your Slack workspace.</Text>
        </Flex>
        {data.connected && isAdmin && (
          <Button onClick={handleSave} loading={save.isPending} disabled={!dirty || save.isPending}>
            Save changes
          </Button>
        )}
      </Flex>

      {!data.connected ? (
        <SettingsPanel title="Slack">
          <SettingsRow
            label="Not connected"
            hint="Connect a Slack workspace to start posting run results."
          >
            <Flex>
              <Button asChild variant="outline">
                <Link to="/orgs/$orgId/integrations" params={{ orgId }}>
                  Back to integrations
                </Link>
              </Button>
            </Flex>
          </SettingsRow>
        </SettingsPanel>
      ) : (
        <>
          {!isAdmin && (
            <Text color="muted" className="text-sm">
              You can view these settings, but only admins can change them.
            </Text>
          )}
          {data.status === 'error' && (
            <Flex
              direction="col"
              gap={2}
              className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-4"
            >
              <Text color="danger" className="text-sm font-semibold">
                Slack is having trouble
              </Text>
              <Text className="text-sm text-muted-foreground">
                The last message didn&rsquo;t send{data.lastError ? `: ${data.lastError}` : '.'}{' '}
                Reconnect to fix it.
              </Text>
              {isAdmin && (
                <Flex>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={reconnect.isPending}
                    onClick={() => reconnect.mutate({ path: { orgId } })}
                  >
                    Reconnect
                  </Button>
                </Flex>
              )}
            </Flex>
          )}

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            {/* Configuration — left, 1/2 */}
            <Flex direction="col" gap={6}>
              {/* Workspace */}
              <SettingsPanel title="Slack workspace">
                <SettingsRow
                  label="Connected workspace"
                  hint="Nijam posts as an app in this workspace."
                >
                  <Flex align="center" justify="between" gap={3} className="w-full flex-wrap">
                    <Flex align="center" gap={2.5}>
                      <SlackLogo size={22} />
                      <Flex direction="col">
                        <Text as="span" className="text-sm font-semibold">
                          {data.teamName}
                        </Text>
                        <Badge variant="secondary" className="gap-1">
                          <span className="size-1.5 rounded-full bg-success" />
                          Connected
                        </Badge>
                      </Flex>
                    </Flex>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDisconnectOpen(true)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </Flex>
                </SettingsRow>
              </SettingsPanel>

              {/* When to post */}
              <SettingsPanel title="When to post">
                <div className="px-5 py-5">
                  <RadioGroup
                    value={draft.triggerMode}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, triggerMode: v as TriggerMode }))
                    }
                    disabled={!isAdmin}
                    className="gap-2"
                  >
                    {TRIGGERS.map((t) => (
                      <Flex
                        as="label"
                        key={t.key}
                        align="start"
                        gap={3}
                        className={cn(
                          'rounded-xl border border-border px-4 py-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5',
                          isAdmin && 'cursor-pointer',
                        )}
                      >
                        <RadioGroupItem value={t.key} className="mt-0.5" />
                        <Flex direction="col" gap={0.5}>
                          <Text as="span" className="text-sm font-semibold">
                            {t.label}
                          </Text>
                          <Text as="span" className="text-xs text-muted-foreground">
                            {t.desc}
                          </Text>
                        </Flex>
                      </Flex>
                    ))}
                  </RadioGroup>
                </div>
              </SettingsPanel>

              {/* Styling */}
              <SettingsPanel title="Styling">
                <SettingsRow
                  label="Layout"
                  hint="Block Kit is Slack's modern layout; Classic adds a colored status bar."
                >
                  <Segmented
                    value={draft.layout}
                    onChange={(v) => setDraft((d) => ({ ...d, layout: v }))}
                    disabled={!isAdmin}
                    options={[
                      { value: 'blockkit', label: 'Block Kit' },
                      { value: 'classic', label: 'Classic' },
                    ]}
                  />
                </SettingsRow>
                <SettingsRow
                  label="Detail level"
                  hint="Compact shows status and counts; full also lists each failed and flaky test."
                >
                  <Segmented
                    value={draft.detailLevel}
                    onChange={(v) => setDraft((d) => ({ ...d, detailLevel: v }))}
                    disabled={!isAdmin}
                    options={[
                      { value: 'compact', label: 'Compact' },
                      { value: 'full', label: 'Full' },
                    ]}
                  />
                </SettingsRow>
              </SettingsPanel>

              {/* Channel */}
              <SettingsPanel title="Channel">
                <SettingsRow
                  label="Default channel"
                  hint="Where runs post unless a project overrides it in its own settings."
                >
                  {isAdmin ? (
                    <Select
                      value={draft.channelId ?? undefined}
                      onValueChange={(id) => {
                        const ch = channels.data?.channels.find((c) => c.id === id);
                        setDraft((d) => ({ ...d, channelId: id, channelName: ch?.name ?? id }));
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show the current channel immediately, before the list loads. */}
                        {draft.channelId &&
                          !channels.data?.channels.some((c) => c.id === draft.channelId) && (
                            <SelectItem value={draft.channelId}>
                              #{draft.channelName ?? draft.channelId}
                            </SelectItem>
                          )}
                        {channels.data?.channels.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            #{c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Text className="text-sm">
                      {data.defaultChannel ? `#${data.defaultChannel.name}` : 'Not set'}
                    </Text>
                  )}
                  {isAdmin && (
                    <Flex className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        loading={test.isPending}
                        disabled={!draft.channelId}
                        onClick={() =>
                          test.mutate({
                            path: { orgId },
                            body: { channelId: draft.channelId ?? undefined },
                          })
                        }
                      >
                        Send test message
                      </Button>
                    </Flex>
                  )}
                </SettingsRow>
                <Flex align="start" gap={2} className="bg-muted/30 px-5 py-3.5">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={16}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <Text as="span" className="text-xs text-muted-foreground">
                    Want a project to report somewhere else? Set a per-project channel — or mute
                    Slack — in that project&rsquo;s{' '}
                    <span className="font-medium text-foreground">
                      Settings &rarr; Slack notifications
                    </span>
                    .
                  </Text>
                </Flex>
              </SettingsPanel>
            </Flex>

            {/* Preview — right, 1/2, sticky on desktop */}
            <div>
              <div className="xl:sticky xl:top-6">
                {/* Live preview reflects the unsaved draft */}
                <SettingsPanel title="Preview">
                  <Flex direction="col" gap={4} className="px-5 py-5">
                    <Flex align="center" justify="between" gap={3} className="flex-wrap">
                      <Text as="span" className="text-xs font-medium text-muted-foreground">
                        Sample run
                      </Text>
                      <Segmented
                        value={previewState}
                        onChange={setPreviewState}
                        options={[
                          { value: 'pass', label: 'Passing' },
                          { value: 'flaky', label: 'Flaky' },
                          { value: 'fail', label: 'Failing' },
                        ]}
                      />
                    </Flex>
                    <SlackPreview
                      layout={draft.layout}
                      state={previewState}
                      detail={draft.detailLevel}
                    />
                  </Flex>
                </SettingsPanel>
              </div>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Slack?</AlertDialogTitle>
            <AlertDialogDescription>
              {data.teamName ?? 'This workspace'} will be disconnected and Nijam will stop posting
              run results to Slack. Your channel and notification settings are kept for when you
              reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                disconnect.mutate({ path: { orgId } });
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
