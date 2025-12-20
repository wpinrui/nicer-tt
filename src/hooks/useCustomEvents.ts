import { useCallback, useMemo, useState } from 'react';

import type { CustomEvent, CustomEventsStore, TimetableEvent } from '../types';
import { STORAGE_KEYS, TIMETABLE_YEAR } from '../utils/constants';
import { logError } from '../utils/errors';
import { generateId } from '../utils/id';

/**
 * Migrate date from DD/MM format to YYYY-MM-DD format.
 * Returns original if already in ISO format.
 */
function migrateDateFormat(dateStr: string): string {
  if (dateStr.includes('/')) {
    // Old DD/MM format - convert to YYYY-MM-DD
    const [day, month] = dateStr.split('/');
    return `${TIMETABLE_YEAR}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Already in YYYY-MM-DD format
  return dateStr;
}

/**
 * Migrate custom events store from old DD/MM format to YYYY-MM-DD format.
 */
function migrateCustomEventsStore(store: CustomEventsStore): CustomEventsStore {
  let needsMigration = false;

  // Check if any dates need migration
  for (const events of Object.values(store)) {
    for (const event of events) {
      if (event.dates?.some((d) => d.includes('/'))) {
        needsMigration = true;
        break;
      }
    }
    if (needsMigration) break;
  }

  if (!needsMigration) return store;

  // Migrate all dates
  const migrated: CustomEventsStore = {};
  for (const [timetableId, events] of Object.entries(store)) {
    migrated[timetableId] = events.map((event) => ({
      ...event,
      dates: event.dates.map(migrateDateFormat),
    }));
  }

  // Save migrated store
  localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(migrated));

  return migrated;
}

/**
 * Loads custom events from localStorage.
 */
function loadCustomEventsStore(): CustomEventsStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    if (stored) {
      const data = JSON.parse(stored);
      if (typeof data === 'object' && data !== null) {
        return migrateCustomEventsStore(data);
      }
    }
  } catch (e) {
    logError('useCustomEvents:loadCustomEventsStore', e);
  }
  return {};
}

/**
 * Saves custom events store to localStorage.
 */
function saveCustomEventsStore(store: CustomEventsStore): void {
  const hasAnyEvents = Object.values(store).some((events) => events.length > 0);
  if (hasAnyEvents) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(store));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_EVENTS);
  }
}

/**
 * Input for creating a new custom event.
 * Omits auto-generated fields (id, createdAt, updatedAt).
 */
export type CustomEventInput = Omit<CustomEvent, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Converts a CustomEvent to CustomEventInput by stripping auto-generated fields.
 * Useful when importing/copying events between timetables.
 */
export function toCustomEventInput(event: CustomEvent): CustomEventInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = event;
  return input;
}

/**
 * Input for updating a custom event.
 * All fields are optional except we need to preserve TimetableEvent structure.
 */
export type CustomEventUpdate = Partial<TimetableEvent>;

/**
 * Hook for managing custom events with localStorage persistence.
 *
 * Custom events are stored per-timetable to maintain isolation.
 * Each custom event gets a unique ID and timestamps for creation/update.
 *
 * @param activeTimetableId - The ID of the currently active timetable
 * @returns Custom events state and CRUD operations
 */
export function useCustomEvents(activeTimetableId: string | null) {
  const [store, setStore] = useState<CustomEventsStore>(loadCustomEventsStore);

  // Custom events for the active timetable (memoized to stabilize useCallback deps)
  const customEvents = useMemo(
    () => (activeTimetableId ? store[activeTimetableId] || [] : []),
    [activeTimetableId, store]
  );

  /**
   * Adds a new custom event to a specific timetable.
   * Use this when the timetable ID is known but may not be the active one yet.
   * @returns The ID of the newly created custom event
   */
  const addCustomEventToTimetable = useCallback(
    (timetableId: string, input: CustomEventInput): string => {
      const id = generateId('ce');
      const now = Date.now();
      const newEvent: CustomEvent = {
        ...input,
        id,
        createdAt: now,
        updatedAt: now,
      };

      setStore((prev) => {
        const timetableEvents = prev[timetableId] || [];
        const updated: CustomEventsStore = {
          ...prev,
          [timetableId]: [...timetableEvents, newEvent],
        };
        saveCustomEventsStore(updated);
        return updated;
      });

      return id;
    },
    []
  );

  /**
   * Adds a new custom event to the active timetable.
   * @returns The ID of the newly created custom event
   */
  const addCustomEvent = useCallback(
    (input: CustomEventInput): string => {
      if (!activeTimetableId) {
        throw new Error('Cannot add custom event without an active timetable');
      }
      return addCustomEventToTimetable(activeTimetableId, input);
    },
    [activeTimetableId, addCustomEventToTimetable]
  );

  /**
   * Updates an existing custom event.
   */
  const updateCustomEvent = useCallback(
    (id: string, updates: CustomEventUpdate): void => {
      if (!activeTimetableId) {
        return;
      }

      setStore((prev) => {
        const timetableEvents = prev[activeTimetableId] || [];
        const eventIndex = timetableEvents.findIndex((e) => e.id === id);
        if (eventIndex === -1) {
          return prev;
        }

        const updatedEvents = [...timetableEvents];
        updatedEvents[eventIndex] = {
          ...updatedEvents[eventIndex],
          ...updates,
          updatedAt: Date.now(),
        };

        const updated: CustomEventsStore = {
          ...prev,
          [activeTimetableId]: updatedEvents,
        };
        saveCustomEventsStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Deletes a custom event.
   */
  const deleteCustomEvent = useCallback(
    (id: string): void => {
      if (!activeTimetableId) {
        return;
      }

      setStore((prev) => {
        const timetableEvents = prev[activeTimetableId] || [];
        const updated: CustomEventsStore = {
          ...prev,
          [activeTimetableId]: timetableEvents.filter((e) => e.id !== id),
        };
        saveCustomEventsStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Gets a custom event by ID.
   */
  const getCustomEvent = useCallback(
    (id: string): CustomEvent | null => {
      return customEvents.find((e) => e.id === id) || null;
    },
    [customEvents]
  );

  /**
   * Gets all custom events for a specific timetable.
   */
  const getCustomEventsForTimetable = useCallback(
    (timetableId: string): CustomEvent[] => {
      return store[timetableId] || [];
    },
    [store]
  );

  /**
   * Deletes all custom events for a timetable.
   * Useful when a timetable is deleted.
   */
  const deleteCustomEventsForTimetable = useCallback((timetableId: string): void => {
    setStore((prev) => {
      if (!prev[timetableId]) {
        return prev;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [timetableId]: _removed, ...rest } = prev;
      saveCustomEventsStore(rest);
      return rest;
    });
  }, []);

  return {
    customEvents,
    addCustomEvent,
    addCustomEventToTimetable,
    updateCustomEvent,
    deleteCustomEvent,
    getCustomEvent,
    getCustomEventsForTimetable,
    deleteCustomEventsForTimetable,
  };
}
