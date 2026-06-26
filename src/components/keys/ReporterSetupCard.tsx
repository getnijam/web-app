import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyButton } from '@/components/ui/copy-button';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

const PKG = '@nijam/pw-reporter';
const KEY_PLACEHOLDER = 'nij_sk_...';

// Install command per package manager, the reporter is a dev dependency.
const MANAGERS = [
  { id: 'npm', command: `npm install -D ${PKG}` },
  { id: 'pnpm', command: `pnpm add -D ${PKG}` },
  { id: 'yarn', command: `yarn add -D ${PKG}` },
  { id: 'bun', command: `bun add -d ${PKG}` },
];

const CONFIG = `reporter: [
  ['${PKG}', {
    apiKey: process.env.NIJAM_API_KEY,
    projectId: '<your-project-id>',
  }],
]`;

const RUN = `NIJAM_API_KEY=${KEY_PLACEHOLDER} npx playwright test`;

/**
 * Copy-paste setup for uploading runs from CI, shown on the secret-keys page -
 * the ingestion key created above is the credential the reporter needs. Mirrors
 * the MCP card on the read-keys tab: install the reporter, wire it into the
 * Playwright config, run with the key.
 */
export function ReporterSetupCard() {
  return (
    <SettingsPanel title="Use in your CI">
      <Flex direction="col" gap={4} className="px-5 py-4">
        <Text color="muted" className="text-sm">
          Add the Nijam reporter to your Playwright config and pass an ingestion key (nij_sk_…) as
          NIJAM_API_KEY. Every test run then uploads automatically, results, traces, and history.
        </Text>

        {/* Step 1, install the reporter */}
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

        {/* Step 2, add it to the Playwright config */}
        <Flex direction="col" gap={2}>
          <Flex align="center" justify="between" gap={2}>
            <Text as="span" className="text-xs font-medium text-muted-foreground">
              Add it to playwright.config.ts
            </Text>
            <CopyButton value={CONFIG} variant="ghost" size="xs" iconSize={13} label="Copy" />
          </Flex>
          <Text
            as="pre"
            variant="code"
            className="overflow-x-auto rounded-md bg-muted p-3 text-foreground"
          >
            {CONFIG}
          </Text>
        </Flex>

        {/* Step 3, run with the key */}
        <Flex direction="col" gap={2}>
          <Text as="span" className="text-xs font-medium text-muted-foreground">
            Run your tests with the key
          </Text>
          <Flex align="center" gap={2} className="rounded-md bg-muted py-1.5 pr-1.5 pl-3">
            <Text
              as="code"
              variant="code"
              className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground"
            >
              {RUN}
            </Text>
            <CopyButton
              value={RUN}
              variant="ghost"
              size="icon-xs"
              iconSize={13}
              className="shrink-0"
            />
          </Flex>
        </Flex>

        <Text as="span" className="text-xs text-muted-foreground">
          Find your project&rsquo;s ID in its settings. Store the key as a CI secret (NIJAM_API_KEY)
          , never commit it.
        </Text>
      </Flex>
    </SettingsPanel>
  );
}
