import { TIMETABLE_YEAR } from './constants';

export function formatDateDisplay(dateStr: string): string {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(TIMETABLE_YEAR, month - 1, day);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return `${dayName}, ${day} ${monthName}`;
}

export function getTodaySortKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function isToday(sortKey: string): boolean {
  return sortKey === getTodaySortKey();
}

export function getDateSearchString(dateStr: string): string {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(TIMETABLE_YEAR, month - 1, day);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const monthLong = date.toLocaleDateString('en-US', { month: 'long' });
  return `${day} ${monthShort} ${monthLong} ${dayName} ${TIMETABLE_YEAR} ${dateStr} ${day}/${month}`;
}

/**
 * Get all searchable tokens for a date string.
 * Returns an array of lowercase tokens that can be matched against search queries.
 */
export function getDateSearchTokens(dateStr: string): string[] {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(TIMETABLE_YEAR, month - 1, day);

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const monthLong = date.toLocaleDateString('en-US', { month: 'long' });

  const dayPadded = String(day).padStart(2, '0');
  const monthPadded = String(month).padStart(2, '0');
  const yearShort = String(TIMETABLE_YEAR).slice(-2);

  return [
    // Day, month, year standalone
    String(day),
    dayPadded,
    String(month),
    monthPadded,
    String(TIMETABLE_YEAR),
    yearShort,

    // Month names
    monthShort.toLowerCase(),
    monthLong.toLowerCase(),

    // Day names
    dayName.toLowerCase(),
    dayShort.toLowerCase(),

    // Slash formats: DD/MM, DD/M, D/MM, D/M
    `${day}/${month}`,
    `${dayPadded}/${monthPadded}`,
    `${day}/${monthPadded}`,
    `${dayPadded}/${month}`,

    // Slash formats: MM/DD, M/DD, MM/D, M/D (US style)
    `${month}/${day}`,
    `${monthPadded}/${dayPadded}`,
    `${month}/${dayPadded}`,
    `${monthPadded}/${day}`,

    // With year: YY/MM/DD, DD/MM/YY
    `${yearShort}/${monthPadded}/${dayPadded}`,
    `${dayPadded}/${monthPadded}/${yearShort}`,

    // Dash formats: DD-MM, DD-M, D-MM, D-M
    `${day}-${month}`,
    `${dayPadded}-${monthPadded}`,
    `${day}-${monthPadded}`,
    `${dayPadded}-${month}`,

    // Dash formats: MM-DD, M-DD, MM-D, M-D (US style)
    `${month}-${day}`,
    `${monthPadded}-${dayPadded}`,
    `${month}-${dayPadded}`,
    `${monthPadded}-${day}`,

    // With year: YY-MM-DD, DD-MM-YY
    `${yearShort}-${monthPadded}-${dayPadded}`,
    `${dayPadded}-${monthPadded}-${yearShort}`,
  ];
}

/**
 * Check if a search query matches a date string using token-based OR logic.
 * Each token in the query must match at least one date token.
 * This allows any permutation of date components to match.
 */
export function matchesDateSearch(dateStr: string, query: string): boolean {
  if (!query) return true;

  // Split query into tokens (by space, slash, or dash)
  const queryTokens = query
    .toLowerCase()
    .split(/[\s/\-]+/)
    .filter((t) => t.length > 0);

  if (queryTokens.length === 0) return true;

  const dateTokens = getDateSearchTokens(dateStr);

  // Each query token must match at least one date token (partial match allowed)
  return queryTokens.every((qt) => dateTokens.some((dt) => dt.includes(qt) || qt.includes(dt)));
}

export function formatTime12Hour(time: string): string {
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = time.slice(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

export function formatVenue(venue: string): string {
  const match = venue.match(/^(\d+)-(\d+)-(.+)$/);
  if (match) {
    const block = parseInt(match[1], 10);
    const level = parseInt(match[2], 10);
    const room = match[3];
    return `Block ${block}, Level ${level}, ${room}`;
  }
  return venue;
}

export function formatTutor(tutor: string): string {
  let name = tutor.includes(':') ? tutor.split(':').pop()! : tutor;
  name = name.replace(/(\S)\(/, '$1 (');
  return name;
}

export function createSortKey(dateStr: string): string {
  const [day, month] = dateStr.split('/');
  return `${TIMETABLE_YEAR}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
