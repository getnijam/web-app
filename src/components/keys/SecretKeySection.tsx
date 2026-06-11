import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Add01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { listSecretKeysOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { RowsSkeleton } from '@/components/states/RowsSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { KeyRow } from '@/components/keys/KeyRow';
import { CreateSecretKeyDialog } from '@/components/keys/CreateSecretKeyDialog';

type Kind = 'ingest' | 'read';

/**
 * One kind's worth of secret keys, as rendered inside its tab: the capability
 * note (what this kind can/can't do + a docs link), then a titled panel with
 * its own pre-bound "Create key" button and the rows for that kind. Both tab
 * routes render this; the list query is shared, so they hit the cache.
 */
export function SecretKeySection({
  orgId,
  kind,
  noteIcon,
  noteTitle,
  noteBody,
  docHref,
  docLabel,
  emptyTitle,
  emptyDescription,
}: {
  orgId: string;
  kind: Kind;
  noteIcon: IconSvgElement;
  noteTitle: string;
  noteBody: string;
  docHref: string;
  docLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const keys = useQuery(listSecretKeysOptions({ path: { orgId } }));
  const [createOpen, setCreateOpen] = useState(false);

  const list = (keys.data?.keys ?? []).filter((k) => k.kind === kind);

  const createButton = (
    <Button size="sm" className="shrink-0" onClick={() => setCreateOpen(true)}>
      <HugeiconsIcon icon={Add01Icon} size={15} />
      Create key
    </Button>
  );

  const renderBody = () => {
    if (keys.isLoading) return <RowsSkeleton rows={3} />;
    if (keys.error || !keys.data) {
      return (
        <div className="px-5 py-6">
          <ErrorState error={keys.error} onRetry={() => keys.refetch()} />
        </div>
      );
    }
    if (list.length === 0) {
      return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }
    return list.map((k) => <KeyRow key={k.id} orgId={orgId} secretKey={k} />);
  };

  return (
    <>
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
          <HugeiconsIcon icon={noteIcon} size={18} strokeWidth={1.8} />
        </Flex>
        <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
          <Text as="span" weight="semibold" className="text-sm">
            {noteTitle}
          </Text>
          <Text as="span" className="text-sm text-muted-foreground">
            {noteBody}
          </Text>
        </Flex>
        <Flex
          as="a"
          href={docHref}
          target="_blank"
          rel="noopener noreferrer"
          align="center"
          gap={1}
          className="shrink-0 self-center rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {docLabel}
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
        </Flex>
      </Flex>

      <SettingsPanel title="Keys" action={createButton}>
        {renderBody()}
      </SettingsPanel>

      <CreateSecretKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orgId={orgId}
        kind={kind}
      />
    </>
  );
}
