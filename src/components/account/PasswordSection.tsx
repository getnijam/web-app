import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { UserPublic } from '@/client';
import { getMeQueryKey, updateMyPasswordMutation } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccountSection } from '@/components/account/AccountSection';
import { FieldError } from '@/components/auth/AuthLayout';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

function makeSchema(hasPassword: boolean) {
  return z
    .object({
      currentPassword: hasPassword
        ? z.string().min(1, 'Enter your current password.')
        : z.string().optional(),
      newPassword: z.string().min(8, 'At least 8 characters.'),
      confirm: z.string().min(1, 'Confirm your new password.'),
    })
    .refine((d) => d.newPassword === d.confirm, {
      path: ['confirm'],
      message: "Passwords don't match.",
    });
}
type FormValues = { currentPassword?: string; newPassword: string; confirm: string };

/** Set (OAuth-only accounts) or change the account password. */
export function PasswordSection({ user }: { user: UserPublic }) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(makeSchema(user.hasPassword)) });

  const save = useMutation({
    ...updateMyPasswordMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      form.reset({ currentPassword: '', newPassword: '', confirm: '' });
      notify.success(user.hasPassword ? 'Password changed' : 'Password set', {
        description: user.hasPassword
          ? 'Other sessions have been signed out.'
          : 'You can now also sign in with your email and password.',
      });
    },
    onError: (err) => {
      if (isApiError(err) && err.error.code === 'WRONG_PASSWORD') {
        form.setError('currentPassword', { message: err.error.message });
      } else {
        setFormError(isApiError(err) ? err.error.message : 'Something went wrong. Please try again.');
      }
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => {
        setFormError(null);
        save.mutate({
          body: {
            currentPassword: user.hasPassword ? data.currentPassword : undefined,
            newPassword: data.newPassword,
          },
        });
      })}
    >
      <AccountSection
        title="Password"
        description={
          user.hasPassword
            ? undefined
            : 'You sign in with Google or GitHub. Set a password to also sign in with your email.'
        }
        footer={
          <Button type="submit" size="sm" loading={save.isPending}>
            {user.hasPassword ? 'Change password' : 'Set password'}
          </Button>
        }
      >
        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        {user.hasPassword && (
          <Flex direction="col" gap={1.5}>
            <Label htmlFor="acct-current-pw">Current password</Label>
            <Input
              id="acct-current-pw"
              type="password"
              autoComplete="current-password"
              {...form.register('currentPassword')}
            />
            <FieldError message={form.formState.errors.currentPassword?.message} />
          </Flex>
        )}

        <Flex direction="col" gap={1.5}>
          <Label htmlFor="acct-new-pw">New password</Label>
          <Input
            id="acct-new-pw"
            type="password"
            autoComplete="new-password"
            {...form.register('newPassword')}
          />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </Flex>

        <Flex direction="col" gap={1.5}>
          <Label htmlFor="acct-confirm-pw">Confirm new password</Label>
          <Input
            id="acct-confirm-pw"
            type="password"
            autoComplete="new-password"
            {...form.register('confirm')}
          />
          <FieldError message={form.formState.errors.confirm?.message} />
        </Flex>
      </AccountSection>
    </form>
  );
}
