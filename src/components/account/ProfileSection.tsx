import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { UserPublic } from '@/client';
import {
  getMeQueryKey,
  updateMeMutation,
  uploadMyAvatarMutation,
  deleteMyAvatarMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/users/UserAvatar';
import { AccountSection } from '@/components/account/AccountSection';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { FieldError } from '@/components/auth/AuthLayout';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const Schema = z.object({ name: z.string().max(80, 'Keep it under 80 characters.').optional() });
type FormValues = z.infer<typeof Schema>;

/** Profile: display picture, name, and the (read-only) sign-in email. */
export function ProfileSection({ user }: { user: UserPublic }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { editing, startEditing, stopEditing } = useEditMode();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: user.name ?? '' },
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getMeQueryKey() });

  const save = useMutation({
    ...updateMeMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Profile updated', { description: 'Your changes have been saved.' });
      form.reset(form.getValues()); // saved values become the new clean baseline
      stopEditing();
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof FormValues, { message: err.error.message });
      } else {
        setFormError(
          isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
        );
      }
    },
  });

  const uploadAvatar = useMutation({
    ...uploadMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture updated', {
        description: 'Your new picture is visible across Nijam.',
      });
    },
    onError: (err) =>
      notify.error("Couldn't update picture", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const removeAvatar = useMutation({
    ...deleteMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture removed', { description: 'Your profile picture has been removed.' });
    },
    onError: () =>
      notify.error("Couldn't remove picture", {
        description: 'Something went wrong. Please try again.',
      }),
  });

  const submit = form.handleSubmit((data) => {
    setFormError(null);
    const name = data.name?.trim();
    save.mutate({ body: { name: name ? name : null } });
  });

  const cancel = () => {
    form.reset();
    setFormError(null);
    stopEditing();
  };

  return (
    <form onSubmit={submit}>
      <AccountSection
        title="Profile"
        action={
          <EditActions
            editing={editing}
            dirty={form.formState.isDirty}
            saving={save.isPending}
            onEdit={startEditing}
            onCancel={cancel}
            onSave={submit}
          />
        }
      >
        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        <LockedFields locked={!editing}>
          <Flex align="center" gap={4}>
            <UserAvatar
              size="lg"
              userId={user.id}
              email={user.email}
              name={user.name}
              hasAvatar={user.hasAvatar}
              avatarUpdatedAt={user.avatarUpdatedAt}
            />
            <Flex direction="col" gap={2} align="start">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar.mutate({ body: { file } });
                  e.target.value = '';
                }}
              />
              <Flex gap={2}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={uploadAvatar.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload picture
                </Button>
                {user.hasAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={removeAvatar.isPending}
                    onClick={() => removeAvatar.mutate({})}
                  >
                    Remove
                  </Button>
                )}
              </Flex>
              <Text variant="caption" color="muted">
                PNG, JPEG, or WebP. Max 2 MB.
              </Text>
            </Flex>
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="acct-name">Name</Label>
            <Input id="acct-name" placeholder="Your name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </Flex>
        </LockedFields>

        <Flex direction="col" gap={1.5}>
          <Label htmlFor="acct-email">Email</Label>
          <Input id="acct-email" value={user.email} disabled readOnly />
          <Text variant="caption" color="muted">
            Your sign-in email. It can't be changed.
          </Text>
        </Flex>
      </AccountSection>
    </form>
  );
}
