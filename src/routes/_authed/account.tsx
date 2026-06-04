import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { Logo } from '@/components/auth/Logo';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { AccountMenu } from '@/components/users/AccountMenu';
import { ProfileSection } from '@/components/account/ProfileSection';
import { PasswordSection } from '@/components/account/PasswordSection';
import { ConnectedAccounts } from '@/components/account/ConnectedAccounts';
import { oauthErrorMessage } from '@/lib/oauth-error';
import { notify } from '@/lib/notify';
import { privateSeo } from '@/lib/seo';

// User-level account settings — not tied to any org, so it lives at the top level
// (no dashboard sidebar) with its own header, like the org picker.
export const Route = createFileRoute('/_authed/account')({
  head: () => privateSeo('Account'),
  component: AccountPage,
  validateSearch: (search: Record<string, unknown>): { linked?: string; oauthError?: string } => ({
    linked: typeof search.linked === 'string' ? search.linked : undefined,
    oauthError: typeof search.oauthError === 'string' ? search.oauthError : undefined,
  }),
});

function AccountPage() {
  const { linked, oauthError } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;

  // Surface the outcome of a "connect" round-trip (set by the OAuth link callback),
  // then strip the query params so a refresh doesn't re-toast.
  useEffect(() => {
    if (!linked && !oauthError) return;
    if (linked) {
      notify.success('Connected', { description: `Your ${linked} account is now linked.` });
    } else {
      const msg = oauthErrorMessage(oauthError);
      if (msg) notify.error("Couldn't connect", { description: msg });
    }
    navigate({ to: '/account', search: {}, replace: true });
  }, [linked, oauthError, navigate]);

  return (
    <Flex direction="col" className="min-h-svh">
      <Flex
        as="header"
        align="center"
        justify="between"
        gap={4}
        className="border-b border-border px-6 py-3"
      >
        <Link to="/orgs" aria-label="Back to dashboard">
          <Logo />
        </Link>
        <Flex align="center" gap={2}>
          <ThemeSegmentedControl />
          {user && <AccountMenu user={user} onSignedOut={() => navigate({ to: '/login' })} />}
        </Flex>
      </Flex>

      {me.isLoading ? (
        <LoadingState />
      ) : me.error || !user ? (
        <ErrorState error={me.error} onRetry={() => me.refetch()} />
      ) : (
        <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl px-6 py-8">
          <Flex align="start" justify="between" gap={3}>
            <Flex direction="col" gap={1}>
              <Text variant="h1">Account</Text>
              <Text color="muted">Manage your profile, password, and connected logins.</Text>
            </Flex>
            <Button variant="outline" size="sm" onClick={() => router.history.back()}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
              Back
            </Button>
          </Flex>

          <ProfileSection user={user} />
          <PasswordSection user={user} />
          <ConnectedAccounts user={user} />
        </Flex>
      )}
    </Flex>
  );
}
