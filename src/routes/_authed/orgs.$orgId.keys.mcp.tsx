import { createFileRoute } from '@tanstack/react-router';
import { AiChat02Icon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { SecretKeySection } from '@/components/keys/SecretKeySection';
import { McpSetupCard } from '@/components/keys/McpSetupCard';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/keys/mcp')({
  head: () => privateSeo('Read keys (MCP)'),
  component: McpKeysPage,
});

function McpKeysPage() {
  const { orgId } = Route.useParams();
  return (
    <Flex direction="col" gap={6}>
      <SecretKeySection
        orgId={orgId}
        kind="read"
        noteIcon={AiChat02Icon}
        noteTitle="Read only"
        noteBody="Read keys let MCP agents query your runs, failures and flakiness. They grant read access only — they can never upload, change settings, or touch billing."
        docHref="https://docs.nijam.dev/integrations/mcp/"
        docLabel="MCP docs"
        emptyTitle="No read keys yet"
        emptyDescription="Create one to let MCP agents read your test data — then follow the setup below."
      />
      <McpSetupCard />
    </Flex>
  );
}
