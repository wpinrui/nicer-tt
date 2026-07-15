import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CustomEvent, TimetableEvent } from '../types';
import { hasFutureEvents, withOldSuffix } from './staleTimetable';

/**
 * `hasFutureEvents` is the entire nudge trigger: a timetable is "stale" (and the
 * Semester 2 nudge / empty-state should show) precisely when it has NO future
 * events. These tests lock that boundary against the same comparison the past-date
 * filter uses in `useFilteredGroupedEvents` (`dateStr >= getTodaySortKey()`).
 *
 * "Today" is pinned so the suite is deterministic regardless of when it runs.
 */

// Pinned wall clock: 15 July 2026. NB: Date months are 0-indexed, so 6 === July.
const TODAY = '2026-07-15';
const YESTERDAY = '2026-07-14';
const TOMORROW = '2026-07-16';
const LONG_PAST = '2025-12-31';
const LONG_FUTURE = '2027-01-01';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

function event(dates: string[]): TimetableEvent {
  return {
    course: 'CS101',
    group: 'G1',
    day: 'Monday',
    startTime: '0830',
    endTime: '1030',
    dates,
    venue: 'Block A',
    tutor: 'Dr X',
  };
}

function customEvent(dates: string[]): CustomEvent {
  return {
    ...event(dates),
    id: 'custom-1',
    eventType: 'custom',
    description: 'Study session',
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('hasFutureEvents — stale-timetable trigger', () => {
  it('is stale (false) when every imported event is in the past', () => {
    // The core Semester-2 scenario: a Semester 1 timetable, all dates elapsed.
    expect(hasFutureEvents([event([YESTERDAY]), event([LONG_PAST])], [])).toBe(false);
  });

  it('is NOT stale (true) for an event dated exactly today (>= boundary, not >)', () => {
    // Locks the inclusive boundary: today still counts as a class to attend, so the
    // nudge must not fire. A regression to strict `>` would wrongly mark this stale.
    expect(hasFutureEvents([event([TODAY])], [])).toBe(true);
  });

  it('is NOT stale (true) when an imported event is in the future', () => {
    expect(hasFutureEvents([event([TOMORROW]), event([YESTERDAY])], [])).toBe(true);
  });

  it('is NOT stale (true) when only a CUSTOM event is in the future', () => {
    // Custom events count toward "future" per the PM decision — a user who added a
    // future custom event to an old timetable is not stale.
    expect(hasFutureEvents([event([YESTERDAY])], [customEvent([TOMORROW])])).toBe(true);
  });

  it('is stale (false) when both imported AND custom events are all past', () => {
    expect(hasFutureEvents([event([YESTERDAY])], [customEvent([LONG_PAST])])).toBe(false);
  });

  it('is NOT stale (true) when a multi-date event has SOME future dates (any, not every)', () => {
    // Locks `.some()` semantics: one future date among many past ones keeps it fresh.
    expect(hasFutureEvents([event([LONG_PAST, YESTERDAY, TOMORROW])], [])).toBe(true);
  });

  it('is stale (false) when a multi-date event has ALL dates in the past', () => {
    expect(hasFutureEvents([event([LONG_PAST, YESTERDAY])], [])).toBe(false);
  });

  it('is NOT stale (true) when only a custom event, with null imported events, is future', () => {
    expect(hasFutureEvents(null, [customEvent([LONG_FUTURE])])).toBe(true);
  });

  it('returns false for null events with no custom events', () => {
    expect(hasFutureEvents(null, [])).toBe(false);
  });

  it('returns false for empty events array with no custom events', () => {
    expect(hasFutureEvents([], [])).toBe(false);
  });

  it('returns false for an event carrying an empty dates array', () => {
    // A degenerate event with no dates must not be treated as future.
    expect(hasFutureEvents([event([])], [])).toBe(false);
  });
});

describe('withOldSuffix — accept-path rename of the previous timetable', () => {
  it('appends " (Old)" to a plain name', () => {
    expect(withOldSuffix('Semester 1')).toBe('Semester 1 (Old)');
  });

  it('does not double-append when the name already ends with (Old)', () => {
    // Guards against "Semester 1 (Old) (Old)" if the accept path is somehow re-run.
    expect(withOldSuffix('Semester 1 (Old)')).toBe('Semester 1 (Old)');
  });

  it('is idempotent — applying twice equals applying once', () => {
    expect(withOldSuffix(withOldSuffix('Someone\'s Timetable'))).toBe(
      withOldSuffix('Someone\'s Timetable')
    );
  });
});
