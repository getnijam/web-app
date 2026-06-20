import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareLock02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import type { SecretKeySummary } from '@/client';
import {
  deleteSecretKeyMutation,
  listSecretKeysQueryKey,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { isApiError } from '@/lib/api-error';
import { timeAgo } from '@/lib/format';
import { notify } from '@/lib/notify';
import { ScopeTag } from './ScopeTag';

/** The masked value shown for a key, e.g. `nij_sk_••••••••••••9f2a`. */
function MaskedValue({ prefix, last4 }: { prefix: string; last4: string }) {
  return (
    <Text as="span" className="font-mono text-sm text-muted-foreground">
      {prefix}
      <span className="px-0.5 tracking-tighter">••••••••••••</span>
      {last4}
    </Text>
  );
}

export function KeyRow({ orgId, secretKey }: { orgId: string; secretKey: SecretKeySummary }) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isIngest = secretKey.kind === 'ingest';

  const revoke = useMutation({
    ...deleteSecretKeyMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listSecretKeysQueryKey({ path: { orgId } }),
      });
      setConfirmOpen(false);
      notify.success('Secret key revoked', {
        description: isIngest
          ? `${secretKey.name} can no longer be used to upload runs.`
          : `${secretKey.name} can no longer be used to read test data.`,
      });
    },
    onError: (err) => {
      setConfirmOpen(false);
      notify.error("Couldn't revoke key", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  return (
    <Flex align="center" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <Flex
        align="center"
        justify="center"
        className="size-9.5 shrink-0 rounded-lg bg-muted text-muted-foreground"
      >
        <HugeiconsIcon icon={SquareLock02Icon} size={18} strokeWidth={1.8} />
      </Flex>

      <Flex direction="col" className="min-w-0 flex-1 leading-tight" gap={0.5}>
        <Text as="span" truncate weight="medium">
          {secretKey.name}
        </Text>
        <MaskedValue prefix={secretKey.prefix} last4={secretKey.last4} />
      </Flex>

      <ScopeTag scope={secretKey.scope} project={secretKey.project} />

      <Flex direction="col" align="end" className="hidden shrink-0 leading-tight sm:flex">
        <Text as="span" className="text-xs text-muted-foreground">
          Created {timeAgo(secretKey.createdAt)}
        </Text>
        <Text as="span" className="text-xs text-muted-foreground">
          {secretKey.lastUsedAt ? `Last used ${timeAgo(secretKey.lastUsedAt)}` : 'Never used'}
        </Text>
      </Flex>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Revoke ${secretKey.name}`}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke secret key?</AlertDialogTitle>
            <AlertDialogDescription>
              <Text as="span" weight="medium" className="text-foreground">
                {secretKey.name}
              </Text>{' '}
              (
              <Text as="span" className="font-mono">
                {secretKey.prefix}••••{secretKey.last4}
              </Text>
              ) will stop working immediately —{' '}
              {isIngest
                ? 'any CI pipeline using it will fail to upload results and traces.'
                : 'any MCP agent or integration using it will lose read access.'}{' '}
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={revoke.isPending}
              data-testid="revoke-key-confirm"
              onClick={(e) => {
                e.preventDefault();
                revoke.mutate({ path: { orgId, keyId: secretKey.id } });
              }}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
