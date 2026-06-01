import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Decorative fake dashboard window. Bar heights are Tailwind scale classes (no
// arbitrary values); colors are theme tokens.
const CHART: { p: string; f?: string }[] = [
  { p: 'h-10.5' },
  { p: 'h-12.5' },
  { p: 'h-7.5', f: 'h-2' },
  { p: 'h-11.5' },
  { p: 'h-13' },
  { p: 'h-5.5', f: 'h-3.5' },
  { p: 'h-12' },
  { p: 'h-11' },
];

type Run = {
  bar: string;
  cid: string;
  time: string;
  counts: { dot: string; n: number }[];
  pill: string;
  label: string;
};

const RUNS: Run[] = [
  {
    bar: 'bg-warning',
    cid: '#a3f9c01',
    time: '2h ago · main',
    counts: [
      { dot: 'bg-success', n: 246 },
      { dot: 'bg-warning', n: 2 },
    ],
    pill: 'bg-warning/15 text-warning',
    label: 'Flaky',
  },
  {
    bar: 'bg-success',
    cid: '#7d2e4b8',
    time: '5h ago · main',
    counts: [{ dot: 'bg-success', n: 248 }],
    pill: 'bg-success/15 text-success',
    label: 'Passed',
  },
  {
    bar: 'bg-destructive',
    cid: '#c80a1f5',
    time: '9h ago · release/2.4',
    counts: [
      { dot: 'bg-success', n: 241 },
      { dot: 'bg-destructive', n: 7 },
    ],
    pill: 'bg-destructive/15 text-destructive',
    label: 'Failed',
  },
];

export function ProductMock() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      aria-hidden="true"
    >
      <Flex align="center" gap={2} className="border-b border-border bg-muted/40 px-3.5 py-3">
        <span className="size-2.75 rounded-full bg-destructive/70" />
        <span className="size-2.75 rounded-full bg-warning/70" />
        <span className="size-2.75 rounded-full bg-success/70" />
        <span className="ml-2.5 flex h-6 flex-1 items-center rounded-md border border-border bg-background px-2.5 font-mono text-xs text-muted-foreground">
          nijam.dev/p/web-checkout/runs
        </span>
      </Flex>

      <div className="p-4">
        <Flex align="baseline" justify="between" className="mb-3.5">
          <Text as="span" className="text-base font-bold">
            Runs
          </Text>
          <Text as="span" className="font-mono text-xs text-muted-foreground">
            nijam/web-checkout · main
          </Text>
        </Flex>

        <Grid cols={3} className="mb-3.5 gap-2.5">
          {[
            { k: 'Success rate', v: '96.2', s: '%' },
            { k: 'Total tests', v: '248' },
            { k: 'Avg time', v: '4m 12', s: 's' },
          ].map((m) => (
            <div key={m.k} className="rounded-xl border border-border p-3">
              <Text as="span" className="text-xs font-semibold text-muted-foreground">
                {m.k}
              </Text>
              <Text as="p" className="mt-0.5 text-2xl font-bold tracking-tight">
                {m.v}
                {m.s && <small className="text-sm font-semibold text-muted-foreground">{m.s}</small>}
              </Text>
            </div>
          ))}
        </Grid>

        <Flex align="end" gap={1.5} className="mb-3 h-16 border-b border-border px-0.5 pt-2">
          {CHART.map((c, i) => (
            <Flex key={i} direction="col-reverse" gap={0.5} className="flex-1">
              <span className={cn('rounded-sm bg-success', c.p)} />
              {c.f && <span className={cn('rounded-sm bg-destructive', c.f)} />}
            </Flex>
          ))}
        </Flex>

        <Flex direction="col" gap={0.5}>
          {RUNS.map((r) => (
            <Flex
              key={r.cid}
              align="center"
              gap={2.5}
              className="rounded-lg px-1.5 py-2 hover:bg-muted"
            >
              <span className={cn('h-full w-0.75 self-stretch rounded-full', r.bar)} />
              <div>
                <Text as="p" className="font-mono text-xs font-semibold">
                  {r.cid}
                </Text>
                <Text as="p" className="text-xs text-muted-foreground">
                  {r.time}
                </Text>
              </div>
              <Flex align="center" gap={2} className="ml-auto text-xs text-muted-foreground tabular-nums">
                {r.counts.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className={cn('size-1.75 rounded-full', c.dot)} />
                    {c.n}
                  </span>
                ))}
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', r.pill)}>
                  {r.label}
                </span>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </div>
    </div>
  );
}
