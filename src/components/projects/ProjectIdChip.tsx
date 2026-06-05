import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

/**
 * Compact, copyable display of a project's UUID. Shown on the project card and
 * the runs page so users can grab the `projectId` for their reporter config.
 */
export function ProjectIdChip({ value, className }: { value: string; className?: string }) {
  return (
    <Flex
      align="center"
      gap={2}
      className={cn(
        'min-w-0 rounded-lg border border-border bg-muted/40 py-1 pr-1 pl-2.5',
        className,
      )}
    >
      <Text as="span" className="shrink-0 text-xs font-medium text-muted-foreground">
        ID
      </Text>
      <Text as="span" variant="code" truncate className="min-w-0 flex-1 text-foreground">
        {value}
      </Text>
      <CopyButton value={value} variant="ghost" size="icon-xs" iconSize={13} className="shrink-0" />
    </Flex>
  );
}
