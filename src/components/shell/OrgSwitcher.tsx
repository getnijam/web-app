import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { UnfoldMoreIcon, PlusSignIcon, Building03Icon } from '@hugeicons/core-free-icons';
import { listOrgsOptions, getOrgOptions } from '@/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { CreateOrgDialog } from '@/components/orgs/CreateOrgDialog';

const menuItem =
  'w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent';

/** Current-org chip + dropdown to switch orgs, create one, or go to the picker. */
export function OrgSwitcher({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const current = useQuery(getOrgOptions({ path: { orgId } }));
  const list = useQuery({ ...listOrgsOptions(), enabled: open });
  const org = current.data;

  return (
    <div className="relative mb-1.5">
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 left-0 z-50 mt-1.5 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            <Text as="div" className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Organizations
            </Text>
            <Flex direction="col" gap={0.5} className="max-h-64 overflow-y-auto">
              {(list.data?.orgs ?? []).map((o) => (
                <Button
                  variant="ghost"
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: '/orgs/$orgId/projects', params: { orgId: o.id } });
                  }}
                  className={cn(
                    'h-auto justify-start gap-2.5',
                    menuItem,
                    o.id === orgId && 'bg-accent',
                  )}
                >
                  <OrgAvatar org={o} size="sm" />
                  <Text as="span" truncate className="min-w-0 flex-1">
                    {o.name}
                  </Text>
                </Button>
              ))}
            </Flex>
            <div className="my-1 h-px bg-border" />
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className={cn('h-auto justify-start gap-2.5', menuItem)}
              data-testid="create-org-trigger"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} className="text-muted-foreground" />
              New organization
            </Button>
            <Flex
              as={Link}
              to="/orgs"
              onClick={() => setOpen(false)}
              align="center"
              gap={2.5}
              className={menuItem}
            >
              <HugeiconsIcon icon={Building03Icon} size={16} className="text-muted-foreground" />
              All organizations
            </Flex>
          </div>
        </>
      )}

      <Button
        variant="ghost"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'h-auto w-full justify-start gap-2.5 rounded-lg p-2 text-left hover:bg-sidebar-accent',
          open && 'bg-sidebar-accent',
        )}
      >
        {org ? (
          <OrgAvatar org={org} size="md" />
        ) : (
          <div className="size-9.5 shrink-0 rounded-lg bg-muted" />
        )}
        <Flex direction="col" className="min-w-0 flex-1 leading-tight">
          <Text as="span" truncate className="text-sm font-semibold">
            {org?.name ?? 'Organization'}
          </Text>
          <Text as="span" className="text-xs text-muted-foreground">
            Switch organization
          </Text>
        </Flex>
        <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="shrink-0 text-muted-foreground" />
      </Button>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
