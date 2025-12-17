import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, Share2, HelpCircle, Settings } from 'lucide-react';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { generateIcs, downloadIcs } from '../utils/generateIcs';
import { parseIcs } from '../utils/parseIcs';
import { STORAGE_KEYS } from '../utils/constants';
import { useTimetableStorage, useLocalStorage, useShareData, useFilteredEvents } from '../hooks';
import { Modal, OptionsPanel, FilterSection, EventsList } from '../components';
import HelpPage from './HelpPage';
import './MainPage.css';

function MainPage() {
  const { events, fileName, setTimetable, clearTimetable } = useTimetableStorage();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [hidePastDates, setHidePastDates] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, true);
  const [showTutor, setShowTutor] = useLocalStorage(STORAGE_KEYS.SHOW_TUTOR, true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExistingData = Boolean(events && events.length > 0);
  const {
    showShareModal,
    shareMessage,
    createShareLink,
    confirmShare,
    cancelShare,
    getImmediateShareData,
  } = useShareData(hasExistingData);

  const {
    groupedByDate,
    totalEvents,
    courseColorMap,
    uniqueCourses,
    filteredCount,
  } = useFilteredEvents(events, searchQuery, selectedCourses, hidePastDates);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Load shared data immediately if no existing data
  useEffect(() => {
    const sharedData = getImmediateShareData();
    if (sharedData) {
      setTimetable(sharedData.events, sharedData.fileName);
    }
  }, [getImmediateShareData, setTimetable]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSearchQuery('');
    setSelectedCourses(new Set());

    try {
      const text = await file.text();
      const parsedEvents = parseHtmlTimetable(text);
      setTimetable(parsedEvents, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      clearTimetable();
    }
  };

  const handleIcsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSearchQuery('');
    setSelectedCourses(new Set());

    try {
      const text = await file.text();
      const parsedEvents = parseIcs(text);
      setTimetable(parsedEvents, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse ICS file');
      clearTimetable();
    }
  };

  const handleDownload = () => {
    if (!events) return;
    const ics = generateIcs(events);
    downloadIcs(ics);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    clearTimetable();
    setError(null);
    setSearchQuery('');
    setSelectedCourses(new Set());
    setShowResetModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShare = () => {
    if (!events || !fileName) return;
    createShareLink(events, fileName);
  };

  const handleConfirmShareData = () => {
    const sharedData = confirmShare();
    if (sharedData) {
      setTimetable(sharedData.events, sharedData.fileName);
    }
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(course)) {
        newSet.delete(course);
      } else {
        newSet.add(course);
      }
      return newSet;
    });
  };

  const handleCourseClick = (course: string) => {
    if (selectedCourses.size === 0) {
      setSelectedCourses(new Set([course]));
    } else {
      toggleCourse(course);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourses(new Set());
  };

  const hasActiveFilters = selectedCourses.size > 0 || searchQuery.length > 0;

  return (
    <div className="main-page">
      {events ? (
        <div className="compact-header no-print">
          <h1>
            <img src="/schedule.png" alt="" className="brand-icon" width={26} height={26} />
            <span className="brand-letter">N</span>
            <span className="brand-letter">I</span>
            <span className="brand-small">c</span>
            <span className="brand-letter">E</span>
            <span className="brand-small">r</span> Timetable
          </h1>
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
            <h1>
              <img src="/schedule.png" alt="" className="brand-icon" width={36} height={36} />
              <span className="brand-letter">N</span>
              <span className="brand-letter">I</span>
              <span className="brand-small">c</span>
              <span className="brand-letter">E</span>
              <span className="brand-small">r</span> Timetable
            </h1>
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
              <span className="file-button">
                <Upload size={18} /> Upload Timetable HTML
              </span>
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
              <span className="file-button file-button-secondary">
                <FileText size={18} /> Load Saved ICS
              </span>
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
          <FilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hidePastDates={hidePastDates}
            onHidePastChange={setHidePastDates}
            uniqueCourses={uniqueCourses}
            selectedCourses={selectedCourses}
            courseColorMap={courseColorMap}
            onToggleCourse={toggleCourse}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <p className="events-count no-print">
            Showing <strong>{filteredCount}</strong>
            {hasActiveFilters && ` of ${totalEvents}`} events
            {` across ${groupedByDate.length} days`}
          </p>

          <div className="events-preview">
            <h2 className="print-title print-only">NIcEr Timetable</h2>
            <EventsList
              groupedByDate={groupedByDate}
              courseColorMap={courseColorMap}
              showTutor={showTutor}
              onCourseClick={handleCourseClick}
            />
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

      {shareMessage && <div className="share-toast">{shareMessage}</div>}

      {showResetModal && (
        <Modal
          title="Reset Timetable?"
          onClose={() => setShowResetModal(false)}
          onConfirm={confirmReset}
          confirmText="Reset"
        >
          <p>
            This will clear your uploaded timetable data. You'll need to upload a new file to view
            events again.
          </p>
        </Modal>
      )}

      {showShareModal && (
        <Modal
          title="Load Shared Timetable?"
          onClose={cancelShare}
          onConfirm={handleConfirmShareData}
          confirmText="Replace"
          confirmVariant="primary"
        >
          <p>You have existing timetable data. Do you want to replace it with the shared data?</p>
        </Modal>
      )}

      {showOptions && (
        <OptionsPanel
          fileName={fileName}
          darkMode={darkMode}
          showTutor={showTutor}
          onClose={() => setShowOptions(false)}
          onDarkModeChange={setDarkMode}
          onShowTutorChange={setShowTutor}
          onFileChange={handleFileChange}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default MainPage;
