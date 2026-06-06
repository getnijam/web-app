import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareLock02Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyButton } from '@/components/ui/copy-button';
import { ProjectIdChip } from './ProjectIdChip';

const PKG = '@nijam/pw-reporter';

// Install command per package manager — the reporter is a dev dependency.
const MANAGERS = [
  { id: 'npm', command: `npm install -D ${PKG}` },
  { id: 'pnpm', command: `pnpm add -D ${PKG}` },
  { id: 'yarn', command: `yarn add -D ${PKG}` },
  { id: 'bun', command: `bun add -d ${PKG}` },
];

/**
 * The copy-paste onboarding a project needs to start ingesting runs: install the
 * reporter (npm/pnpm/yarn/bun), add it to playwright.config.ts, and the project ID
 * + a shortcut to its secret keys. Shown on a project's empty Runs state.
 */
export function ReporterSnippet({ orgId, projectId }: { orgId: string; projectId: string }) {
  const snippet = `reporter: [
  ['${PKG}', {
    apiKey: process.env.NIJAM_API_KEY,
    projectId: '${projectId}',
  }],
]`;
  return (
    <Flex direction="col" gap={5} className="rounded-2xl border border-dashed border-border p-6">
      <Flex direction="col" align="center" gap={1} className="text-center">
        <Text weight="semibold">Waiting for the first run</Text>
        <Text color="muted" className="max-w-md">
          Install{' '}
          <Text as="span" variant="code">
            {PKG}
          </Text>
          , add it to your{' '}
          <Text as="span" variant="code">
            playwright.config.ts
          </Text>
          , and run your tests — results will appear here.
        </Text>
      </Flex>

      {/* Step 1 — install the reporter */}
      <Flex direction="col" gap={2}>
        <Text as="span" className="text-xs font-medium text-muted-foreground">
          Install the reporter
        </Text>
        <Tabs defaultValue="npm">
          <TabsList>
            {MANAGERS.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.id}
              </TabsTrigger>
            ))}
          </TabsList>
          {MANAGERS.map((m) => (
            <TabsContent key={m.id} value={m.id}>
              <Flex align="center" gap={2} className="rounded-md bg-muted py-1.5 pr-1.5 pl-3">
                <Text
                  as="code"
                  variant="code"
                  className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground"
                >
                  {m.command}
                </Text>
                <CopyButton
                  value={m.command}
                  variant="ghost"
                  size="icon-xs"
                  iconSize={13}
                  className="shrink-0"
                />
              </Flex>
            </TabsContent>
          ))}
        </Tabs>
      </Flex>

      {/* Step 2 — add it to the Playwright config */}
      <Flex direction="col" gap={2}>
        <Flex align="center" justify="between" gap={2}>
          <Text as="span" className="text-xs font-medium text-muted-foreground">
            Add it to playwright.config.ts
          </Text>
          <CopyButton value={snippet} variant="ghost" size="xs" iconSize={13} label="Copy" />
        </Flex>
        <Text
          as="pre"
          variant="code"
          className="overflow-x-auto rounded-md bg-muted p-3 text-foreground"
        >
          {snippet}
        </Text>
      </Flex>

      <Flex align="center" justify="between" gap={3} wrap>
        <ProjectIdChip value={projectId} className="min-w-0" />
        <Button asChild className="shrink-0">
          <Link to="/orgs/$orgId/keys" params={{ orgId }}>
            <HugeiconsIcon icon={SquareLock02Icon} size={16} />
            Secret keys
          </Link>
        </Button>
      </Flex>
    </Flex>
  );
}
