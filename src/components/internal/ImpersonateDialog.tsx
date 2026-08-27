import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useStartImpersonation } from '@/hooks/use-impersonation';
import { isApiError } from '@/lib/api-error';

// User id only, deliberately. There is no lookup by email and no user search: having
// to fetch a uuid from the database is the friction that keeps impersonation a
// considered act rather than something started from memory or off a support ticket.
const ImpersonateSchema = z.object({
  userId: z.string().uuid('Enter a valid user id.'),
  reason: z.string().max(200).optional(),
});
type ImpersonateForm = z.infer<typeof ImpersonateSchema>;

export function ImpersonateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ImpersonateForm>({ resolver: zodResolver(ImpersonateSchema) });
  const userId = useWatch({ control: form.control, name: 'userId' });

  function close() {
    form.reset();
    setFormError(null);
    onOpenChange(false);
  }

  const mutation = useStartImpersonation({ onSuccess: close });

  function onError(err: unknown) {
    if (isApiError(err)) {
      setFormError(err.error.message);
      return;
    }
    setFormError('Something went wrong. Please try again.');
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Impersonate a user</DialogTitle>
          <DialogDescription>
            You will be signed in as this user until you stop. Everything you do is recorded against
            your account.
          </DialogDescription>
        </DialogHeader>

        <Flex
          as="form"
          id="impersonate-form"
          direction="col"
          gap={4}
          onSubmit={form.handleSubmit((data) => {
            setFormError(null);
            mutation.mutate(
              { body: { userId: data.userId, reason: data.reason?.trim() || undefined } },
              { onError },
            );
          })}
        >
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="imp-user-id">
              User ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="imp-user-id"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              data-testid="impersonate-user-id"
              placeholder="00000000-0000-0000-0000-000000000000"
              className="font-mono text-sm"
              {...form.register('userId')}
            />
            <FieldError message={form.formState.errors.userId?.message} />
            <Text variant="caption" color="muted">
              Copy it from the users table. Email lookup is not available on purpose.
            </Text>
          </Flex>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="imp-reason">Reason</Label>
            <Input
              id="imp-reason"
              autoComplete="off"
              data-testid="impersonate-reason"
              placeholder="e.g. debugging ticket 412"
              {...form.register('reason')}
            />
            <Text variant="caption" color="muted">
              Optional, stored on the audit record.
            </Text>
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
            form="impersonate-form"
            data-testid="impersonate-submit"
            loading={mutation.isPending}
            disabled={!userId?.trim()}
          >
            Impersonate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
