import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GitLabStatusResponse } from '@/client';
import {
  getOrgGitlabIntegrationOptions,
  getOrgGitlabIntegrationQueryKey,
  installOrgGitlabMutation,
  updateOrgGitlabIntegrationMutation,
  disconnectOrgGitlabMutation,
  listOrgGitlabProjectsOptions,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { GitLabLogo } from './GitLabLogo';
import { IntegrationHeader } from './IntegrationHeader';
import { openExternal } from '@/lib/navigation';

const errMsg = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
  isApiError(err) ? err.error.message : fallback;

export function GitLabDetail({ orgId }: { orgId: string }) {
  const status = useQuery(getOrgGitlabIntegrationOptions({ path: { orgId } }));
  if (status.isLoading) return <LoadingState />;
  if (status.error || !status.data) {
    return <ErrorState error={status.error} onRetry={() => status.refetch()} />;
  }
  // Remount on (re)connect so the draft re-seeds from the fresh server config.
  return (
    <GitLabDetailInner
      key={`${status.data.connected}:${status.data.connectedAt ?? ''}`}
      orgId={orgId}
      data={status.data}
    />
  );
}

function GitLabDetailInner({ orgId, data }: { orgId: string; data: GitLabStatusResponse }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const queryClient = useQueryClient();
  const queryKey = getOrgGitlabIntegrationQueryKey({ path: { orgId } });
  const { editing, startEditing, stopEditing } = useEditMode();
  const [draft, setDraft] = useState({
    postStatuses: data.postStatuses,
    postComments: data.postComments,
  });
  const resetDraft = () =>
    setDraft({ postStatuses: data.postStatuses, postComments: data.postComments });
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const dirty =
    draft.postStatuses !== data.postStatuses || draft.postComments !== data.postComments;

  const projects = useQuery({
    ...listOrgGitlabProjectsOptions({ path: { orgId } }),
    enabled: data.connected && isAdmin,
  });

  const save = useMutation({
    ...updateOrgGitlabIntegrationMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('GitLab settings saved');
      stopEditing();
    },
    onError: (err) => notify.error("Couldn't save GitLab settings", { description: errMsg(err) }),
  });

  const install = useMutation({
    ...installOrgGitlabMutation(),
    onSuccess: (res) => {
      openExternal(res.url); // full redirect to GitLab's consent page
    },
    onError: (err) =>
      notify.error("Couldn't start the GitLab connect", { description: errMsg(err) }),
  });

  const disconnect = useMutation({
    ...disconnectOrgGitlabMutation(),
    onSuccess: () => {
      setDisconnectOpen(false);
      void queryClient.invalidateQueries({ queryKey });
      notify.success('GitLab disconnected', {
        description: 'Revoke Nijam in your GitLab applications to fully withdraw access.',
      });
    },
    onError: (err) => notify.error("Couldn't disconnect GitLab", { description: errMsg(err) }),
  });

  const header = (
    <IntegrationHeader
      logo={<GitLabLogo size={24} />}
      title="GitLab"
      description="Post a commit status and a results note when tests run on a merge request."
    />
  );

  if (!data.connected) {
    return (
      <Flex direction="col" gap={6}>
        {header}
        <SettingsPanel title="GitLab">
          <SettingsRow
            label="Not connected"
            hint={
              data.configured
                ? 'Sign in with GitLab to let Nijam post on the merge requests your pipelines run for.'
                : "GitLab isn't available yet."
            }
          >
            {isAdmin ? (
              <Flex>
                <Button
                  loading={install.isPending}
                  disabled={!data.configured}
                  onClick={() => install.mutate({ path: { orgId } })}
                >
                  <GitLabLogo size={16} />
                  Connect GitLab
                </Button>
              </Flex>
            ) : (
              <Text className="text-sm text-muted-foreground">
                Ask an organization admin to connect GitLab.
              </Text>
            )}
          </SettingsRow>
          {/* GitLab has no narrow write scope, so the grant is broader than the
              GitHub App's. Say it here rather than only in the docs. */}
          <SettingsRow
            label="What you'll grant"
            hint="GitLab has no scope for statuses and notes alone, so it asks for api access, which covers everything your GitLab account can reach. Nijam only ever writes commit statuses and merge-request notes. Connecting as a service account keeps that grant narrow."
          >
            <Badge variant="outline" className="font-mono">
              scope: api
            </Badge>
          </SettingsRow>
        </SettingsPanel>
      </Flex>
    );
  }

  return (
    <Flex direction="col" gap={6}>
      {header}

      {data.status === 'error' && (
        <Flex
          direction="col"
          gap={2}
          className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-4"
        >
          <Text color="danger" className="text-sm font-semibold">
            GitLab is having trouble
          </Text>
          <Text className="text-sm text-muted-foreground">
            The last GitLab call failed{data.lastError ? `: ${data.lastError}` : '.'} Reconnect, or
            check that {data.gitlabUsername ? `@${data.gitlabUsername}` : 'the connected user'} can
            still reach the project.
          </Text>
          {isAdmin && (
            <Flex>
              <Button
                size="sm"
                variant="outline"
                loading={install.isPending}
                onClick={() => install.mutate({ path: { orgId } })}
              >
                Reconnect
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      <SettingsPanel title="GitLab">
        <SettingsRow
          label="Connected as"
          hint="Nijam posts as this GitLab user, so it needs access to the projects your pipelines run for."
        >
          <Flex align="center" justify="between" gap={3} className="w-full flex-wrap">
            <Flex align="center" gap={2.5}>
              <GitLabLogo size={22} />
              <Flex direction="col">
                <Text as="span" className="text-sm font-semibold">
                  @{data.gitlabUsername}
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

      <SettingsPanel
        title="What to post"
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
              onSave={() => save.mutate({ path: { orgId }, body: draft })}
            />
          ) : undefined
        }
      >
        <LockedFields locked={!editing}>
          <SettingsRow
            label="Commit status"
            hint="Show a running status while tests run, then success (pass/flaky) or failed."
          >
            <Flex align="center" gap={2}>
              <Switch
                checked={draft.postStatuses}
                disabled={!isAdmin}
                onCheckedChange={(postStatuses) => setDraft((d) => ({ ...d, postStatuses }))}
              />
              <Text as="span" className="text-sm text-muted-foreground">
                {draft.postStatuses ? 'On' : 'Off'}
              </Text>
            </Flex>
          </SettingsRow>
          <SettingsRow
            label="Merge request note"
            hint="Post a results summary as a note on the merge request, updated in place each run."
          >
            <Flex align="center" gap={2}>
              <Switch
                checked={draft.postComments}
                disabled={!isAdmin}
                onCheckedChange={(postComments) => setDraft((d) => ({ ...d, postComments }))}
              />
              <Text as="span" className="text-sm text-muted-foreground">
                {draft.postComments ? 'On' : 'Off'}
              </Text>
            </Flex>
          </SettingsRow>
        </LockedFields>
      </SettingsPanel>

      {isAdmin && (
        <SettingsPanel title="Projects">
          <div className="px-5 py-4">
            {projects.isLoading && (
              <Text className="text-sm text-muted-foreground">Loading projects…</Text>
            )}
            {projects.error && (
              <Text className="text-sm text-muted-foreground">
                {errMsg(projects.error, "Couldn't load projects from GitLab.")}
              </Text>
            )}
            {projects.data && projects.data.projects.length === 0 && (
              <Text className="text-sm text-muted-foreground">
                No projects yet, this GitLab user isn&rsquo;t a member of any.
              </Text>
            )}
            {projects.data && projects.data.projects.length > 0 && (
              <Flex wrap gap={2}>
                {projects.data.projects.map((p) => (
                  <Badge key={p} variant="outline" className="font-mono">
                    {p}
                  </Badge>
                ))}
              </Flex>
            )}
          </div>
        </SettingsPanel>
      )}

      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect GitLab?</AlertDialogTitle>
            <AlertDialogDescription>
              Nijam will delete its copy of your GitLab tokens and stop posting statuses and notes
              for this organization. The authorization stays listed under your GitLab applications
              until you revoke it there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              loading={disconnect.isPending}
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
