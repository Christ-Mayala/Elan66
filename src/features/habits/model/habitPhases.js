import { phaseCopy, PHASE_LENGTH_DAYS } from '../../../core/utils/constants';
import { phaseForDayIndex, phaseProgress } from '../../../core/utils/dateUtils';

export const getHabitPhaseCopy = (dayIndex) => {
  const phase = phaseForDayIndex(dayIndex);
  return phaseCopy[phase];
};

export const getHabitPhaseProgress = (dayIndex) => {
  return { ...phaseProgress(dayIndex), phaseLength: PHASE_LENGTH_DAYS };
};
