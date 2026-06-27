'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

// Animated like the accordion: the content reveals with height/opacity, a gradient
// mask wipe, and a small slide (driven by motion). A context exposes the open state.
const CONTENT_TRANSITION: Transition = { duration: 0.3, ease: 'easeInOut' };

type CollapsibleContextValue = { isOpen: boolean };
const [CollapsibleProvider, useCollapsibleContext] =
  getStrictContext<CollapsibleContextValue>('Collapsible');

function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [open, setOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  return (
    <CollapsibleProvider value={{ isOpen: Boolean(open) }}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} onOpenChange={setOpen} />
    </CollapsibleProvider>
  );
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

type CollapsibleContentProps = Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'> & { transition?: Transition };

function CollapsibleContent({
  children,
  transition = CONTENT_TRANSITION,
  style,
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsibleContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <CollapsiblePrimitive.CollapsibleContent asChild forceMount>
          <motion.div
            key="collapsible-content"
            data-slot="collapsible-content"
            initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 12 }}
            animate={{ height: 'auto', opacity: 1, '--mask-stop': '100%', y: 0 }}
            exit={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 12 }}
            transition={transition}
            style={{
              overflow: 'hidden',
              maskImage: 'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
              WebkitMaskImage:
                'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
              ...style,
            }}
            {...props}
          >
            {children}
          </motion.div>
        </CollapsiblePrimitive.CollapsibleContent>
      )}
    </AnimatePresence>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
