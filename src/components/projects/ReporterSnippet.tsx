import { Link } from '@tanstack/react-router';
import { ORG_KEYS_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareLock02Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyButton } from '@/components/ui/copy-button';
import { ProjectIdChip } from './ProjectIdChip';
import type { TestFramework } from '@/lib/test-framework';

type FrameworkSetup = {
  pkg: string;
  configFile: string;
  /** Install command per package manager, the reporter is a dev dependency. */
  managers: { id: string; command: string }[];
  /** The config snippet a user pastes into `configFile`. */
  snippet: (projectId: string) => string;
};

const PW_PKG = '@nijam/pw-reporter';
const PYTEST_PKG = 'pytest-nijam';
const VITEST_PKG = '@nijam/vitest-reporter';

const SETUP: Record<TestFramework, FrameworkSetup> = {
  playwright: {
    pkg: PW_PKG,
    configFile: 'playwright.config.ts',
    managers: [
      { id: 'npm', command: `npm install -D ${PW_PKG}` },
      { id: 'pnpm', command: `pnpm add -D ${PW_PKG}` },
      { id: 'yarn', command: `yarn add -D ${PW_PKG}` },
      { id: 'bun', command: `bun add -d ${PW_PKG}` },
    ],
    snippet: (projectId) => `reporter: [
  ['${PW_PKG}', {
    apiKey: process.env.NIJAM_API_KEY,
    projectId: '${projectId}',
  }],
]`,
  },
  pytest: {
    pkg: PYTEST_PKG,
    configFile: 'pytest.ini',
    managers: [
      { id: 'pip', command: `pip install ${PYTEST_PKG}` },
      { id: 'poetry', command: `poetry add --group dev ${PYTEST_PKG}` },
      { id: 'uv', command: `uv add --dev ${PYTEST_PKG}` },
    ],
    // The API key is read from NIJAM_API_KEY (a CI secret), not the ini file.
    snippet: (projectId) => `[pytest]
nijam_project_id = ${projectId}
# Set NIJAM_API_KEY in your environment (e.g. a CI secret).`,
  },
  vitest: {
    pkg: VITEST_PKG,
    configFile: 'vitest.config.ts',
    managers: [
      { id: 'npm', command: `npm install -D ${VITEST_PKG}` },
      { id: 'pnpm', command: `pnpm add -D ${VITEST_PKG}` },
      { id: 'yarn', command: `yarn add -D ${VITEST_PKG}` },
      { id: 'bun', command: `bun add -d ${VITEST_PKG}` },
    ],
    snippet: (projectId) => `import NijamReporter from '${VITEST_PKG}';

export default {
  test: {
    reporters: [
      'default',
      new NijamReporter({
        apiKey: process.env.NIJAM_API_KEY,
        projectId: '${projectId}',
      }),
    ],
  },
};`,
  },
};

/**
 * The copy-paste onboarding a project needs to start ingesting runs: install the
 * reporter, add it to the framework's config file, plus the project ID + a shortcut
 * to its secret keys. Shown on a project's empty Runs state. Branches on the
 * project's test framework (Playwright vs pytest).
 */
export function ReporterSnippet({
  orgId,
  projectId,
  framework,
}: {
  orgId: string;
  projectId: string;
  framework: TestFramework;
}) {
  const setup = SETUP[framework];
  const snippet = setup.snippet(projectId);
  return (
    <Flex direction="col" gap={5} className="rounded-2xl border border-dashed border-border p-6">
      <Flex direction="col" align="center" gap={1} className="text-center">
        <Text weight="semibold">Waiting for the first run</Text>
        <Text color="muted" className="max-w-md">
          Install{' '}
          <Text as="span" variant="code">
            {setup.pkg}
          </Text>
          , add it to your{' '}
          <Text as="span" variant="code">
            {setup.configFile}
          </Text>
          , and run your tests, results will appear here.
        </Text>
      </Flex>

      {/* Step 1, install the reporter */}
      <Flex direction="col" gap={2}>
        <Text as="span" className="text-xs font-medium text-muted-foreground">
          Install the reporter
        </Text>
        <Tabs defaultValue={setup.managers[0]?.id}>
          <TabsList>
            {setup.managers.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.id}
              </TabsTrigger>
            ))}
          </TabsList>
          {setup.managers.map((m) => (
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

      {/* Step 2, add it to the framework config */}
      <Flex direction="col" gap={2}>
        <Flex align="center" justify="between" gap={2}>
          <Text as="span" className="text-xs font-medium text-muted-foreground">
            Add it to {setup.configFile}
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
          <Link to={ORG_KEYS_ROUTE} params={{ orgId }}>
            <HugeiconsIcon icon={SquareLock02Icon} size={16} />
            Secret keys
          </Link>
        </Button>
      </Flex>
    </Flex>
  );
}
