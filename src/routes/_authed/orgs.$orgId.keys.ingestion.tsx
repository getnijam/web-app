import { createFileRoute } from '@tanstack/react-router';
import { CloudUploadIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { SecretKeySection } from '@/components/keys/SecretKeySection';
import { ReporterSetupCard } from '@/components/keys/ReporterSetupCard';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/$orgId/keys/ingestion')({
  head: () => privateSeo('Ingestion keys'),
  component: IngestionKeysPage,
});

function IngestionKeysPage() {
  const { orgId } = Route.useParams();
  return (
    <Flex direction="col" gap={6}>
      <SecretKeySection
        orgId={orgId}
        kind="ingest"
        noteIcon={CloudUploadIcon}
        noteTitle="Ingestion only"
        noteBody="Ingestion keys authenticate uploads from your CI provider. They grant write access to push runs, results and traces, they can't read data or change settings."
        docHref="https://docs.nijam.dev/reporter/ci-integration/"
        docLabel="Upload docs"
        emptyTitle="No ingestion keys yet"
        emptyDescription="Create one to let your CI upload results and traces."
      />
      <ReporterSetupCard />
    </Flex>
  );
}
