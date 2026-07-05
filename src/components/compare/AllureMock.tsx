import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { AllureGlyph } from './AllureGlyph';
import { cn } from '@/lib/utils';

/**
 * Illustrative mock of an Allure static HTML report: a single-run report you
 * generate and open, with the classic Overview / Suites nav, status summary
 * (including Allure's "Broken" state), an empty-ish Trend (history has to be wired
 * up across CI runs), and a suites tree. Decorative, shown via MockPair which is
 * aria-hidden.
 */

const AL_NAV = ['Overview', 'Suites', 'Graphs', 'Timeline', 'Behaviors', 'Packages'];

const AL_SUMMARY = [
  { label: 'Passed', value: '124', cls: 'bg-success/15 text-success' },
  { label: 'Failed', value: '1', cls: 'bg-destructive/15 text-destructive' },
  { label: 'Broken', value: '2', cls: 'bg-warning/15 text-warning' },
  { label: 'Skipped', value: '0', cls: 'bg-muted text-muted-foreground' },
];

const AL_SUITES = [
  { name: 'auth › login', dot: 'bg-success' },
  { name: 'vault › upload document', dot: 'bg-success' },
  { name: 'checkout › applies promo', dot: 'bg-destructive' },
];

export function AllureMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      {/* header: it's a static file you open */}
      <Flex align="center" justify="between" gap={2} className="border-b border-border bg-muted/40 px-3 py-2">
        <Flex align="center" gap={2} className="min-w-0">
          <AllureGlyph className="size-5 shrink-0" />
          <Text as="span" className="text-sm font-semibold text-foreground">
            Allure Report
          </Text>
        </Flex>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
          index.html
        </span>
      </Flex>

      <Flex className="min-h-0">
        <Flex direction="col" gap={0.5} className="hidden w-28 shrink-0 border-r border-border bg-muted/30 p-2 sm:flex">
          {AL_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'Overview' ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          <Text as="span" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Summary
          </Text>
          <Flex align="center" gap={1.5} wrap>
            {AL_SUMMARY.map((s) => (
              <span
                key={s.label}
                className={cn('rounded-md px-2 py-1 text-xs font-medium', s.cls)}
              >
                {s.label} {s.value}
              </span>
            ))}
          </Flex>

          {/* trend widget: static reports have no cross-run history unless you wire it up */}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Flex align="center" justify="between" gap={2}>
              <Text as="span" className="text-xs font-medium text-foreground">
                Trend
              </Text>
              <Text as="span" className="text-xs text-muted-foreground">
                1 run · no history
              </Text>
            </Flex>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Flex align="center" className="border-b border-border bg-muted/60 px-2.5 py-1.5">
              <Text as="span" className="text-xs font-medium text-muted-foreground">
                Suites
              </Text>
            </Flex>
            {AL_SUITES.map((s) => (
              <Flex key={s.name} align="center" gap={2} className="border-b border-border/60 px-2.5 py-2 last:border-0">
                <span className={cn('size-1.5 shrink-0 rounded-full', s.dot)} />
                <Text as="span" truncate className="text-xs text-foreground">
                  {s.name}
                </Text>
              </Flex>
            ))}
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
