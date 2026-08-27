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

/** Pinned top centre, above everything, out of the document flow. */
const PINNED = 'fixed top-3 left-1/2 z-50 -translate-x-1/2';

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
 * else is the standard failure mode of impersonation tooling, so it is deliberately
 * impossible to miss and always one click from the exit.
 */
export function ImpersonationBar() {
  const [open, setOpen] = useState(false);
  const { data: me } = useQuery(meQueryOptions());
  const stop = useStopImpersonation();

  if (!me?.user) return null;

  if (me.impersonation) {
    return (
      <Flex
        align="center"
        gap={3}
        data-testid="impersonation-banner"
        className={`${PINNED} rounded-full border border-warning/40 bg-warning/10 py-1.5 pr-1.5 pl-4 shadow-sm backdrop-blur-sm`}
      >
        <HugeiconsIcon
          icon={IncognitoIcon}
          size={16}
          strokeWidth={1.9}
          className="shrink-0 text-warning"
        />
        <Text as="span" className="text-sm font-medium text-foreground">
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
    );
  }

  if (!me.user.isInternal) return null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        data-testid="impersonate-trigger"
        className={`${PINNED} rounded-full shadow-sm`}
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={UserSwitchIcon} size={16} strokeWidth={1.9} />
        Impersonate
      </Button>
      <ImpersonateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
