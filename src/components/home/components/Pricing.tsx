import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: ReactNode[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'Everything you need to connect your first project and see it working.',
    features: [
      <>
        <strong className="font-semibold text-foreground">1,000</strong> test results / month
      </>,
      'Up to 2 members',
      '7-day history retention',
      'Flakiness detection & analytics',
      'Traces, screenshots & video',
      'GitHub, GitLab, Jenkins & CircleCI',
    ],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: '$10',
    cadence: 'per month',
    blurb: 'For teams shipping every day — more volume, longer history, no seat limits.',
    featured: true,
    features: [
      <>
        <strong className="font-semibold text-foreground">10,000</strong> test results included,
        then <strong className="font-semibold text-foreground">+$10</strong> per additional 10,000
      </>,
      'Unlimited members',
      '90-day history retention',
      'Everything in Free',
      'Priority email support',
    ],
    cta: 'Start Pro',
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Flex
      direction="col"
      className={cn(
        'h-full rounded-2xl border bg-card p-7',
        plan.featured ? 'border-primary/50 shadow-lg ring-1 ring-primary/30' : 'border-border',
      )}
    >
      <Flex align="center" gap={2}>
        <Text as="h3" className="text-lg font-semibold tracking-tight">
          {plan.name}
        </Text>
        {plan.featured && (
          <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            Most popular
          </span>
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

      <Text className="mt-3 text-sm text-muted-foreground text-pretty">{plan.blurb}</Text>

      <Button
        asChild
        size="lg"
        variant={plan.featured ? 'default' : 'outline'}
        className="mt-6 w-full"
      >
        <Link to="/signup">{plan.cta}</Link>
      </Button>

      <Flex direction="col" gap={3} as="ul" className="mt-7">
        {plan.features.map((f, i) => (
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
    </Flex>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Text className="text-xs font-semibold tracking-wide text-primary uppercase">Pricing</Text>
        <Text as="h2" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Start free. Upgrade when your suite grows.
        </Text>
        <Text className="mt-3.5 text-lg text-muted-foreground text-pretty">
          One simple plan when you outgrow the free tier — no per-seat pricing, no surprises. You're
          only charged for the test volume you actually report.
        </Text>
      </Reveal>

      <Grid cols={[1, 2]} gap={6} className="mx-auto max-w-3xl">
        {PLANS.map((p) => (
          <Reveal key={p.name}>
            <PlanCard plan={p} />
          </Reveal>
        ))}
      </Grid>

      <Text align="center" className="mx-auto mt-8 max-w-xl text-xs text-muted-foreground text-pretty">
        Prices shown in USD and billed monthly. At checkout you're charged in your local currency
        with taxes handled for you. One test result = one reported test attempt (retries and shards
        count).
      </Text>
    </section>
  );
}
