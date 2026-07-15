# :book: NIcEr Timetable Guide

A tool to convert your NIE timetable into a calendar file you can import into Google Calendar, Outlook, Apple Calendar, or any other calendar app.

---

## :link: Share Your Timetable Anywhere

**Click Share to copy a link to your clipboard.** Anyone with the link can view your timetable without needing to upload the HTML file themselves. You can save this link to view your timetable from any device.

:iphone: **Pro tip:** Open the share link on your phone's browser once, and your timetable will be saved on your phone the next time you visit [NIcEr Timetable](https://nicer-tt.vercel.app/).

---

## :rocket: Getting Started

### Step 1: Open your timetable on NIE Launchpad

NIE recently changed where your timetable lives. To find it:

1. Go to **[launchpad.nie.edu.sg](https://launchpad.nie.edu.sg/student/overview)** and sign in.
2. In the **search box** (top-right), type **"timetable"**.
3. Open the first result tagged **Service** — **ISAAC Student Timetable**. It opens in a new tab.

### Step 2: Wait for it to load

Launchpad signs you in securely (you'll see a brief "signing you in" screen). Keep the tab open while it works.

### Step 3: Your timetable appears

Once it finishes loading, your full timetable is shown. This is the page you'll save in the next step.

### Step 4: Save the webpage

On your timetable page, save it as an HTML file:

- **Windows/Linux:** Press `Ctrl + S`
- **Mac:** Press `Cmd + S`

If asked, choose **"Webpage, HTML Only"**. Remember where it goes — usually your **Downloads** folder.

### Step 5: Upload the file

Go to [NIcEr Timetable](https://nicer-tt.vercel.app/) and click the **Upload Timetable HTML** button. Select the HTML file you just saved.

### Step 6: Export your timetable

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

If you've previously downloaded an ICS file from this tool, you can load it back by clicking **Load Saved ICS** on the home page. This is useful if you want to view your timetable on a different device without re-downloading the HTML from NIE.

---

## :bulb: Tips

1. **Bookmark the page** - Your timetable is saved in your browser, so you can return anytime without re-uploading.

2. **Use the share link** - Share your timetable with classmates so they can compare schedules.

3. **Filter by course** - When you want to focus on assignments or preparation for a specific course, filter to see only those events.

4. **Dark mode** - Easier on the eyes, especially when checking your schedule at night.

---

## :warning: Troubleshooting

### "Failed to parse file"
Make sure you're uploading the HTML file from the ISAAC Student Timetable page, not a PDF or screenshot. The file should have a `.html` or `.htm` extension.

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
