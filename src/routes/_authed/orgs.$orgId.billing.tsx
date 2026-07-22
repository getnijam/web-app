import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ORG_BILLING_ROUTE } from '@/lib/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  CrownIcon,
  Database02Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  TestTube01Icon,
  DiscountTag01Icon,
} from '@hugeicons/core-free-icons';
import type { BillingResponse } from '@/client';
import {
  getOrgBillingOptions,
  getOrgBillingQueryKey,
  createBillingCheckoutMutation,
  createBillingPortalMutation,
  updateBillingEmailMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState, ErrorBanner } from '@/components/states/ErrorState';
import { FieldError } from '@/components/auth/AuthLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { EditActions, LockedFields } from '@/components/settings/EditableSettings';
import { useEditMode } from '@/hooks/use-edit-mode';
import { UsageMeter, type MeterTone } from '@/components/billing/UsageMeter';
import { formatCents, formatCount, formatResetDate, isPro, usagePercent } from '@/lib/billing';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { privateSeo } from '@/lib/seo';
import { openExternal } from '@/lib/navigation';

export const Route = createFileRoute('/_authed/orgs/$orgId/billing')({
  head: () => privateSeo('Billing & usage'),
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
      navigate({ to: ORG_BILLING_ROUTE, params: { orgId }, search: {}, replace: true });
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
  // A Pro org with bring-your-own-cloud active is not metered (it pays the flat base), so
  // the credit meter / included allotment doesn't apply.
  const byoc = billing.byoc;
  const { usage, limits } = billing;

  const checkout = useMutation({
    ...createBillingCheckoutMutation(),
    onSuccess: (data) => openExternal(data.url), // leave the SPA for Polar's hosted checkout
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
      openExternal(data.url);
    },
    onError: (err) =>
      notify.error("Couldn't open billing portal", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  // Pro is uncapped, once usage passes the included allotment, overage billing
  // ($0.001/credit early-bird rate) kicks in. Surface that instead of a silent full bar.
  // `credits` (and `retentionDays`) are null on the BYOC plan = unlimited. Coerce to a
  // number for the Pro/Free meter math; the over/metered branches never apply to BYOC.
  const included = limits.credits;
  const includedNum = included ?? Number.POSITIVE_INFINITY;
  const overCredits = pro ? Math.max(0, usage.credits - includedNum) : 0;
  const overActive = overCredits > 0;
  const creditPercent = usagePercent(usage.credits, includedNum);
  const retentionLabel =
    billing.retentionDays === null
      ? 'Unlimited history retention'
      : `${billing.retentionDays}-day history retention`;
  let creditTone: MeterTone = 'default';
  if (pro) creditTone = overActive ? 'warning' : 'default';
  else if (billing.over) creditTone = 'danger';
  else if (creditPercent >= 80) creditTone = 'warning';
  const seatTone: MeterTone =
    !pro && limits.seats !== null && usage.seats >= limits.seats ? 'danger' : 'default';
  const resets = formatResetDate(billing.resetsAt);

  // The dynamic status line for the Credits meter; the per-framework breakdown below
  // is appended in the JSX. Members never see amounts, metered/over → "contact an admin".
  const used = `${formatCount(usage.credits)} credits used`;
  let creditHint: string;
  if (isAdmin) {
    if (pro)
      creditHint = overActive
        ? `Included ${formatCount(includedNum)} credits used up, overage now $0.001/credit (${formatCount(overCredits)} over this cycle), added to your next invoice. Resets ${resets}.`
        : `${formatCount(usage.credits)} of ${formatCount(includedNum)} credits used. Beyond that, $0.001 per credit, billed at cycle end. Resets ${resets}.`;
    else if (billing.over)
      creditHint = billing.enforced
        ? `Monthly credit limit reached, new reports are paused until ${resets}. Upgrade to keep reporting.`
        : 'Monthly credit limit reached, upgrade to Pro to report beyond the Free tier.';
    else creditHint = `${used} this cycle. Resets ${resets}.`;
  } else if (pro)
    creditHint = overActive
      ? `Metered usage is in effect, credits beyond the included amount are now billed. Contact an admin for details. Resets ${resets}.`
      : `${formatCount(usage.credits)} of ${formatCount(includedNum)} credits used. Resets ${resets}.`;
  else if (billing.over)
    creditHint = `Monthly credit limit reached, contact an admin to upgrade. Resets ${resets}.`;
  else creditHint = `${used} this cycle. Resets ${resets}.`;

  // Per-framework credit breakdown, shown under the Credits meter on its own lines
  // (block spans so they stack inside the hint's inline <Text as="span">).
  const creditMeterHint = (
    <>
      <span className="block">{creditHint}</span>
      <span className="mt-1.5 block">1 credit = 1 Playwright test report</span>
      <span className="block">1 credit = 100 pytest test reports</span>
      <span className="block">1 credit = 100 Vitest test reports</span>
    </>
  );

  let seatHint = 'Unlimited members on Pro.';
  if (!(pro || limits.seats === null))
    seatHint = isAdmin
      ? 'Free includes up to 3 members. Upgrade to Pro for unlimited.'
      : 'Free includes up to 3 members.';

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Billing &amp; usage</Text>
        <Text color="muted">Your plan, usage, and limits for this organization.</Text>
      </Flex>

      <SettingsPanel title="Plan">
        <Flex align="center" justify="between" gap={4} className="px-5 py-5">
          <Flex direction="col" gap={1.5}>
            <Flex align="center" gap={2}>
              <Text as="span" className="text-base font-semibold">
                {pro ? 'Pro' : 'Free'}
              </Text>
              {byoc && <Badge variant="secondary">Bring your own cloud</Badge>}
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
                ? `Unlimited members · ${retentionLabel}`
                : `Up to ${formatCount(limits.seats ?? 3)} members · ${retentionLabel}`}
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
        {/* BYOC waives metering, so there's nothing to meter, show only Members. */}
        {!byoc && (
          <UsageMeter
            icon={TestTube01Icon}
            label="Credits"
            value={`${formatCount(usage.credits)} / ${included === null ? 'Unlimited' : formatCount(included)}${pro ? ' included' : ''}`}
            percent={creditPercent}
            tone={creditTone}
            hint={creditMeterHint}
          />
        )}
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

      {isAdmin && <BillingEmailPanel orgId={orgId} billingEmail={billing.billingEmail} />}

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
              <HugeiconsIcon icon={CrownIcon} size={20} strokeWidth={1.9} />
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

const EmailSchema = z.object({
  // Empty clears it (checkout then defaults to the admin's own email).
  billingEmail: z.union([z.string().email('Enter a valid email address.').max(320), z.literal('')]),
});
type EmailValues = z.infer<typeof EmailSchema>;

/**
 * Where this org's Pro invoices and receipts go. Polar allows one customer per email, so a
 * user who runs several orgs must give each a distinct address; the API sub-addresses
 * automatically on a clash, but an admin can set an explicit one here.
 */
function BillingEmailPanel({
  orgId,
  billingEmail,
}: {
  orgId: string;
  billingEmail: string | null;
}) {
  const queryClient = useQueryClient();
  const { editing, startEditing, stopEditing } = useEditMode();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EmailValues>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { billingEmail: billingEmail ?? '' },
  });

  const save = useMutation({
    ...updateBillingEmailMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getOrgBillingQueryKey({ path: { orgId } }) });
      notify.success('Billing email saved', {
        description: 'Invoices and receipts for this organization will go here.',
      });
      form.reset(form.getValues()); // saved values become the new clean baseline
      stopEditing();
    },
    onError: (err) => {
      if (isApiError(err) && err.error.field) {
        form.setError(err.error.field as keyof EmailValues, { message: err.error.message });
      } else if (isApiError(err)) {
        setFormError(err.error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  const submit = form.handleSubmit((data) => {
    setFormError(null);
    save.mutate({ path: { orgId }, body: { billingEmail: data.billingEmail } });
  });

  const cancel = () => {
    form.reset();
    setFormError(null);
    stopEditing();
  };

  return (
    <form onSubmit={submit}>
      <SettingsPanel
        title="Billing email"
        action={
          <EditActions
            editing={editing}
            dirty={form.formState.isDirty}
            saving={save.isPending}
            onEdit={startEditing}
            onCancel={cancel}
            onSave={submit}
          />
        }
      >
        {formError && (
          <div className="px-5 pt-4">
            <ErrorBanner>{formError}</ErrorBanner>
          </div>
        )}
        <LockedFields locked={!editing}>
          <SettingsRow
            label="Invoice recipient"
            hint="Where Pro invoices and receipts for this organization are sent. Leave blank to use your account email."
          >
            <Input placeholder="billing@company.com" {...form.register('billingEmail')} />
            <FieldError message={form.formState.errors.billingEmail?.message} />
          </SettingsRow>
        </LockedFields>
      </SettingsPanel>
    </form>
  );
}
