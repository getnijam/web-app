import { useState, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** Exact string the user must type to enable deletion (e.g. the project/org name). */
  confirmText: string;
  /** Label for the destructive action button. */
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  /** Namespace for child test ids: `${testId}-input` + `${testId}-confirm`. */
  testId?: string;
}

/**
 * A type-to-confirm deletion dialog for irreversible actions. The destructive
 * button stays disabled until the user types {@link confirmText} exactly.
 * Controlled via `open`/`onOpenChange`; the typed value resets on close.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel,
  loading,
  onConfirm,
  testId,
}: ConfirmDeleteDialogProps) {
  const [value, setValue] = useState('');
  const matches = value.trim() === confirmText;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setValue('');
        onOpenChange(o);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <Flex direction="col" gap={1.5}>
          <Text as="label" htmlFor="confirm-delete-input" className="text-sm text-muted-foreground">
            Type{' '}
            <Text as="span" weight="semibold" color="default" className="font-mono">
              {confirmText}
            </Text>{' '}
            to confirm.
          </Text>
          <Input
            id="confirm-delete-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoFocus
            data-testid={testId ? `${testId}-input` : undefined}
          />
        </Flex>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!matches}
            loading={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            data-testid={testId ? `${testId}-confirm` : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
