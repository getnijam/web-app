import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { GoogleIcon, GithubIcon } from '@hugeicons/core-free-icons';
import type { UserPublic } from '@/client';
import {
  getMeQueryKey,
  listMyOAuthAccountsOptions,
  listMyOAuthAccountsQueryKey,
  unlinkMyOAuthAccountMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { AccountSection } from '@/components/account/AccountSection';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

const PROVIDERS = [
  { id: 'google', label: 'Google', icon: GoogleIcon },
  { id: 'github', label: 'GitHub', icon: GithubIcon },
] as const;

/** Link / unlink Google + GitHub logins for the account. */
export function ConnectedAccounts({ user }: { user: UserPublic }) {
  const queryClient = useQueryClient();
  const accountsQuery = useQuery(listMyOAuthAccountsOptions());
  const accounts = accountsQuery.data?.accounts ?? [];
  // Return to the current page after the connect round-trip; the account menu mounted
  // there re-opens this dialog (via ?connected / ?connectError).
  const next = window.location.pathname;

  const unlink = useMutation({
    ...unlinkMyOAuthAccountMutation(),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listMyOAuthAccountsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getMeQueryKey() }),
      ]);
      notify.success('Disconnected', {
        description: `Your ${vars.path.provider} account was unlinked.`,
      });
    },
    onError: (err) =>
      notify.error("Couldn't disconnect", {
        description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
      }),
  });

  // The account's only way to sign in: no password and a single linked provider.
  const onlyMethod = !user.hasPassword && accounts.length <= 1;

  return (
    <AccountSection title="Connected accounts">
      {accountsQuery.isLoading ? (
        <Text color="muted" className="text-sm">
          Loading…
        </Text>
      ) : (
        PROVIDERS.map((p) => {
          const linked = accounts.find((a) => a.provider === p.id);
          const isLastMethod = onlyMethod && Boolean(linked);
          return (
            <Flex key={p.id} align="center" justify="between" gap={3}>
              <Flex align="center" gap={3} className="min-w-0">
                <HugeiconsIcon icon={p.icon} size={20} className="shrink-0" />
                <Flex direction="col" className="min-w-0">
                  <Text as="span" className="text-sm font-medium">
                    {p.label}
                  </Text>
                  <Text as="span" truncate className="text-xs text-muted-foreground">
                    {linked ? linked.email : 'Not connected'}
                  </Text>
                </Flex>
              </Flex>
              {linked ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLastMethod}
                  loading={unlink.isPending && unlink.variables?.path.provider === p.id}
                  onClick={() => unlink.mutate({ path: { provider: p.id } })}
                >
                  Disconnect
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <a href={`${API_BASE}/v1/auth/oauth/${p.id}/link?next=${encodeURIComponent(next)}`}>
                    Connect
                  </a>
                </Button>
              )}
            </Flex>
          );
        })
      )}

      {onlyMethod && accounts.length > 0 && (
        <Text className="text-xs text-muted-foreground">
          This is your only way to sign in — set a password above before disconnecting it.
        </Text>
      )}
    </AccountSection>
  );
}
