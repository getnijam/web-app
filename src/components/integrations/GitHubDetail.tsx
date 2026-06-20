import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GitHubStatusResponse } from '@/client';
import {
  getOrgGithubIntegrationOptions,
  getOrgGithubIntegrationQueryKey,
  installOrgGithubMutation,
  updateOrgGithubIntegrationMutation,
  disconnectOrgGithubMutation,
  listOrgGithubReposOptions,
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
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { GitHubLogo } from './GitHubLogo';

const errMsg = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
  isApiError(err) ? err.error.message : fallback;

export function GitHubDetail({ orgId }: { orgId: string }) {
  const status = useQuery(getOrgGithubIntegrationOptions({ path: { orgId } }));
  if (status.isLoading) return <LoadingState />;
  if (status.error || !status.data) {
    return <ErrorState error={status.error} onRetry={() => status.refetch()} />;
  }
  // Remount on (re)connect so the draft re-seeds from the fresh server config.
  return (
    <GitHubDetailInner
      key={`${status.data.connected}:${status.data.connectedAt ?? ''}`}
      orgId={orgId}
      data={status.data}
    />
  );
}

function GitHubDetailInner({ orgId, data }: { orgId: string; data: GitHubStatusResponse }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const queryClient = useQueryClient();
  const queryKey = getOrgGithubIntegrationQueryKey({ path: { orgId } });
  const [draft, setDraft] = useState({
    postChecks: data.postChecks,
    postComments: data.postComments,
  });
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const dirty = draft.postChecks !== data.postChecks || draft.postComments !== data.postComments;

  const repos = useQuery({
    ...listOrgGithubReposOptions({ path: { orgId } }),
    enabled: data.connected && isAdmin,
  });

  const save = useMutation({
    ...updateOrgGithubIntegrationMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      notify.success('GitHub settings saved');
    },
    onError: (err) => notify.error("Couldn't save GitHub settings", { description: errMsg(err) }),
  });

  const install = useMutation({
    ...installOrgGithubMutation(),
    onSuccess: (res) => {
      window.location.href = res.url; // full redirect to GitHub's install page
    },
    onError: (err) => notify.error("Couldn't start GitHub install", { description: errMsg(err) }),
  });

  const disconnect = useMutation({
    ...disconnectOrgGithubMutation(),
    onSuccess: () => {
      setDisconnectOpen(false);
      void queryClient.invalidateQueries({ queryKey });
      notify.success('GitHub disconnected', {
        description: 'Remove the app in your GitHub settings to fully revoke access.',
      });
    },
    onError: (err) => notify.error("Couldn't disconnect GitHub", { description: errMsg(err) }),
  });

  const header = (
    <Flex align="center" justify="between" gap={4} className="flex-wrap">
      <Flex direction="col" gap={1}>
        <Text variant="h1">GitHub</Text>
        <Text color="muted">
          Post a PR check and a results comment when tests run on a pull request.
        </Text>
      </Flex>
      {data.connected && isAdmin && (
        <Button
          onClick={() => save.mutate({ path: { orgId }, body: draft })}
          loading={save.isPending}
          disabled={!dirty || save.isPending}
        >
          Save changes
        </Button>
      )}
    </Flex>
  );

  if (!data.connected) {
    return (
      <Flex direction="col" gap={6}>
        {header}
        <SettingsPanel title="GitHub App">
          <SettingsRow
            label="Not connected"
            hint={
              data.configured
                ? 'Install the Nijam GitHub App on the repositories you want checks and PR comments for.'
                : "GitHub isn't available on this server yet."
            }
          >
            {isAdmin ? (
              <Flex>
                <Button
                  loading={install.isPending}
                  disabled={!data.configured}
                  onClick={() => install.mutate({ path: { orgId } })}
                >
                  <GitHubLogo size={16} />
                  Install GitHub App
                </Button>
              </Flex>
            ) : (
              <Text className="text-sm text-muted-foreground">
                Ask an organization admin to install the GitHub App.
              </Text>
            )}
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
            GitHub is having trouble
          </Text>
          <Text className="text-sm text-muted-foreground">
            The last GitHub call failed{data.lastError ? `: ${data.lastError}` : '.'} Reinstall or
            check the app&rsquo;s repository access.
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

      <SettingsPanel title="GitHub App">
        <SettingsRow
          label="Installed on"
          hint="Nijam acts as this GitHub App on your repositories."
        >
          <Flex align="center" justify="between" gap={3} className="w-full flex-wrap">
            <Flex align="center" gap={2.5}>
              <GitHubLogo size={22} />
              <Flex direction="col">
                <Text as="span" className="text-sm font-semibold">
                  {data.accountLogin}
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

      <SettingsPanel title="What to post">
        <SettingsRow
          label="PR status check"
          hint="Show an in-progress check while tests run, then green (pass/flaky) or red (fail)."
        >
          <Flex align="center" gap={2}>
            <Switch
              checked={draft.postChecks}
              disabled={!isAdmin}
              onCheckedChange={(postChecks) => setDraft((d) => ({ ...d, postChecks }))}
            />
            <Text as="span" className="text-sm text-muted-foreground">
              {draft.postChecks ? 'On' : 'Off'}
            </Text>
          </Flex>
        </SettingsRow>
        <SettingsRow
          label="PR comment"
          hint="Post a results summary as a comment on the PR, updated in place each run."
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
      </SettingsPanel>

      {isAdmin && (
        <SettingsPanel title="Repositories">
          <div className="px-5 py-4">
            {repos.isLoading && (
              <Text className="text-sm text-muted-foreground">Loading repositories…</Text>
            )}
            {repos.data && repos.data.repositories.length === 0 && (
              <Text className="text-sm text-muted-foreground">
                No repositories yet — grant the app access to repos in your GitHub settings.
              </Text>
            )}
            {repos.data && repos.data.repositories.length > 0 && (
              <Flex wrap gap={2}>
                {repos.data.repositories.map((r) => (
                  <Badge key={r} variant="outline" className="font-mono">
                    {r}
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
            <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
            <AlertDialogDescription>
              Nijam will stop posting PR checks and comments for this organization. The GitHub App
              stays installed until you remove it in your GitHub settings.
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
