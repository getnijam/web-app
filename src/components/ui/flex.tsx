import * as React from 'react';
import { cn } from '@/lib/utils';

const directionMap = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
} as const;

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

// Literal classes so Tailwind's scanner picks them up.
const gapMap: Record<string, string> = {
  '0': 'gap-0',
  '0.5': 'gap-0.5',
  '1': 'gap-1',
  '1.5': 'gap-1.5',
  '2': 'gap-2',
  '2.5': 'gap-2.5',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
  '10': 'gap-10',
  '12': 'gap-12',
};

type FlexOwnProps = {
  direction?: keyof typeof directionMap;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  gap?: number;
  wrap?: boolean;
  inline?: boolean;
  className?: string;
};

export type FlexProps<T extends React.ElementType = 'div'> = FlexOwnProps & {
  /** Element/component to render as (defaults to `div`). */
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof FlexOwnProps | 'as'>;

/** Flexbox layout primitive. */
export function Flex<T extends React.ElementType = 'div'>({
  as,
  direction = 'row',
  align,
  justify,
  gap,
  wrap,
  inline,
  className,
  ...props
}: FlexProps<T>) {
  const Comp = (as ?? 'div') as React.ElementType;
  return (
    <Comp
      className={cn(
        inline ? 'inline-flex' : 'flex',
        directionMap[direction],
        align && alignMap[align],
        justify && justifyMap[justify],
        gap !== undefined && gapMap[String(gap)],
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    />
  );
}
