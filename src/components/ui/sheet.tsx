'use client';

import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

// Adapted from animate-ui's Radix sheet: the panel springs all the way in from the
// edge (and out), driven by motion, instead of the prior 40px CSS nudge. Re-skinned
// to our tokens. The Content stays a non-asChild wrapper (focus/dismiss) with an
// inner sliding motion.div, to avoid the overlay Slot's Children.only pitfall.
type Side = 'top' | 'bottom' | 'left' | 'right';

const CONTENT_TRANSITION: Transition = { type: 'spring', stiffness: 150, damping: 22 };

const OFFSCREEN: Record<Side, { x?: string; y?: string; opacity: number }> = {
  right: { x: '100%', opacity: 0 },
  left: { x: '-100%', opacity: 0 },
  top: { y: '-100%', opacity: 0 },
  bottom: { y: '100%', opacity: 0 },
};

const SIDE_CLASS: Record<Side, string> = {
  right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
  top: 'inset-x-0 top-0 h-auto border-b',
  bottom: 'inset-x-0 bottom-0 h-auto border-t',
};

type SheetContextValue = { isOpen: boolean };
const [SheetProvider, useSheetContext] = getStrictContext<SheetContextValue>('Sheet');

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [open, setOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  return (
    <SheetProvider value={{ isOpen: Boolean(open) }}>
      <SheetPrimitive.Root data-slot="sheet" {...props} onOpenChange={setOpen} />
    </SheetProvider>
  );
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSheetContext();
  return (
    <AnimatePresence>
      {isOpen && (
        <SheetPrimitive.Portal forceMount data-slot="sheet-portal">
          {children}
        </SheetPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type SheetOverlayProps = Omit<
  React.ComponentProps<typeof SheetPrimitive.Overlay>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'>;

function SheetOverlay({
  className,
  transition = { duration: 0.2, ease: 'easeInOut' },
  ...props
}: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay asChild forceMount>
      <motion.div
        key="sheet-overlay"
        data-slot="sheet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
        className={cn(
          'fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm',
          className,
        )}
        {...props}
      />
    </SheetPrimitive.Overlay>
  );
}

type SheetContentProps = Omit<
  React.ComponentProps<typeof SheetPrimitive.Content>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'> & {
    side?: Side;
    showCloseButton?: boolean;
  };

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  transition = CONTENT_TRANSITION,
  ...props
}: SheetContentProps) {
  const axis = side === 'left' || side === 'right' ? 'x' : 'y';

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content forceMount>
        <motion.div
          key="sheet-content"
          data-slot="sheet-content"
          data-side={side}
          initial={OFFSCREEN[side]}
          animate={{ [axis]: 0, opacity: 1 }}
          exit={OFFSCREEN[side]}
          transition={transition}
          className={cn(
            'fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-xl',
            SIDE_CLASS[side],
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close data-slot="sheet-close" asChild>
              <Button variant="ghost" className="absolute top-4 right-4 bg-secondary" size="icon-sm">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.Close>
          )}
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-6', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-heading text-base font-medium text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
