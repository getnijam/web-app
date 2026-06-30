import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';
import {
  previewInvitationOptions,
  getMeOptions,
  acceptInvitationMutation,
  listOrgsQueryKey,
} from '@/client/@tanstack/react-query.gen';
import { AuthLayout, AuthHeading } from '@/components/auth/AuthLayout';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/states/LoadingState';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { useLogout } from '@/hooks/use-logout';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/invite')({
  // Client-rendered auth/utility form: beforeLoad (redirect-if-authed) runs in the
  // browser with the session cookie, and these are forms with no SEO value.
  ssr: false,
  head: () => seo({ title: 'Accept your invitation', path: '/invite', noindex: true }),
  component: InvitePage,
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
});

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        <Flex
          align="center"
          justify="center"
          className="size-11 rounded-full bg-primary/10 text-primary"
        >
          <HugeiconsIcon icon={UserGroupIcon} size={22} />
        </Flex>
        {children}
      </Flex>
    </AuthLayout>
  );
}

function InvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const preview = useQuery({
    ...previewInvitationOptions({ path: { token: token ?? '' } }),
    retry: false,
    enabled: !!token,
  });
  const me = useQuery({ ...getMeOptions(), retry: false });

  const accept = useMutation({
    ...acceptInvitationMutation(),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() });
      notify.success(`Joined ${res.orgName}`, {
        description: 'You now have access to the organization’s projects and runs.',
      });
      navigate({ to: '/orgs/$orgId/projects', params: { orgId: res.orgId } });
    },
    onError: (err) =>
      notify.error("Couldn't accept invitation", {
        description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
      }),
  });

  const signOut = useLogout();

  // Invalid / missing token.
  if (!token || preview.isError) {
    return (
      <InviteShell>
        <AuthHeading
          title="Invitation not found"
          description="This invitation link is invalid or has been revoked. Ask an organization member to send a new one."
        />
        <Link to="/orgs" className="font-medium text-foreground underline-offset-4 hover:underline">
          Go to your organizations
        </Link>
      </InviteShell>
    );
  }

  if (preview.isLoading || me.isLoading || !preview.data) {
    return (
      <InviteShell>
        <LoadingState />
      </InviteShell>
    );
  }

  const { orgName, email, status } = preview.data;

  if (status === 'accepted') {
    return (
      <InviteShell>
        <AuthHeading
          title="Already accepted"
          description={`This invitation to ${orgName} has already been accepted.`}
        />
        <Link to="/orgs" className="font-medium text-foreground underline-offset-4 hover:underline">
          Go to your organizations
        </Link>
      </InviteShell>
    );
  }

  if (status === 'expired') {
    return (
      <InviteShell>
        <AuthHeading
          title="Invitation expired"
          description={`This invitation to ${orgName} has expired. Ask an organization member to send a new one.`}
        />
        <Link to="/orgs" className="font-medium text-foreground underline-offset-4 hover:underline">
          Go to your organizations
        </Link>
      </InviteShell>
    );
  }

  const currentEmail = me.data?.user.email ?? null;

  // Not signed in → route to login (carry the token) or signup (prefill email).
  if (!currentEmail) {
    return (
      <InviteShell>
        <AuthHeading
          title={`Join ${orgName}`}
          description={
            <>
              You've been invited to join{' '}
              <Text as="span" weight="medium" color="default">
                {orgName}
              </Text>{' '}
              on Nijam as{' '}
              <Text as="span" weight="medium" color="default">
                {email}
              </Text>
              . Sign in or create an account to accept.
            </>
          }
        />
        <Flex direction="col" gap={3}>
          <Button asChild size="lg" className="w-full">
            <Link to="/login" search={{ invite: token }}>
              Sign in to accept
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/signup" search={{ email }}>
              Create an account
            </Link>
          </Button>
        </Flex>
      </InviteShell>
    );
  }

  // Signed in with a different email than the invite was sent to.
  if (currentEmail.toLowerCase() !== email.toLowerCase()) {
    return (
      <InviteShell>
        <AuthHeading
          title="Wrong account"
          description={
            <>
              This invitation was sent to{' '}
              <Text as="span" weight="medium" color="default">
                {email}
              </Text>
              , but you're signed in as{' '}
              <Text as="span" weight="medium" color="default">
                {currentEmail}
              </Text>
              . Sign out and use the invited account.
            </>
          }
        />
        <Button variant="outline" loading={signOut.isPending} onClick={() => signOut.mutate()}>
          Sign out
        </Button>
      </InviteShell>
    );
  }

  // Signed in with the matching email → accept.
  return (
    <InviteShell>
      <AuthHeading
        title={`Join ${orgName}`}
        description={
          <>
            You've been invited to join{' '}
            <Text as="span" weight="medium" color="default">
              {orgName}
            </Text>{' '}
            on Nijam. Accept to start collaborating with the team.
          </>
        }
      />
      <Button
        size="lg"
        className="w-full"
        loading={accept.isPending}
        onClick={() => accept.mutate({ path: { token } })}
      >
        Join {orgName}
      </Button>
    </InviteShell>
  );
}
