import { Link } from '@tanstack/react-router';
import { RUN_ROUTE } from '@/lib/routes';
import { motion, type Transition } from 'motion/react';
import type { RunGroup } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/format';
import { attemptDisplayStatus } from './run-status';
import { StatusDot } from './StatusDot';

// The active-attempt outline is a single shared element (one layoutId across all
// attempts): when the selected attempt changes, Motion glides the same box to the
// new card instead of snapping, matching the spring the tabs/toggle indicators use.
const HIGHLIGHT_TRANSITION: Transition = { type: 'spring', stiffness: 250, damping: 30 };

/**
 * The clubbed-attempts switcher shown on a run that was re-run. Each attempt links to
 * its own run detail; the one being viewed is highlighted. A partial re-run (only the
 * previous attempt's failures) is tagged, and any recovered tests are called out so a
 * green retry reads as a fix, not a separate run.
 */
export function AttemptSwitcher({
  group,
  orgId,
  projectId,
  currentRunId,
}: {
  group: NonNullable<RunGroup>;
  orgId: string;
  projectId: string;
  currentRunId: string;
}) {
  const { attempts, rolledUp } = group;

  return (
    <Flex direction="col" gap={3} className="rounded-2xl border border-border bg-card p-4">
      <Flex align="center" justify="between" gap={3} wrap>
        <Flex align="center" gap={2}>
          <Text variant="h4">Attempts</Text>
          <Text as="span" className="text-sm text-muted-foreground tabular-nums">
            {attempts.length}
          </Text>
        </Flex>
        {rolledUp.recovered > 0 && (
          <Text as="span" className="text-sm font-medium text-success">
            {rolledUp.recovered} test{rolledUp.recovered === 1 ? '' : 's'} recovered on retry
          </Text>
        )}
      </Flex>

      <Flex align="center" gap={2} wrap>
        {attempts.map((a, i) => {
          const ds = attemptDisplayStatus(a);
          const isCurrent = a.runId === currentRunId;
          return (
            <Link
              key={a.runId}
              to={RUN_ROUTE}
              params={{ orgId, projectId, runId: a.runId }}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'relative rounded-xl border px-3 py-2 transition-colors',
                isCurrent
                  ? 'border-transparent'
                  : 'border-border hover:border-primary/40 hover:bg-accent',
              )}
            >
              {isCurrent && (
                <motion.span
                  layoutId="attempt-active"
                  aria-hidden
                  className="absolute -inset-px z-0 rounded-xl border border-primary bg-accent"
                  transition={HIGHLIGHT_TRANSITION}
                />
              )}
              <Flex align="center" gap={2} className="relative z-10">
                <StatusDot status={ds} />
                <Flex direction="col" className="min-w-0">
                  <Flex align="center" gap={1.5}>
                    <Text as="span" className="text-sm font-medium">
                      Attempt {a.attempt ?? i + 1}
                    </Text>
                    {a.partialRerun && (
                      <Text
                        as="span"
                        className="rounded-full bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        failed only
                      </Text>
                    )}
                  </Flex>
                  <Text as="span" className="text-xs text-muted-foreground">
                    {timeAgo(a.startedAt)}
                  </Text>
                </Flex>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Flex>
  );
}
