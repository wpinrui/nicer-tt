/**
 * Performance monitoring utilities for development mode.
 * All functions are no-ops in production.
 */

const isDev = import.meta.env.DEV;

/**
 * Logs render timing for a component in development mode.
 * Call at the start of a component's render.
 *
 * @param componentName - Name of the component being measured
 * @returns A function to call when render is complete (logs the duration)
 */
export function logRenderStart(componentName: string): () => void {
  if (!isDev) return () => {};

  const startTime = performance.now();
  return () => {
    const duration = performance.now() - startTime;
    if (duration > 1) {
      // Only log renders taking more than 1ms
      console.log(`[Perf] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * React hook for measuring component render time in development.
 * Logs timing on each render.
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
