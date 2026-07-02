import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity03Icon,
  Alert02Icon,
  AnalyticsUpIcon,
  GitPullRequestIcon,
  AiChat02Icon,
  BotIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';

// A snapshot of the product, five features in a bento (two wide, three narrow).
// Each tile pairs a tinted icon + label with a decorative, aria-hidden preview
// built only from theme tokens and the spacing scale (no real data, no charts).

/** Placeholder content line for the mock previews. */
function Line({ w }: { w: string }) {
  return <span className={cn('block h-2 rounded-full bg-muted-foreground/20', w)} />;
}

// The three flakiest tests, ranked, each with its retry count.
function FlakyPreview() {
  const rows = [
    { w: 'w-28', n: 6 },
    { w: 'w-20', n: 3 },
    { w: 'w-24', n: 1 },
  ];
  return (
    <Flex direction="col" gap={2.5}>
      {rows.map((r, i) => (
        <Flex key={i} align="center" gap={2.5}>
          <Flex
            inline
            align="center"
            justify="center"
            className="size-5 shrink-0 rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground"
          >
            {i + 1}
          </Flex>
          <Line w={r.w} />
          <Text
            as="span"
            className="ml-auto rounded-full bg-warning/10 px-2 py-0.5 font-mono text-xs font-medium text-warning"
          >
            {r.n}× flaky
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

// The assertion that failed, plus the artifacts captured for it.
function FailurePreview() {
  const chips = ['trace.zip', '2 shots', 'video.webm'];
  return (
    <Flex direction="col" gap={2.5}>
      <Flex direction="col" gap={0.5} className="rounded-lg bg-destructive/5 p-2.5">
        <Text as="span" className="font-mono text-xs text-destructive">
          Timeout 30000ms exceeded
        </Text>
        <Text as="span" className="font-mono text-xs text-muted-foreground">
          at editor.spec.ts:84
        </Text>
      </Flex>
      <Flex gap={1.5} wrap>
        {chips.map((c) => (
          <Text
            as="span"
            key={c}
            className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {c}
          </Text>
        ))}
      </Flex>
    </Flex>
  );
}

// Pass-rate bars trending up over recent runs (decorative, not a real chart).
function TrendPreview() {
  const bars = ['h-6', 'h-8', 'h-7', 'h-10', 'h-9', 'h-12'];
  return (
    <Flex align="end" gap={1.5} className="h-14">
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn('flex-1 rounded-sm', h, i === bars.length - 1 ? 'bg-primary' : 'bg-primary/25')}
        />
      ))}
    </Flex>
  );
}

// A passing verdict as it lands on a PR / in Slack, with its per-spec rollup.
function VerdictPreview() {
  const specs = ['w-24', 'w-20', 'w-16'];
  return (
    <Flex direction="col" gap={2}>
      <Flex align="center" gap={2}>
        <span className="size-2 shrink-0 rounded-full bg-success" />
        <Text as="span" className="text-xs font-semibold text-foreground">
          All tests passed
        </Text>
      </Flex>
      <Flex direction="col" gap={1.5} className="rounded-lg bg-muted/40 p-2.5">
        {specs.map((w, i) => (
          <Flex key={i} align="center" gap={2}>
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            <Line w={w} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

// An agent asking the dashboard a question, answered from real run history.
function McpPreview() {
  return (
    <Flex direction="col" gap={2}>
      <Flex justify="end">
        <Text
          as="span"
          className="rounded-xl rounded-br-sm bg-primary/10 px-2.5 py-1 text-xs text-foreground"
        >
          Why is checkout flaky?
        </Text>
      </Flex>
      <Flex align="start" gap={2}>
        <Flex
          inline
          align="center"
          justify="center"
          className="size-5 shrink-0 rounded-md bg-info/15 text-info"
        >
          <HugeiconsIcon icon={BotIcon} size={12} />
        </Flex>
        <Flex direction="col" gap={1.5} className="flex-1 pt-1">
          <Line w="w-full" />
          <Line w="w-20" />
        </Flex>
      </Flex>
    </Flex>
  );
}

type Feature = {
  icon: typeof Activity03Icon;
  tint: string;
  title: string;
  body: string;
  preview: ReactNode;
};

// The two headline features (wide tiles).
const PRIMARY: Feature[] = [
  {
    icon: Activity03Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness, ranked',
    body: 'Every retry across every run is scored, so the tests quietly wasting your time rise to the top, ranked, with the run where each one started flaking.',
    preview: <FlakyPreview />,
  },
  {
    icon: Alert02Icon,
    tint: 'bg-destructive/15 text-destructive',
    title: 'Know exactly why it failed',
    body: 'The error, the stack trace, the failing line, plus the trace, screenshots, and video for every attempt, opened straight from the run.',
    preview: <FailurePreview />,
  },
];

// The three supporting features (narrow tiles).
const SECONDARY: Feature[] = [
  {
    icon: AnalyticsUpIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Track reliability over time',
    body: 'Pass rate, duration, and volume across every run and branch, so you can see the suite getting healthier or slower.',
    preview: <TrendPreview />,
  },
  {
    icon: GitPullRequestIcon,
    tint: 'bg-success/15 text-success',
    title: 'Verdicts where you work',
    body: 'A status check and a results comment on every pull request, and green / yellow / red runs auto-posted to Slack.',
    preview: <VerdictPreview />,
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-info/15 text-info',
    title: 'Ask your test history',
    body: 'Point any MCP-capable agent at your runs and ask why a suite is red, whether a test is flaky, or when it broke.',
    preview: <McpPreview />,
  },
];

function FeatureTile({ f, tall }: { f: Feature; tall?: boolean }) {
  return (
    <Flex direction="col" className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
      <Flex
        aria-hidden
        align="center"
        className={cn(
          'rounded-xl border border-border/60 bg-muted/20 p-4',
          tall ? 'min-h-40' : 'min-h-32',
        )}
      >
        <div className="w-full">{f.preview}</div>
      </Flex>
      <Flex align="center" gap={2.5} className="mt-5">
        <Flex
          inline
          align="center"
          justify="center"
          className={cn('size-8 shrink-0 rounded-lg', f.tint)}
        >
          <HugeiconsIcon icon={f.icon} size={17} />
        </Flex>
        <Text as="h3" className="text-base font-semibold tracking-tight">
          {f.title}
        </Text>
      </Flex>
      <Text className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
        {f.body}
      </Text>
    </Flex>
  );
}

/** Bento overview of the product, sitting between Install and the CTA on `/`. */
export function HomeFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Text as="h2" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Everything your CI never told you
        </Text>
        <Text className="mt-3.5 text-base text-pretty text-muted-foreground">
          Nijam reads the results your pipeline already produces and turns them into the answers you
          actually need, from why a test failed to which ones keep wasting your time.
        </Text>
      </Reveal>

      <Reveal>
        <Flex direction="col" gap={5}>
          <Grid cols={[1, 2]} gap={5}>
            {PRIMARY.map((f) => (
              <FeatureTile key={f.title} f={f} tall />
            ))}
          </Grid>
          <Grid cols={[1, 1, 3]} gap={5}>
            {SECONDARY.map((f) => (
              <FeatureTile key={f.title} f={f} />
            ))}
          </Grid>
        </Flex>
      </Reveal>

      <Reveal className="mt-12">
        <Flex justify="center">
          <Link
            to="/features"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all features
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Flex>
      </Reveal>
    </section>
  );
}
