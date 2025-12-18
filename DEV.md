# Changelog
## v1.1.1 (18 Dec 2025)
- Disable modal close on overlay click

## v1.1.0 (18 Dec 2025)
- Add Compare Timetables feature to compare schedules side-by-side
- Multi-timetable storage with add/rename/delete functionality
- Add timetables via share link or file upload in Options panel
- Compare filters: Common Days, Identical Classes, Travel Together, Eat Together
- Travel Together filter with direction options (TO/FROM/BOTH/EITHER) and configurable wait time
- Eat Together filter with meal type selection and customizable time windows
- CSS-based speech bubble tooltips for filter explanations
- Meal badges show time slots directly (e.g., "12:00 PM–1:00 PM")

## v1.0.14 (18 Dec 2025)
- Add plain background option (white/black depending on theme)
- Rename section from "Background Image" to "Background"
- Desktop only (hidden on mobile like other background options)

## v1.0.13 (18 Dec 2025)
- Add custom background image option in Options modal (paste image URL)
- Image validation on blur with success/error toast feedback
- Thumbnail preview with Reset to Default button when custom background is set
- Unsplash credit hidden when using custom background (Freepik credit remains)
- Background option hidden on mobile (no background visible in mobile view)

## v1.0.12 (18 Dec 2025)
- Add date picker filter inside search box with date pill display
- Position card at top of viewport instead of centered

## v1.0.11 (18 Dec 2025)
- Add mobile hamburger menu with Download, Share, Options, Help
- Add collapsible filter panel for mobile
- Move action buttons to header on desktop
- Add Help section to Options modal (User Guide, Report issue)

## v1.0.10 (17 Dec 2025)
- Allow ICS files in Options > Change file

## v1.0.9 (17 Dec 2025)
- Skip share dialog when pasting own share link (same data)

## v1.0.8 (17 Dec 2025)
- Handle share link pasted while already on page (hashchange listener)

## v1.0.7 (17 Dec 2025)
- Add "Just View" option for shared timetables (temporary viewing without replacing)
- Show banner when temporarily viewing shared timetable with back button
- Add secondary action support to Modal component

## v1.0.6 (17 Dec 2025)
- Mobile layout: sticky top controls (search, filters) and bottom buttons
- Add tablet breakpoint (768px-1280px) for fluid card layout
- Enlarge touch targets on mobile (buttons, filters, help icon)

## v1.0.5 (17 Dec 2025)
- Add changelog link to footer

## v1.0.4 (17 Dec 2025)
- Use version from package.json instead of hardcoded value

## v1.0.3 (17 Dec 2025)
- Fix modal appearing mid-scroll instead of onscreen (created by v1.0.2)
- Remove background for readability on mobile view
## v1.0.2 (17 Dec 2025)
- Compress share URLs using pako/zlib (much shorter links)
- Hide footer and fix scroll behavior on mobile

## v1.0.1 (17 Dec 2025)
- Make footer clickable to github repo

## v1.0.0 (17 Dec 2025)
- Initial release
