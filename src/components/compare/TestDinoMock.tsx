import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { TestDinoWordmark } from './TestDinoWordmark';
import { cn } from '@/lib/utils';

/**
 * Illustrative mock of TestDino: a hosted Playwright-only reporting cloud where
 * usage is metered on test executions (retries and browsers each count) and history
 * is capped by the plan's retention window. Modeled on its run-report UI.
 * Decorative, shown via MockPair which is aria-hidden.
 */

const TD_NAV = ['Runs', 'Analytics', 'Flaky tests', 'Live', 'Settings'];
const TD_COUNTS = [
  { label: '124', cls: 'bg-success/15 text-success' },
  { label: '1', cls: 'bg-destructive/15 text-destructive' },
  { label: '3', cls: 'bg-warning/15 text-warning' },
];
const TD_FLAKE = ['timing', 'network', 'assertion'];

export function TestDinoMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      <Flex align="center" justify="between" gap={2} className="bg-testdino px-3 py-2">
        <Flex align="center" gap={2} className="min-w-0">
          <TestDinoWordmark tone="light" className="h-4" />
          <Text as="span" truncate className="text-xs text-testdino-foreground/70">
            web-e2e › Runs
          </Text>
        </Flex>
        <span className="rounded-full bg-testdino-foreground/15 px-2 py-0.5 text-xs text-testdino-foreground/90">
          Playwright only
        </span>
      </Flex>

      <Flex className="min-h-0">
        <Flex
          direction="col"
          gap={0.5}
          className="hidden w-28 shrink-0 border-r border-border bg-muted/40 p-2 sm:flex"
        >
          {TD_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'Runs'
                  ? 'bg-testdino/15 font-medium text-testdino'
                  : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          {/* one run report */}
          <div className="rounded-lg border border-border bg-card p-3">
            <Flex align="center" justify="between" gap={2}>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                Passed
              </span>
              <Text as="span" className="font-mono text-xs text-muted-foreground">
                PR #318
              </Text>
            </Flex>
            <Text as="span" truncate className="mt-2 block text-sm font-medium text-foreground">
              fix: retry checkout on slow network
            </Text>
            <Text as="span" className="mt-1 block truncate font-mono text-xs text-muted-foreground">
              a1b2c3d · 3m 12s · chromium, firefox, webkit
            </Text>
            <Flex align="center" gap={1.5} className="mt-2.5">
              {TD_COUNTS.map((c, i) => (
                <span
                  key={i}
                  className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums', c.cls)}
                >
                  {c.label}
                </span>
              ))}
            </Flex>
          </div>

          {/* flake root-cause buckets, a genuine TestDino strength */}
          <Flex align="center" gap={1.5} wrap>
            {TD_FLAKE.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                flaky: {f}
              </span>
            ))}
          </Flex>

          {/* usage meter: every browser and every retry burns an execution */}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Flex align="center" justify="between" gap={2}>
              <Text as="span" className="text-xs font-medium text-foreground">
                Test executions this month
              </Text>
              <Text as="span" className="font-mono text-xs text-muted-foreground">
                9,420 / 10,000
              </Text>
            </Flex>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full w-11/12 rounded-full bg-testdino" />
            </div>
            <Text as="span" className="mt-2 block text-xs text-muted-foreground">
              3 of 3 seats used · history kept 60 days
            </Text>
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
