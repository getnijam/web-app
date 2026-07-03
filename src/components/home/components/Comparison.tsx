import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick02Icon, GithubIcon } from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/auth/Logo';
import { Reveal } from '../Reveal';

// Side-by-side contrast: what a raw CI run leaves you with vs what Nijam reads
// out of the same reports. The left column is deliberately muted (the status
// quo); the Nijam column is brand-highlighted. Built only from primitives and
// theme tokens, no new design language.
const ROWS: { ci: string; nijam: string }[] = [
  { ci: 'Tells you a test failed', nijam: 'Tells you why it failed' },
  { ci: 'Raw logs, one run at a time', nijam: 'Full history across every run' },
  { ci: 'No flaky history', nijam: 'Ranks and tracks every flaky test' },
  { ci: 'Debugging is manual', nijam: 'Root cause, trace, and artifacts on one page' },
  { ci: 'Forgets everything after the run', nijam: 'Remembers every build' },
];

/** One comparison column: a header lockup over a divided list of capabilities. */
function Column({
  header,
  rows,
  highlight,
}: {
  header: ReactNode;
  rows: string[];
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn('flex flex-col p-6 shadow-sm sm:p-7', highlight && 'ring-1 ring-primary/30')}
    >
      <Flex align="center" gap={2.5} className="pb-5">
        {header}
      </Flex>
      <Flex direction="col" className="divide-y divide-border border-t border-border">
        {rows.map((row) => (
          <Flex key={row} align="center" gap={3} className="py-3.5">
            <HugeiconsIcon
              icon={highlight ? Tick02Icon : Cancel01Icon}
              size={18}
              className={cn('shrink-0', highlight ? 'text-success' : 'text-muted-foreground')}
            />
            <Text
              as="span"
              className={cn(
                'text-sm text-pretty',
                highlight ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {row}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

/** "Your CI vs Nijam" band, sitting between the feature sections and the CTA. */
export function Comparison() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Text as="h2" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Your CI shows you logs. Nijam shows you answers.
          </Text>
          <Text className="mt-3.5 text-base text-pretty text-muted-foreground">
            Same test runs, from the reports your pipeline already produces. Nijam just asks a
            better question of them.
          </Text>
        </Reveal>

        <Reveal>
          <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
            <Column
              header={
                <>
                  <HugeiconsIcon icon={GithubIcon} size={22} className="text-muted-foreground" />
                  <Text
                    as="span"
                    className="text-base font-semibold tracking-tight text-muted-foreground"
                  >
                    GitHub Actions
                  </Text>
                </>
              }
              rows={ROWS.map((r) => r.ci)}
            />
            <Column
              highlight
              header={
                <>
                  <LogoMark className="size-6" />
                  <Text as="span" className="text-base font-semibold tracking-tight">
                    Nijam
                  </Text>
                </>
              }
              rows={ROWS.map((r) => r.nijam)}
            />
          </Grid>
        </Reveal>
      </div>
    </section>
  );
}
