import { Loader2 } from 'lucide-react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

export function LoadingState({ message }: { message?: string | null }) {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      gap={3}
      className="py-16 text-muted-foreground"
    >
      <Loader2 className="h-7 w-7 animate-spin" />
      {message && <Text>{message}</Text>}
    </Flex>
  );
}
