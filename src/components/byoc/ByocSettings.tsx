import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudIcon,
  DatabaseIcon,
  CloudServerIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  CancelCircleIcon,
  LockKeyIcon,
} from '@hugeicons/core-free-icons';
import type { ByocConfigResponse, ByocStorageCredentials } from '@/client';
import {
  getOrgByocOptions,
  getOrgByocQueryKey,
  getOrgBillingOptions,
  updateOrgByocMutation,
  deleteOrgByocMutation,
  testOrgByocMutation,
  createBillingCheckoutMutation,
} from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FilterCombobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { ORGS_ROUTE } from '@/lib/routes';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { openExternal } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type Provider = 's3' | 'gcs' | 'azure';
type Subsystem = ByocConfigResponse['db'] | ByocConfigResponse['storage'];

export function ByocSettings({ orgId }: { orgId: string }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const billing = useQuery(getOrgBillingOptions({ path: { orgId } }));
  const isPro = billing.data?.plan === 'pro';
  const byoc = useQuery({
    ...getOrgByocOptions({ path: { orgId } }),
    enabled: isAdmin && isPro,
  });

  const header = (
    <Text color="muted" className="text-sm">
      Store your test runs and artifacts in your own database and cloud storage. Your data stays in
      your infrastructure; we keep only accounts, orgs, and billing.
    </Text>
  );

  if (!isAdmin) {
    return (
      <Page header={header}>
        <SettingsPanel title="Bring your own cloud">
          <Flex className="px-5 py-5">
            <Text color="muted" className="text-sm">
              Only organization admins can manage bring-your-own-cloud settings.
            </Text>
          </Flex>
        </SettingsPanel>
      </Page>
    );
  }

  if (billing.isLoading)
    return (
      <Page header={header}>
        <LoadingState />
      </Page>
    );
  if (!isPro) {
    return (
      <Page header={header}>
        <UpgradePanel orgId={orgId} />
      </Page>
    );
  }

  if (byoc.isLoading)
    return (
      <Page header={header}>
        <LoadingState />
      </Page>
    );
  if (byoc.error || !byoc.data) {
    return (
      <Page header={header}>
        <ErrorState error={byoc.error} onRetry={() => byoc.refetch()} />
      </Page>
    );
  }

  const config = byoc.data;
  // BYOC is a bundle: both the database and storage are on, or neither.
  const active = config.db.enabled && config.storage.enabled;

  // An org with existing data can't move to BYOC (we don't migrate existing data yet).
  // Show a "create a new org" message instead of a form that would fail on save.
  if (!config.eligible) {
    return (
      <Page header={header}>
        <NotEligiblePanel />
      </Page>
    );
  }

  return (
    <Page header={header}>
      <StatusOverview config={config} />
      {active ? <ConnectedSummary config={config} /> : <ByocForm orgId={orgId} config={config} />}
      {active && <DangerPanel orgId={orgId} />}
    </Page>
  );
}

/**
 * Once BYOC is active we don't re-show the editable form (and never the secrets). Just confirm
 * the connection and the non-secret coordinates: the redacted DSN and the storage bucket. To
 * change any of it, an admin disconnects and reconnects.
 */
function ConnectedSummary({ config }: { config: ByocConfigResponse }) {
  const providerLabel = config.storage.provider
    ? PROVIDER_LABEL[config.storage.provider]
    : 'Your bucket';
  return (
    <SettingsPanel title="Connected to bring your own cloud">
      <div className="px-5 pt-4">
        <Notice tone="success" icon={CheckmarkCircle02Icon}>
          New runs and artifacts go to your own database and storage.
        </Notice>
      </div>
      <SummaryRow
        label="Database"
        hint="Your Postgres host and database. Credentials hidden."
        value={config.db.dsnSummary ?? 'Your Postgres database'}
        mono
      />
      <SummaryRow label="Storage provider" value={providerLabel} />
      <SummaryRow
        label={config.storage.provider === 'azure' ? 'Container' : 'Bucket'}
        value={config.storage.bucket ?? 'Your bucket'}
        mono
      />
      {config.storage.prefix && (
        <SummaryRow label="Key prefix" value={config.storage.prefix} mono />
      )}
    </SettingsPanel>
  );
}

/** A read-only label/value row for the connected summary (mirrors SettingsRow's layout). */
function SummaryRow({
  label,
  hint,
  value,
  mono,
}: {
  label: string;
  hint?: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <SettingsRow label={label} hint={hint}>
      <Text
        as="span"
        className={cn(
          'w-full text-sm break-all text-muted-foreground md:text-right',
          mono && 'font-mono',
        )}
      >
        {value}
      </Text>
    </SettingsRow>
  );
}

/** Shown when the org already has projects: BYOC must start on a fresh org. */
function NotEligiblePanel() {
  return (
    <Card className="flex flex-col items-center gap-5 px-6 py-9 text-center">
      <Flex
        inline
        align="center"
        justify="center"
        className="size-12 rounded-2xl bg-muted text-muted-foreground"
      >
        <HugeiconsIcon icon={CloudIcon} size={26} />
      </Flex>
      <Flex direction="col" gap={2} align="center" className="max-w-md">
        <Text as="h3" className="text-lg font-semibold tracking-tight">
          This organization already has data
        </Text>
        <Text className="text-sm text-pretty text-muted-foreground">
          We don&rsquo;t support moving an existing organization to bring your own cloud yet. Set it
          up on a new organization that has no projects, then point your reporters at it.
        </Text>
      </Flex>
      <Button asChild variant="outline">
        <Link to={ORGS_ROUTE}>Create a new organization</Link>
      </Button>
    </Card>
  );
}

function Page({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <Flex direction="col" gap={6}>
      {header}
      {children}
    </Flex>
  );
}

// --- Plan gate --------------------------------------------------------------

const BYOC_FEATURES: { icon: typeof CloudIcon; title: string; body: string }[] = [
  {
    icon: DatabaseIcon,
    title: 'Your own Postgres',
    body: 'Point us at a Postgres connection string; run and project data lives in your database.',
  },
  {
    icon: CloudServerIcon,
    title: 'Your own storage',
    body: 'Traces, screenshots, and videos go to your S3, Google Cloud Storage, or Azure bucket.',
  },
  {
    icon: LockKeyIcon,
    title: 'Flat pricing',
    body: 'A simple flat monthly price, no per-test metering, since the storage cost is yours.',
  },
];

function UpgradePanel({ orgId }: { orgId: string }) {
  const checkout = useMutation({
    ...createBillingCheckoutMutation(),
    onSuccess: (data) => openExternal(data.url), // leave the SPA for Polar's hosted checkout
    onError: (err) =>
      notify.error("Couldn't start checkout", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  return (
    <Card className="flex flex-col items-center gap-6 px-6 py-9">
      <Flex direction="col" gap={2.5} align="center" className="max-w-md text-center">
        <Flex
          inline
          align="center"
          justify="center"
          className="size-12 rounded-2xl bg-primary/15 text-primary"
        >
          <HugeiconsIcon icon={CloudIcon} size={26} />
        </Flex>
        <Text as="h3" className="text-lg font-semibold tracking-tight">
          Bring your own cloud
        </Text>
        <Badge variant="secondary">Pro feature</Badge>
        <Text className="text-sm text-pretty text-muted-foreground">
          Keep your test runs and artifacts entirely in your own infrastructure. Bring your own
          cloud is available on Pro, and enabling it waives your metered usage (you pay the flat Pro
          base). Upgrade to Pro to enable it.
        </Text>
      </Flex>

      <Grid cols={[1, 1, 3]} gap={4} className="w-full">
        {BYOC_FEATURES.map((f) => (
          <Flex
            key={f.title}
            direction="col"
            gap={2.5}
            className="rounded-xl border border-border p-4"
          >
            <Flex
              inline
              align="center"
              justify="center"
              className="size-9 rounded-lg bg-primary/10 text-primary"
            >
              <HugeiconsIcon icon={f.icon} size={18} />
            </Flex>
            <Text as="span" className="text-sm font-semibold">
              {f.title}
            </Text>
            <Text as="span" className="text-xs leading-relaxed text-muted-foreground">
              {f.body}
            </Text>
          </Flex>
        ))}
      </Grid>

      <Button
        size="lg"
        loading={checkout.isPending}
        onClick={() => checkout.mutate({ path: { orgId } })}
      >
        Upgrade to Pro
      </Button>
    </Card>
  );
}

// --- Status overview --------------------------------------------------------

function statusChip(sub: Subsystem): {
  icon: typeof CloudIcon;
  label: string;
  tone: 'success' | 'danger' | 'warning' | 'muted';
  variant: 'secondary' | 'outline';
} {
  if (!sub.enabled)
    return { icon: CancelCircleIcon, label: 'Managed', tone: 'muted', variant: 'outline' };
  if (sub.status === 'active')
    return { icon: CheckmarkCircle02Icon, label: 'Active', tone: 'success', variant: 'secondary' };
  if (sub.status === 'error')
    return { icon: AlertCircleIcon, label: 'Error', tone: 'danger', variant: 'secondary' };
  return { icon: AlertCircleIcon, label: 'Pending', tone: 'warning', variant: 'secondary' };
}

function StatusOverview({ config }: { config: ByocConfigResponse }) {
  const dbChip = statusChip(config.db);
  const storageChip = statusChip(config.storage);
  return (
    <Grid cols={[1, 2]} gap={4}>
      <OverviewCard icon={DatabaseIcon} title="Database" chip={dbChip}>
        {config.db.enabled
          ? 'Runs and projects are stored in your Postgres.'
          : 'Using the managed database.'}
      </OverviewCard>
      <OverviewCard icon={CloudServerIcon} title="Storage" chip={storageChip}>
        {config.storage.enabled
          ? 'Artifacts are stored in your own bucket.'
          : 'Using managed storage.'}
      </OverviewCard>
    </Grid>
  );
}

function OverviewCard({
  icon,
  title,
  chip,
  children,
}: {
  icon: typeof CloudIcon;
  title: string;
  chip: ReturnType<typeof statusChip>;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Flex align="center" justify="between" gap={3}>
        <Flex align="center" gap={2.5}>
          <Flex
            inline
            align="center"
            justify="center"
            className="size-9 rounded-xl bg-muted text-foreground"
          >
            <HugeiconsIcon icon={icon} size={18} />
          </Flex>
          <Text as="span" className="text-sm font-semibold">
            {title}
          </Text>
        </Flex>
        <StatusBadge icon={chip.icon} label={chip.label} tone={chip.tone} variant={chip.variant} />
      </Flex>
      <Text as="span" className="text-xs text-muted-foreground">
        {children}
      </Text>
    </Card>
  );
}

// --- Shared notice ----------------------------------------------------------

const NOTICE_TONE = {
  warning: { box: 'border-warning/40 bg-warning/5', icon: 'text-warning' },
  success: { box: 'border-success/40 bg-success/5', icon: 'text-success' },
  danger: { box: 'border-destructive/40 bg-destructive/5', icon: 'text-destructive' },
};

function Notice({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof NOTICE_TONE;
  icon: typeof AlertCircleIcon;
  children: ReactNode;
}) {
  const t = NOTICE_TONE[tone];
  return (
    <Flex align="start" gap={2.5} className={cn('rounded-xl border px-4 py-3', t.box)}>
      <HugeiconsIcon icon={icon} size={17} className={cn('mt-0.5 shrink-0', t.icon)} />
      <Text as="span" className="text-sm text-pretty">
        {children}
      </Text>
    </Flex>
  );
}

/** Inline result of a "Test connection" click for one subsystem (Database / Storage). */
function TestResult({ label, result }: { label: string; result: { ok: boolean; error?: string } }) {
  if (result.ok)
    return (
      <Notice tone="success" icon={CheckmarkCircle02Icon}>
        {label} connection succeeded.
      </Notice>
    );
  return (
    <Notice tone="danger" icon={AlertCircleIcon}>
      {label} connection failed{result.error ? <>: {result.error}</> : '.'}
    </Notice>
  );
}

function saveError(err: unknown): string {
  return isApiError(err) ? err.error.message : 'Something went wrong. Please try again.';
}

// --- Config form (the DB + storage bundle) ----------------------------------

type SubResult = { ok: boolean; error?: string };

function ByocForm({ orgId, config }: { orgId: string; config: ByocConfigResponse }) {
  const queryClient = useQueryClient();
  const active = config.db.enabled && config.storage.enabled;
  const [dsn, setDsn] = useState('');
  const [draft, setDraft] = useState<StorageDraft>(() => ({
    provider: config.storage.provider ?? 's3',
    bucket: config.storage.bucket ?? '',
    region: config.storage.region ?? '',
    endpoint: config.storage.endpoint ?? '',
    prefix: config.storage.prefix ?? '',
    creds: {},
  }));
  const [dbResult, setDbResult] = useState<SubResult | null>(null);
  const [storageResult, setStorageResult] = useState<SubResult | null>(null);
  // Editing the DSN / any storage field invalidates that section's last test result, so a
  // stale "connection succeeded" is never shown (and never saved) against changed input.
  const editDsn = (v: string) => {
    setDsn(v);
    setDbResult(null);
  };
  const set = (patch: Partial<StorageDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStorageResult(null);
  };
  const setCred = (patch: Partial<ByocStorageCredentials>) => {
    setDraft((d) => ({ ...d, creds: { ...d.creds, ...patch } }));
    setStorageResult(null);
  };

  const update = useMutation({
    ...updateOrgByocMutation(),
    onSuccess: (data) => queryClient.setQueryData(getOrgByocQueryKey({ path: { orgId } }), data),
  });
  // Independent test mutations so each panel's "Test connection" has its own loading state.
  const dbTest = useMutation({ ...testOrgByocMutation() });
  const storageTest = useMutation({ ...testOrgByocMutation() });

  const storagePayload = () => ({
    provider: draft.provider,
    bucket: draft.bucket.trim(),
    region: draft.region.trim() || undefined,
    endpoint: draft.endpoint.trim() || undefined,
    prefix: draft.prefix.trim() || undefined,
    credentials: draft.creds,
  });

  const dsnValid = dsn.trim().length > 0;
  const storageValid = draft.bucket.trim().length > 0 && hasRequiredCreds(draft);

  // Test each half on its own (the API probes whichever section is provided).
  const runDbTest = () => {
    setDbResult(null);
    dbTest.mutate(
      { path: { orgId }, body: { enabled: true, dsn: dsn.trim() } },
      {
        onSuccess: (data) => setDbResult(data.db ?? { ok: false, error: 'No result' }),
        onError: (err) => setDbResult({ ok: false, error: saveError(err) }),
      },
    );
  };
  const runStorageTest = () => {
    setStorageResult(null);
    storageTest.mutate(
      { path: { orgId }, body: { enabled: true, storage: storagePayload() } },
      {
        onSuccess: (data) => setStorageResult(data.storage ?? { ok: false, error: 'No result' }),
        onError: (err) => setStorageResult({ ok: false, error: saveError(err) }),
      },
    );
  };

  // One Connect submits the whole bundle (both are required, provisioned together).
  const connect = () => {
    update.mutate(
      { path: { orgId }, body: { enabled: true, dsn: dsn.trim(), storage: storagePayload() } },
      {
        onSuccess: () => {
          setDsn('');
          setDraft((d) => ({ ...d, creds: {} }));
          setDbResult(null);
          setStorageResult(null);
          notify.success('Bring your own cloud connected', {
            description: 'New runs and artifacts now go to your database and bucket.',
          });
        },
        onError: (err) => notify.error("Couldn't connect", { description: saveError(err) }),
      },
    );
  };

  const canConnect = dsnValid && storageValid && !update.isPending;

  const dbTestAction = (
    <Button
      variant="ghost"
      onClick={runDbTest}
      loading={dbTest.isPending}
      disabled={!dsnValid || dbTest.isPending}
    >
      Test connection
    </Button>
  );
  const storageTestAction = (
    <Button
      variant="ghost"
      onClick={runStorageTest}
      loading={storageTest.isPending}
      disabled={!storageValid || storageTest.isPending}
    >
      Test connection
    </Button>
  );

  return (
    <>
      <SettingsPanel title="Database" action={dbTestAction}>
        {active && config.db.status === 'active' && (
          <div className="px-5 pt-4">
            <Notice tone="success" icon={CheckmarkCircle02Icon}>
              Runs and projects are stored in your Postgres
              {config.db.schemaVersion ? <> (schema {config.db.schemaVersion})</> : null}.
            </Notice>
          </div>
        )}
        <SettingsRow
          label="Connection string"
          hint="A Postgres DSN with privileges to create tables. Stored encrypted; never shown. We run the schema migration on connect."
        >
          <Input
            type="password"
            autoComplete="off"
            placeholder={
              config.db.dsnSet
                ? '•••••••• (stored; enter to replace)'
                : 'postgresql://user:pass@host:5432/db'
            }
            value={dsn}
            onChange={(e) => editDsn(e.target.value)}
            className="w-full max-w-xl font-mono"
            data-testid="byoc-db-dsn"
          />
        </SettingsRow>
        {dbResult && (
          <div className="px-5 pb-4">
            <TestResult label="Database" result={dbResult} />
          </div>
        )}
      </SettingsPanel>

      <SettingsPanel title="Storage" action={storageTestAction}>
        {active && config.storage.status === 'active' && (
          <div className="px-5 pt-4">
            <Notice tone="success" icon={CheckmarkCircle02Icon}>
              Artifacts are stored in{' '}
              {config.storage.provider ? PROVIDER_LABEL[config.storage.provider] : 'your bucket'}
              {config.storage.bucket ? <> ({config.storage.bucket})</> : null}.
            </Notice>
          </div>
        )}
        <SettingsRow label="Provider" hint="Where to upload traces, screenshots, and videos.">
          <FilterCombobox
            id="byoc-storage-provider"
            ariaLabel="Storage provider"
            value={draft.provider}
            onChange={(v) => v && set({ provider: v as Provider, creds: {} })}
            options={PROVIDER_OPTIONS}
            placeholder="Select a provider"
            searchable={false}
            clearable={false}
            width="w-full max-w-md"
          />
        </SettingsRow>

        <SettingsRow
          label={draft.provider === 'azure' ? 'Container' : 'Bucket'}
          hint={
            <>
              The destination bucket or container name.{' '}
              <HelpLink href={STORAGE_DOCS.bucket[draft.provider]} />
            </>
          }
        >
          <Input
            value={draft.bucket}
            onChange={(e) => set({ bucket: e.target.value })}
            className="w-full max-w-md"
            data-testid="byoc-storage-bucket"
          />
        </SettingsRow>

        <StorageProviderFields draft={draft} storage={config.storage} set={set} setCred={setCred} />

        <SettingsRow
          label="Key prefix"
          hint="Optional. Namespaces objects under a folder in the bucket."
        >
          <Input
            value={draft.prefix}
            onChange={(e) => set({ prefix: e.target.value })}
            placeholder="nijam/"
            className="w-full max-w-md"
          />
        </SettingsRow>
        {storageResult && (
          <div className="px-5 pb-4">
            <TestResult label="Storage" result={storageResult} />
          </div>
        )}
      </SettingsPanel>

      {/* Both halves are required and provisioned together, so there is a single Connect. */}
      <Flex justify="end" gap={2}>
        <Button onClick={connect} loading={update.isPending} disabled={!canConnect}>
          {active ? 'Update' : 'Connect'}
        </Button>
      </Flex>
    </>
  );
}

// --- Storage config helpers -------------------------------------------------

const PROVIDER_LABEL: Record<Provider, string> = {
  s3: 'AWS S3 / S3-compatible',
  gcs: 'Google Cloud Storage',
  azure: 'Azure Blob Storage',
};

// Official provider docs for every value we ask for, so admins know where to fetch it.
const STORAGE_DOCS = {
  bucket: {
    s3: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html',
    gcs: 'https://cloud.google.com/storage/docs/creating-buckets',
    azure: 'https://learn.microsoft.com/azure/storage/blobs/blob-containers-portal',
  } satisfies Record<Provider, string>,
  s3Region:
    'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html#access-bucket-region',
  s3Endpoint: 'https://developers.cloudflare.com/r2/api/s3/api/',
  s3Keys: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  gcsServiceAccount: 'https://cloud.google.com/iam/docs/keys-create-delete',
  gcsProject: 'https://support.google.com/googleapi/answer/7014113',
  azureKeys: 'https://learn.microsoft.com/azure/storage/common/storage-account-keys-manage',
};

/** A small "where to find this" link beside a Storage field's hint; opens the provider's docs. */
function HelpLink({
  href,
  children = 'Where to find this',
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

const PROVIDER_OPTIONS: ComboboxOption[] = (['s3', 'gcs', 'azure'] as const).map((value) => ({
  value,
  label: PROVIDER_LABEL[value],
}));

interface StorageDraft {
  provider: Provider;
  bucket: string;
  region: string;
  endpoint: string;
  prefix: string;
  creds: ByocStorageCredentials;
}

/** Whether the draft has the required credentials for its provider. */
function hasRequiredCreds(d: StorageDraft): boolean {
  const c = d.creds;
  if (d.provider === 's3') return Boolean(c.accessKeyId && c.secretAccessKey);
  if (d.provider === 'gcs') return Boolean(c.clientEmail && c.privateKey);
  return Boolean(c.accountName && c.accountKey);
}

function StorageProviderFields({
  draft,
  storage,
  set,
  setCred,
}: {
  draft: StorageDraft;
  storage: ByocConfigResponse['storage'];
  set: (patch: Partial<StorageDraft>) => void;
  setCred: (patch: Partial<ByocStorageCredentials>) => void;
}) {
  const secretPlaceholder = storage.credentialsSet ? '•••••••• (stored; enter to replace)' : '';
  if (draft.provider === 's3') {
    return (
      <>
        <SettingsRow
          label="Region"
          hint={
            <>
              e.g. us-east-1. Use &lsquo;auto&rsquo; for R2.{' '}
              <HelpLink href={STORAGE_DOCS.s3Region}>Find your region</HelpLink>
            </>
          }
        >
          <Input
            value={draft.region}
            onChange={(e) => set({ region: e.target.value })}
            placeholder="us-east-1"
            className="w-full max-w-md"
          />
        </SettingsRow>
        <SettingsRow
          label="Endpoint"
          hint={
            <>
              Optional. For S3-compatible stores (Cloudflare R2, MinIO). Leave blank for AWS S3.{' '}
              <HelpLink href={STORAGE_DOCS.s3Endpoint}>Where to find this</HelpLink>
            </>
          }
        >
          <Input
            value={draft.endpoint}
            onChange={(e) => set({ endpoint: e.target.value })}
            placeholder="https://<account>.r2.cloudflarestorage.com"
            className="w-full max-w-md"
          />
        </SettingsRow>
        <SettingsRow
          label="Access key ID"
          hint={
            <>
              An IAM access key scoped to the bucket.{' '}
              <HelpLink href={STORAGE_DOCS.s3Keys}>How to create one</HelpLink>
            </>
          }
        >
          <Input
            value={draft.creds.accessKeyId ?? ''}
            onChange={(e) => setCred({ accessKeyId: e.target.value })}
            className="w-full max-w-md font-mono"
            data-testid="byoc-s3-key"
          />
        </SettingsRow>
        <SettingsRow
          label="Secret access key"
          hint={
            <>
              Stored encrypted at rest; never shown.{' '}
              <HelpLink href={STORAGE_DOCS.s3Keys}>How to create one</HelpLink>
            </>
          }
        >
          <Input
            type="password"
            autoComplete="off"
            placeholder={secretPlaceholder}
            value={draft.creds.secretAccessKey ?? ''}
            onChange={(e) => setCred({ secretAccessKey: e.target.value })}
            className="w-full max-w-md font-mono"
            data-testid="byoc-s3-secret"
          />
        </SettingsRow>
      </>
    );
  }
  if (draft.provider === 'gcs') {
    return (
      <>
        <SettingsRow
          label="Service account email"
          hint={
            <>
              The client_email from the service-account JSON key.{' '}
              <HelpLink href={STORAGE_DOCS.gcsServiceAccount}>How to create a key</HelpLink>
            </>
          }
        >
          <Input
            value={draft.creds.clientEmail ?? ''}
            onChange={(e) => setCred({ clientEmail: e.target.value })}
            placeholder="svc@project.iam.gserviceaccount.com"
            className="w-full max-w-md font-mono"
          />
        </SettingsRow>
        <SettingsRow
          label="Private key"
          hint={
            <>
              The private_key from the service-account JSON. Stored encrypted; never shown.{' '}
              <HelpLink href={STORAGE_DOCS.gcsServiceAccount}>How to create a key</HelpLink>
            </>
          }
        >
          <Textarea
            placeholder={secretPlaceholder || '-----BEGIN PRIVATE KEY-----'}
            value={draft.creds.privateKey ?? ''}
            onChange={(e) => setCred({ privateKey: e.target.value })}
            className="w-full max-w-md font-mono"
            rows={4}
            data-testid="byoc-gcs-key"
          />
        </SettingsRow>
        <SettingsRow
          label="Project ID"
          hint={
            <>
              Optional. The GCP project id, if not inferable from the key.{' '}
              <HelpLink href={STORAGE_DOCS.gcsProject}>Find your project ID</HelpLink>
            </>
          }
        >
          <Input
            value={draft.creds.projectId ?? ''}
            onChange={(e) => setCred({ projectId: e.target.value })}
            className="w-full max-w-md"
          />
        </SettingsRow>
      </>
    );
  }
  return (
    <>
      <SettingsRow
        label="Account name"
        hint={
          <>
            The Azure storage account name.{' '}
            <HelpLink href={STORAGE_DOCS.azureKeys}>Where to find this</HelpLink>
          </>
        }
      >
        <Input
          value={draft.creds.accountName ?? ''}
          onChange={(e) => setCred({ accountName: e.target.value })}
          className="w-full max-w-md font-mono"
        />
      </SettingsRow>
      <SettingsRow
        label="Account key"
        hint={
          <>
            A storage account access key. Stored encrypted; never shown.{' '}
            <HelpLink href={STORAGE_DOCS.azureKeys}>How to view your keys</HelpLink>
          </>
        }
      >
        <Input
          type="password"
          autoComplete="off"
          placeholder={secretPlaceholder}
          value={draft.creds.accountKey ?? ''}
          onChange={(e) => setCred({ accountKey: e.target.value })}
          className="w-full max-w-md font-mono"
          data-testid="byoc-azure-key"
        />
      </SettingsRow>
    </>
  );
}

// --- Danger panel -----------------------------------------------------------

function DangerPanel({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const del = useMutation({
    ...deleteOrgByocMutation(),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: getOrgByocQueryKey({ path: { orgId } }) });
      notify.success('Bring your own cloud disabled', {
        description:
          'The org reverted to the managed database and storage. Your cloud data is untouched.',
      });
    },
    onError: (err) => {
      setOpen(false);
      notify.error("Couldn't disable", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  return (
    <>
      <SettingsPanel title="Disable bring your own cloud" danger>
        <SettingsRow
          label="Revert to managed"
          hint="Turns off both your database and storage and removes their configuration. New data uses the managed cloud; your existing data stays in your own cloud, untouched."
        >
          <Flex>
            <Button variant="outline" className="text-destructive" onClick={() => setOpen(true)}>
              Disable BYOC
            </Button>
          </Flex>
        </SettingsRow>
      </SettingsPanel>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable bring your own cloud?</AlertDialogTitle>
            <AlertDialogDescription>
              New runs and artifacts will go to the managed database and storage. Data already in
              your own cloud is left there and won&rsquo;t appear in Nijam until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              loading={del.isPending}
              onClick={(e) => {
                e.preventDefault();
                del.mutate({ path: { orgId } });
              }}
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
