import { AnimatePresence, motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(v) => {
        if (v) setTheme(v as Theme);
      }}
      aria-label="Theme"
      spacing={0.5}
      highlightClassName="bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
      className={cn('rounded-4xl bg-muted p-0.75', className)}
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          title={label}
          className="h-8 rounded-xl px-2.5 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:text-foreground"
        >
          <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
          <AnimatePresence initial={false}>
            {theme === value && (
              <motion.span
                key="label"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
