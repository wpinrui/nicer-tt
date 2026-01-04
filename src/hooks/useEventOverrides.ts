import { useCallback, useMemo, useState } from 'react';

import type { EventInstanceKey, EventOverride, EventOverridesStore } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { logError } from '../utils/errors';

/**
 * Loads event overrides from localStorage.
 */
function loadEventOverridesStore(): EventOverridesStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENT_OVERRIDES);
    if (stored) {
      const data = JSON.parse(stored);
      if (typeof data === 'object' && data !== null) {
        return data;
      }
    }
  } catch (e) {
    logError('useEventOverrides:loadEventOverridesStore', e);
  }
  return {};
}

/**
 * Saves event overrides store to localStorage.
 */
function saveEventOverridesStore(store: EventOverridesStore): void {
  const hasAnyData = Object.values(store).some(
    (data) => Object.keys(data.overrides).length > 0 || data.deletions.length > 0
  );
  if (hasAnyData) {
    localStorage.setItem(STORAGE_KEYS.EVENT_OVERRIDES, JSON.stringify(store));
  } else {
    localStorage.removeItem(STORAGE_KEYS.EVENT_OVERRIDES);
  }
}

/**
 * Gets or creates the store entry for a timetable.
 */
function getOrCreateEntry(
  store: EventOverridesStore,
  timetableId: string
): { overrides: Record<EventInstanceKey, EventOverride>; deletions: EventInstanceKey[] } {
  return store[timetableId] || { overrides: {}, deletions: [] };
}

/**
 * Hook for managing event overrides and deletions with localStorage persistence.
 *
 * Event overrides allow users to modify imported events (e.g., change venue).
 * Deletions track which imported events have been removed.
 * Both are stored per-timetable for isolation.
 *
 * @param activeTimetableId - The ID of the currently active timetable
 * @returns Event override state and operations
 */
export function useEventOverrides(activeTimetableId: string | null) {
  const [store, setStore] = useState<EventOverridesStore>(loadEventOverridesStore);

  // Overrides and deletions for the active timetable
  const { overrides, deletions } = useMemo(() => {
    if (!activeTimetableId) {
      return {
        overrides: {} as Record<EventInstanceKey, EventOverride>,
        deletions: [] as EventInstanceKey[],
      };
    }
    const entry = store[activeTimetableId];
    return entry || { overrides: {}, deletions: [] };
  }, [activeTimetableId, store]);

  /**
   * Sets or updates an override for an event.
   */
  const setOverride = useCallback(
    (eventKey: EventInstanceKey, override: Omit<EventOverride, 'updatedAt'>): void => {
      if (!activeTimetableId) return;

      setStore((prev) => {
        const entry = getOrCreateEntry(prev, activeTimetableId);
        const existingOverride = entry.overrides[eventKey] || {};
        const updated: EventOverridesStore = {
          ...prev,
          [activeTimetableId]: {
            ...entry,
            overrides: {
              ...entry.overrides,
              [eventKey]: {
                ...existingOverride, // Preserve existing override fields
                ...override, // Apply new changes
                updatedAt: Date.now(),
              },
            },
          },
        };
        saveEventOverridesStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Removes an override for an event (restores original).
   */
  const clearOverride = useCallback(
    (eventKey: EventInstanceKey): void => {
      if (!activeTimetableId) return;

      setStore((prev) => {
        const entry = getOrCreateEntry(prev, activeTimetableId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [eventKey]: _removed, ...restOverrides } = entry.overrides;
        const updated: EventOverridesStore = {
          ...prev,
          [activeTimetableId]: {
            ...entry,
            overrides: restOverrides,
          },
        };
        saveEventOverridesStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Marks an event as deleted.
   */
  const deleteEvent = useCallback(
    (eventKey: EventInstanceKey): void => {
      if (!activeTimetableId) return;

      setStore((prev) => {
        const entry = getOrCreateEntry(prev, activeTimetableId);
        if (entry.deletions.includes(eventKey)) return prev;

        // Also remove any override for this event
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [eventKey]: _removed, ...restOverrides } = entry.overrides;

        const updated: EventOverridesStore = {
          ...prev,
          [activeTimetableId]: {
            overrides: restOverrides,
            deletions: [...entry.deletions, eventKey],
          },
        };
        saveEventOverridesStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Restores a deleted event.
   */
  const restoreEvent = useCallback(
    (eventKey: EventInstanceKey): void => {
      if (!activeTimetableId) return;

      setStore((prev) => {
        const entry = getOrCreateEntry(prev, activeTimetableId);
        const updated: EventOverridesStore = {
          ...prev,
          [activeTimetableId]: {
            ...entry,
            deletions: entry.deletions.filter((k) => k !== eventKey),
          },
        };
        saveEventOverridesStore(updated);
        return updated;
      });
    },
    [activeTimetableId]
  );

  /**
   * Checks if an event is deleted.
   */
  const isDeleted = useCallback(
    (eventKey: EventInstanceKey): boolean => {
      return deletions.includes(eventKey);
    },
    [deletions]
  );

  /**
   * Gets the override for an event (if any).
   */
  const getOverride = useCallback(
    (eventKey: EventInstanceKey): EventOverride | null => {
      return overrides[eventKey] || null;
    },
    [overrides]
  );

  /**
   * Clears all overrides and deletions for a timetable.
   * Useful when regenerating a timetable.
   */
  const clearAllForTimetable = useCallback((timetableId: string): void => {
    setStore((prev) => {
      if (!prev[timetableId]) return prev;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [timetableId]: _removed, ...rest } = prev;
      saveEventOverridesStore(rest);
      return rest;
    });
  }, []);

  /**
   * Gets count of overrides and deletions for the active timetable.
   */
  const counts = useMemo(() => {
    return {
      overrides: Object.keys(overrides).length,
      deletions: deletions.length,
    };
  }, [overrides, deletions]);

  return {
    overrides,
    deletions,
    setOverride,
    clearOverride,
    deleteEvent,
    restoreEvent,
    isDeleted,
    getOverride,
    clearAllForTimetable,
    counts,
  };
}
