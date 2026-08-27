import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { IncognitoIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { meQueryOptions } from '@/lib/me-query';
import { useStopImpersonation } from '@/hooks/use-impersonation';

/**
 * The "you are signed in as someone else" banner, mounted by the `_authed` layout so
 * it is present on every signed-in page (including `/orgs` and `/profile`, which
 * render outside the org shell). Renders nothing unless an impersonation is active.
 *
 * This is the safety net for the whole feature. Forgetting you are someone else is the
 * standard failure mode of impersonation tooling, so the banner is permanent for as
 * long as the session lasts and always one gesture from the exit. Starting an
 * impersonation lives in the account menu instead, it is a rare action and does not
 * need to sit on screen.
 *
 * It **docks** like the macOS Dock rather than sitting in the way: it occupies the top
 * bar's centre, right where the breadcrumb runs, so it parks 90% off the top edge and
 * slides down when the cursor reaches the edge. At rest the breadcrumb is fully
 * readable and a warning-coloured sliver still signals that something is off.
 *
 * `focus-within` reveals it as well as `hover`, because parked, the Stop button is only
 * a few pixels tall and keyboard users need a way in. `motion-reduce` keeps both
 * positions but drops the slide.
 */
const DOCK =
  'dock-parked hover:dock-open focus-within:dock-open transition-transform duration-200 ease-out motion-reduce:transition-none';

export function ImpersonationBar() {
  const { data: me } = useQuery(meQueryOptions());
  const stop = useStopImpersonation();

  if (!me?.user || !me.impersonation) return null;

  return (
    // pointer-events-none on the wrapper, so its box never swallows a breadcrumb click;
    // the banner itself takes pointer events back.
    <div className="pointer-events-none fixed top-0 left-1/2 z-50 flex -translate-x-1/2 justify-center">
      <Flex
        align="center"
        gap={3}
        data-testid="impersonation-banner"
        className={`pointer-events-auto ${DOCK} rounded-full border border-warning/40 bg-warning/10 py-1.5 pr-1.5 pl-4 shadow-sm backdrop-blur-sm`}
      >
        <HugeiconsIcon
          icon={IncognitoIcon}
          size={16}
          strokeWidth={1.9}
          className="shrink-0 text-warning"
        />
        <Text as="span" className="text-sm font-medium text-nowrap text-foreground">
          Viewing as <span className="font-semibold">{me.user.email}</span>
        </Text>
        <Button
          size="sm"
          variant="outline"
          data-testid="impersonation-stop"
          loading={stop.isPending}
          onClick={() => stop.mutate({})}
        >
          Stop
        </Button>
      </Flex>
    </div>
  );
}
