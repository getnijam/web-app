import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldBanIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { useIsOrgAdmin } from '@/hooks/use-org-role';
import { cn } from '@/lib/utils';
import { useQuarantine } from './use-quarantine';

export interface QuarantineTarget {
  testId: string;
  title: string;
  file: string;
}

/**
 * Quarantine / un-quarantine one test. Renders nothing for non-admins: this decides
 * whether future runs block a merge, so it is a merge-gate control, and a member who
 * cannot act on it should not see a dead button. The state itself stays visible to
 * everyone via `QuarantineBadge`.
 *
 * Quarantining asks for confirmation and names the consequence; removing does not, since
 * it only restores the default and the toast says what happened.
 */
export function QuarantineButton({
  orgId,
  projectId,
  test,
  quarantined,
  className,
}: {
  orgId: string;
  projectId: string;
  test: QuarantineTarget;
  quarantined: boolean;
  className?: string;
}) {
  const isAdmin = useIsOrgAdmin(orgId);
  const { quarantine, unquarantine, isPending } = useQuarantine(projectId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isAdmin) return null;

  const label = quarantined ? 'Take out of quarantine' : 'Quarantine this test';

  const onClick = () => {
    if (quarantined) {
      unquarantine(test.testId);
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            loading={isPending}
            aria-label={label}
            onClick={onClick}
            // z-10 lifts it above the row's full-area overlay link (the test rows are
            // themselves links), so the button stays independently clickable.
            className={cn(
              'relative z-10 shrink-0',
              quarantined ? 'text-info' : 'text-muted-foreground',
              className,
            )}
          >
            <HugeiconsIcon icon={ShieldBanIcon} size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quarantine this test?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{test.title}</span> will keep running
              and keep recording results, but from the next run its failures will no longer block
              the build, and the pull request check will stay green. Everyone in the organization
              can see what is quarantined.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                quarantine({ testId: test.testId, title: test.title, file: test.file })
              }
            >
              Quarantine
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
