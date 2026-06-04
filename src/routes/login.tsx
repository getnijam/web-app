import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { login } from '@/client';
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
      description: 'Sign in to Nijam to view your Playwright run history, flakiness, and traces.',
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

  const form = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const mutation = useMutation({
    mutationFn: (body: LoginForm) => login({ body, throwOnError: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      if (invite) navigate({ to: '/invite', search: { token: invite } });
      else navigate({ to: nextUrl ?? '/orgs' });
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
