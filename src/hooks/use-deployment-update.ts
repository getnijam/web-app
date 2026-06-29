import { useEffect, useState } from 'react';

// How often to re-check for a newer deployment (also checks on tab re-focus).
const POLL_INTERVAL = 5 * 60 * 1000;

/** The hashed entry-script path of the build currently running in this tab. */
function bootedEntrySrc(): string | null {
  const el = document.querySelector('script[type="module"][src*="/assets/"]');
  return el?.getAttribute('src') ?? null;
}

/** Read the deployed index.html's entry-script path (changes hash on every build). */
async function deployedEntrySrc(signal: AbortSignal): Promise<string | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}index.html`, {
    cache: 'no-store',
    signal,
  });
  if (!res.ok) return null;
  const html = await res.text();
  return html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1] ?? null;
}

/**
 * True once a newer build has been deployed than the one running in this tab. Works
 * by polling the deployed index.html and comparing its hashed entry-script path to
 * the one we booted with (every build re-hashes it). Stops once an update is found.
 * No-op in dev, where Vite HMR already handles updates and assets aren't hashed.
 */
export function useDeploymentUpdate(): boolean {
  const [updateAvailable, setUpdateAvailable] = useState(false);

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
          setUpdateAvailable(true);
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

  return updateAvailable;
}
