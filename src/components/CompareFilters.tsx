import { useState, useEffect } from 'react';
import { Calendar, Users, Car, Info, Utensils, Filter, ChevronDown, ChevronUp, Settings, type LucideIcon } from 'lucide-react';
import type { CompareFilter, TravelConfig, MealConfig } from '../types';
import { TravelConfigForm, MealConfigForm, MobileCompareSheet } from './compare';
import styles from './CompareFilters.module.scss';

interface CompareFiltersProps {
  compareFilter: CompareFilter;
  onFilterChange: (filter: CompareFilter) => void;
  travelConfig: TravelConfig;
  onTravelConfigChange: (config: Partial<TravelConfig>) => void;
  mealConfig: MealConfig;
  onMealConfigChange: (config: Partial<MealConfig>) => void;
  leftName: string;
  rightName: string;
}

interface FilterButtonConfig {
  id: CompareFilter;
  icon: LucideIcon;
  label: string;
  tooltip: string;
}

const FILTER_BUTTONS: FilterButtonConfig[] = [
  { id: 'commonDays', icon: Calendar, label: 'Common Days', tooltip: 'Show only days where both timetables have classes' },
  { id: 'identical', icon: Users, label: 'Identical Classes', tooltip: 'Show classes with matching course, group, AND time' },
  { id: 'travel', icon: Car, label: 'Travel Together', tooltip: 'See which days you can commute together' },
  { id: 'eat', icon: Utensils, label: 'Eat Together', tooltip: 'Find 1-hour gaps during lunch or dinner where both can eat together' },
];

const MOBILE_BREAKPOINT = '(max-width: 768px)';

export function CompareFilters({
  compareFilter,
  onFilterChange,
  travelConfig,
  onTravelConfigChange,
  mealConfig,
  onMealConfigChange,
  leftName,
  rightName,
}: CompareFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_BREAKPOINT).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleFilterClick = (filter: CompareFilter) => {
    if (compareFilter === filter) {
      onFilterChange('none');
    } else {
      onFilterChange(filter);
      if (isMobile && (filter === 'travel' || filter === 'eat')) {
        setShowConfigModal(true);
      }
    }
  };

  const activeFilterLabel = FILTER_BUTTONS.find(f => f.id === compareFilter)?.label || 'None';
  const needsConfig = compareFilter === 'travel' || compareFilter === 'eat';

  return (
    <div className={styles.container}>
      <button
        className={styles.filtersToggle}
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <Filter size={14} />
        <span>Filters{compareFilter !== 'none' ? `: ${activeFilterLabel}` : ''}</span>
        {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className={`${styles.filtersRow} ${filtersExpanded ? '' : styles.collapsed}`}>
        {FILTER_BUTTONS.map(({ id, icon: Icon, label, tooltip }) => (
          <button
            key={id}
            className={`${styles.filterBtn} ${compareFilter === id ? styles.active : ''}`}
            onClick={() => handleFilterClick(id)}
            data-tooltip={tooltip}
          >
            <Icon size={14} />
            <span>{label}</span>
            <Info size={12} className={styles.filterInfo} />
          </button>
        ))}
      </div>

      {needsConfig && (
        <button
          className={styles.mobileConfigBtn}
          onClick={() => setShowConfigModal(true)}
        >
          <Settings size={14} />
          <span>Configure {compareFilter === 'travel' ? 'Travel' : 'Meal'} Options</span>
        </button>
      )}

      {compareFilter === 'travel' && (
        <TravelConfigForm config={travelConfig} onChange={onTravelConfigChange} />
      )}

      {compareFilter === 'eat' && (
        <MealConfigForm config={mealConfig} onChange={onMealConfigChange} />
      )}

      <div className={styles.compareNamesRow}>
        <span className={styles.compareNameLabel}>Comparing:</span>
        <span className={styles.compareNameTag}>{leftName}</span>
        <span className={styles.compareVs}>vs</span>
        <span className={styles.compareNameTag}>{rightName}</span>
      </div>

      <MobileCompareSheet
        compareFilter={compareFilter}
        showConfigModal={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        travelConfig={travelConfig}
        onTravelConfigChange={onTravelConfigChange}
        mealConfig={mealConfig}
        onMealConfigChange={onMealConfigChange}
      />
    </div>
  );
}
