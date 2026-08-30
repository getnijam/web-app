import { HugeiconsIcon } from '@hugeicons/react';
import { BubbleChatIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FEEDBACK_UI_ATTR } from '@/lib/capture-screenshot';
import { useFeedback } from './feedback-context';
import { cn } from '@/lib/utils';

/**
 * The "send feedback" affordance. Two hosts, one component: it sits in the top bar
 * beside What's new (out / in), and docks into the top-right of an open dialog or
 * sheet when there is one (see FeedbackProvider).
 *
 * `data-feedback-ui` keeps the button, and its tooltip, out of the screenshot it is
 * about to take.
 */
export function FeedbackTrigger({ docked = false }: { docked?: boolean }) {
  const { start, capturing } = useFeedback();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={start}
          loading={capturing}
          aria-label="Send feedback"
          {...{ [FEEDBACK_UI_ATTR]: '' }}
          // Docked: the close button owns top-4 right-4, so this takes the slot beside
          // it. The layer is `fixed`, which is its own containing block.
          className={cn(docked && 'absolute top-4 right-14')}
        >
          <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={2} />
        </Button>
      </TooltipTrigger>
      <TooltipContent {...{ [FEEDBACK_UI_ATTR]: '' }}>Send feedback</TooltipContent>
    </Tooltip>
  );
}
