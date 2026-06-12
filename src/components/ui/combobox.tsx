import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UnfoldMoreIcon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional per-item class (e.g. `font-mono` for branch names). */
  className?: string;
}

/**
 * A searchable, clearable single-select built on the shadcn Command + Popover
 * (the combobox pattern), styled to match the filter pills. `value`/`onChange`
 * are controlled; clearing (the inline ✕, or re-picking the active item) passes
 * `undefined`. `width` is a Tailwind width class for the trigger pill; the
 * dropdown is an overlay, so it gets its own comfortable width independent of it.
 */
export function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyText = 'No results',
  width = 'w-52',
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn('relative', width)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="default"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between rounded-4xl border-input bg-input/30 font-normal hover:bg-input/30 dark:bg-input/30 dark:hover:bg-input/50',
              selected ? 'pr-8' : 'text-muted-foreground',
            )}
          >
            <span className={cn('min-w-0 flex-1 truncate text-left', selected?.className)}>
              {selected ? selected.label : placeholder}
            </span>
            {!selected && (
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="pointer-events-none size-4 shrink-0 text-muted-foreground"
              />
            )}
          </Button>
        </PopoverTrigger>
        {/* Overlay — free to be wider than the trigger so options/search fit. */}
        <PopoverContent align="start" className="w-64 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={`${o.label} ${o.value}`}
                    onSelect={() => {
                      onChange(o.value === value ? undefined : o.value);
                      setOpen(false);
                    }}
                  >
                    <span className={cn('min-w-0 flex-1 truncate', o.className)}>{o.label}</span>
                    {o.value === value && (
                      <HugeiconsIcon icon={Tick02Icon} size={16} className="shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onChange(undefined)}
          aria-label="Clear filter"
          title="Clear filter"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </Button>
      )}
    </div>
  );
}
