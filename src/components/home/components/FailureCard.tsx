import { HugeiconsIcon } from '@hugeicons/react';
import { WorkflowSquare01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

const ERROR = `Error: expect(received).toHaveText(expected)
  Expected: "$63.20"
  Received: "$79.00"
    at order-total (checkout.spec.ts:42)`;

const CHIP = 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs';

export function FailureCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <Flex align="center" gap={2.5} className="mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
          <span className="size-1.5 rounded-full bg-destructive" />
          Failed
        </span>
        <Text as="span" className="font-mono text-sm font-semibold">
          checkout.spec.ts
        </Text>
      </Flex>

      <pre className="overflow-x-auto rounded-xl border border-destructive/20 bg-destructive/10 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-destructive">
        {ERROR}
      </pre>

      <Flex gap={2} wrap className="mt-3">
        <span className={CHIP}>
          <HugeiconsIcon icon={WorkflowSquare01Icon} size={14} className="text-muted-foreground" />
          trace.zip
        </span>
        <span className={CHIP}>2 screenshots</span>
        <span className={CHIP}>video.webm</span>
      </Flex>

      <Flex
        align="center"
        gap={2}
        className="mt-3 rounded-xl border border-warning/25 bg-warning/10 px-3 py-2.5 text-sm"
      >
        <HugeiconsIcon icon={Clock01Icon} size={17} className="shrink-0 text-warning" />
        <span>
          First failed 3 runs ago at commit <b className="font-mono">#c80a1f5</b>
        </span>
      </Flex>
    </div>
  );
}
