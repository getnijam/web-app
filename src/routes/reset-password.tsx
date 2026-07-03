import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FORGOT_PASSWORD_ROUTE, LOGIN_ROUTE } from '@/lib/routes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { resetPasswordMutation } from '@/client/@tanstack/react-query.gen';
import { AuthLayout, AuthHeading, FieldError } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flex } from '@/components/ui/flex';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard } from '@/lib/auth-redirect';
import { seo } from '@/lib/seo';

const ResetSearch = z.object({ token: z.string().optional() });

export const Route = createFileRoute('/reset-password')({
  // Client-rendered auth/utility form: beforeLoad (redirect-if-authed) runs in the
  // browser with the session cookie, and these are forms with no SEO value.
  ssr: false,
  head: () => seo({ title: 'Set a new password', path: '/reset-password', noindex: true }),
  beforeLoad: ({ context }) => redirectAuthedToDashboard(context.queryClient),
  validateSearch: ResetSearch,
  component: ResetPasswordPage,
});

const ResetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
    confirm: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });
type ResetForm = z.infer<typeof ResetSchema>;

// Token-specific failures send the user back to request a fresh link.
const TOKEN_ERROR_CODES = ['RESET_TOKEN_INVALID', 'RESET_TOKEN_EXPIRED', 'RESET_TOKEN_USED'];

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const form = useForm<ResetForm>({ resolver: zodResolver(ResetSchema) });

  const mutation = useMutation({
    ...resetPasswordMutation(),
    onSuccess: () => setDone(true),
    onError: (err) => {
      if (isApiError(err) && TOKEN_ERROR_CODES.includes(err.error.code)) {
        setTokenError(err.error.message);
      } else if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof ResetForm, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  // Missing token, or the token was rejected on submit → dead end, request a new link.
  if (!token || tokenError) {
    return (
      <AuthLayout>
        <Flex direction="col" gap={6}>
          <Flex
            align="center"
            justify="center"
            className="h-11 w-11 rounded-full bg-destructive/10 text-destructive"
          >
            <XCircle className="h-5 w-5" />
          </Flex>
          <AuthHeading
            title="Invalid reset link"
            description={
              tokenError ??
              'This password reset link is missing or invalid. Request a new one to continue.'
            }
          />
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to={FORGOT_PASSWORD_ROUTE}>Request a new link</Link>
          </Button>
        </Flex>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <Flex direction="col" gap={6}>
          <Flex
            align="center"
            justify="center"
            className="h-11 w-11 rounded-full bg-primary/10 text-primary"
          >
            <CheckCircle2 className="h-5 w-5" />
          </Flex>
          <AuthHeading
            title="Password updated"
            description="Your password has been reset. You can sign in with your new password now."
          />
          <Button asChild size="lg" className="w-full">
            <Link to={LOGIN_ROUTE}>Continue to sign in</Link>
          </Button>
        </Flex>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        <AuthHeading
          title="Set a new password"
          description="Choose a strong password for your account."
        />

        <Flex
          as="form"
          direction="col"
          gap={4}
          onSubmit={form.handleSubmit((data) => {
            setFormError(null);
            mutation.mutate({ body: { token: token ?? '', password: data.password } });
          })}
        >
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...form.register('confirm')}
            />
            <FieldError message={form.formState.errors.confirm?.message} />
          </Flex>

          <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
            Update password
          </Button>
        </Flex>
      </Flex>
    </AuthLayout>
  );
}
