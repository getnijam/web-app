import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Typographic + color styles for the {@link Text} primitive. Centralizing them
 * here keeps call sites free of one-off `text-*`/`font-*` classes, pick a
 * `variant` for the scale and a `color` for the tone instead.
 */
const textVariants = cva('', {
  variants: {
    // Typographic scale only (size / weight / leading / font-family), color is
    // a separate axis so any variant can take any color.
    variant: {
      display: 'font-heading text-3xl leading-tight font-semibold tracking-tight text-balance',
      h1: 'font-heading text-2xl font-semibold tracking-tight text-balance',
      h2: 'font-heading text-xl font-semibold tracking-tight',
      h3: 'font-heading text-lg font-semibold tracking-tight',
      h4: 'font-heading text-base font-semibold',
      h5: 'font-heading text-sm font-semibold',
      h6: 'font-heading text-xs font-semibold',
      lead: 'text-base leading-relaxed',
      body: 'text-sm leading-normal',
      caption: 'text-xs leading-normal',
      code: 'font-mono text-xs',
      /** No typographic styles, inherits size/weight from the surrounding text. */
      inherit: '',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-destructive',
      info: 'text-info',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type TextVariantProps = VariantProps<typeof textVariants>;
type TextVariant = NonNullable<TextVariantProps['variant']>;

/** Default element for each variant when `as` is not given. */
const variantElement: Record<TextVariant, React.ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  lead: 'p',
  body: 'p',
  caption: 'p',
  code: 'code',
  inherit: 'span',
};

const HEADING_TAG = /^h[1-6]$/;

export type TextProps<T extends React.ElementType = 'p'> = TextVariantProps & {
  /** Element/component to render as. Inferred from `variant` when omitted. */
  as?: T;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof TextVariantProps | 'as' | 'className'>;

/**
 * Polymorphic text primitive. Drive its appearance with `variant` (typographic
 * scale), `color` (semantic tone), and the `weight`/`align`/`truncate` overrides
 * rather than ad-hoc `className`s.
 *
 * The rendered element is inferred: `<Text as="h2">` and `<Text variant="h2">`
 * both produce an `<h2>` with h2 styles, and `as` always wins when both differ
 * (e.g. an `<h2>` styled as a `display` headline: `<Text as="h2" variant="display">`).
 */
// Default the visual variant from the element: headings get their level's styles,
// inline elements inherit size, everything else falls back to `body`.
function defaultVariant(as: React.ElementType | undefined): TextVariant {
  if (typeof as === 'string' && HEADING_TAG.test(as)) return as as TextVariant;
  if (as === 'span' || as === 'label') return 'inherit';
  return 'body';
}

export function Text<T extends React.ElementType = 'p'>({
  as,
  variant,
  color,
  weight,
  align,
  truncate,
  className,
  ...props
}: TextProps<T>) {
  const resolvedVariant: TextVariant = variant ?? defaultVariant(as);
  const Comp = (as ?? variantElement[resolvedVariant]) as React.ElementType;

  return (
    <Comp
      data-slot="text"
      className={cn(
        textVariants({ variant: resolvedVariant, color, weight, align, truncate }),
        className,
      )}
      {...props}
    />
  );
}

export { textVariants };
