/**
 * Result type for safe operations that may fail
 */
export type SafeResult<T> = { data: T; error: null } | { data: null; error: Error };

/**
 * Safely parse JSON without throwing
 * @param json - JSON string to parse
 * @returns Result object with data or error
 */
export function safeJsonParse<T>(json: string): SafeResult<T> {
  try {
    const data = JSON.parse(json) as T;
    return { data, error: null };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return { data: null, error };
  }
}

/**
 * Log an error with context
 * @param context - Description of where the error occurred
 * @param error - The error to log
 * @param extra - Optional additional data to log
 */
export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}]`, errorMessage, {
    ...(stack && { stack }),
    ...(extra && extra),
  });
}
