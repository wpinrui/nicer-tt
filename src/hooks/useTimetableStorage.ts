import { useState, useCallback } from 'react';
import type { TimetableEvent } from '../utils/parseHtml';
import { STORAGE_KEYS } from '../utils/constants';

interface TimetableData {
  events: TimetableEvent[] | null;
  fileName: string | null;
}

function loadFromStorage(): TimetableData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
    if (stored) {
      const data = JSON.parse(stored);
      return { events: data.events, fileName: data.fileName };
    }
  } catch {
    // Ignore parse errors
  }
  return { events: null, fileName: null };
}

function saveToStorage(events: TimetableEvent[] | null, fileName: string | null): void {
  if (events && fileName) {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE_DATA, JSON.stringify({ events, fileName }));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMETABLE_DATA);
  }
}

export function useTimetableStorage() {
  const [data, setData] = useState<TimetableData>(loadFromStorage);

  const setTimetable = useCallback((events: TimetableEvent[] | null, fileName: string | null) => {
    setData({ events, fileName });
    saveToStorage(events, fileName);
  }, []);

  const clearTimetable = useCallback(() => {
    setData({ events: null, fileName: null });
    saveToStorage(null, null);
  }, []);

  return {
    events: data.events,
    fileName: data.fileName,
    setTimetable,
    clearTimetable,
  };
}
