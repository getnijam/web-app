import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { UserPublic } from '@/client';
import { getMeQueryKey, updateMyPasswordMutation } from '@/client/@tanstack/react-query.gen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
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
      <SettingsPanel
        title="Password"
        footer={
          <Button type="submit" loading={save.isPending}>
            {user.hasPassword ? 'Change password' : 'Set password'}
          </Button>
        }
      >
        {formError && (
          <div className="px-5 pt-4">
            <ErrorBanner>{formError}</ErrorBanner>
          </div>
        )}

        {!user.hasPassword && (
          <div className="px-5 pt-4">
            <Text className="text-sm text-muted-foreground">
              You sign in with Google or GitHub. Set a password to also sign in with your email.
            </Text>
          </div>
        )}

        {user.hasPassword && (
          <SettingsRow label="Current password">
            <Input type="password" autoComplete="current-password" {...form.register('currentPassword')} />
            <FieldError message={form.formState.errors.currentPassword?.message} />
          </SettingsRow>
        )}

        <SettingsRow label="New password">
          <Input type="password" autoComplete="new-password" {...form.register('newPassword')} />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </SettingsRow>

        <SettingsRow label="Confirm new password">
          <Input type="password" autoComplete="new-password" {...form.register('confirm')} />
          <FieldError message={form.formState.errors.confirm?.message} />
        </SettingsRow>
      </SettingsPanel>
    </form>
  );
}
