import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { SIGNUP_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, DiscountTag01Icon, CloudServerIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/home/Reveal';

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: ReactNode[];
  cta: string;
  featured?: boolean;
  /** Early-bird offer callout, rendered as a highlighted strip under the price. */
  earlyBird?: ReactNode;
};

const FREE_PLAN: Plan = {
  name: 'Free',
  price: '$0',
  cadence: 'forever',
  blurb: 'Everything you need to connect your first project and see it working.',
  features: [
    <>
      <strong className="font-semibold text-foreground">1,000</strong> credits / month
    </>,
    'Up to 3 members',
    '7-day history retention',
    'Flakiness detection & analytics',
    'Traces, screenshots & video',
    'GitHub, GitLab, Jenkins & CircleCI',
  ],
  cta: 'Start free',
};

// Pro is one plan, $20/mo, in two flavors the buyer toggles between: Hosted (managed cloud,
// metered beyond the included credits) and BYOC (data in your own cloud, no metered usage).
type ProMode = 'hosted' | 'byoc';

const PRO_FEATURES: Record<ProMode, ReactNode[]> = {
  hosted: [
    <>
      <strong className="font-semibold text-foreground">10,000</strong> credits included, then{' '}
      <span className="text-muted-foreground line-through">$0.002</span>{' '}
      <strong className="font-semibold text-foreground">$0.001</strong> per additional credit
    </>,
    'Unlimited members',
    '90-day history retention',
    'Single sign-on (SSO/OIDC)',
    'Everything in Free',
    'Priority email support',
  ],
  byoc: [
    <>
      <strong className="font-semibold text-foreground">Unlimited</strong> tests, no metered usage
    </>,
    'Your own database and storage (Postgres + S3, GCS, or Azure)',
    'Unlimited members and history retention',
    'Single sign-on (SSO/OIDC)',
    'Everything in Free',
    'Priority email support',
  ],
};

const PRO_CALLOUT: Record<ProMode, { icon: typeof DiscountTag01Icon; body: ReactNode }> = {
  hosted: {
    icon: DiscountTag01Icon,
    body: (
      <>
        <strong className="font-semibold">Early bird, 50% off usage.</strong> Register now as a Pro
        org and lock the half-price <strong className="font-semibold">$0.001</strong>/credit metered
        rate for at least 2 years.
      </>
    ),
  },
  byoc: {
    icon: CloudServerIcon,
    body: (
      <>
        <strong className="font-semibold">No metered usage.</strong> Your runs and artifacts live in
        your own database and storage, so you pay the flat{' '}
        <strong className="font-semibold">$20</strong>
        /month. Set it up on a new organization.
      </>
    ),
  },
};

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col p-7',
        plan.featured && 'border-primary/50 shadow-lg ring-1 ring-primary/30',
      )}
    >
      <Flex align="center" gap={2}>
        <Text as="h3" className="text-lg font-semibold tracking-tight">
          {plan.name}
        </Text>
        {plan.featured && (
          <Flex
            as="span"
            inline
            align="center"
            className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"
          >
            Most popular
          </Flex>
        )}
      </Flex>

      <Flex align="baseline" gap={1.5} className="mt-4">
        <Text as="span" className="text-4xl font-bold tracking-tight">
          {plan.price}
        </Text>
        <Text as="span" className="text-sm text-muted-foreground">
          {plan.cadence}
        </Text>
      </Flex>

      <Text className="mt-3 text-sm text-pretty text-muted-foreground">{plan.blurb}</Text>

      {plan.earlyBird && (
        <Flex
          align="start"
          gap={2.5}
          className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-3"
        >
          <HugeiconsIcon
            icon={DiscountTag01Icon}
            size={17}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-primary"
          />
          <Text as="span" className="text-xs text-pretty text-primary">
            {plan.earlyBird}
          </Text>
        </Flex>
      )}

      <Button
        asChild
        size="lg"
        variant={plan.featured ? 'default' : 'outline'}
        className="mt-6 w-full"
      >
        <Link to={SIGNUP_ROUTE}>{plan.cta}</Link>
      </Button>

      <FeatureList features={plan.features} />
    </Card>
  );
}

/** Renders the checkmark feature list shared by both cards. */
function FeatureList({ features }: { features: ReactNode[] }) {
  return (
    <Flex direction="col" gap={3} as="ul" className="mt-7">
      {features.map((f, i) => (
        <Flex as="li" key={i} align="start" gap={2.5}>
          <HugeiconsIcon
            icon={Tick02Icon}
            size={18}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0 text-primary"
          />
          <Text as="span" className="text-sm text-muted-foreground">
            {f}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

/** The featured Pro card with a Hosted / BYOC switcher that swaps its features + callout. */
function ProPlanCard() {
  const [mode, setMode] = useState<ProMode>('hosted');
  const callout = PRO_CALLOUT[mode];

  return (
    <Card className="flex h-full flex-col border-primary/50 p-7 shadow-lg ring-1 ring-primary/30">
      <Flex align="center" justify="between" gap={3} wrap>
        <Flex align="center" gap={2}>
          <Text as="h3" className="text-lg font-semibold tracking-tight">
            Pro
          </Text>
          <Flex
            as="span"
            inline
            align="center"
            className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"
          >
            Most popular
          </Flex>
        </Flex>
        <Tabs value={mode} onValueChange={(v) => setMode(v as ProMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="hosted" className="px-3 text-xs">
              Hosted
            </TabsTrigger>
            <TabsTrigger value="byoc" className="px-3 text-xs">
              BYOC
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Flex>

      <Flex align="baseline" gap={1.5} className="mt-4">
        <Text as="span" className="text-4xl font-bold tracking-tight">
          $20
        </Text>
        <Text as="span" className="text-sm text-muted-foreground">
          per month
        </Text>
      </Flex>

      <Text className="mt-3 text-sm text-pretty text-muted-foreground">
        For teams shipping every day, more volume, longer history, no seat limits.
      </Text>

      <Flex
        align="start"
        gap={2.5}
        className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-3"
      >
        <HugeiconsIcon
          icon={callout.icon}
          size={17}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-primary"
        />
        <Text as="span" className="text-xs text-pretty text-primary">
          {callout.body}
        </Text>
      </Flex>

      <Button asChild size="lg" className="mt-6 w-full">
        <Link to={SIGNUP_ROUTE}>Start Pro</Link>
      </Button>

      <FeatureList features={PRO_FEATURES[mode]} />
    </Card>
  );
}

/** The Free + Pro plan cards. Used on the dedicated /pricing page. */
export function PricingPlans() {
  return (
    <Grid cols={[1, 2]} gap={6} className="mx-auto max-w-3xl">
      <Reveal>
        <PlanCard plan={FREE_PLAN} />
      </Reveal>
      <Reveal>
        <ProPlanCard />
      </Reveal>
    </Grid>
  );
}
