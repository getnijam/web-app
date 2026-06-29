import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';

type Phase = 'hidden' | 'loading' | 'finishing';

// Trickle toward 90% while loading, snap to 100% when finishing.
const SCALE: Record<Phase, number> = { hidden: 0, loading: 0.9, finishing: 1 };

/**
 * A thin nprogress-style bar at the top of the viewport that fills while a route
 * change is pending (lazy chunk + loaders resolving) and snaps to 100% then fades
 * once it settles. A short delay keeps it from flashing on instant, already-cached
 * navigations. Lives in the root route so it sits inside the router context.
 */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.status === 'pending' });
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    // Delay so instant (already-cached) navigations don't flash the bar; for the
    // finish transition a 0ms timeout keeps the state change off the effect body.
    const delay = pending ? 120 : 0;
    const t = setTimeout(() => {
      setPhase((prev) => {
        if (pending) return 'loading';
        return prev === 'loading' ? 'finishing' : 'hidden';
      });
    }, delay);
    return () => clearTimeout(t);
  }, [pending]);

  const scaleX = SCALE[phase];

  return (
    <AnimatePresence>
      {phase !== 'hidden' && (
        <motion.div
          aria-hidden
          data-slot="route-progress"
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary shadow-progress"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX, opacity: phase === 'finishing' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scaleX: {
              duration: phase === 'finishing' ? 0.2 : 8,
              ease: phase === 'finishing' ? 'easeOut' : [0.05, 0.7, 0.1, 1],
            },
            opacity: { duration: 0.25, delay: phase === 'finishing' ? 0.1 : 0 },
          }}
          onAnimationComplete={() => {
            if (phase === 'finishing') setPhase('hidden');
          }}
        />
      )}
    </AnimatePresence>
  );
}
