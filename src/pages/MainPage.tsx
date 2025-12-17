import { useState, useRef } from 'react';
import type { TimetableEvent } from '../utils/parseHtml';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { generateIcs, downloadIcs } from '../utils/generateIcs';
import './MainPage.css';

function MainPage() {
  const [events, setEvents] = useState<TimetableEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsedEvents = parseHtmlTimetable(text);
      setEvents(parsedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setEvents(null);
    }
  };

  const handleDownload = () => {
    if (!events) return;
    const ics = generateIcs(events);
    downloadIcs(ics);
  };

  const handleReset = () => {
    setEvents(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalClasses = events?.reduce((sum, e) => sum + e.dates.length, 0) || 0;

  return (
    <div className="main-page">
      <header>
        <h1>NIE Timetable to ICS</h1>
        <p className="subtitle">Convert your student timetable to a calendar file</p>
      </header>

      <div className="upload-section">
        <label className="file-input-label">
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileChange}
            className="file-input"
          />
          <span className="file-button">
            {fileName ? 'Choose different file' : 'Upload Timetable HTML'}
          </span>
        </label>
        {fileName && <p className="file-name">{fileName}</p>}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {events && (
        <div className="results">
          <div className="success-message">
            <p>Found {events.length} courses ({totalClasses} classes)</p>
          </div>

          <div className="events-preview">
            <ul>
              {events.slice(0, 4).map((event, i) => (
                <li key={i}>
                  <strong>{event.course}</strong> {event.group}
                </li>
              ))}
              {events.length > 4 && <li className="more">+{events.length - 4} more</li>}
            </ul>
          </div>

          <div className="actions">
            <button onClick={handleDownload} className="download-button">
              Download .ics
            </button>
            <button onClick={handleReset} className="reset-button">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
