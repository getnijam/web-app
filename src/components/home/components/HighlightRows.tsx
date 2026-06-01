import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';
import { FlakyList } from './FlakyList';
import { FailureCard } from './FailureCard';
import { SlackCard } from './SlackCard';

function Row({
  id,
  flip,
  kicker,
  soon,
  heading,
  body,
  items,
  children,
}: {
  id?: string;
  flip?: boolean;
  kicker: string;
  soon?: boolean;
  heading: ReactNode;
  body: ReactNode;
  items: string[];
  children: ReactNode;
}) {
  return (
    <div id={id} className={id ? 'scroll-mt-24' : undefined}>
      <Reveal>
        <Grid cols={[1, 1, 2]} className="items-center gap-12">
          <div className={cn(flip && 'md:order-2')}>
            <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
              {kicker}
              {soon && (
                <span className="ml-2 inline-flex items-center rounded-full border border-info/30 bg-info/10 px-2 py-0.5 align-middle text-xs font-medium tracking-normal text-info normal-case">
                  Coming soon
                </span>
              )}
            </Text>
            <Text as="h3" className="mt-3 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {heading}
            </Text>
            <Text className="mt-3.5 max-w-md text-base text-muted-foreground">{body}</Text>
            <ul className="mt-5 space-y-2.5">
              {items.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <HugeiconsIcon icon={Tick02Icon} size={18} className="mt-0.5 shrink-0 text-success" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn(flip && 'md:order-1')}>{children}</div>
        </Grid>
      </Reveal>
    </div>
  );
}

export function HighlightRows() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Flex direction="col" className="gap-20">
        <Row
          id="flakiness"
          kicker="Flakiness detector"
          heading="Find the tests quietly wasting your team's time"
          body="Nijam watches every retry across every run and scores each test for instability — so the worst offenders rise to the top instead of hiding in green builds."
          items={[
            'Ranked by flake rate, not just pass/fail',
            'Per-test retry history across runs',
            'Catch regressions before they erode trust',
          ]}
        >
          <FlakyList />
        </Row>

        <Row
          flip
          kicker="Root cause, fast"
          heading="Why it broke, and the commit that broke it"
          body="Open any failure to get the assertion, the trace and the artifacts — then jump to the exact run and commit where the test first turned red."
          items={[
            'Full error, screenshots, video & trace',
            'First-failing run and commit, pinpointed',
            'Link straight out to the CI workflow',
          ]}
        >
          <FailureCard />
        </Row>

        <Row
          id="integrations"
          kicker="Integrations"
          soon
          heading="Results land where your team already talks"
          body="Slack delivery is on the way: connect a channel and Nijam will post a summary of every run by your rules — passing, flaky or failing — with each suite and test linked back to its results."
          items={[
            'Post on failures, flaky runs or regressions',
            'Route each project to its own channel, or mute it',
            'Scoped secret keys to ingest from any CI',
          ]}
        >
          <SlackCard />
        </Row>
      </Flex>
    </section>
  );
}
