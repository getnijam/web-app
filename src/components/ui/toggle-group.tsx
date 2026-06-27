'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

// Adapted from animate-ui's Radix toggle-group: items get a tactile `whileTap`
// press, and the selected state animates. Single-select slides one shared
// highlight between items (measured at the group level, like our tabs, so it
// glides across gaps without clipping); multiple-select fades a highlight per
// item. Re-skinned to our `bg-muted` selection tone.

const SLIDE_TRANSITION: Transition = { type: 'spring', stiffness: 250, damping: 30 };
const FADE_TRANSITION: Transition = { duration: 0.15, ease: 'easeOut' };

type Highlight = { left: number; top: number; width: number; height: number; radius: string };

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number;
  orientation?: 'horizontal' | 'vertical';
  type?: 'single' | 'multiple';
  value?: string | string[];
  // Selection fill. Defaults to `bg-muted`; set e.g. `bg-background shadow-sm`
  // for a raised pill on a muted track (segmented-control look).
  highlightClassName?: string;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: 'default',
  variant: 'default',
  spacing: 2,
  orientation: 'horizontal',
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = 'horizontal',
  highlightClassName,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: 'horizontal' | 'vertical';
    highlightClassName?: string;
  }) {
  // Mirror Radix's value so the slider can re-measure on change.
  const isControlled = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(props.defaultValue);
  const value = isControlled ? props.value : uncontrolledValue;
  const setValue = (next: string | string[]) => {
    if (!isControlled) setUncontrolledValue(next);
    (props.onValueChange as ((value: string | string[]) => void) | undefined)?.(next);
  };

  const isSingle = props.type === 'single';
  const groupRef = React.useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = React.useState<Highlight | null>(null);

  const measure = React.useCallback(() => {
    const group = groupRef.current;
    if (!group) return;
    const active = group.querySelector<HTMLElement>(
      '[data-slot="toggle-group-item"][data-state="on"]',
    );
    if (!active) {
      setHighlight(null);
      return;
    }
    const gr = group.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    setHighlight({
      left: ar.left - gr.left,
      top: ar.top - gr.top,
      width: ar.width,
      height: ar.height,
      radius: getComputedStyle(active).borderRadius,
    });
  }, []);

  // Re-measure after paint and on resize. Scheduled (rAF / observer callbacks) so
  // setState never runs synchronously inside the effect body.
  React.useEffect(() => {
    if (!isSingle) return;
    const group = groupRef.current;
    let raf = requestAnimationFrame(measure);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            raf = requestAnimationFrame(measure);
          })
        : null;
    if (observer && group) {
      // Watch the group and each item so the highlight tracks an item as its
      // contents animate (e.g. a label expanding), not just on group resize.
      observer.observe(group);
      group
        .querySelectorAll('[data-slot="toggle-group-item"]')
        .forEach((el) => observer.observe(el));
    }
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, value, isSingle]);

  return (
    <ToggleGroupPrimitive.Root
      ref={groupRef}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group relative flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[spacing=0]:data-[variant=outline]:rounded-4xl data-vertical:flex-col data-vertical:items-stretch',
        className,
      )}
      {...props}
      onValueChange={setValue as never}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation, type: props.type, value, highlightClassName }}
      >
        {isSingle && highlight && (
          <motion.span
            aria-hidden
            data-slot="toggle-group-highlight"
            className={cn('pointer-events-none absolute z-0', highlightClassName ?? 'bg-muted')}
            initial={false}
            animate={{
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
            }}
            style={{ borderRadius: highlight.radius }}
            transition={SLIDE_TRANSITION}
          />
        )}
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = context.variant || variant;
  const resolvedSize = context.size || size;
  const isMultiple = context.type === 'multiple';

  const isActive = Array.isArray(context.value) && context.value.includes(value);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      value={value}
      asChild
      className={cn(
        // Selection is drawn by the motion highlight, so neutralize the
        // primitive's static on-state background.
        'relative z-10 shrink-0 overflow-hidden data-[state=on]:bg-transparent aria-pressed:bg-transparent group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-3 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-2.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-2.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-3xl group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-3xl group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-3xl group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-3xl group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        className,
      )}
      {...props}
    >
      <motion.button whileTap={{ scale: 0.95 }}>
        {isMultiple && (
          <AnimatePresence initial={false}>
            {isActive && (
              <motion.span
                aria-hidden
                data-slot="toggle-group-highlight"
                className={cn('absolute inset-0 z-0', context.highlightClassName ?? 'bg-muted')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_TRANSITION}
              />
            )}
          </AnimatePresence>
        )}
        <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
          {children}
        </span>
      </motion.button>
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
