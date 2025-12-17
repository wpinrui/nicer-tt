# :book: NIcEr Timetable Guide

A tool to convert your NIE timetable into a calendar file you can import into Google Calendar, Outlook, Apple Calendar, or any other calendar app.

---

## :link: Share Your Timetable Anywhere

**Click Share to copy a link to your clipboard.** Anyone with the link can view your timetable without needing to upload the HTML file themselves. You can save this link to view your timetable from any device.

:iphone: **Pro tip:** Save the share link as a bookmark on your phone to quickly access your timetable on the go!

---

## :rocket: Getting Started

### Step 1: Go to your timetable page

Navigate to your NIE Portal timetable:

**NIE Portal > Academics > Programme Administration Matters > Timetable**

### Step 2: Save the webpage

Once you're on the timetable page, save it as an HTML file:

- **Windows/Linux:** Press `Ctrl + S`
- **Mac:** Press `Cmd + S`

Save the file anywhere on your computer. The default filename is usually fine.

### Step 3: Upload the file

Go to [NIcEr Timetable](https://nicer-tt.vercel.app/) and click the **Upload Timetable HTML** button. Select the HTML file you just saved.

### Step 4: Export your timetable

Your timetable is automatically saved in your browser. You can now download it as an ICS file to import into your calendar app.

---

## :sparkles: Features

### Viewing Your Timetable

Once you've uploaded your timetable, you'll see all your events organized by date. Each event shows:

- **Time** - Start and end time in 12-hour format
- **Course code** - Color-coded for easy identification
- **Group** - Your class/tutorial group
- **Venue** - Location formatted as Block, Level, Room
- **Tutor** - The instructor's name (can be toggled in Options)

### :mag: Filtering Events

#### Search
Use the search bar to find specific events. You can search by:
- Course code
- Venue
- Tutor name
- Date (e.g., "Monday", "January", "15")

#### Course Filters
Click on any course code pill below the search bar to filter by that course. Click again to remove the filter. You can select multiple courses.

:bulb: **Tip:** You can also click on a course tag in the event list to quickly filter by that course.

#### Hide Past Events
Toggle "Hide past" to show only upcoming events. This is enabled by default.

#### Clear Filters
Click the **Clear** button to reset all filters at once.

### :outbox_tray: Exporting

#### Download .ics
Click **Download .ics** to save your timetable as a calendar file. You can then import this file into:

- **Google Calendar:** Go to Settings > Import & Export > Import
- **Apple Calendar:** Double-click the file or use File > Import
- **Outlook:** Go to File > Open & Export > Import/Export

#### Share
Click **Share** to copy a link to your clipboard. Anyone with the link can view your timetable without needing to upload the HTML file themselves.

:lock: The shared link contains your timetable data encoded in the URL. No data is stored on any server.

### :gear: Options

Click the **Options** button to access settings:

#### Display
- **Show tutor names** - Toggle whether tutor names appear inline or as an icon tooltip
- **Dark/Light mode** - Switch between dark and light themes

#### Data
- **Current file** - Shows the name of your uploaded file
- **Change file** - Upload a different timetable HTML file
- **Reset data** - Clear all saved data and start fresh

### Loading a Saved ICS

If you've previously downloaded an ICS file from this tool, you can load it back by clicking **Load Saved ICS** on the home page. This is useful if you want to view your timetable on a different device without re-downloading the HTML from NIE Portal.

---

## :bulb: Tips

1. **Bookmark the page** - Your timetable is saved in your browser, so you can return anytime without re-uploading.

2. **Use the share link** - Share your timetable with classmates so they can compare schedules.

3. **Filter by course** - When you want to focus on assignments or preparation for a specific course, filter to see only those events.

4. **Dark mode** - Easier on the eyes, especially when checking your schedule at night.

---

## :warning: Troubleshooting

### "Failed to parse file"
Make sure you're uploading the HTML file from the NIE Portal timetable page, not a PDF or screenshot. The file should have a `.html` or `.htm` extension.

### Events are missing
The parser looks for specific table structures in the NIE timetable page. Make sure you saved the complete webpage (not just a selection) and that you were on the actual timetable page when saving.

### Calendar shows wrong times
The ICS file uses Singapore timezone (Asia/Singapore). Make sure your calendar app is set to the correct timezone.

---

## :lock: Privacy

- All processing happens in your browser - no data is sent to any server
- Your timetable is saved in your browser's local storage
- Shared links encode data in the URL - no server storage involved

---

## :speech_balloon: Feedback & Issues

Found a bug or have a suggestion? [Open an issue on GitHub](https://github.com/wpinrui/nicer-tt/issues).
