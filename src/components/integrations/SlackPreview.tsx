import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { SlackLogo } from './SlackLogo';

// A faithful, static preview of the Slack message Nijam posts, mirrors the API's
// builder in api/src/services/slack-message.ts. Purely presentational (sample
// data), so users see what `Compact`/`Full` + `Classic`/`Block Kit` look like
// before saving. Theme tokens / Tailwind scale only (no arbitrary values).

export type PreviewState = 'pass' | 'flaky' | 'fail';
export type PreviewLayout = 'classic' | 'blockkit';
export type PreviewDetail = 'compact' | 'full';

interface SampleTest {
  file: string;
  title: string;
  status: 'fail' | 'flaky';
  error?: string;
}

interface Sample {
  passed: number;
  failed: number;
  flaky: number;
  durLabel: string;
  tests: SampleTest[];
}

const BASE = { project: 'web-checkout', branch: 'main', author: 'daniel', ci: 'GitHub Actions' };

const SAMPLES: Record<PreviewState, Sample & { commit: string }> = {
  fail: {
    commit: '4a91c2e',
    passed: 10,
    failed: 1,
    flaky: 2,
    durLabel: '2m 22s',
    tests: [
      {
        file: 'checkout.spec.ts',
        title: 'completes guest checkout with saved card',
        status: 'fail',
        error: 'expect(order-total).toHaveText("$63.20"), received "$79.00"',
      },
      { file: 'cart.spec.ts', title: 'persists cart across sessions', status: 'flaky' },
      { file: 'coupon.spec.ts', title: 'rejects expired coupon code', status: 'flaky' },
    ],
  },
  flaky: {
    commit: 'b1729d4',
    passed: 12,
    failed: 0,
    flaky: 2,
    durLabel: '2m 04s',
    tests: [
      { file: 'cart.spec.ts', title: 'persists cart across sessions', status: 'flaky' },
      { file: 'payment.spec.ts', title: 'handles 3-D Secure challenge flow', status: 'flaky' },
    ],
  },
  pass: { commit: 'e0c4f51', passed: 14, failed: 0, flaky: 0, durLabel: '1m 58s', tests: [] },
};

function meta(s: PreviewState) {
  if (s === 'fail') return { emoji: '🔴', label: 'Tests failed', bar: 'border-l-destructive' };
  if (s === 'flaky')
    return { emoji: '🟡', label: 'Passed with flaky tests', bar: 'border-l-warning' };
  return { emoji: '✅', label: 'All tests passed', bar: 'border-l-success' };
}

function StatField({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Flex direction="col" gap={0.5}>
      <Text as="span" className="text-xs font-semibold text-muted-foreground">
        {label}
      </Text>
      <Text as="span" className={cn('text-sm font-semibold tabular-nums', tone)}>
        {value}
      </Text>
    </Flex>
  );
}

function TestLine({ t, detail }: { t: SampleTest; detail: PreviewDetail }) {
  return (
    <Flex direction="col" gap={0.5}>
      <Text as="span" className="text-sm">
        <span aria-hidden="true">{t.status === 'fail' ? '🔴' : '🟡'} </span>
        <span className="font-mono text-xs">{t.file}</span>
        <span className="text-muted-foreground"> › </span>
        <span>{t.title}</span>
      </Text>
      {detail === 'full' && t.error && (
        <Text as="span" className="pl-5 text-xs text-muted-foreground italic">
          {t.error}
        </Text>
      )}
    </Flex>
  );
}

function MessageBody({ state, detail }: { state: PreviewState; detail: PreviewDetail }) {
  const m = meta(state);
  const s = SAMPLES[state];
  const shown = detail === 'full' ? s.tests : [];

  return (
    <Flex direction="col" gap={2.5}>
      <Text as="span" className="text-sm font-bold">
        <span aria-hidden="true">{m.emoji} </span>
        {m.label}
      </Text>
      <Text as="span" className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{BASE.project}</span> · #{s.commit} ·{' '}
        <span className="font-mono">{BASE.branch}</span> · {BASE.author} · {s.durLabel} · via{' '}
        {BASE.ci}
      </Text>

      <Flex gap={6} className="flex-wrap">
        <StatField label="Passed" value={s.passed} tone="text-success" />
        <StatField label="Failed" value={s.failed} tone="text-destructive" />
        <StatField label="Flaky" value={s.flaky} tone="text-warning" />
      </Flex>

      {shown.length > 0 && (
        <Flex direction="col" gap={2} className="border-t border-border pt-2.5">
          {shown.map((t, i) => (
            <TestLine key={i} t={t} detail={detail} />
          ))}
        </Flex>
      )}

      <Flex gap={2} className="flex-wrap pt-1">
        <Flex
          as="span"
          inline
          align="center"
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
        >
          View run on Nijam
        </Flex>
        <Flex
          as="span"
          inline
          align="center"
          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground"
        >
          View workflow ↗
        </Flex>
      </Flex>
    </Flex>
  );
}

export function SlackPreview({
  layout,
  state,
  detail,
}: {
  layout: PreviewLayout;
  state: PreviewState;
  detail: PreviewDetail;
}) {
  const m = meta(state);
  const channel = '#qa-alerts';

  return (
    <Flex direction="col" gap={2} className="rounded-xl border border-border bg-muted/30 p-4">
      <Text as="span" className="text-xs font-medium text-muted-foreground">
        <span className="font-mono">{channel}</span> · posted by Nijam
      </Text>

      <Flex gap={2.5} className="rounded-lg border border-border bg-background p-3">
        <Flex
          align="center"
          justify="center"
          className="size-9 shrink-0 self-start rounded-md bg-primary/10"
        >
          <SlackLogo size={18} />
        </Flex>
        <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
          <Flex align="center" gap={1.5}>
            <Text as="span" className="text-sm font-bold">
              Nijam
            </Text>
            <span className="rounded-sm bg-muted px-1 py-px text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              App
            </span>
            <Text as="span" className="text-xs text-muted-foreground">
              Today at 2:14 PM
            </Text>
          </Flex>

          {layout === 'classic' ? (
            <div className={cn('rounded-r-md border-l-4 bg-muted/40 py-2.5 pr-3 pl-3', m.bar)}>
              <MessageBody state={state} detail={detail} />
            </div>
          ) : (
            <MessageBody state={state} detail={detail} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
