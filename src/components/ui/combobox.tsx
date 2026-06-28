import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { HugeiconsIcon } from '@hugeicons/react';
import { UnfoldMoreIcon, Tick02Icon, Cancel01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

/**
 * Multiselect sibling of {@link FilterCombobox}: the same field-is-the-search +
 * portaled dropdown + sliding highlight, but the value is an array rendered as
 * removable `Badge` tokens, and unknown text is creatable. Type to filter known
 * `options`; Enter/click a row to add it, comma commits free text, Backspace on an
 * empty field removes the last token.
 */
export function TagCombobox({
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'No results',
  disabled = false,
  id,
  ariaLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Known values offered in the dropdown; any free-text value is still allowed. */
  options: string[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = input.trim();
  // Offer every not-yet-selected option; cmdk filters them by the typed text.
  const available = options.filter((o) => !value.includes(o));
  const showCreate =
    query.length > 0 &&
    !value.includes(query) &&
    !options.some((o) => o.toLowerCase() === query.toLowerCase());
  const dropdownOpen = open && !disabled && (available.length > 0 || showCreate);

  const addOne = (tag: string) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };

  // Commit free text, splitting on commas so a paste like "main, develop" works.
  const commit = (raw: string) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      const next = [...value];
      for (const p of parts) if (!next.includes(p)) next.push(p);
      onChange(next);
    }
    setInput('');
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter/Arrows are owned by cmdk (it selects the highlighted row → addOne).
    if (e.key === ',') {
      e.preventDefault();
      if (query) commit(query);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      remove(value[value.length - 1]!);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Command shouldFilter className="bg-transparent p-0">
      <Popover open={dropdownOpen} onOpenChange={(o) => !o && setOpen(false)}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            className={cn(
              'flex min-h-8 w-full flex-wrap items-center gap-1 rounded-2xl border border-transparent bg-input/50 px-1.5 py-1 text-sm transition-[color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30',
              disabled && 'pointer-events-none opacity-50',
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {value.map((tag) => (
              <Badge key={tag} variant="secondary" className="max-w-full gap-1 pr-1">
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(tag);
                  }}
                  disabled={disabled}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} />
                </button>
              </Badge>
            ))}
            <CommandPrimitive.Input
              ref={inputRef}
              id={id}
              aria-label={ariaLabel}
              disabled={disabled}
              value={input}
              placeholder={value.length === 0 ? placeholder : undefined}
              className="h-6 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
              onValueChange={(v) => {
                setInput(v);
                if (!disabled) setOpen(true);
              }}
              onFocus={() => !disabled && setOpen(true)}
              onKeyDown={onKeyDown}
            />
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className="w-(--radix-popover-trigger-width) gap-0 overflow-hidden p-1"
        >
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {showCreate && (
                <CommandItem value={query} onSelect={() => addOne(query)}>
                  <HugeiconsIcon icon={PlusSignIcon} size={14} className="text-muted-foreground" />
                  <span className="truncate">
                    Add “<span className="font-medium">{query}</span>”
                  </span>
                </CommandItem>
              )}
              {available.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => addOne(o)}>
                  <span className="truncate">{o}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
