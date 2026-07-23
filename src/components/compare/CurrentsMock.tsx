import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { CurrentsGlyph } from './CurrentsGlyph';
import { cn } from '@/lib/utils';

/**
 * Illustrative mock of Currents: a hosted dashboard for Playwright and Cypress test
 * results (with orchestration), where usage is metered on the number of test results
 * and the data lives on Currents' cloud. Modeled on its real run-list UI. Decorative,
 * shown via MockPair which is aria-hidden.
 */

const CU_NAV = ['Dashboard', 'Runs', 'Analytics', 'Explorer'];
const CU_FILTERS = ['Last 30 days', 'Branch', 'Author', 'Run status'];
const CU_COUNTS = [
  { label: '43', cls: 'bg-success/15 text-success' },
  { label: '0', cls: 'bg-destructive/15 text-destructive' },
  { label: '7', cls: 'bg-muted text-muted-foreground' },
];

export function CurrentsMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      <Flex align="center" justify="between" gap={2} className="bg-currents px-3 py-2">
        <Flex align="center" gap={2} className="min-w-0">
          <CurrentsGlyph className="size-5 shrink-0 text-currents-foreground" />
          <Text as="span" className="text-sm font-semibold text-currents-foreground">
            Currents
          </Text>
          <Text as="span" truncate className="text-xs text-currents-foreground/70">
            Bumblebee › Runs
          </Text>
        </Flex>
        <span className="rounded-full bg-currents-foreground/15 px-2 py-0.5 text-xs text-currents-foreground/90">
          hosted
        </span>
      </Flex>

      <Flex className="min-h-0">
        <Flex
          direction="col"
          gap={0.5}
          className="hidden w-28 shrink-0 border-r border-border bg-muted/40 p-2 sm:flex"
        >
          {CU_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'Runs'
                  ? 'bg-currents/15 font-medium text-currents'
                  : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          <Flex align="center" gap={1.5} wrap>
            {CU_FILTERS.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </Flex>

          {/* one run, close to the real card layout */}
          <div className="rounded-lg border border-border bg-card p-3">
            <Flex align="center" justify="between" gap={2}>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                Passed
              </span>
              <Text as="span" className="font-mono text-xs text-muted-foreground">
                PR #1702
              </Text>
            </Flex>
            <Text as="span" truncate className="mt-2 block text-sm font-medium text-foreground">
              feat: preserve Browser v2 URL prefixes
            </Text>
            <Text as="span" className="mt-1 block truncate font-mono text-xs text-muted-foreground">
              db4fcd4c · 4m 44s · Daniel Torres
            </Text>
            <Flex align="center" gap={1.5} className="mt-2.5">
              {CU_COUNTS.map((c, i) => (
                <span
                  key={i}
                  className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums', c.cls)}
                >
                  {c.label}
                </span>
              ))}
            </Flex>
          </div>

          {/* usage meter: cost scales with the number of test results recorded */}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Flex align="center" justify="between" gap={2}>
              <Text as="span" className="text-xs font-medium text-foreground">
                Test results this month
              </Text>
              <Text as="span" className="font-mono text-xs text-muted-foreground">
                48,210 / 50,000
              </Text>
            </Flex>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full w-11/12 rounded-full bg-currents" />
            </div>
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
