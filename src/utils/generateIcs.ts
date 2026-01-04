import type { CustomEventType, EventInstanceKey, EventOverride, TimetableEvent } from '../types';
import { createEventInstanceKey } from '../types';

// Check if event has custom event properties
function isCustomEvent(event: TimetableEvent): event is TimetableEvent & {
  eventType: CustomEventType;
  description?: string;
  groupId?: string;
} {
  return 'eventType' in event && (event.eventType === 'custom' || event.eventType === 'upgrading');
}

function formatTimeForIcs(time: string): string {
  return time.padEnd(6, '0');
}

/**
 * Parse YYYY-MM-DD date string to Date object.
 */
function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateForIcs(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}T${formatTimeForIcs(time)}`;
}

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@nie-timetable`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Options for ICS generation with event overrides.
 */
export interface GenerateIcsOptions {
  /** Overrides for imported events (keyed by EventInstanceKey) */
  overrides?: Record<EventInstanceKey, EventOverride>;
  /** Deleted event instance keys to exclude from export */
  deletions?: EventInstanceKey[];
}

export function generateIcs(events: TimetableEvent[], options: GenerateIcsOptions = {}): string {
  const { overrides = {}, deletions = [] } = options;
  const icsEvents: string[] = [];

  for (const event of events) {
    const isCustom = isCustomEvent(event);

    for (const dateStr of event.dates) {
      // For imported events, check if deleted or has overrides
      let startTime = event.startTime;
      let endTime = event.endTime;
      let venue = event.venue;
      let tutor = event.tutor;

      if (!isCustom) {
        const eventKey = createEventInstanceKey(
          event.course,
          event.group,
          dateStr,
          event.startTime
        );

        // Skip deleted events
        if (deletions.includes(eventKey)) {
          continue;
        }

        // Apply overrides
        const override = overrides[eventKey];
        if (override) {
          if (override.startTime !== undefined) startTime = override.startTime;
          if (override.endTime !== undefined) endTime = override.endTime;
          if (override.venue !== undefined) venue = override.venue;
          if (override.tutor !== undefined) tutor = override.tutor;
        }
      }

      const date = parseIsoDate(dateStr);
      const summary = `${event.course} - ${event.group}`;
      const location = venue;
      const description = tutor ? `Tutor: ${tutor}` : '';

      const dtstart = formatDateForIcs(date, startTime);
      const dtend = formatDateForIcs(date, endTime);
      const uid = generateUid();
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      // Build event lines
      const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `LOCATION:${escapeIcsText(location)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
      ];

      // Add custom event metadata as X- properties
      if (isCustom) {
        lines.push(`X-NIE-EVENT-TYPE:${event.eventType}`);
        if (event.description) {
          lines.push(`X-NIE-COURSE-NAME:${escapeIcsText(event.description)}`);
        }
        if (event.groupId) {
          lines.push(`X-NIE-GROUP-ID:${event.groupId}`);
        }
      }

      lines.push('END:VEVENT');
      icsEvents.push(lines.join('\n'));
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

/**
 * Generates a timestamped filename for the .ics download.
 * Format: nie-timetable-YYYY-MM-DD.ics
 */
function generateIcsFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `nie-timetable-${year}-${month}-${day}.ics`;
}

export function downloadIcs(icsContent: string, filename?: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? generateIcsFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
