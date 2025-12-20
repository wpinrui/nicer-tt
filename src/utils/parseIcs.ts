import type { CustomEvent, CustomEventType, TimetableEvent } from '../types';

export interface ParseIcsResult {
  events: TimetableEvent[];
  customEvents: CustomEvent[];
}

function unescapeIcsText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseIcsDateTime(dtString: string): { date: string; time: string } {
  // Parse "20260112T083000" -> { date: "2026-01-12", time: "0830" }
  const match = dtString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!match) {
    throw new Error(`Invalid ICS datetime format: ${dtString}`);
  }
  const [, year, month, day, hours, minutes] = match;
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}${minutes}`,
  };
}

function getDayName(dateStr: string): string {
  // Parse YYYY-MM-DD format
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

interface ParsedEvent {
  summary: string;
  location: string;
  description: string;
  dtstart: string;
  dtend: string;
  eventType?: CustomEventType;
  courseName?: string;
  groupId?: string;
}

/**
 * Parse ICS content and return both regular events and custom events.
 * Custom events are identified by X-NIE-EVENT-TYPE property.
 */
export function parseIcs(icsContent: string): ParseIcsResult {
  const events: TimetableEvent[] = [];
  const customEventMap = new Map<string, CustomEvent>();

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
  let currentEvent: Partial<ParsedEvent> = {};

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

        // Check if this is a custom event (has X-NIE-EVENT-TYPE)
        if (currentEvent.eventType) {
          // Group custom events by their properties (to consolidate multiple dates)
          const key = `${currentEvent.eventType}|${currentEvent.courseName || ''}|${start.time}|${end.time}|${currentEvent.location || ''}|${tutor}`;

          if (customEventMap.has(key)) {
            // Add date to existing custom event
            const existing = customEventMap.get(key)!;
            if (!existing.dates.includes(start.date)) {
              existing.dates.push(start.date);
              existing.dates.sort();
            }
          } else {
            // Create new custom event
            customEventMap.set(key, {
              id: generateId(),
              course,
              group,
              day: getDayName(start.date),
              startTime: start.time,
              endTime: end.time,
              dates: [start.date],
              venue: currentEvent.location || '',
              tutor,
              eventType: currentEvent.eventType,
              description: currentEvent.courseName || '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              groupId: currentEvent.groupId,
            });
          }
        } else {
          // Regular event
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
          case 'X-NIE-EVENT-TYPE':
            if (value === 'custom' || value === 'upgrading') {
              currentEvent.eventType = value;
            }
            break;
          case 'X-NIE-COURSE-NAME':
            currentEvent.courseName = value;
            break;
          case 'X-NIE-GROUP-ID':
            currentEvent.groupId = value;
            break;
        }
      }
    }
  }

  const customEvents = Array.from(customEventMap.values());

  if (events.length === 0 && customEvents.length === 0) {
    throw new Error(
      'No events found in the ICS file. Make sure you uploaded a valid calendar file.'
    );
  }

  return { events, customEvents };
}
