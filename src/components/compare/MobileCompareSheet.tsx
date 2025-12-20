import type { CompareFilter, MealConfig, TravelConfig } from '../../types';
import { Modal } from '../Modal';
import { MealConfigModalContent } from './MealConfigForm';
import { TravelConfigModalContent } from './TravelConfigForm';

interface MobileCompareSheetProps {
  compareFilter: CompareFilter;
  isConfigModalOpen: boolean;
  onClose: () => void;
  travelConfig: TravelConfig;
  onTravelConfigChange: (config: Partial<TravelConfig>) => void;
  mealConfig: MealConfig;
  onMealConfigChange: (config: Partial<MealConfig>) => void;
}

export function MobileCompareSheet({
  compareFilter,
  isConfigModalOpen,
  onClose,
  travelConfig,
  onTravelConfigChange,
  mealConfig,
  onMealConfigChange,
}: MobileCompareSheetProps) {
  if (!isConfigModalOpen) return null;

  if (compareFilter === 'travel') {
    return (
      <Modal
        title="Travel Options"
        onClose={onClose}
        onConfirm={onClose}
        confirmText="Done"
        confirmVariant="primary"
        cancelText=""
      >
        <TravelConfigModalContent config={travelConfig} onChange={onTravelConfigChange} />
      </Modal>
    );
  }

  if (compareFilter === 'eat') {
    return (
      <Modal
        title="Meal Options"
        onClose={onClose}
        onConfirm={onClose}
        confirmText="Done"
        confirmVariant="primary"
        cancelText=""
      >
        <MealConfigModalContent config={mealConfig} onChange={onMealConfigChange} />
      </Modal>
    );
  }

  return null;
}
