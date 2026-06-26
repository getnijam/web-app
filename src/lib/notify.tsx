import * as React from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  MultiplicationSignCircleIcon,
  InformationCircleIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'error' | 'info' | 'message';

const VARIANT: Record<
  Variant,
  { icon: IconSvgElement | null; iconClass: string; barClass: string }
> = {
  success: { icon: CheckmarkCircle02Icon, iconClass: 'text-success', barClass: 'bg-success' },
  error: {
    icon: MultiplicationSignCircleIcon,
    iconClass: 'text-destructive',
    barClass: 'bg-destructive',
  },
  info: { icon: InformationCircleIcon, iconClass: 'text-info', barClass: 'bg-info' },
  message: { icon: null, iconClass: 'text-muted-foreground', barClass: 'bg-primary' },
};

const DEFAULT_DURATION = 5000;

interface ProgressToastProps {
  id: string | number;
  variant: Variant;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration: number;
}

/**
 * A self-dismissing toast with a bottom progress bar. We own the timer
 * (requestAnimationFrame) so the bar tracks remaining time exactly and pauses
 * while the pointer/focus is on the toast; at zero it dismisses itself. Rendered
 * via sonner's `toast.custom` with `duration: Infinity` so sonner doesn't also
 * try to dismiss it.
 */
function ProgressToast({ id, variant, title, description, duration }: ProgressToastProps) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);
  const v = VARIANT[variant];

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) elapsed += dt;
      const remaining = Math.max(0, 1 - elapsed / duration);
      if (barRef.current) barRef.current.style.transform = `scaleX(${remaining})`;
      if (elapsed >= duration) {
        toast.dismiss(id);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, id]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      role="status"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg"
    >
      <Flex align="start" gap={3} className="p-4 pr-10">
        {v.icon && (
          <HugeiconsIcon
            icon={v.icon}
            size={18}
            strokeWidth={2}
            className={cn('mt-0.5 shrink-0', v.iconClass)}
          />
        )}
        <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
          <Text as="div" weight="semibold" className="text-sm">
            {title}
          </Text>
          {description && (
            <Text as="div" color="muted" className="text-sm">
              {description}
            </Text>
          )}
        </Flex>
      </Flex>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => toast.dismiss(id)}
        className="absolute top-2 right-2 grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
      </button>

      {/* auto-close progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
        <div
          ref={barRef}
          className={cn('h-full origin-left', v.barClass)}
          style={{ transform: 'scaleX(1)' }}
        />
      </div>
    </div>
  );
}

interface NotifyOptions {
  description?: React.ReactNode;
  /** Auto-close time in ms (default 5000). */
  duration?: number;
}

function show(variant: Variant, title: React.ReactNode, opts: NotifyOptions = {}) {
  const duration = opts.duration ?? DEFAULT_DURATION;
  return toast.custom(
    (id) => (
      <ProgressToast
        id={id}
        variant={variant}
        title={title}
        description={opts.description}
        duration={duration}
      />
    ),
    // We control dismissal; sonner just hosts/positions/animates the toast.
    { unstyled: true, duration: Infinity },
  );
}

/**
 * App toast API, a progress-bar toast that auto-closes, pauses on hover/focus,
 * and has a close button. Prefer this over importing sonner's `toast` directly.
 */
export const notify = {
  success: (title: React.ReactNode, opts?: NotifyOptions) => show('success', title, opts),
  error: (title: React.ReactNode, opts?: NotifyOptions) => show('error', title, opts),
  info: (title: React.ReactNode, opts?: NotifyOptions) => show('info', title, opts),
  message: (title: React.ReactNode, opts?: NotifyOptions) => show('message', title, opts),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
