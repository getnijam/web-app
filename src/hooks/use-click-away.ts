import { useEffect, useRef } from 'react';

/**
 * Close-on-outside-click. Returns a ref to attach to the container; `onAway`
 * fires when a pointerdown lands outside it.
 *
 * Vendored from usehooks.io (`useClickAway`). We use a document listener rather
 * than a `fixed inset-0` overlay because the home nav has `backdrop-blur`, and a
 * `backdrop-filter` ancestor makes a child `position: fixed` resolve to that
 * ancestor (not the viewport) — so an overlay wouldn't cover the page.
 */
export function useClickAway<T extends HTMLElement = HTMLElement>(onAway: (e: Event) => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onAway);
  // Keep the latest callback without resubscribing the listeners each render.
  useEffect(() => {
    cb.current = onAway;
  }, [onAway]);

  useEffect(() => {
    const handler = (e: Event) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) cb.current(e);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return ref;
}
