import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity03Icon,
  AnalyticsUpIcon,
  Alert02Icon,
  Clock01Icon,
  WorkflowSquare01Icon,
  BellIcon,
  GitPullRequestIcon,
} from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';

type Feature = { icon: ReactNode; tint: string; title: ReactNode; body: ReactNode; soon?: boolean };

const FEATURES: Feature[] = [
  {
    icon: <HugeiconsIcon icon={Activity03Icon} size={22} />,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness detector',
    body: "Automatically surfaces tests that pass and fail without a code change, ranked by how much instability they're adding to your suite.",
  },
  {
    icon: <HugeiconsIcon icon={AnalyticsUpIcon} size={22} />,
    tint: 'bg-primary/15 text-primary',
    title: 'Test analytics',
    body: 'Pass rates, durations and volume trends across every run, branch and spec file — so you can see the suite getting healthier or slower over time.',
  },
  {
    icon: <HugeiconsIcon icon={Alert02Icon} size={22} />,
    tint: 'bg-destructive/15 text-destructive',
    title: (
      <>
        Know <em>why</em> it failed
      </>
    ),
    body: 'The error, stack trace, screenshots, video and the full Playwright trace — captured and attached to every failing attempt.',
  },
  {
    icon: <HugeiconsIcon icon={Clock01Icon} size={22} />,
    tint: 'bg-info/15 text-info',
    title: (
      <>
        Know <em>since when</em>
      </>
    ),
    body: 'Pinpoint the first run a test started failing and the commit that introduced it — no more bisecting through CI logs by hand.',
  },
  {
    icon: <HugeiconsIcon icon={WorkflowSquare01Icon} size={22} />,
    tint: 'bg-primary/15 text-primary',
    title: 'Traces & artifacts',
    body: (
      <>
        Every screenshot, video and <span className="font-mono">trace.zip</span> in one place,
        opened straight from the test that produced it.
      </>
    ),
  },
  {
    icon: <HugeiconsIcon icon={BellIcon} size={22} />,
    tint: 'bg-success/15 text-success',
    title: 'Slack notifications',
    body: 'Auto-post passing, flaky and failing runs to Slack — with green / yellow / red status and every test linked back to its results on Nijam.',
  },
  {
    icon: <HugeiconsIcon icon={GitPullRequestIcon} size={22} />,
    tint: 'bg-foreground/10 text-foreground',
    title: 'GitHub checks & comments',
    body: 'Install the GitHub App and every pull request gets a Nijam status check — green when it passes, red when it fails — plus a results comment that updates in place on each run.',
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
          What you've been missing
        </Text>
        <Text as="h2" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Everything{' '}
          <code className="rounded-md bg-muted px-2 py-0.5 align-middle font-mono text-xl sm:text-2xl">
            npx playwright test
          </code>{' '}
          doesn't tell you
        </Text>
        <Text className="mt-3.5 text-lg text-pretty text-muted-foreground">
          Your CI runs the tests. Nijam remembers every run, so you can see what's flaky, what
          regressed, and exactly when it broke.
        </Text>
      </Reveal>

      <Grid cols={[1, 2, 3]} gap={4}>
        {FEATURES.map((f, i) => (
          <Reveal
            key={i}
            className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <Flex
              inline
              align="center"
              justify="center"
              className={cn('size-10.5 rounded-xl', f.tint)}
            >
              {f.icon}
            </Flex>
            <Text as="h3" className="mt-4 text-base font-semibold tracking-tight">
              {f.title}
              {f.soon && (
                <Flex
                  as="span"
                  inline
                  align="center"
                  className="ml-2 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 align-middle text-xs font-medium text-info"
                >
                  Coming soon
                </Flex>
              )}
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">{f.body}</Text>
          </Reveal>
        ))}
      </Grid>
    </section>
  );
}
