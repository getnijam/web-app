import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

/**
 * Fades children up into view once, using Tailwind transition/opacity utilities
 * (no bespoke CSS). Renders a plain div, so it can be a grid/flex item directly.
 * `motion-reduce:transition-none` drops the animation for reduced-motion users.
 */
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out motion-reduce:transition-none',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
