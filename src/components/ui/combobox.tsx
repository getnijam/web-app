import { useRef, useState, type ReactNode } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { HugeiconsIcon } from '@hugeicons/react';
import { UnfoldMoreIcon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional per-item class (e.g. `font-mono` for branch names). */
  className?: string;
  /** Rich content for the dropdown list row; the closed field still shows `label`. */
  node?: ReactNode;
}

/**
 * A single-select with the search built into the field: the trigger IS the input,
 * so clicking it lets you type to filter (no separate search box). The dropdown is
 * portaled (so it's never clipped) and carries the sliding highlight from
 * CommandList. `value`/`onChange` are controlled. With `clearable` (default) the ✕
 * / re-picking the active item passes `undefined`; set `clearable={false}` to make
 * it a required select. `width` is a Tailwind width class for the field.
 */
export function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'No results',
  width = 'w-52',
  clearable = true,
  searchable = true,
  id,
  ariaLabel,
  disabled = false,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: ComboboxOption[];
  placeholder: string;
  emptyText?: string;
  width?: string;
  /** When false the value is required: no ✕, and re-picking keeps the selection. */
  clearable?: boolean;
  /** When false the field is a plain select: click to open, no type-to-filter. */
  searchable?: boolean;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const anchorRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const showClear = clearable && !!selected && !open;

  const pick = (next: string) => {
    onChange(clearable && next === value ? undefined : next);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={cn('relative', width)}>
      <Command shouldFilter={searchable} className="bg-transparent p-0">
        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setQuery('');
          }}
        >
          <PopoverAnchor asChild>
            <div ref={anchorRef} className="relative">
              <CommandPrimitive.Input
                id={id}
                aria-label={ariaLabel}
                disabled={disabled}
                role="combobox"
                aria-expanded={open}
                // Searchable: closed shows the selected label, focusing opens a fresh
                // search. Non-searchable: a plain select, always shows the selection.
                readOnly={!searchable}
                value={searchable && open ? query : (selected?.label ?? '')}
                onValueChange={(v) => {
                  setQuery(v);
                  if (!open) setOpen(true);
                }}
                onFocus={() => !disabled && setOpen(true)}
                onClick={() => !disabled && setOpen(true)}
                placeholder={placeholder}
                className={cn(
                  'h-9 w-full rounded-4xl border border-input bg-input/30 pr-9 pl-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:focus-visible:bg-input/50',
                  (!open || !searchable) && 'cursor-pointer',
                  !searchable && 'caret-transparent',
                  !open && selected?.className,
                )}
              />
              {showClear ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  // Don't steal focus (which would re-open); just clear.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChange(undefined)}
                  aria-label="Clear"
                  title="Clear"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                </Button>
              ) : (
                <HugeiconsIcon
                  icon={UnfoldMoreIcon}
                  strokeWidth={2}
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
              )}
            </div>
          </PopoverAnchor>

          <PopoverContent
            align="start"
            sideOffset={6}
            // Keep focus in the field while typing, and don't close when the
            // pointer interaction is on the field itself (it's the anchor).
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
            // Fit the content, but never narrower than the field and never wider
            // than a comfortable cap (long labels truncate beyond it).
            className="w-auto min-w-(--radix-popover-trigger-width) max-w-64 gap-0 overflow-hidden p-1"
          >
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={`${o.label} ${o.value}`}
                    onSelect={() => pick(o.value)}
                  >
                    {o.node ?? (
                      <span className={cn('min-w-0 flex-1 truncate', o.className)}>{o.label}</span>
                    )}
                    {o.value === value && (
                      <HugeiconsIcon icon={Tick02Icon} size={16} className="ml-auto shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  );
}
