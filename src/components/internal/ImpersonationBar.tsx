import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserSwitchIcon, IncognitoIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { meQueryOptions } from '@/lib/me-query';
import { useStopImpersonation } from '@/hooks/use-impersonation';
import { ImpersonateDialog } from './ImpersonateDialog';

/**
 * The dock's own classes. It parks 90% off the top edge and slides down to its
 * resting position on hover or keyboard focus, then parks itself again.
 *
 * `focus-within` matters as much as `hover`: parked, the Stop button is only a few
 * pixels tall, so keyboard users need tabbing to it to bring the dock down too.
 * `motion-reduce` drops the slide for anyone who has asked for less motion, they
 * still get both positions, just instantly.
 */
const DOCK =
  'dock-parked hover:dock-open focus-within:dock-open transition-transform duration-200 ease-out motion-reduce:transition-none';

/**
 * The internal impersonation control, mounted by the `_authed` layout so it is present
 * on every signed-in page (including `/orgs` and `/profile`, which render outside the
 * org shell).
 *
 * Three states, all driven by the `/me` query that `beforeLoad` has already cached, so
 * this costs no extra request:
 *  - ordinary user: renders nothing at all
 *  - internal user: a quiet pill that opens the dialog
 *  - impersonating: a warning-toned strip naming the user you are signed in as
 *
 * That third state is what makes the feature safe to use. Forgetting you are someone
 * else is the standard failure mode of impersonation tooling, so it stays permanently
 * on screen and always one hover from the exit.
 *
 * Both states **dock**: they sit top-centre, directly over the top bar's breadcrumb,
 * so parking them off the edge keeps the breadcrumb readable while leaving a visible
 * tab that says something unusual is going on. The fixed wrapper is
 * `pointer-events-none` so it never swallows a breadcrumb click, and only the control
 * itself takes pointer events back.
 */
function Dock({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed top-0 left-1/2 z-50 flex -translate-x-1/2 justify-center">
      {children}
    </div>
  );
}

export function ImpersonationBar() {
  const [open, setOpen] = useState(false);
  const { data: me } = useQuery(meQueryOptions());
  const stop = useStopImpersonation();

  if (!me?.user) return null;

  if (me.impersonation) {
    return (
      <Dock>
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
      </Dock>
    );
  }

  if (!me.user.isInternal) return null;

  return (
    <>
      <Dock>
        <Button
          size="sm"
          variant="outline"
          data-testid="impersonate-trigger"
          className={`pointer-events-auto ${DOCK} rounded-full shadow-sm`}
          onClick={() => setOpen(true)}
        >
          <HugeiconsIcon icon={UserSwitchIcon} size={16} strokeWidth={1.9} />
          Impersonate
        </Button>
      </Dock>
      <ImpersonateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
