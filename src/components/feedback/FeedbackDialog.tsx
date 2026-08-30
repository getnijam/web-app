import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouterState } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bug01Icon, Idea01Icon, Comment01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { createFeedbackMutation } from '@/client/@tanstack/react-query.gen';
import type { CreateFeedbackBody } from '@/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ErrorBanner } from '@/components/states/ErrorState';
import { useTheme } from '@/components/theme/ThemeProvider';
import { FEEDBACK_UI_ATTR, type Screenshot } from '@/lib/capture-screenshot';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Kind = CreateFeedbackBody['kind'];

const KINDS: { value: Kind; label: string; icon: typeof Bug01Icon }[] = [
  { value: 'bug', label: 'Bug', icon: Bug01Icon },
  { value: 'idea', label: 'Idea', icon: Idea01Icon },
  { value: 'other', label: 'Other', icon: Comment01Icon },
];

/** The screenshot slot: the thumbnail plus the opt-out, or an honest note if there is none. */
function ScreenshotField({
  screenshot,
  included,
  onToggle,
}: {
  screenshot: Screenshot | null;
  included: boolean;
  onToggle: (included: boolean) => void;
}) {
  if (!screenshot) {
    return (
      <Text variant="caption" color="muted">
        Screenshot unavailable on this page. Your note still sends.
      </Text>
    );
  }

  if (!included) {
    return (
      <Flex align="center" justify="between" gap={2}>
        <Text variant="caption" color="muted">
          Screenshot removed.
        </Text>
        <Button type="button" variant="ghost" size="xs" onClick={() => onToggle(true)}>
          Attach screenshot
        </Button>
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={3} className="rounded-2xl border border-border p-2">
      <img
        src={screenshot.dataUrl}
        alt="Screenshot of the page you were on"
        className="h-14 w-24 shrink-0 rounded-xl border border-border object-cover object-top"
      />
      <Text variant="caption" color="muted" className="min-w-0 flex-1">
        Captured when you opened this.
      </Text>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Remove screenshot"
            onClick={() => onToggle(false)}
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove screenshot from feedback</TooltipContent>
      </Tooltip>
    </Flex>
  );
}

/**
 * The feedback form. Opened by FeedbackProvider once the screenshot is in hand, so the
 * image is of the page behind it, never of this dialog.
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  screenshot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenshot: Screenshot | null;
}) {
  // FeedbackProvider remounts this dialog per open (via `key`), so plain initial
  // state is a clean form every time. A note declined on one report does not silently
  // drop the screenshot from the next one.
  const [kind, setKind] = React.useState<Kind>('bug');
  const [message, setMessage] = React.useState('');
  const [included, setIncluded] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { resolvedTheme } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = useParams({ strict: false }) as {
    orgId?: string;
    projectId?: string;
    runId?: string;
  };

  const mutation = useMutation({
    ...createFeedbackMutation(),
    onSuccess: () => {
      onOpenChange(false);
      notify.success('Feedback sent', { description: 'Thanks, we read every one.' });
    },
    onError: (err) => {
      if (isApiError(err)) {
        setFormError(err.error.message);
        return;
      }
      setFormError('Something went wrong. Please try again.');
    },
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const attach = included && screenshot;
    mutation.mutate({
      body: {
        kind,
        message: message.trim(),
        orgId: params.orgId,
        context: {
          path: pathname,
          projectId: params.projectId,
          runId: params.runId,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          theme: resolvedTheme,
        },
        screenshot: attach ? screenshot.base64 : null,
        // Only a deliberate removal counts as declined; a capture that failed is a
        // different fact, and the API keeps them apart.
        screenshotDeclined: Boolean(screenshot) && !included,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" {...{ [FEEDBACK_UI_ATTR]: '' }}>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>Goes to the Nijam team with the page you were on.</DialogDescription>
        </DialogHeader>

        <Flex as="form" id="feedback-form" direction="col" gap={4} onSubmit={onSubmit}>
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <ToggleGroup
            type="single"
            value={kind}
            onValueChange={(value) => value && setKind(value as Kind)}
            variant="outline"
            className="w-fit"
          >
            {KINDS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label}>
                <HugeiconsIcon icon={option.icon} size={14} strokeWidth={1.8} />
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Flex direction="col" gap={1.5}>
            <Label htmlFor="feedback-message" className="sr-only">
              Your feedback
            </Label>
            <Textarea
              id="feedback-message"
              autoFocus
              rows={5}
              maxLength={4000}
              placeholder="What's broken, missing, or slow?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-28"
            />
          </Flex>

          <ScreenshotField screenshot={screenshot} included={included} onToggle={setIncluded} />
        </Flex>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="feedback-form"
            loading={mutation.isPending}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
