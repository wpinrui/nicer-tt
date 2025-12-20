# NIcEr Timetable - Developer Guide

A comprehensive guide for contributors to understand and work on this codebase.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
   - [Timetable Parsing](#1-timetable-parsing)
   - [Multi-Timetable Storage](#2-multi-timetable-storage)
   - [Event Filtering & Display](#3-event-filtering--display)
   - [Compare Timetables](#4-compare-timetables)
   - [Share Links](#5-share-links)
   - [ICS Export](#6-ics-export)
5. [Styling Architecture](#styling-architecture)
6. [State Management](#state-management)
7. [Development Workflow](#development-workflow)

---

## Project Overview

**WHAT:** A web app that transforms NIE (National Institute of Education) timetable exports into a beautiful, interactive view with filtering, comparison, and sharing capabilities.

**WHY:** NIE's exported timetable HTML is functional but not user-friendly. This app makes it easy to view, filter, share, and compare timetables with friends.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| SCSS | Styling with CSS variables |
| pako | zlib compression for share URLs |
| Lucide React | Icon library |
| Vercel Analytics | Usage tracking |

---

## Project Structure

```
src/
├── components/           # React components
│   ├── compare/          # Compare-specific components
│   ├── options/          # Options panel sub-components
│   └── index.ts          # Barrel exports
├── hooks/                # Custom React hooks
├── pages/                # Page-level components
├── styles/               # SCSS partials
│   ├── _variables.scss   # CSS custom properties (theme)
│   └── _mixins.scss      # Responsive breakpoint mixins
├── types/                # TypeScript type definitions
├── shared/               # Shared constants
├── utils/                # Utility functions
└── App.tsx               # Root component
```

---

## Core Features

### 1. Timetable Parsing

**WHAT:** Extracts event data from NIE's exported HTML or ICS files.

**WHERE:**
- `src/utils/parseHtml.ts` - HTML parsing
- `src/utils/parseIcs.ts` - ICS file parsing

**HOW:**
- HTML: Parses the `#infotab` table, extracting course, group, day, time, dates, venue, and tutor from each row
- ICS: Parses VEVENT blocks using regex patterns

**WHY:** NIE exports data in a specific HTML format with an `#infotab` table. We parse this structure to extract structured event data.

```typescript
// Key type (src/types/index.ts)
interface TimetableEvent {
  course: string;      // e.g., "CS101"
  group: string;       // Tutorial group
  day: string;         // Day of week
  startTime: string;   // "HHMM" format (e.g., "0830")
  endTime: string;     // "HHMM" format (e.g., "1030")
  dates: string[];     // Array of date strings
  venue: string;       // Location
  tutor: string;       // Instructor name
}
```

---

### 2. Multi-Timetable Storage

**WHAT:** Stores and manages multiple timetables in localStorage with a primary/active timetable concept.

**WHERE:** `src/hooks/useTimetableStorage.ts`

**HOW:**
- Timetables stored in `localStorage` under `timetables` key
- Legacy single-timetable format auto-migrated on first load
- Primary timetable = user's own schedule
- Active timetable = currently viewed (can switch between them)

**WHY:** Users need to store multiple timetables to compare with friends or manage different schedules.

```typescript
interface Timetable {
  id: string;           // Unique ID (generated via generateId)
  name: string;         // User-assigned name
  events: TimetableEvent[];
  fileName: string | null;
  isPrimary: boolean;   // Only one primary allowed
}
```

**Key operations:**
- `setTimetable()` - Update primary timetable
- `addTimetable()` - Add a new secondary timetable
- `setActiveTimetable()` - Switch which timetable is displayed
- `deleteTimetable()` - Remove a timetable

---

### 3. Event Filtering & Display

**WHAT:** Filters and groups events by date with search, course selection, and date picker.

**WHERE:**
- `src/hooks/useFilteredEvents.ts` - Main filtering logic
- `src/hooks/useGroupedEvents.ts` - Groups events by date
- `src/hooks/useCourseColorMap.ts` - Assigns colors to courses
- `src/hooks/useDebouncedValue.ts` - Debounces search input (150ms)
- `src/components/FilterSection.tsx` - Filter UI
- `src/components/EventsList.tsx` - Displays grouped events

**HOW:**
1. Events are filtered by search query (course, venue, tutor, date text)
2. Optionally filtered by selected courses and date
3. Past dates can be hidden/shown
4. Filtered events are grouped by date and sorted chronologically
5. Each course gets a consistent color from a predefined palette

**WHY:** Timetables can have many events. Filtering helps users find specific classes quickly.

```typescript
// Grouped events structure
interface GroupedEvent {
  date: string;      // Display format: "Monday, 15 January"
  sortKey: string;   // ISO format: "2025-01-15" for sorting
  events: EventItem[];
}
```

---

### 4. Compare Timetables

**WHAT:** Side-by-side comparison of two timetables with smart filters to find common free time.

**WHERE:**
- `src/components/EventsCompareView.tsx` - Main compare view
- `src/components/CompareFilters.tsx` - Filter controls
- `src/components/compare/` - Config forms (travel, meal)
- `src/utils/compareUtils.ts` - Comparison algorithms
- `src/shared/constants.ts` - Compare constants

**HOW:**

Four filter modes:
1. **Common Days** - Shows only days where both have classes
2. **Identical Classes** - Shows only matching course/group/time events
3. **Travel Together** - Shows days where first/last class times are close enough
4. **Eat Together** - Shows days where both have overlapping meal gaps

**WHY:** Students want to know when they can travel/eat with friends. Manual comparison is tedious.

```typescript
// Compare filter types
type CompareFilter = 'none' | 'commonDays' | 'identical' | 'travel' | 'eat';

// Travel config
interface TravelConfig {
  direction: 'to' | 'from' | 'both' | 'either';
  waitMinutes: number;  // Max acceptable wait time
}

// Meal config
interface MealConfig {
  type: 'lunch' | 'dinner';
  lunchStart: number;   // Hour (e.g., 11)
  lunchEnd: number;     // Hour (e.g., 14)
  dinnerStart: number;
  dinnerEnd: number;
}
```

**Key algorithms in `compareUtils.ts`:**
- `calculateTravelInfo()` - Compares earliest/latest class times
- `calculateMealInfo()` - Finds overlapping free gaps in meal windows
- `findGaps()` - Identifies free periods between classes

---

### 5. Share Links

**WHAT:** Generates compressed, shareable URLs containing full timetable data.

**WHERE:**
- `src/hooks/useShareData.ts` - Share link handling & modals
- `src/utils/shareUtils.ts` - Encode/decode with pako compression
- `src/utils/shareUrl.ts` - URL manipulation helpers

**HOW:**
1. Timetable JSON is compressed using pako (zlib)
2. Compressed data is base64-encoded
3. Appended to URL as hash: `#share=<encoded>`
4. On load, hash is decoded and decompressed
5. User can "Add to Timetables" or "Just View" temporarily

**WHY:** URL hash approach works without a backend. Compression keeps links reasonably short.

```typescript
// Share data structure
interface ShareData {
  events: TimetableEvent[];
  fileName: string;
}
```

**Smart behaviors:**
- If pasting own share link, skips confirmation dialog
- If matching timetable already saved, auto-switches to it
- Can view shared timetable temporarily without saving

---

### 6. ICS Export

**WHAT:** Generates a downloadable ICS file for import into calendar apps.

**WHERE:** `src/utils/generateIcs.ts`

**HOW:**
1. Converts each event+date combination into VEVENT blocks
2. Formats times in UTC (Singapore timezone offset)
3. Generates unique UIDs for each event
4. Creates downloadable blob

**WHY:** Users can import their timetable into Google Calendar, Apple Calendar, etc.

---

## Styling Architecture

**WHERE:** `src/styles/`

### CSS Variables

All colors are defined as CSS custom properties in `_variables.scss`:

```scss
// Light theme (default in :root)
--color-primary: #646cff;
--color-text-primary: #333;
--color-bg-primary: #fff;

// Dark theme (html.dark overrides)
html.dark {
  --color-text-primary: #e0e0e0;
  --color-bg-primary: #1a1a1a;
}
```

**Categories:**
- `--color-primary-*` - Brand/accent colors
- `--color-text-*` - Text colors
- `--color-bg-*` - Background colors
- `--color-border-*` - Border colors
- `--color-success/error/warning/info-*` - Status colors
- `--color-travel-*` - Travel badge colors
- `--color-meal-*` - Meal badge colors

### Responsive Mixins

`_mixins.scss` provides breakpoint mixins:

```scss
@mixin mobile { @media (max-width: 767px) { @content; } }
@mixin tablet { @media (min-width: 768px) and (max-width: 1279px) { @content; } }
@mixin desktop { @media (min-width: 1280px) { @content; } }
@mixin not-mobile { @media (min-width: 768px) { @content; } }
```

### Component Styles

Each component has a corresponding `.scss` file:
- `MainPage.tsx` → `MainPage.scss`
- `App.tsx` → `App.scss`

---

## State Management

No global state library - React hooks + localStorage:

| Hook | Purpose |
|------|---------|
| `useLocalStorage` | Persist single values |
| `useLocalStorageJson` | Persist JSON objects |
| `useTimetableStorage` | Multi-timetable CRUD |
| `useMainPageState` | Filter, compare, and UI state |
| `useShareData` | Share link state & modals |
| `useFilteredEvents` | Derived filtered/grouped events |

### LocalStorage Keys

Defined in `src/utils/constants.ts`:

```typescript
export const STORAGE_KEYS = {
  TIMETABLE_DATA: 'timetableData',        // Legacy single timetable
  TIMETABLES_DATA: 'timetables',          // Multi-timetable array
  ACTIVE_TIMETABLE: 'activeTimetable',    // Currently viewed ID
  DARK_MODE: 'darkMode',
  SHOW_TUTOR: 'showTutor',
  CUSTOM_BACKGROUND: 'customBackground',
};
```

---

## Development Workflow

### Commands

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint check
npm run format    # Prettier format
```

### Key Practices

1. **Type Safety:** All props and state should be typed. Use `src/types/` for shared types.

2. **CSS Variables:** Always use variables from `_variables.scss`. Never hardcode colors.

3. **Hook Extraction:** Complex logic should be in custom hooks, not components.

4. **Barrel Exports:** Use `index.ts` files for clean imports:
   ```typescript
   import { Modal, EventsList } from '../components';
   ```

5. **Error Handling:** Use `logError()` from `src/utils/errors.ts` in catch blocks.

6. **Performance:**
   - Wrap callbacks in `useCallback` when passed as props
   - Use `React.memo` for pure display components
   - Debounce expensive operations (search uses 150ms debounce)

### Adding a New Feature

1. Create types in `src/types/` if needed
2. Add utility functions in `src/utils/`
3. Create custom hook in `src/hooks/` if stateful
4. Build component in `src/components/`
5. Add SCSS file alongside component
6. Export from barrel files (`index.ts`)

### Adding a New Filter

1. Add filter type to `CompareFilter` in `src/types/index.ts`
2. Add calculation logic in `src/utils/compareUtils.ts`
3. Add filter button in `CompareFilters.tsx`
4. Handle filter in `EventsCompareView.tsx` rendering logic
