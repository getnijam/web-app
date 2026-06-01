import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { z } from 'zod';
import { signup } from '@/client';
import { AuthLayout, AuthHeading, FieldError } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard } from '@/lib/auth-redirect';

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => redirectAuthedToDashboard(context.queryClient),
  component: SignupPage,
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
});

const SignupSchema = z.object({
  name: z.string().min(1, 'Enter your name.').max(80).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
});
type SignupForm = z.infer<typeof SignupSchema>;

function SignupPage() {
  const { email: prefillEmail } = Route.useSearch();
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: prefillEmail ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (body: SignupForm) =>
      signup({
        body: { email: body.email, password: body.password, name: body.name || undefined },
        throwOnError: true,
      }),
    onSuccess: (_data, variables) => setSubmittedEmail(variables.email),
    onError: (err: unknown) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof SignupForm, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
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
                We sent a verification link to{' '}
                <Text as="span" weight="medium" color="default">
                  {submittedEmail}
                </Text>
                . Click it to finish setting up your account.
              </>
            }
          />
          <Text color="muted">
            Didn’t get it? Check spam, or{' '}
            <Link
              to="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              sign in
            </Link>{' '}
            to resend.
          </Text>
        </Flex>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        <AuthHeading
          title="Create your account"
          description="Start tracking your Playwright runs in minutes."
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </Flex>

          <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </Flex>

        <Text color="muted" align="center">
          Already have an account?{' '}
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
