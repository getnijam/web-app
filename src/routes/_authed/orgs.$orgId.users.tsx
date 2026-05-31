import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon, Delete02Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import type { MemberSummary, InvitationSummary } from '@/client';
import {
  getMeOptions,
  listOrgMembersOptions,
  listOrgMembersQueryKey,
  listOrgInvitationsOptions,
  listOrgInvitationsQueryKey,
  createOrgInvitationMutation,
  revokeOrgInvitationMutation,
  removeOrgMemberMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { RowsSkeleton } from '@/components/states/RowsSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { FieldError } from '@/components/auth/AuthLayout';
import { UserAvatar } from '@/components/users/UserAvatar';
import { isApiError } from '@/lib/api-error';
import { timeAgo } from '@/lib/format';
import { notify } from '@/lib/notify';

export const Route = createFileRoute('/_authed/orgs/$orgId/users')({ component: UsersPage });

function UsersPage() {
  const { orgId } = Route.useParams();
  const me = useQuery({ ...getMeOptions(), retry: false });
  const members = useQuery(listOrgMembersOptions({ path: { orgId } }));
  const invites = useQuery(listOrgInvitationsOptions({ path: { orgId } }));

  const memberCount = members.data?.members.length ?? 0;
  const pendingCount = invites.data?.invitations.length ?? 0;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-3xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Users</Text>
        <Text color="muted">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
          {pendingCount > 0 &&
            ` · ${pendingCount} pending ${pendingCount === 1 ? 'invitation' : 'invitations'}`}
        </Text>
      </Flex>

      <InviteBar orgId={orgId} />

      <SettingsPanel title="Members">
        {members.isLoading ? (
          <RowsSkeleton rows={3} round />
        ) : members.error || !members.data ? (
          <div className="px-5 py-6">
            <ErrorState error={members.error} onRetry={() => members.refetch()} />
          </div>
        ) : (
          members.data.members.map((m) => (
            <MemberRow
              key={m.userId}
              orgId={orgId}
              member={m}
              isYou={m.userId === me.data?.user.id}
            />
          ))
        )}
      </SettingsPanel>

      <SettingsPanel title="Pending invitations">
        {invites.isLoading ? (
          <RowsSkeleton rows={2} />
        ) : invites.error || !invites.data ? (
          <div className="px-5 py-6">
            <ErrorState error={invites.error} onRetry={() => invites.refetch()} />
          </div>
        ) : invites.data.invitations.length === 0 ? (
          <EmptyState
            title="No pending invitations"
            description="Invite a teammate by email and they'll show up here until they accept."
          />
        ) : (
          invites.data.invitations.map((inv) => (
            <InviteRow key={inv.id} orgId={orgId} invite={inv} />
          ))
        )}
      </SettingsPanel>
    </Flex>
  );
}

const InviteSchema = z.object({
  email: z.string().min(1, 'Enter an email address.').email('Enter a valid email address.'),
});
type InviteForm = z.infer<typeof InviteSchema>;

function InviteBar({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const form = useForm<InviteForm>({ resolver: zodResolver(InviteSchema), defaultValues: { email: '' } });
  const email = form.watch('email');

  const invite = useMutation({
    ...createOrgInvitationMutation(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: listOrgInvitationsQueryKey({ path: { orgId } }),
      });
      form.reset();
      notify.success(`Invitation sent to ${created.email}`);
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.error.message : 'Could not send the invitation.';
      form.setError('email', { message: msg });
    },
  });

  return (
    <Flex
      as="form"
      direction="col"
      gap={1.5}
      className="rounded-2xl border border-border bg-card p-4"
      onSubmit={form.handleSubmit((data) => invite.mutate({ path: { orgId }, body: { email: data.email } }))}
    >
      <Flex gap={2} align="start" className="w-full">
        <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
          <Input
            type="email"
            autoComplete="off"
            placeholder="teammate@company.com"
            aria-label="Invite by email"
            {...form.register('email')}
          />
        </Flex>
        <Button type="submit" loading={invite.isPending} disabled={!email.trim()}>
          <HugeiconsIcon icon={SentIcon} size={16} />
          Send invite
        </Button>
      </Flex>
      <FieldError message={form.formState.errors.email?.message} />
    </Flex>
  );
}

function MemberRow({
  orgId,
  member,
  isYou,
}: {
  orgId: string;
  member: MemberSummary;
  isYou: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const remove = useMutation({
    ...removeOrgMemberMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listOrgMembersQueryKey({ path: { orgId } }) });
      setConfirmOpen(false);
      notify.success('Member removed');
    },
    onError: (err) => {
      setConfirmOpen(false);
      notify.error(isApiError(err) ? err.error.message : 'Could not remove the member.');
    },
  });

  const displayName = member.name?.trim() || member.email.split('@')[0];

  return (
    <Flex align="center" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <UserAvatar
        userId={member.userId}
        name={member.name}
        email={member.email}
        hasAvatar={member.hasAvatar}
        avatarUpdatedAt={member.avatarUpdatedAt}
      />
      <Flex direction="col" className="min-w-0 flex-1 leading-tight">
        <Flex align="center" gap={2} className="min-w-0">
          <Text as="span" truncate weight="medium">
            {displayName}
          </Text>
          {isYou && (
            <Badge variant="secondary" className="shrink-0">
              You
            </Badge>
          )}
        </Flex>
        <Text as="span" truncate className="text-sm text-muted-foreground">
          {member.email}
        </Text>
      </Flex>
      {!isYou && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${displayName}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} />
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove member?</AlertDialogTitle>
              <AlertDialogDescription>
                {displayName} ({member.email}) will lose access to this organization and all its
                projects. They can be re-invited later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={remove.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  remove.mutate({ path: { orgId, userId: member.userId } });
                }}
              >
                Remove member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Flex>
  );
}

function InviteRow({ orgId, invite }: { orgId: string; invite: InvitationSummary }) {
  const queryClient = useQueryClient();

  const revoke = useMutation({
    ...revokeOrgInvitationMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listOrgInvitationsQueryKey({ path: { orgId } }),
      });
      notify.success('Invitation revoked');
    },
    onError: () => notify.error('Could not revoke the invitation.'),
  });

  const expired = invite.status === 'expired';

  return (
    <Flex align="center" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <Flex
        align="center"
        justify="center"
        className="size-9.5 shrink-0 rounded-lg border border-dashed border-border text-muted-foreground"
      >
        <HugeiconsIcon icon={Mail01Icon} size={18} />
      </Flex>
      <Flex direction="col" className="min-w-0 flex-1 leading-tight">
        <Text as="span" truncate weight="medium">
          {invite.email}
        </Text>
        <Text as="span" truncate className="text-sm text-muted-foreground">
          Invited {timeAgo(invite.invitedAt)} · {expired ? 'expired' : 'awaiting acceptance'}
        </Text>
      </Flex>
      <Badge variant={expired ? 'destructive' : 'outline'} className="shrink-0">
        {expired ? 'Expired' : 'Pending'}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Revoke invitation for ${invite.email}`}
        className="text-muted-foreground hover:text-destructive"
        loading={revoke.isPending}
        onClick={() => revoke.mutate({ path: { orgId, invitationId: invite.id } })}
      >
        <HugeiconsIcon icon={Delete02Icon} size={18} />
      </Button>
    </Flex>
  );
}
