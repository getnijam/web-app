import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckmarkCircle02Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import type { OrgDomainItem } from '@/client';
import {
  listOrgDomainsOptions,
  listOrgDomainsQueryKey,
  getOrgBillingOptions,
  addOrgDomainMutation,
  verifyOrgDomainMutation,
  removeOrgDomainMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { CopyField } from '@/components/ui/copy-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { DomainProUpsell } from '@/components/orgs/VerifyDomainCallout';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

/**
 * The shared Domains section: verify the email domains your org owns (DNS TXT). Verified
 * domains power both SSO and verified-domain auto-join. Pro-only. Rendered admin-only.
 */
export function OrgDomainVerification({ orgId }: { orgId: string }) {
  const billing = useQuery(getOrgBillingOptions({ path: { orgId } }));
  const domains = useQuery(listOrgDomainsOptions({ path: { orgId } }));

  if (billing.isLoading) return <LoadingState />;
  if (billing.error || !billing.data) {
    return <ErrorState error={billing.error} onRetry={() => billing.refetch()} />;
  }
  if (billing.data.plan !== 'pro') {
    return (
      <DomainProUpsell
        orgId={orgId}
        title="Domains"
        description="Verify a domain your team owns, then use it for single sign-on and to let teammates join automatically. Upgrade to Pro to add and verify domains."
      />
    );
  }

  if (domains.isLoading) return <LoadingState />;
  if (domains.error || !domains.data) {
    return <ErrorState error={domains.error} onRetry={() => domains.refetch()} />;
  }

  return <DomainsPanel orgId={orgId} domains={domains.data.domains} />;
}

function DomainsPanel({ orgId, domains }: { orgId: string; domains: OrgDomainItem[] }) {
  const queryClient = useQueryClient();
  const queryKey = listOrgDomainsQueryKey({ path: { orgId } });
  const [newDomain, setNewDomain] = useState('');

  const writeCache = (data: unknown) => queryClient.setQueryData(queryKey, data);
  const onErr = (title: string) => (err: unknown) =>
    notify.error(title, {
      description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
    });

  const add = useMutation({
    ...addOrgDomainMutation(),
    onSuccess: (data) => {
      writeCache(data);
      setNewDomain('');
      notify.success('Domain added', { description: 'Publish the TXT record, then verify it.' });
    },
    onError: onErr("Couldn't add domain"),
  });

  const verify = useMutation({
    ...verifyOrgDomainMutation(),
    onSuccess: (data) => {
      writeCache(data);
      notify.success('Domain verified', {
        description: 'You can now use it for SSO and auto-join.',
      });
    },
    onError: onErr("Couldn't verify domain"),
  });

  const remove = useMutation({
    ...removeOrgDomainMutation(),
    onSuccess: writeCache,
    onError: onErr("Couldn't remove domain"),
  });

  return (
    <SettingsPanel title="Domains">
      {domains.length === 0 && (
        <Flex className="px-5 py-5">
          <Text color="muted" className="text-sm">
            Add a domain your team owns (e.g. company.com) and verify it via DNS. Verified domains
            can then be used for single sign-on and verified-domain auto-join.
          </Text>
        </Flex>
      )}

      {domains.map((d) => (
        <DomainRow
          key={d.id}
          domain={d}
          onVerify={() => verify.mutate({ path: { orgId, domainId: d.id } })}
          verifying={verify.isPending && verify.variables?.path.domainId === d.id}
          onRemove={() => remove.mutate({ path: { orgId, domainId: d.id } })}
          removing={remove.isPending && remove.variables?.path.domainId === d.id}
        />
      ))}

      <Flex
        as="form"
        gap={2}
        className="px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (newDomain.trim()) add.mutate({ path: { orgId }, body: { domain: newDomain.trim() } });
        }}
      >
        <Label htmlFor="new-domain" className="sr-only">
          Add domain
        </Label>
        <Input
          id="new-domain"
          placeholder="company.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="outline" loading={add.isPending} disabled={!newDomain.trim()}>
          Add domain
        </Button>
      </Flex>
    </SettingsPanel>
  );
}

/** One domain: status, verify/remove, and the DNS record while unverified. */
function DomainRow({
  domain,
  onVerify,
  verifying,
  onRemove,
  removing,
}: {
  domain: OrgDomainItem;
  onVerify: () => void;
  verifying: boolean;
  onRemove: () => void;
  removing: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Flex direction="col" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <Flex align="center" justify="between" gap={3} className="flex-wrap">
        <Flex align="center" gap={2.5}>
          <Text as="span" className="font-mono text-sm font-semibold">
            {domain.domain}
          </Text>
          {domain.verified ? (
            <StatusBadge icon={CheckmarkCircle02Icon} label="Verified" tone="success" />
          ) : (
            <StatusBadge icon={AlertCircleIcon} label="Pending" tone="warning" variant="outline" />
          )}
        </Flex>
        <Flex align="center" gap={2}>
          {!domain.verified && (
            <Button size="sm" variant="outline" loading={verifying} onClick={onVerify}>
              Verify
            </Button>
          )}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Remove
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {domain.domain}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any feature relying on this domain (single sign-on routing, auto-join) will stop
                  for <span className="font-medium text-foreground">@{domain.domain}</span> emails.
                  Existing members are unaffected. You can add and re-verify it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  loading={removing}
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove();
                  }}
                >
                  Remove domain
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Flex>

      {!domain.verified && (
        <Flex direction="col" gap={2.5} className="rounded-lg bg-muted/40 px-3.5 py-3">
          <Text as="span" className="text-xs text-muted-foreground">
            Add this DNS TXT record, then click Verify:
          </Text>
          <Flex direction="col" gap={1}>
            <Text as="span" className="text-xs font-medium text-muted-foreground">
              Name
            </Text>
            <CopyField value={domain.txtName} />
          </Flex>
          <Flex direction="col" gap={1}>
            <Text as="span" className="text-xs font-medium text-muted-foreground">
              Value
            </Text>
            <CopyField value={domain.txtValue} />
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
