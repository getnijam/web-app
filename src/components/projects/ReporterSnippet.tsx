import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * The copy-paste reporter config a project needs to start ingesting runs.
 * Shown on a project's empty Runs state ("waiting for the first run"), so the
 * project ID is always reachable after creating a project.
 */
export function ReporterSnippet({ projectId }: { projectId: string }) {
  const snippet = `reporter: [
  ['@nijam/pw-reporter', {
    apiKey: process.env.NIJAM_API_KEY,
    projectId: '${projectId}',
  }],
]`;
  return (
    <Flex direction="col" gap={4} className="rounded-2xl border border-dashed border-border p-6">
      <Flex direction="col" align="center" gap={1} className="text-center">
        <Text weight="semibold">Waiting for the first run</Text>
        <Text color="muted" className="max-w-md">
          Add{' '}
          <Text as="span" variant="code">
            @nijam/pw-reporter
          </Text>{' '}
          to your{' '}
          <Text as="span" variant="code">
            playwright.config.ts
          </Text>{' '}
          and run your tests — results will appear here.
        </Text>
      </Flex>
      <Text
        as="pre"
        variant="code"
        className="overflow-x-auto rounded-md bg-muted p-3 text-foreground"
      >
        {snippet}
      </Text>
      <Text variant="caption" color="muted">
        Project ID:{' '}
        <Text as="span" variant="code" className="text-foreground">
          {projectId}
        </Text>
      </Text>
    </Flex>
  );
}
