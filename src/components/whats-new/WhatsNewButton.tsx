import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Megaphone02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSeenUpdates } from '@/hooks/use-seen-updates';
import { WhatsNewSheet } from './WhatsNewSheet';
import { UPDATES, isRecentUpdate } from './updates';
import { useShellNav } from '@/components/shell/use-shell-nav';

/** A pulsing dot: a solid centre under an expanding ring, both on the brand token. */
function UnseenDot() {
  return (
    <span aria-hidden className="absolute top-1 right-1 flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex size-full rounded-full bg-primary" />
    </span>
  );
}

/**
 * The top bar's "What's new" affordance: a quiet megaphone that opens the updates panel,
 * carrying a pulsing dot while any update has not had its write-up opened. The sheet only
 * mounts its content when open, so the closed state costs a button.
 */
export function WhatsNewButton() {
  const { orgId } = useShellNav();
  const [open, setOpen] = useState(false);
  // Only recent updates can raise the dot, so an update nobody ever opened stops
  // pulsing once it ages out rather than nagging forever.
  const { isSeen, hasUnseen, markSeen } = useSeenUpdates(
    UPDATES.filter(isRecentUpdate).map((u) => u.id),
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={hasUnseen ? "What's new, unread updates" : "What's new"}
            onClick={() => setOpen(true)}
            // Plain ghost, matching the feedback trigger beside it. `relative` is the
            // only class here, and it is functional: the unseen dot anchors to it.
            className="relative"
          >
            <HugeiconsIcon icon={Megaphone02Icon} strokeWidth={2} />
            {hasUnseen && <UnseenDot />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>What&rsquo;s new</TooltipContent>
      </Tooltip>
      <WhatsNewSheet
        open={open}
        onOpenChange={setOpen}
        orgId={orgId}
        isSeen={isSeen}
        onUpdateOpened={markSeen}
      />
    </>
  );
}
