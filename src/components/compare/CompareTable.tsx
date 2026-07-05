import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { LogoMark } from '@/components/auth/Logo';
import { cn } from '@/lib/utils';

export type CompareState = 'yes' | 'no' | 'partial';
export type CompareCell = { state?: CompareState; text: string };
/** One row: the competitor's answer vs Nijam's, for a single capability. */
export type CompareRow = { feature: string; competitor: CompareCell; nijam: CompareCell };
export type CompareGroup = { title: string; rows: CompareRow[] };

function StateIcon({ state }: { state?: CompareState }) {
  if (state === 'yes')
    return (
      <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.2} className="mt-px shrink-0 text-success" />
    );
  if (state === 'no')
    return <HugeiconsIcon icon={Cancel01Icon} size={16} className="mt-px shrink-0 text-muted-foreground" />;
  if (state === 'partial')
    return (
      <span className="mt-px grid size-4 shrink-0 place-items-center">
        <span className="h-0.5 w-2.5 rounded-full bg-warning" />
      </span>
    );
  return <span className="size-4 shrink-0" />;
}

function VendorCell({ cell, highlight }: { cell: CompareCell; highlight?: boolean }) {
  return (
    <Flex align="start" gap={2} className={cn('flex-1 px-3 py-3.5', highlight && 'bg-primary/5')}>
      <StateIcon state={cell.state} />
      <Text
        as="span"
        className={cn('text-xs text-pretty', highlight ? 'text-foreground' : 'text-muted-foreground')}
      >
        {cell.text}
      </Text>
    </Flex>
  );
}

/**
 * Generic Nijam-vs-competitor capability matrix, grouped by area with tri-state
 * cells. The competitor name/logo and the row data are passed in, so it drives both
 * the Datadog and Allure comparison pages from one component. Nijam is the fixed,
 * highlighted right column.
 */
export function CompareTable({
  competitorName,
  competitorGlyph,
  groups,
}: {
  competitorName: string;
  competitorGlyph: ReactNode;
  groups: CompareGroup[];
}) {
  return (
    <div className="mx-auto max-w-4xl overflow-x-auto">
      <Card className="min-w-160 overflow-hidden p-0 shadow-sm">
        {/* column header, Nijam highlighted */}
        <Flex align="stretch" className="border-b border-border bg-muted/40">
          <Flex align="center" className="min-w-0 flex-1 px-4 py-3">
            <Text as="span" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Capability
            </Text>
          </Flex>
          <Flex align="center" gap={2} className="flex-1 px-3 py-3">
            {competitorGlyph}
            <Text as="span" className="text-sm font-semibold text-foreground">
              {competitorName}
            </Text>
          </Flex>
          <Flex align="center" gap={2} className="flex-1 bg-primary/5 px-3 py-3">
            <LogoMark className="size-5" />
            <Text as="span" className="text-sm font-semibold text-foreground">
              Nijam
            </Text>
          </Flex>
        </Flex>

        {groups.map((group) => (
          <div key={group.title}>
            <div className="bg-muted/60 px-4 py-2">
              <Text as="span" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.title}
              </Text>
            </div>
            {group.rows.map((row) => (
              <Flex key={row.feature} align="stretch" className="border-b border-border last:border-0">
                <Flex align="center" className="min-w-0 flex-1 px-4 py-3.5">
                  <Text as="span" className="text-sm font-medium text-pretty text-foreground">
                    {row.feature}
                  </Text>
                </Flex>
                <VendorCell cell={row.competitor} />
                <VendorCell cell={row.nijam} highlight />
              </Flex>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}
