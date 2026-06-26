import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import {
  getMeQueryKey,
  setupMyTotpMutation,
  enableMyTotpMutation,
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
import { CopyField } from '@/components/ui/copy-field';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { BackupCodesPanel } from '@/components/account/BackupCodes';
import { track } from '@/lib/betterstack';
import { isApiError } from '@/lib/api-error';

/**
 * Guided TOTP enrollment: scan the QR (or enter the secret) in an authenticator app,
 * confirm a code to enable, then save the one-time backup codes (shown only here).
 */
export function TwoFactorSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const setup = useMutation(setupMyTotpMutation());
  const { mutate: runSetup, reset: resetSetup } = setup;

  // Begin setup when the dialog opens (firing the mutation is an external-system sync,
  // not a setState). Closing/resetting state lives in `close()` below, not here.
  useEffect(() => {
    if (open) runSetup({});
  }, [open, runSetup]);

  // Single close path so every dismissal (X, escape, Cancel, Done) clears state, so a
  // reopen mints a fresh secret instead of reusing stale data.
  const close = useCallback(() => {
    setCode('');
    setFormError(null);
    setBackupCodes(null);
    resetSetup();
    onOpenChange(false);
  }, [resetSetup, onOpenChange]);

  const enable = useMutation({
    ...enableMyTotpMutation(),
    onSuccess: async (data) => {
      track('two_factor_enabled');
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      setBackupCodes(data.backupCodes);
    },
    onError: (err) => {
      if (isApiError(err) && err.error.code === 'INVALID_TOTP_CODE') {
        setFormError(err.error.message);
      } else {
        setFormError(
          isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
        );
      }
    },
  });

  const onConfirm = () => {
    setFormError(null);
    enable.mutate({ body: { code: code.trim() } });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        {backupCodes ? (
          <BackupCodesStep codes={backupCodes} onDone={close} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Set up two-factor authentication</DialogTitle>
              <DialogDescription>
                Scan this QR code with an authenticator app (Google Authenticator, 1Password,
                Authy), then enter the 6-digit code it shows.
              </DialogDescription>
            </DialogHeader>

            {setup.isPending && <LoadingState message="Preparing…" />}
            {setup.isError && (
              <ErrorBanner>
                {isApiError(setup.error) ? setup.error.error.message : 'Could not start setup.'}
              </ErrorBanner>
            )}

            {setup.data && (
              <Flex direction="col" gap={5}>
                <Flex justify="center">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <QRCodeSVG value={setup.data.otpauthUri} size={176} />
                  </div>
                </Flex>

                <Flex direction="col" gap={1.5}>
                  <Text variant="caption" color="muted">
                    Or enter this key manually:
                  </Text>
                  <CopyField value={setup.data.secret} />
                </Flex>

                <Flex
                  as="form"
                  direction="col"
                  gap={1.5}
                  onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm();
                  }}
                >
                  <Label htmlFor="totp-confirm-code">Verification code</Label>
                  <Input
                    id="totp-confirm-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <FieldError message={formError ?? undefined} />
                </Flex>
              </Flex>
            )}

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                loading={enable.isPending}
                disabled={!setup.data || code.trim().length < 6}
              >
                Enable
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Final step: present the backup codes with copy/download and a confirm-to-close. */
function BackupCodesStep({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <>
      <DialogHeader>
        <Flex align="center" gap={2}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-success" />
          <DialogTitle>Two-factor authentication enabled</DialogTitle>
        </Flex>
        <DialogDescription>
          Save these recovery codes somewhere safe. Each works once if you lose your authenticator.
          They won't be shown again.
        </DialogDescription>
      </DialogHeader>

      <BackupCodesPanel codes={codes} />

      <DialogFooter>
        <Button type="button" onClick={onDone}>
          I've saved my codes
        </Button>
      </DialogFooter>
    </>
  );
}
