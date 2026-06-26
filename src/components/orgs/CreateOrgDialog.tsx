import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { listOrgsQueryKey, createOrgMutation } from '@/client/@tanstack/react-query.gen';
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
import { ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

const CreateSchema = z.object({
  name: z.string().min(1, 'Enter an organization name.').max(120),
});
type CreateForm = z.infer<typeof CreateSchema>;

export function CreateOrgDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateForm>({ resolver: zodResolver(CreateSchema) });
  const name = useWatch({ control: form.control, name: 'name' });

  function close() {
    form.reset();
    setFormError(null);
    onOpenChange(false);
  }

  const mutation = useMutation({
    ...createOrgMutation(),
    onSuccess: async (org) => {
      await queryClient.invalidateQueries({ queryKey: listOrgsQueryKey() });
      close();
      notify.success('Organization created', {
        description: `${org.name} is ready, create a project to start tracking runs.`,
      });
      navigate({ to: '/orgs/$orgId/projects', params: { orgId: org.id } });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>A workspace for your team's projects and test runs.</DialogDescription>
        </DialogHeader>

        <Flex
          as="form"
          id="new-org-form"
          direction="col"
          gap={4}
          onSubmit={form.handleSubmit((data) => {
            setFormError(null);
            mutation.mutate({ body: { name: data.name } });
          })}
        >
          {formError && <ErrorBanner>{formError}</ErrorBanner>}
          <Flex direction="col" gap={1.5}>
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              autoFocus
              placeholder="e.g. Acme Inc."
              data-testid="create-org-name"
              {...form.register('name')}
            />
            <FieldError message={form.formState.errors.name?.message} />
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
            form="new-org-form"
            loading={mutation.isPending}
            disabled={!name?.trim()}
            data-testid="create-org-submit"
          >
            Create organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
