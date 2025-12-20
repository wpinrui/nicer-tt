/**
 * Format a date from year, month, day numbers to "DayName, Day MonthName Year" format.
 */
export function formatDateFromParts(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format YYYY-MM-DD date string to display format "DayName, Day MonthName Year".
 */
export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return formatDateFromParts(year, month, day);
}

export function getTodaySortKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function isToday(sortKey: string): boolean {
  return sortKey === getTodaySortKey();
}

/**
 * Get all searchable tokens for a date string (YYYY-MM-DD format).
 * Returns an array of lowercase tokens that can be matched against search queries.
 */
export function getDateSearchTokens(dateStr: string): string[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const monthLong = date.toLocaleDateString('en-US', { month: 'long' });

  const dayPadded = String(day).padStart(2, '0');
  const monthPadded = String(month).padStart(2, '0');
  const yearShort = String(year).slice(-2);

  return [
    // Day, month, year standalone
    String(day),
    dayPadded,
    String(month),
    monthPadded,
    String(year),
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
    .split(/[\s/-]+/)
    .filter((t) => t.length > 0);

  if (queryTokens.length === 0) return true;

  const dateTokens = getDateSearchTokens(dateStr);

  // Each query token must match at least one date token
  // Numeric tokens use exact match to avoid "1" matching day "17"
  // Text tokens use includes for partial matching (e.g., "mar" matches "march")
  return queryTokens.every((qt) => {
    const isNumeric = /^\d+$/.test(qt);
    return dateTokens.some((dt) => (isNumeric ? dt === qt : dt.includes(qt)));
  });
}

/**
 * Check if an event matches a search query (text fields + date).
 * Shared logic used by both main timetable and compare views.
 */
export function matchesEventSearch(
  event: { course: string; group: string; venue: string; tutor: string },
  dateStr: string,
  query: string
): boolean {
  if (!query) return true;

  const queryLower = query.toLowerCase();
  const matchesText =
    event.course.toLowerCase().includes(queryLower) ||
    event.group.toLowerCase().includes(queryLower) ||
    event.venue.toLowerCase().includes(queryLower) ||
    event.tutor.toLowerCase().includes(queryLower);

  return matchesText || matchesDateSearch(dateStr, query);
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

/**
 * Create a sort key from a YYYY-MM-DD date string.
 * Since dates are already in ISO format, this just returns the date string.
 */
export function createSortKey(dateStr: string): string {
  return dateStr;
}
