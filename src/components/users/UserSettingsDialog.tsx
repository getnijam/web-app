import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { UserPublic } from '@/client';
import {
  getMeOptions,
  getMeQueryKey,
  updateMeMutation,
  uploadMyAvatarMutation,
  deleteMyAvatarMutation,
} from '@/client/@tanstack/react-query.gen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { LoadingState } from '@/components/states/LoadingState';
import { UserAvatar } from '@/components/users/UserAvatar';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const Schema = z.object({ name: z.string().max(80, 'Keep it under 80 characters.').optional() });
type FormValues = z.infer<typeof Schema>;

export function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User settings</DialogTitle>
          <DialogDescription>Update your display picture and name.</DialogDescription>
        </DialogHeader>
        {user ? (
          <UserSettingsForm key={user.id} user={user} onOpenChange={onOpenChange} />
        ) : (
          <LoadingState />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserSettingsForm({
  user,
  onOpenChange,
}: {
  user: UserPublic;
  onOpenChange: (open: boolean) => void;
}) {
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
      notify.success('Profile updated');
      onOpenChange(false);
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof FormValues, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  const uploadAvatar = useMutation({
    ...uploadMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture updated');
    },
    onError: (err) =>
      notify.error(isApiError(err) ? err.error.message : 'Could not upload your picture.'),
  });

  const removeAvatar = useMutation({
    ...deleteMyAvatarMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Picture removed');
    },
    onError: () => notify.error('Could not remove your picture.'),
  });

  return (
    <form
      id="user-settings-form"
      onSubmit={form.handleSubmit((data) => {
        setFormError(null);
        const name = data.name?.trim();
        save.mutate({ body: { name: name ? name : null } });
      })}
    >
      <Flex direction="col" gap={4}>
        {formError && <ErrorBanner>{formError}</ErrorBanner>}

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
          <Label htmlFor="user-name">Name</Label>
          <Input id="user-name" placeholder="Your name" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </Flex>

        <Flex direction="col" gap={1.5}>
          <Label htmlFor="user-email">Email</Label>
          <Input id="user-email" value={user.email} disabled readOnly />
          <Text variant="caption" color="muted">
            This is your sign-in email and can't be changed.
          </Text>
        </Flex>
      </Flex>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" form="user-settings-form" loading={save.isPending}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}
