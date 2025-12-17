import { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, Download, FileText, RotateCcw, Search, X, Share2, CalendarDays, User, Moon, Sun, Settings, HelpCircle } from 'lucide-react';
import type { TimetableEvent } from '../utils/parseHtml';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { generateIcs, downloadIcs } from '../utils/generateIcs';
import { parseIcs } from '../utils/parseIcs';
import HelpPage from './HelpPage';
import './MainPage.css';

interface GroupedEvent {
  date: string;
  sortKey: string;
  events: { course: string; group: string; startTime: string; endTime: string; venue: string; tutor: string }[];
}

// Color palette for course codes (darker shades for white text)
const COURSE_COLORS = [
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e',
  '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20',
  '#33691e', '#827717', '#f57f17', '#e65100', '#bf360c',
  '#3e2723', '#424242', '#263238', '#ad1457', '#6a1b9a',
];

function getCourseColor(course: string, courseMap: Map<string, string>): string {
  if (!courseMap.has(course)) {
    const index = courseMap.size % COURSE_COLORS.length;
    courseMap.set(course, COURSE_COLORS[index]);
  }
  return courseMap.get(course)!;
}

function formatDateDisplay(dateStr: string): string {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(2026, month - 1, day);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return `${dayName}, ${day} ${monthName}`;
}

function getTodaySortKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isToday(sortKey: string): boolean {
  return sortKey === getTodaySortKey();
}

function getDateSearchString(dateStr: string): string {
  const [day, month] = dateStr.split('/').map(Number);
  const date = new Date(2026, month - 1, day);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const monthLong = date.toLocaleDateString('en-US', { month: 'long' });
  // Include multiple formats for flexible search
  return `${day} ${monthShort} ${monthLong} ${dayName} 2026 ${dateStr} ${day}/${month}`;
}

function formatTime12Hour(time: string): string {
  // Convert "0830" or "1430" to "8:30 AM" or "2:30 PM"
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = time.slice(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

function formatVenue(venue: string): string {
  // Parse "3-01-TR303" into "Block 3, Level 1, TR303"
  const match = venue.match(/^(\d+)-(\d+)-(.+)$/);
  if (match) {
    const block = parseInt(match[1], 10);
    const level = parseInt(match[2], 10);
    const room = match[3];
    return `Block ${block}, Level ${level}, ${room}`;
  }
  return venue;
}

function formatTutor(tutor: string): string {
  // Remove prefix before colon (e.g., "ptsltpay:Name" -> "Name")
  let name = tutor.includes(':') ? tutor.split(':').pop()! : tutor;

  // Add space before parentheses if missing (e.g., "Name(DEPT)" -> "Name (DEPT)")
  name = name.replace(/(\S)\(/, '$1 (');

  return name;
}

const STORAGE_KEY = 'nie-timetable-data';

function loadFromStorage(): { events: TimetableEvent[] | null; fileName: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return { events: data.events, fileName: data.fileName };
    }
  } catch {
    // Ignore parse errors
  }
  return { events: null, fileName: null };
}

function saveToStorage(events: TimetableEvent[] | null, fileName: string | null) {
  if (events && fileName) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, fileName }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function encodeShareData(events: TimetableEvent[], fileName: string): string {
  const data = JSON.stringify({ events, fileName });
  return btoa(encodeURIComponent(data));
}

function decodeShareData(encoded: string): { events: TimetableEvent[]; fileName: string } | null {
  try {
    const data = decodeURIComponent(atob(encoded));
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function MainPage() {
  const stored = loadFromStorage();
  const [events, setEvents] = useState<TimetableEvent[] | null>(stored.events);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(stored.fileName);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [hidePastDates, setHidePastDates] = useState(true);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingShareData, setPendingShareData] = useState<{ events: TimetableEvent[]; fileName: string } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nie-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showTutor, setShowTutor] = useState(() => {
    const saved = localStorage.getItem('nie-show-tutor');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsFileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('nie-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save show tutor preference
  useEffect(() => {
    localStorage.setItem('nie-show-tutor', JSON.stringify(showTutor));
  }, [showTutor]);

  // Check for shared data in URL on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      const encoded = hash.slice(7);
      const decoded = decodeShareData(encoded);
      if (decoded) {
        const hasExisting = events && events.length > 0;
        if (hasExisting) {
          setPendingShareData(decoded);
          setShowShareModal(true);
        } else {
          setEvents(decoded.events);
          setFileName(decoded.fileName);
          saveToStorage(decoded.events, decoded.fileName);
        }
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmLoadSharedData = () => {
    if (pendingShareData) {
      setEvents(pendingShareData.events);
      setFileName(pendingShareData.fileName);
      saveToStorage(pendingShareData.events, pendingShareData.fileName);
    }
    setShowShareModal(false);
    setPendingShareData(null);
  };

  const cancelLoadSharedData = () => {
    setShowShareModal(false);
    setPendingShareData(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setSearchQuery('');
    setSelectedCourses(new Set());

    try {
      const text = await file.text();
      const parsedEvents = parseHtmlTimetable(text);
      setEvents(parsedEvents);
      saveToStorage(parsedEvents, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setEvents(null);
      saveToStorage(null, null);
    }
  };

  const handleDownload = () => {
    if (!events) return;
    const ics = generateIcs(events);
    downloadIcs(ics);
  };

  const handleIcsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const text = await file.text();
      const parsedEvents = parseIcs(text);

      setEvents(parsedEvents);
      setFileName(file.name);
      setSearchQuery('');
      setSelectedCourses(new Set());
      saveToStorage(parsedEvents, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse ICS file');
      setEvents(null);
      saveToStorage(null, null);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setEvents(null);
    setError(null);
    setFileName(null);
    setSearchQuery('');
    setSelectedCourses(new Set());
    saveToStorage(null, null);
    setShowResetModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShare = async () => {
    if (!events || !fileName) return;

    const encoded = encodeShareData(events, fileName);
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(null), 3000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this link to share your timetable:', shareUrl);
    }
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(course)) {
        newSet.delete(course);
      } else {
        newSet.add(course);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourses(new Set());
  };

  const { groupedByDate, totalEvents, courseColorMap, uniqueCourses, filteredCount } = useMemo(() => {
    if (!events) return { groupedByDate: [], totalEvents: 0, courseColorMap: new Map<string, string>(), uniqueCourses: [], filteredCount: 0 };

    const dateMap = new Map<string, GroupedEvent>();
    const colorMap = new Map<string, string>();
    let total = 0;
    let filtered = 0;

    // First pass: collect all unique courses to assign colors
    const coursesSet = new Set<string>();
    for (const event of events) {
      coursesSet.add(event.course);
    }
    const coursesArray = Array.from(coursesSet).sort();
    // Assign colors
    coursesArray.forEach((course) => {
      getCourseColor(course, colorMap);
    });

    const query = searchQuery.toLowerCase();
    const hasFilters = selectedCourses.size > 0 || query.length > 0 || hidePastDates;

    // Get today's date for filtering past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySortKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (const event of events) {
      for (const dateStr of event.dates) {
        total++;

        const [day, month] = dateStr.split('/');
        const sortKey = `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Filter past dates if toggle is on
        if (hidePastDates && sortKey < todaySortKey) {
          continue;
        }

        // Apply filters
        if (selectedCourses.size > 0 && !selectedCourses.has(event.course)) {
          continue;
        }
        const displayDate = formatDateDisplay(dateStr);
        const dateSearchStr = getDateSearchString(dateStr);
        if (query && !event.course.toLowerCase().includes(query) &&
            !event.group.toLowerCase().includes(query) &&
            !event.venue.toLowerCase().includes(query) &&
            !event.tutor.toLowerCase().includes(query) &&
            !dateSearchStr.toLowerCase().includes(query)) {
          continue;
        }

        filtered++;

        if (!dateMap.has(sortKey)) {
          dateMap.set(sortKey, { date: displayDate, sortKey, events: [] });
        }
        dateMap.get(sortKey)!.events.push({
          course: event.course,
          group: event.group,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          tutor: event.tutor,
        });
      }
    }

    const sorted = Array.from(dateMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // Sort events within each date by start time
    for (const group of sorted) {
      group.events.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return {
      groupedByDate: sorted,
      totalEvents: total,
      courseColorMap: colorMap,
      uniqueCourses: coursesArray,
      filteredCount: hasFilters ? filtered : total
    };
  }, [events, searchQuery, selectedCourses, hidePastDates]);

  const hasActiveFilters = selectedCourses.size > 0 || searchQuery.length > 0;

  return (
    <div className="main-page">
      {events ? (
        <div className="compact-header no-print">
          <h1><CalendarDays size={26} className="brand-icon" /><span className="brand-letter">N</span><span className="brand-letter">I</span><span className="brand-small">c</span><span className="brand-letter">E</span><span className="brand-small">r</span> Timetable</h1>
          <a
            href="https://github.com/wpinrui/nicer-tt/blob/main/GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="help-link"
            title="Help & Guide"
          >
            <HelpCircle size={20} />
          </a>
        </div>
      ) : (
        <>
          <header className="no-print">
            <h1><CalendarDays size={36} className="brand-icon" /><span className="brand-letter">N</span><span className="brand-letter">I</span><span className="brand-small">c</span><span className="brand-letter">E</span><span className="brand-small">r</span> Timetable</h1>
            <p className="subtitle">View, export, and share your NIE timetable</p>
          </header>

          <div className="upload-section no-print">
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="file-input"
              />
              <span className="file-button"><Upload size={18} /> Upload Timetable HTML</span>
            </label>
            <div className="upload-divider">
              <span>or</span>
            </div>
            <label className="file-input-label">
              <input
                type="file"
                accept=".ics"
                onChange={handleIcsFileChange}
                className="file-input"
              />
              <span className="file-button file-button-secondary"><FileText size={18} /> Load Saved ICS</span>
            </label>
          </div>

          <HelpPage onUploadClick={() => fileInputRef.current?.click()} />
        </>
      )}

      {error && (
        <div className="error-message no-print">
          <p>{error}</p>
        </div>
      )}

      {events && (
        <div className="results">
          <div className="filters-section no-print">
            <div className="search-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search courses, venues, tutors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <label className="hide-past-toggle">
                <input
                  type="checkbox"
                  checked={hidePastDates}
                  onChange={(e) => setHidePastDates(e.target.checked)}
                />
                <span>Hide past</span>
              </label>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  <X size={14} /> Clear
                </button>
              )}
            </div>
            <div className="course-filters">
              {uniqueCourses.map(course => (
                <button
                  key={course}
                  className={`course-filter-btn ${selectedCourses.has(course) ? 'active' : ''}`}
                  style={{
                    backgroundColor: selectedCourses.has(course) || selectedCourses.size === 0
                      ? courseColorMap.get(course)
                      : '#ccc',
                    opacity: selectedCourses.size === 0 || selectedCourses.has(course) ? 1 : 0.5
                  }}
                  onClick={() => toggleCourse(course)}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>

          <p className="events-count no-print">
            Showing <strong>{filteredCount}</strong>
            {hasActiveFilters && ` of ${totalEvents}`} events
            {` across ${groupedByDate.length} days`}
          </p>

          <div className="events-preview" ref={printRef}>
            <h2 className="print-title print-only">NIcEr Timetable</h2>
            {groupedByDate.length === 0 ? (
              <div className="no-results">No events match your filters</div>
            ) : (
              groupedByDate.map((group) => (
                  <div key={group.sortKey} className="date-group">
                    <div className={`date-header ${isToday(group.sortKey) ? 'date-header-today' : ''}`}>
                      <span>{group.date}{isToday(group.sortKey) && ' (TODAY)'}</span>
                    </div>
                    <ul>
                      {group.events.map((event, i) => (
                        <li key={i}>
                          <span className="event-time">
                            <span className="time-start">{formatTime12Hour(event.startTime)}</span>
                            <span className="time-separator">–</span>
                            <span className="time-end">{formatTime12Hour(event.endTime)}</span>
                          </span>
                          <span className="course-tag-wrapper">
                            <span
                              className="course-tag clickable"
                              style={{ backgroundColor: courseColorMap.get(event.course) }}
                              onClick={() => {
                                // If no filters are active, exclusively select this course
                                // Otherwise, toggle it normally
                                if (selectedCourses.size === 0) {
                                  setSelectedCourses(new Set([event.course]));
                                } else {
                                  toggleCourse(event.course);
                                }
                              }}
                              title={`Filter by ${event.course}`}
                            >
                              {event.course}
                            </span>
                          </span>
                          <span className="event-group">{event.group}</span>
                          {event.venue && <span className="event-venue">@ {formatVenue(event.venue)}</span>}
                          {event.tutor && (
                            showTutor ? (
                              <span className="event-tutor">
                                <User size={14} />
                                {formatTutor(event.tutor)}
                              </span>
                            ) : (
                              <span className="event-tutor-icon" title={formatTutor(event.tutor)}>
                                <User size={14} />
                              </span>
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )
            )}
          </div>

          <div className="actions no-print">
            <button onClick={handleDownload} className="download-button">
              <Download size={16} /> Download .ics
            </button>
            <button onClick={handleShare} className="share-button">
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => setShowOptions(true)} className="options-button">
              <Settings size={14} /> Options
            </button>
          </div>
        </div>
      )}

      {shareMessage && (
        <div className="share-toast">{shareMessage}</div>
      )}

      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Timetable?</h3>
            <p>This will clear your uploaded timetable data. You'll need to upload a new file to view events again.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={confirmReset}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="modal-overlay" onClick={cancelLoadSharedData}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Load Shared Timetable?</h3>
            <p>You have existing timetable data. Do you want to replace it with the shared data?</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={cancelLoadSharedData}>Cancel</button>
              <button className="modal-confirm-primary" onClick={confirmLoadSharedData}>Replace</button>
            </div>
          </div>
        </div>
      )}

      {showOptions && (
        <div className="modal-overlay" onClick={() => setShowOptions(false)}>
          <div className="options-panel" onClick={(e) => e.stopPropagation()}>
            <div className="options-header">
              <h3>Options</h3>
              <button className="options-close" onClick={() => setShowOptions(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="options-section">
              <h4>Display</h4>
              <label className="options-toggle">
                <span>Show tutor names</span>
                <input
                  type="checkbox"
                  checked={showTutor}
                  onChange={(e) => setShowTutor(e.target.checked)}
                />
              </label>
              <label className="options-toggle">
                <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
                <button
                  className="options-theme-btn"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? 'Switch to light' : 'Switch to dark'}
                </button>
              </label>
            </div>

            <div className="options-section">
              <h4>Data</h4>
              <div className="options-file-info">
                <span className="options-file-label">Current file</span>
                <span className="options-file-name">{fileName}</span>
              </div>
              <div className="options-buttons">
                <label className="options-btn">
                  <input
                    ref={optionsFileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => {
                      handleFileChange(e);
                      setShowOptions(false);
                    }}
                    className="file-input"
                  />
                  <Upload size={14} /> Change file
                </label>
                <button className="options-btn options-btn-danger" onClick={() => {
                  setShowOptions(false);
                  handleReset();
                }}>
                  <RotateCcw size={14} /> Reset data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
