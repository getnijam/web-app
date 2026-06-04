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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/users/UserAvatar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { FieldError } from '@/components/auth/AuthLayout';
import { ErrorBanner } from '@/components/states/ErrorState';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const Schema = z.object({ name: z.string().max(80, 'Keep it under 80 characters.').optional() });
type FormValues = z.infer<typeof Schema>;

/** Profile panel: display picture, name, and the (read-only) sign-in email. */
export function ProfileSection({ user }: { user: UserPublic }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
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
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof FormValues, { message: err.error.message });
      } else {
        setFormError(isApiError(err) ? err.error.message : 'Something went wrong. Please try again.');
      }
    },
  });

  const uploadAvatar = useMutation({
    ...uploadMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture updated', { description: 'Your new picture is visible across Nijam.' });
    },
    onError: (err) =>
      notify.error("Couldn't update picture", {
        description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
      }),
  });

  const removeAvatar = useMutation({
    ...deleteMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture removed', { description: 'Your profile picture has been removed.' });
    },
    onError: () =>
      notify.error("Couldn't remove picture", { description: 'Something went wrong. Please try again.' }),
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => {
        setFormError(null);
        const name = data.name?.trim();
        save.mutate({ body: { name: name ? name : null } });
      })}
    >
      <SettingsPanel
        title="Profile"
        footer={
          <Button type="submit" loading={save.isPending}>
            Save changes
          </Button>
        }
      >
        {formError && (
          <div className="px-5 pt-4">
            <ErrorBanner>{formError}</ErrorBanner>
          </div>
        )}

        <SettingsRow label="Picture" hint="Shown across Nijam. PNG, JPEG, or WebP, max 2 MB.">
          <Flex align="center" gap={4} className="w-full md:justify-end">
            <UserAvatar
              size="lg"
              userId={user.id}
              email={user.email}
              name={user.name}
              hasAvatar={user.hasAvatar}
              avatarUpdatedAt={user.avatarUpdatedAt}
            />
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
                Upload
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
          </Flex>
        </SettingsRow>

        <SettingsRow label="Name">
          <Input placeholder="Your name" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </SettingsRow>

        <SettingsRow label="Email" hint="Your sign-in email. It can't be changed.">
          <Input value={user.email} disabled readOnly />
        </SettingsRow>
      </SettingsPanel>
    </form>
  );
}
