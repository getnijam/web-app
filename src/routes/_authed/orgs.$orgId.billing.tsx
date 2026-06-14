import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  RocketIcon,
  Database02Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  TestTube01Icon,
  DiscountTag01Icon,
} from '@hugeicons/core-free-icons';
import type { BillingResponse } from '@/client';
import {
  getOrgBillingOptions,
  createBillingCheckoutMutation,
  createBillingPortalMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { UsageMeter, type MeterTone } from '@/components/billing/UsageMeter';
import { formatCents, formatCount, formatResetDate, isPro, usagePercent } from '@/lib/billing';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/billing')({
  head: () => privateSeo('Billing'),
  // `?upgraded=1` is set by the Polar checkout success redirect.
  validateSearch: (search: Record<string, unknown>): { upgraded?: boolean } =>
    search.upgraded === '1' || search.upgraded === true ? { upgraded: true } : {},
  component: BillingPage,
});

function BillingPage() {
  const { orgId } = Route.useParams();
  const { upgraded } = Route.useSearch();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({
    ...getOrgBillingOptions({ path: { orgId } }),
    // Back from checkout: poll until the subscription webhook flips us to Pro.
    refetchInterval: (q) => (upgraded && q.state.data?.plan !== 'pro' ? 2000 : false),
  });

  // When the upgrade lands, celebrate once and strip the query param.
  useEffect(() => {
    if (upgraded && data?.plan === 'pro') {
      notify.success('Welcome to Pro! 🎉', { description: 'Your plan is now active.' });
      navigate({ to: '/orgs/$orgId/billing', params: { orgId }, search: {}, replace: true });
    }
  }, [upgraded, data?.plan, navigate, orgId]);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;
  return <BillingView orgId={orgId} billing={data} />;
}

const PRO_PERKS: { icon: IconSvgElement; label: string }[] = [
  { icon: Database02Icon, label: '10,000 credits / mo included' },
  { icon: UserMultiple02Icon, label: 'Unlimited members' },
  { icon: Calendar03Icon, label: '90-day history retention' },
];

/** 1 credit = 1 Playwright test = 100 pytest/Vitest tests (framework-weighted). */
const CREDIT_NOTE = '1 credit = 1 Playwright test = 100 pytest/Vitest tests.';

function BillingView({ orgId, billing }: { orgId: string; billing: BillingResponse }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const pro = isPro(billing);
  const { usage, limits } = billing;

  const checkout = useMutation({
    ...createBillingCheckoutMutation(),
    onSuccess: (data) => {
      window.location.href = data.url; // leave the SPA for Polar's hosted checkout
    },
    onError: (err) =>
      notify.error("Couldn't start checkout", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  const portal = useMutation({
    ...createBillingPortalMutation(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) =>
      notify.error("Couldn't open billing portal", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  // Pro is uncapped — once usage passes the included allotment, overage billing
  // ($0.001/credit early-bird rate) kicks in. Surface that instead of a silent full bar.
  const included = limits.credits;
  const overCredits = pro ? Math.max(0, usage.credits - included) : 0;
  const overActive = overCredits > 0;
  const creditPercent = usagePercent(usage.credits, included);
  let creditTone: MeterTone = 'default';
  if (pro) creditTone = overActive ? 'warning' : 'default';
  else if (billing.over) creditTone = 'danger';
  else if (creditPercent >= 80) creditTone = 'warning';
  const seatTone: MeterTone =
    !pro && limits.seats !== null && usage.seats >= limits.seats ? 'danger' : 'default';
  const resets = formatResetDate(billing.resetsAt);

  // Members never see amounts. When metered/over they get a "contact an admin" note.
  // `${formatCount(usage.tests)} tests` is the raw reported count behind the credits.
  const reported = `${formatCount(usage.tests)} tests reported`;
  let creditHint: string;
  if (isAdmin) {
    if (pro)
      creditHint = overActive
        ? `Included ${formatCount(included)} credits used up — overage now $0.001/credit (${formatCount(overCredits)} over this cycle), added to your next invoice. Resets ${resets}.`
        : `${formatCount(usage.credits)} of ${formatCount(included)} credits used (${reported}). Beyond that, $0.001 per credit, billed at cycle end. Resets ${resets}.`;
    else if (billing.over)
      creditHint = billing.enforced
        ? `Monthly credit limit reached — new reports are paused until ${resets}. Upgrade to keep reporting.`
        : 'Monthly credit limit reached — upgrade to Pro to report beyond the Free tier.';
    else creditHint = `${CREDIT_NOTE} ${reported} this cycle. Resets ${resets}.`;
  } else if (pro)
    creditHint = overActive
      ? `Metered usage is in effect — credits beyond the included amount are now billed. Contact an admin for details. Resets ${resets}.`
      : `${formatCount(usage.credits)} of ${formatCount(included)} credits used (${reported}). Resets ${resets}.`;
  else if (billing.over)
    creditHint = `Monthly credit limit reached — contact an admin to upgrade. Resets ${resets}.`;
  else creditHint = `${CREDIT_NOTE} ${reported} this cycle. Resets ${resets}.`;

  let seatHint = 'Unlimited members on Pro.';
  if (!(pro || limits.seats === null))
    seatHint = isAdmin
      ? 'Free includes up to 3 members. Upgrade to Pro for unlimited.'
      : 'Free includes up to 3 members.';

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Billing</Text>
        <Text color="muted">Your plan, usage, and limits for this organization.</Text>
      </Flex>

      <SettingsPanel title="Plan">
        <Flex align="center" justify="between" gap={4} className="px-5 py-5">
          <Flex direction="col" gap={1.5}>
            <Flex align="center" gap={2}>
              <Text as="span" className="text-base font-semibold">
                {pro ? 'Pro' : 'Free'}
              </Text>
              {pro && billing.status && (
                <Badge
                  variant={billing.status === 'active' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {billing.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </Flex>
            <Text as="span" className="text-sm text-muted-foreground">
              {pro
                ? `Unlimited members · ${billing.retentionDays}-day history retention`
                : `Up to ${formatCount(limits.seats ?? 3)} members · ${billing.retentionDays}-day history retention`}
            </Text>
          </Flex>
          {isAdmin && (
            <Flex align="baseline" gap={1}>
              <Text as="span" className="text-2xl font-bold tracking-tight">
                {pro ? '$20' : '$0'}
              </Text>
              <Text as="span" className="text-xs text-muted-foreground">
                {pro ? '/mo + usage' : '/mo'}
              </Text>
            </Flex>
          )}
        </Flex>
      </SettingsPanel>

      <SettingsPanel title="Usage this month">
        <UsageMeter
          icon={TestTube01Icon}
          label="Credits"
          value={`${formatCount(usage.credits)} / ${formatCount(included)}${pro ? ' included' : ''}`}
          percent={creditPercent}
          tone={creditTone}
          hint={creditHint}
        />
        <UsageMeter
          icon={UserMultiple02Icon}
          label="Members"
          value={
            pro || limits.seats === null
              ? `${formatCount(usage.seats)}`
              : `${formatCount(usage.seats)} / ${formatCount(limits.seats)}`
          }
          percent={limits.seats === null ? null : usagePercent(usage.seats, limits.seats)}
          tone={seatTone}
          hint={seatHint}
        />
      </SettingsPanel>

      {isAdmin && pro && (
        <SettingsPanel
          title="Subscription"
          footer={
            <Button
              variant="outline"
              loading={portal.isPending}
              onClick={() => portal.mutate({ path: { orgId } })}
            >
              Manage billing
            </Button>
          }
        >
          <Flex align="center" justify="between" gap={4} className="px-5 py-5">
            <Flex direction="col" gap={1}>
              <Text as="span" className="text-sm font-semibold">
                Estimated charge this period
              </Text>
              <Text as="span" className="text-xs text-muted-foreground">
                {overActive
                  ? `$20 base + ${formatCount(overCredits)} credits over × $0.001. Final amount billed at period end.`
                  : '$20 base. Final amount is calculated at the end of your billing period.'}
              </Text>
            </Flex>
            <Text as="span" className="text-xl font-bold tracking-tight">
              {formatCents(billing.estimateCents ?? 0)}
            </Text>
          </Flex>
        </SettingsPanel>
      )}
      {isAdmin && !pro && (
        <Flex
          direction="col"
          gap={5}
          className="rounded-2xl border border-primary/40 bg-primary/5 p-6"
        >
          <Flex align="center" gap={3}>
            <Flex
              inline
              align="center"
              justify="center"
              className="size-10 shrink-0 rounded-xl bg-primary/15 text-primary"
            >
              <HugeiconsIcon icon={RocketIcon} size={20} strokeWidth={1.9} />
            </Flex>
            <Flex direction="col" gap={0.5}>
              <Text as="h3" className="text-base font-semibold tracking-tight">
                Upgrade to Pro
              </Text>
              <Text as="span" className="text-sm text-muted-foreground">
                More volume, longer history, and no seat limits.
              </Text>
            </Flex>
          </Flex>

          <Grid cols={[1, 3]} gap={4}>
            {PRO_PERKS.map((perk) => (
              <Flex key={perk.label} align="center" gap={2}>
                <HugeiconsIcon
                  icon={perk.icon}
                  size={16}
                  strokeWidth={1.8}
                  className="shrink-0 text-primary"
                />
                <Text as="span" className="text-sm text-muted-foreground">
                  {perk.label}
                </Text>
              </Flex>
            ))}
          </Grid>

          <Flex align="center" justify="between" gap={3} wrap>
            <Text as="span" className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">$20</strong>/mo, then{' '}
              <span className="line-through">$0.002</span>{' '}
              <strong className="font-semibold text-foreground">$0.001</strong> per credit over
              10,000. {CREDIT_NOTE}
            </Text>
            <Button
              loading={checkout.isPending}
              onClick={() => checkout.mutate({ path: { orgId } })}
            >
              Upgrade to Pro
            </Button>
          </Flex>

          <Flex align="start" gap={2} className="text-xs text-primary">
            <HugeiconsIcon
              icon={DiscountTag01Icon}
              size={15}
              strokeWidth={2}
              className="mt-0.5 shrink-0"
            />
            <Text as="span" className="text-pretty">
              Early bird: upgrade now to lock the half-price $0.001/credit metered rate for at least
              2 years.
            </Text>
          </Flex>
        </Flex>
      )}
      {!isAdmin && (
        <Text color="muted" className="text-sm">
          Only admins can change the plan or view charges. Contact an admin for billing details.
        </Text>
      )}
    </Flex>
  );
}
