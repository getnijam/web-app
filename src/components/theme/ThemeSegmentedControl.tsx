import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from '@/components/theme/ThemeProvider';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun03Icon }[] = [
  { value: 'light', label: 'Light', icon: Sun03Icon },
  { value: 'dark', label: 'Dark', icon: Moon02Icon },
  { value: 'system', label: 'System', icon: ComputerIcon },
];

/**
 * Ternary theme control: Light / Dark / System segments. Styled to match the
 * design's `.seg` control (muted track, active segment lifts to the background).
 */
export function ThemeSegmentedControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn('inline-flex gap-0.5 rounded-lg bg-muted p-0.75', className)}
    >
      {OPTIONS.map(({ value, label, icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
              active
                ? 'bg-background font-semibold text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
            {active && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
