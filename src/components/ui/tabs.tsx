'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';

// Adapted from animate-ui's Radix tabs: a single indicator lives in the TabsList
// and slides to the active trigger (the filled pill for `default`, the underline
// bar for `line`). Living at the list level (not inside each trigger) means it
// works for asChild router-link triggers too. Radix owns selection/a11y; motion
// only drives the slide. Re-skinned to our existing tokens.

const INDICATOR_TRANSITION: Transition = { type: 'spring', stiffness: 250, damping: 30 };

type Variant = 'default' | 'line';
type Orientation = 'horizontal' | 'vertical';
type Rect = { left: number; top: number; width: number; height: number };

type TabsContextValue = { value: string | undefined; orientation: Orientation };
const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  // Mirror Radix's active value so the list can re-measure the indicator on
  // change. Derived during render (no effect) to avoid cascading state.
  const isControlled = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(props.defaultValue);
  const value = isControlled ? props.value : uncontrolledValue;
  const setValue = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    props.onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, orientation }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
        {...props}
        onValueChange={setValue}
      />
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-4xl p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Visual look of the sliding indicator (geometry comes from indicatorRect).
const INDICATOR_CLASS: Record<Variant, string> = {
  default: 'rounded-xl border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30',
  line: 'rounded-full bg-primary',
};

// Place the indicator over the active trigger: the full box for `default`, a thin
// bar on the trailing edge for `line`.
function indicatorRect(variant: Variant, orientation: Orientation, r: Rect): Rect {
  if (variant === 'line') {
    return orientation === 'vertical'
      ? { left: r.left + r.width - 2, top: r.top, width: 2, height: r.height }
      : { left: r.left, top: r.top + r.height - 2, width: r.width, height: 2 };
  }
  return r;
}

function TabsList({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const resolvedVariant = variant ?? 'default';
  const { value, orientation } = useTabsContext();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rect | null>(null);

  const measure = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      '[data-slot="tabs-trigger"][data-state="active"]',
    );
    if (!active) {
      setRect(null);
      return;
    }
    const lr = list.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    setRect({ left: ar.left - lr.left, top: ar.top - lr.top, width: ar.width, height: ar.height });
  }, []);

  // Re-measure after paint and on resize. Scheduled (rAF / observer callbacks) so
  // setState never runs synchronously inside the effect body.
  React.useEffect(() => {
    let raf = requestAnimationFrame(measure);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            raf = requestAnimationFrame(measure);
          })
        : null;
    if (observer && listRef.current) observer.observe(listRef.current);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, value]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={resolvedVariant}
      className={cn(tabsListVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {rect && (
        <motion.span
          aria-hidden
          data-slot="tabs-highlight"
          className={cn('pointer-events-none absolute z-0', INDICATOR_CLASS[resolvedVariant])}
          initial={false}
          animate={indicatorRect(resolvedVariant, orientation, rect)}
          transition={INDICATOR_TRANSITION}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
}

// Triggers sit above the sliding indicator (z-10). Works for plain buttons and
// for asChild router links (the indicator is a List sibling, not injected here).
function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:px-2.5 group-data-vertical/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 data-[state=active]:text-foreground dark:text-muted-foreground dark:hover:text-foreground dark:data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
