import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
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
      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label={`Theme: ${opt?.label ?? 'System'}. Switch to ${next}.`}
        title={`Theme: ${opt?.label ?? 'System'}`}
        onClick={() => setTheme(next)}
        className={cn('size-9 rounded-md text-muted-foreground', className)}
      >
        <HugeiconsIcon icon={opt?.icon ?? ComputerIcon} size={18} strokeWidth={1.8} />
      </Button>
    );
  }

  return (
    <Flex
      inline
      role="radiogroup"
      aria-label="Theme"
      gap={0.5}
      className={cn('rounded-lg bg-muted p-0.75', className)}
    >
      {OPTIONS.map(({ value, label, icon }) => {
        const active = theme === value;
        return (
          <Button
            variant="ghost"
            size="sm"
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'h-auto gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium',
              active
                ? 'bg-background font-semibold text-foreground shadow-sm hover:bg-background'
                : 'text-muted-foreground hover:bg-transparent hover:text-foreground',
            )}
          >
            <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
            {active && <span>{label}</span>}
          </Button>
        );
      })}
    </Flex>
  );
}
