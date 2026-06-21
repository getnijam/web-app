import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyInvitationsResponse } from '@/client';
import {
  listMyInvitationsOptions,
  listMyInvitationsQueryKey,
  listOrgsQueryKey,
  listMyOrganizationsQueryKey,
  getMyDeletabilityQueryKey,
  acceptMyInvitationMutation,
  rejectMyInvitationMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

type Invitation = MyInvitationsResponse['invitations'][number];

/**
 * Pending org invitations addressed to the signed-in user, with Accept actions. Renders
 * nothing when there are none, so it can be dropped onto any screen (org picker, profile).
 * `onAccepted` fires with the joined org id (e.g. to navigate into it).
 */
export function PendingInvitations({ onAccepted }: { onAccepted?: (orgId: string) => void }) {
  const { data } = useQuery(listMyInvitationsOptions());
  const invitations = data?.invitations ?? [];

  // When linked here from the account menu (`/profile#invitations`), scroll the card
  // into view and flash a highlight so it's easy to spot among the profile sections.
  const hash = useLocation({ select: (l) => l.hash });
  const [highlight, setHighlight] = useState(false);
  useEffect(() => {
    if (hash !== 'invitations' || invitations.length === 0) return;
    document.getElementById('invitations')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const on = setTimeout(() => setHighlight(true), 0);
    const off = setTimeout(() => setHighlight(false), 2200);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [hash, invitations.length]);

  if (invitations.length === 0) return null;

  return (
    <Flex
      id="invitations"
      direction="col"
      gap={4}
      className={cn(
        'scroll-mt-6 rounded-2xl border bg-card p-5 transition-shadow duration-500',
        highlight ? 'border-primary ring-2 ring-primary/40' : 'border-border',
      )}
    >
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

  const reject = useMutation({
    ...rejectMyInvitationMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listMyInvitationsQueryKey() });
      notify.success('Invitation declined', {
        description: `You declined the invitation to ${invitation.orgName}.`,
      });
    },
    onError: (err) =>
      notify.error("Couldn't decline invitation", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const busy = accept.isPending || reject.isPending;

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
      <Flex gap={2} className="shrink-0">
        <Button
          variant="outline"
          size="sm"
          loading={reject.isPending}
          disabled={busy}
          onClick={() => reject.mutate({ path: { invitationId: invitation.id } })}
        >
          Decline
        </Button>
        <Button
          size="sm"
          loading={accept.isPending}
          disabled={busy}
          onClick={() => accept.mutate({ path: { invitationId: invitation.id } })}
        >
          Accept
        </Button>
      </Flex>
    </Flex>
  );
}
