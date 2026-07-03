import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  FORGOT_PASSWORD_ROUTE,
  INVITE_ROUTE,
  ORGS_ROUTE,
  ORG_PROJECTS_ROUTE,
  SIGNUP_ROUTE,
} from '@/lib/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, verifyLogin2Fa, ssoDiscovery } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';
import { meQueryOptions } from '@/lib/me-query';
import { AuthLayout, AuthHeading } from '@/components/auth/AuthLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { oauthErrorMessage } from '@/lib/oauth-error';
import { ssoErrorMessage } from '@/lib/sso-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { Label } from '@/components/ui/label';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard, safeNextPath } from '@/lib/auth-redirect';
import { seo } from '@/lib/seo';
import { openExternal } from '@/lib/navigation';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const Route = createFileRoute('/login')({
  // Client-rendered auth/utility form: beforeLoad (redirect-if-authed) runs in the
  // browser with the session cookie, and these are forms with no SEO value.
  ssr: false,
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
  ): { invite?: string; oauthError?: string; ssoError?: string; nextUrl?: string } => ({
    invite: typeof search.invite === 'string' ? search.invite : undefined,
    oauthError: typeof search.oauthError === 'string' ? search.oauthError : undefined,
    ssoError: typeof search.ssoError === 'string' ? search.ssoError : undefined,
    // The page to return to after sign-in (set by the _authed gate). Validated to a
    // same-origin relative path so it can't be used as an open redirect.
    nextUrl: safeNextPath(search.nextUrl),
  }),
});

function isEmailish(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function ssoStartUrl(email: string, next: string): string {
  return (
    `${API_BASE}/v1/auth/sso/start?email=${encodeURIComponent(email)}` +
    `&next=${encodeURIComponent(next)}`
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invite, oauthError, ssoError, nextUrl } = Route.useSearch();
  // Where to land after sign-in: the invite flow wins (resumes acceptance), else the
  // page they were headed to (?nextUrl from the gate), else the org picker. The same
  // target is carried through OAuth/SSO via the start route's `next`.
  const postLogin = invite ? `/invite?token=${invite}` : (nextUrl ?? '/orgs');

  const [formError, setFormError] = useState<string | null>(
    () => oauthErrorMessage(oauthError) ?? ssoErrorMessage(ssoError),
  );
  // Set once the password step succeeds for a 2FA-enabled account; switches the page to
  // the code-entry step. Held only in memory (never persisted).
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  // Identity-first: collect the email, check if its domain has SSO, and only reveal the
  // password field when it doesn't (SSO domains never see a password prompt).
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSso, setCheckingSso] = useState(false);
  // SSO is available for this domain but NOT enforced → offer it alongside the password
  // field instead of force-redirecting, so users with a password keep that choice.
  const [ssoOptional, setSsoOptional] = useState(false);

  const finishLogin = async () => {
    await queryClient.resetQueries({ queryKey: getMeQueryKey() });
    if (invite) {
      navigate({ to: INVITE_ROUTE, search: { token: invite } });
      return;
    }
    if (nextUrl) {
      navigate({ to: nextUrl });
      return;
    }
    // Land returning users on the org they last opened; first-timers get the picker.
    const me = await queryClient.ensureQueryData(meQueryOptions());
    if (me?.user?.lastOrgId) {
      navigate({ to: ORG_PROJECTS_ROUTE, params: { orgId: me.user.lastOrgId } });
    } else {
      navigate({ to: ORGS_ROUTE });
    }
  };

  // Step 1 → decide SSO vs password for this email. On an SSO domain we leave the page
  // for the IdP (keep the spinner); otherwise we reveal the password field.
  const continueWithEmail = async () => {
    const e = email.trim();
    if (!isEmailish(e)) {
      setFormError('Enter a valid email address.');
      return;
    }
    setFormError(null);
    setCheckingSso(true);
    try {
      const res = await ssoDiscovery({ query: { email: e } });
      const data = res.data;
      // Enforced → SSO is the only way in for this domain; go straight to the IdP.
      if (data?.available && data.enforced) {
        openExternal(ssoStartUrl(e, postLogin));
        return;
      }
      // Available but optional → continue to the password step, but also offer SSO there.
      setSsoOptional(Boolean(data?.available));
    } catch {
      // Discovery failed → fall back to password login rather than blocking sign-in.
      setSsoOptional(false);
    }
    setCheckingSso(false);
    setStep('password');
  };

  const goToSso = () => {
    openExternal(ssoStartUrl(email.trim(), postLogin));
  };

  const passwordLogin = useMutation({
    mutationFn: async () =>
      (await login({ body: { email: email.trim(), password }, throwOnError: true })).data,
    onSuccess: async (result) => {
      if (result && 'twoFactorRequired' in result) {
        setChallengeToken(result.challengeToken);
        return;
      }
      await finishLogin();
    },
    onError: (err: unknown) => {
      setFormError(isApiError(err) ? err.error.message : 'Something went wrong. Please try again.');
    },
  });

  const backToEmail = () => {
    setStep('email');
    setPassword('');
    setSsoOptional(false);
    setFormError(null);
  };

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

        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        {step === 'email' ? (
          <EmailStep
            email={email}
            onEmailChange={setEmail}
            onContinue={continueWithEmail}
            loading={checkingSso}
          />
        ) : (
          <PasswordStep
            email={email}
            password={password}
            onPasswordChange={setPassword}
            onBack={backToEmail}
            onSubmit={() => {
              setFormError(null);
              passwordLogin.mutate();
            }}
            loading={passwordLogin.isPending}
            ssoAvailable={ssoOptional}
            onSso={goToSso}
          />
        )}

        <Text color="muted" align="center">
          New to Nijam?{' '}
          <Link
            to={SIGNUP_ROUTE}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </Text>
      </Flex>
    </AuthLayout>
  );
}

/** Step 1: just the email. Continue checks for SSO before asking for a password. */
function EmailStep({
  email,
  onEmailChange,
  onContinue,
  loading,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  onContinue: () => void;
  loading: boolean;
}) {
  return (
    <Flex
      as="form"
      direction="col"
      gap={4}
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <Flex direction="col" gap={1.5}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          data-testid="login-email"
        />
      </Flex>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={loading}
        data-testid="login-continue"
      >
        {loading ? 'Checking…' : 'Continue'}
      </Button>
    </Flex>
  );
}

/**
 * Step 2: the password field for the chosen email. When the domain has **optional**
 * SSO, a "Continue with SSO" button is shown above it so users keep both options (an
 * enforced domain never reaches this step, it's redirected straight to the IdP).
 */
function PasswordStep({
  email,
  password,
  onPasswordChange,
  onBack,
  onSubmit,
  loading,
  ssoAvailable,
  onSso,
}: {
  email: string;
  password: string;
  onPasswordChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  ssoAvailable: boolean;
  onSso: () => void;
}) {
  return (
    <Flex
      as="form"
      direction="col"
      gap={4}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Flex direction="col" gap={1.5}>
        <Flex align="center" justify="between">
          <Label htmlFor="email-display">Email</Label>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onBack}
          >
            Use a different email
          </Button>
        </Flex>
        <Input id="email-display" type="email" value={email} readOnly disabled />
      </Flex>

      {ssoAvailable && (
        <Flex direction="col" gap={4}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onSso}
            data-testid="login-sso"
          >
            Continue with SSO
          </Button>
          <Flex align="center" gap={3}>
            <div className="h-px flex-1 bg-border" />
            <Text as="span" className="text-xs text-muted-foreground">
              or use your password
            </Text>
            <div className="h-px flex-1 bg-border" />
          </Flex>
        </Flex>
      )}

      <Flex direction="col" gap={1.5}>
        <Flex align="center" justify="between">
          <Label htmlFor="password">Password</Label>
          <Link
            to={FORGOT_PASSWORD_ROUTE}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </Flex>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          data-testid="login-password"
        />
      </Flex>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={loading}
        disabled={password.length === 0}
        data-testid="login-submit"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </Flex>
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
          {useBackup ? (
            <Input
              id="totp-code"
              inputMode="text"
              autoComplete="one-time-code"
              autoFocus
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={error ? true : undefined}
              data-testid="login-2fa-code"
            />
          ) : (
            <OtpInput
              id="totp-code"
              autoFocus
              value={code}
              onChange={setCode}
              disabled={verify.isPending}
              aria-invalid={error ? true : undefined}
              onComplete={(v) => {
                setError(null);
                verify.mutate({ challengeToken, code: v });
              }}
            />
          )}
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
