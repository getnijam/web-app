'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

// A single highlight that slides to whichever tagged child (`data-hover-item`) is
// hovered and fades out when the pointer leaves. Same affordance as the sidebar,
// reusable inside custom menus/panels. Items with `data-hover-variant="destructive"`
// tint the highlight red. Tagged items should keep a transparent background so the
// highlight (which sits behind, -z-10) shows through.
type Highlight = {
  top: number;
  left: number;
  width: number;
  height: number;
  destructive: boolean;
};

type HoverHighlightProps = React.ComponentProps<'div'> & {
  /** CSS selector for hoverable items (default `[data-hover-item]`). */
  itemSelector?: string;
  /** Tailwind classes for the (non-destructive) highlight fill. */
  highlightClassName?: string;
  /** Px to shrink the highlight on every side (floats it inside the item). */
  inset?: number;
};

export function HoverHighlight({
  className,
  children,
  itemSelector = '[data-hover-item]',
  highlightClassName = 'bg-accent',
  inset = 0,
  ...props
}: HoverHighlightProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const lastItem = React.useRef<HTMLElement | null>(null);
  const [highlight, setHighlight] = React.useState<Highlight | null>(null);

  const onMouseOver = (event: React.MouseEvent) => {
    const root = ref.current;
    if (!root) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>(itemSelector);
    if (!item || !root.contains(item) || item === lastItem.current) return;
    lastItem.current = item;
    const rr = root.getBoundingClientRect();
    const ir = item.getBoundingClientRect();
    setHighlight({
      top: ir.top - rr.top + inset,
      left: ir.left - rr.left + inset,
      width: ir.width - inset * 2,
      height: ir.height - inset * 2,
      destructive: item.dataset.hoverVariant === 'destructive',
    });
  };

  const onMouseLeave = () => {
    lastItem.current = null;
    setHighlight(null);
  };

  return (
    <div
      ref={ref}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      className={cn('relative isolate', className)}
      {...props}
    >
      <AnimatePresence>
        {highlight && (
          <motion.div
            aria-hidden
            data-slot="hover-highlight"
            className={cn(
              'pointer-events-none absolute -z-10 rounded-md',
              highlight.destructive ? 'bg-destructive/10 dark:bg-destructive/20' : highlightClassName,
            )}
            initial={{ opacity: 0, top: highlight.top, left: highlight.left, width: highlight.width, height: highlight.height }}
            animate={{ opacity: 1, top: highlight.top, left: highlight.left, width: highlight.width, height: highlight.height }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, opacity: { duration: 0.15 } }}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
