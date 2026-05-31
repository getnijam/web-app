import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * Titled "coming soon" panel used by route scaffolds (org, users, project
 * sub-pages) so navigation + the app shell are demonstrable before each
 * screen's real content is built in a later phase.
 */
export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-4xl">
      <Text variant="h1">{title}</Text>
      <Flex
        direction="col"
        align="center"
        justify="center"
        gap={2}
        className="rounded-2xl border border-dashed border-border py-20 text-center"
      >
        <Text weight="semibold">Coming soon</Text>
        <Text color="muted" className="max-w-md">
          {description ?? `The ${title.toLowerCase()} screen lands in a later phase.`}
        </Text>
      </Flex>
    </Flex>
  );
}
