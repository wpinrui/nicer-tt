import './HelpPage.css';

function HelpPage() {
  return (
    <div className="help-page">
      <ol className="steps">
        <li>
          <strong>Go to NIE Portal</strong>
          <p>Log in to ISAAC with your credentials</p>
        </li>
        <li>
          <strong>Generate Timetable</strong>
          <p>Navigate to Student Timetable and select your semester</p>
        </li>
        <li>
          <strong>Save the Webpage</strong>
          <p>Press <kbd>Ctrl</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>S</kbd> on Mac)</p>
        </li>
        <li>
          <strong>Save as HTML</strong>
          <p>Save to any folder on your computer</p>
        </li>
        <li>
          <strong>Upload Here</strong>
          <p>Go to Convert tab and upload the saved HTML file</p>
        </li>
        <li>
          <strong>Download ICS</strong>
          <p>Click the download button to get your calendar file</p>
        </li>
        <li>
          <strong>Import to Google Calendar</strong>
          <p>Settings &rarr; Import &amp; Export &rarr; Import &rarr; Select file</p>
        </li>
      </ol>

      <div className="tips">
        <strong>Tips</strong>
        <ul>
          <li>Also works with Outlook, Apple Calendar, etc.</li>
          <li>Save as "Webpage, Complete" or "HTML Only"</li>
        </ul>
      </div>
    </div>
  );
}

export default HelpPage;
