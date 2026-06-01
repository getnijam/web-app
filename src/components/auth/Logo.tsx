import { useId } from 'react';
import { cn } from '@/lib/utils';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * The Nijam brand mark — a single self-contained SVG (rounded-square gradient +
 * check), so it renders identically everywhere regardless of CSS context. (The
 * old approach wrapped the check in a `bg-brand`/`rounded` div, whose corner
 * radius drifted under containers that override `--radius`, e.g. the sidebar.)
 * Colours stay token-driven via the brand `--primary`/`--info` gradient.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--primary)" />
          <stop
            offset="1"
            style={{ stopColor: 'color-mix(in oklab, var(--primary) 60%, var(--info))' }}
          />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="8" fill={`url(#${id})`} />
      <path
        d="M7 12.3l3.4 3.4 6.8-7"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Nijam brand lockup: the mark + wordmark. The portion from the first "." onward
 * is muted (e.g. "Nijam" bold + ".dev").
 */
export function Logo({ className, label = 'Nijam.dev' }: { className?: string; label?: string }) {
  const dot = label.indexOf('.');
  const head = dot >= 0 ? label.slice(0, dot) : label;
  const tail = dot >= 0 ? label.slice(dot) : '';

  return (
    <Flex as="span" inline align="center" gap={2.5} className={className}>
      <LogoMark className="size-7.5 drop-shadow-sm" />
      <Text as="span" className="text-base font-semibold tracking-tight">
        {head}
        {tail && <span className="font-medium text-muted-foreground">{tail}</span>}
      </Text>
    </Flex>
  );
}
