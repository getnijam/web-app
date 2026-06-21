import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { listOrgProjectsQueryKey, createProjectMutation } from '@/client/@tanstack/react-query.gen';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { track } from '@/lib/betterstack';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { GlyphPicker } from '@/components/projects/GlyphPicker';
import { FrameworkPicker } from '@/components/projects/FrameworkPicker';
import { type TestFramework } from '@/lib/test-framework';
import { type IconKey, type ColorKey } from '@/lib/project-glyph';

const CreateSchema = z.object({
  name: z.string().min(1, 'Enter a project name.').max(80),
  description: z.string().max(500).optional(),
});
type CreateForm = z.infer<typeof CreateSchema>;

function blankToUndefined(v: string | undefined): string | undefined {
  return v && v.trim() ? v.trim() : undefined;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  orgId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  // Default the icon to the framework's glyph (framework defaults to playwright).
  const [icon, setIcon] = useState<IconKey>('playwright');
  const [color, setColor] = useState<ColorKey>('emerald');
  const [testFramework, setTestFramework] = useState<TestFramework>('playwright');
  const form = useForm<CreateForm>({
    resolver: zodResolver(CreateSchema),
  });
  const name = form.watch('name');

  // Switching framework re-defaults the project icon to that framework's glyph (the
  // user can still pick a different icon afterward).
  function changeFramework(next: TestFramework) {
    setTestFramework(next);
    setIcon(next);
  }

  function close() {
    form.reset();
    setIcon('playwright');
    setColor('emerald');
    setTestFramework('playwright');
    setFormError(null);
    onOpenChange(false);
  }

  const mutation = useMutation({
    ...createProjectMutation(),
    onSuccess: async (project) => {
      track('project_created');
      await queryClient.invalidateQueries({
        queryKey: listOrgProjectsQueryKey({ path: { orgId } }),
      });
      close();
      notify.success(`Project "${project.name}" created`, {
        description: 'Point the reporter at it and run your tests — runs will show up here.',
      });
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof CreateForm, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Connect a test suite reported by your CI provider.</DialogDescription>
        </DialogHeader>

        <Flex
          as="form"
          id="new-project-form"
          direction="col"
          gap={4}
          onSubmit={form.handleSubmit((data) => {
            setFormError(null);
            mutation.mutate({
              path: { orgId },
              body: {
                name: data.name,
                description: blankToUndefined(data.description),
                icon,
                color,
                testFramework,
              },
            });
          })}
        >
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="np-name">
              Project name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="np-name"
              autoFocus
              placeholder="e.g. web-checkout"
              data-testid="create-project-name"
              {...form.register('name')}
            />
            <FieldError message={form.formState.errors.name?.message} />
          </Flex>

          {/* Test framework — chosen once, locked after creation. */}
          <Flex direction="col" gap={2}>
            <Label>Test framework</Label>
            <FrameworkPicker value={testFramework} onChange={changeFramework} />
          </Flex>

          {/* icon + color picker */}
          <Flex direction="col" gap={2}>
            <Label>Icon</Label>
            <GlyphPicker
              icon={icon}
              color={color}
              framework={testFramework}
              onIconChange={setIcon}
              onColorChange={setColor}
            />
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="np-desc">Description</Label>
            <Textarea
              id="np-desc"
              rows={2}
              placeholder="What does this suite cover?"
              {...form.register('description')}
            />
          </Flex>
        </Flex>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="new-project-form"
            loading={mutation.isPending}
            disabled={!name?.trim()}
            data-testid="create-project-submit"
          >
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
