import type { ReactNode } from 'react';
import { Grid } from '@/components/ui/grid';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/** One settings field: a label/hint column beside the control (stacks on mobile). */
export function SettingsRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Grid
      cols={[1, 1, 2]}
      gap={4}
      className="items-start border-b border-border px-5 py-5 last:border-b-0"
    >
      <Flex direction="col" gap={1}>
        <Text as="span" className="text-sm font-semibold">
          {label}
        </Text>
        {hint && (
          <Text as="span" className="text-xs text-muted-foreground">
            {hint}
          </Text>
        )}
      </Flex>
      <Flex direction="col" gap={1.5} className="min-w-0 md:items-end">
        {children}
      </Flex>
    </Grid>
  );
}
