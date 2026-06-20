import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyInvitationsResponse } from '@/client';
import {
  listMyInvitationsOptions,
  listMyInvitationsQueryKey,
  listOrgsQueryKey,
  listMyOrganizationsQueryKey,
  getMyDeletabilityQueryKey,
  acceptMyInvitationMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

type Invitation = MyInvitationsResponse['invitations'][number];

/**
 * Pending org invitations addressed to the signed-in user, with Accept actions. Renders
 * nothing when there are none, so it can be dropped onto any screen (org picker, profile).
 * `onAccepted` fires with the joined org id (e.g. to navigate into it).
 */
export function PendingInvitations({ onAccepted }: { onAccepted?: (orgId: string) => void }) {
  const { data } = useQuery(listMyInvitationsOptions());
  const invitations = data?.invitations ?? [];
  if (invitations.length === 0) return null;

  return (
    <Flex direction="col" gap={4} className="rounded-2xl border border-border bg-card p-5">
      <Flex direction="col" gap={0.5}>
        <Text variant="h4">Invitations</Text>
        <Text as="span" className="text-sm text-muted-foreground">
          You've been invited to these organizations.
        </Text>
      </Flex>
      {invitations.map((inv) => (
        <InvitationRow key={inv.id} invitation={inv} onAccepted={onAccepted} />
      ))}
    </Flex>
  );
}

function InvitationRow({
  invitation,
  onAccepted,
}: {
  invitation: Invitation;
  onAccepted?: (orgId: string) => void;
}) {
  const queryClient = useQueryClient();

  const accept = useMutation({
    ...acceptMyInvitationMutation(),
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listMyInvitationsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: listMyOrganizationsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getMyDeletabilityQueryKey() }),
      ]);
      notify.success('Invitation accepted', { description: `You joined ${res.orgName}.` });
      onAccepted?.(res.orgId);
    },
    onError: (err) =>
      notify.error("Couldn't accept invitation", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex align="center" justify="between" gap={3}>
      <Flex align="center" gap={3} className="min-w-0">
        <OrgAvatar
          org={{
            id: invitation.orgId,
            name: invitation.orgName,
            hasLogo: false,
            logoUpdatedAt: null,
          }}
          size="sm"
        />
        <Flex direction="col" className="min-w-0">
          <Flex align="center" gap={2}>
            <Text as="span" truncate className="text-sm font-medium">
              {invitation.orgName}
            </Text>
            <Badge variant="secondary" className="capitalize">
              {invitation.role}
            </Badge>
          </Flex>
          <Text as="span" truncate className="text-xs text-muted-foreground">
            {invitation.invitedByName
              ? `Invited by ${invitation.invitedByName}`
              : 'You have an invitation'}
          </Text>
        </Flex>
      </Flex>
      <Button
        size="sm"
        className="shrink-0"
        loading={accept.isPending}
        onClick={() => accept.mutate({ path: { invitationId: invitation.id } })}
      >
        Accept
      </Button>
    </Flex>
  );
}
