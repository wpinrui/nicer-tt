import pako from 'pako';

import type { CustomEvent, ShareData, ShareDataV2, TimetableEvent } from '../types';
import { migrateDateFormat } from './dateMigration';
import { logError } from './errors';

/**
 * Migrate event dates from legacy DD/MM format to YYYY-MM-DD.
 * Applied when decoding share links to handle old format compatibility.
 */
function migrateEventDates(events: TimetableEvent[]): TimetableEvent[] {
  return events.map((event) => ({
    ...event,
    dates: event.dates.map(migrateDateFormat),
  }));
}

/**
 * Migrate custom event dates from legacy DD/MM format to YYYY-MM-DD.
 */
function migrateCustomEventDates(events: CustomEvent[]): CustomEvent[] {
  return events.map((event) => ({
    ...event,
    dates: event.dates.map(migrateDateFormat),
  }));
}

/**
 * Apply date migration to decoded share data.
 * Handles both V1 and V2 formats.
 */
function migrateShareData(data: ShareData): ShareData {
  const migratedEvents = migrateEventDates(data.events);

  if ('version' in data && data.version === 2) {
    return {
      ...data,
      events: migratedEvents,
      customEvents: migrateCustomEventDates(data.customEvents),
    };
  }

  return {
    ...data,
    events: migratedEvents,
  };
}

// URL-safe base64 encoding
export function toUrlSafeBase64(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromUrlSafeBase64(str: string): Uint8Array {
  // Restore standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes share data to a URL-safe base64 string.
 * Uses V2 format when customEvents are provided, V1 otherwise for compatibility.
 */
export function encodeShareData(
  events: TimetableEvent[],
  fileName: string,
  customEvents?: CustomEvent[]
): string {
  const data: ShareData =
    customEvents && customEvents.length > 0
      ? { version: 2, events, customEvents, fileName }
      : { events, fileName };
  const compressed = pako.deflate(JSON.stringify(data));
  return toUrlSafeBase64(compressed);
}

/**
 * Decodes share data from a URL-safe base64 string.
 * Handles both V1 (legacy) and V2 formats.
 * Migrates dates from old DD/MM format to YYYY-MM-DD for compatibility.
 */
export function decodeShareData(encoded: string): ShareData | null {
  // Try compressed format first (new)
  try {
    const bytes = fromUrlSafeBase64(encoded);
    const decompressed = pako.inflate(bytes, { to: 'string' });
    const data = JSON.parse(decompressed) as ShareData;
    return migrateShareData(data);
  } catch {
    // Fall back to legacy uncompressed format
    try {
      const raw = decodeURIComponent(atob(encoded));
      const data = JSON.parse(raw) as ShareData;
      return migrateShareData(data);
    } catch (e) {
      // Log only if both formats fail (user provided invalid share data)
      logError('decodeShareData', e, { encoded: encoded.substring(0, 50) + '...' });
      return null;
    }
  }
}

// Helper to decode a full share URL (extracts the hash and decodes)
export function decodeShareUrl(url: string): ShareData | null {
  const hashIndex = url.indexOf('#share=');
  if (hashIndex === -1) return null;
  const encoded = url.substring(hashIndex + 7);
  return decodeShareData(encoded);
}

// Re-export types for convenience
export type { ShareData, ShareDataV2 };
