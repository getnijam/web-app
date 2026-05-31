import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, CloudUploadIcon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { listSecretKeysOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { KeyRow } from '@/components/keys/KeyRow';
import { CreateSecretKeyDialog } from '@/components/keys/CreateSecretKeyDialog';

export const Route = createFileRoute('/_authed/orgs/$orgId/keys')({ component: SecretKeysPage });

function SecretKeysPage() {
  const { orgId } = Route.useParams();
  const keys = useQuery(listSecretKeysOptions({ path: { orgId } }));
  const [createOpen, setCreateOpen] = useState(false);

  const list = keys.data?.keys ?? [];
  const total = list.length;
  const orgScoped = list.filter((k) => k.scope === 'org').length;

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-3xl">
      <Flex align="start" justify="between" gap={4}>
        <Flex direction="col" gap={1}>
          <Text variant="h1">Secret keys</Text>
          <Text color="muted">
            {total} active {total === 1 ? 'key' : 'keys'}
            {orgScoped > 0 && ` · ${orgScoped} org-scoped`} · used by CI to upload results & traces
          </Text>
        </Flex>
        <Button className="shrink-0" onClick={() => setCreateOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Create key
        </Button>
      </Flex>

      {/* Ingestion-only note */}
      <Flex
        align="start"
        gap={3}
        className="rounded-2xl border border-info/25 bg-info/8 px-4 py-3.5"
      >
        <Flex
          align="center"
          justify="center"
          className="size-9 shrink-0 rounded-lg bg-info/15 text-info"
        >
          <HugeiconsIcon icon={CloudUploadIcon} size={18} strokeWidth={1.8} />
        </Flex>
        <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
          <Text as="span" weight="semibold" className="text-sm">
            Ingestion only
          </Text>
          <Text as="span" className="text-sm text-muted-foreground">
            Secret keys authenticate uploads from your CI provider. They grant write access to push
            runs, results and traces — they can't read data or change settings.
          </Text>
        </Flex>
        <a
          href="https://www.npmjs.com/package/@nijam/pw-reporter"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 self-center rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Upload docs
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
        </a>
      </Flex>

      <SettingsPanel title="Keys">
        {keys.isLoading ? (
          <div className="px-5 py-6">
            <LoadingState />
          </div>
        ) : keys.error || !keys.data ? (
          <div className="px-5 py-6">
            <ErrorState error={keys.error} onRetry={() => keys.refetch()} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title="No secret keys yet"
            description="Create a key to let your CI upload results and traces to Nijam."
            action={
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} size={16} />
                Create key
              </Button>
            }
          />
        ) : (
          list.map((k) => <KeyRow key={k.id} orgId={orgId} secretKey={k} />)
        )}
      </SettingsPanel>

      <CreateSecretKeyDialog open={createOpen} onOpenChange={setCreateOpen} orgId={orgId} />
    </Flex>
  );
}
