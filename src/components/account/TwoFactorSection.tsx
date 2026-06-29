import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SecurityPasswordIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
} from '@hugeicons/core-free-icons';
import type { UserPublic } from '@/client';
import {
  getMeQueryKey,
  disableMyTotpMutation,
  regenerateMyBackupCodesMutation,
} from '@/client/@tanstack/react-query.gen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { AccountSection } from '@/components/account/AccountSection';
import { TwoFactorSetupDialog } from '@/components/account/TwoFactorSetupDialog';
import { BackupCodesPanel } from '@/components/account/BackupCodes';
import { FieldError } from '@/components/auth/AuthLayout';
import { track } from '@/lib/betterstack';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

/** Two-factor authentication: enable (QR setup), disable, and regenerate backup codes. */
export function TwoFactorSection({ user }: { user: UserPublic }) {
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);

  return (
    <AccountSection
      title="Two-factor authentication"
      description="Add a one-time code from an authenticator app as a second step when you sign in."
    >
      <Flex align="start" gap={3} className="sm:items-center">
        <HugeiconsIcon
          icon={SecurityPasswordIcon}
          size={20}
          className="mt-0.5 shrink-0 text-muted-foreground sm:mt-0"
        />
        <Flex
          direction="col"
          gap={3}
          className="min-w-0 flex-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <Flex direction="col" className="min-w-0 flex-1">
            <Flex align="center" justify="between" gap={2}>
              <Text as="span" className="min-w-0 truncate text-sm font-medium">
                Authenticator app
              </Text>
              {user.twoFactorEnabled ? (
                <StatusBadge icon={CheckmarkCircle02Icon} label="On" tone="success" />
              ) : (
                <StatusBadge icon={CircleIcon} label="Off" variant="outline" />
              )}
            </Flex>
            <Text as="span" className="text-xs text-muted-foreground">
              {user.twoFactorEnabled
                ? "You'll enter a code from your authenticator app when signing in."
                : 'Protect your account with time-based one-time codes.'}
            </Text>
          </Flex>

          {user.twoFactorEnabled ? (
            <Flex gap={2} className="shrink-0 self-start sm:self-auto">
              <Button variant="outline" size="sm" onClick={() => setRegenOpen(true)}>
                Backup codes
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDisableOpen(true)}>
                Disable
              </Button>
            </Flex>
          ) : (
            <Button
              size="sm"
              className="shrink-0 self-start sm:self-auto"
              onClick={() => setSetupOpen(true)}
            >
              Enable
            </Button>
          )}
        </Flex>
      </Flex>

      <TwoFactorSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      <DisableDialog user={user} open={disableOpen} onOpenChange={setDisableOpen} />
      <RegenerateDialog user={user} open={regenOpen} onOpenChange={setRegenOpen} />
    </AccountSection>
  );
}

/** Disable 2FA, re-auth with password (or a live code for OAuth-only accounts). */
function DisableDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const disable = useMutation({
    ...disableMyTotpMutation(),
    onSuccess: async () => {
      track('two_factor_disabled');
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      onOpenChange(false);
      notify.success('Two-factor disabled', {
        description: 'You will no longer be asked for a code when signing in.',
      });
    },
  });

  return (
    <ReauthDialog
      user={user}
      open={open}
      onOpenChange={onOpenChange}
      title="Disable two-factor authentication"
      description="This removes the second step from your sign-in. Confirm it's you to continue."
      confirmLabel="Disable two-factor"
      destructive
      pending={disable.isPending}
      error={disable.error}
      onSubmit={(body) => disable.mutate({ body })}
    />
  );
}

/** Regenerate backup codes, re-auth, then show the fresh codes (old ones stop working). */
function RegenerateDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [codes, setCodes] = useState<string[] | null>(null);
  const regen = useMutation({
    ...regenerateMyBackupCodesMutation(),
    onSuccess: (data) => {
      track('backup_codes_regenerated');
      setCodes(data.backupCodes);
    },
  });

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setCodes(null);
      regen.reset();
    }
  };

  if (codes) {
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New backup codes</DialogTitle>
            <DialogDescription>
              Your previous codes no longer work. Save these somewhere safe, each works once.
            </DialogDescription>
          </DialogHeader>
          <BackupCodesPanel codes={codes} />
          <DialogFooter>
            <Button type="button" onClick={() => close(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ReauthDialog
      user={user}
      open={open}
      onOpenChange={close}
      title="Regenerate backup codes"
      description="This replaces all of your existing backup codes. Confirm it's you to continue."
      confirmLabel="Regenerate codes"
      pending={regen.isPending}
      error={regen.error}
      onSubmit={(body) => regen.mutate({ body })}
    />
  );
}

type ReauthBody = { password?: string; code?: string };

/**
 * Shared confirmation dialog for sensitive 2FA changes. Accounts with a password
 * re-enter it; OAuth-only accounts enter a current authenticator/backup code.
 */
function ReauthDialog({
  user,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  pending,
  error,
  onSubmit,
}: {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  pending: boolean;
  error: unknown;
  onSubmit: (body: ReauthBody) => void;
}) {
  const [value, setValue] = useState('');
  const usePassword = user.hasPassword;

  const submit = () => {
    onSubmit(usePassword ? { password: value } : { code: value.trim() });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue('');
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Flex
          as="form"
          direction="col"
          gap={1.5}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Label htmlFor="reauth-input">
            {usePassword ? 'Current password' : 'Authenticator or backup code'}
          </Label>
          <Input
            id="reauth-input"
            type={usePassword ? 'password' : 'text'}
            autoComplete={usePassword ? 'current-password' : 'one-time-code'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <FieldError message={isApiError(error) ? error.error.message : undefined} />
        </Flex>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            loading={pending}
            disabled={value.trim().length === 0}
            onClick={submit}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
