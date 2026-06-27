import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  CancelCircleIcon,
  ToggleOnIcon,
  ToggleOffIcon,
  SquareLock02Icon,
  SquareUnlock02Icon,
  ZapIcon,
  UserAdd01Icon,
  ShieldKeyIcon,
  LockKeyIcon,
  CloudSavingDone02Icon,
} from '@hugeicons/core-free-icons';
import type { SsoConnection, SsoDomainItem } from '@/client';

// The generated `SsoConnection` includes `| null` (the response field is nullable);
// `Conn` is the present-connection shape for panels that only render when it exists.
type Conn = NonNullable<SsoConnection>;
import {
  getOrgSsoOptions,
  getOrgSsoQueryKey,
  getOrgBillingOptions,
  upsertOrgSsoMutation,
  deleteOrgSsoMutation,
  addOrgSsoDomainMutation,
  verifyOrgSsoDomainMutation,
  removeOrgSsoDomainMutation,
} from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CopyField } from '@/components/ui/copy-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const REDIRECT_URI = `${API_BASE}/v1/auth/sso/callback`;

export function SsoSettings({ orgId }: { orgId: string }) {
  const isAdmin = useIsOrgAdmin(orgId);
  const billing = useQuery(getOrgBillingOptions({ path: { orgId } }));
  const sso = useQuery({
    ...getOrgSsoOptions({ path: { orgId } }),
    enabled: isAdmin && billing.data?.plan === 'pro',
  });
  // When there's no connection yet, show the empty state first; the config form
  // only appears once the admin opts in via "Configure SSO".
  const [configuring, setConfiguring] = useState(false);

  // Rendered inside the Org-settings tab layout (which owns the page heading), so this
  // is just a one-line description rather than its own h1.
  const header = (
    <Text color="muted" className="text-sm">
      Let your team sign in with your company identity provider via OIDC.
    </Text>
  );

  if (!isAdmin) {
    return (
      <Page header={header}>
        <SettingsPanel title="Single sign-on">
          <Flex className="px-5 py-5">
            <Text color="muted" className="text-sm">
              Only organization admins can manage single sign-on.
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
  if (billing.data && billing.data.plan !== 'pro') {
    return (
      <Page header={header}>
        <UpgradePanel orgId={orgId} />
      </Page>
    );
  }

  if (sso.isLoading)
    return (
      <Page header={header}>
        <LoadingState />
      </Page>
    );
  if (sso.error || !sso.data) {
    return (
      <Page header={header}>
        <ErrorState error={sso.error} onRetry={() => sso.refetch()} />
      </Page>
    );
  }

  const connection = sso.data.connection;
  // The launch link only works once SSO is actually live (active + a verified domain),
  // so only surface it then, sitting right under the "active" banner.
  const live =
    !!connection && connection.status === 'active' && connection.domains.some((d) => d.verified);

  // No connection and not yet configuring → an empty state that sells the feature
  // and offers the CTA, instead of dropping the admin straight into a blank form.
  if (!connection && !configuring) {
    return (
      <Page header={header}>
        <SsoEmptyState onConfigure={() => setConfiguring(true)} />
      </Page>
    );
  }

  return (
    <Page header={header}>
      {connection && <ConnectionStatus connection={connection} />}
      {connection && live && <LaunchLinkCard connection={connection} />}
      <ConnectionPanel
        orgId={orgId}
        connection={connection}
        onClose={() => setConfiguring(false)}
      />
      {connection && <DomainsPanel orgId={orgId} connection={connection} />}
      {connection && <DangerPanel orgId={orgId} />}
    </Page>
  );
}

const SSO_FEATURES: { icon: typeof CloudSavingDone02Icon; title: string; body: string }[] = [
  {
    icon: CloudSavingDone02Icon,
    title: 'Any OIDC provider',
    body: 'Connect Okta, Entra ID, Auth0, or any standard OpenID Connect identity provider.',
  },
  {
    icon: UserAdd01Icon,
    title: 'Just-in-time provisioning',
    body: 'Teammates get a Nijam account and join your org automatically on their first SSO sign-in.',
  },
  {
    icon: LockKeyIcon,
    title: 'Enforce it',
    body: 'Optionally require everyone on your verified email domains to sign in through your IdP.',
  },
];

/** Shown when SSO has never been configured: what it does, plus the CTA to start. */
function SsoEmptyState({ onConfigure }: { onConfigure: () => void }) {
  return (
    <Flex
      direction="col"
      gap={6}
      align="center"
      className="rounded-2xl border border-border bg-card px-6 py-9"
    >
      <Flex direction="col" gap={2.5} align="center" className="max-w-md text-center">
        <Flex
          inline
          align="center"
          justify="center"
          className="size-12 rounded-2xl bg-primary/15 text-primary"
        >
          <HugeiconsIcon icon={ShieldKeyIcon} size={26} />
        </Flex>
        <Text as="h3" className="text-lg font-semibold tracking-tight">
          Single sign-on isn&rsquo;t set up yet
        </Text>
        <Text className="text-sm text-pretty text-muted-foreground">
          Let your team sign in through your company identity provider over OIDC, with automatic
          provisioning and optional enforcement.
        </Text>
      </Flex>

      <Grid cols={[1, 1, 3]} gap={4} className="w-full">
        {SSO_FEATURES.map((f) => (
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

      <Button size="lg" onClick={onConfigure}>
        Configure SSO
      </Button>
    </Flex>
  );
}

/**
 * Launch link, an IdP app-tile / dashboard target, not a form field. Rendered as its
 * own card under the status banner (only when SSO is live) so it reads as "here's the URL
 * to hand to your IdP", distinct from the editable connection settings.
 */
function LaunchLinkCard({ connection }: { connection: Conn }) {
  return (
    <Flex direction="col" gap={3} className="rounded-2xl border border-border bg-card p-5">
      <Flex align="start" gap={3}>
        <Flex
          inline
          align="center"
          justify="center"
          className="size-9 shrink-0 rounded-xl bg-primary/15 text-primary"
        >
          <HugeiconsIcon icon={ZapIcon} size={18} />
        </Flex>
        <Flex direction="col" gap={0.5}>
          <Text as="span" className="text-sm font-semibold">
            Launch link
          </Text>
          <Text as="span" className="text-xs text-muted-foreground">
            Add this to your identity provider&rsquo;s app tile or dashboard, Okta initiate-login
            URI, Entra home-page URL, a Google launcher link, or a bookmark, so people can launch
            Nijam straight from there.
          </Text>
        </Flex>
      </Flex>
      <CopyField value={`${API_BASE}/v1/auth/sso/launch/${connection.id}`} />
    </Flex>
  );
}

const NOTICE_TONE = {
  warning: { box: 'border-warning/40 bg-warning/5', icon: 'text-warning' },
  success: { box: 'border-success/40 bg-success/5', icon: 'text-success' },
};

function Notice({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof NOTICE_TONE;
  icon: typeof AlertCircleIcon;
  children: React.ReactNode;
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

/**
 * Readiness banner, makes it obvious that a fully-filled-in connection still does
 * nothing until a domain is verified (and the connection is enabled).
 */
function ConnectionStatus({ connection }: { connection: Conn }) {
  const hasVerifiedDomain = connection.domains.some((d) => d.verified);

  if (connection.status !== 'active') {
    return (
      <Notice tone="warning" icon={AlertCircleIcon}>
        Single sign-on is turned off. Click <b>Edit</b> and turn <b>Enabled</b> on to start using
        it.
      </Notice>
    );
  }
  if (!hasVerifiedDomain) {
    return (
      <Notice tone="warning" icon={AlertCircleIcon}>
        Single sign-on isn&rsquo;t live yet, add and <b>verify an email domain</b> below. Until a
        domain is verified, no one can sign in with SSO.
      </Notice>
    );
  }
  return (
    <Notice tone="success" icon={CheckmarkCircle02Icon}>
      Single sign-on is active. People with a verified-domain email are sent to your identity
      provider to sign in
      {connection.enforced && <>, and it&rsquo;s required for those domains</>}.
    </Notice>
  );
}

function Page({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <Flex direction="col" gap={6}>
      {header}
      {children}
    </Flex>
  );
}

function UpgradePanel({ orgId }: { orgId: string }) {
  return (
    <SettingsPanel title="Single sign-on">
      <Flex direction="col" gap={3} className="px-5 py-6">
        <Badge variant="secondary" className="w-fit">
          Pro feature
        </Badge>
        <Text className="text-sm text-muted-foreground">
          Single sign-on lets your team log in through your own Okta, Entra ID, Auth0, or any OIDC
          provider, with automatic provisioning. Upgrade to Pro to enable it.
        </Text>
        <Flex>
          <Button asChild>
            <Link to="/orgs/$orgId/billing" params={{ orgId }}>
              Upgrade to Pro
            </Link>
          </Button>
        </Flex>
      </Flex>
    </SettingsPanel>
  );
}

interface ConnDraft {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  jitProvisioning: boolean;
  enforced: boolean;
  defaultRole: 'admin' | 'member';
  status: 'active' | 'disabled';
}

function ConnectionPanel({
  orgId,
  connection,
  onClose,
}: {
  orgId: string;
  connection: SsoConnection | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const queryKey = getOrgSsoQueryKey({ path: { orgId } });

  const [draft, setDraft] = useState<ConnDraft>(() => ({
    issuerUrl: connection?.issuerUrl ?? '',
    clientId: connection?.clientId ?? '',
    clientSecret: '',
    jitProvisioning: connection?.jitProvisioning ?? true,
    enforced: connection?.enforced ?? false,
    defaultRole: connection?.defaultRole ?? 'member',
    status: connection?.status ?? 'active',
  }));

  const seed = (): ConnDraft => ({
    issuerUrl: connection?.issuerUrl ?? '',
    clientId: connection?.clientId ?? '',
    clientSecret: '',
    jitProvisioning: connection?.jitProvisioning ?? true,
    enforced: connection?.enforced ?? false,
    defaultRole: connection?.defaultRole ?? 'member',
    status: connection?.status ?? 'active',
  });

  // No connection yet → start in the form; an existing connection shows read-only
  // first and only reveals the fields once the user clicks Edit.
  const [editing, setEditing] = useState(!connection);
  const set = (patch: Partial<ConnDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const save = useMutation({
    ...upsertOrgSsoMutation(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      setDraft((d) => ({ ...d, clientSecret: '' }));
      setEditing(false);
      notify.success('Single sign-on saved', {
        description: connection
          ? 'Your identity provider settings were updated.'
          : 'Add and verify a domain below to start routing logins.',
      });
    },
    onError: (err) =>
      notify.error("Couldn't save single sign-on", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      }),
  });

  // Need a secret on first create; on update it's optional (blank = keep the stored one).
  const canSave =
    draft.issuerUrl.trim().length > 0 &&
    draft.clientId.trim().length > 0 &&
    (connection !== null || draft.clientSecret.trim().length > 0);

  const handleSave = () =>
    save.mutate({
      path: { orgId },
      body: {
        issuerUrl: draft.issuerUrl.trim(),
        clientId: draft.clientId.trim(),
        ...(draft.clientSecret.trim() ? { clientSecret: draft.clientSecret.trim() } : {}),
        jitProvisioning: draft.jitProvisioning,
        enforced: draft.enforced,
        defaultRole: draft.defaultRole,
        status: draft.status,
      },
    });

  const cancelEdit = () => {
    setDraft(seed());
    setEditing(false);
  };

  // Cancel reverts an existing connection's edits; on first setup it backs all the
  // way out to the empty state.
  const action = editing ? (
    <Flex gap={2}>
      <Button variant="ghost" onClick={connection ? cancelEdit : onClose} disabled={save.isPending}>
        Cancel
      </Button>
      <Button onClick={handleSave} loading={save.isPending} disabled={!canSave || save.isPending}>
        {connection ? 'Save changes' : 'Connect provider'}
      </Button>
    </Flex>
  ) : (
    <Button variant="outline" onClick={() => setEditing(true)}>
      Edit
    </Button>
  );

  return (
    <SettingsPanel title="Identity provider" action={action}>
      {/* Reference info, always shown, copyable, in both view and edit modes. */}
      <SettingsRow
        label="Redirect URI"
        hint="Add this as the sign-in redirect URI in your provider's OIDC app."
      >
        <CopyField value={REDIRECT_URI} className="max-w-md" />
      </SettingsRow>

      {editing ? (
        <ConnectionEdit draft={draft} set={set} connection={connection} />
      ) : (
        <ConnectionView connection={connection!} />
      )}
    </SettingsPanel>
  );
}

/** Read-only summary of the saved connection (shown until the user clicks Edit). */
function ConnectionView({ connection }: { connection: Conn }) {
  return (
    <>
      <SettingsRow label="Issuer URL" hint="Your provider's OIDC issuer URL.">
        <Text as="span" className="font-mono text-sm break-all text-muted-foreground">
          {connection.issuerUrl}
        </Text>
      </SettingsRow>
      <SettingsRow label="Client ID" hint="From your provider's OIDC application.">
        <Text as="span" className="font-mono text-sm break-all text-muted-foreground">
          {connection.clientId}
        </Text>
      </SettingsRow>
      <SettingsRow label="Client secret" hint="Stored encrypted at rest; never shown.">
        <Text as="span" className="font-mono text-sm text-muted-foreground">
          •••••••• {connection.secretSet ? 'hidden' : 'not set'}
        </Text>
      </SettingsRow>
      <SettingsRow
        label="Just-in-time provisioning"
        hint="Auto-creates accounts and adds them to this org on first SSO sign-in."
      >
        {connection.jitProvisioning ? (
          <StatusBadge icon={ToggleOnIcon} label="On" tone="success" />
        ) : (
          <StatusBadge icon={ToggleOffIcon} label="Off" variant="outline" />
        )}
      </SettingsRow>
      <SettingsRow
        label="Require SSO"
        hint="When on, members on your verified domains must sign in via SSO."
      >
        {connection.enforced ? (
          <StatusBadge icon={SquareLock02Icon} label="Required" tone="warning" />
        ) : (
          <StatusBadge icon={SquareUnlock02Icon} label="Optional" variant="outline" />
        )}
      </SettingsRow>
      <SettingsRow label="Default role" hint="The role new members get when provisioned.">
        <Text as="span" className="text-sm capitalize">
          {connection.defaultRole}
        </Text>
      </SettingsRow>
      <SettingsRow label="Enabled" hint="When off, the config is kept but SSO logins are blocked.">
        {connection.status === 'active' ? (
          <StatusBadge icon={CheckmarkCircle02Icon} label="Active" tone="success" />
        ) : (
          <StatusBadge icon={CancelCircleIcon} label="Disabled" tone="danger" variant="outline" />
        )}
      </SettingsRow>
    </>
  );
}

/** Editable connection fields (shown on first setup and when Edit is clicked). */
function ConnectionEdit({
  draft,
  set,
  connection,
}: {
  draft: ConnDraft;
  set: (patch: Partial<ConnDraft>) => void;
  connection: SsoConnection | null;
}) {
  return (
    <>
      <SettingsRow label="Issuer URL" hint="e.g. https://your-company.okta.com">
        <Input
          type="url"
          placeholder="https://your-company.okta.com"
          value={draft.issuerUrl}
          onChange={(e) => set({ issuerUrl: e.target.value })}
          className="w-full max-w-md"
          data-testid="sso-issuer"
        />
      </SettingsRow>

      <SettingsRow label="Client ID" hint="From your provider's OIDC application.">
        <Input
          value={draft.clientId}
          onChange={(e) => set({ clientId: e.target.value })}
          className="w-full max-w-md"
          data-testid="sso-client-id"
        />
      </SettingsRow>

      <SettingsRow
        label="Client secret"
        hint={
          connection
            ? 'Stored encrypted. Leave blank to keep the current secret.'
            : 'Stored encrypted at rest.'
        }
      >
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={connection?.secretSet ? '•••••••• (unchanged)' : ''}
          value={draft.clientSecret}
          onChange={(e) => set({ clientSecret: e.target.value })}
          className="w-full max-w-md"
          data-testid="sso-client-secret"
        />
      </SettingsRow>

      <SettingsRow
        label="Just-in-time provisioning"
        hint="Auto-create accounts and add them to this org on first SSO sign-in."
      >
        <Switch
          checked={draft.jitProvisioning}
          onCheckedChange={(v) => set({ jitProvisioning: v })}
        />
      </SettingsRow>

      <SettingsRow
        label="Require SSO"
        hint="Force everyone on your verified domains to sign in via SSO, this blocks password and social login for those emails across all of Nijam. Test SSO before enabling: enforced users can't fall back, and a broken IdP can lock them out."
      >
        <Switch checked={draft.enforced} onCheckedChange={(v) => set({ enforced: v })} />
      </SettingsRow>
      {draft.enforced && (
        <div className="px-5 pb-4">
          <Notice tone="warning" icon={AlertCircleIcon}>
            Enforcing SSO <b>claims your verified domains</b>: everyone with one of those emails
            must sign in through your identity provider across all of Nijam, including any other
            organizations they belong to. Deprovisioning a user in your IdP then removes their Nijam
            access entirely.
          </Notice>
        </div>
      )}

      <SettingsRow label="Default role" hint="The role new members get when provisioned.">
        <Select
          value={draft.defaultRole}
          onValueChange={(v) => set({ defaultRole: v as 'admin' | 'member' })}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>

      {connection && (
        <SettingsRow label="Enabled" hint="Turn off to keep the config but block SSO logins.">
          <Switch
            checked={draft.status === 'active'}
            onCheckedChange={(v) => set({ status: v ? 'active' : 'disabled' })}
          />
        </SettingsRow>
      )}
    </>
  );
}

function DomainsPanel({ orgId, connection }: { orgId: string; connection: Conn }) {
  const queryClient = useQueryClient();
  const queryKey = getOrgSsoQueryKey({ path: { orgId } });
  const [newDomain, setNewDomain] = useState('');

  const writeCache = (data: unknown) => queryClient.setQueryData(queryKey, data);
  const onErr = (title: string) => (err: unknown) =>
    notify.error(title, {
      description: isApiError(err) ? err.error.message : 'Something went wrong. Please try again.',
    });

  const add = useMutation({
    ...addOrgSsoDomainMutation(),
    onSuccess: (data) => {
      writeCache(data);
      setNewDomain('');
      notify.success('Domain added', { description: 'Publish the TXT record, then verify it.' });
    },
    onError: onErr("Couldn't add domain"),
  });

  const verify = useMutation({
    ...verifyOrgSsoDomainMutation(),
    onSuccess: (data) => {
      writeCache(data);
      notify.success('Domain verified', {
        description: 'Logins from this domain can now use SSO.',
      });
    },
    onError: onErr("Couldn't verify domain"),
  });

  const remove = useMutation({
    ...removeOrgSsoDomainMutation(),
    onSuccess: writeCache,
    onError: onErr("Couldn't remove domain"),
  });

  return (
    <SettingsPanel title="Email domains">
      {connection.domains.length === 0 && (
        <Flex className="px-5 py-5">
          <Text color="muted" className="text-sm">
            Add the email domains your team signs in with (e.g. company.com). A login routes to SSO
            only after its domain is verified.
          </Text>
        </Flex>
      )}

      {connection.domains.map((d) => (
        <DomainRow
          key={d.id}
          domain={d}
          onVerify={() => verify.mutate({ path: { orgId, domainId: d.id } })}
          verifying={verify.isPending && verify.variables?.path.domainId === d.id}
          onRemove={() => remove.mutate({ path: { orgId, domainId: d.id } })}
          removing={remove.isPending && remove.variables?.path.domainId === d.id}
        />
      ))}

      <Flex
        as="form"
        gap={2}
        className="px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (newDomain.trim()) add.mutate({ path: { orgId }, body: { domain: newDomain.trim() } });
        }}
      >
        <Label htmlFor="new-domain" className="sr-only">
          Add domain
        </Label>
        <Input
          id="new-domain"
          placeholder="company.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="max-w-xs"
          data-testid="sso-new-domain"
        />
        <Button
          type="submit"
          variant="outline"
          loading={add.isPending}
          disabled={!newDomain.trim()}
        >
          Add domain
        </Button>
      </Flex>
    </SettingsPanel>
  );
}

/** One email domain: status, verify, the (copyable) DNS record, and a confirmed remove. */
function DomainRow({
  domain,
  onVerify,
  verifying,
  onRemove,
  removing,
}: {
  domain: SsoDomainItem;
  onVerify: () => void;
  verifying: boolean;
  onRemove: () => void;
  removing: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Flex direction="col" gap={3} className="border-b border-border px-5 py-4 last:border-b-0">
      <Flex align="center" justify="between" gap={3} className="flex-wrap">
        <Flex align="center" gap={2.5}>
          <Text as="span" className="font-mono text-sm font-semibold">
            {domain.domain}
          </Text>
          {domain.verified ? (
            <StatusBadge icon={CheckmarkCircle02Icon} label="Verified" tone="success" />
          ) : (
            <StatusBadge icon={AlertCircleIcon} label="Pending" tone="warning" variant="outline" />
          )}
        </Flex>
        <Flex align="center" gap={2}>
          {!domain.verified && (
            <Button size="sm" variant="outline" loading={verifying} onClick={onVerify}>
              Verify
            </Button>
          )}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Remove
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {domain.domain}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Users with an{' '}
                  <span className="font-medium text-foreground">@{domain.domain}</span> email will
                  no longer be routed to single sign-on. You can add and re-verify it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  loading={removing}
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove();
                  }}
                >
                  Remove domain
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Flex>

      {!domain.verified && (
        <Flex direction="col" gap={2.5} className="rounded-lg bg-muted/40 px-3.5 py-3">
          <Text as="span" className="text-xs text-muted-foreground">
            Add this DNS TXT record, then click Verify:
          </Text>
          <Flex direction="col" gap={1}>
            <Text as="span" className="text-xs font-medium text-muted-foreground">
              Name
            </Text>
            <CopyField value={domain.txtName} />
          </Flex>
          <Flex direction="col" gap={1}>
            <Text as="span" className="text-xs font-medium text-muted-foreground">
              Value
            </Text>
            <CopyField value={domain.txtValue} />
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

function DangerPanel({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const del = useMutation({
    ...deleteOrgSsoMutation(),
    onSuccess: () => {
      setOpen(false);
      queryClient.setQueryData(getOrgSsoQueryKey({ path: { orgId } }), { connection: null });
      notify.success('Single sign-on removed', {
        description: 'The connection and its domains were deleted. Members keep their accounts.',
      });
    },
    onError: (err) => {
      setOpen(false);
      notify.error("Couldn't remove single sign-on", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    },
  });

  return (
    <>
      <SettingsPanel title="Remove single sign-on" danger>
        <SettingsRow
          label="Delete connection"
          hint="Removes the provider config and all domains. Existing members keep their accounts."
        >
          <Flex>
            <Button variant="outline" className="text-destructive" onClick={() => setOpen(true)}>
              Remove SSO
            </Button>
          </Flex>
        </SettingsRow>
      </SettingsPanel>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove single sign-on?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the identity-provider connection and all verified domains. Members who
              signed in via SSO keep their accounts and can use email/password or social login.
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
