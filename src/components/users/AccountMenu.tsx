import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Logout01Icon,
  Settings01Icon,
  ArrowDown01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { getMeOptions, listMyInvitationsOptions } from '@/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/components/users/UserAvatar';
import { useClickAway } from '@/hooks/use-click-away';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';

export type AccountMenuVariant = 'sidebar' | 'topnav';

/**
 * One avatar + account dropdown for **both** nav contexts, switched by `variant`:
 * `sidebar` (dashboard — full-width trigger, opens upward) and `topnav` (outside the
 * dashboard — compact avatar, opens downward). "Account settings" links to the
 * full-page `/profile` settings area.
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

  // Pending org invitations — surfaced here because login now lands returning users
  // straight in their org (skipping the /orgs picker where invites used to show).
  const invites = useQuery({ ...listMyInvitationsOptions(), retry: false, staleTime: 60 * 1000 });
  const inviteCount = invites.data?.invitations.length ?? 0;

  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
  const logout = useLogout({
    onSuccess: () => {
      setOpen(false);
      onSignedOut?.();
    },
  });

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
      {inviteCount > 0 && (
        <Button
          asChild
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
        >
          <Link to="/profile" hash="invitations" onClick={() => setOpen(false)}>
            <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} className="text-primary" />
            <span className="flex-1">Pending invitations</span>
            <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
              {inviteCount}
            </span>
          </Link>
        </Button>
      )}
      <Button
        asChild
        variant="ghost"
        className="h-auto w-full justify-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
      >
        <Link to="/profile" onClick={() => setOpen(false)}>
          <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.8} />
          Account settings
        </Link>
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

  // Notification dot on the (closed) trigger avatar so pending invitations are visible
  // without opening the menu. Hidden while open (the menu item shows the count then).
  const notifDot =
    inviteCount > 0 && !open ? (
      <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
        <span className="size-2.5 rounded-full bg-primary ring-2 ring-background" />
        <span className="sr-only">{inviteCount} pending invitations</span>
      </span>
    ) : null;

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
          <span className="relative shrink-0">
            <UserAvatar
              size="sm"
              className="size-8 rounded-full text-sm"
              userId={user?.id}
              email={email}
              name={name}
              hasAvatar={user?.hasAvatar}
              avatarUpdatedAt={user?.avatarUpdatedAt}
            />
            {notifDot}
          </span>
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
          aria-label={
            inviteCount > 0 ? `Account menu, ${inviteCount} pending invitations` : 'Account menu'
          }
          onClick={() => setOpen((o) => !o)}
          className="relative size-8 rounded-full p-0 hover:bg-transparent hover:opacity-80"
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
          {notifDot}
        </Button>
      )}
    </div>
  );
}
