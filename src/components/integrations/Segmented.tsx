import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A segmented control matching the Runs page status filter (see
 * components/runs/RunFilters.tsx), shadcn `Tabs` used purely as a selector. It
 * keeps the stock `TabsList`/`TabsTrigger` radii on purpose: the sliding
 * indicator's radius is fixed in `ui/tabs`, so overriding the track/trigger
 * radius here would leave the pill rounder than the track it sits in.
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
      <TabsList className={cn(disabled && 'pointer-events-none opacity-50')}>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value} className="px-3">
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
