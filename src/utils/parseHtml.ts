import type { TimetableEvent } from '../types';

// Re-export types for backward compatibility
export type { TimetableEvent, Timetable } from '../types';

export function parseHtmlTimetable(html: string): TimetableEvent[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const infoTable = doc.querySelector('#infotab');
  if (!infoTable) {
    throw new Error('Could not find timetable data. Make sure you uploaded the correct NIE timetable HTML file.');
  }

  const rows = infoTable.querySelectorAll('tr');
  const events: TimetableEvent[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length < 8) continue;

    const course = cells[0]?.textContent?.trim() || '';
    const group = cells[1]?.textContent?.trim() || '';
    const day = cells[2]?.textContent?.trim() || '';
    const startTime = cells[3]?.textContent?.trim() || '';
    const endTime = cells[4]?.textContent?.trim() || '';
    const datesStr = cells[5]?.textContent?.trim() || '';
    const venue = cells[6]?.textContent?.trim() || '';
    const tutor = cells[7]?.textContent?.trim() || '';

    if (!course || !startTime || !endTime) continue;

    const dates = datesStr.split(',').map(d => d.trim()).filter(d => d);

    events.push({
      course,
      group,
      day,
      startTime,
      endTime,
      dates,
      venue,
      tutor,
    });
  }

  if (events.length === 0) {
    throw new Error('No events found in the timetable. The file might be empty or in an unexpected format.');
  }

  return events;
}
