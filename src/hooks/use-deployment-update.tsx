import { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon } from '@hugeicons/core-free-icons';
import { notify } from '@/lib/notify';

// How often to re-check for a newer deployment (also checks on tab re-focus).
const POLL_INTERVAL = 5 * 60 * 1000;

/** Read the deployed build id from version.json (emitted fresh on every build). */
async function deployedBuildId(signal: AbortSignal): Promise<string | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store', signal });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  const id = (data as { buildId?: unknown })?.buildId;
  return typeof id === 'string' ? id : null;
}

/**
 * Watches for a newer deployment than the one running in this tab by polling
 * version.json and comparing its build id to `__BUILD_ID__` (baked in at build time);
 * once they differ, raises a persistent toast with a Reload action. Polls every few
 * minutes and on tab re-focus, then stops. No-op in dev, where Vite HMR handles
 * updates and version.json isn't emitted.
 */
export function useDeploymentUpdateNotice(): void {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const controller = new AbortController();

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(run, POLL_INTERVAL);
    };

    const run = async () => {
      if (stopped) return;
      try {
        const deployed = await deployedBuildId(controller.signal);
        if (deployed && deployed !== __BUILD_ID__) {
          stopped = true;
          notify.info('New version available', {
            description: 'Reload to get the latest updates.',
            duration: Infinity,
            action: {
              label: 'Reload',
              icon: <HugeiconsIcon icon={RefreshIcon} size={15} strokeWidth={2} />,
              onClick: () => window.location.reload(),
            },
          });
          return;
        }
      } catch {
        // Network hiccup, ignore and retry on the next tick.
      }
      if (!stopped) schedule();
    };

    const onVisible = () => {
      if (!stopped && document.visibilityState === 'visible') {
        clearTimeout(timer);
        void run();
      }
    };

    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller.abort();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
