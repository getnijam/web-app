'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
  type Transition,
} from 'motion/react';

import { cn } from '@/lib/utils';

// Spring-animated tooltip (adapted from animate-ui's Radix variant), re-skinned
// to our neutral tooltip tokens. Radix owns positioning/a11y; motion drives the
// open/close pop. `followCursor` is opt-in and off by default.

// --- local helpers (kept in-file so the tooltip stays a single module) ---

type TooltipContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  x: MotionValue<number>;
  y: MotionValue<number>;
  followCursor: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

function useTooltip() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip must be used within a <Tooltip>');
  return ctx;
}

const followsX = (followCursor: boolean | 'x' | 'y') => followCursor === 'x' || followCursor === true;
const followsY = (followCursor: boolean | 'x' | 'y') => followCursor === 'y' || followCursor === true;

// --- components ---

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> & {
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

function Tooltip({
  followCursor = false,
  followCursorSpringOptions = { stiffness: 200, damping: 17 },
  ...props
}: TooltipProps) {
  // Mirror Radix's open state so AnimatePresence can drive the exit animation.
  const isControlled = props.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(props.defaultOpen ?? false);
  const isOpen = isControlled ? (props.open as boolean) : uncontrolledOpen;
  const setIsOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    props.onOpenChange?.(next);
  };
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <TooltipContext.Provider
      value={{ isOpen, setIsOpen, x, y, followCursor, followCursorSpringOptions }}
    >
      <TooltipPrimitive.Root data-slot="tooltip" {...props} onOpenChange={setIsOpen} />
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  onMouseMove,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const { x, y, followCursor } = useTooltip();

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseMove?.(event);
    if (!followCursor) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (followsX(followCursor)) x.set((event.clientX - rect.left - rect.width / 2) / 2);
    if (followsY(followCursor)) y.set((event.clientY - rect.top - rect.height / 2) / 2);
  };

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onMouseMove={handleMouseMove}
      {...props}
    />
  );
}

type TooltipContentProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  HTMLMotionProps<'div'> & {
    transition?: Transition;
  };

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  side,
  align,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  onEscapeKeyDown,
  onPointerDownOutside,
  style,
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  ...props
}: TooltipContentProps) {
  const { isOpen, x, y, followCursor, followCursorSpringOptions } = useTooltip();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            forceMount
            sideOffset={sideOffset}
            side={side}
            align={align}
            alignOffset={alignOffset}
            avoidCollisions={avoidCollisions}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            arrowPadding={arrowPadding}
            sticky={sticky}
            hideWhenDetached={hideWhenDetached}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
            className="z-50 origin-(--radix-tooltip-content-transform-origin)"
          >
            <motion.div
              data-slot="tooltip-content"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={transition}
              className={cn(
                'inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 text-balance rounded-xl bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg',
                className,
              )}
              style={{
                x: followsX(followCursor) ? translateX : undefined,
                y: followsY(followCursor) ? translateY : undefined,
                ...style,
              }}
              {...props}
            >
              {children}
              <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=left]:translate-x-[-1.5px] data-[side=right]:translate-x-[1.5px]" />
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
