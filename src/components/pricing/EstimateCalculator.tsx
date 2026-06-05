import { useState } from 'react';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Free covers small teams within the volume cap; past either limit you're on the
// flat Pro plan, which bills an early-bird $0.001 per test result over the 10k included
// (half the standard $0.002). Base ($20) is unchanged.
const FREE_MEMBER_LIMIT = 2;
const FREE_TEST_LIMIT = 1_000;
const PRO_BASE = 20;
const PRO_INCLUDED_TESTS = 10_000;
const OVERAGE_RATE = 0.001;

const MIN_USERS = 1;
const MAX_USERS = 9_999;
const MIN_TESTS = 0;
const MAX_TESTS = 100_000;
const TESTS_STEP = 500;
// Reference markers drawn on the track (must fall within [MIN_TESTS, MAX_TESTS]).
const TICKS = [10_000, 25_000, 50_000, 75_000, 100_000];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const compact = (n: number) => n.toLocaleString('en-US');
// Short form for the cramped tick labels: 10000 → "10K", 100000 → "100K".
const tickLabel = (n: number) =>
  n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Magnetic ticks: while dragging, a value within GRAVITY of a marker is pulled
// onto it. Applied to the slider only — typing in the input stays exact.
const GRAVITY = 2_000;
const snapToTick = (n: number) => TICKS.find((t) => Math.abs(n - t) <= GRAVITY) ?? n;
const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function EstimateCalculator() {
  const [users, setUsers] = useState(5);
  const [tests, setTests] = useState(10_000);

  const isFree = users <= FREE_MEMBER_LIMIT && tests <= FREE_TEST_LIMIT;
  const overageTests = Math.max(0, tests - PRO_INCLUDED_TESTS);
  const monthly = isFree ? 0 : PRO_BASE + overageTests * OVERAGE_RATE;

  let planNote: string;
  if (isFree) {
    planNote = 'Up to 2 members and 1,000 test results each month.';
  } else if (overageTests > 0) {
    planNote = `$${PRO_BASE} base + $${money(overageTests * OVERAGE_RATE)} for ${compact(overageTests)} test results over the included 10,000.`;
  } else {
    planNote = 'Unlimited members, with 10,000 test results included each month.';
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-7 md:p-9">
      <Grid cols={[1, 2]} gap={8} className="items-center">
        {/* Controls. */}
        <Flex direction="col" gap={6}>
          {/* Test results — slider with a synced number readout. */}
          <Flex direction="col" gap={3}>
            <Flex align="center" justify="between" gap={3}>
              <Label htmlFor="estimate-tests" className="text-sm font-medium">
                Test results / month
              </Label>
              <Input
                id="estimate-tests"
                type="number"
                inputMode="numeric"
                min={MIN_TESTS}
                max={MAX_TESTS}
                step={TESTS_STEP}
                value={tests}
                onChange={(e) =>
                  setTests(
                    Number.isNaN(e.target.valueAsNumber)
                      ? MIN_TESTS
                      : clamp(e.target.valueAsNumber, MIN_TESTS, MAX_TESTS),
                  )
                }
                className="w-24 text-center"
              />
            </Flex>
            <Slider
              value={[tests]}
              min={MIN_TESTS}
              max={MAX_TESTS}
              step={TESTS_STEP}
              onValueChange={(v) => setTests(snapToTick(v[0] ?? MIN_TESTS))}
              aria-label="Test results per month"
            />
            {/* Step markers along the track — notch + label at each reference value. */}
            <div className="relative h-6">
              {TICKS.map((t) => {
                const pct = (t / MAX_TESTS) * 100;
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

          {/* Team size — a plain number input. */}
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
        This is an estimate only — the amount shown doesn&rsquo;t include any tax-related
        information. Final charges are calculated at checkout by our payment provider.
      </Text>
    </div>
  );
}
