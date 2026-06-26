import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

// Preview of the (upcoming) Slack message, 10/2/1 example shared with the dashboard.
const TESTS = [
  '🔴 checkout.spec.ts › completes guest checkout',
  '🟡 cart.spec.ts › persists cart across sessions',
  '🟡 coupon.spec.ts › rejects expired coupon',
];

export function SlackCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <Flex gap={3}>
        <Flex
          inline
          align="center"
          justify="center"
          className="size-9 shrink-0 rounded-lg bg-brand text-primary-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.5 12.5l3.2 3.2 7.8-7.8"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Flex>

        <div className="min-w-0">
          <Flex align="baseline" gap={2}>
            <Text as="span" className="text-sm font-extrabold">
              Nijam
            </Text>
            <span className="rounded-sm bg-muted px-1.5 py-px text-xs font-semibold text-muted-foreground">
              APP
            </span>
            <Text as="span" className="text-xs text-muted-foreground">
              2:14 PM
            </Text>
          </Flex>

          <div className="mt-2 border-l-2 border-destructive pl-3">
            <Text as="p" className="text-sm font-bold">
              🔴 Tests failed,{' '}
              <span className="font-medium text-info">web-checkout · #4a91c2e</span>
            </Text>
            <Flex className="mt-1.5 gap-3.5 text-xs text-muted-foreground">
              <span>
                <b className="text-success">10</b> passed
              </span>
              <span>
                <b className="text-warning">2</b> flaky
              </span>
              <span>
                <b className="text-destructive">1</b> failed
              </span>
            </Flex>
            <Flex direction="col" gap={1} className="mt-2 text-xs">
              {TESTS.map((t) => (
                <span key={t} className="text-info">
                  {t}
                </span>
              ))}
            </Flex>
          </div>
        </div>
      </Flex>
    </div>
  );
}
