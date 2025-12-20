/**
 * Performance monitoring utilities for development mode.
 * All functions are no-ops in production.
 */

const isDev = import.meta.env.DEV;

/**
 * React hook for measuring component render time in development.
 * Logs timing on each render (only renders > 1ms are logged).
 *
 * @param componentName - Name of the component being measured
 */
export function useRenderTimer(componentName: string): void {
  if (!isDev) return;

  const startTime = performance.now();

  // Use queueMicrotask to log after render completes
  queueMicrotask(() => {
    const duration = performance.now() - startTime;
    if (duration > 1) {
      console.log(`[Perf] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  });
}
