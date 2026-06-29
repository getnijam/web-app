import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, RefreshIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { useDeploymentUpdate } from '@/hooks/use-deployment-update';

/**
 * A small bottom-left prompt shown when a newer build has been deployed than the one
 * running in this tab (see useDeploymentUpdate). Sits opposite the toasts (which are
 * bottom-right) so they never overlap. Reload picks up the new UI; Dismiss hides it.
 */
export function UpdatePrompt() {
  const updateAvailable = useDeploymentUpdate();
  const [dismissed, setDismissed] = useState(false);
  const open = updateAvailable && !dismissed;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:left-4 sm:w-80"
        >
          <Flex
            align="start"
            gap={3}
            className="relative rounded-2xl border border-border bg-popover p-4 pr-10 text-popover-foreground shadow-lg"
          >
            <Flex
              align="center"
              justify="center"
              className="size-9 shrink-0 rounded-xl bg-primary/10 text-primary"
            >
              <HugeiconsIcon icon={SparklesIcon} size={18} strokeWidth={2} />
            </Flex>

            <Flex direction="col" gap={0.5} className="min-w-0 flex-1">
              <Text as="div" weight="semibold" className="text-sm">
                New version available
              </Text>
              <Text as="div" color="muted" className="text-sm">
                Reload to get the latest updates.
              </Text>
              <Flex gap={2} className="pt-2">
                <Button size="sm" onClick={() => window.location.reload()}>
                  <HugeiconsIcon icon={RefreshIcon} size={15} strokeWidth={2} />
                  Reload
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
                  Later
                </Button>
              </Flex>
            </Flex>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
            </button>
          </Flex>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
