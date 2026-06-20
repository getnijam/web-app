import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';

/** A read-once panel of recovery codes with copy + download actions. */
export function BackupCodesPanel({ codes }: { codes: string[] }) {
  const text = codes.join('\n');

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    notify.success('Copied', { description: 'Backup codes copied to your clipboard.' });
  };

  const download = () => {
    const blob = new Blob([`Nijam two-factor backup codes\n\n${text}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nijam-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Flex direction="col" gap={3}>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-4">
        {codes.map((c) => (
          <Text key={c} as="span" className="text-center font-mono text-sm tracking-wide">
            {c}
          </Text>
        ))}
      </div>
      <Flex gap={2}>
        <Button variant="outline" size="sm" type="button" onClick={copy}>
          <HugeiconsIcon icon={Copy01Icon} size={16} />
          Copy
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={download}>
          <HugeiconsIcon icon={Download04Icon} size={16} />
          Download
        </Button>
      </Flex>
    </Flex>
  );
}
