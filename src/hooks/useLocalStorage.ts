import { useState, useCallback } from 'react';
import { logError } from '../utils/errors';

interface UseLocalStorageJsonOptions {
  onError?: (error: Error) => void;
}

/**
 * Hook for managing JSON values in localStorage with proper error handling
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist or parse fails
 * @param options - Optional configuration including error callback
 */
export function useLocalStorageJson<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageJsonOptions
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      logError('useLocalStorageJson:read', error, { key });
      options?.onError?.(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        logError('useLocalStorageJson:write', error, { key });
        options?.onError?.(error);
      }
      return valueToStore;
    });
  }, [key, options]);

  return [storedValue, setValue];
}

/**
 * @deprecated Use useLocalStorageJson instead
 */
export const useLocalStorage = useLocalStorageJson;
