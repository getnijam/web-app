import { HugeiconsIcon } from '@hugeicons/react';
import { GitPullRequestIcon, CancelCircleIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

// Preview of the GitHub PR surface Nijam posts to, the same 10/2/1 example as the
// Slack card: a red status check plus a sticky results comment on the pull request.
const TESTS = [
  '🔴 checkout.spec.ts › completes guest checkout',
  '🟡 cart.spec.ts › persists cart across sessions',
  '🟡 coupon.spec.ts › rejects expired coupon',
];

export function GitHubCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      {/* Pull request title */}
      <Flex align="center" gap={2}>
        <HugeiconsIcon icon={GitPullRequestIcon} size={18} className="shrink-0 text-success" />
        <Text as="span" className="truncate text-sm font-semibold">
          Fix guest checkout flow <span className="font-normal text-muted-foreground">#128</span>
        </Text>
      </Flex>

      {/* Checks box */}
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <Flex align="center" gap={2.5} className="border-b border-border bg-muted/40 px-3 py-2">
          <HugeiconsIcon icon={CancelCircleIcon} size={16} className="shrink-0 text-destructive" />
          <Text as="span" className="text-xs font-medium">
            Some checks were not successful
          </Text>
          <Text as="span" className="ml-auto text-xs text-muted-foreground">
            1 failing
          </Text>
        </Flex>
        <Flex align="center" gap={2.5} className="px-3 py-2.5">
          <HugeiconsIcon icon={CancelCircleIcon} size={16} className="shrink-0 text-destructive" />
          <div className="min-w-0">
            <Text as="p" className="text-xs font-semibold">
              Nijam · web-checkout
            </Text>
            <Text as="p" className="text-xs text-muted-foreground">
              Failed, 10 passed · 2 flaky · 1 failed
            </Text>
          </div>
          <Text as="span" className="ml-auto text-xs font-medium text-info">
            Details
          </Text>
        </Flex>
      </div>

      {/* Sticky PR comment */}
      <Flex gap={3} className="mt-3">
        <Flex
          inline
          align="center"
          justify="center"
          className="size-8 shrink-0 rounded-lg bg-brand text-primary-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.5 12.5l3.2 3.2 7.8-7.8"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Flex>

        <div className="min-w-0 flex-1 rounded-lg border border-border">
          <Flex align="baseline" gap={2} className="border-b border-border bg-muted/40 px-3 py-1.5">
            <Text as="span" className="text-xs font-bold">
              Nijam
            </Text>
            <span className="rounded-sm bg-muted px-1.5 py-px text-xs font-semibold text-muted-foreground">
              APP
            </span>
            <Text as="span" className="text-xs text-muted-foreground">
              commented
            </Text>
          </Flex>
          <div className="px-3 py-2.5">
            <Text as="p" className="text-sm font-bold">
              🔴 Tests failed
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
