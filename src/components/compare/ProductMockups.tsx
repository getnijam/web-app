import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { LogoMark } from '@/components/auth/Logo';
import { DatadogGlyph } from './DatadogGlyph';
import { cn } from '@/lib/utils';

/**
 * Two illustrative product mockups shown side by side on the comparison page: a
 * dense, sprawling "Datadog CI Visibility" dashboard (hand-built with Tailwind +
 * the scoped `datadog` accent token) next to a calm, focused Nijam run panel (built
 * from our own primitives). Purely decorative, so the whole block is aria-hidden and
 * the real comparison lives in the surrounding copy + feature table.
 */

// ---- Datadog mock ----

const DD_NAV = [
  'Dashboards',
  'Infrastructure',
  'APM',
  'Logs',
  'RUM',
  'CI Pipelines',
  'CI Tests',
  'Synthetics',
  'Watchdog',
];

const DD_CHIPS = ['env:prod', 'branch:main', 'service:web-ui', '@team-qa', '+6 more'];

const DD_METRICS = [
  { label: 'Test services', value: '214' },
  { label: 'Failure rate', value: '4.2%' },
  { label: 'Spans ingested', value: '1.2M' },
];

const DD_ROWS = [
  { test: 'checkout › applies promo', svc: 'web-ui', dur: '4.1s', flaky: '2.3%' },
  { test: 'auth › login with SSO', svc: 'web-ui', dur: '2.8s', flaky: '0.0%' },
  { test: 'vault › upload document', svc: 'api', dur: '9.4s', flaky: '5.1%' },
  { test: 'dashboard › filters range', svc: 'web-ui', dur: '3.2s', flaky: '1.7%' },
];

export function DatadogMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      {/* window chrome */}
      <Flex align="center" justify="between" gap={2} className="bg-datadog px-3 py-2">
        <Flex align="center" gap={2} className="min-w-0">
          <DatadogGlyph className="size-5 shrink-0 text-datadog-foreground" />
          <Text as="span" className="text-sm font-semibold text-datadog-foreground">
            Datadog
          </Text>
          <Text as="span" truncate className="text-xs text-datadog-foreground/70">
            CI Visibility › Test Runs
          </Text>
        </Flex>
        <Flex align="center" gap={1}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-datadog-foreground/40" />
          ))}
        </Flex>
      </Flex>

      <Flex className="min-h-0">
        {/* sprawling left rail: test reporting is one item buried in the suite */}
        <Flex direction="col" gap={0.5} className="hidden w-28 shrink-0 border-r border-border bg-muted/40 p-2 sm:flex">
          {DD_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'CI Tests'
                  ? 'bg-datadog/15 font-medium text-datadog'
                  : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          {/* metric tiles */}
          <Grid cols={3} gap={2}>
            {DD_METRICS.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-card px-2.5 py-2">
                <Text as="span" className="block text-sm font-semibold tabular-nums text-foreground">
                  {m.value}
                </Text>
                <Text as="span" className="block truncate text-xs text-muted-foreground">
                  {m.label}
                </Text>
              </div>
            ))}
          </Grid>

          {/* filter clutter */}
          <Flex align="center" gap={1.5} wrap>
            {DD_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </Flex>

          {/* dense table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <Flex align="center" className="border-b border-border bg-muted/60 px-2.5 py-1.5">
              <Text as="span" className="flex-1 text-xs font-medium text-muted-foreground">
                Test
              </Text>
              <Text as="span" className="w-16 text-xs font-medium text-muted-foreground">
                Service
              </Text>
              <Text as="span" className="w-12 text-right text-xs font-medium text-muted-foreground">
                Dur
              </Text>
              <Text as="span" className="w-12 text-right text-xs font-medium text-muted-foreground">
                Flaky
              </Text>
            </Flex>
            {DD_ROWS.map((r) => (
              <Flex key={r.test} align="center" className="border-b border-border/60 px-2.5 py-1.5 last:border-0">
                <Text as="span" truncate className="flex-1 text-xs text-foreground">
                  {r.test}
                </Text>
                <Text as="span" className="w-16 font-mono text-xs text-muted-foreground">
                  {r.svc}
                </Text>
                <Text as="span" className="w-12 text-right font-mono text-xs text-muted-foreground">
                  {r.dur}
                </Text>
                <Text as="span" className="w-12 text-right font-mono text-xs text-datadog">
                  {r.flaky}
                </Text>
              </Flex>
            ))}
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}

// ---- Nijam mock ----

const NJ_PILL = 'rounded-full px-2.5 py-1 text-xs font-medium';
const NJ_SUMMARY = [
  { label: 'Total', value: '128', color: 'text-foreground' },
  { label: 'Passed', value: '124', color: 'text-success' },
  { label: 'Failed', value: '1', color: 'text-destructive' },
  { label: 'Flaky', value: '3', color: 'text-warning' },
];
const NJ_FILES = [
  { file: 'auth/login.spec.ts', passed: 6, flaky: 0, failed: 0 },
  { file: 'vault/upload.spec.ts', passed: 11, flaky: 1, failed: 0 },
  { file: 'checkout/promo.spec.ts', passed: 4, flaky: 0, failed: 1 },
];

function CountDot({ value, cls }: { value: number; cls: string }) {
  if (value === 0) return null;
  return <span className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums', cls)}>{value}</span>;
}

export function NijamMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      {/* header: one run, at a glance */}
      <Flex direction="col" gap={2} className="border-b border-border px-4 py-3.5">
        <Flex align="center" gap={2} wrap>
          <span className={cn(NJ_PILL, 'inline-flex items-center gap-1.5 bg-success/15 text-success')}>
            <span className="size-1.5 rounded-full bg-success" />
            Passed
          </span>
          <Text as="span" variant="code" className="text-sm font-semibold">
            #a1b2c3d
          </Text>
          <span className={cn(NJ_PILL, 'bg-secondary text-secondary-foreground')}>chromium</span>
          <span className={cn(NJ_PILL, 'bg-secondary text-secondary-foreground')}>4 shards</span>
        </Flex>
        <Text as="span" className="text-xs text-muted-foreground">
          2m ago · main · via GitHub Actions
        </Text>
      </Flex>

      {/* summary metrics */}
      <Flex align="center" gap={6} wrap className="border-b border-border px-4 py-3.5">
        {NJ_SUMMARY.map((m) => (
          <Flex key={m.label} direction="col" gap={0.5}>
            <Text as="span" className={cn('text-lg font-semibold tabular-nums', m.color)}>
              {m.value}
            </Text>
            <Text as="span" className="text-xs text-muted-foreground">
              {m.label}
            </Text>
          </Flex>
        ))}
      </Flex>

      {/* spec files */}
      <Flex direction="col">
        {NJ_FILES.map((f) => (
          <Flex key={f.file} align="center" gap={3} className="border-b border-border/60 px-4 py-3 last:border-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.9} />
            </span>
            <Text as="span" variant="code" truncate className="min-w-0 flex-1 text-sm">
              {f.file}
            </Text>
            <Flex align="center" gap={1}>
              <CountDot value={f.passed} cls="bg-success/15 text-success" />
              <CountDot value={f.flaky} cls="bg-warning/15 text-warning" />
              <CountDot value={f.failed} cls="bg-destructive/15 text-destructive" />
            </Flex>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="shrink-0 text-muted-foreground" />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

export function MockCaption({ children }: { children: ReactNode }) {
  return (
    <Text as="p" align="center" className="mt-3 text-sm text-pretty text-muted-foreground">
      {children}
    </Text>
  );
}

/**
 * The comparison mock band: a competitor product mock (passed in) on the left and
 * the shared Nijam run mock on the right, each with a caption. Purely illustrative,
 * so aria-hidden, the real comparison is the surrounding copy + feature table.
 */
export function MockPair({
  competitor,
  competitorCaption,
}: {
  competitor: ReactNode;
  competitorCaption: ReactNode;
}) {
  return (
    <Grid cols={[1, 1, 2]} gap={6} className="items-start" aria-hidden>
      <div>
        {competitor}
        <MockCaption>{competitorCaption}</MockCaption>
      </div>
      <div>
        <NijamMock />
        <MockCaption>
          <span className="inline-flex items-center gap-1.5 align-middle font-medium text-foreground">
            <LogoMark className="size-4" />
            Nijam
          </span>{' '}
          shows one run the way you actually read it: status, flaky, and every spec file, at a
          glance.
        </MockCaption>
      </div>
    </Grid>
  );
}
