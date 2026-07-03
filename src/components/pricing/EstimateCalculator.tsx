import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Free covers small teams within the credit cap; past either limit you're on the flat
// Pro plan, which bills an early-bird $0.001 per credit over the 10k included (half the
// standard $0.002). Base ($20) is unchanged. 1 credit = 1 Playwright test = 100
// pytest/Vitest tests.
const FREE_MEMBER_LIMIT = 3;
const FREE_CREDIT_LIMIT = 1_000;
const PRO_BASE = 20;
const PRO_INCLUDED_CREDITS = 10_000;
const OVERAGE_RATE = 0.001;

const MIN_USERS = 1;
const MAX_USERS = 9_999;
const MIN_CREDITS = 0;
const MAX_CREDITS = 100_000;
const CREDITS_STEP = 500;
// Reference markers drawn on the track (must fall within [MIN_CREDITS, MAX_CREDITS]).
const TICKS = [10_000, 25_000, 50_000, 75_000, 100_000];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const compact = (n: number) => n.toLocaleString('en-US');
// Short form for the cramped tick labels: 10000 → "10K", 100000 → "100K".
const tickLabel = (n: number) =>
  n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Magnetic ticks: while dragging, a value within GRAVITY of a marker is pulled
// onto it. Applied to the slider only, typing in the input stays exact.
const GRAVITY = 2_000;
const snapToTick = (n: number) => TICKS.find((t) => Math.abs(n - t) <= GRAVITY) ?? n;
const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function EstimateCalculator() {
  const [users, setUsers] = useState(5);
  const [credits, setCredits] = useState(10_000);

  const isFree = users <= FREE_MEMBER_LIMIT && credits <= FREE_CREDIT_LIMIT;
  const overageCredits = Math.max(0, credits - PRO_INCLUDED_CREDITS);
  const monthly = isFree ? 0 : PRO_BASE + overageCredits * OVERAGE_RATE;

  let planNote: string;
  if (isFree) {
    planNote = 'Up to 3 members and 1,000 credits each month.';
  } else if (overageCredits > 0) {
    planNote = `$${PRO_BASE} base + $${money(overageCredits * OVERAGE_RATE)} for ${compact(overageCredits)} credits over the included 10,000.`;
  } else {
    planNote = 'Unlimited members, with 10,000 credits included each month.';
  }

  return (
    <Card className="mx-auto max-w-3xl p-7 md:p-9">
      <Grid cols={[1, 2]} gap={8} className="items-center">
        {/* Controls. */}
        <Flex direction="col" gap={6}>
          {/* Credits, slider with a synced number readout. */}
          <Flex direction="col" gap={3}>
            <Flex align="center" justify="between" gap={3}>
              <Label htmlFor="estimate-credits" className="text-sm font-medium">
                Credits / month
              </Label>
              <Input
                id="estimate-credits"
                type="number"
                inputMode="numeric"
                min={MIN_CREDITS}
                max={MAX_CREDITS}
                step={CREDITS_STEP}
                value={credits}
                onChange={(e) =>
                  setCredits(
                    Number.isNaN(e.target.valueAsNumber)
                      ? MIN_CREDITS
                      : clamp(e.target.valueAsNumber, MIN_CREDITS, MAX_CREDITS),
                  )
                }
                className="w-24 text-center"
              />
            </Flex>
            <Slider
              value={[credits]}
              min={MIN_CREDITS}
              max={MAX_CREDITS}
              step={CREDITS_STEP}
              onValueChange={(v) => setCredits(snapToTick(v[0] ?? MIN_CREDITS))}
              aria-label="Credits per month"
            />
            {/* Step markers along the track, notch + label at each reference value. */}
            <div className="relative h-6">
              {TICKS.map((t) => {
                const pct = (t / MAX_CREDITS) * 100;
                return (
                  <div key={t} className="absolute top-0" style={{ left: `${pct}%` }}>
                    <span className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-border" />
                    <Text
                      as="span"
                      className="absolute top-2.5 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
                      style={{ transform: `translateX(-${pct}%)` }}
                    >
                      {tickLabel(t)}
                    </Text>
                  </div>
                );
              })}
            </div>
          </Flex>

          {/* Team size, a plain number input. */}
          <Flex align="center" justify="between" gap={3}>
            <Label htmlFor="estimate-users" className="text-sm font-medium">
              Number of users
            </Label>
            <Input
              id="estimate-users"
              type="number"
              inputMode="numeric"
              min={MIN_USERS}
              max={MAX_USERS}
              value={users}
              onChange={(e) =>
                setUsers(
                  Number.isNaN(e.target.valueAsNumber)
                    ? MIN_USERS
                    : clamp(e.target.valueAsNumber, MIN_USERS, MAX_USERS),
                )
              }
              className="w-24 text-center"
            />
          </Flex>
        </Flex>

        {/* Estimated bill. */}
        <Flex
          direction="col"
          align="center"
          justify="center"
          gap={1.5}
          className="rounded-xl bg-muted/40 p-6 text-center"
        >
          <Text
            as="span"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Estimated monthly bill
          </Text>
          <Flex align="baseline" justify="center" gap={1}>
            <Text as="span" className="text-5xl font-bold tracking-tight">
              ${money(monthly)}
            </Text>
            <Text as="span" className="text-sm text-muted-foreground">
              /mo
            </Text>
          </Flex>
          <Badge variant={isFree ? 'secondary' : 'default'}>{isFree ? 'Free' : 'Pro'} plan</Badge>
          <Text className="mt-1 text-xs text-pretty text-muted-foreground">{planNote}</Text>
        </Flex>
      </Grid>

      <Text className="mt-6 text-xs text-pretty text-muted-foreground">
        1 credit = 1 Playwright test = 100 pytest/Vitest tests. This is an estimate only, the amount
        shown doesn&rsquo;t include any tax-related information. Final charges are calculated at
        checkout by our payment provider.
      </Text>
    </Card>
  );
}
