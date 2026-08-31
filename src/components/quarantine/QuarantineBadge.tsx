import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldBanIcon } from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * The "this test is parked" chip. Info-toned rather than warning: a quarantined test is
 * a known, deliberate decision, not something shouting for attention (that is what the
 * amber flaky pill is for).
 */
export function QuarantineBadge({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'inline-flex shrink-0 cursor-default items-center gap-1 rounded-full bg-info/15 px-2 py-0.5 text-xs font-medium text-info',
            className,
          )}
        >
          <HugeiconsIcon icon={ShieldBanIcon} size={12} />
          Quarantined
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        This test still runs, but its failures no longer mark the run as failed. If you use the
        Nijam check on your pull requests, it stays green.
      </TooltipContent>
    </Tooltip>
  );
}
