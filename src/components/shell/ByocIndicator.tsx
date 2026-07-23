import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudServerIcon } from '@hugeicons/core-free-icons';
import { getOrgBillingOptions } from '@/client/@tanstack/react-query.gen';
import { Badge } from '@/components/ui/badge';
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
        {/* span wrapper: a non-interactive chip still needs to emit the hover/focus events. */}
        <span
          tabIndex={0}
          aria-label="Bring your own cloud"
          className="inline-flex shrink-0 cursor-default"
        >
          <Badge variant="secondary" className="gap-1.5">
            <HugeiconsIcon
              icon={CloudServerIcon}
              size={13}
              strokeWidth={1.9}
              className="shrink-0"
            />
            <span className="hidden sm:inline">Bring your own cloud</span>
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-center">
        This organization stores its runs and artifacts in your own database and storage. Metered
        usage is waived.
      </TooltipContent>
    </Tooltip>
  );
}
