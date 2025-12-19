/**
 * Generate a unique ID with a given prefix
 * @param prefix - Prefix for the ID (default: 'id')
 * @returns Unique ID string
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
