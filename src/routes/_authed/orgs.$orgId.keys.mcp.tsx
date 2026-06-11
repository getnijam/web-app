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
        noteTitle="Private & read-only"
        noteBody="Read keys are private to you — every member has their own, and you only see and manage the keys you create. They let MCP agents read your runs, failures and flakiness; read-only, so they can never upload or change settings."
        docHref="https://docs.nijam.dev/integrations/mcp/"
        docLabel="MCP docs"
        emptyTitle="No read keys yet"
        emptyDescription="Create one to let your MCP agents read your test data — it's private to you, never shown to other members. Then follow the setup below."
      />
      <McpSetupCard />
    </Flex>
  );
}
