import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, Share2, HelpCircle, Settings, ArrowLeft, Menu, X, GitCompare, Search } from 'lucide-react';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { generateIcs, downloadIcs } from '../utils/generateIcs';
import { parseIcs } from '../utils/parseIcs';
import { STORAGE_KEYS } from '../utils/constants';
import type { CompareFilter, TravelDirection, MealType } from '../utils/constants';
import { useTimetableStorage, useLocalStorage, useShareData, useFilteredEvents } from '../hooks';
import { Modal, OptionsPanel, FilterSection, EventsList, ShareWelcomeModal, PrivacyNoticeModal, CompareModal, CompareFilters, EventsCompareView } from '../components';
import HelpPage from './HelpPage';
import './MainPage.css';

function MainPage() {
  const { events, fileName, setTimetable, clearTimetable, timetables, addTimetable, renameTimetable, deleteTimetable, getTimetable } = useTimetableStorage();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hidePastDates, setHidePastDates] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showShareWelcome, setShowShareWelcome] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, true);
  const [showTutor, setShowTutor] = useLocalStorage(STORAGE_KEYS.SHOW_TUTOR, true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compare mode state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTimetables, setCompareTimetables] = useState<[string, string] | null>(null);
  const [compareFilter, setCompareFilter] = useState<CompareFilter>('none');
  const [travelDirection, setTravelDirection] = useState<TravelDirection>('both');
  const [waitMinutes, setWaitMinutes] = useState(15);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [lunchStart, setLunchStart] = useState(11); // 11am
  const [lunchEnd, setLunchEnd] = useState(14); // 2pm
  const [dinnerStart, setDinnerStart] = useState(17); // 5pm
  const [dinnerEnd, setDinnerEnd] = useState(20); // 8pm

  // Check if compare is available (need at least 2 timetables)
  const canCompare = timetables.length >= 2;

  const hasExistingData = Boolean(events && events.length > 0);
  const {
    showShareModal,
    shareMessage,
    tempViewData,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
  } = useShareData(hasExistingData, events);

  // Determine which events to display (temp view or stored)
  const displayEvents = tempViewData?.events ?? events;
  const displayFileName = tempViewData?.fileName ?? fileName;
  const isViewingTemp = tempViewData !== null;

  const {
    groupedByDate,
    totalEvents,
    courseColorMap,
    uniqueCourses,
    filteredCount,
  } = useFilteredEvents(displayEvents, searchQuery, selectedCourses, hidePastDates, selectedDate);

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

      // Show share welcome modal on first HTML upload
      const hasSeenTip = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_SHARE_TIP);
      if (!hasSeenTip) {
        setShowShareWelcome(true);
        localStorage.setItem(STORAGE_KEYS.HAS_SEEN_SHARE_TIP, 'true');
      }
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

  // Unified handler for Options panel (detects file type)
  const handleAnyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.ics')) {
      handleIcsFileChange(e);
    } else {
      handleFileChange(e);
    }
  };

  const handleDownload = () => {
    if (!displayEvents) return;
    const ics = generateIcs(displayEvents);
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
    if (!displayEvents || !displayFileName) return;
    createShareLink(displayEvents, displayFileName);
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
    setSelectedDate(null);
  };

  const hasActiveFilters = selectedCourses.size > 0 || searchQuery.length > 0 || selectedDate !== null;

  // Compare mode handlers
  const handleCompare = (selection: [string, string]) => {
    setCompareTimetables(selection);
    setCompareMode(true);
    setShowCompareModal(false);
    // Reset compare filters when starting new comparison
    setCompareFilter('none');
  };

  const handleExitCompare = () => {
    setCompareMode(false);
    setCompareTimetables(null);
    setCompareFilter('none');
    setShowCompareModal(false);
  };

  // Get compare tooltip based on state
  const getCompareTooltip = () => {
    if (timetables.length === 0) return 'Add a timetable first';
    if (timetables.length === 1) return 'Add another timetable to compare';
    return compareMode ? 'Change comparison' : 'Compare timetables';
  };

  return (
    <div className={`main-page ${mobileMenuOpen ? 'menu-open' : ''}`}>
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
          <div className="header-actions desktop-only">
            <button
              onClick={() => setShowCompareModal(true)}
              className={`header-btn ${compareMode ? 'header-btn-active' : ''}`}
              disabled={!canCompare}
              title={getCompareTooltip()}
            >
              <GitCompare size={14} /> {compareMode ? 'Comparing' : 'Compare'}
            </button>
            <button onClick={handleDownload} className="header-btn">
              <Download size={16} /> Download .ics
            </button>
            <button onClick={handleShare} className="header-btn">
              <Share2 size={14} /> Share (copy timetable link)
            </button>
            <button onClick={() => setShowOptions(true)} className="header-btn">
              <Settings size={14} /> Options
            </button>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <button onClick={() => { handleDownload(); setMobileMenuOpen(false); }}>
                <Download size={18} /> Download .ics
              </button>
              <button onClick={() => { handleShare(); setMobileMenuOpen(false); }}>
                <Share2 size={18} /> Share (copy timetable link)
              </button>
              <button onClick={() => { setShowOptions(true); setMobileMenuOpen(false); }}>
                <Settings size={18} /> Options
              </button>
              <a
                href="https://github.com/wpinrui/nicer-tt/blob/main/GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle size={18} /> Help & Guide
              </a>
            </div>
          )}
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

          <HelpPage
            onUploadClick={() => fileInputRef.current?.click()}
            onPrivacyClick={() => setShowPrivacyNotice(true)}
          />
        </>
      )}

      {error && (
        <div className="error-message no-print">
          <p>{error}</p>
        </div>
      )}

      {displayEvents && (
        <div className="results">
          {isViewingTemp && (
            <div className="temp-view-banner no-print">
              <span>Viewing shared timetable</span>
              <button onClick={exitTempView} className="temp-view-back-btn">
                <ArrowLeft size={14} /> Back to my timetable
              </button>
            </div>
          )}

          {/* Compare mode view */}
          {compareMode && compareTimetables ? (
            <>
              {/* Search bar for compare mode */}
              <div className="filters-section no-print">
                <div className="search-row">
                  <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search both timetables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className="header-btn"
                    onClick={handleExitCompare}
                    title="Exit compare mode"
                  >
                    Exit Compare
                  </button>
                </div>
                <CompareFilters
                  compareFilter={compareFilter}
                  onFilterChange={setCompareFilter}
                  travelDirection={travelDirection}
                  onTravelDirectionChange={setTravelDirection}
                  waitMinutes={waitMinutes}
                  onWaitMinutesChange={setWaitMinutes}
                  mealType={mealType}
                  onMealTypeChange={setMealType}
                  lunchStart={lunchStart}
                  onLunchStartChange={setLunchStart}
                  lunchEnd={lunchEnd}
                  onLunchEndChange={setLunchEnd}
                  dinnerStart={dinnerStart}
                  onDinnerStartChange={setDinnerStart}
                  dinnerEnd={dinnerEnd}
                  onDinnerEndChange={setDinnerEnd}
                  leftName={getTimetable(compareTimetables[0])?.name || 'Left'}
                  rightName={getTimetable(compareTimetables[1])?.name || 'Right'}
                />
              </div>

              {/* Column headers - outside scrollable area */}
              <div className="compare-headers-row no-print">
                <div className="compare-column-header">
                  <span className="compare-column-name">{getTimetable(compareTimetables[0])?.name || 'Left'}</span>
                </div>
                <div className="compare-column-header">
                  <span className="compare-column-name">{getTimetable(compareTimetables[1])?.name || 'Right'}</span>
                </div>
              </div>

              <div className="events-preview">
                <EventsCompareView
                  leftTimetable={getTimetable(compareTimetables[0])!}
                  rightTimetable={getTimetable(compareTimetables[1])!}
                  searchQuery={searchQuery}
                  compareFilter={compareFilter}
                  travelDirection={travelDirection}
                  waitMinutes={waitMinutes}
                  mealType={mealType}
                  lunchStart={lunchStart}
                  lunchEnd={lunchEnd}
                  dinnerStart={dinnerStart}
                  dinnerEnd={dinnerEnd}
                  showTutor={false}
                  courseColorMap={courseColorMap}
                />
              </div>
            </>
          ) : (
            <>
              {/* Normal view */}
              <FilterSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
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
            </>
          )}

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
          onSecondary={viewTempShare}
          secondaryText="Just View"
        >
          <p>You have existing timetable data. Would you like to replace it or just view the shared timetable temporarily?</p>
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
          onFileChange={handleAnyFileChange}
          onReset={handleReset}
          onShowPrivacy={() => setShowPrivacyNotice(true)}
          timetables={timetables}
          onAddTimetable={addTimetable}
          onRenameTimetable={renameTimetable}
          onDeleteTimetable={deleteTimetable}
        />
      )}

      {showShareWelcome && (
        <ShareWelcomeModal onClose={() => setShowShareWelcome(false)} />
      )}

      {showPrivacyNotice && (
        <PrivacyNoticeModal onClose={() => setShowPrivacyNotice(false)} />
      )}

      {showCompareModal && (
        <CompareModal
          timetables={timetables}
          currentSelection={compareTimetables}
          isCompareMode={compareMode}
          onCompare={handleCompare}
          onReset={handleExitCompare}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}

export default MainPage;
