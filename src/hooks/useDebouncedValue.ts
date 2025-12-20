import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the input value.
 * The returned value only updates after the specified delay has passed
 * without the input value changing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 150ms)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay = 150): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
