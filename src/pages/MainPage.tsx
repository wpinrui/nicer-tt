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

import type { ExportOptions, ImportOptions } from '../components';
import {
  AddEventModal,
  CompareFilters,
  CompareModal,
  EditEventModal,
  EventsCompareView,
  EventsList,
  ExportMenu,
  ExportOptionsModal,
  FilterSection,
  ImportOptionsModal,
  Modal,
  OptionsPanel,
  PrivacyNoticeModal,
  ShareSelectModal,
  ShareWelcomeModal,
  UploadSection,
} from '../components';
import type { UploadSectionHandle } from '../components/UploadSection';
import {
  toCustomEventInput,
  useCustomEvents,
  useDebouncedValue,
  useEventOverrides,
  useFilteredEvents,
  useLocalStorage,
  useMainPageState,
  useShareData,
  useTimetableStorage,
} from '../hooks';
import type { CustomEventInput } from '../hooks/useCustomEvents';
import type { CustomEvent, EventInstanceKey, ShareData, Timetable } from '../types';
import { applyOverridesToEvents, isShareDataV2 } from '../types';
import { STORAGE_KEYS, TOAST_DURATION_MS } from '../utils/constants';
import { downloadIcs, generateIcs } from '../utils/generateIcs';
import HelpPage from './HelpPage';

/**
 * Filters custom events based on export options.
 */
function filterCustomEventsByType(events: CustomEvent[], options: ExportOptions): CustomEvent[] {
  return events.filter((event) => {
    if (event.eventType === 'upgrading') return options.includeUpgradingEvents;
    return options.includeCustomEvents;
  });
}

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
  const {
    customEvents,
    addCustomEvent,
    addCustomEventToTimetable,
    updateCustomEvent,
    deleteCustomEvent,
    deleteCustomEventsByGroupId,
    getCustomEvent,
    getCustomEventsForTimetable,
  } = useCustomEvents(activeTimetable?.id || null);

  // Event overrides for imported events
  const {
    overrides,
    deletions,
    setOverride,
    clearOverride,
    deleteEvent: deleteImportedEvent,
    getOverride,
    clearAllForTimetable,
  } = useEventOverrides(activeTimetable?.id || null);

  const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
  const [editingCustomEvent, setEditingCustomEvent] = useState<CustomEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<{
    id: string;
    sortKey: string;
  } | null>(null);
  const [editingImportedEvent, setEditingImportedEvent] = useState<{
    eventKey: EventInstanceKey;
    currentVenue: string;
    currentTutor: string;
    currentStartTime: string;
    currentEndTime: string;
  } | null>(null);
  const [deletingImportedEvent, setDeletingImportedEvent] = useState<EventInstanceKey | null>(null);
  const [pendingExportAction, setPendingExportAction] = useState<'download' | 'share' | null>(null);
  const [pendingShareTimetable, setPendingShareTimetable] = useState<Timetable | null>(null);
  const [pendingImportData, setPendingImportData] = useState<ShareData | null>(null);

  const {
    filterState,
    setSearchQuery,
    setSelectedDate,
    setShowPastDates,
    toggleCourse,
    deselectCourse,
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

  // Only apply overrides when viewing the active timetable (not preview)
  const displayOverrides = isViewingPreview
    ? { overrides: {}, deletions: [] }
    : { overrides, deletions };

  const { groupedByDate, totalEvents, courseColorMap, uniqueCourses, filteredCount } =
    useFilteredEvents(
      displayEvents,
      displayCustomEvents,
      debouncedSearchQuery,
      selectedCourses,
      showPastDates,
      selectedDate,
      displayOverrides
    );

  const handleToggleCourse = useCallback(
    (course: string) => toggleCourse(course, uniqueCourses),
    [toggleCourse, uniqueCourses]
  );

  const handleDeselectCourse = useCallback(
    (course: string) => deselectCourse(course, uniqueCourses),
    [deselectCourse, uniqueCourses]
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
    if (sharedData) {
      // Check if V2 format with custom events - show import options modal
      if (isShareDataV2(sharedData) && sharedData.customEvents.length > 0) {
        // First add the timetable with regular events
        const timetableId = setTimetable(sharedData.events, sharedData.fileName);
        if (timetableId) {
          // Then add custom events
          for (const event of sharedData.customEvents) {
            addCustomEventToTimetable(timetableId, toCustomEventInput(event));
          }
        }
      } else {
        setTimetable(sharedData.events, sharedData.fileName);
      }
    }
  }, [getImmediateShareData, setTimetable, addCustomEventToTimetable]);

  const handleUpload = (
    parsedEvents: typeof events,
    fileName: string,
    importedCustomEvents?: CustomEvent[]
  ) => {
    setError(null);
    resetFiltersForUpload();
    const timetableId = setTimetable(parsedEvents, fileName);

    // If ICS file contained custom events, add them to the timetable
    if (importedCustomEvents && importedCustomEvents.length > 0 && timetableId) {
      for (const event of importedCustomEvents) {
        addCustomEventToTimetable(timetableId, toCustomEventInput(event));
      }
    }
  };

  const handleDownload = () => {
    if (!displayEvents) return;
    // If custom events exist, show options modal first
    if (customEvents.length > 0) {
      setPendingExportAction('download');
    } else {
      downloadIcs(generateIcs(displayEvents, { overrides, deletions }));
    }
  };

  const handleShare = () => {
    // If multiple timetables, pick which one to share first
    if (timetables.length > 1) {
      setShareSelectModalOpen(true);
    } else if (activeTimetable) {
      // Single timetable - check if custom events exist
      if (customEvents.length > 0) {
        setPendingShareTimetable(activeTimetable);
        setPendingExportAction('share');
      } else {
        // Apply overrides before sharing
        const eventsWithOverrides = applyOverridesToEvents(
          activeTimetable.events,
          overrides,
          deletions
        );
        createShareLink(eventsWithOverrides, activeTimetable.fileName || activeTimetable.name);
      }
    }
  };

  const handleExportConfirm = (options: ExportOptions) => {
    const action = pendingExportAction;
    setPendingExportAction(null);

    if (action === 'download') {
      if (!displayEvents || !activeTimetable) return;
      const filteredCustomEvents = filterCustomEventsByType(customEvents, options);
      const eventsToExport =
        filteredCustomEvents.length > 0
          ? [...displayEvents, ...filteredCustomEvents]
          : displayEvents;
      downloadIcs(generateIcs(eventsToExport, { overrides, deletions }));
    } else if (action === 'share' && pendingShareTimetable) {
      const timetableCustomEvents = getCustomEventsForTimetable(pendingShareTimetable.id);
      const filteredCustomEvents = filterCustomEventsByType(timetableCustomEvents, options);
      // Apply overrides if sharing the active timetable
      const isActiveTimetable = pendingShareTimetable.id === activeTimetable?.id;
      const eventsToShare = isActiveTimetable
        ? applyOverridesToEvents(pendingShareTimetable.events, overrides, deletions)
        : pendingShareTimetable.events;
      createShareLink(
        eventsToShare,
        pendingShareTimetable.fileName || pendingShareTimetable.name,
        filteredCustomEvents.length > 0 ? filteredCustomEvents : undefined
      );
      setPendingShareTimetable(null);
    }
  };

  const handleExportCancel = () => {
    setPendingExportAction(null);
    setPendingShareTimetable(null);
  };

  const handleShareTimetable = (timetable: (typeof timetables)[0]) => {
    setShareSelectModalOpen(false);

    // Check if this timetable has custom events
    const timetableCustomEvents = getCustomEventsForTimetable(timetable.id);
    if (timetableCustomEvents.length > 0) {
      // Show export options modal to choose which custom events to include
      setPendingShareTimetable(timetable);
      setPendingExportAction('share');
    } else {
      // No custom events, share directly
      // Apply overrides if sharing the active timetable
      const isActiveTimetable = timetable.id === activeTimetable?.id;
      const eventsToShare = isActiveTimetable
        ? applyOverridesToEvents(timetable.events, overrides, deletions)
        : timetable.events;
      createShareLink(eventsToShare, timetable.fileName || timetable.name);
    }
  };

  const handleViewingToast = (name: string) => {
    setSwitchedToast(`Now viewing "${name}"`);
    setTimeout(() => setSwitchedToast(null), TOAST_DURATION_MS);
  };

  const handleAddShareData = () => {
    const sharedData = confirmShare();
    if (!sharedData) return;

    // Check if V2 format with custom events - show import options modal
    if (isShareDataV2(sharedData) && sharedData.customEvents.length > 0) {
      setPendingImportData(sharedData);
    } else {
      // V1 format or no custom events - add directly
      const newId = addTimetable(sharedData.events, sharedData.fileName);
      setActiveTimetable(newId);
    }
  };

  const handleImportConfirm = useCallback(
    (options: ImportOptions) => {
      if (!pendingImportData) return;

      const isV2 = isShareDataV2(pendingImportData);

      // Filter events based on user choices
      const eventsToImport = options.includeRegularEvents ? pendingImportData.events : [];

      // Create timetable if there are events to import
      if (
        eventsToImport.length > 0 ||
        (isV2 && (options.includeCustomEvents || options.includeUpgradingEvents))
      ) {
        const newId = addTimetable(eventsToImport, pendingImportData.fileName);
        setActiveTimetable(newId);

        // Import custom events to the new timetable
        if (isV2) {
          const customEventsToImport = pendingImportData.customEvents.filter((event) => {
            if (event.eventType === 'upgrading') return options.includeUpgradingEvents;
            return options.includeCustomEvents;
          });

          // Add each custom event directly to the new timetable
          for (const event of customEventsToImport) {
            addCustomEventToTimetable(newId, toCustomEventInput(event));
          }
        }
      }

      setPendingImportData(null);
    },
    [pendingImportData, addTimetable, setActiveTimetable, addCustomEventToTimetable]
  );

  const handleImportCancel = useCallback(() => {
    setPendingImportData(null);
  }, []);

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
  // For upgrading courses with groupId, count total sessions (sum of all dates across grouped events)
  const upgradingGroupCount =
    deletingEventData?.groupId && deletingEventData?.eventType === 'upgrading'
      ? customEvents
          .filter((e) => e.groupId === deletingEventData.groupId)
          .reduce((sum, e) => sum + e.dates.length, 0)
      : 0;
  const isMultiDateDelete =
    deletingEventData && (deletingEventData.dates.length > 1 || upgradingGroupCount > 1);
  const canDeleteSingleOccurrence =
    isMultiDateDelete && deletingEventData?.eventType !== 'upgrading';

  const confirmDeleteCustomEvent = useCallback(
    (deleteAll: boolean) => {
      if (!deletingEvent || !deletingEventData) return;

      // Upgrading events with groupId: delete all sessions in the group
      if (deletingEventData.groupId && deletingEventData.eventType === 'upgrading') {
        deleteCustomEventsByGroupId(deletingEventData.groupId);
      } else if (deleteAll || deletingEventData.dates.length === 1) {
        // Delete the entire event
        deleteCustomEvent(deletingEvent.id);
      } else {
        // Remove only this date from the event (sortKey is already YYYY-MM-DD format)
        const newDates = deletingEventData.dates.filter((d) => d !== deletingEvent.sortKey);
        updateCustomEvent(deletingEvent.id, { dates: newDates });
      }
      setDeletingEvent(null);
    },
    [
      deletingEvent,
      deletingEventData,
      deleteCustomEvent,
      deleteCustomEventsByGroupId,
      updateCustomEvent,
    ]
  );

  // Imported event handlers
  const handleEditImportedEvent = useCallback(
    (
      eventKey: EventInstanceKey,
      currentVenue: string,
      currentTutor: string,
      currentStartTime: string,
      currentEndTime: string
    ) => {
      setEditingImportedEvent({
        eventKey,
        currentVenue,
        currentTutor,
        currentStartTime,
        currentEndTime,
      });
    },
    []
  );

  const handleDeleteImportedEvent = useCallback((eventKey: EventInstanceKey) => {
    setDeletingImportedEvent(eventKey);
  }, []);

  const confirmEditImportedEvent = useCallback(
    (override: { venue?: string; tutor?: string; startTime?: string; endTime?: string }) => {
      if (!editingImportedEvent) return;
      setOverride(editingImportedEvent.eventKey, override);
      setEditingImportedEvent(null);
    },
    [editingImportedEvent, setOverride]
  );

  const revertImportedEvent = useCallback(() => {
    if (!editingImportedEvent) return;
    clearOverride(editingImportedEvent.eventKey);
    setEditingImportedEvent(null);
  }, [editingImportedEvent, clearOverride]);

  const confirmDeleteImportedEvent = useCallback(() => {
    if (!deletingImportedEvent) return;
    deleteImportedEvent(deletingImportedEvent);
    setDeletingImportedEvent(null);
  }, [deletingImportedEvent, deleteImportedEvent]);

  const handleRegenerateTimetable = useCallback(
    (newEvents: typeof events, fileName: string) => {
      if (!activeTimetable) return;
      // Update the timetable with new events (keeps the same ID, so custom events are preserved)
      setTimetable(newEvents, fileName);
      // Clear any overrides/deletions since the base data is being replaced
      clearAllForTimetable(activeTimetable.id);
    },
    [activeTimetable, setTimetable, clearAllForTimetable]
  );

  const handleSaveCustomEvent = useCallback(
    (eventInput: CustomEventInput | CustomEventInput[]) => {
      if (editingCustomEvent) {
        // Editing only supports single events
        const input = Array.isArray(eventInput) ? eventInput[0] : eventInput;
        updateCustomEvent(editingCustomEvent.id, input);
      } else {
        // Adding supports both single events and arrays (for upgrading courses)
        const inputs = Array.isArray(eventInput) ? eventInput : [eventInput];
        for (const input of inputs) {
          addCustomEvent(input);
        }
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

  // Get already-added upgrading course names to prevent duplicates
  const addedUpgradingCourseNames = useMemo(() => {
    const names = new Set<string>();
    for (const event of customEvents) {
      if (event.eventType === 'upgrading') {
        names.add(event.description);
      }
    }
    return names;
  }, [customEvents]);

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
                  leftCustomEvents={getCustomEventsForTimetable(leftTimetable.id)}
                  rightCustomEvents={getCustomEventsForTimetable(rightTimetable.id)}
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
                onToggleCourse={handleToggleCourse}
                onDeselectCourse={handleDeselectCourse}
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
                  onEditImportedEvent={handleEditImportedEvent}
                  onDeleteImportedEvent={handleDeleteImportedEvent}
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
          onSecondary={
            canDeleteSingleOccurrence ? () => confirmDeleteCustomEvent(false) : undefined
          }
          secondaryText={canDeleteSingleOccurrence ? 'Delete This Occurrence' : undefined}
        >
          <p>
            {canDeleteSingleOccurrence
              ? `This event has ${deletingEventData?.dates.length} occurrences. Delete just this one or all?`
              : isMultiDateDelete
                ? `This upgrading course has ${upgradingGroupCount || deletingEventData?.dates.length} sessions. Delete all?`
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
          onAddCustomEventsToTimetable={addCustomEventToTimetable}
          onRenameTimetable={renameTimetable}
          onDeleteTimetable={deleteTimetable}
          onViewingToast={handleViewingToast}
          onRegenerateTimetable={handleRegenerateTimetable}
          currentEvents={events ?? undefined}
          overrides={overrides}
          deletions={deletions}
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
          addedUpgradingCourseNames={addedUpgradingCourseNames}
        />
      )}

      {pendingExportAction &&
        (() => {
          // Compute counts based on which timetable we're exporting
          const eventsToCount = pendingShareTimetable
            ? getCustomEventsForTimetable(pendingShareTimetable.id)
            : customEvents;
          let exportCustomCount = 0;
          let exportUpgradingCount = 0;
          for (const event of eventsToCount) {
            if (event.eventType === 'upgrading') {
              exportUpgradingCount++;
            } else {
              exportCustomCount++;
            }
          }
          return (
            <ExportOptionsModal
              customEventCount={exportCustomCount}
              upgradingEventCount={exportUpgradingCount}
              actionLabel={pendingExportAction === 'download' ? 'Download .ics' : 'Share Timetable'}
              onConfirm={handleExportConfirm}
              onCancel={handleExportCancel}
            />
          );
        })()}

      {pendingImportData && (
        <ImportOptionsModal
          shareData={pendingImportData}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
        />
      )}

      {editingImportedEvent && (
        <EditEventModal
          currentVenue={editingImportedEvent.currentVenue}
          currentTutor={editingImportedEvent.currentTutor}
          currentStartTime={editingImportedEvent.currentStartTime}
          currentEndTime={editingImportedEvent.currentEndTime}
          onConfirm={confirmEditImportedEvent}
          onCancel={() => setEditingImportedEvent(null)}
          onRevert={revertImportedEvent}
          isEdited={!!getOverride(editingImportedEvent.eventKey)}
        />
      )}

      {deletingImportedEvent && (
        <Modal
          title="Delete Event?"
          onClose={() => setDeletingImportedEvent(null)}
          onConfirm={confirmDeleteImportedEvent}
          confirmText="Delete"
          confirmVariant="danger"
        >
          <p>
            This will hide this event from your timetable. This change is local only and won't
            affect the original NIE timetable.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            To restore deleted events, regenerate your timetable from the original HTML file.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default MainPage;
