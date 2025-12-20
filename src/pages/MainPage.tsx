import './MainPage.scss';

import {
  ArrowLeft,
  Download,
  GitCompare,
  HelpCircle,
  Menu,
  Plus,
  Search,
  Settings,
  Share2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AddEventModal,
  CompareFilters,
  CompareModal,
  EventsCompareView,
  EventsList,
  ExportMenu,
  ExportOptionsModal,
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
  useCustomEvents,
  useDebouncedValue,
  useFilteredEvents,
  useLocalStorage,
  useMainPageState,
  useShareData,
  useTimetableStorage,
} from '../hooks';
import type { CustomEventInput } from '../hooks/useCustomEvents';
import type { CustomEvent } from '../types';
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

  // Custom events
  const { customEvents, addCustomEvent, updateCustomEvent, deleteCustomEvent, getCustomEvent } =
    useCustomEvents(activeTimetable?.id || null);
  const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
  const [editingCustomEvent, setEditingCustomEvent] = useState<CustomEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<{
    id: string;
    sortKey: string;
  } | null>(null);
  const [pendingExportAction, setPendingExportAction] = useState<'download' | 'share' | null>(null);

  const {
    filterState,
    setSearchQuery,
    setSelectedDate,
    setShowPastDates,
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
    setOptionsPanelOpen,
    setShareWelcomeModalOpen,
    setPrivacyNoticeModalOpen,
    setShareSelectModalOpen,
    setCompareModalOpen,
    setCompareExplanationModalOpen,
    setMobileMenuOpen,
  } = useMainPageState();

  const { searchQuery, selectedCourses, selectedDate, showPastDates } = filterState;
  const { compareMode, compareTimetables, compareFilter, travelConfig, mealConfig } = compareState;
  const {
    isOptionsPanelOpen,
    isShareWelcomeModalOpen,
    isPrivacyNoticeModalOpen,
    isShareSelectModalOpen,
    isCompareModalOpen,
    isCompareExplanationModalOpen,
    isMobileMenuOpen,
  } = uiState;

  // Debounce search to avoid filtering on every keystroke (uses default 150ms)
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const hasExistingData = Boolean(events && events.length > 0);
  const {
    isShareModalOpen,
    shareMessage,
    previewData,
    matchedTimetable,
    manualShareModal,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
    clearMatchedTimetable,
    clearManualShareModal,
  } = useShareData(hasExistingData, timetables);

  const displayEvents = previewData?.events ?? events;
  const isViewingPreview = previewData !== null;

  // Only show custom events when viewing the active timetable (not preview)
  const displayCustomEvents = isViewingPreview ? [] : customEvents;

  const { groupedByDate, totalEvents, courseColorMap, uniqueCourses, filteredCount } =
    useFilteredEvents(
      displayEvents,
      displayCustomEvents,
      debouncedSearchQuery,
      selectedCourses,
      showPastDates,
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
    if (!displayEvents) return;
    // If custom events exist, show options modal first
    if (customEvents.length > 0) {
      setPendingExportAction('download');
    } else {
      downloadIcs(generateIcs(displayEvents));
    }
  };

  const handleShare = () => {
    // If custom events exist, show options modal first
    if (customEvents.length > 0) {
      setPendingExportAction('share');
    } else if (timetables.length > 1) {
      setShareSelectModalOpen(true);
    } else if (activeTimetable) {
      createShareLink(activeTimetable.events, activeTimetable.fileName || activeTimetable.name);
    }
  };

  const handleExportConfirm = (includeCustomEvents: boolean) => {
    const action = pendingExportAction;
    setPendingExportAction(null);

    if (!displayEvents || !activeTimetable) return;

    // Merge custom events if user chose to include them
    const eventsToExport = includeCustomEvents
      ? [...displayEvents, ...customEvents]
      : displayEvents;

    if (action === 'download') {
      downloadIcs(generateIcs(eventsToExport));
    } else if (action === 'share') {
      if (timetables.length > 1) {
        // For share select modal, we need to handle custom event inclusion differently
        // Store the choice and pass through
        setShareSelectModalOpen(true);
      } else {
        createShareLink(eventsToExport, activeTimetable.fileName || activeTimetable.name);
      }
    }
  };

  const handleExportCancel = () => {
    setPendingExportAction(null);
  };

  const handleShareTimetable = (timetable: (typeof timetables)[0]) => {
    setShareSelectModalOpen(false);
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
      setCompareExplanationModalOpen(true);
    } else {
      setCompareModalOpen(true);
    }
  };

  const getCompareTooltip = () => {
    if (timetables.length === 0) return 'Add a timetable first';
    if (timetables.length === 1) return 'Learn about comparing timetables';
    return compareMode ? 'Change comparison' : 'Compare timetables';
  };

  // Custom event handlers
  const handleAddEventClick = useCallback(() => {
    setEditingCustomEvent(null);
    setAddEventModalOpen(true);
  }, []);

  const handleEditCustomEvent = useCallback(
    (eventId: string) => {
      const event = getCustomEvent(eventId);
      if (event) {
        setEditingCustomEvent(event);
        setAddEventModalOpen(true);
      }
    },
    [getCustomEvent]
  );

  const handleDeleteCustomEvent = useCallback((eventId: string, sortKey: string) => {
    setDeletingEvent({ id: eventId, sortKey });
  }, []);

  // Get the event being deleted to check date count
  const deletingEventData = deletingEvent ? getCustomEvent(deletingEvent.id) : null;
  const isMultiDateDelete = deletingEventData && deletingEventData.dates.length > 1;

  // Convert sortKey (YYYYMMDD) to YYYY-MM-DD format for matching
  const sortKeyToIsoDate = (sortKey: string): string => {
    const year = sortKey.slice(0, 4);
    const month = sortKey.slice(4, 6);
    const day = sortKey.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  const confirmDeleteCustomEvent = useCallback(
    (deleteAll: boolean) => {
      if (!deletingEvent || !deletingEventData) return;

      if (deleteAll || deletingEventData.dates.length === 1) {
        // Delete the entire event
        deleteCustomEvent(deletingEvent.id);
      } else {
        // Remove only this date from the event
        const dateToRemove = sortKeyToIsoDate(deletingEvent.sortKey);
        const newDates = deletingEventData.dates.filter((d) => d !== dateToRemove);
        updateCustomEvent(deletingEvent.id, { dates: newDates });
      }
      setDeletingEvent(null);
    },
    [deletingEvent, deletingEventData, deleteCustomEvent, updateCustomEvent]
  );

  const handleSaveCustomEvent = useCallback(
    (eventInput: CustomEventInput) => {
      if (editingCustomEvent) {
        updateCustomEvent(editingCustomEvent.id, eventInput);
      } else {
        addCustomEvent(eventInput);
      }
      setAddEventModalOpen(false);
      setEditingCustomEvent(null);
    },
    [editingCustomEvent, addCustomEvent, updateCustomEvent]
  );

  const handleCloseAddEventModal = useCallback(() => {
    setAddEventModalOpen(false);
    setEditingCustomEvent(null);
  }, []);

  const leftTimetable = useMemo(
    () => (compareTimetables ? getTimetable(compareTimetables[0]) : null),
    [compareTimetables, getTimetable]
  );
  const rightTimetable = useMemo(
    () => (compareTimetables ? getTimetable(compareTimetables[1]) : null),
    [compareTimetables, getTimetable]
  );

  return (
    <div className={`main-page ${isMobileMenuOpen ? 'menu-open' : ''}`}>
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
            <button onClick={handleAddEventClick} className="header-btn" title="Add custom event">
              <Plus size={14} /> Add Event
            </button>
            <button
              onClick={handleCompareClick}
              className={`header-btn ${compareMode ? 'header-btn-active' : ''}`}
              disabled={timetables.length === 0}
              title={getCompareTooltip()}
            >
              <GitCompare size={14} /> {compareMode ? 'Comparing' : 'Compare'}
            </button>
            <ExportMenu onDownload={handleDownload} onShare={handleShare} />
            <button onClick={() => setOptionsPanelOpen(true)} className="header-btn">
              <Settings size={14} /> Options
            </button>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {isMobileMenuOpen && (
            <div className="mobile-menu">
              <button
                onClick={() => {
                  handleAddEventClick();
                  setMobileMenuOpen(false);
                }}
              >
                <Plus size={18} /> Add Event
              </button>
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
                  setOptionsPanelOpen(true);
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
            onFirstUpload={() => setShareWelcomeModalOpen(true)}
          />
          <HelpPage
            onUploadClick={() => uploadRef.current?.triggerUpload()}
            onPrivacyClick={() => setPrivacyNoticeModalOpen(true)}
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
          {isViewingPreview && (
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
                showPastDates={showPastDates}
                onShowPastChange={setShowPastDates}
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
                  onEditCustomEvent={handleEditCustomEvent}
                  onDeleteCustomEvent={handleDeleteCustomEvent}
                />
              </div>
            </>
          )}
        </div>
      )}

      {shareMessage && <div className="share-toast">{shareMessage}</div>}
      {switchedToast && <div className="share-toast">{switchedToast}</div>}

      {isShareModalOpen && (
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

      {manualShareModal && (
        <Modal
          title={`Share "${manualShareModal.name}"`}
          onClose={clearManualShareModal}
          onConfirm={clearManualShareModal}
          confirmText="Done"
          confirmVariant="primary"
          cancelText=""
        >
          <p>Copy this link to share:</p>
          <input
            type="text"
            className="share-link-input"
            value={manualShareModal.url}
            readOnly
            onFocus={(e) => e.target.select()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </Modal>
      )}

      {deletingEvent && (
        <Modal
          title="Delete Custom Event?"
          onClose={() => setDeletingEvent(null)}
          onConfirm={() => confirmDeleteCustomEvent(true)}
          confirmText={isMultiDateDelete ? 'Delete All Occurrences' : 'Delete'}
          confirmVariant="danger"
          onSecondary={isMultiDateDelete ? () => confirmDeleteCustomEvent(false) : undefined}
          secondaryText={isMultiDateDelete ? 'Delete This Occurrence' : undefined}
        >
          <p>
            {isMultiDateDelete
              ? `This event has ${deletingEventData?.dates.length} occurrences. Delete just this one or all?`
              : 'This action cannot be undone.'}
          </p>
        </Modal>
      )}

      {isOptionsPanelOpen && (
        <OptionsPanel
          darkMode={darkMode}
          showTutor={showTutor}
          onClose={() => setOptionsPanelOpen(false)}
          onDarkModeChange={setDarkMode}
          onShowTutorChange={setShowTutor}
          onShowPrivacy={() => setPrivacyNoticeModalOpen(true)}
          timetables={timetables}
          activeTimetableId={activeTimetable?.id || null}
          onSetActiveTimetable={setActiveTimetable}
          onAddTimetable={addTimetable}
          onRenameTimetable={renameTimetable}
          onDeleteTimetable={deleteTimetable}
          onViewingToast={handleViewingToast}
        />
      )}
      {isShareWelcomeModalOpen && (
        <ShareWelcomeModal onClose={() => setShareWelcomeModalOpen(false)} />
      )}
      {isPrivacyNoticeModalOpen && (
        <PrivacyNoticeModal onClose={() => setPrivacyNoticeModalOpen(false)} />
      )}
      {isShareSelectModalOpen && (
        <ShareSelectModal
          timetables={timetables}
          onShare={handleShareTimetable}
          onClose={() => setShareSelectModalOpen(false)}
        />
      )}
      {isCompareModalOpen && (
        <CompareModal
          timetables={timetables}
          currentSelection={compareTimetables}
          isCompareMode={compareMode}
          onCompare={handleCompare}
          onReset={handleExitCompare}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

      {isCompareExplanationModalOpen && (
        <Modal
          title="Compare Timetables"
          onClose={() => setCompareExplanationModalOpen(false)}
          onConfirm={() => {
            setCompareExplanationModalOpen(false);
            setOptionsPanelOpen(true);
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

      {isAddEventModalOpen && (
        <AddEventModal
          onClose={handleCloseAddEventModal}
          onSave={handleSaveCustomEvent}
          editingEvent={editingCustomEvent}
        />
      )}

      {pendingExportAction && (
        <ExportOptionsModal
          customEventCount={customEvents.length}
          actionLabel={pendingExportAction === 'download' ? 'Download .ics' : 'Share Timetable'}
          onConfirm={handleExportConfirm}
          onCancel={handleExportCancel}
        />
      )}
    </div>
  );
}

export default MainPage;
