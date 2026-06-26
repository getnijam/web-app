import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

type RunRow = {
  status: 'pass' | 'flaky' | 'fail';
  name: string;
  meta: string;
};

const RUN_ROWS: RunRow[] = [
  { status: 'pass', name: 'auth/login.spec.ts', meta: '1.2s' },
  { status: 'pass', name: 'checkout/cart.spec.ts', meta: '3.4s' },
  { status: 'flaky', name: 'search/filters.spec.ts', meta: 'flaky · 2/3' },
  { status: 'pass', name: 'dashboard/overview.spec.ts', meta: '0.9s' },
  { status: 'pass', name: 'api/tokens.spec.ts', meta: '0.6s' },
];

const STATUS_DOT: Record<RunRow['status'], string> = {
  pass: 'bg-success',
  flaky: 'bg-warning',
  fail: 'bg-destructive',
};

const STATUS_GLYPH: Record<RunRow['status'], string> = {
  pass: '✓',
  flaky: '!',
  fail: '✕',
};

const STATUS_TEXT: Record<RunRow['status'], string> = {
  pass: 'text-success',
  flaky: 'text-warning',
  fail: 'text-destructive',
};

/**
 * Decorative right-hand panel for the auth screens, a faux Nijam test run that
 * sells the product's niche (test run history + flakiness) at a glance.
 */
export function AuthBrandPanel() {
  // Outer container stays a div: it's `hidden` on mobile and only `flex` at lg,
  // which the Flex primitive (always `display:flex`) can't express.
  return (
    <div className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div aria-hidden="true" />

      <Flex direction="col" gap={8} className="relative">
        <Flex direction="col" gap={3}>
          <Text as="h2" variant="display">
            Ship green.
            <br />
            Catch flakes early.
          </Text>
          <Text className="max-w-sm text-background/60">
            Run history, failure analysis, and flakiness scoring for your Playwright, pytest &amp;
            Vitest suites, without babysitting CI logs.
          </Text>
        </Flex>

        {/* faux terminal / run summary card */}
        <Flex
          direction="col"
          className="max-w-md overflow-hidden rounded-xl border border-background/10 bg-background/5 font-mono text-sm shadow-2xl backdrop-blur"
        >
          <Flex align="center" gap={2} className="border-b border-background/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-background/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-background/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-background/20" />
            <Text as="span" className="ml-2 text-background/50">
              nijam · main · 2m ago
            </Text>
          </Flex>
          <Flex direction="col" gap={1.5} className="px-4 py-3">
            {RUN_ROWS.map((row) => (
              <Flex key={row.name} align="center" gap={3}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
                <Text as="span" className={`w-3 ${STATUS_TEXT[row.status]}`}>
                  {STATUS_GLYPH[row.status]}
                </Text>
                <Text as="span" className="flex-1 truncate text-background/80">
                  {row.name}
                </Text>
                <Text as="span" className="text-background/40">
                  {row.meta}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Flex
            align="center"
            justify="between"
            className="border-t border-background/10 px-4 py-2.5 text-background/60"
          >
            <Text as="span">
              <Text as="span" className="text-success">
                142 passed
              </Text>{' '}
              ·{' '}
              <Text as="span" className="text-warning">
                1 flaky
              </Text>{' '}
              · 0 failed
            </Text>
            <Text as="span" className="text-background/80">
              98.6%
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Text as="p" variant="code" className="relative text-background/40">
        reporter: ['@nijam/pw-reporter', {'{'} projectId: '…' {'}'}]
      </Text>
    </div>
  );
}
