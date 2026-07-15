import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Updates on viewport changes. SSR-safe (returns false when window is unavailable).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = () =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false;

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * True when the viewport is desktop-width.
 * Matches the SCSS `$breakpoint-mobile: 768px` convention (mobile is <= 768px).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 769px)');
}
