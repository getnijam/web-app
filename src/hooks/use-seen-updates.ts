import { useEffect, useState } from 'react';
import { useLocalStorage } from './use-local-storage';

/**
 * localStorage key holding the ids of updates whose write-up has been opened.
 *
 * NOTE: localStorage is otherwise banned in this app (see web-app/CLAUDE.md); it is
 * permitted here per explicit user approval, the same carve-out as the theme
 * preference. This is a stand-in until "last seen" moves onto the user record, at
 * which point the shape below (a set of ids) is what the API should store.
 */
const STORAGE_KEY = 'nijam-seen-updates';

/** Anything that is not an array of strings (a corrupt or older value) reads as empty. */
function sanitize(value: string[]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
}

/**
 * Tracks which of `ids` have had their write-up opened, persisted across reloads on
 * the vendored `useLocalStorage`. The extra `hydrated` flag is this hook's own concern:
 * `useLocalStorage` starts from its initial value and adopts the stored one in a mount
 * effect, so without it the indicator would flash on for one frame before we know
 * whether anything is genuinely unseen.
 */
export function useSeenUpdates(ids: string[]) {
  // `ids` is the eligible set, already filtered by the caller (e.g. to recent updates
  // only), so `hasUnseen` never fires for something that is no longer news.
  const [seen, setSeen] = useLocalStorage<string[]>(STORAGE_KEY, []);
  const [hydrated, setHydrated] = useState(false);

  // Declared after useLocalStorage so its adoption effect runs first; React commits
  // both state updates in one pass, so there is no intermediate "nothing seen" render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const safeSeen = sanitize(seen);
  const markSeen = (id: string) =>
    setSeen((current) => {
      const next = sanitize(current);
      return next.includes(id) ? next : [...next, id];
    });

  return {
    /** Before hydration everything reads as seen, so nothing renders as new too early. */
    isSeen: (id: string) => !hydrated || safeSeen.includes(id),
    hasUnseen: hydrated && ids.some((id) => !safeSeen.includes(id)),
    markSeen,
  };
}
