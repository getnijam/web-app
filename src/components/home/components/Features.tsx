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
  AiChat02Icon,
  ShieldKeyIcon,
} from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';

type Feature = {
  icon: typeof Activity03Icon;
  tint: string;
  title: ReactNode;
  body: ReactNode;
  soon?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: Activity03Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness detector',
    body: "Automatically surfaces tests that pass and fail without a code change, ranked by how much instability they're adding to your suite.",
  },
  {
    icon: AnalyticsUpIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Test analytics',
    body: 'Pass rates, durations and volume trends across every run, branch and spec file — so you can see the suite getting healthier or slower over time.',
  },
  {
    icon: Alert02Icon,
    tint: 'bg-destructive/15 text-destructive',
    title: (
      <>
        Know <em>why</em> it failed
      </>
    ),
    body: 'The error, stack trace and the exact failing line — captured for every failing attempt, plus screenshots, video and the full trace on Playwright.',
  },
  {
    icon: Clock01Icon,
    tint: 'bg-info/15 text-info',
    title: (
      <>
        Know <em>since when</em>
      </>
    ),
    body: 'Pinpoint the first run a test started failing and the commit that introduced it — no more bisecting through CI logs by hand.',
  },
  {
    icon: WorkflowSquare01Icon,
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
    icon: BellIcon,
    tint: 'bg-success/15 text-success',
    title: 'Slack notifications',
    body: 'Auto-post passing, flaky and failing runs to Slack — with green / yellow / red status and every test linked back to its results on Nijam.',
  },
  {
    icon: GitPullRequestIcon,
    tint: 'bg-foreground/10 text-foreground',
    title: 'GitHub checks & comments',
    body: 'Install the GitHub App and every pull request gets a Nijam status check — green when it passes, red when it fails — plus a results comment that updates in place on each run.',
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-info/15 text-info',
    title: 'MCP for AI agents',
    body: 'Point any MCP-capable agent — Claude Code, Cursor, Codex — at your runs and ask why a suite is red, whether a test is flaky, or when it broke, answered from your real history.',
  },
  {
    icon: ShieldKeyIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Single sign-on',
    body: 'Let your team sign in with your own identity provider — Okta, Entra ID, Auth0, any OIDC — with just-in-time provisioning and optional enforcement. A Pro feature.',
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
          What you've been missing
        </Text>
        <Text as="h2" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Everything a single{' '}
          <code className="rounded-md bg-muted px-2 py-0.5 align-middle font-mono text-xl sm:text-2xl">
            test run
          </code>{' '}
          doesn't tell you
        </Text>
        <Text className="mt-3.5 text-lg text-pretty text-muted-foreground">
          Your CI runs the tests. Nijam remembers every run, so you can see what's flaky, what
          regressed, and exactly when it broke.
        </Text>
      </Reveal>

      <Grid cols={[1, 2, 3]} gap={5}>
        {FEATURES.map((f, i) => (
          <Reveal
            key={i}
            className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <Flex
              inline
              align="center"
              justify="center"
              className={cn('size-11 rounded-xl', f.tint)}
            >
              <HugeiconsIcon icon={f.icon} size={23} />
            </Flex>
            <Text as="h3" className="mt-6 text-lg font-semibold tracking-tight">
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
            <Text className="mt-2.5 text-base leading-relaxed text-pretty text-muted-foreground">
              {f.body}
            </Text>
          </Reveal>
        ))}
      </Grid>
    </section>
  );
}
