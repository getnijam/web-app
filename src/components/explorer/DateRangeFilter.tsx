import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import type { DateRange } from 'react-day-picker';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** The trigger label: placeholder, a single day, or the from–to span. */
function label(range: DateRange | undefined): string {
  if (!range?.from) return 'Filter by date';
  if (!range.to) return fmt.format(range.from);
  return `${fmt.format(range.from)} – ${fmt.format(range.to)}`;
}

/**
 * From/to run-date filter built on the shadcn date picker (Popover + range
 * Calendar). Controlled: `value` is the picked range, `onChange` fires on every
 * selection (and with `undefined` when cleared). Shared by the test pages.
 */
export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const active = Boolean(value?.from);
  return (
    <Flex align="center" gap={1.5}>
      <Popover>
        <PopoverTrigger asChild>
          {/* Matches the shadcn SelectTrigger pill (h-8, rounded-4xl, input bg/border)
              so it lines up exactly with the other filter pills in the row. */}
          <Button
            variant="outline"
            size="default"
            className={cn(
              // min-w-57.5 = 230px: a stable floor so the pill doesn't resize (and
              // shuffle the row) as the selected range's label grows/shrinks.
              'min-w-57.5 justify-start rounded-4xl border-input bg-input/30 font-normal hover:bg-input/30 dark:bg-input/30 dark:hover:bg-input/50',
              !active && 'text-muted-foreground',
            )}
          >
            <HugeiconsIcon icon={Calendar03Icon} size={16} />
            {label(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {active && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(undefined)}
          aria-label="Clear date filter"
          title="Clear date filter"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </Button>
      )}
    </Flex>
  );
}
