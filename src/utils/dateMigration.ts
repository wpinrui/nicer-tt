import { TIMETABLE_YEAR } from './constants';

/**
 * Migrate date from legacy DD/MM format to YYYY-MM-DD format.
 * Returns original if already in ISO format.
 *
 * This is used during localStorage data migration and will eventually
 * be unused once all users have migrated.
 */
export function migrateDateFormat(dateStr: string): string {
  if (dateStr.includes('/')) {
    // Old DD/MM format - convert to YYYY-MM-DD
    const [day, month] = dateStr.split('/');
    return `${TIMETABLE_YEAR}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Already in YYYY-MM-DD format
  return dateStr;
}
