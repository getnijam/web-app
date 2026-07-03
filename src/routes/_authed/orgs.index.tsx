import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { LOGIN_ROUTE, ORG_PROJECTS_ROUTE } from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { listOrgsOptions, getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { Logo } from '@/components/auth/Logo';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { AccountMenu } from '@/components/users/AccountMenu';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { CreateOrgDialog } from '@/components/orgs/CreateOrgDialog';
import { PendingInvitations } from '@/components/orgs/PendingInvitations';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/orgs/')({
  head: () => privateSeo('Organizations'),
  component: OrgsPicker,
});

function OrgsPicker() {
  const { data, isLoading, error, refetch } = useQuery(listOrgsOptions());
  const navigate = useNavigate();
  const user = useQuery({ ...getMeOptions(), retry: false }).data?.user;
  const [dialogOpen, setDialogOpen] = useState(false);
  const orgs = data?.orgs ?? [];

  const renderOrgs = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
    if (orgs.length === 0)
      return (
        <Flex
          direction="col"
          align="center"
          gap={3}
          className="rounded-2xl border border-dashed border-border py-16 text-center"
        >
          <Text weight="semibold">Create your first organization</Text>
          <Text color="muted" className="max-w-sm">
            Organizations hold your projects, runs, and team. You'll land here whenever you sign in.
          </Text>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-1"
            data-testid="create-org-trigger"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New organization
          </Button>
        </Flex>
      );
    return (
      <Flex direction="col" gap={3}>
        {orgs.map((org) => (
          <Flex
            as={Link}
            key={org.id}
            to={ORG_PROJECTS_ROUTE}
            params={{ orgId: org.id } as never}
            align="center"
            gap={3}
            className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/45 hover:bg-accent"
          >
            <OrgAvatar org={org} />
            <Flex direction="col" className="min-w-0 flex-1">
              <Text as="span" truncate weight="semibold">
                {org.name}
              </Text>
            </Flex>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-muted-foreground" />
          </Flex>
        ))}
        <Button
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className="mt-1 self-start"
          data-testid="create-org-trigger"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New organization
        </Button>
      </Flex>
    );
  };

  return (
    <Flex direction="col" className="min-h-svh">
      <Flex
        as="header"
        align="center"
        justify="between"
        gap={4}
        className="border-b border-border px-6 py-3"
      >
        <Logo />
        <Flex align="center" gap={2}>
          <ThemeSegmentedControl />
          {user && (
            <AccountMenu variant="topnav" onSignedOut={() => navigate({ to: LOGIN_ROUTE })} />
          )}
        </Flex>
      </Flex>

      <Flex direction="col" align="center" justify="center" className="flex-1 px-6 py-12">
        <Flex direction="col" gap={6} className="w-full max-w-lg">
          <Flex direction="col" gap={1}>
            <Text variant="h1">Your organizations</Text>
            <Text color="muted">Select an organization to continue, or create a new one.</Text>
          </Flex>

          <PendingInvitations
            onAccepted={(orgId) => navigate({ to: ORG_PROJECTS_ROUTE, params: { orgId } })}
          />

          {renderOrgs()}
        </Flex>
      </Flex>

      <CreateOrgDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Flex>
  );
}
