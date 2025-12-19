import { useState, useCallback } from 'react';
import type { TimetableEvent, Timetable } from '../types';
import { STORAGE_KEYS, DEFAULT_TIMETABLE_NAMES } from '../utils/constants';
import { generateId } from '../utils/id';
import { logError } from '../utils/errors';

function getNextAvailableName(timetables: Timetable[]): string {
  const usedNames = new Set(timetables.map(t => t.name));

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

function loadFromStorage(): Timetable[] {
  try {
    // Try new format first
    const stored = localStorage.getItem(STORAGE_KEYS.TIMETABLES_DATA);
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data)) {
        return data;
      }
    }

    // Migrate from legacy format
    const legacy = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
    if (legacy) {
      const data = JSON.parse(legacy);
      if (data.events && Array.isArray(data.events)) {
        const migrated: Timetable[] = [{
          id: generateId('tt'),
          name: 'My Timetable',
          events: data.events,
          fileName: data.fileName || null,
          isPrimary: true,
        }];
        // Save in new format and clear legacy
        localStorage.setItem(STORAGE_KEYS.TIMETABLES_DATA, JSON.stringify(migrated));
        localStorage.removeItem(STORAGE_KEYS.TIMETABLE_DATA);
        return migrated;
      }
    }
  } catch (e) {
    logError('useTimetableStorage:loadFromStorage', e);
  }
  return [];
}

function saveToStorage(timetables: Timetable[]): void {
  if (timetables.length > 0) {
    localStorage.setItem(STORAGE_KEYS.TIMETABLES_DATA, JSON.stringify(timetables));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMETABLES_DATA);
  }
}

function loadActiveId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMETABLE);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    logError('useTimetableStorage:loadActiveId', e);
    return null;
  }
}

function saveActiveId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMETABLE, JSON.stringify(id));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMETABLE);
  }
}

export function useTimetableStorage() {
  const [timetables, setTimetablesState] = useState<Timetable[]>(loadFromStorage);
  const [activeTimetableId, setActiveTimetableIdState] = useState<string | null>(loadActiveId);

  // Get primary timetable (for backward compatibility)
  const primaryTimetable = timetables.find(t => t.isPrimary) || null;

  // Get active timetable (defaults to primary if not set or invalid)
  const activeTimetable = (activeTimetableId && timetables.find(t => t.id === activeTimetableId))
    || primaryTimetable;

  // Events and fileName now come from the active timetable (not necessarily primary)
  const events = activeTimetable?.events || null;
  const fileName = activeTimetable?.fileName || null;

  // Set or update the primary timetable (backward compatible API)
  const setTimetable = useCallback((newEvents: TimetableEvent[] | null, newFileName: string | null) => {
    setTimetablesState(prev => {
      let updated: Timetable[];

      if (newEvents === null) {
        // Clear primary timetable
        updated = prev.filter(t => !t.isPrimary);
      } else {
        const primaryIndex = prev.findIndex(t => t.isPrimary);
        if (primaryIndex >= 0) {
          // Update existing primary
          updated = [...prev];
          updated[primaryIndex] = {
            ...updated[primaryIndex],
            events: newEvents,
            fileName: newFileName,
          };
        } else {
          // Create new primary
          updated = [{
            id: generateId('tt'),
            name: 'My Timetable',
            events: newEvents,
            fileName: newFileName,
            isPrimary: true,
          }, ...prev];
        }
      }

      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearTimetable = useCallback(() => {
    setTimetable(null, null);
  }, [setTimetable]);

  // Add a new (non-primary) timetable
  const addTimetable = useCallback((newEvents: TimetableEvent[], newFileName: string | null, customName?: string): string => {
    const id = generateId('tt');
    setTimetablesState(prev => {
      const name = customName || getNextAvailableName(prev);
      const newTimetable: Timetable = {
        id,
        name,
        events: newEvents,
        fileName: newFileName,
        isPrimary: false,
      };
      const updated = [...prev, newTimetable];
      saveToStorage(updated);
      return updated;
    });
    return id;
  }, []);

  // Rename a timetable
  const renameTimetable = useCallback((id: string, newName: string) => {
    setTimetablesState(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, name: newName } : t
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Delete a timetable (now allows deleting primary too)
  const deleteTimetable = useCallback((id: string): boolean => {
    let deleted = false;
    setTimetablesState(prev => {
      const timetable = prev.find(t => t.id === id);
      if (!timetable) {
        return prev;
      }
      deleted = true;
      const updated = prev.filter(t => t.id !== id);
      saveToStorage(updated);

      // If deleting the active timetable, reset to primary (or first available)
      if (id === activeTimetableId) {
        const nextActive = updated.find(t => t.isPrimary) || updated[0] || null;
        setActiveTimetableIdState(nextActive?.id || null);
        saveActiveId(nextActive?.id || null);
      }

      return updated;
    });
    return deleted;
  }, [activeTimetableId]);

  // Set the active timetable being viewed
  // Note: No validation - allows setting ID immediately after addTimetable before state updates.
  // The activeTimetable derivation handles invalid IDs gracefully by falling back to primary.
  const setActiveTimetable = useCallback((id: string) => {
    setActiveTimetableIdState(id);
    saveActiveId(id);
  }, []);

  // Get a specific timetable by ID
  const getTimetable = useCallback((id: string): Timetable | null => {
    return timetables.find(t => t.id === id) || null;
  }, [timetables]);

  // Get next available name (for UI preview)
  const getNextName = useCallback((): string => {
    return getNextAvailableName(timetables);
  }, [timetables]);

  return {
    // Legacy API (backward compatible)
    events,
    fileName,
    setTimetable,
    clearTimetable,

    // New multi-timetable API
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
