import { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon } from '@hugeicons/core-free-icons';
import { notify } from '@/lib/notify';

// How often to re-check for a newer deployment (also checks on tab re-focus).
const POLL_INTERVAL = 5 * 60 * 1000;

/** The hashed entry-script path of the build currently running in this tab. */
function bootedEntrySrc(): string | null {
  const el = document.querySelector('script[type="module"][src*="/assets/"]');
  return el?.getAttribute('src') ?? null;
}

/** Read the deployed index.html's entry-script path (changes hash on every build). */
async function deployedEntrySrc(signal: AbortSignal): Promise<string | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}index.html`, { cache: 'no-store', signal });
  if (!res.ok) return null;
  const html = await res.text();
  return html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1] ?? null;
}

/**
 * Watches for a newer deployment than the one running in this tab (every build
 * re-hashes the entry script) and, once detected, raises a persistent toast with a
 * Reload action. Polls every few minutes and on tab re-focus, then stops. No-op in
 * dev, where Vite HMR handles updates and assets aren't hashed.
 */
export function useDeploymentUpdateNotice(): void {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const booted = bootedEntrySrc();
    if (!booted) return;

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
        const deployed = await deployedEntrySrc(controller.signal);
        if (deployed && deployed !== booted) {
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
