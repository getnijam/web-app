import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';

const INPUT_CLASS =
  'h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

type InputProps = React.ComponentProps<'input'> & {
  /** Show a clear (✕) button while the (controlled) value is non-empty. */
  clearable?: boolean;
  /** Called when the clear button is pressed, clear your state here. */
  onClear?: () => void;
  /** Optional leading element rendered inside the field, e.g. a search glyph. */
  startIcon?: React.ReactNode;
};

function Input({ className, type, clearable, onClear, startIcon, ...props }: InputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fast path: a plain input, byte-for-byte as before, when no addon is asked for.
  if (!clearable && !startIcon) {
    return (
      <input type={type} data-slot="input" className={cn(INPUT_CLASS, className)} {...props} />
    );
  }

  const hasValue = props.value != null && String(props.value).length > 0;
  const handleClear = () => {
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <InputGroup className={className}>
      {startIcon && <InputGroupAddon>{startIcon}</InputGroupAddon>}
      <InputGroupInput ref={inputRef} type={type} {...props} />
      {clearable && hasValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear" onClick={handleClear}>
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { Input };
