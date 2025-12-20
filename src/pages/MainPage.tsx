import './MainPage.scss';

import {
  ArrowLeft,
  Download,
  GitCompare,
  HelpCircle,
  Menu,
  Search,
  Settings,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  CompareFilters,
  CompareModal,
  EventsCompareView,
  EventsList,
  FilterSection,
  Modal,
  OptionsPanel,
  PrivacyNoticeModal,
  ShareSelectModal,
  ShareWelcomeModal,
  UploadSection,
} from '../components';
import type { UploadSectionHandle } from '../components/UploadSection';
import {
  useDebouncedValue,
  useFilteredEvents,
  useLocalStorage,
  useMainPageState,
  useShareData,
  useTimetableStorage,
} from '../hooks';
import { STORAGE_KEYS, TOAST_DURATION_MS } from '../utils/constants';
import { downloadIcs, generateIcs } from '../utils/generateIcs';
import HelpPage from './HelpPage';

function MainPage() {
  const {
    events,
    setTimetable,
    clearTimetable,
    timetables,
    activeTimetable,
    setActiveTimetable,
    addTimetable,
    renameTimetable,
    deleteTimetable,
    getTimetable,
  } = useTimetableStorage();
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, true);
  const [showTutor, setShowTutor] = useLocalStorage(STORAGE_KEYS.SHOW_TUTOR, true);
  const [switchedToast, setSwitchedToast] = useState<string | null>(null);
  const uploadRef = useRef<UploadSectionHandle>(null);

  const {
    filterState,
    setSearchQuery,
    setSelectedDate,
    setHidePastDates,
    toggleCourse,
    handleCourseClick,
    clearFilters,
    hasActiveFilters,
    resetFiltersForUpload,
    compareState,
    setCompareFilter,
    handleTravelConfigChange,
    handleMealConfigChange,
    handleCompare,
    handleExitCompare,
    uiState,
    setShowOptions,
    setShowShareWelcome,
    setShowPrivacyNotice,
    setShowShareSelect,
    setShowCompareModal,
    setShowCompareExplanation,
    setMobileMenuOpen,
  } = useMainPageState();

  const { searchQuery, selectedCourses, selectedDate, hidePastDates } = filterState;
  const { compareMode, compareTimetables, compareFilter, travelConfig, mealConfig } = compareState;
  const {
    showOptions,
    showShareWelcome,
    showPrivacyNotice,
    showShareSelect,
    showCompareModal,
    showCompareExplanation,
    mobileMenuOpen,
  } = uiState;

  // Debounce search to avoid filtering on every keystroke (uses default 150ms)
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const hasExistingData = Boolean(events && events.length > 0);
  const {
    showShareModal,
    shareMessage,
    tempViewData,
    matchedTimetable,
    shareLinkFallback,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
    clearMatchedTimetable,
    clearShareLinkFallback,
  } = useShareData(hasExistingData, timetables);

  const displayEvents = tempViewData?.events ?? events;
  const isViewingTemp = tempViewData !== null;

  const { groupedByDate, totalEvents, courseColorMap, uniqueCourses, filteredCount } =
    useFilteredEvents(
      displayEvents,
      debouncedSearchQuery,
      selectedCourses,
      hidePastDates,
      selectedDate
    );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (matchedTimetable) {
      setActiveTimetable(matchedTimetable.id);
      clearMatchedTimetable();
      queueMicrotask(() => {
        setSwitchedToast(`Switched to "${matchedTimetable.name}"`);
        setTimeout(() => setSwitchedToast(null), TOAST_DURATION_MS);
      });
    }
  }, [matchedTimetable, setActiveTimetable, clearMatchedTimetable]);

  useEffect(() => {
    const sharedData = getImmediateShareData();
    if (sharedData) setTimetable(sharedData.events, sharedData.fileName);
  }, [getImmediateShareData, setTimetable]);

  const handleUpload = (parsedEvents: typeof events, fileName: string) => {
    setError(null);
    resetFiltersForUpload();
    setTimetable(parsedEvents, fileName);
  };

  const handleDownload = () => {
    if (displayEvents) downloadIcs(generateIcs(displayEvents));
  };

  const handleShare = () => {
    if (timetables.length > 1) setShowShareSelect(true);
    else if (activeTimetable)
      createShareLink(activeTimetable.events, activeTimetable.fileName || activeTimetable.name);
  };

  const handleShareTimetable = (timetable: (typeof timetables)[0]) => {
    setShowShareSelect(false);
    createShareLink(timetable.events, timetable.fileName || timetable.name);
  };

  const handleViewingToast = (name: string) => {
    setSwitchedToast(`Now viewing "${name}"`);
    setTimeout(() => setSwitchedToast(null), TOAST_DURATION_MS);
  };

  const handleAddShareData = () => {
    const sharedData = confirmShare();
    if (sharedData) {
      const newId = addTimetable(sharedData.events, sharedData.fileName);
      setActiveTimetable(newId);
    }
  };

  const handleCompareClick = () => {
    if (timetables.length < 2) {
      setShowCompareExplanation(true);
    } else {
      setShowCompareModal(true);
    }
  };

  const getCompareTooltip = () => {
    if (timetables.length === 0) return 'Add a timetable first';
    if (timetables.length === 1) return 'Learn about comparing timetables';
    return compareMode ? 'Change comparison' : 'Compare timetables';
  };

  const leftTimetable = useMemo(
    () => (compareTimetables ? getTimetable(compareTimetables[0]) : null),
    [compareTimetables, getTimetable]
  );
  const rightTimetable = useMemo(
    () => (compareTimetables ? getTimetable(compareTimetables[1]) : null),
    [compareTimetables, getTimetable]
  );

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
              onClick={handleCompareClick}
              className={`header-btn ${compareMode ? 'header-btn-active' : ''}`}
              disabled={timetables.length === 0}
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
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <button
                onClick={() => {
                  handleCompareClick();
                  setMobileMenuOpen(false);
                }}
                disabled={timetables.length === 0}
              >
                <GitCompare size={18} /> Compare
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setMobileMenuOpen(false);
                }}
              >
                <Download size={18} /> Download .ics
              </button>
              <button
                onClick={() => {
                  handleShare();
                  setMobileMenuOpen(false);
                }}
              >
                <Share2 size={18} /> Share (copy timetable link)
              </button>
              <button
                onClick={() => {
                  setShowOptions(true);
                  setMobileMenuOpen(false);
                }}
              >
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
          <UploadSection
            ref={uploadRef}
            onUpload={handleUpload}
            onError={setError}
            onClear={clearTimetable}
            onFirstUpload={() => setShowShareWelcome(true)}
          />
          <HelpPage
            onUploadClick={() => uploadRef.current?.triggerUpload()}
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

          {compareMode && leftTimetable && rightTimetable ? (
            <>
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
                    className="header-btn exit-compare-btn"
                    onClick={handleExitCompare}
                    title="Exit compare mode"
                  >
                    Exit Compare
                  </button>
                </div>
                <CompareFilters
                  compareFilter={compareFilter}
                  onFilterChange={setCompareFilter}
                  travelConfig={travelConfig}
                  onTravelConfigChange={handleTravelConfigChange}
                  mealConfig={mealConfig}
                  onMealConfigChange={handleMealConfigChange}
                  leftName={leftTimetable.name}
                  rightName={rightTimetable.name}
                />
              </div>
              <div className="compare-headers-row no-print">
                <div className="compare-column-header">
                  <span className="compare-column-name">{leftTimetable.name}</span>
                </div>
                <div className="compare-column-header">
                  <span className="compare-column-name">{rightTimetable.name}</span>
                </div>
              </div>
              <div className="events-preview">
                <EventsCompareView
                  leftTimetable={leftTimetable}
                  rightTimetable={rightTimetable}
                  searchQuery={debouncedSearchQuery}
                  compareFilter={compareFilter}
                  travelConfig={travelConfig}
                  mealConfig={mealConfig}
                  showTutor={false}
                  courseColorMap={courseColorMap}
                />
              </div>
            </>
          ) : (
            <>
              {activeTimetable && (
                <div className="mobile-timetable-label">
                  <span>Showing:</span>
                  <span className="mobile-timetable-name">{activeTimetable.name}</span>
                </div>
              )}
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
                {activeTimetable && (
                  <span className="events-count-timetable"> from {activeTimetable.name}</span>
                )}
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
      {switchedToast && <div className="share-toast">{switchedToast}</div>}

      {showShareModal && (
        <Modal
          title="Add Shared Timetable?"
          onClose={cancelShare}
          onConfirm={handleAddShareData}
          confirmText="Add to Timetables"
          confirmVariant="primary"
          onSecondary={viewTempShare}
          secondaryText="Just View"
        >
          <p>
            Would you like to add this shared timetable to your collection, or just view it
            temporarily?
          </p>
        </Modal>
      )}

      {shareLinkFallback && (
        <Modal
          title={`Share "${shareLinkFallback.name}"`}
          onClose={clearShareLinkFallback}
          onConfirm={clearShareLinkFallback}
          confirmText="Done"
          confirmVariant="primary"
          cancelText=""
        >
          <p>Copy this link to share:</p>
          <input
            type="text"
            className="share-link-input"
            value={shareLinkFallback.url}
            readOnly
            onFocus={(e) => e.target.select()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </Modal>
      )}

      {showOptions && (
        <OptionsPanel
          darkMode={darkMode}
          showTutor={showTutor}
          onClose={() => setShowOptions(false)}
          onDarkModeChange={setDarkMode}
          onShowTutorChange={setShowTutor}
          onShowPrivacy={() => setShowPrivacyNotice(true)}
          timetables={timetables}
          activeTimetableId={activeTimetable?.id || null}
          onSetActiveTimetable={setActiveTimetable}
          onAddTimetable={addTimetable}
          onRenameTimetable={renameTimetable}
          onDeleteTimetable={deleteTimetable}
          onViewingToast={handleViewingToast}
        />
      )}
      {showShareWelcome && <ShareWelcomeModal onClose={() => setShowShareWelcome(false)} />}
      {showPrivacyNotice && <PrivacyNoticeModal onClose={() => setShowPrivacyNotice(false)} />}
      {showShareSelect && (
        <ShareSelectModal
          timetables={timetables}
          onShare={handleShareTimetable}
          onClose={() => setShowShareSelect(false)}
        />
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

      {showCompareExplanation && (
        <Modal
          title="Compare Timetables"
          onClose={() => setShowCompareExplanation(false)}
          onConfirm={() => {
            setShowCompareExplanation(false);
            setShowOptions(true);
          }}
          confirmText="Go to Options"
          confirmVariant="primary"
        >
          <p>Compare your timetable side-by-side with a friend's to find:</p>
          <ol className="compare-explanation-list">
            <li>Days you're both on campus</li>
            <li>Identical free slots</li>
            <li>Time to travel together</li>
            <li>Lunch or dinner breaks together</li>
          </ol>
          <p>
            To get started, add another timetable in <strong>Options → Timetables</strong> using a
            share link or file.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default MainPage;
