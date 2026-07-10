import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JoinableOrgsResponse } from '@/client';
import {
  listJoinableOrgsOptions,
  listJoinableOrgsQueryKey,
  listOrgsQueryKey,
  listMyOrganizationsQueryKey,
  getMyDeletabilityQueryKey,
  joinOrgByDomainMutation,
} from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

type JoinableOrg = JoinableOrgsResponse['organizations'][number];

/**
 * Orgs the signed-in user can self-join because their verified email is on an org's
 * verified auto-join domain. Renders nothing when there are none, so it drops onto any
 * screen (org picker, profile). `onJoined` fires with the joined org id (e.g. to navigate).
 */
export function JoinableOrgs({ onJoined }: { onJoined?: (orgId: string) => void }) {
  const { data } = useQuery(listJoinableOrgsOptions());
  const organizations = data?.organizations ?? [];

  if (organizations.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Flex direction="col" gap={0.5}>
        <Text variant="h4">Join your team</Text>
        <Text as="span" className="text-sm text-muted-foreground">
          Your email domain is set up for these organizations.
        </Text>
      </Flex>
      {organizations.map((org) => (
        <JoinableRow key={org.orgId} org={org} onJoined={onJoined} />
      ))}
    </Card>
  );
}

function JoinableRow({ org, onJoined }: { org: JoinableOrg; onJoined?: (orgId: string) => void }) {
  const queryClient = useQueryClient();

  const join = useMutation({
    ...joinOrgByDomainMutation(),
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listJoinableOrgsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: listMyOrganizationsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getMyDeletabilityQueryKey() }),
      ]);
      notify.success('Joined organization', { description: `You joined ${res.orgName}.` });
      onJoined?.(res.orgId);
    },
    onError: (err) =>
      notify.error("Couldn't join organization", {
        description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex align="center" justify="between" gap={3}>
      <Flex align="center" gap={3} className="min-w-0">
        <OrgAvatar
          org={{ id: org.orgId, name: org.orgName, hasLogo: false, logoUpdatedAt: null }}
          size="sm"
        />
        <Flex direction="col" className="min-w-0">
          <Text as="span" truncate className="text-sm font-medium">
            {org.orgName}
          </Text>
          <Text as="span" truncate className="text-xs text-muted-foreground">
            Anyone with an @{org.domain} email can join
          </Text>
        </Flex>
      </Flex>
      <Button
        size="sm"
        className="shrink-0"
        loading={join.isPending}
        onClick={() => join.mutate({ path: { orgId: org.orgId } })}
      >
        Join
      </Button>
    </Flex>
  );
}
