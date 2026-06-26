import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import type { DeletabilityResponse, UserPublic } from '@/client';
import {
  getMeQueryKey,
  getMyDeletabilityOptions,
  getMyDeletabilityQueryKey,
  listOrgMembersOptions,
  listOrgMembersQueryKey,
  updateOrgMemberRoleMutation,
  deleteMeMutation,
} from '@/client/@tanstack/react-query.gen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "Danger zone": permanently delete the account, surfacing the org impact first. */
export function DeleteAccountSection({ user }: { user: UserPublic }) {
  const { data, isLoading, error, refetch } = useQuery(getMyDeletabilityOptions());

  return (
    <SettingsPanel title="Delete account" danger>
      <Flex direction="col" gap={5} className="px-5 py-5">
        <Text className="text-sm text-muted-foreground">
          Permanently delete your account and personal data. This cannot be undone.
        </Text>

        {isLoading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={() => refetch()} />}
        {data && <DeleteImpact user={user} data={data} />}
      </Flex>
    </SettingsPanel>
  );
}

function DeleteImpact({ user, data }: { user: UserPublic; data: DeletabilityResponse }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Flex direction="col" gap={5}>
      {data.orgsToDelete.length > 0 && (
        <Flex direction="col" gap={2}>
          <Text as="span" className="text-sm font-semibold">
            These organizations will be permanently deleted with your account:
          </Text>
          <Flex
            direction="col"
            gap={1.5}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            {data.orgsToDelete.map((org) => (
              <Flex key={org.id} align="center" justify="between" gap={3}>
                <Text as="span" truncate className="text-sm font-medium">
                  {org.name}
                </Text>
                <Text as="span" className="shrink-0 text-xs text-muted-foreground">
                  {plural(org.projectCount, 'project')}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Text variant="caption" color="muted">
            All of their projects, runs, and data will be removed.
          </Text>
        </Flex>
      )}

      {data.blockingOrgs.length > 0 && (
        <Flex direction="col" gap={2}>
          <Flex align="center" gap={2}>
            <HugeiconsIcon icon={Alert02Icon} size={18} className="text-destructive" />
            <Text as="span" className="text-sm font-semibold">
              Resolve these organizations first
            </Text>
          </Flex>
          <Text variant="caption" color="muted">
            You're the only admin of these organizations, and they have other members. Make someone
            else an admin (or delete the organization) before deleting your account.
          </Text>
          <Flex direction="col" gap={2}>
            {data.blockingOrgs.map((org) => (
              <BlockingOrgRow key={org.id} org={org} selfUserId={user.id} />
            ))}
          </Flex>
        </Flex>
      )}

      <Flex justify="end">
        <Button
          variant="destructive"
          disabled={!data.canDelete}
          onClick={() => setConfirmOpen(true)}
        >
          Delete my account
        </Button>
      </Flex>

      <DeleteAccountDialog user={user} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </Flex>
  );
}

/** One blocking org with an inline "make another member an admin" control. */
function BlockingOrgRow({
  org,
  selfUserId,
}: {
  org: DeletabilityResponse['blockingOrgs'][number];
  selfUserId: string;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>('');
  const membersQuery = useQuery(listOrgMembersOptions({ path: { orgId: org.id } }));
  const candidates = (membersQuery.data?.members ?? []).filter((m) => m.userId !== selfUserId);

  const promote = useMutation({
    ...updateOrgMemberRoleMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getMyDeletabilityQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: listOrgMembersQueryKey({ path: { orgId: org.id } }),
        }),
      ]);
      notify.success('Admin updated', { description: `${org.name} now has another admin.` });
    },
    onError: (err) =>
      notify.error("Couldn't update admin", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex direction="col" gap={3} className="rounded-xl border border-border bg-card p-4">
      <Flex align="center" justify="between" gap={3}>
        <Text as="span" truncate className="text-sm font-medium">
          {org.name}
        </Text>
        <Text as="span" className="shrink-0 text-xs text-muted-foreground">
          {plural(org.memberCount, 'member')} · {plural(org.projectCount, 'project')}
        </Text>
      </Flex>
      <Flex gap={2} align="center" className="w-full">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="min-w-0 flex-1">
            <SelectValue placeholder="Choose a new admin…" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.name ?? m.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          disabled={!selected}
          loading={promote.isPending}
          onClick={() =>
            promote.mutate({ path: { orgId: org.id, userId: selected }, body: { role: 'admin' } })
          }
        >
          Make admin
        </Button>
      </Flex>
      {candidates.length === 0 && !membersQuery.isLoading && (
        <Text variant="caption" color="muted">
          No other members to promote, delete this organization instead.
        </Text>
      )}
    </Flex>
  );
}

/** Type-your-email confirmation + password re-auth, then delete. */
function DeleteAccountDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');

  const del = useMutation({
    ...deleteMeMutation(),
    onSuccess: async () => {
      // The session is gone server-side; clear cached data and bounce to login.
      await queryClient.resetQueries({ queryKey: getMeQueryKey() });
      queryClient.clear();
      notify.success('Account deleted', {
        description: 'Your account has been permanently removed.',
      });
      navigate({ to: '/login' });
    },
  });

  const reset = () => {
    setConfirmText('');
    setPassword('');
    del.reset();
  };

  const matches = confirmText.trim().toLowerCase() === user.email.toLowerCase();
  const canSubmit = matches && (!user.hasPassword || password.length > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Flex direction="col" gap={4}>
          <Flex direction="col" gap={1.5}>
            <Text as="label" htmlFor="delete-confirm" className="text-sm text-muted-foreground">
              Type{' '}
              <Text as="span" weight="semibold" color="default" className="font-mono">
                {user.email}
              </Text>{' '}
              to confirm.
            </Text>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </Flex>

          {user.hasPassword && (
            <Flex direction="col" gap={1.5}>
              <Label htmlFor="delete-password">Current password</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Flex>
          )}

          <FieldError message={isApiError(del.error) ? del.error.error.message : undefined} />
        </Flex>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            disabled={!canSubmit}
            loading={del.isPending}
            onClick={() =>
              del.mutate({ body: { password: user.hasPassword ? password : undefined } })
            }
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
