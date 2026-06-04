import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Settings01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/components/users/UserAvatar';
import { AccountDialog } from '@/components/account/AccountDialog';
import { useClickAway } from '@/hooks/use-click-away';
import { useLogout } from '@/hooks/use-logout';
import { oauthErrorMessage } from '@/lib/oauth-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

export type AccountMenuVariant = 'sidebar' | 'topnav';

/**
 * One avatar + account dropdown for **both** nav contexts, switched by `variant`:
 * `sidebar` (dashboard — full-width trigger, opens upward) and `topnav` (outside the
 * dashboard — compact avatar, opens downward). Owns the shared account-settings
 * dialog and re-opens it (with a toast) after an OAuth "connect" round-trip.
 *
 * `onSignedOut` runs after sign-out (e.g. route to /login); omit it to stay put as a
 * guest (the public nav re-renders itself).
 */
export function AccountMenu({
  variant,
  onSignedOut,
}: {
  variant: AccountMenuVariant;
  onSignedOut?: () => void;
}) {
  const me = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 });
  const user = me.data?.user;
  const email = user?.email ?? '';
  const name = user?.name ?? (email ? email.split('@')[0] : 'Account');

  const [open, setOpen] = useState(false);
  // A "connect" click leaves the SPA and returns here with ?connected / ?connectError.
  // Derive the dialog's initial open-state from that at mount (no setState-in-effect).
  const [dialogOpen, setDialogOpen] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.has('connected') || p.has('connectError');
  });
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
  const logout = useLogout({
    onSuccess: () => {
      setOpen(false);
      onSignedOut?.();
    },
  });

  // Side effects for that round-trip: toast the result and strip the params so a
  // refresh doesn't repeat it. (Re-opening is handled by the initial state above.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const connectError = params.get('connectError');
    if (!connected && !connectError) return;
    if (connected) {
      notify.success('Connected', { description: `Your ${connected} account is now linked.` });
    } else {
      const msg = oauthErrorMessage(connectError ?? undefined);
      if (msg) notify.error("Couldn't connect", { description: msg });
    }
    params.delete('connected');
    params.delete('connectError');
    const qs = params.toString();
    const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
    window.history.replaceState(null, '', url);
  }, []);

  const menu = (
    <>
      <Flex align="center" gap={2.5} className="mb-1.5 border-b border-border px-2 pt-2 pb-2.5">
        <UserAvatar
          size="sm"
          className="size-7.5 rounded-full"
          userId={user?.id}
          email={email}
          name={name}
          hasAvatar={user?.hasAvatar}
          avatarUpdatedAt={user?.avatarUpdatedAt}
        />
        <Flex direction="col" className="min-w-0 leading-tight">
          <Text as="span" truncate className="text-sm font-semibold">
            {name}
          </Text>
          <Text as="span" truncate className="text-xs text-muted-foreground">
            {email}
          </Text>
        </Flex>
      </Flex>
      <Button
        variant="ghost"
        type="button"
        onClick={() => {
          setOpen(false);
          setDialogOpen(true);
        }}
        className="h-auto w-full justify-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
      >
        <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.8} />
        Account settings
      </Button>
      <Button
        variant="ghost"
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="h-auto w-full justify-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-destructive hover:bg-accent disabled:opacity-60"
      >
        <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.8} />
        Sign out
      </Button>
    </>
  );

  return (
    <div ref={ref} className="relative">
      {open &&
        (variant === 'sidebar' ? (
          <div className="absolute right-0 bottom-full left-0 z-50 mb-2 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            {menu}
          </div>
        ) : (
          <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            {menu}
          </div>
        ))}

      {variant === 'sidebar' ? (
        <Button
          variant="ghost"
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'h-auto w-full justify-start gap-2.5 rounded-lg border border-sidebar-border bg-card p-2 text-left',
            open && 'bg-accent',
          )}
        >
          <UserAvatar
            size="sm"
            className="size-8 rounded-full text-sm"
            userId={user?.id}
            email={email}
            name={name}
            hasAvatar={user?.hasAvatar}
            avatarUpdatedAt={user?.avatarUpdatedAt}
          />
          <Flex direction="col" className="min-w-0 leading-tight">
            <Text as="span" truncate className="text-sm font-semibold">
              {name}
            </Text>
            <Text as="span" truncate className="text-xs text-muted-foreground">
              {email}
            </Text>
          </Flex>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            strokeWidth={1.8}
            className={cn(
              'ml-auto shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Account menu"
          onClick={() => setOpen((o) => !o)}
          className="size-8 rounded-full p-0 hover:bg-transparent hover:opacity-80"
        >
          <UserAvatar
            size="sm"
            className="size-8 rounded-full"
            userId={user?.id}
            email={email}
            name={name}
            hasAvatar={user?.hasAvatar}
            avatarUpdatedAt={user?.avatarUpdatedAt}
          />
        </Button>
      )}

      <AccountDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
