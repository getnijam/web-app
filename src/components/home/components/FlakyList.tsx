import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Sparkline bar heights are Tailwind scale classes; colors are theme tokens.
const S = 'bg-success';
const W = 'bg-warning';
const D = 'bg-destructive';

type Row = { name: string; file: string; score: string; spark: { h: string; c: string }[] };

const ROWS: Row[] = [
  {
    name: 'handles 3-D Secure challenge flow',
    file: 'payment.spec.ts',
    score: '38%',
    spark: [
      { h: 'h-2', c: S },
      { h: 'h-4.5', c: W },
      { h: 'h-2.5', c: S },
      { h: 'h-5.5', c: D },
      { h: 'h-3.5', c: W },
      { h: 'h-6', c: W },
    ],
  },
  {
    name: 'persists cart across sessions',
    file: 'cart.spec.ts',
    score: '21%',
    spark: [
      { h: 'h-3.5', c: S },
      { h: 'h-2.5', c: W },
      { h: 'h-4.5', c: S },
      { h: 'h-2.5', c: W },
      { h: 'h-4', c: S },
      { h: 'h-3', c: W },
    ],
  },
  {
    name: 'rejects expired coupon code',
    file: 'coupon.spec.ts',
    score: '12%',
    spark: [
      { h: 'h-4.5', c: S },
      { h: 'h-5', c: S },
      { h: 'h-2.5', c: W },
      { h: 'h-5.5', c: S },
      { h: 'h-4', c: S },
      { h: 'h-3.5', c: S },
    ],
  },
];

export function FlakyList() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      {ROWS.map((r, i) => (
        <Flex key={r.file} align="center" gap={3} className={cn('py-3', i > 0 && 'border-t border-border')}>
          <div className="min-w-0 flex-1">
            <Text as="p" truncate className="text-sm font-semibold">
              {r.name}
            </Text>
            <Text as="p" className="font-mono text-xs text-muted-foreground">
              {r.file}
            </Text>
          </div>
          <Flex align="end" className="h-6.5 gap-0.75">
            {r.spark.map((s, j) => (
              <span key={j} className={cn('w-1.5 rounded-sm', s.h, s.c)} />
            ))}
          </Flex>
          <Text as="span" align="right" className="w-9 text-xs font-bold text-warning">
            {r.score}
          </Text>
        </Flex>
      ))}
    </div>
  );
}
