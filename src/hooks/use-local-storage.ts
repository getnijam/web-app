'use client';

// Sourced from usehooks.io (`npx usehooks-cli@latest add use-local-storage`), vendored
// here rather than added as a runtime dep, matching the repo's copy-paste convention.
// https://www.usehooks.io/docs/use-local-storage
//
// ONE DEVIATION from upstream: upstream reads `window.localStorage` inside the
// `useState` initializer, which throws under SSR and would hydration-mismatch even
// where it does not. Per the repo's SSR guard rail, the initializer returns the
// deterministic `initialValue` and a mount effect adopts the stored value instead
// (the same shape `ThemeProvider` uses). The public API is unchanged.
//
// Storage note: localStorage is banned app-wide except for the keys listed in the
// CLAUDE.md guard rail, so this hook has a deliberately short list of callers.
import { useEffect, useState } from 'react';

type SetValue<T> = T | ((val: T) => T);

function readStored<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    // Storage unavailable (private mode, blocked) or a corrupt value.
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Adopt the persisted value once, after hydration. SSR and the first client render
  // both show `initialValue`, so they agree.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredValue(readStored(key, initialValue));
    // `initialValue` is intentionally not a dependency: re-reading on every new
    // object/array literal the caller passes would clobber the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: SetValue<T>) => {
    setStoredValue((current) => {
      const valueToStore = value instanceof Function ? value(current) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Storage unavailable: keep the in-memory value, drop the persistence.
      }
      return valueToStore;
    });
  };

  return [storedValue, setValue];
}
