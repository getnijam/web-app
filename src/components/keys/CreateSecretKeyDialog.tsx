import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Building03Icon,
  Layers01Icon,
  Tick02Icon,
  Copy01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import type { SecretKeyCreatedResponse } from '@/client';
import {
  listOrgProjectsOptions,
  listSecretKeysQueryKey,
  createSecretKeyMutation,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { isApiError } from '@/lib/api-error';
import { repoFromUrl } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ScopeTag, ProjectGlyphMini } from './ScopeTag';

const CreateSchema = z.object({
  name: z.string().min(1, 'Enter a name for this key.').max(80),
});
type CreateForm = z.infer<typeof CreateSchema>;
type Scope = 'org' | 'project';
type Kind = 'ingest' | 'read';

/** One of the two scope choices (Organization / Single project). */
function ScopeCard({
  selected,
  disabled,
  icon,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  disabled?: boolean;
  icon: typeof Building03Icon;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <Button
      variant="ghost"
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'relative h-auto w-full flex-col items-start justify-start gap-1.5 rounded-xl border p-3.5 text-left',
        selected
          ? 'border-primary bg-primary/8 ring-1 ring-primary hover:bg-primary/8'
          : 'border-border hover:border-primary/40 hover:bg-accent',
      )}
    >
      {selected && (
        <Flex
          align="center"
          justify="center"
          className="absolute top-2.5 right-2.5 size-4 rounded-full bg-primary text-primary-foreground"
        >
          <HugeiconsIcon icon={Tick02Icon} size={11} strokeWidth={2.5} />
        </Flex>
      )}
      <HugeiconsIcon
        icon={icon}
        size={20}
        strokeWidth={1.8}
        className={selected ? 'text-primary' : 'text-muted-foreground'}
      />
      <Text as="span" weight="semibold" className="text-sm">
        {title}
      </Text>
      <Text as="span" className="text-xs text-wrap text-muted-foreground">
        {description}
      </Text>
    </Button>
  );
}

export function CreateSecretKeyDialog({
  open,
  onOpenChange,
  orgId,
  kind,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  /** Pre-bound by the section whose Create button opened the dialog. */
  kind: Kind;
}) {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery(listOrgProjectsOptions({ path: { orgId } }));
  const projects = projectsQuery.data?.projects ?? [];

  const [step, setStep] = useState<'form' | 'reveal'>('form');
  const [created, setCreated] = useState<SecretKeyCreatedResponse | null>(null);
  const [scope, setScope] = useState<Scope>('org');
  const [projectId, setProjectId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateForm>({
    resolver: zodResolver(CreateSchema),
    defaultValues: { name: '' },
  });
  const name = form.watch('name');

  function reset() {
    form.reset({ name: '' });
    setStep('form');
    setCreated(null);
    setScope('org');
    setProjectId('');
    setCopied(false);
    setFormError(null);
  }
  function close() {
    reset();
    onOpenChange(false);
  }

  const mutation = useMutation({
    ...createSecretKeyMutation(),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: listSecretKeysQueryKey({ path: { orgId } }),
      });
      setCreated(res);
      setStep('reveal');
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError('name', { message: err.error.message });
      } else {
        setFormError(
          isApiError(err) ? err.error.message : 'Could not create the key. Please try again.',
        );
      }
    },
  });

  const canSubmit = !!name.trim() && (kind === 'read' || scope === 'org' || !!projectId);

  function selectProjectScope() {
    setScope('project');
    if (!projectId && projects[0]) setProjectId(projects[0].id);
  }

  function copyToken() {
    if (!created) return;
    navigator.clipboard.writeText(created.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-xl">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {kind === 'ingest' ? 'Create ingestion key' : 'Create read key (MCP)'}
              </DialogTitle>
              <DialogDescription>
                {kind === 'ingest'
                  ? 'Used by your CI to upload test results and traces. Can never read data.'
                  : 'Used by MCP agents to read your test data. Read-only, always org-wide.'}
              </DialogDescription>
            </DialogHeader>

            <Flex
              as="form"
              id="create-key-form"
              direction="col"
              gap={4}
              onSubmit={form.handleSubmit((data) => {
                setFormError(null);
                mutation.mutate({
                  path: { orgId },
                  body: {
                    name: data.name,
                    scope: kind === 'read' ? 'org' : scope,
                    kind,
                    ...(kind === 'ingest' && scope === 'project' ? { projectId } : {}),
                  },
                });
              })}
            >
              {formError && <ErrorBanner>{formError}</ErrorBanner>}

              <Flex direction="col" gap={1.5}>
                <Label htmlFor="key-name">
                  Key name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="key-name"
                  autoFocus
                  placeholder="e.g. GitHub Actions · CI"
                  {...form.register('name')}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </Flex>

              {kind === 'ingest' ? (
                <Flex direction="col" gap={2}>
                  <Label>Scope</Label>
                  <Grid cols={2} gap={3}>
                    <ScopeCard
                      selected={scope === 'org'}
                      icon={Building03Icon}
                      title="Organization"
                      description="Every project in the org."
                      onSelect={() => setScope('org')}
                    />
                    <ScopeCard
                      selected={scope === 'project'}
                      disabled={projects.length === 0}
                      icon={Layers01Icon}
                      title="Single project"
                      description="Exactly one project."
                      onSelect={selectProjectScope}
                    />
                  </Grid>
                  {projects.length === 0 && (
                    <Text as="span" className="text-xs text-muted-foreground">
                      Create a project first to scope a key to it.
                    </Text>
                  )}
                </Flex>
              ) : (
                <Text as="span" className="text-xs text-muted-foreground">
                  Read keys always cover every project in the organization, so agents can resolve
                  "my project" on their own.
                </Text>
              )}

              {scope === 'project' && (
                <Flex direction="col" gap={1.5}>
                  <Label htmlFor="key-project">Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="key-project" className="w-full">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => {
                        const repo = repoFromUrl(p.repositoryUrl);
                        return (
                          <SelectItem key={p.id} value={p.id} textValue={p.name}>
                            <Flex align="center" gap={2}>
                              <ProjectGlyphMini project={p} />
                              <Text as="span" weight="medium" className="text-sm">
                                {p.name}
                              </Text>
                              {repo && (
                                <Text as="span" className="font-mono text-xs text-muted-foreground">
                                  {repo}
                                </Text>
                              )}
                            </Flex>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </Flex>
              )}
            </Flex>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="create-key-form"
                loading={mutation.isPending}
                disabled={!canSubmit}
              >
                Create key
              </Button>
            </DialogFooter>
          </>
        ) : (
          created && (
            <>
              <DialogHeader>
                <DialogTitle>Secret key created</DialogTitle>
                <DialogDescription>
                  Copy it now — for your security it won't be shown again.
                </DialogDescription>
              </DialogHeader>

              <Flex direction="col" gap={4}>
                <Flex direction="col" gap={1.5}>
                  <Label>Your new secret key</Label>
                  <Flex gap={2}>
                    <Input readOnly value={created.token} className="font-mono" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyToken}
                      className="shrink-0"
                    >
                      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={15} />
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </Flex>
                </Flex>

                <Flex
                  align="start"
                  gap={2.5}
                  className="rounded-xl border border-warning/30 bg-warning/8 p-3.5"
                >
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    size={18}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-warning"
                  />
                  <Text as="span" className="text-sm text-muted-foreground">
                    {created.kind === 'ingest'
                      ? "Store this key in your CI provider's secrets."
                      : "Store this key in your MCP client's config or a secret manager."}{' '}
                    Nijam keeps only a hashed fingerprint and can't recover the value.
                  </Text>
                </Flex>

                <Flex direction="col" gap={2} className="rounded-xl border border-border p-3.5">
                  <Flex align="center" justify="between" gap={3}>
                    <Text as="span" className="text-sm text-muted-foreground">
                      Name
                    </Text>
                    <Text as="span" truncate weight="medium" className="text-sm">
                      {created.name}
                    </Text>
                  </Flex>
                  <Flex align="center" justify="between" gap={3}>
                    <Text as="span" className="text-sm text-muted-foreground">
                      Type
                    </Text>
                    <Text as="span" weight="medium" className="text-sm">
                      {created.kind === 'ingest' ? 'Ingestion (write-only)' : 'Read (MCP)'}
                    </Text>
                  </Flex>
                  <Flex align="center" justify="between" gap={3}>
                    <Text as="span" className="text-sm text-muted-foreground">
                      Scope
                    </Text>
                    <ScopeTag scope={created.scope} project={created.project} />
                  </Flex>
                </Flex>
              </Flex>

              <DialogFooter>
                <Button type="button" onClick={close}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
