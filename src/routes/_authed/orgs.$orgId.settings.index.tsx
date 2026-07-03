import { useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ORGS_ROUTE } from '@/lib/routes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { OrgResponse } from '@/client';
import {
  getOrgOptions,
  getOrgQueryKey,
  listOrgsQueryKey,
  updateOrgMutation,
  uploadOrgLogoMutation,
  deleteOrgLogoMutation,
  deleteOrgMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState, ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { TransferAdminControl } from '@/components/orgs/TransferAdminControl';
import { ConfirmDeleteDialog } from '@/components/settings/ConfirmDeleteDialog';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/settings/')({
  head: () => privateSeo('Organization settings'),
  component: OrgSettingsPage,
});

const Schema = z.object({
  name: z.string().min(1, 'Enter an organization name.').max(120),
  description: z.string().max(2000).optional(),
  website: z.string().max(500).optional(),
  contactEmail: z.string().max(320).optional(),
});
type FormValues = z.infer<typeof Schema>;

function OrgSettingsPage() {
  const { orgId } = Route.useParams();
  const { data: org, isLoading, error, refetch } = useQuery(getOrgOptions({ path: { orgId } }));

  if (isLoading) return <LoadingState />;
  if (error || !org) return <ErrorState error={error} onRetry={() => refetch()} />;
  return <OrgSettingsForm orgId={orgId} org={org} />;
}

function OrgSettingsForm({ orgId, org }: { orgId: string; org: OrgResponse }) {
  const isAdmin = org.role === 'admin';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { editing, startEditing, stopEditing } = useEditMode();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: org.name,
      description: org.description ?? '',
      website: org.website ?? '',
      contactEmail: org.contactEmail ?? '',
    },
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: getOrgQueryKey({ path: { orgId } }) });
    await queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() });
  };

  const save = useMutation({
    ...updateOrgMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Organization settings saved', {
        description: `Your changes to ${org.name} have been saved.`,
      });
      form.reset(form.getValues()); // saved values become the new clean baseline
      stopEditing();
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

  const uploadLogo = useMutation({
    ...uploadOrgLogoMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Logo updated', {
        description: `${org.name}'s new logo is now live across Nijam.`,
      });
    },
    onError: (err) =>
      notify.error("Couldn't update logo", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const removeLogo = useMutation({
    ...deleteOrgLogoMutation(),
    onSuccess: async () => {
      await invalidate();
      notify.success('Logo removed', {
        description: `${org.name}'s logo has been removed.`,
      });
    },
    onError: () =>
      notify.error("Couldn't remove logo", {
        description: 'Something went wrong. Please try again.',
      }),
  });

  const deleteOrg = useMutation({
    ...deleteOrgMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() });
      setDeleteOpen(false);
      notify.success('Organization deleted', {
        description: `${org.name} and all of its data have been permanently removed.`,
      });
      navigate({ to: ORGS_ROUTE });
    },
    onError: (err) => {
      setDeleteOpen(false);
      notify.error("Couldn't delete organization", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  const submit = form.handleSubmit((data) => {
    setFormError(null);
    save.mutate({ path: { orgId }, body: data });
  });

  const cancel = () => {
    form.reset();
    setFormError(null);
    stopEditing();
  };

  return (
    <Flex direction="col" gap={6}>
      {!isAdmin && (
        <Text color="muted" className="text-sm">
          Only admins can edit organization settings.
        </Text>
      )}

      <form onSubmit={submit}>
        <SettingsPanel
          title="General"
          action={
            isAdmin ? (
              <EditActions
                editing={editing}
                dirty={form.formState.isDirty}
                saving={save.isPending}
                onEdit={startEditing}
                onCancel={cancel}
                onSave={submit}
              />
            ) : undefined
          }
        >
          {formError && (
            <div className="px-5 pt-4">
              <ErrorBanner>{formError}</ErrorBanner>
            </div>
          )}

          <LockedFields locked={!editing}>
            <SettingsRow label="Logo" hint="Shown on reports and shared links.">
              <Flex align="center" gap={4} className="w-full">
                <OrgAvatar org={org} size="lg" />
                <Flex direction="col" gap={2} align="start">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogo.mutate({ path: { orgId }, body: { file } });
                      e.target.value = '';
                    }}
                  />
                  {isAdmin && (
                    <Flex gap={2}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={uploadLogo.isPending}
                        onClick={() => fileRef.current?.click()}
                      >
                        Upload logo
                      </Button>
                      {org.hasLogo && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={removeLogo.isPending}
                          onClick={() => removeLogo.mutate({ path: { orgId } })}
                        >
                          Remove
                        </Button>
                      )}
                    </Flex>
                  )}
                  {isAdmin && (
                    <Text variant="caption" color="muted">
                      PNG, JPEG, or WebP. Max 2 MB.
                    </Text>
                  )}
                </Flex>
              </Flex>
            </SettingsRow>

            <SettingsRow label="Organization name">
              <Input {...form.register('name')} />
              <FieldError message={form.formState.errors.name?.message} />
            </SettingsRow>
            <SettingsRow label="Description">
              <Textarea
                rows={3}
                placeholder="What does this team work on?"
                {...form.register('description')}
              />
            </SettingsRow>
            <SettingsRow label="Website">
              <Input placeholder="https://" {...form.register('website')} />
            </SettingsRow>
            <SettingsRow label="Contact email">
              <Input placeholder="team@company.com" {...form.register('contactEmail')} />
            </SettingsRow>
          </LockedFields>
        </SettingsPanel>
      </form>

      {isAdmin && (
        <SettingsPanel title="Danger zone" danger>
          <SettingsRow
            label="Transfer admin"
            hint="Make another member an admin so you can hand off or leave this organization."
          >
            <TransferAdminControl orgId={orgId} />
          </SettingsRow>
          <SettingsRow
            label="Delete organization"
            hint="Permanently deletes this organization, its members, invitations, and logo. Delete all of its projects first."
          >
            <Flex>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                data-testid="delete-org-trigger"
              >
                Delete organization
              </Button>
            </Flex>
          </SettingsRow>
        </SettingsPanel>
      )}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this organization?"
        description={
          <>
            {org.name}, along with its members, invitations, and logo, will be permanently deleted.
            This can&rsquo;t be undone. Delete all of its projects first.
          </>
        }
        confirmText={org.name}
        confirmLabel="Delete organization"
        loading={deleteOrg.isPending}
        onConfirm={() => deleteOrg.mutate({ path: { orgId } })}
        testId="delete-org"
      />
    </Flex>
  );
}
