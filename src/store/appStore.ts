import { create } from 'zustand';
import { EnergyLevel } from '../database/models/Task';

interface AppState {
  // UI State
  selectedEnergyFilter: EnergyLevel | 'all';
  setEnergyFilter: (filter: EnergyLevel | 'all') => void;

  // Score State
  currentScore: number;
  setCurrentScore: (score: number) => void;

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

  // Score State
  currentScore: 100,
  setCurrentScore: (score) => set({ currentScore: score }),

  // Focus Timer State
  focusMinutes: 0,
  isTimerRunning: false,
  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  addFocusMinutes: (minutes) => set((state) => ({ focusMinutes: state.focusMinutes + minutes })),
  resetFocusMinutes: () => set({ focusMinutes: 0 }),
}));
