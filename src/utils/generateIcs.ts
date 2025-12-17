import type { TimetableEvent } from './parseHtml';

function formatTimeForIcs(time: string): string {
  // Convert "0830" to "083000"
  return time.padEnd(6, '0');
}

function parseDateDDMM(dateStr: string, year: number): Date {
  // Parse "12/01" as day 12, month 01
  const [day, month] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateForIcs(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}T${formatTimeForIcs(time)}`;
}

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@nie-timetable`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcs(events: TimetableEvent[]): string {
  const year = 2026; // Hardcoded as requested

  const icsEvents: string[] = [];

  for (const event of events) {
    for (const dateStr of event.dates) {
      const date = parseDateDDMM(dateStr, year);

      const summary = `${event.course} - ${event.group}`;
      const location = event.venue;
      const description = event.tutor ? `Tutor: ${event.tutor}` : '';

      const dtstart = formatDateForIcs(date, event.startTime);
      const dtend = formatDateForIcs(date, event.endTime);
      const uid = generateUid();
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsEvents.push(
`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeIcsText(summary)}
LOCATION:${escapeIcsText(location)}
DESCRIPTION:${escapeIcsText(description)}
END:VEVENT`
      );
    }
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NIE Timetable Converter//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:NIE Timetable
${icsEvents.join('\n')}
END:VCALENDAR`;
}

export function downloadIcs(icsContent: string, filename: string = 'nie-timetable.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
