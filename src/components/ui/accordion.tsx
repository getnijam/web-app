'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

// Animated like animate-ui's Radix accordion: the content animates height/opacity
// with a gradient mask reveal and a small slide, driven by motion (not CSS
// keyframes). A context exposes each item's open state to its content.
const CONTENT_TRANSITION: Transition = { duration: 0.3, ease: 'easeInOut' };

type AccordionContextValue = { value: string | string[] | undefined };
const [AccordionProvider, useAccordionContext] =
  getStrictContext<AccordionContextValue>('Accordion');

type AccordionItemContextValue = { isOpen: boolean };
const [AccordionItemProvider, useAccordionItemContext] =
  getStrictContext<AccordionItemContextValue>('AccordionItem');

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  // Mirror the open value so each item's content knows whether to render/animate.
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange as (value: string | string[] | undefined) => void,
  });

  return (
    <AccordionProvider value={{ value }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn('flex w-full flex-col overflow-hidden rounded-2xl border', className)}
        {...props}
        onValueChange={setValue as never}
      />
    </AccordionProvider>
  );
}

function AccordionItem({
  className,
  value,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { value: accordionValue } = useAccordionContext();
  const isOpen = Array.isArray(accordionValue)
    ? accordionValue.includes(value)
    : accordionValue === value;

  return (
    <AccordionItemProvider value={{ isOpen }}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        value={value}
        className={cn('not-last:border-b data-open:bg-muted/50', className)}
        {...props}
      />
    </AccordionItemProvider>
  );
}

function AccordionTrigger({
  className,
  children,
  action,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** Optional control rendered beside the trigger (not nested in its button). */
  action?: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Header className="flex items-center">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex min-w-0 flex-1 items-start justify-between gap-6 border border-transparent p-4 text-left text-sm font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
      {action}
    </AccordionPrimitive.Header>
  );
}

type AccordionContentProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Content>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'> & { transition?: Transition };

function AccordionContent({
  className,
  children,
  transition = CONTENT_TRANSITION,
  style,
  ...props
}: AccordionContentProps) {
  const { isOpen } = useAccordionItemContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <AccordionPrimitive.Content asChild forceMount>
          <motion.div
            key="accordion-content"
            data-slot="accordion-content"
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
            className="px-4 text-sm"
            {...props}
          >
            <div
              className={cn(
                'pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
                className,
              )}
            >
              {children}
            </div>
          </motion.div>
        </AccordionPrimitive.Content>
      )}
    </AnimatePresence>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
