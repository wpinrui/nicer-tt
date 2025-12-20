import type { TimetableEvent } from '../types';
import { TIMETABLE_YEAR } from './constants';

function unescapeIcsText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseIcsDateTime(dtString: string): { date: string; time: string } {
  // Parse "20260112T083000" -> { date: "12/01", time: "0830" }
  const match = dtString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!match) {
    throw new Error(`Invalid ICS datetime format: ${dtString}`);
  }
  const [, , month, day, hours, minutes] = match;
  return {
    date: `${parseInt(day, 10)}/${month}`,
    time: `${hours}${minutes}`,
  };
}

function getDayName(dateStr: string): string {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(TIMETABLE_YEAR, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function parseIcs(icsContent: string): TimetableEvent[] {
  const events: TimetableEvent[] = [];

  // Split into lines and normalize line endings
  const lines = icsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Handle line folding (lines starting with space are continuations)
  const unfoldedLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous line
      if (unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.slice(1);
      }
    } else {
      unfoldedLines.push(line);
    }
  }

  let inEvent = false;
  let currentEvent: Partial<{
    summary: string;
    location: string;
    description: string;
    dtstart: string;
    dtend: string;
  }> = {};

  for (const line of unfoldedLines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      inEvent = false;

      // Process the collected event
      if (currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
        // Parse SUMMARY: "COURSE - GROUP"
        const summaryParts = currentEvent.summary.split(' - ');
        const course = summaryParts[0] || '';
        const group = summaryParts.slice(1).join(' - ') || '';

        // Parse datetime
        const start = parseIcsDateTime(currentEvent.dtstart);
        const end = parseIcsDateTime(currentEvent.dtend);

        // Parse tutor from description
        let tutor = '';
        if (currentEvent.description) {
          const tutorMatch = currentEvent.description.match(/^Tutor:\s*(.+)$/);
          if (tutorMatch) {
            tutor = tutorMatch[1];
          }
        }

        events.push({
          course,
          group,
          day: getDayName(start.date),
          startTime: start.time,
          endTime: end.time,
          dates: [start.date],
          venue: currentEvent.location || '',
          tutor,
        });
      }
    } else if (inEvent) {
      // Parse property
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).split(';')[0]; // Remove parameters like DTSTART;VALUE=DATE
        const value = unescapeIcsText(line.slice(colonIndex + 1));

        switch (key) {
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
          case 'LOCATION':
            currentEvent.location = value;
            break;
          case 'DESCRIPTION':
            currentEvent.description = value;
            break;
          case 'DTSTART':
            currentEvent.dtstart = value;
            break;
          case 'DTEND':
            currentEvent.dtend = value;
            break;
        }
      }
    }
  }

  if (events.length === 0) {
    throw new Error(
      'No events found in the ICS file. Make sure you uploaded a valid calendar file.'
    );
  }

  return events;
}
