import type { CompareFilter, TravelConfig, MealConfig } from '../../types';
import { Modal } from '../Modal';
import { TravelConfigModalContent } from './TravelConfigForm';
import { MealConfigModalContent } from './MealConfigForm';

interface MobileCompareSheetProps {
  compareFilter: CompareFilter;
  showConfigModal: boolean;
  onClose: () => void;
  travelConfig: TravelConfig;
  onTravelConfigChange: (config: Partial<TravelConfig>) => void;
  mealConfig: MealConfig;
  onMealConfigChange: (config: Partial<MealConfig>) => void;
}

export function MobileCompareSheet({
  compareFilter,
  showConfigModal,
  onClose,
  travelConfig,
  onTravelConfigChange,
  mealConfig,
  onMealConfigChange,
}: MobileCompareSheetProps) {
  if (!showConfigModal) return null;

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
        <TravelConfigModalContent
          config={travelConfig}
          onChange={onTravelConfigChange}
        />
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
        <MealConfigModalContent
          config={mealConfig}
          onChange={onMealConfigChange}
        />
      </Modal>
    );
  }

  return null;
}
