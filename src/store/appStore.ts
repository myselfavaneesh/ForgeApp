import { create } from 'zustand';
import { EnergyLevel } from '../database/models/Task';

/**
 * Global UI state management with Zustand
 * 
 * Note: Discipline score is NOT stored here - it's calculated in real-time
 * from tasks via DisciplineService.getScore()
 */
interface AppState {
  // UI State
  selectedEnergyFilter: EnergyLevel | 'all';
  setEnergyFilter: (filter: EnergyLevel | 'all') => void;

  // Focus Timer State
  focusMinutes: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  addFocusMinutes: (minutes: number) => void;
  resetFocusMinutes: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // UI State
  selectedEnergyFilter: 'all',
  setEnergyFilter: (filter) => set({ selectedEnergyFilter: filter }),

  // Focus Timer State
  focusMinutes: 0,
  isTimerRunning: false,
  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  addFocusMinutes: (minutes) => set((state) => ({ focusMinutes: state.focusMinutes + minutes })),
  resetFocusMinutes: () => set({ focusMinutes: 0 }),
}));
