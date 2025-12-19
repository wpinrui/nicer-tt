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
