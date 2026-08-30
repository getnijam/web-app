import * as React from 'react';
import { createPortal } from 'react-dom';
import { captureViewport, type Screenshot } from '@/lib/capture-screenshot';
import { useTopFeedbackLayer } from '@/lib/feedback-layers';
import { FeedbackContextProvider } from './feedback-context';
import { FeedbackDialog } from './FeedbackDialog';
import { FeedbackTrigger } from './FeedbackTrigger';

/**
 * Renders the trigger's docked copy into whichever dialog or sheet is on top.
 *
 * Suppressed while the feedback dialog itself is open: that dialog registers as a
 * layer like any other, and a trigger inside the feedback form would be absurd.
 */
function DockedTrigger({ suppressed }: { suppressed: boolean }) {
  const layer = useTopFeedbackLayer();
  if (suppressed || !layer) return null;
  return createPortal(<FeedbackTrigger docked />, layer);
}

/**
 * Owns the feedback flow: the capture, the dialog, and the docked trigger.
 *
 * Mounted by the `_authed` layout rather than AppShell so it also covers /orgs and
 * /profile, which render outside the org shell (same reasoning as ImpersonationBar).
 *
 * The capture runs *before* the dialog opens, deliberately. The screenshot is meant to
 * show what the reporter was looking at when they reached for the button, so the
 * feedback form must not be on screen yet.
 */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
  const [screenshot, setScreenshot] = React.useState<Screenshot | null>(null);
  // Bumped on every open so the dialog remounts with a clean form, rather than being
  // reset by an effect. The closing instance keeps its exit animation.
  const [session, setSession] = React.useState(0);

  const start = React.useCallback(() => {
    setCapturing(true);
    void captureViewport().then((captured) => {
      setScreenshot(captured);
      setCapturing(false);
      setSession((n) => n + 1);
      setOpen(true);
    });
  }, []);

  const value = React.useMemo(() => ({ start, capturing }), [start, capturing]);

  return (
    <FeedbackContextProvider value={value}>
      {children}
      <DockedTrigger suppressed={open} />
      <FeedbackDialog key={session} open={open} onOpenChange={setOpen} screenshot={screenshot} />
    </FeedbackContextProvider>
  );
}
