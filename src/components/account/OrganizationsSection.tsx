import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyOrganizationsResponse } from '@/client';
import {
  listMyOrganizationsOptions,
  listMyOrganizationsQueryKey,
  listOrgsQueryKey,
  leaveOrgMutation,
} from '@/client/@tanstack/react-query.gen';
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
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { AccountSection } from '@/components/account/AccountSection';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

type Membership = MyOrganizationsResponse['organizations'][number];
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Lists the orgs the user belongs to with a Leave action (disabled for the sole admin). */
export function OrganizationsSection() {
  const { data, isLoading, error, refetch } = useQuery(listMyOrganizationsOptions());

  const renderBody = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
    const orgs = data?.organizations ?? [];
    if (orgs.length === 0) {
      return (
        <Text color="muted" className="text-sm">
          You're not part of any organizations yet.
        </Text>
      );
    }
    return orgs.map((org) => <OrgRow key={org.id} org={org} />);
  };

  return (
    <AccountSection
      title="Organizations"
      description="Organizations you're part of. Leave one you no longer need access to."
    >
      {renderBody()}
    </AccountSection>
  );
}

function OrgRow({ org }: { org: Membership }) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const leave = useMutation({
    ...leaveOrgMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listMyOrganizationsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() }),
      ]);
      setConfirmOpen(false);
      notify.success('Left organization', { description: `You left ${org.name}.` });
    },
    onError: (err) =>
      notify.error("Couldn't leave", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex align="center" justify="between" gap={3}>
      <Flex align="center" gap={3} className="min-w-0">
        <OrgAvatar
          org={{ id: org.id, name: org.name, hasLogo: false, logoUpdatedAt: null }}
          size="sm"
        />
        <Flex direction="col" className="min-w-0">
          <Flex align="center" gap={2}>
            <Text as="span" truncate className="text-sm font-medium">
              {org.name}
            </Text>
            <Badge variant="secondary" className="capitalize">
              {org.role}
            </Badge>
          </Flex>
          <Text as="span" className="text-xs text-muted-foreground">
            {plural(org.memberCount, 'member')}
            {org.isSoleAdmin && " · You're the only admin"}
          </Text>
        </Flex>
      </Flex>

      {org.isSoleAdmin ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span wrapper: a disabled button doesn't emit the hover events the tooltip needs */}
            <span className="shrink-0" tabIndex={0}>
              <Button variant="outline" size="sm" disabled className="pointer-events-none">
                Leave
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            You can't leave because you're the only admin. Promote another member to admin first.
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setConfirmOpen(true)}
        >
          Leave
        </Button>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {org.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll lose access to this organization's projects and data. You can rejoin only if
              someone invites you back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={leave.isPending}
              onClick={(e) => {
                e.preventDefault();
                leave.mutate({ path: { orgId: org.id } });
              }}
            >
              Leave organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
