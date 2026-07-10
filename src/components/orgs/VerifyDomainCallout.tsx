import { Link } from '@tanstack/react-router';
import { ORG_SETTINGS_DOMAINS_ROUTE, ORG_BILLING_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

/**
 * Highlighted "verify a domain first" callout, shown wherever a feature (auto-join, SSO)
 * needs a verified domain but the org has none. Links to the shared Domains section.
 */
export function VerifyDomainCallout({ orgId, message }: { orgId: string; message: string }) {
  return (
    <Flex
      align="center"
      justify="between"
      gap={3}
      wrap
      className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-3"
    >
      <Flex align="center" gap={2.5} className="min-w-0">
        <HugeiconsIcon icon={AlertCircleIcon} size={18} className="shrink-0 text-primary" />
        <Text as="span" className="text-sm">
          {message}
        </Text>
      </Flex>
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <Link to={ORG_SETTINGS_DOMAINS_ROUTE} params={{ orgId }}>
          Verify a domain
        </Link>
      </Button>
    </Flex>
  );
}

/** Pro upsell panel for the domain features (verifying + auto-join are both Pro-only). */
export function DomainProUpsell({
  orgId,
  title,
  description,
}: {
  orgId: string;
  title: string;
  description: string;
}) {
  return (
    <SettingsPanel title={title}>
      <Flex direction="col" gap={3} className="px-5 py-6">
        <Badge variant="secondary" className="w-fit">
          Pro feature
        </Badge>
        <Text className="text-sm text-muted-foreground">{description}</Text>
        <Flex>
          <Button asChild>
            <Link to={ORG_BILLING_ROUTE} params={{ orgId }}>
              Upgrade to Pro
            </Link>
          </Button>
        </Flex>
      </Flex>
    </SettingsPanel>
  );
}
