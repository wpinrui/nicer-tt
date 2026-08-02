import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dateToIso, ddmmToDate, formatPreviewDate } from './utils';

/**
 * Upgrading course sessions are stored as bare `DD/MM` with no year, so
 * `ddmmToDate` has to infer one: this year if the date is still ahead, next year
 * if it has already passed.
 *
 * The boundary that matters is TODAY. `ddmmToDate` builds the candidate date at
 * midnight, so comparing it against the current instant (rather than the start of
 * today) makes a session happening today look like it is in the past from 00:00
 * onwards — and rolls it a full year forward. That shifted the weekday too, which
 * is how it surfaced: "03/08" rendered as "Tue, Aug 3" (2027) sitting above
 * "Mon, Aug 17" (2026), two dates 14 days apart claiming different weekdays.
 *
 * "Now" is pinned so the suite is deterministic regardless of when it runs.
 * NB: Date months are 0-indexed, so 7 === August.
 */

const LATE_ON_3_AUG_2026 = new Date(2026, 7, 3, 23, 53, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LATE_ON_3_AUG_2026);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ddmmToDate', () => {
  it('keeps a session dated today in the current year, even late in the day', () => {
    expect(dateToIso(ddmmToDate('03/08'))).toBe('2026-08-03');
  });

  it('keeps a session dated today in the current year at one second to midnight', () => {
    vi.setSystemTime(new Date(2026, 7, 3, 23, 59, 59));
    expect(dateToIso(ddmmToDate('03/08'))).toBe('2026-08-03');
  });

  it('keeps a future date in the current year', () => {
    expect(dateToIso(ddmmToDate('17/08'))).toBe('2026-08-17');
  });

  it('rolls a genuinely past date forward to next year', () => {
    expect(dateToIso(ddmmToDate('02/08'))).toBe('2027-08-02');
  });

  it('rolls a date earlier in the year forward to next year', () => {
    expect(dateToIso(ddmmToDate('15/01'))).toBe('2027-01-15');
  });

  it('resolves consecutive fortnightly sessions to the same weekday', () => {
    const first = ddmmToDate('03/08');
    const second = ddmmToDate('17/08');
    expect(first.getDay()).toBe(second.getDay());
  });
});

describe('formatPreviewDate', () => {
  it('labels 3 Aug 2026 as a Monday', () => {
    expect(formatPreviewDate('03/08')).toBe('Mon, Aug 3');
  });

  it('labels the rest of the QCQ52D sessions as Mondays', () => {
    expect(formatPreviewDate('17/08')).toBe('Mon, Aug 17');
    expect(formatPreviewDate('24/08')).toBe('Mon, Aug 24');
    expect(formatPreviewDate('31/08')).toBe('Mon, Aug 31');
    expect(formatPreviewDate('07/09')).toBe('Mon, Sep 7');
  });
});
