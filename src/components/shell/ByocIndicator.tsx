import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudServerIcon } from '@hugeicons/core-free-icons';
import { getOrgBillingOptions } from '@/client/@tanstack/react-query.gen';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useShellNav } from './use-shell-nav';

/**
 * A small header chip shown only when the current org runs on bring your own cloud, so members
 * always know their runs and artifacts live in their own database and storage. The `byoc` flag
 * comes from the org's billing (member-readable); the TopBar mounts once, so this is one query.
 */
export function ByocIndicator() {
  const { orgId } = useShellNav();
  const billing = useQuery({
    ...getOrgBillingOptions({ path: { orgId } }),
    enabled: Boolean(orgId),
  });

  if (!billing.data?.byoc) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* icon-only, non-interactive; the span still emits the hover/focus events. */}
        <span
          tabIndex={0}
          aria-label="Bring your own cloud"
          className="inline-flex shrink-0 cursor-default text-success transition-colors hover:text-success/80"
        >
          <HugeiconsIcon icon={CloudServerIcon} size={18} strokeWidth={1.9} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <span className="flex flex-col gap-0.5 text-left">
          <span className="font-semibold">BYOC</span>
          <span className="text-background/80">
            This organization stores its runs and artifacts in your own database and storage.
            Metered usage is waived.
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
