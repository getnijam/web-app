import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity03Icon,
  AnalyticsUpIcon,
  Alert02Icon,
  Clock01Icon,
  WorkflowSquare01Icon,
  BellIcon,
  AiChat02Icon,
  ShieldKeyIcon,
  CloudServerIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { CTA } from '@/components/home/components/CTA';
import { Reveal } from '@/components/home/Reveal';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type Feature = {
  icon: typeof Activity03Icon;
  tint: string;
  title: ReactNode;
  body: ReactNode;
};

const DIAGNOSE: Feature[] = [
  {
    icon: Activity03Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness ranked',
    body: 'Every retry across every run is scored, so the tests quietly wasting your team’s time rise to the top instead of hiding inside green builds.',
  },
  {
    icon: Alert02Icon,
    tint: 'bg-destructive/15 text-destructive',
    title: <>Why it failed</>,
    body: 'The error, the stack trace, the failing line. For Playwright, the full trace, screenshots, and video for every attempt, opened straight from the run.',
  },
  {
    icon: Clock01Icon,
    tint: 'bg-info/15 text-info',
    title: 'Since when',
    body: 'Pinpoint the first run a test started failing and the commit that introduced it. No more bisecting through CI logs by hand.',
  },
];

const READ: Feature[] = [
  {
    icon: AnalyticsUpIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Suite analytics',
    body: 'Pass rate, duration, and volume across every run, branch, and spec file. See the suite getting healthier or slower over time.',
  },
  {
    icon: WorkflowSquare01Icon,
    tint: 'bg-primary/15 text-primary',
    title: 'Traces and artifacts',
    body: (
      <>
        Every screenshot, video, and <span className="font-mono">trace.zip</span> in one place,
        opened from the test that produced it.
      </>
    ),
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-info/15 text-info',
    title: 'MCP for AI agents',
    body: 'Point any MCP-capable agent (Claude Code, Cursor, Codex) at your runs and ask why a suite is red, whether a test is flaky, or when it broke, answered from your real history.',
  },
];

const WORKFLOW: Feature[] = [
  {
    icon: RefreshIcon,
    tint: 'bg-info/15 text-info',
    title: 'Re-run only what failed',
    body: 'Pull the exact tests that failed on the last run by ID, re-run just those in CI, and Nijam clubs the retry into the same run as another attempt, so a flake that passes second time flips the run green.',
  },
  {
    icon: BellIcon,
    tint: 'bg-success/15 text-success',
    title: 'Slack and PR comments',
    body: 'Get every verdict where your team already works: passing, flaky, and failing runs auto-posted to Slack in green / yellow / red, plus a status check and a results comment on every pull request that updates in place on each run.',
  },
  {
    icon: ShieldKeyIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Single sign-on',
    body: 'Sign in with your own identity provider (Okta, Entra ID, Auth0, any OIDC) with just-in-time provisioning and optional enforcement. A Pro feature.',
  },
  {
    icon: CloudServerIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Bring your own cloud',
    body: 'Store your runs and artifacts in your own Postgres and your own S3, Google Cloud Storage, or Azure bucket. Your test data never leaves your infrastructure, and enabling it waives metered usage. A Pro feature.',
  },
];

type Group = {
  id: string;
  heading: string;
  blurb: string;
  features: Feature[];
};

const GROUPS: Group[] = [
  {
    id: 'diagnose',
    heading: 'Diagnose',
    blurb: 'What the dashboard does the moment a test turns red.',
    features: DIAGNOSE,
  },
  {
    id: 'read',
    heading: 'Read your history',
    blurb: 'The long view: trends, evidence, and the runs behind every verdict.',
    features: READ,
  },
  {
    id: 'workflow',
    heading: 'Workflow',
    blurb: 'Where verdicts surface, and how your team gets in.',
    features: WORKFLOW,
  },
];

function FeatureCard({ f }: { f: Feature }) {
  return (
    <div className="h-full rounded-2xl bg-card p-7 ring-1 ring-foreground/5 transition-colors hover:ring-foreground/15 dark:ring-foreground/10 dark:hover:ring-foreground/25">
      <Flex inline align="center" justify="center" className={cn('size-11 rounded-xl', f.tint)}>
        <HugeiconsIcon icon={f.icon} size={23} />
      </Flex>
      <Text as="h3" className="mt-6 text-lg font-semibold tracking-tight">
        {f.title}
      </Text>
      <Text className="mt-2.5 text-base leading-relaxed text-pretty text-muted-foreground">
        {f.body}
      </Text>
    </div>
  );
}

export function FeaturesPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto mb-20 max-w-2xl text-center">
          <Text as="h1" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Every answer your CI never gives you.
          </Text>
          <Text className="mt-5 text-lg text-pretty text-muted-foreground">
            Nijam reads what your CI uploads from Playwright, pytest, and Vitest, and turns the
            stream into per-test history, failure analysis, and signal you can act on.
          </Text>
        </Reveal>

        <Flex direction="col" className="gap-24">
          {GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <Reveal className="max-w-2xl">
                <Text as="h2" className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {group.heading}
                </Text>
                <Text className="mt-2.5 text-base text-muted-foreground">{group.blurb}</Text>
              </Reveal>
              <Reveal className="mt-8">
                <Grid cols={[1, 2, 3]} gap={5}>
                  {group.features.map((f, i) => (
                    <FeatureCard key={i} f={f} />
                  ))}
                </Grid>
              </Reveal>
            </section>
          ))}
        </Flex>
      </main>
      <CTA
        title="Point your CI at Nijam."
        description="Install the reporter, set NIJAM_PROJECT_ID, and every run lands in the dashboard."
      />
    </>
  );
}
