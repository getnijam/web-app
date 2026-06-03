import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A segmented control matching the Runs page status filter (see
 * components/runs/RunFilters.tsx) — shadcn `Tabs` used purely as a selector, with
 * the same `TabsList`/`TabsTrigger` classes so the styling stays consistent.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as T);
      }}
      className={className}
    >
      <TabsList className={cn('rounded-lg', disabled && 'pointer-events-none opacity-50')}>
        {options.map((o) => (
          <TabsTrigger
            key={o.value}
            value={o.value}
            className="rounded-md px-3 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
          >
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
