import * as React from 'react';
import { cn } from '@/lib/utils';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Literal class names per breakpoint so Tailwind's scanner picks them up (it
// can't see dynamically-built strings).
const COLS_AT: Record<Breakpoint, Record<number, string>> = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
  '2xl': {
    1: '2xl:grid-cols-1',
    2: '2xl:grid-cols-2',
    3: '2xl:grid-cols-3',
    4: '2xl:grid-cols-4',
    5: '2xl:grid-cols-5',
    6: '2xl:grid-cols-6',
  },
};
// Array position → breakpoint: [base, sm, md, lg, xl, 2xl].
const BP_ORDER: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Resolve `cols` to grid-template-column classes.
 * - number   → a single `grid-cols-N` at all widths.
 * - number[] → responsive: each entry applies from the next breakpoint up,
 *   e.g. `[1, 2, 3]` = 1 column on mobile, 2 from `sm`, 3 from `md`.
 */
function resolveCols(cols: number | number[]): string {
  if (typeof cols === 'number') return COLS_AT.base[cols] ?? '';
  return cols
    .slice(0, BP_ORDER.length)
    .map((c, i) => COLS_AT[BP_ORDER[i]!]?.[c])
    .filter(Boolean)
    .join(' ');
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const justifyMap = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
} as const;

const gapMap: Record<string, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '1.5': 'gap-1.5',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '4.5': 'gap-4.5',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
};

type GridOwnProps = {
  /** A single column count, or a responsive array `[base, sm, md, lg, xl, 2xl]`. */
  cols?: number | number[];
  gap?: number;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  className?: string;
};

export type GridProps<T extends React.ElementType = 'div'> = GridOwnProps & {
  /** Element/component to render as (defaults to `div`). */
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof GridOwnProps | 'as'>;

/**
 * CSS Grid layout primitive. Pass `cols` as a number for a fixed column count
 * or an array for responsive counts. For custom templates, omit `cols` and pass
 * `grid-cols-[...]` via `className`.
 */
export function Grid<T extends React.ElementType = 'div'>({
  as,
  cols,
  gap,
  align,
  justify,
  className,
  ...props
}: GridProps<T>) {
  const Comp = (as ?? 'div') as React.ElementType;
  return (
    <Comp
      className={cn(
        'grid',
        cols !== undefined && resolveCols(cols),
        gap !== undefined && gapMap[String(gap)],
        align && alignMap[align],
        justify && justifyMap[justify],
        className,
      )}
      {...props}
    />
  );
}
