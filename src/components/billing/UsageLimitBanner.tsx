import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { getOrgBillingOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useShellNav } from '@/components/shell/use-shell-nav';
import { formatResetDate } from '@/lib/billing';

/**
 * A permanent bar pinned to the bottom of the dashboard whenever the current org
 * has hit its Free monthly test limit (`billing.over`). Wording hardens once
 * ingestion is actually paused (`billing.enforced`). Renders nothing outside an
 * org context or when the org is within its limit.
 */
export function UsageLimitBanner() {
  const { orgId } = useShellNav();
  const { data } = useQuery({
    ...getOrgBillingOptions({ path: { orgId } }),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  if (!orgId || !data?.over) return null;

  return (
    <Flex
      align="center"
      justify="center"
      gap={3}
      wrap
      className="shrink-0 border-t border-destructive/30 bg-destructive/10 px-6 py-3 text-center"
    >
      <Flex align="center" gap={2.5} className="min-w-0">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={18}
          strokeWidth={1.9}
          className="shrink-0 text-destructive"
        />
        <Text as="span" className="text-sm font-medium text-foreground text-pretty">
          {data.enforced
            ? `You've hit your Free plan's monthly test limit — new reports are paused until ${formatResetDate(data.resetsAt)}.`
            : "You've reached your Free plan's monthly test limit."}{' '}
          <Text as="span" className="font-normal text-muted-foreground">
            Upgrade to Pro to keep reporting.
          </Text>
        </Text>
      </Flex>
      <Button asChild size="sm">
        <Link to="/orgs/$orgId/billing" params={{ orgId }}>
          Upgrade
        </Link>
      </Button>
    </Flex>
  );
}
