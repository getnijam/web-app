import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockPasswordIcon, CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/core-free-icons';
import type { UserPublic } from '@/client';
import { getMeQueryKey, updateMyPasswordMutation } from '@/client/@tanstack/react-query.gen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { AccountSection } from '@/components/account/AccountSection';
import { FieldError } from '@/components/auth/AuthLayout';
import { ErrorBanner } from '@/components/states/ErrorState';
import { track } from '@/lib/betterstack';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

/** Set (OAuth-only accounts) or change the account password. */
export function PasswordSection({ user }: { user: UserPublic }) {
  const [open, setOpen] = useState(false);

  return (
    <AccountSection title="Password">
      <Flex align="start" gap={3} className="sm:items-center">
        <HugeiconsIcon
          icon={LockPasswordIcon}
          size={20}
          className="mt-0.5 shrink-0 text-muted-foreground sm:mt-0"
        />
        <Flex
          direction="col"
          gap={2}
          className="min-w-0 flex-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <Flex direction="col" className="min-w-0 flex-1">
            {/* Badge: pushed right on mobile, tucked beside the title on desktop. */}
            <Flex align="center" gap={2} className="justify-between sm:justify-start">
              <Text as="span" className="min-w-0 truncate text-sm font-medium">
                Password
              </Text>
              {user.hasPassword ? (
                <StatusBadge icon={CheckmarkCircle02Icon} label="Set" tone="success" />
              ) : (
                <StatusBadge icon={CircleIcon} label="Not set" variant="outline" />
              )}
            </Flex>
            <Text as="span" className="pt-1.5 text-xs text-muted-foreground sm:pt-0">
              {user.hasPassword
                ? 'Use your email and a password to sign in.'
                : 'You sign in with Google or GitHub. Set a password to also sign in with your email.'}
            </Text>
          </Flex>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            onClick={() => setOpen(true)}
          >
            {user.hasPassword ? 'Change' : 'Set password'}
          </Button>
        </Flex>
      </Flex>

      <PasswordDialog user={user} open={open} onOpenChange={setOpen} />
    </AccountSection>
  );
}

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

/** Dialog holding the set/change password form, opened from the summary row. */
function PasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(makeSchema(user.hasPassword)) });

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      form.reset({ currentPassword: '', newPassword: '', confirm: '' });
      setFormError(null);
    }
  };

  const save = useMutation({
    ...updateMyPasswordMutation(),
    onSuccess: async () => {
      track('password_changed', { was_set: user.hasPassword });
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      close(false);
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
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user.hasPassword ? 'Change password' : 'Set a password'}</DialogTitle>
          <DialogDescription>
            {user.hasPassword
              ? 'Choose a new password. Other sessions will be signed out.'
              : 'Add a password so you can also sign in with your email.'}
          </DialogDescription>
        </DialogHeader>

        <Flex
          as="form"
          direction="col"
          gap={4}
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
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          {user.hasPassword && (
            <Flex direction="col" gap={1.5}>
              <Label htmlFor="acct-current-pw">Current password</Label>
              <Input
                id="acct-current-pw"
                type="password"
                autoComplete="current-password"
                autoFocus
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

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending}>
              {user.hasPassword ? 'Change password' : 'Set password'}
            </Button>
          </DialogFooter>
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
