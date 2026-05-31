import { Loader2 } from 'lucide-react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      gap={3}
      className="py-16 text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin" />
      <Text>{message}</Text>
    </Flex>
  );
}
