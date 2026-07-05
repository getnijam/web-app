import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { TestRailGlyph } from './TestRailGlyph';
import { cn } from '@/lib/utils';

/**
 * Illustrative mock of TestRail: a test case management tool built around manual
 * test cases, runs, and milestones, where automated results arrive via its API.
 * Decorative, shown via MockPair which is aria-hidden.
 */

const TR_NAV = ['Overview', 'Test Cases', 'Test Runs', 'Milestones', 'Reports'];

const TR_CASES = [
  { id: 'C1024', title: 'Login with valid credentials', priority: 'High', cls: 'bg-destructive/15 text-destructive' },
  { id: 'C1025', title: 'Login with locked account', priority: 'Medium', cls: 'bg-warning/15 text-warning' },
  { id: 'C1026', title: 'Reset password via email', priority: 'Low', cls: 'bg-muted text-muted-foreground' },
];

const TR_RESULTS = ['Passed', 'Failed', 'Retest', 'Blocked'];

export function TestRailMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      <Flex align="center" justify="between" gap={2} className="border-b border-border bg-muted/40 px-3 py-2">
        <Flex align="center" gap={2} className="min-w-0">
          <TestRailGlyph className="size-5 shrink-0 text-testrail" />
          <Text as="span" className="text-sm font-semibold text-foreground">
            TestRail
          </Text>
        </Flex>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
          test cases
        </span>
      </Flex>

      <Flex className="min-h-0">
        <Flex direction="col" gap={0.5} className="hidden w-28 shrink-0 border-r border-border bg-muted/30 p-2 sm:flex">
          {TR_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'Test Cases'
                  ? 'bg-testrail/15 font-medium text-testrail'
                  : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          <Text as="span" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Suite · Authentication
          </Text>

          <div className="overflow-hidden rounded-lg border border-border">
            {TR_CASES.map((c) => (
              <Flex key={c.id} align="center" gap={2} className="border-b border-border/60 px-2.5 py-2 last:border-0">
                <Text as="span" className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                  {c.id}
                </Text>
                <Text as="span" truncate className="min-w-0 flex-1 text-xs text-foreground">
                  {c.title}
                </Text>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs font-medium', c.cls)}>
                  {c.priority}
                </span>
              </Flex>
            ))}
          </div>

          {/* results are added against a case, typically by hand */}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Text as="span" className="text-xs font-medium text-foreground">
              Add result
            </Text>
            <Flex align="center" gap={1.5} wrap className="mt-2">
              {TR_RESULTS.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {r}
                </span>
              ))}
            </Flex>
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
