import { useEffect, useRef } from 'react';

import cohortEventsData from '../data/cohort-events.json';
import type { CohortEventDefinition, CohortEventsData, CustomEventType } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { logError } from '../utils/errors';
import type { CustomEventInput } from './useCustomEvents';

/**
 * Storage format for tracking synced cohort events per timetable.
 */
interface SyncedCohortEventsStore {
  [timetableId: string]: string[]; // Array of synced cohort event IDs
}

/**
 * Loads synced cohort events from localStorage.
 */
function loadSyncedCohortEvents(): SyncedCohortEventsStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SYNCED_COHORT_EVENTS);
    if (stored) {
      const data = JSON.parse(stored);
      if (typeof data === 'object' && data !== null) {
        return data;
      }
    }
  } catch (e) {
    logError('useCohortEvents:loadSyncedCohortEvents', e);
  }
  return {};
}

/**
 * Saves synced cohort events to localStorage.
 */
function saveSyncedCohortEvents(store: SyncedCohortEventsStore): void {
  const hasAnyEvents = Object.values(store).some((ids) => ids.length > 0);
  if (hasAnyEvents) {
    localStorage.setItem(STORAGE_KEYS.SYNCED_COHORT_EVENTS, JSON.stringify(store));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SYNCED_COHORT_EVENTS);
  }
}

/**
 * Converts a cohort event definition to a custom event input.
 */
function cohortEventToCustomEventInput(event: CohortEventDefinition): CustomEventInput {
  // Convert HH:MM to HHMM format
  const startTime = event.startTime.replace(':', '');
  const endTime = event.endTime.replace(':', '');

  // Get day of week from date
  const date = new Date(event.date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[date.getDay()];

  return {
    course: '', // Will show "Cohort" badge instead
    group: 'Cohort',
    day,
    startTime,
    endTime,
    dates: [event.date],
    venue: event.venue || '',
    tutor: event.notes || '',
    eventType: 'cohort' as CustomEventType,
    description: event.title,
    groupId: `cohort-${event.id}`, // Use cohort- prefix to identify cohort events
  };
}

/**
 * Hook that syncs cohort events from the JSON file to custom events.
 *
 * When a timetable is active:
 * 1. Checks which cohort events haven't been synced yet
 * 2. Adds missing events as custom events
 * 3. Tracks synced events so they don't get re-added
 *
 * Users can edit/delete these events like any custom event.
 * Deleted events won't be re-added (tracked by ID).
 *
 * @param activeTimetableId - The ID of the currently active timetable
 * @param addCustomEvent - Function to add custom events
 */
export function useCohortEvents(
  activeTimetableId: string | null,
  addCustomEvent: (input: CustomEventInput) => string
) {
  // Track if we've already synced for this timetable in this render
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeTimetableId) return;

    // Don't sync again if we've already synced for this timetable
    if (syncedRef.current === activeTimetableId) return;

    const data = cohortEventsData as CohortEventsData;
    if (!data.events || data.events.length === 0) return;

    // Load synced events
    const syncedStore = loadSyncedCohortEvents();
    const syncedIds = syncedStore[activeTimetableId] || [];

    // Find events that haven't been synced
    const unsyncedEvents = data.events.filter((event) => !syncedIds.includes(event.id));

    if (unsyncedEvents.length === 0) {
      syncedRef.current = activeTimetableId;
      return;
    }

    // Add unsynced events as custom events
    const newSyncedIds = [...syncedIds];
    for (const event of unsyncedEvents) {
      const input = cohortEventToCustomEventInput(event);
      addCustomEvent(input);
      newSyncedIds.push(event.id);
    }

    // Save synced events
    const updatedStore: SyncedCohortEventsStore = {
      ...syncedStore,
      [activeTimetableId]: newSyncedIds,
    };
    saveSyncedCohortEvents(updatedStore);

    syncedRef.current = activeTimetableId;
  }, [activeTimetableId, addCustomEvent]);
}
