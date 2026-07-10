import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SentIcon,
  Delete02Icon,
  Mail01Icon,
  Search01Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons';
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
  updateOrgMemberRoleMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FilterCombobox, type ComboboxOption } from '@/components/ui/combobox';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { RowsSkeleton } from '@/components/states/RowsSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { OrgAutoJoin } from '@/components/orgs/OrgAutoJoin';
import { FieldError } from '@/components/auth/AuthLayout';
import { UserAvatar } from '@/components/users/UserAvatar';
import { isApiError } from '@/lib/api-error';
import { timeAgo } from '@/lib/format';
import { notify } from '@/lib/notify';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { privateSeo } from '@/lib/seo';

const ROLE_OPTIONS: ComboboxOption[] = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

export const Route = createFileRoute('/_authed/orgs/$orgId/settings/users')({
  head: () => privateSeo('Members'),
  component: UsersPage,
});

function UsersPage() {
  const { orgId } = Route.useParams();
  const isAdmin = useIsOrgAdmin(orgId);
  const me = useQuery({ ...getMeOptions(), retry: false });
  const members = useQuery(listOrgMembersOptions({ path: { orgId } }));
  const invites = useQuery(listOrgInvitationsOptions({ path: { orgId } }));

  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const memberCount = members.data?.members.length ?? 0;
  const pendingCount = invites.data?.invitations.length ?? 0;

  const q = query.trim().toLowerCase();
  const matches = (name: string | null | undefined, email: string) =>
    !q || (name?.toLowerCase().includes(q) ?? false) || email.toLowerCase().includes(q);
  const filteredMembers = (members.data?.members ?? []).filter((m) => matches(m.name, m.email));
  const filteredInvites = (invites.data?.invitations ?? []).filter((inv) =>
    matches(null, inv.email),
  );

  const renderMembers = () => {
    if (members.isLoading) return <RowsSkeleton rows={3} round />;
    if (members.error || !members.data)
      return (
        <div className="px-5 py-6">
          <ErrorState error={members.error} onRetry={() => members.refetch()} />
        </div>
      );
    if (filteredMembers.length === 0)
      return <EmptyState title="No matches" description="No members match your search." />;
    return filteredMembers.map((m) => (
      <MemberRow
        key={m.userId}
        orgId={orgId}
        member={m}
        isYou={m.userId === me.data?.user.id}
        isAdmin={isAdmin}
      />
    ));
  };

  const renderInvites = () => {
    if (invites.isLoading) return <RowsSkeleton rows={2} />;
    if (invites.error || !invites.data)
      return (
        <div className="px-5 py-6">
          <ErrorState error={invites.error} onRetry={() => invites.refetch()} />
        </div>
      );
    if (invites.data.invitations.length === 0)
      return (
        <EmptyState
          title="No pending invitations"
          description="Invite a teammate by email and they'll show up here until they accept."
        />
      );
    if (filteredInvites.length === 0)
      return <EmptyState title="No matches" description="No invitations match your search." />;
    return filteredInvites.map((inv) => <InviteRow key={inv.id} orgId={orgId} invite={inv} />);
  };

  return (
    <Flex direction="col" gap={6}>
      <Text color="muted" className="text-sm">
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
        {isAdmin &&
          pendingCount > 0 &&
          ` · ${pendingCount} pending ${pendingCount === 1 ? 'invitation' : 'invitations'}`}
      </Text>

      <Flex align="center" gap={3} className="flex-wrap">
        <Input
          className="min-w-0 flex-1"
          placeholder="Search members…"
          aria-label="Search members"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="members-search"
          startIcon={<HugeiconsIcon icon={Search01Icon} size={16} />}
          clearable
          onClear={() => setQuery('')}
        />
        {isAdmin && (
          <Button
            className="shrink-0"
            onClick={() => setInviteOpen(true)}
            data-testid="invite-open"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} />
            Invite user
          </Button>
        )}
      </Flex>

      {!isAdmin && (
        <Text color="muted" className="text-sm">
          Only admins can invite or manage members.
        </Text>
      )}

      <SettingsPanel title="Members">{renderMembers()}</SettingsPanel>

      {isAdmin && <SettingsPanel title="Pending invitations">{renderInvites()}</SettingsPanel>}

      {isAdmin && <OrgAutoJoin orgId={orgId} />}

      {isAdmin && <InviteDialog orgId={orgId} open={inviteOpen} onOpenChange={setInviteOpen} />}
    </Flex>
  );
}

const InviteSchema = z.object({
  email: z.string().min(1, 'Enter an email address.').email('Enter a valid email address.'),
});
type InviteForm = z.infer<typeof InviteSchema>;

function InviteDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<InviteForm>({
    resolver: zodResolver(InviteSchema),
    defaultValues: { email: '' },
  });
  const email = useWatch({ control: form.control, name: 'email' });
  const [role, setRole] = useState<'admin' | 'member'>('member');

  const invite = useMutation({
    ...createOrgInvitationMutation(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: listOrgInvitationsQueryKey({ path: { orgId } }),
      });
      form.reset();
      setRole('member');
      onOpenChange(false);
      notify.success('Invitation sent', {
        description: `${created.email} was invited as ${role === 'admin' ? 'an admin' : 'a member'}. The invite expires in 7 days.`,
      });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.error.message : 'Could not send the invitation.';
      form.setError('email', { message: msg });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            They&rsquo;ll get an email invitation to join this organization. It expires in 7 days.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) =>
            invite.mutate({ path: { orgId }, body: { email: data.email, role } }),
          )}
        >
          <Flex direction="col" gap={4}>
            <Flex direction="col" gap={1.5}>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="off"
                autoFocus
                placeholder="teammate@company.com"
                {...form.register('email')}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </Flex>

            <Flex direction="col" gap={1.5}>
              <Label htmlFor="invite-role">Role</Label>
              <FilterCombobox
                id="invite-role"
                ariaLabel="Role"
                value={role}
                onChange={(v) => v && setRole(v as 'admin' | 'member')}
                options={ROLE_OPTIONS}
                placeholder="Role"
                clearable={false}
                searchable={false}
                width="w-full"
              />
            </Flex>
          </Flex>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={invite.isPending} disabled={!email.trim()}>
              {!invite.isPending && <HugeiconsIcon icon={SentIcon} size={16} />}
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  orgId,
  member,
  isYou,
  isAdmin,
}: {
  orgId: string;
  member: MemberSummary;
  isYou: boolean;
  isAdmin: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const displayName = member.name?.trim() || member.email.split('@')[0];

  const remove = useMutation({
    ...removeOrgMemberMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listOrgMembersQueryKey({ path: { orgId } }),
      });
      setConfirmOpen(false);
      notify.success('Member removed', {
        description: `${displayName} (${member.email}) no longer has access to this organization.`,
      });
    },
    onError: (err) => {
      setConfirmOpen(false);
      notify.error("Couldn't remove member", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  const roleMutation = useMutation({
    ...updateOrgMemberRoleMutation(),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: listOrgMembersQueryKey({ path: { orgId } }),
      });
      const newRole = variables.body?.role === 'admin' ? 'Admin' : 'Member';
      notify.success('Role updated', {
        description: `${displayName}'s role updated to ${newRole} successfully.`,
      });
    },
    onError: (err) =>
      notify.error("Couldn't update role", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

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
      {isAdmin && !isYou ? (
        <FilterCombobox
          ariaLabel={`Role for ${displayName}`}
          value={member.role}
          onChange={(v) =>
            v &&
            roleMutation.mutate({
              path: { orgId, userId: member.userId },
              body: { role: v as 'admin' | 'member' },
            })
          }
          options={ROLE_OPTIONS}
          placeholder="Role"
          clearable={false}
                searchable={false}
          disabled={roleMutation.isPending}
          width="w-28 shrink-0"
        />
      ) : (
        <Badge
          variant={member.role === 'admin' ? 'default' : 'secondary'}
          className="shrink-0 capitalize"
        >
          {member.role}
        </Badge>
      )}
      {isAdmin && !isYou && (
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
                loading={remove.isPending}
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const revoke = useMutation({
    ...revokeOrgInvitationMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listOrgInvitationsQueryKey({ path: { orgId } }),
      });
      notify.success('Invitation revoked', {
        description: `The invitation to ${invite.email} was revoked and can no longer be used.`,
      });
    },
    onError: () =>
      notify.error("Couldn't revoke invitation", {
        description: 'Something went wrong. Please try again.',
      }),
  });

  // Re-invite reissues the invitation (new token + expiry, email re-sent); for a
  // declined invite the backend also clears the rejection so it goes active again.
  const reinvite = useMutation({
    ...createOrgInvitationMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listOrgInvitationsQueryKey({ path: { orgId } }),
      });
      notify.success('Invitation re-sent', {
        description: `A fresh invitation was sent to ${invite.email}.`,
      });
    },
    onError: () =>
      notify.error("Couldn't re-invite", {
        description: 'Something went wrong. Please try again.',
      }),
  });

  const STATUS_META = {
    pending: { label: 'Pending', badge: 'outline' as const, note: 'awaiting acceptance' },
    expired: { label: 'Expired', badge: 'destructive' as const, note: 'expired' },
    rejected: { label: 'Declined', badge: 'secondary' as const, note: 'declined the invitation' },
  };
  const meta = STATUS_META[invite.status];
  const canReinvite = invite.status !== 'pending';

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
          Invited {timeAgo(invite.invitedAt)} · {meta.note}
        </Text>
      </Flex>
      <Badge variant={meta.badge} className="shrink-0">
        {meta.label}
      </Badge>
      {canReinvite && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          loading={reinvite.isPending}
          onClick={() =>
            reinvite.mutate({ path: { orgId }, body: { email: invite.email, role: invite.role } })
          }
        >
          Re-invite
        </Button>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Revoke invitation for ${invite.email}`}
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation to {invite.email} will be removed and the link can no longer be used to
              join. You can invite them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={revoke.isPending}
              onClick={(e) => {
                e.preventDefault();
                revoke.mutate({ path: { orgId, invitationId: invite.id } });
              }}
            >
              Revoke invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
