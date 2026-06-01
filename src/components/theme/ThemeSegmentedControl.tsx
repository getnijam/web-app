import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { useTheme, THEMES, type Theme } from '@/components/theme/ThemeProvider';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun03Icon }[] = [
  { value: 'light', label: 'Light', icon: Sun03Icon },
  { value: 'dark', label: 'Dark', icon: Moon02Icon },
  { value: 'system', label: 'System', icon: ComputerIcon },
];

/**
 * Theme control. Default: a Light / Dark / System segmented track. With
 * `minified`, a single icon button showing the current mode that **cycles**
 * Light → Dark → System on each click (for tight spots like the home nav).
 */
export function ThemeSegmentedControl({
  className,
  minified = false,
}: {
  className?: string;
  minified?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  if (minified) {
    const idx = THEMES.indexOf(theme);
    const opt = OPTIONS[idx];
    const next = THEMES[(idx + 1) % THEMES.length] ?? 'light';
    return (
      <button
        type="button"
        aria-label={`Theme: ${opt?.label ?? 'System'}. Switch to ${next}.`}
        title={`Theme: ${opt?.label ?? 'System'}`}
        onClick={() => setTheme(next)}
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
          className,
        )}
      >
        <HugeiconsIcon icon={opt?.icon ?? ComputerIcon} size={18} strokeWidth={1.8} />
      </button>
    );
  }

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
