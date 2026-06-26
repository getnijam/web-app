import * as React from 'react';
import { Popover } from 'radix-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TagInputProps {
  /** Selected tags (controlled). */
  value: string[];
  onChange: (next: string[]) => void;
  /** Known values offered as a filtered dropdown; new values can still be typed (creatable). */
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

type Item = { type: 'create' | 'suggestion'; label: string };

/**
 * Creatable multi-select tag input. Type a value and press Enter (or comma) to add
 * it as a removable chip; Backspace on an empty field removes the last one. Known
 * `suggestions` show in a filtered dropdown, but any free-text value is allowed.
 * Composed from our `Badge` + a token-styled input (no extra deps).
 */
export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
  disabled,
  id,
  'aria-label': ariaLabel,
}: TagInputProps) {
  const [input, setInput] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const query = input.trim();
  const matches = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(query.toLowerCase()),
  );
  const showCreate =
    query.length > 0 &&
    !value.includes(query) &&
    !suggestions.some((s) => s.toLowerCase() === query.toLowerCase());
  const items: Item[] = [
    ...(showCreate ? [{ type: 'create' as const, label: query }] : []),
    ...matches.map((m): Item => ({ type: 'suggestion', label: m })),
  ];
  const dropdownOpen = open && !disabled && items.length > 0;
  const activeIdx = active < items.length ? active : 0;

  /** Commit free text, splitting on commas so a paste like "main, develop" works. */
  function commit(raw: string) {
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
    setActive(0);
  }

  function addOne(tag: string) {
    if (!value.includes(tag)) onChange([...value, tag]);
    setInput('');
    setActive(0);
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (dropdownOpen && items[activeIdx]) addOne(items[activeIdx]!.label);
      else if (query) commit(query);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      remove(value[value.length - 1]!);
    } else if (e.key === 'ArrowDown' && dropdownOpen) {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === 'ArrowUp' && dropdownOpen) {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <Popover.Root open={dropdownOpen} onOpenChange={(o) => !o && setOpen(false)}>
      <Popover.Anchor asChild>
        <div
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
          <input
            ref={inputRef}
            id={id}
            aria-label={ariaLabel}
            value={input}
            disabled={disabled}
            placeholder={value.length === 0 ? placeholder : undefined}
            className="h-6 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          // Keep the caret in the input, the list is navigated with the keyboard,
          // and closing is driven by the input's blur/Escape (not radix dismissal),
          // so clicking back into the field doesn't flicker the list shut.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="z-50 max-h-56 w-(--radix-popover-trigger-width) overflow-auto rounded-xl border border-border bg-popover p-1 shadow-md"
        >
          {items.map((item, i) => (
            <button
              key={`${item.type}-${item.label}`}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                i === activeIdx ? 'bg-accent text-accent-foreground' : 'text-foreground',
              )}
              // onMouseDown (not click) so it runs before the input's blur fires.
              onMouseDown={(e) => {
                e.preventDefault();
                addOne(item.label);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {item.type === 'create' ? (
                <>
                  <HugeiconsIcon icon={PlusSignIcon} size={14} className="text-muted-foreground" />
                  <span className="truncate">
                    Add “<span className="font-medium">{item.label}</span>”
                  </span>
                </>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
