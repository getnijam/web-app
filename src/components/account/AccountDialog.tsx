import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { LoadingState } from '@/components/states/LoadingState';
import { ProfileSection } from '@/components/account/ProfileSection';
import { PasswordSection } from '@/components/account/PasswordSection';
import { ConnectedAccounts } from '@/components/account/ConnectedAccounts';

/**
 * Account settings as a modal — profile, password, and connected logins. Shared by
 * both nav contexts (dashboard + top nav) via {@link AccountMenu}; the body scrolls
 * on short screens.
 */
export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-w-xl flex-col"
        // Cap the modal height via inline style — a tailwind-merge-safe way to override
        // DialogContent's base classes (a custom `max-h-*` utility gets dropped there).
        style={{ maxHeight: 'min(85vh, 48rem)' }}
      >
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Your profile, password, and connected logins.</DialogDescription>
        </DialogHeader>
        {user ? (
          // flex-1 + min-h-0 lets this body shrink within the capped dialog so it
          // actually scrolls (otherwise the last section overflows off-screen). Flat
          // sections separated by a thin divider — no card/row chrome.
          <Flex direction="col" gap={6} className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
            <ProfileSection user={user} />
            <div className="h-px bg-border" />
            <PasswordSection user={user} />
            <div className="h-px bg-border" />
            <ConnectedAccounts user={user} />
          </Flex>
        ) : (
          <LoadingState />
        )}
      </DialogContent>
    </Dialog>
  );
}
