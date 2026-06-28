import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { UnfoldMoreIcon, PlusSignIcon, Building03Icon } from '@hugeicons/core-free-icons';
import { listOrgsOptions, getOrgOptions } from '@/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { OrgAvatar } from '@/components/orgs/OrgAvatar';
import { CreateOrgDialog } from '@/components/orgs/CreateOrgDialog';
import { HoverHighlight } from '@/components/ui/hover-highlight';

// Background on hover is drawn by the sliding HoverHighlight, so items stay
// transparent (the ghost Button's own hover bg is overridden too).
const menuItem =
  'w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-transparent';

/** Current-org chip + dropdown to switch orgs, create one, or go to the picker. */
export function OrgSwitcher({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const current = useQuery(getOrgOptions({ path: { orgId } }));
  const list = useQuery({ ...listOrgsOptions(), enabled: open });
  const org = current.data;

  // The org list is fetched lazily on open; show placeholder rows while it loads.
  const renderOrgRows = () => {
    if (list.isLoading) {
      return ['w-28', 'w-20', 'w-24'].map((w, i) => (
        <Flex key={`org-skeleton-${i}`} align="center" gap={2.5} className="px-2 py-1.5">
          <Skeleton className="size-6.5 shrink-0 rounded-md" />
          <Skeleton className={cn('h-4 rounded-md', w)} />
        </Flex>
      ));
    }
    return (list.data?.orgs ?? []).map((o) => (
      <Button
        variant="ghost"
        key={o.id}
        type="button"
        data-hover-item
        onClick={() => {
          setOpen(false);
          navigate({ to: '/orgs/$orgId/projects', params: { orgId: o.id } });
        }}
        className={cn('h-auto justify-start gap-2.5', menuItem, o.id === orgId && 'bg-accent')}
      >
        <OrgAvatar org={o} size="sm" />
        <Text as="span" truncate className="min-w-0 flex-1">
          {o.name}
        </Text>
      </Button>
    ));
  };

  return (
    <div className="relative mb-1.5">
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              key="org-menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full right-0 left-0 z-50 mt-1.5 origin-top rounded-lg border border-border bg-popover p-1.5 shadow-xl"
            >
              <HoverHighlight>
              <Text as="div" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Organizations
              </Text>
            <Flex direction="col" gap={0.5} className="max-h-64 overflow-y-auto">
              {renderOrgRows()}
            </Flex>
            <div className="my-1 h-px bg-border" />
            <Button
              variant="ghost"
              type="button"
              data-hover-item
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
              data-hover-item
              onClick={() => setOpen(false)}
              align="center"
              gap={2.5}
              className={menuItem}
            >
              <HugeiconsIcon icon={Building03Icon} size={16} className="text-muted-foreground" />
              All organizations
            </Flex>
            </HoverHighlight>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        type="button"
        data-sidebar-hover
        onClick={() => setOpen((o) => !o)}
        className={cn(
          // Background is drawn by the sidebar's sliding hover highlight, so stay
          // transparent on hover; keep a solid fill only while the menu is open.
          'h-auto w-full justify-start gap-2.5 rounded-xl p-2 text-left hover:bg-transparent',
          open && 'bg-sidebar-accent hover:bg-sidebar-accent',
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
