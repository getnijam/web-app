import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyButton } from '@/components/ui/copy-button';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

const KEY_PLACEHOLDER = 'nij_rk_...';

// The standard `mcpServers` JSON block — Cursor and Claude Desktop both use it.
const MCP_SERVERS_JSON = `{
  "mcpServers": {
    "nijam": {
      "command": "npx",
      "args": ["-y", "@nijam/mcp-server"],
      "env": { "NIJAM_API_KEY": "${KEY_PLACEHOLDER}" }
    }
  }
}`;

/** Per-client setup. A `command` renders as a one-liner row; `code` as a block. */
const CLIENTS: Array<{
  id: string;
  label: string;
  command?: string;
  fileHint?: string;
  code?: string;
}> = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    command: `claude mcp add -s user nijam -e NIJAM_API_KEY=${KEY_PLACEHOLDER} -- npx -y @nijam/mcp-server`,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    fileHint: 'Add to ~/.cursor/mcp.json (or .cursor/mcp.json in a project)',
    code: MCP_SERVERS_JSON,
  },
  {
    id: 'codex',
    label: 'Codex',
    fileHint: 'Add to ~/.codex/config.toml',
    code: `[mcp_servers.nijam]
command = "npx"
args = ["-y", "@nijam/mcp-server"]
env = { NIJAM_API_KEY = "${KEY_PLACEHOLDER}" }`,
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    fileHint: 'Add to claude_desktop_config.json',
    code: MCP_SERVERS_JSON,
  },
];

/**
 * Copy-paste setup for the Nijam MCP server, shown on the secret-keys page —
 * a read key created above is the credential the snippets need.
 */
export function McpSetupCard() {
  return (
    <SettingsPanel title="Use with AI agents (MCP)">
      <Flex direction="col" gap={4} className="px-5 py-4">
        <Text color="muted" className="text-sm">
          The Nijam MCP server lets any MCP-capable agent — Claude Code, Cursor, Codex, Claude
          Desktop, and friends — answer questions about your test runs: what failed, why, since
          when, and what&rsquo;s flaky. It needs a read key (nij_rk_…) and can never change
          anything.
        </Text>

        <Tabs defaultValue={CLIENTS[0]!.id}>
          <TabsList>
            {CLIENTS.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CLIENTS.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              {c.command ? (
                <Flex align="center" gap={2} className="rounded-md bg-muted py-1.5 pr-1.5 pl-3">
                  <Text
                    as="code"
                    variant="code"
                    className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground"
                  >
                    {c.command}
                  </Text>
                  <CopyButton
                    value={c.command}
                    variant="ghost"
                    size="icon-xs"
                    iconSize={13}
                    className="shrink-0"
                  />
                </Flex>
              ) : (
                <Flex direction="col" gap={2}>
                  <Flex align="center" justify="between" gap={2}>
                    <Text as="span" className="text-xs font-medium text-muted-foreground">
                      {c.fileHint}
                    </Text>
                    <CopyButton
                      value={c.code!}
                      variant="ghost"
                      size="xs"
                      iconSize={13}
                      label="Copy"
                    />
                  </Flex>
                  <Text
                    as="pre"
                    variant="code"
                    className="overflow-x-auto rounded-md bg-muted p-3 text-foreground"
                  >
                    {c.code}
                  </Text>
                </Flex>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Text as="span" className="text-xs text-muted-foreground">
          Replace {KEY_PLACEHOLDER} with a read key from above — read keys cover the whole org, so
          agents can resolve any project by name.
        </Text>
      </Flex>
    </SettingsPanel>
  );
}
