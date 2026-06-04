import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/components/users/UserAvatar';
import { useClickAway } from '@/hooks/use-click-away';
import { useLogout } from '@/hooks/use-logout';

interface MeUser {
  id?: string;
  email?: string;
  name?: string | null;
  hasAvatar?: boolean;
  avatarUpdatedAt?: string | null;
}

/**
 * Compact account avatar + dropdown (name/email + sign out). `onSignedOut` lets
 * the caller route away after logout (the public nav stays put as a guest;
 * authed pages redirect to /login). Outside-click via {@link useClickAway}.
 */
export function AccountMenu({ user, onSignedOut }: { user: MeUser; onSignedOut?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
  const email = user.email ?? '';
  const name = user.name ?? (email ? email.split('@')[0] : 'Account');

  const logoutMutation = useLogout({
    onSuccess: () => {
      setOpen(false);
      onSignedOut?.();
    },
  });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex rounded-full transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        <UserAvatar
          size="sm"
          className="size-8 rounded-full"
          userId={user.id}
          email={email}
          name={name}
          hasAvatar={user.hasAvatar}
          avatarUpdatedAt={user.avatarUpdatedAt}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
          <Flex
            direction="col"
            className="mb-1 min-w-0 border-b border-border px-2.5 pt-1.5 pb-2 leading-tight"
          >
            <Text as="span" truncate className="text-sm font-semibold">
              {name}
            </Text>
            <Text as="span" truncate className="text-xs text-muted-foreground">
              {email}
            </Text>
          </Flex>
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.8} />
            Account settings
          </Link>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-accent disabled:opacity-60"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
