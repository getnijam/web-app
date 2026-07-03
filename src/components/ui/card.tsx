import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * The app card: a bordered surface on `bg-card` (the single card look used across the
 * app). Intentionally a minimal styled box, no built-in padding, gap, or flex, so it
 * drops in wherever a card is needed without changing layout; add `p-*`, `flex flex-col`,
 * `overflow-hidden`, `shadow-sm`, etc. via `className` per use. Always use this instead
 * of hand-rolling `rounded-2xl border border-border bg-card`.
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-2xl border border-border bg-card text-card-foreground', className)}
      {...props}
    />
  );
}

/** Optional padded sections for composing a card (header / content / footer). */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-header" className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-heading text-base font-medium', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center p-5', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
