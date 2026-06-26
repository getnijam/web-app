import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectGitHubResponse } from '@/client';
import {
  getProjectRunFiltersOptions,
  getProjectGithubSettingsOptions,
  getProjectGithubSettingsQueryKey,
  updateProjectGithubSettingsMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const DEFAULT_BRANCH = 'main';
const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

export function ProjectGitHubSettings({
  orgId,
  projectId,
  projectName,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
}) {
  const settings = useQuery(getProjectGithubSettingsOptions({ path: { projectId } }));
  const data = settings.data;
  if (!data) return null; // quietly absent until the query resolves
  return (
    <ProjectGitHubInner
      key={String(data.githubConnected)}
      orgId={orgId}
      projectId={projectId}
      projectName={projectName}
      data={data}
    />
  );
}

function describe(projectName: string, s: ProjectGitHubResponse): string {
  if (!s.enabled) return `${projectName} won't post to GitHub.`;
  const branches = s.branches.length === 0 ? 'every branch' : s.branches.join(', ');
  return `${projectName} posts PR checks & comments for ${branches}.`;
}

function ProjectGitHubInner({
  orgId,
  projectId,
  projectName,
  data,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
  data: ProjectGitHubResponse;
}) {
  const isAdmin = useIsOrgAdmin(orgId);
  const queryClient = useQueryClient();
  const queryKey = getProjectGithubSettingsQueryKey({ path: { projectId } });

  const filters = useQuery({
    ...getProjectRunFiltersOptions({ path: { projectId } }),
    enabled: isAdmin && data.githubConnected,
  });
  const historicBranches = filters.data?.branches ?? [];
  const branchSuggestions = historicBranches.includes(DEFAULT_BRANCH)
    ? historicBranches
    : [DEFAULT_BRANCH, ...historicBranches];

  const [draft, setDraft] = useState<{ enabled: boolean; branches: string[] }>(() => ({
    enabled: data.enabled,
    branches: data.branches,
  }));
  const dirty = draft.enabled !== data.enabled || !sameSet(draft.branches, data.branches);

  const save = useMutation({
    ...updateProjectGithubSettingsMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('GitHub settings saved', { description: describe(projectName, updated) });
    },
    onError: (err) =>
      notify.error("Couldn't save GitHub settings", {
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

  if (!data.githubConnected) {
    return (
      <SettingsPanel title="GitHub checks & comments">
        <SettingsRow
          label="Not connected"
          hint="Install the GitHub App for this organization to post PR checks and comments."
        >
          {isAdmin ? (
            <Flex>
              <Button asChild variant="outline" size="sm">
                <Link to="/orgs/$orgId/integrations/github" params={{ orgId }}>
                  Set up GitHub
                </Link>
              </Button>
            </Flex>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Ask an admin to install the GitHub App for this organization.
            </Text>
          )}
        </SettingsRow>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="GitHub checks & comments"
      footer={
        isAdmin ? (
          <Button onClick={handleSave} loading={save.isPending} disabled={!dirty || save.isPending}>
            Save changes
          </Button>
        ) : undefined
      }
    >
      <SettingsRow
        label="Post to GitHub"
        hint={
          draft.enabled
            ? "This project's PR runs post a check and comment."
            : 'Muted, this project never posts to GitHub.'
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
    </SettingsPanel>
  );
}
