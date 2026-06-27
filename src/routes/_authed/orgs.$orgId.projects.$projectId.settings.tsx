import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { ProjectSummary } from '@/client';
import {
  getProjectOptions,
  getProjectQueryKey,
  listOrgProjectsQueryKey,
  updateProjectMutation,
  deleteProjectMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CopyField } from '@/components/ui/copy-field';
import { ConfirmDeleteDialog } from '@/components/settings/ConfirmDeleteDialog';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState, ErrorBanner } from '@/components/states/ErrorState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { FieldError } from '@/components/auth/AuthLayout';
import { GlyphPicker } from '@/components/projects/GlyphPicker';
import { FRAMEWORK_LABELS, type TestFramework } from '@/lib/test-framework';
import { FrameworkLogo } from '@/components/projects/framework-logos';
import { ProjectSlackSettings } from '@/components/integrations/ProjectSlackSettings';
import { ProjectGitHubSettings } from '@/components/integrations/ProjectGitHubSettings';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { ALL_ICON_KEYS, COLOR_KEYS, type IconKey, type ColorKey } from '@/lib/project-glyph';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/settings')({
  head: () => privateSeo('Project settings'),
  component: ProjectSettingsPage,
});

const Schema = z.object({
  name: z.string().min(1, 'Enter a project name.').max(80),
  description: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof Schema>;

const toIconKey = (v: string | null): IconKey =>
  (ALL_ICON_KEYS as readonly string[]).includes(v ?? '') ? (v as IconKey) : 'design';
const toColorKey = (v: string | null): ColorKey =>
  (COLOR_KEYS as readonly string[]).includes(v ?? '') ? (v as ColorKey) : 'emerald';

function ProjectSettingsPage() {
  const { projectId } = Route.useParams();
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery(getProjectOptions({ path: { id: projectId } }));

  if (isLoading) return <LoadingState />;
  if (error || !project) return <ErrorState error={error} onRetry={() => refetch()} />;
  return <ProjectSettingsForm key={project.id} project={project} />;
}

function ProjectSettingsForm({ project }: { project: ProjectSummary }) {
  const { orgId } = Route.useParams();
  const isAdmin = useIsOrgAdmin(orgId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { editing, startEditing, stopEditing } = useEditMode();
  const [formError, setFormError] = useState<string | null>(null);
  const [icon, setIcon] = useState<IconKey>(toIconKey(project.icon));
  const [color, setColor] = useState<ColorKey>(toColorKey(project.color));
  const [confirmOpen, setConfirmOpen] = useState(false);
  // null = legacy project → treat as Playwright. Immutable, so derived not stateful.
  const framework = (project.testFramework ?? 'playwright') as TestFramework;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
    },
  });

  const save = useMutation({
    ...updateProjectMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getProjectQueryKey({ path: { id: project.id } }),
      });
      await queryClient.invalidateQueries({
        queryKey: listOrgProjectsQueryKey({ path: { orgId } }),
      });
      notify.success('Project settings saved', {
        description: `Your changes to ${project.name} have been saved.`,
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

  const remove = useMutation({
    ...deleteProjectMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listOrgProjectsQueryKey({ path: { orgId } }),
      });
      setConfirmOpen(false);
      notify.success('Project removed', {
        description: `${project.name} and all of its runs have been permanently deleted.`,
      });
      navigate({ to: '/orgs/$orgId/projects', params: { orgId } });
    },
    onError: () => {
      setConfirmOpen(false);
      notify.error("Couldn't remove project", {
        description: 'Something went wrong. Please try again.',
      });
    },
  });

  const submit = form.handleSubmit((data) => {
    setFormError(null);
    save.mutate({
      path: { id: project.id },
      body: { name: data.name, description: data.description, icon, color },
    });
  });

  const cancel = () => {
    form.reset();
    setIcon(toIconKey(project.icon));
    setColor(toColorKey(project.color));
    setFormError(null);
    stopEditing();
  };

  // Dirty if any RHF field changed or the icon/color picks differ from the saved
  // project (compared against live props, so it self-clears after a save refetch).
  const dirty =
    form.formState.isDirty ||
    icon !== toIconKey(project.icon) ||
    color !== toColorKey(project.color);

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Project settings</Text>
        <Text color="muted">Configure how this project's runs are displayed and ingested.</Text>
      </Flex>

      <form onSubmit={submit}>
        <SettingsPanel
          title="General"
          action={
            isAdmin ? (
              <EditActions
                editing={editing}
                dirty={dirty}
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
            <SettingsRow label="Icon" hint="Shown on the project card and sidebar.">
              <GlyphPicker
                icon={icon}
                color={color}
                framework={framework}
                onIconChange={setIcon}
                onColorChange={setColor}
                ringOffsetClass="ring-offset-card"
              />
            </SettingsRow>
            <SettingsRow label="Project name">
              <Input {...form.register('name')} />
              <FieldError message={form.formState.errors.name?.message} />
            </SettingsRow>
            <SettingsRow label="Description">
              <Textarea
                rows={3}
                placeholder="What does this suite cover?"
                {...form.register('description')}
              />
            </SettingsRow>
          </LockedFields>
          <SettingsRow
            label="Test framework"
            hint="Set when the project was created and can't be changed."
          >
            <Flex
              align="center"
              gap={2.5}
              className="h-9 w-full rounded-md border border-input bg-muted/40 px-3"
            >
              <FrameworkLogo framework={framework} size={18} />
              <Text as="span" className="text-sm">
                {FRAMEWORK_LABELS[framework]}
              </Text>
            </Flex>
          </SettingsRow>
          <SettingsRow
            label="Project ID"
            hint="Use this value as projectId in your reporter config."
          >
            <CopyField value={project.id} />
          </SettingsRow>
        </SettingsPanel>
      </form>

      <ProjectSlackSettings orgId={orgId} projectId={project.id} projectName={project.name} />

      <ProjectGitHubSettings orgId={orgId} projectId={project.id} projectName={project.name} />

      {isAdmin && (
        <>
          <SettingsPanel title="Danger zone" danger>
            <SettingsRow
              label="Remove project"
              hint="Permanently deletes this project and all its runs, executions, and artifacts (including stored files). This can't be undone."
            >
              <Flex>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  data-testid="delete-project-trigger"
                >
                  Remove project
                </Button>
              </Flex>
            </SettingsRow>
          </SettingsPanel>

          <ConfirmDeleteDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Remove this project?"
            description={
              <>
                {project.name} and all of its runs, executions, and artifacts, including files in
                storage, will be permanently deleted. This can&rsquo;t be undone.
              </>
            }
            confirmText={project.name}
            confirmLabel="Remove project"
            loading={remove.isPending}
            onConfirm={() => remove.mutate({ path: { id: project.id } })}
            testId="delete-project"
          />
        </>
      )}
    </Flex>
  );
}
