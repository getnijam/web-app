import { Input } from '@/components/ui/input';
import { Flex } from '@/components/ui/flex';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

/**
 * A read-only value beside a copy button — the reveal pattern from the Secret-keys
 * dialog, extracted for reuse. Use anywhere we show a value the user needs to copy
 * (redirect URIs, DNS records, ids). Click selects the text; the button copies it.
 */
export function CopyField({
  value,
  mono = true,
  className,
}: {
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <Flex gap={2} align="center" className={cn('w-full', className)}>
      <Input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className={cn('flex-1', mono && 'font-mono text-xs')}
      />
      <CopyButton value={value} variant="outline" className="shrink-0" />
    </Flex>
  );
}
