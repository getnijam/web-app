import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import { Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Reveal } from '@/components/home/Reveal';
import { cn } from '@/lib/utils';

// Shared presentational pieces for the /compare/* pages, so every competitor
// comparison keeps the same structure and styling.

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center">
      <Text className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</Text>
      <Text as="h2" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </Text>
      {children && (
        <Text className="mt-3.5 text-base text-pretty text-muted-foreground">{children}</Text>
      )}
    </Reveal>
  );
}

export function ReasonCard({
  icon,
  tint,
  title,
  body,
}: {
  icon: IconSvgElement;
  tint: string;
  title: string;
  body: string;
}) {
  return (
    <Card className="flex flex-col p-6 shadow-sm">
      <Flex inline align="center" justify="center" className={cn('size-11 rounded-xl', tint)}>
        <HugeiconsIcon icon={icon} size={22} strokeWidth={1.9} />
      </Flex>
      <Text as="h3" className="mt-4 text-base font-semibold tracking-tight">
        {title}
      </Text>
      <Text className="mt-1.5 text-sm text-pretty text-muted-foreground">{body}</Text>
    </Card>
  );
}

export function FrameworkCard({ name, body }: { name: string; body: string }) {
  return (
    <Card className="flex flex-col p-6 shadow-sm">
      <Flex align="center" justify="between" gap={2}>
        <Text as="h3" variant="code" className="text-base font-semibold">
          {name}
        </Text>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
          First-class
        </span>
      </Flex>
      <Text className="mt-3 text-sm text-pretty text-muted-foreground">{body}</Text>
    </Card>
  );
}

export function PricingCard({
  header,
  kicker,
  rows,
  highlight,
  footer,
}: {
  header: ReactNode;
  kicker: string;
  rows: string[];
  highlight?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card className={cn('flex flex-col p-6 shadow-sm sm:p-7', highlight && 'ring-1 ring-primary/30')}>
      <Flex align="center" gap={2.5}>
        {header}
      </Flex>
      <Text as="span" className="mt-1.5 text-sm text-muted-foreground">
        {kicker}
      </Text>
      <Flex direction="col" gap={3} className="mt-5">
        {rows.map((row) => (
          <Flex key={row} align="start" gap={2.5}>
            {/* Nijam rows get a primary check; the competitor's rows get a neutral
                dot (they're facts about their model, not necessarily downsides). */}
            {highlight ? (
              <HugeiconsIcon
                icon={Tick02Icon}
                size={18}
                strokeWidth={2.2}
                className="mt-px shrink-0 text-primary"
              />
            ) : (
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            )}
            <Text
              as="span"
              className={cn(
                'text-sm text-pretty',
                highlight ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {row}
            </Text>
          </Flex>
        ))}
      </Flex>
      {footer && <div className="mt-6">{footer}</div>}
    </Card>
  );
}

/** Legend explaining the tri-state icons in the CompareTable. */
export function FeatureLegend() {
  return (
    <Flex align="center" justify="center" gap={5} wrap className="mt-5 text-xs text-muted-foreground">
      <Flex align="center" gap={1.5}>
        <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.2} className="text-success" />
        First-class
      </Flex>
      <Flex align="center" gap={1.5}>
        <span className="h-0.5 w-2.5 rounded-full bg-warning" />
        Partial or gated
      </Flex>
      <Flex align="center" gap={1.5}>
        <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-muted-foreground" />
        Not really
      </Flex>
    </Flex>
  );
}
