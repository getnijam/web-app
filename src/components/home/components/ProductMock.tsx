import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudUploadIcon,
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  AnalyticsUpIcon,
} from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { PlaywrightLogo, VitestLogo, PytestLogo } from './framework-logos';

// Decorative product mock for the hero's right column. Composed as a connected
// flow inside a blueprint frame: the test results your CI reports (top cards)
// stream down into Nijam's success / flaky / failed read-out (bottom card).
// Bar heights are Tailwind scale classes (no arbitrary values); connector lines
// are an aria-hidden SVG; every color is a theme token.

const FRAMEWORKS: { name: string; logo: typeof PlaywrightLogo; n: number }[] = [
  { name: 'Playwright', logo: PlaywrightLogo, n: 124 },
  { name: 'pytest', logo: PytestLogo, n: 68 },
  { name: 'Vitest', logo: VitestLogo, n: 56 },
];

// The analysis Nijam derives, success, flaky, and the rest.
const HEALTH: { label: string; n: number; dot: string; val: string }[] = [
  { label: 'Passed', n: 246, dot: 'bg-success', val: 'text-foreground' },
  { label: 'Flaky', n: 2, dot: 'bg-warning', val: 'text-warning' },
  { label: 'Failed', n: 0, dot: 'bg-destructive', val: 'text-muted-foreground' },
];

// Per-run bars: `p` is the passed (green) portion, `f` the flaky (amber) cap.
// Exactly two runs carry a flaky cap, matching the "Flaky 2" stat, and none
// are red, since Failed is 0. The two segments stack seamlessly into one bar.
const CHART: { p: string; f?: string }[] = [
  { p: 'h-9' },
  { p: 'h-11' },
  { p: 'h-7', f: 'h-1.5' },
  { p: 'h-10' },
  { p: 'h-12' },
  { p: 'h-8', f: 'h-1.5' },
  { p: 'h-10.5' },
  { p: 'h-9.5' },
];

const AXIS = ['09:00', '12:00', '15:00', '18:00'];

// Decorative L-bracket placed just outside a corner, the blueprint frame.
const CORNERS = [
  'top-0 left-0 -translate-x-1.5 -translate-y-1.5 border-t-2 border-l-2 rounded-tl-sm',
  'top-0 right-0 translate-x-1.5 -translate-y-1.5 border-t-2 border-r-2 rounded-tr-sm',
  'bottom-0 left-0 -translate-x-1.5 translate-y-1.5 border-b-2 border-l-2 rounded-bl-sm',
  'bottom-0 right-0 translate-x-1.5 translate-y-1.5 border-b-2 border-r-2 rounded-br-sm',
];

export function ProductMock() {
  return (
    <div className="relative" aria-hidden="true">
      {CORNERS.map((c) => (
        <span key={c} className={cn('absolute z-10 size-4 border-border/70', c)} />
      ))}

      <Flex direction="col">
        <Grid cols={2} className="gap-3">
          {/* Top-left, the headline metric Nijam reports back. */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <Flex align="center" justify="between">
              <Flex
                inline
                align="center"
                justify="center"
                className="size-8 rounded-lg bg-success/15 text-success"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
              </Flex>
              <Flex
                as="span"
                inline
                align="center"
                gap={0.5}
                className="text-xs font-semibold text-success"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} />
                2.4%
              </Flex>
            </Flex>
            <Text as="p" className="mt-3 text-3xl font-bold tracking-tight">
              96.2
              <small className="text-lg font-semibold text-muted-foreground">%</small>
            </Text>
            <Text as="span" className="text-xs font-semibold text-muted-foreground">
              Success rate
            </Text>
            <Flex
              as="span"
              inline
              align="center"
              className="mt-2.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              Last 7 days
            </Flex>
          </div>

          {/* Top-right, the test results streaming in from CI. */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <Flex align="center" gap={1.5} className="text-xs font-semibold text-muted-foreground">
              <HugeiconsIcon icon={CloudUploadIcon} size={15} />
              From CI
            </Flex>
            <Flex direction="col" gap={2} className="mt-3">
              {FRAMEWORKS.map((fw) => (
                <Flex key={fw.name} align="center" gap={2} className="text-xs font-medium">
                  <fw.logo className="size-4 shrink-0 text-muted-foreground" />
                  {fw.name}
                  <span className="ml-auto text-muted-foreground tabular-nums">{fw.n}</span>
                </Flex>
              ))}
            </Flex>
          </div>
        </Grid>

        {/* Connector tree: the results reported by CI stream down into the
            analysis card. A faint static track carries animated dashes that flow
            from both top cards into the dashboard, ending at a pulsing inlet. */}
        <div className="relative h-10">
          <svg
            className="absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              vectorEffect="non-scaling-stroke"
              stroke="var(--border)"
              strokeWidth="1.25"
              d="M25 0 V42 Q25 50 33 50 H67 Q75 50 75 42 V0 M50 50 V100"
            />
            <path
              className="flow-line"
              vectorEffect="non-scaling-stroke"
              stroke="var(--primary)"
              strokeWidth="1.5"
              d="M25 0 V42 Q25 50 33 50 H50 V100"
            />
            <path
              className="flow-line"
              vectorEffect="non-scaling-stroke"
              stroke="var(--primary)"
              strokeWidth="1.5"
              d="M75 0 V42 Q75 50 67 50 H50 V100"
            />
          </svg>
          <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2">
            <span className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping" />
            <span className="relative block size-2 rounded-full bg-primary" />
          </span>
        </div>

        {/* Bottom, Nijam's analysis: success / flaky / failed + run history. */}
        <div className="rounded-2xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <Flex align="center" justify="between" className="mb-3">
            <Flex align="center" gap={2.5}>
              <Flex
                inline
                align="center"
                justify="center"
                className="size-8 rounded-lg bg-primary/15 text-primary"
              >
                <HugeiconsIcon icon={AnalyticsUpIcon} size={18} />
              </Flex>
              <div>
                <Text as="p" className="text-sm font-semibold tracking-tight">
                  Test health
                </Text>
                <Text as="span" className="text-xs text-muted-foreground">
                  248 tests · main
                </Text>
              </div>
            </Flex>
            <Flex
              as="span"
              inline
              align="center"
              className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              Details
            </Flex>
          </Flex>

          <Grid cols={3} className="gap-2.5">
            {HEALTH.map((h) => (
              <div key={h.label} className="rounded-xl border border-border p-2.5">
                <Flex align="center" gap={1.5}>
                  <span className={cn('size-1.75 rounded-full', h.dot)} />
                  <Text as="span" className="text-xs font-semibold text-muted-foreground">
                    {h.label}
                  </Text>
                </Flex>
                <Text as="p" className={cn('mt-0.5 text-xl font-bold tracking-tight', h.val)}>
                  {h.n}
                </Text>
              </div>
            ))}
          </Grid>

          <Flex align="end" gap={1.5} className="mt-3.5 h-14 px-0.5">
            {CHART.map((c, i) => (
              <Flex key={i} direction="col-reverse" className="flex-1 overflow-hidden rounded-sm">
                <span className={cn('bg-success', c.p)} />
                {c.f && <span className={cn('bg-warning', c.f)} />}
              </Flex>
            ))}
          </Flex>
          <Flex
            justify="between"
            className="mt-1.5 border-t border-border pt-1.5 text-xs text-muted-foreground tabular-nums"
          >
            {AXIS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </Flex>
        </div>
      </Flex>
    </div>
  );
}
