import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectSlackResponse } from '@/client';
import {
  getProjectRunFiltersOptions,
  getProjectSlackSettingsOptions,
  getProjectSlackSettingsQueryKey,
  listOrgSlackChannelsOptions,
  updateProjectSlackSettingsMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const INHERIT = '__default__';

// Always offered as a suggestion even before any run lands on it; other suggestions
// come from the project's historic branches. Any branch can still be typed (creatable).
const DEFAULT_BRANCH = 'main';

export function ProjectSlackSettings({
  orgId,
  projectId,
  projectName,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
}) {
  const settings = useQuery(getProjectSlackSettingsOptions({ path: { projectId } }));
  const data = settings.data;
  if (!data) return null; // quietly absent until the query resolves (or on error)
  return (
    <ProjectSlackInner
      key={String(data.slackConnected)}
      orgId={orgId}
      projectId={projectId}
      projectName={projectName}
      data={data}
    />
  );
}

interface Draft {
  enabled: boolean;
  channelId: string | null;
  channelName: string | null;
  branches: string[];
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/** One-line summary of the saved routing, covering channel + branch filter. */
function describeSettings(projectName: string, s: ProjectSlackResponse): string {
  if (!s.enabled) return `${projectName} won't post to Slack.`;
  const channel = s.channel
    ? `posts to #${s.channel.name}`
    : 'uses the organization default channel';
  const branches = s.branches.length === 0 ? 'every branch' : s.branches.join(', ');
  return `${projectName} ${channel} for ${branches}.`;
}

function ProjectSlackInner({
  orgId,
  projectId,
  projectName,
  data,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
  data: ProjectSlackResponse;
}) {
  const isAdmin = useIsOrgAdmin(orgId);
  const queryClient = useQueryClient();
  const queryKey = getProjectSlackSettingsQueryKey({ path: { projectId } });

  const channels = useQuery({
    ...listOrgSlackChannelsOptions({ path: { orgId } }),
    enabled: isAdmin && data.slackConnected,
  });
  // Branch suggestions: the project's historic branches, with `main` always present.
  const filters = useQuery({
    ...getProjectRunFiltersOptions({ path: { projectId } }),
    enabled: isAdmin && data.slackConnected,
  });
  const historicBranches = filters.data?.branches ?? [];
  const branchSuggestions = historicBranches.includes(DEFAULT_BRANCH)
    ? historicBranches
    : [DEFAULT_BRANCH, ...historicBranches];

  const { editing, startEditing, stopEditing } = useEditMode();

  // Edits stay local until Save commits them (matches the org Slack page).
  const [draft, setDraft] = useState<Draft>(() => ({
    enabled: data.enabled,
    channelId: data.channel?.id ?? null,
    channelName: data.channel?.name ?? null,
    branches: data.branches,
  }));

  const resetDraft = () =>
    setDraft({
      enabled: data.enabled,
      channelId: data.channel?.id ?? null,
      channelName: data.channel?.name ?? null,
      branches: data.branches,
    });

  const dirty =
    draft.enabled !== data.enabled ||
    (draft.channelId ?? null) !== (data.channel?.id ?? null) ||
    !sameSet(draft.branches, data.branches);

  const save = useMutation({
    ...updateProjectSlackSettingsMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('Slack settings saved', {
        description: describeSettings(projectName, updated),
      });
      stopEditing();
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
      path: { projectId },
      body: {
        enabled: draft.enabled,
        channelId: draft.channelId,
        channelName: draft.channelName,
        branches: draft.branches,
      },
    });

  if (!data.slackConnected) {
    return (
      <SettingsPanel title="Slack notifications">
        <SettingsRow
          label="Not connected"
          hint="Connect a Slack workspace for this organization to route this project's runs."
        >
          {isAdmin ? (
            <Flex>
              <Button asChild variant="outline" size="sm">
                <Link to="/orgs/$orgId/integrations" params={{ orgId }}>
                  Set up Slack
                </Link>
              </Button>
            </Flex>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Ask an admin to connect Slack for this organization.
            </Text>
          )}
        </SettingsRow>
      </SettingsPanel>
    );
  }

  const orgDefaultLabel = data.orgDefaultChannel
    ? `#${data.orgDefaultChannel.name}`
    : 'no channel set';
  const effectiveLabel = draft.channelName
    ? `#${draft.channelName}`
    : `the org default (${orgDefaultLabel})`;

  return (
    <SettingsPanel
      title="Slack notifications"
      action={
        isAdmin ? (
          <EditActions
            editing={editing}
            dirty={dirty}
            saving={save.isPending}
            onEdit={startEditing}
            onCancel={() => {
              resetDraft();
              stopEditing();
            }}
            onSave={handleSave}
          />
        ) : undefined
      }
    >
      <LockedFields locked={!editing}>
        <SettingsRow
          label="Post to Slack"
          hint={
            draft.enabled
              ? `This project's runs post to ${effectiveLabel}.`
              : 'Muted, this project never posts to Slack.'
          }
        >
          <Flex align="center" gap={2}>
            <Switch
              checked={draft.enabled}
              disabled={!isAdmin}
              onCheckedChange={(enabled) => setDraft((d) => ({ ...d, enabled }))}
            />
            <Text as="span" className="text-sm text-muted-foreground">
              {draft.enabled ? 'Enabled' : 'Muted'}
            </Text>
          </Flex>
        </SettingsRow>

        <SettingsRow
          label="Channel"
          hint="Override the organization default channel for this project, or inherit it."
        >
          {isAdmin ? (
            <Select
              value={draft.channelId ?? INHERIT}
              onValueChange={(value) => {
                if (value === INHERIT) {
                  setDraft((d) => ({ ...d, channelId: null, channelName: null }));
                } else {
                  const ch = channels.data?.channels.find((c) => c.id === value);
                  setDraft((d) => ({ ...d, channelId: value, channelName: ch?.name ?? value }));
                }
              }}
              disabled={!draft.enabled}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INHERIT}>
                  Default{data.orgDefaultChannel ? ` (#${data.orgDefaultChannel.name})` : ''}
                </SelectItem>
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
              {data.channel ? `#${data.channel.name}` : `Default (${orgDefaultLabel})`}
            </Text>
          )}
        </SettingsRow>

        <SettingsRow
          label="Branches"
          hint="Only post runs from these branches. Leave empty to post on every branch."
        >
          {isAdmin ? (
            <TagInput
              value={draft.branches}
              onChange={(branches) => setDraft((d) => ({ ...d, branches }))}
              suggestions={branchSuggestions}
              placeholder="All branches, type to filter"
              disabled={!draft.enabled}
              aria-label="Branch allow-list"
            />
          ) : (
            <Text className="text-sm">
              {data.branches.length ? data.branches.join(', ') : 'All branches'}
            </Text>
          )}
        </SettingsRow>
      </LockedFields>
    </SettingsPanel>
  );
}
