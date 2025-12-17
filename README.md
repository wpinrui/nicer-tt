# :calendar: NIcEr Timetable

A better way to view, filter, and organize your NIE timetable.

**[:rocket: Try it out](https://nicer-tt.vercel.app/)**

## What it does

NIcEr Timetable transforms your clunky NIE Portal timetable into a clean, searchable interface. Filter by course, search for specific classes, hide past events, and share your schedule with classmates. When you're ready, export to Google Calendar, Outlook, or any calendar app.

## :sparkles: Features

- **Clean Interface** - See your schedule at a glance, organized by date
- **Smart Filtering** - Search by course, venue, tutor, or date; filter by course code; hide past events
- **Shareable Links** - Share your timetable with classmates via URL
- **Calendar Export** - Download an ICS file for Google Calendar, Outlook, or Apple Calendar
- **Auto-Save** - Your timetable is saved locally so you can return anytime
- **Dark Mode** - Easy on the eyes
- **Privacy-First** - Everything runs in your browser; no data is sent to any server

## :book: Usage

See the **[Guide](GUIDE.md)** for detailed instructions on how to use the app.

## :wrench: Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

Push to `main` to trigger a Vercel deploy.

## Tech Stack

- React + TypeScript
- Vite
- CSS (no framework)
