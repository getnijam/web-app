'use client';

/* eslint-disable -- Vendored from animate-ui (hooks/use-data-state); kept in sync with upstream. */

import * as React from 'react';

// Vendored from animate-ui (registry/hooks/use-data-state). Observes a data-*
// attribute on an element and reports its parsed value (used to detect which
// menu item Radix has marked data-highlighted).
type DataStateValue = string | boolean | null;

function parseDatasetValue(value: string | null): DataStateValue {
  if (value === null) return null;
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function useDataState<T extends HTMLElement = HTMLElement>(
  key: string,
  forwardedRef?: React.Ref<T | null>,
  onChange?: (value: DataStateValue) => void,
): [DataStateValue, React.RefObject<T | null>] {
  const localRef = React.useRef<T | null>(null);
  React.useImperativeHandle(forwardedRef, () => localRef.current as T);

  const getSnapshot = (): DataStateValue => {
    const el = localRef.current;
    return el ? parseDatasetValue(el.getAttribute(`data-${key}`)) : null;
  };

  const subscribe = (callback: () => void) => {
    const el = localRef.current;
    if (!el) return () => {};
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.attributeName === `data-${key}`) {
          callback();
          break;
        }
      }
    });
    observer.observe(el, {
      attributes: true,
      attributeFilter: [`data-${key}`],
    });
    return () => observer.disconnect();
  };

  const value = React.useSyncExternalStore(subscribe, getSnapshot);

  React.useEffect(() => {
    if (onChange) onChange(value);
  }, [value, onChange]);

  return [value, localRef];
}

export { useDataState, type DataStateValue };
