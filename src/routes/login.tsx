import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { login, verifyLogin2Fa } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';
import { AuthLayout, AuthHeading, FieldError } from '@/components/auth/AuthLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { oauthErrorMessage } from '@/lib/oauth-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard, safeNextPath } from '@/lib/auth-redirect';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/login')({
  head: () =>
    seo({
      title: 'Log in',
      description:
        'Sign in to Nijam to view your Playwright, pytest, and Vitest run history, flakiness, and failures.',
      path: '/login',
    }),
  beforeLoad: ({ context, search }) =>
    redirectAuthedToDashboard(context.queryClient, search.nextUrl),
  component: LoginPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { invite?: string; oauthError?: string; nextUrl?: string } => ({
    invite: typeof search.invite === 'string' ? search.invite : undefined,
    oauthError: typeof search.oauthError === 'string' ? search.oauthError : undefined,
    // The page to return to after sign-in (set by the _authed gate). Validated to a
    // same-origin relative path so it can't be used as an open redirect.
    nextUrl: safeNextPath(search.nextUrl),
  }),
});

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
type LoginForm = z.infer<typeof LoginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invite, oauthError, nextUrl } = Route.useSearch();
  // Where to land after sign-in: the invite flow wins (resumes acceptance), else the
  // page they were headed to (?nextUrl from the gate), else the org picker. The same
  // target is carried through OAuth via the start route's `next`.
  const postLogin = invite ? `/invite?token=${invite}` : (nextUrl ?? '/orgs');
  const [formError, setFormError] = useState<string | null>(() => oauthErrorMessage(oauthError));
  // Set once the password step succeeds for a 2FA-enabled account; switches the page to
  // the code-entry step. Held only in memory (never persisted).
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const form = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const finishLogin = async () => {
    await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
    if (invite) navigate({ to: '/invite', search: { token: invite } });
    else navigate({ to: nextUrl ?? '/orgs' });
  };

  const mutation = useMutation({
    mutationFn: async (body: LoginForm) => (await login({ body, throwOnError: true })).data,
    onSuccess: async (result) => {
      if (result && 'twoFactorRequired' in result) {
        setChallengeToken(result.challengeToken);
        return;
      }
      await finishLogin();
    },
    onError: (err: unknown) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof LoginForm, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  if (challengeToken) {
    return (
      <AuthLayout>
        <TwoFactorStep
          challengeToken={challengeToken}
          onAuthenticated={finishLogin}
          onCancel={() => setChallengeToken(null)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        <AuthHeading title="Sign in" description="Welcome back. Sign in to your Nijam account." />

        <OAuthButtons next={postLogin} />

        <Flex
          as="form"
          direction="col"
          gap={4}
          onSubmit={form.handleSubmit((data) => {
            setFormError(null);
            mutation.mutate(data);
          })}
        >
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              data-testid="login-email"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Flex align="center" justify="between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </Flex>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              data-testid="login-password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </Flex>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={mutation.isPending}
            data-testid="login-submit"
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Flex>

        <Text color="muted" align="center">
          New to Nijam?{' '}
          <Link
            to="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </Text>
      </Flex>
    </AuthLayout>
  );
}

/** Second sign-in step for 2FA accounts: enter an authenticator or backup code. */
function TwoFactorStep({
  challengeToken,
  onAuthenticated,
  onCancel,
}: {
  challengeToken: string;
  onAuthenticated: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useMutation({
    mutationFn: (body: { challengeToken: string; code: string }) =>
      verifyLogin2Fa({ body, throwOnError: true }),
    onSuccess: () => {
      void onAuthenticated();
    },
    onError: (err: unknown) => {
      setError(isApiError(err) ? err.error.message : 'Something went wrong. Please try again.');
    },
  });

  const description = useBackup
    ? 'Enter one of your saved backup codes.'
    : 'Enter the 6-digit code from your authenticator app.';

  return (
    <Flex direction="col" gap={6}>
      <AuthHeading title="Two-factor authentication" description={description} />

      <Flex
        as="form"
        direction="col"
        gap={4}
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          verify.mutate({ challengeToken, code: code.trim() });
        }}
      >
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Flex direction="col" gap={1.5}>
          <Label htmlFor="totp-code">{useBackup ? 'Backup code' : 'Verification code'}</Label>
          <Input
            id="totp-code"
            inputMode={useBackup ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            autoFocus
            placeholder={useBackup ? 'XXXX-XXXX' : '123456'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            data-testid="login-2fa-code"
          />
        </Flex>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={verify.isPending}
          disabled={code.trim().length === 0}
          data-testid="login-2fa-submit"
        >
          {verify.isPending ? 'Verifying…' : 'Verify'}
        </Button>
      </Flex>

      <Flex direction="col" align="center" gap={2}>
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            setUseBackup((b) => !b);
            setCode('');
            setError(null);
          }}
        >
          {useBackup ? 'Use your authenticator app instead' : 'Use a backup code instead'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Back to sign in
        </Button>
      </Flex>
    </Flex>
  );
}
