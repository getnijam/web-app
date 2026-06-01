import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { z } from 'zod';
import { forgotPassword } from '@/client';
import { AuthLayout, AuthHeading, FieldError } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard } from '@/lib/auth-redirect';

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({ context }) => redirectAuthedToDashboard(context.queryClient),
  component: ForgotPasswordPage,
});

const ForgotSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});
type ForgotForm = z.infer<typeof ForgotSchema>;

function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ForgotForm>({ resolver: zodResolver(ForgotSchema) });

  const mutation = useMutation({
    mutationFn: (body: ForgotForm) => forgotPassword({ body, throwOnError: true }),
    // The endpoint returns 204 for both existing and unknown emails (no account
    // enumeration), so only show the neutral confirmation on actual success.
    // Genuine failures (network, rate-limit, server) surface as an error instead.
    onSuccess: (_data, variables) => setSubmittedEmail(variables.email),
    onError: (err: unknown) =>
      setFormError(isApiError(err) ? err.error.message : 'Something went wrong. Please try again.'),
  });

  if (submittedEmail) {
    return (
      <AuthLayout>
        <Flex direction="col" gap={6}>
          <Flex
            align="center"
            justify="center"
            className="h-11 w-11 rounded-full bg-primary/10 text-primary"
          >
            <MailCheck className="h-5 w-5" />
          </Flex>
          <AuthHeading
            title="Check your inbox"
            description={
              <>
                If an account exists for{' '}
                <Text as="span" weight="medium" color="default">
                  {submittedEmail}
                </Text>
                , we’ve sent a link to reset your password.
              </>
            }
          />
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </Flex>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        <AuthHeading
          title="Reset your password"
          description="Enter your email and we’ll send you a link to reset it."
        />

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
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </Flex>

          <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
            Send reset link
          </Button>
        </Flex>

        <Text color="muted" align="center">
          Remembered it?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </Text>
      </Flex>
    </AuthLayout>
  );
}
