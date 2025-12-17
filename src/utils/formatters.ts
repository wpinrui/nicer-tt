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
