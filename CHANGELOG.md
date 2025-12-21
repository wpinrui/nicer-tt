# Changelog

**v1.5.4 (21 Dec 2025)**
- Add right-click on course filter pill to deselect that course

**v1.5.3 (21 Dec 2025)**
- Fix clicking Upgrading pill in events pane now correctly filters to upgrading events

**v1.5.2 (21 Dec 2025)**
- Fix upgrading courses with multiple sessions per day showing duplicate events with same timeslot
- Upgrading course sessions are linked via groupId - deleting one deletes all
- Preserve groupId in ICS export/import for round-trip support

**v1.5.1 (21 Dec 2025)**
- Fix modal height being clipped by card container (use portals)
- Fix dark mode tooltip styling (arrow + background now use CSS variables)
- Add support for NIE prefix and basement levels in venue formatting
- Fix modal hint text alignment

### v1.5.0 (20 Dec 2025) - Crowdsourcing Contribution
- Add contribution page for users to submit their content upgrading schedules
- Firebase integration for storing submissions (Firestore + Storage)
- Drag-and-drop file upload supporting HTML, PDF, and images
- React Router integration for multi-page navigation

### v1.4.0 (20 Dec 2025) - Custom Events
- Add custom events feature for personal events not in NIE timetable (e.g., content upgrading classes)
- Create, edit, and delete custom events with multi-date picker
- Custom events display with distinct purple styling and "Custom" badge
- Choose whether to include custom events when downloading ICS or sharing
- Consolidate Download and Share buttons into Export dropdown menu
- Add "Add Event" button to desktop header and mobile menu

**v1.3.15 (20 Dec 2025)**
- Add flexible date search with permutation support (e.g., "March 17", "17 Mar", "17/3", "26-03-17")
- Date search now uses token-based matching allowing any order of day, month, year

**v1.3.14 (20 Dec 2025)**
- Refactor Phase 12: Performance & memory optimizations
- Wrap event handlers in useCallback (CompareFilters, useShareData)
- Add React.memo to pure display components (EventCard, EventGroup, FilterSection)
- Add dev-mode performance monitoring (useRenderTimer in key components)

**v1.3.13 (20 Dec 2025)**
- Refactor Phase 11: Naming consistency improvements
- Rename `hidePastDates` → `showPastDates` (positive boolean pattern)
- Standardize modal state naming to `isXxxModalOpen` / `setXxxModalOpen`
- Rename `tempViewData` → `previewData`, `shareLinkFallback` → `manualShareModal`

**v1.3.12 (20 Dec 2025)**
- Add visible border to compare filter buttons for better visibility

**v1.3.11 (19 Dec 2025)**
- Refactor hooks: split useFilteredEvents into useCourseColorMap, useGroupedEvents, useFilteredGroupedEvents
- Simplify useShareData with extracted URL utilities (src/utils/shareUrl.ts)
- Simplify useTimetableStorage to use useLocalStorageJson
- Add JSDoc documentation to all hooks
- Add useDebouncedValue hook and debounce search filtering (150ms)

**v1.3.10 (19 Dec 2025)**
- Extract shared EventCard and EventGroup components
- Remove duplicated event rendering logic from EventsList and EventsCompareView

**v1.3.9 (19 Dec 2025)**
- Decompose CompareFilters into focused config components
- Extract TravelConfigForm, MealConfigForm, MobileCompareSheet
- Reduce CompareFilters.tsx from 463 to 134 lines

**v1.3.8 (19 Dec 2025)**
- Decompose OptionsPanel into focused section components
- Extract TimetableManager, BackgroundSettings, AppSettings, PrivacySection
- Reduce OptionsPanel.tsx from 552 to 126 lines

**v1.3.7 (19 Dec 2025)**
- Decompose MainPage into smaller focused components
- Extract useMainPageState hook for filter, compare, and UI state
- Extract UploadSection component for file upload UI

**v1.3.6 (19 Dec 2025)**
- Extract constants and magic numbers to src/shared/constants.ts
- Add JSDoc documentation for all compare feature constants

**v1.3.5 (19 Dec 2025)**
- Add custom scrollbar styling to Privacy & Security modal

**v1.3.4 (19 Dec 2025)**
- Fix ESLint set-state-in-effect error in CompareFilters

**v1.3.3 (19 Dec 2025)**
- Add shared utilities: useLocalStorageJson, useToast hooks
- Add centralized ID generation (src/utils/id.ts)
- Add error handling utilities with logError and safeJsonParse (src/utils/errors.ts)
- Add proper error logging to all catch blocks

**v1.3.2 (19 Dec 2025)**
- Centralize type definitions in src/types with JSDoc documentation
- Create src/types/index.ts for domain types (TimetableEvent, Timetable, CompareFilter, etc.)
- Create src/types/ui.ts for UI-specific types (ButtonVariant)
- Update all imports to use centralized types

**v1.3.1 (19 Dec 2025)**
- Migrate styling from CSS to SCSS with CSS variables
- Add centralized theme variables for light/dark mode
- Add SCSS mixins for responsive breakpoints

### v1.3.0 (19 Dec 2025) - Mobile Compare support
- Add mobile support for Compare view with stacked layout
- Add Compare button to mobile hamburger menu
- Add collapsible filter toggle on mobile
- Show timetable names as labels in stacked view

**v1.2.1 (18 Dec 2025)**
- Show explanation modal for Compare feature when user has only one timetable

### v1.2.0 (18 Dec 2025) - Active timetable switching, smart sharing
- Add active timetable switching with eye icon in Options panel
- Show "Viewing" badge and colored styling for active timetable
- Display active timetable name in events count
- Allow deleting primary timetable (My Timetable)
- Remove Data section (functionality moved to Timetables)
- Add Factory Reset button in Help section
- Share button asks which timetable to share when multiple exist
- Smart share link handling: auto-switches if timetable already saved
- "Add to Timetables" option when receiving share links

**v1.1.2 (18 Dec 2025)**
- Cap travel wait time at 2 hours
- Cap dinner end time at 9pm

**v1.1.1 (18 Dec 2025)**
- Disable modal close on overlay click

### v1.1.0 (18 Dec 2025) - Compare Timetables
- Add Compare Timetables feature to compare schedules side-by-side
- Multi-timetable storage with add/rename/delete functionality
- Add timetables via share link or file upload in Options panel
- Compare filters: Common Days, Identical Classes, Travel Together, Eat Together
- Travel Together filter with direction options (TO/FROM/BOTH/EITHER) and configurable wait time
- Eat Together filter with meal type selection and customizable time windows
- CSS-based speech bubble tooltips for filter explanations
- Meal badges show time slots directly (e.g., "12:00 PM–1:00 PM")

**v1.0.14 (18 Dec 2025)**
- Add plain background option (white/black depending on theme)
- Rename section from "Background Image" to "Background"
- Desktop only (hidden on mobile like other background options)

**v1.0.13 (18 Dec 2025)**
- Add custom background image option in Options modal (paste image URL)
- Image validation on blur with success/error toast feedback
- Thumbnail preview with Reset to Default button when custom background is set
- Unsplash credit hidden when using custom background (Freepik credit remains)
- Background option hidden on mobile (no background visible in mobile view)

**v1.0.12 (18 Dec 2025)**
- Add date picker filter inside search box with date pill display
- Position card at top of viewport instead of centered

**v1.0.11 (18 Dec 2025)**
- Add mobile hamburger menu with Download, Share, Options, Help
- Add collapsible filter panel for mobile
- Move action buttons to header on desktop
- Add Help section to Options modal (User Guide, Report issue)

**v1.0.10 (17 Dec 2025)**
- Allow ICS files in Options > Change file

**v1.0.9 (17 Dec 2025)**
- Skip share dialog when pasting own share link (same data)

**v1.0.8 (17 Dec 2025)**
- Handle share link pasted while already on page (hashchange listener)

**v1.0.7 (17 Dec 2025)**
- Add "Just View" option for shared timetables (temporary viewing without replacing)
- Show banner when temporarily viewing shared timetable with back button
- Add secondary action support to Modal component

**v1.0.6 (17 Dec 2025)**
- Mobile layout: sticky top controls (search, filters) and bottom buttons
- Add tablet breakpoint (768px-1280px) for fluid card layout
- Enlarge touch targets on mobile (buttons, filters, help icon)

**v1.0.5 (17 Dec 2025)**
- Add changelog link to footer

**v1.0.4 (17 Dec 2025)**
- Use version from package.json instead of hardcoded value

**v1.0.3 (17 Dec 2025)**
- Fix modal appearing mid-scroll instead of onscreen (created by v1.0.2)
- Remove background for readability on mobile view

**v1.0.2 (17 Dec 2025)**
- Compress share URLs using pako/zlib (much shorter links)
- Hide footer and fix scroll behavior on mobile

**v1.0.1 (17 Dec 2025)**
- Make footer clickable to github repo

### v1.0.0 (17 Dec 2025) - Initial release
