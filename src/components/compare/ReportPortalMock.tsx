import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { ReportPortalWordmark } from './ReportPortalWordmark';
import { cn } from '@/lib/utils';

/**
 * Illustrative mock of ReportPortal: a powerful self-hosted test-analytics platform
 * (launches, ML auto-analysis, dashboards) that you stand up and operate yourself.
 * Decorative, shown via MockPair which is aria-hidden.
 */

const RP_NAV = ['Dashboards', 'Launches', 'Filters', 'Debug', 'Members', 'Settings'];

const RP_CHIPS = ['platform:linux', 'env:staging', 'suite:regression', '+5'];

const RP_ROWS = [
  { launch: 'regression #1421', tests: '842', failed: '11', aa: true },
  { launch: 'smoke #1420', tests: '96', failed: '0', aa: false },
  { launch: 'nightly #1419', tests: '1,204', failed: '37', aa: true },
];

export function ReportPortalMock() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 shadow-sm">
      <Flex align="center" justify="between" gap={2} className="border-b border-border bg-muted/40 px-3 py-2">
        <ReportPortalWordmark className="h-5" />
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
          self-hosted
        </span>
      </Flex>

      <Flex className="min-h-0">
        <Flex direction="col" gap={0.5} className="hidden w-28 shrink-0 border-r border-border bg-muted/40 p-2 sm:flex">
          {RP_NAV.map((item) => (
            <Text
              key={item}
              as="span"
              className={cn(
                'truncate rounded-md px-2 py-1 text-xs',
                item === 'Launches' ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {item}
            </Text>
          ))}
        </Flex>

        <Flex direction="col" gap={2.5} className="min-w-0 flex-1 p-3">
          <Flex align="center" gap={1.5} wrap>
            {RP_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </Flex>

          <div className="overflow-hidden rounded-lg border border-border">
            <Flex align="center" className="border-b border-border bg-muted/60 px-2.5 py-1.5">
              <Text as="span" className="flex-1 text-xs font-medium text-muted-foreground">
                Launch
              </Text>
              <Text as="span" className="w-12 text-right text-xs font-medium text-muted-foreground">
                Tests
              </Text>
              <Text as="span" className="w-12 text-right text-xs font-medium text-muted-foreground">
                Failed
              </Text>
              <Text as="span" className="w-14 text-right text-xs font-medium text-muted-foreground">
                AA
              </Text>
            </Flex>
            {RP_ROWS.map((r) => (
              <Flex key={r.launch} align="center" className="border-b border-border/60 px-2.5 py-1.5 last:border-0">
                <Text as="span" truncate className="flex-1 text-xs text-foreground">
                  {r.launch}
                </Text>
                <Text as="span" className="w-12 text-right font-mono text-xs text-muted-foreground">
                  {r.tests}
                </Text>
                <Text as="span" className="w-12 text-right font-mono text-xs text-destructive">
                  {r.failed}
                </Text>
                <Flex justify="end" className="w-14">
                  {r.aa && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      auto
                    </span>
                  )}
                </Flex>
              </Flex>
            ))}
          </div>

          {/* the power comes with infrastructure you run */}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Flex align="center" justify="between" gap={2}>
              <Text as="span" className="text-xs font-medium text-foreground">
                Cluster
              </Text>
              <Text as="span" className="font-mono text-xs text-muted-foreground">
                5 services · docker
              </Text>
            </Flex>
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
