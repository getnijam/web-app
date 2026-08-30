import * as React from 'react';

/**
 * The stack of open Radix modal layers (dialogs and sheets), innermost last.
 *
 * The feedback trigger has to be reachable while a dialog or a sheet is open, and a
 * floating button at the body level cannot be: Radix stamps `aria-hidden` on every
 * body-level sibling of the open content (see the `aria-hidden` package, which has no
 * opt-out attribute), the overlay covers it, `react-remove-scroll` kills pointer
 * events on the body, the focus trap pulls focus back, and a click on it reads as an
 * "interact outside" that dismisses the very layer you wanted to report on.
 *
 * So the trigger is not a floating button. Every open layer registers its content node
 * here, and the trigger portals itself into the topmost one. As a DOM descendant of
 * the open content it is inside the focus trap, never aria-hidden, above the overlay,
 * and not an outside pointer target. All five problems come from the same root cause,
 * and moving one subtree fixes all of them.
 */
const stack: HTMLElement[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): HTMLElement | null {
  return stack[stack.length - 1] ?? null;
}

/** No layers exist during SSR, and a stable null keeps hydration quiet. */
function getServerSnapshot(): HTMLElement | null {
  return null;
}

/**
 * Register a layer's content node for as long as it is mounted. Returns a React 19
 * ref callback (its cleanup runs on unmount), so a layer opts in with a single ref.
 */
export function useFeedbackLayer<T extends HTMLElement>(): React.RefCallback<T> {
  return React.useCallback((node: T | null) => {
    if (!node) return;
    stack.push(node);
    emit();
    return () => {
      const index = stack.indexOf(node);
      if (index !== -1) stack.splice(index, 1);
      emit();
    };
  }, []);
}

/** The innermost open layer, or null when the page itself is the top layer. */
export function useTopFeedbackLayer(): HTMLElement | null {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Merge our layer ref with whatever ref the caller passed, so registering a layer
 * never costs a consumer their own ref.
 */
export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T | null) => {
    // Returning a cleanup opts the whole callback into React 19's ref-cleanup path,
    // where React no longer calls refs with null. So each branch has to undo itself.
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        const cleanup = ref(node);
        return typeof cleanup === 'function' ? cleanup : () => ref(null);
      }
      if (ref) {
        const object = ref as React.RefObject<T | null>;
        object.current = node;
        return () => {
          object.current = null;
        };
      }
      return undefined;
    });
    return () => {
      for (const cleanup of cleanups) cleanup?.();
    };
  };
}
