import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { cn } from '@/lib/utils';

/**
 * Header-right controls for an editable settings panel (goes in the panel's
 * `action` slot, beside the title). View mode shows a single Edit button; edit
 * mode shows Cancel, plus Save changes only when something actually changed
 * (`dirty`). Save is a plain button wired to `onSave`, so it works whether or not
 * the fields sit inside a `<form>`. Render this only when the user may edit
 * (callers gate on admin), so non-editors never see an Edit button.
 */
export function EditActions({
  editing,
  dirty,
  saving = false,
  onEdit,
  onCancel,
  onSave,
  editLabel = 'Edit',
}: {
  editing: boolean;
  dirty: boolean;
  saving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  editLabel?: string;
}) {
  if (!editing)
    return (
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        {editLabel}
      </Button>
    );
  return (
    <Flex gap={2} align="center">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {dirty && (
        <Button type="button" size="sm" loading={saving} onClick={onSave}>
          Save changes
        </Button>
      )}
    </Flex>
  );
}

/**
 * Wrap a panel's editable fields so they lock in view mode. Uses the `inert`
 * attribute, which makes the whole subtree non-interactive (no pointer, focus,
 * or keyboard) for EVERY element, including Radix triggers (Select, Switch) and
 * custom inputs that a native `fieldset[disabled]` doesn't reliably disable. A
 * faded, no-select look signals it's read-only until you press Edit. Keep
 * display-only or always-available controls (e.g. a copy button) OUTSIDE this.
 */
export function LockedFields({ locked, children }: { locked: boolean; children: ReactNode }) {
  return (
    <div
      inert={locked}
      className={cn('min-w-0', locked && 'pointer-events-none opacity-60 select-none')}
    >
      {children}
    </div>
  );
}
