import { useState, useCallback } from 'react';
import type { TimetableEvent, Timetable } from '../types';
import { useLocalStorageJson } from './useLocalStorage';
import { STORAGE_KEYS, DEFAULT_TIMETABLE_NAMES } from '../utils/constants';
import { generateId } from '../utils/id';
import { logError } from '../utils/errors';

/**
 * Gets the next available default name for a new timetable.
 */
function getNextAvailableName(timetables: Timetable[]): string {
  const usedNames = new Set(timetables.map((t) => t.name));

  for (const name of DEFAULT_TIMETABLE_NAMES) {
    if (!usedNames.has(name)) {
      return name;
    }
  }

  // Fallback if all default names are used
  let i = DEFAULT_TIMETABLE_NAMES.length + 1;
  while (usedNames.has(`Timetable ${i}`)) {
    i++;
  }
  return `Timetable ${i}`;
}

/**
 * Loads timetables from localStorage with legacy migration support.
 * Migrates from single-timetable format if needed.
 */
function loadInitialTimetables(): Timetable[] {
  try {
    // Try new format first
    const stored = localStorage.getItem(STORAGE_KEYS.TIMETABLES_DATA);
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data)) {
        return data;
      }
    }

    // Migrate from legacy single-timetable format
    const legacy = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
    if (legacy) {
      const data = JSON.parse(legacy);
      if (data.events && Array.isArray(data.events)) {
        const migrated: Timetable[] = [
          {
            id: generateId('tt'),
            name: 'My Timetable',
            events: data.events,
            fileName: data.fileName || null,
            isPrimary: true,
          },
        ];
        localStorage.setItem(STORAGE_KEYS.TIMETABLES_DATA, JSON.stringify(migrated));
        localStorage.removeItem(STORAGE_KEYS.TIMETABLE_DATA);
        return migrated;
      }
    }
  } catch (e) {
    logError('useTimetableStorage:loadInitialTimetables', e);
  }
  return [];
}

/**
 * Saves timetables array to localStorage.
 * Removes the key if array is empty.
 */
function saveTimetables(timetables: Timetable[]): void {
  if (timetables.length > 0) {
    localStorage.setItem(STORAGE_KEYS.TIMETABLES_DATA, JSON.stringify(timetables));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMETABLES_DATA);
  }
}

/**
 * Hook for managing multiple timetables with localStorage persistence.
 *
 * Features:
 * - Multi-timetable support with primary/secondary distinction
 * - Active timetable selection
 * - Legacy format migration (automatic on first load)
 * - Backward-compatible API for single-timetable operations
 *
 * @returns Timetable state and CRUD operations
 */
export function useTimetableStorage() {
  const [timetables, setTimetablesState] = useState<Timetable[]>(loadInitialTimetables);
  const [activeTimetableId, setActiveTimetableIdState] = useLocalStorageJson<string | null>(
    STORAGE_KEYS.ACTIVE_TIMETABLE,
    null
  );

  // Derived state
  const primaryTimetable = timetables.find((t) => t.isPrimary) || null;
  const activeTimetable =
    (activeTimetableId && timetables.find((t) => t.id === activeTimetableId)) || primaryTimetable;
  const events = activeTimetable?.events || null;
  const fileName = activeTimetable?.fileName || null;

  /**
   * Sets or updates the primary timetable (backward-compatible API).
   * Pass null to clear the primary timetable.
   */
  const setTimetable = useCallback(
    (newEvents: TimetableEvent[] | null, newFileName: string | null) => {
      setTimetablesState((prev) => {
        let updated: Timetable[];

        if (newEvents === null) {
          updated = prev.filter((t) => !t.isPrimary);
        } else {
          const primaryIndex = prev.findIndex((t) => t.isPrimary);
          if (primaryIndex >= 0) {
            updated = [...prev];
            updated[primaryIndex] = {
              ...updated[primaryIndex],
              events: newEvents,
              fileName: newFileName,
            };
          } else {
            updated = [
              {
                id: generateId('tt'),
                name: 'My Timetable',
                events: newEvents,
                fileName: newFileName,
                isPrimary: true,
              },
              ...prev,
            ];
          }
        }

        saveTimetables(updated);
        return updated;
      });
    },
    []
  );

  /** Clears the primary timetable */
  const clearTimetable = useCallback(() => {
    setTimetable(null, null);
  }, [setTimetable]);

  /**
   * Adds a new non-primary timetable.
   * @returns The ID of the newly created timetable
   */
  const addTimetable = useCallback(
    (newEvents: TimetableEvent[], newFileName: string | null, customName?: string): string => {
      const id = generateId('tt');
      setTimetablesState((prev) => {
        const name = customName || getNextAvailableName(prev);
        const newTimetable: Timetable = {
          id,
          name,
          events: newEvents,
          fileName: newFileName,
          isPrimary: false,
        };
        const updated = [...prev, newTimetable];
        saveTimetables(updated);
        return updated;
      });
      return id;
    },
    []
  );

  /** Renames a timetable */
  const renameTimetable = useCallback((id: string, newName: string) => {
    setTimetablesState((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, name: newName } : t));
      saveTimetables(updated);
      return updated;
    });
  }, []);

  /**
   * Deletes a timetable by ID.
   * If the active timetable is deleted, switches to primary or first available.
   * @returns true if deletion occurred
   */
  const deleteTimetable = useCallback(
    (id: string): boolean => {
      let deleted = false;
      setTimetablesState((prev) => {
        const timetable = prev.find((t) => t.id === id);
        if (!timetable) {
          return prev;
        }
        deleted = true;
        const updated = prev.filter((t) => t.id !== id);
        saveTimetables(updated);

        // Reset active if deleted
        if (id === activeTimetableId) {
          const nextActive = updated.find((t) => t.isPrimary) || updated[0] || null;
          setActiveTimetableIdState(nextActive?.id || null);
        }

        return updated;
      });
      return deleted;
    },
    [activeTimetableId, setActiveTimetableIdState]
  );

  /** Sets the active timetable being viewed */
  const setActiveTimetable = useCallback(
    (id: string) => {
      setActiveTimetableIdState(id);
    },
    [setActiveTimetableIdState]
  );

  /** Gets a timetable by ID */
  const getTimetable = useCallback(
    (id: string): Timetable | null => {
      return timetables.find((t) => t.id === id) || null;
    },
    [timetables]
  );

  /** Gets the next available default name (for UI preview) */
  const getNextName = useCallback((): string => {
    return getNextAvailableName(timetables);
  }, [timetables]);

  return {
    // Legacy API (backward compatible)
    events,
    fileName,
    setTimetable,
    clearTimetable,

    // Multi-timetable API
    timetables,
    primaryTimetable,
    activeTimetable,
    setActiveTimetable,
    addTimetable,
    renameTimetable,
    deleteTimetable,
    getTimetable,
    getNextName,
  };
}
