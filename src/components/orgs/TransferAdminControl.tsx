import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrgQueryKey,
  listOrgMembersOptions,
  listOrgMembersQueryKey,
  listMyOrganizationsQueryKey,
  getMyDeletabilityQueryKey,
  updateOrgMemberRoleMutation,
} from '@/client/@tanstack/react-query.gen';
import { FilterCombobox } from '@/components/ui/combobox';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

/**
 * Promote another member to admin, a "transfer" that lets the current admin hand off
 * the org (and then leave, since they're no longer the sole admin). Reuses the existing
 * member-role endpoint. Only members (non-admins) are offered as candidates.
 */
export function TransferAdminControl({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState('');
  const membersQuery = useQuery(listOrgMembersOptions({ path: { orgId } }));
  const candidates = (membersQuery.data?.members ?? []).filter((m) => m.role !== 'admin');

  const promote = useMutation({
    ...updateOrgMemberRoleMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listOrgMembersQueryKey({ path: { orgId } }) }),
        queryClient.invalidateQueries({ queryKey: getOrgQueryKey({ path: { orgId } }) }),
        queryClient.invalidateQueries({ queryKey: listMyOrganizationsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getMyDeletabilityQueryKey() }),
      ]);
      setSelected('');
      notify.success('Admin added', {
        description: 'That member is now an admin of this organization.',
      });
    },
    onError: (err) =>
      notify.error("Couldn't transfer admin", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  if (!membersQuery.isLoading && candidates.length === 0) {
    return (
      <Text className="text-sm text-muted-foreground">
        No other members to promote to admin. Invite someone first.
      </Text>
    );
  }

  return (
    <Flex gap={2} align="center" className="w-full">
      <FilterCombobox
        value={selected}
        onChange={(v) => v && setSelected(v)}
        options={candidates.map((m) => ({ value: m.userId, label: m.name ?? m.email }))}
        placeholder="Choose a member…"
        emptyText="No members"
        clearable={false}
        width="min-w-0 flex-1"
      />
      <Button
        variant="outline"
        className="shrink-0"
        disabled={!selected}
        loading={promote.isPending}
        onClick={() =>
          promote.mutate({ path: { orgId, userId: selected }, body: { role: 'admin' } })
        }
      >
        Make admin
      </Button>
    </Flex>
  );
}
