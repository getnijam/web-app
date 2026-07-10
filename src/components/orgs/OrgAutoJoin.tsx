import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrgDomainItem } from '@/client';
import {
  listOrgDomainsOptions,
  listOrgDomainsQueryKey,
  getOrgBillingOptions,
  updateOrgDomainMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { VerifyDomainCallout, DomainProUpsell } from '@/components/orgs/VerifyDomainCallout';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';

/**
 * The Users-section auto-join control: for each VERIFIED domain, a toggle that lets anyone
 * with a matching verified email join the org as a member. Domains are verified elsewhere
 * (the shared Domains section), so when none are verified this shows a highlighted link to
 * go verify one. Pro-only. Rendered admin-only.
 */
export function OrgAutoJoin({ orgId }: { orgId: string }) {
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
        title="Domain access"
        description="Let anyone with a verified email on a domain you own join this organization automatically. Upgrade to Pro to enable it."
      />
    );
  }

  if (domains.isLoading) return <LoadingState />;
  if (domains.error || !domains.data) {
    return <ErrorState error={domains.error} onRetry={() => domains.refetch()} />;
  }

  const verified = domains.data.domains.filter((d) => d.verified);

  return (
    <SettingsPanel title="Domain access">
      {verified.length === 0 ? (
        <Flex direction="col" gap={3} className="px-5 py-4">
          <Text as="span" className="text-sm text-muted-foreground">
            Let anyone with a verified email on a domain you own join this organization as a member.
          </Text>
          <VerifyDomainCallout
            orgId={orgId}
            message="Verify a domain to enable auto-join for your team."
          />
        </Flex>
      ) : (
        verified.map((d) => <AutoJoinRow key={d.id} orgId={orgId} domain={d} />)
      )}
    </SettingsPanel>
  );
}

function AutoJoinRow({ orgId, domain }: { orgId: string; domain: OrgDomainItem }) {
  const queryClient = useQueryClient();

  const update = useMutation({
    ...updateOrgDomainMutation(),
    onSuccess: (data) => queryClient.setQueryData(listOrgDomainsQueryKey({ path: { orgId } }), data),
    onError: (err) =>
      notify.error("Couldn't update auto-join", {
        description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Flex
      align="center"
      justify="between"
      gap={3}
      className="border-b border-border px-5 py-4 last:border-b-0"
    >
      <Flex direction="col" gap={0.5} className="min-w-0">
        <Text as="span" className="font-mono text-sm font-semibold">
          {domain.domain}
        </Text>
        <Text as="span" className="text-xs text-muted-foreground">
          Anyone with a verified @{domain.domain} email can join as a member.
        </Text>
      </Flex>
      <Switch
        checked={domain.autoJoin}
        disabled={update.isPending}
        onCheckedChange={(autoJoin) =>
          update.mutate({ path: { orgId, domainId: domain.id }, body: { autoJoin } })
        }
        aria-label={`Auto-join for ${domain.domain}`}
      />
    </Flex>
  );
}
