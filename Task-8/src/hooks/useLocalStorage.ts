import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface UseLocalStorageOptions {
  /** Simulated network latency before the stored value is delivered. */
  delayMs?: number;
}

/**
 * Generic localStorage-backed state that behaves like an async fetch: the first
 * read is delayed by `delayMs` and `isLoading` stays true until it resolves.
 * `initialValue` is only used when nothing valid is stored yet.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  { delayMs = 0 }: UseLocalStorageOptions = {}
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const resolveInitial = (): T => (initialValue instanceof Function ? initialValue() : initialValue);
  const [value, setValue] = useState<T>(resolveInitial);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) setValue(JSON.parse(stored) as T);
      } catch {
        // Corrupt or inaccessible storage falls back to the initial value.
      }
      setIsLoading(false);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [key, delayMs]);

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setValue((previous) => {
        const resolved = next instanceof Function ? next(previous) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage can be full or disabled (private mode); state still updates in memory.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue, isLoading];
}
