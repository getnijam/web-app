import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/states/LoadingState';
import { AccountSection } from '@/components/account/AccountSection';
import { PasswordSection } from '@/components/account/PasswordSection';
import { TwoFactorSection } from '@/components/account/TwoFactorSection';
import { ConnectedAccounts } from '@/components/account/ConnectedAccounts';
import { oauthErrorMessage } from '@/lib/oauth-error';
import { notify } from '@/lib/notify';

export const Route = createFileRoute('/_authed/profile/security')({
  component: SecurityPage,
});

function Divider() {
  return <div className="h-px bg-border" />;
}

function SecurityPage() {
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;

  // ConnectedAccounts' "Connect" leaves the SPA and returns here with ?connected /
  // ?connectError, toast the result and strip the params (handled by AccountMenu when
  // settings was a modal; lives here now that it's a page).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const connectError = params.get('connectError');
    if (!connected && !connectError) return;
    if (connected) {
      notify.success('Connected', { description: `Your ${connected} account is now linked.` });
    } else {
      const msg = oauthErrorMessage(connectError ?? undefined);
      if (msg) notify.error("Couldn't connect", { description: msg });
    }
    params.delete('connected');
    params.delete('connectError');
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  }, []);

  if (!user) return <LoadingState />;

  return (
    <Card className="flex flex-col gap-6 p-6">
      <AccountSection
        title="Username"
        description="The email you use to sign in. It can't be changed."
      >
        <Flex direction="col" gap={1.5}>
          <Label htmlFor="security-email">Email</Label>
          <Input id="security-email" value={user.email} disabled readOnly />
        </Flex>
      </AccountSection>
      <Divider />
      <PasswordSection user={user} />
      <Divider />
      <TwoFactorSection user={user} />
      <Divider />
      <ConnectedAccounts user={user} />
    </Card>
  );
}
