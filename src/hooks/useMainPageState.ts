import { useCallback,useState } from 'react';

import { DEFAULT_TRAVEL_WAIT_MINUTES } from '../shared/constants';
import type { CompareFilter, MealConfig,TravelConfig } from '../types';

export interface FilterState {
  searchQuery: string;
  selectedCourses: Set<string>;
  selectedDate: string | null;
  hidePastDates: boolean;
}

export interface CompareState {
  compareMode: boolean;
  compareTimetables: [string, string] | null;
  compareFilter: CompareFilter;
  travelConfig: TravelConfig;
  mealConfig: MealConfig;
}

export interface UIState {
  showOptions: boolean;
  showShareWelcome: boolean;
  showPrivacyNotice: boolean;
  showShareSelect: boolean;
  showCompareModal: boolean;
  showCompareExplanation: boolean;
  mobileMenuOpen: boolean;
}

const DEFAULT_MEAL_CONFIG: MealConfig = {
  type: 'lunch',
  lunchStart: 11,
  lunchEnd: 14,
  dinnerStart: 17,
  dinnerEnd: 20,
};

/**
 * Centralized state management for the main page.
 *
 * Manages three categories of state:
 * - Filter state: search, course selection, date filter, hide past dates
 * - Compare state: compare mode, timetable selection, filter options
 * - UI state: modal visibility, mobile menu
 *
 * @returns Filter, compare, and UI state with handlers
 */
export function useMainPageState() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hidePastDates, setHidePastDates] = useState(true);

  // Compare state
  const [compareMode, setCompareMode] = useState(false);
  const [compareTimetables, setCompareTimetables] = useState<[string, string] | null>(null);
  const [compareFilter, setCompareFilter] = useState<CompareFilter>('none');
  const [travelConfig, setTravelConfig] = useState<TravelConfig>({
    direction: 'both',
    waitMinutes: DEFAULT_TRAVEL_WAIT_MINUTES,
  });
  const [mealConfig, setMealConfig] = useState<MealConfig>(DEFAULT_MEAL_CONFIG);

  // UI state
  const [showOptions, setShowOptions] = useState(false);
  const [showShareWelcome, setShowShareWelcome] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showShareSelect, setShowShareSelect] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCompareExplanation, setShowCompareExplanation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter handlers
  const toggleCourse = useCallback((course: string) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(course)) {
        newSet.delete(course);
      } else {
        newSet.add(course);
      }
      return newSet;
    });
  }, []);

  const handleCourseClick = useCallback((course: string) => {
    setSelectedCourses((prev) => {
      if (prev.size === 0) {
        return new Set([course]);
      }
      const newSet = new Set(prev);
      if (newSet.has(course)) {
        newSet.delete(course);
      } else {
        newSet.add(course);
      }
      return newSet;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCourses(new Set());
    setSelectedDate(null);
  }, []);

  const hasActiveFilters = selectedCourses.size > 0 || searchQuery.length > 0 || selectedDate !== null;

  // Compare handlers
  const handleTravelConfigChange = useCallback((update: Partial<TravelConfig>) => {
    setTravelConfig(prev => ({ ...prev, ...update }));
  }, []);

  const handleMealConfigChange = useCallback((update: Partial<MealConfig>) => {
    setMealConfig(prev => ({ ...prev, ...update }));
  }, []);

  const handleCompare = useCallback((selection: [string, string]) => {
    setCompareTimetables(selection);
    setCompareMode(true);
    setShowCompareModal(false);
    setCompareFilter('none');
  }, []);

  const handleExitCompare = useCallback(() => {
    setCompareMode(false);
    setCompareTimetables(null);
    setCompareFilter('none');
    setShowCompareModal(false);
  }, []);

  // Reset filters when uploading new file
  const resetFiltersForUpload = useCallback(() => {
    setSearchQuery('');
    setSelectedCourses(new Set());
  }, []);

  return {
    // Filter state
    filterState: {
      searchQuery,
      selectedCourses,
      selectedDate,
      hidePastDates,
    },
    setSearchQuery,
    setSelectedDate,
    setHidePastDates,
    toggleCourse,
    handleCourseClick,
    clearFilters,
    hasActiveFilters,
    resetFiltersForUpload,

    // Compare state
    compareState: {
      compareMode,
      compareTimetables,
      compareFilter,
      travelConfig,
      mealConfig,
    },
    setCompareFilter,
    handleTravelConfigChange,
    handleMealConfigChange,
    handleCompare,
    handleExitCompare,

    // UI state
    uiState: {
      showOptions,
      showShareWelcome,
      showPrivacyNotice,
      showShareSelect,
      showCompareModal,
      showCompareExplanation,
      mobileMenuOpen,
    },
    setShowOptions,
    setShowShareWelcome,
    setShowPrivacyNotice,
    setShowShareSelect,
    setShowCompareModal,
    setShowCompareExplanation,
    setMobileMenuOpen,
  };
}
