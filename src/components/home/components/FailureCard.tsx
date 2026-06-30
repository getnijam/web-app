import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

// The assertion line and the trace-location line carry different weight: the
// assertion IS the failure; the location is metadata. Color only the assertion.
type ErrorLine = { text: string; muted?: boolean };

const ERROR: ErrorLine[] = [
  { text: 'Error: locator.waitFor: Timeout 30000ms exceeded.' },
  { text: "  waiting for getByText('Save changes')" },
  { text: '    at editor.spec.ts:84', muted: true },
];

const CHIP = 'rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs';

export function FailureCard() {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {/* Terminal-style header: window-control dots, file path, verdict pinned right. */}
      <Flex align="center" gap={2} className="border-b border-border bg-muted/40 px-3.5 py-2.5">
        <Flex gap={1.5}>
          <span className="size-2.5 rounded-full bg-destructive/65" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-warning/65" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-success/65" aria-hidden="true" />
        </Flex>
        <Text as="span" className="ml-2 truncate font-mono text-xs text-muted-foreground">
          editor.spec.ts
        </Text>
        <Flex
          as="span"
          inline
          align="center"
          gap={1.5}
          className="ml-auto rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive"
        >
          <span className="size-1.5 rounded-full bg-destructive" />
          Failed
        </Flex>
      </Flex>

      <div className="p-4.5">
        <pre className="overflow-x-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {ERROR.map((line, i) => (
            <div key={i} className={line.muted ? 'text-muted-foreground' : 'text-destructive'}>
              {line.text}
            </div>
          ))}
        </pre>

        <Flex gap={2} wrap className="mt-3">
          <Flex as="span" inline align="center" gap={1.5} className={CHIP}>
            trace.zip
          </Flex>
          <Flex as="span" inline align="center" gap={1.5} className={CHIP}>
            2 screenshots
          </Flex>
          <Flex as="span" inline align="center" gap={1.5} className={CHIP}>
            video.webm
          </Flex>
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
    </div>
  );
}
