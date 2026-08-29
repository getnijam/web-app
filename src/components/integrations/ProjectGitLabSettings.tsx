import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ORG_INTEGRATIONS_GITLAB_ROUTE } from '@/lib/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectGitLabResponse } from '@/client';
import {
  getProjectRunFiltersOptions,
  getProjectGitlabSettingsOptions,
  getProjectGitlabSettingsQueryKey,
  updateProjectGitlabSettingsMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TagCombobox } from '@/components/ui/combobox';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const DEFAULT_BRANCH = 'main';
const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

export function ProjectGitLabSettings({
  orgId,
  projectId,
  projectName,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
}) {
  const settings = useQuery(getProjectGitlabSettingsOptions({ path: { projectId } }));
  const data = settings.data;
  if (!data) return null; // quietly absent until the query resolves
  return (
    <ProjectGitLabInner
      key={String(data.gitlabConnected)}
      orgId={orgId}
      projectId={projectId}
      projectName={projectName}
      data={data}
    />
  );
}

function describe(projectName: string, s: ProjectGitLabResponse): string {
  if (!s.enabled) return `${projectName} won't post to GitLab.`;
  const branches = s.branches.length === 0 ? 'every branch' : s.branches.join(', ');
  return `${projectName} posts commit statuses & MR notes for ${branches}.`;
}

function ProjectGitLabInner({
  orgId,
  projectId,
  projectName,
  data,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
  data: ProjectGitLabResponse;
}) {
  const isAdmin = useIsOrgAdmin(orgId);
  const queryClient = useQueryClient();
  const queryKey = getProjectGitlabSettingsQueryKey({ path: { projectId } });

  const filters = useQuery({
    ...getProjectRunFiltersOptions({ path: { projectId } }),
    enabled: isAdmin && data.gitlabConnected,
  });
  const historicBranches = filters.data?.branches ?? [];
  const branchSuggestions = historicBranches.includes(DEFAULT_BRANCH)
    ? historicBranches
    : [DEFAULT_BRANCH, ...historicBranches];

  const { editing, startEditing, stopEditing } = useEditMode();
  const [draft, setDraft] = useState<{ enabled: boolean; branches: string[] }>(() => ({
    enabled: data.enabled,
    branches: data.branches,
  }));
  const resetDraft = () => setDraft({ enabled: data.enabled, branches: data.branches });
  const dirty = draft.enabled !== data.enabled || !sameSet(draft.branches, data.branches);

  const save = useMutation({
    ...updateProjectGitlabSettingsMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('GitLab settings saved', { description: describe(projectName, updated) });
      stopEditing();
    },
    onError: (err) =>
      notify.error("Couldn't save GitLab settings", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const handleSave = () =>
    save.mutate({
      path: { projectId },
      body: { enabled: draft.enabled, branches: draft.branches },
    });

  if (!data.gitlabConnected) {
    return (
      <SettingsPanel title="GitLab statuses & notes">
        <SettingsRow
          label="Not connected"
          hint="Connect GitLab for this organization to post commit statuses and merge-request notes."
        >
          {isAdmin ? (
            <Flex>
              <Button asChild variant="outline" size="sm">
                <Link to={ORG_INTEGRATIONS_GITLAB_ROUTE} params={{ orgId }}>
                  Set up GitLab
                </Link>
              </Button>
            </Flex>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Ask an admin to connect GitLab for this organization.
            </Text>
          )}
        </SettingsRow>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="GitLab statuses & notes"
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
          label="Post to GitLab"
          hint={
            draft.enabled
              ? "This project's MR runs post a commit status and a note."
              : 'Muted, this project never posts to GitLab.'
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
          label="Branches"
          hint="Only post runs from these branches. Leave empty to post on every branch."
        >
          {isAdmin ? (
            <TagCombobox
              value={draft.branches}
              onChange={(branches) => setDraft((d) => ({ ...d, branches }))}
              options={branchSuggestions}
              placeholder="All branches, type to filter"
              disabled={!draft.enabled}
              ariaLabel="Branch allow-list"
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
