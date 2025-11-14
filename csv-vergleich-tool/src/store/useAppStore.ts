import { create } from 'zustand';
import type { CSVFile, ComparisonSettings, ComparisonResult } from '@/types';

interface AppState {
  // Files - Zwei separate Listen für aktuelle und alte Versionen
  currentVersionFiles: CSVFile[];
  oldVersionFiles: CSVFile[];

  addCurrentFiles: (files: CSVFile[]) => void;
  addOldFiles: (files: CSVFile[]) => void;

  removeCurrentFile: (id: string) => void;
  removeOldFile: (id: string) => void;

  clearCurrentFiles: () => void;
  clearOldFiles: () => void;
  clearAllFiles: () => void;

  // Settings
  settings: ComparisonSettings;
  updateSettings: (settings: Partial<ComparisonSettings>) => void;

  // Comparison Results
  comparisonResults: ComparisonResult[];
  setComparisonResults: (results: ComparisonResult[]) => void;
  clearResults: () => void;

  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const defaultSettings: ComparisonSettings = {
  baselineFileId: null,
  keyColumn: 0,
  numericTolerance: 0,
  compareOnlySelected: false,
};

export const useAppStore = create<AppState>((set) => ({
  // Files
  currentVersionFiles: [],
  oldVersionFiles: [],

  addCurrentFiles: (newFiles) =>
    set((state) => ({
      currentVersionFiles: [...state.currentVersionFiles, ...newFiles],
    })),

  addOldFiles: (newFiles) =>
    set((state) => ({
      oldVersionFiles: [...state.oldVersionFiles, ...newFiles],
    })),

  removeCurrentFile: (id) =>
    set((state) => ({
      currentVersionFiles: state.currentVersionFiles.filter((f) => f.id !== id),
    })),

  removeOldFile: (id) =>
    set((state) => ({
      oldVersionFiles: state.oldVersionFiles.filter((f) => f.id !== id),
    })),

  clearCurrentFiles: () =>
    set({
      currentVersionFiles: [],
      comparisonResults: [],
    }),

  clearOldFiles: () =>
    set({
      oldVersionFiles: [],
      comparisonResults: [],
    }),

  clearAllFiles: () =>
    set({
      currentVersionFiles: [],
      oldVersionFiles: [],
      settings: defaultSettings,
      comparisonResults: [],
    }),

  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  // Comparison Results
  comparisonResults: [],
  setComparisonResults: (results) =>
    set({
      comparisonResults: results,
    }),
  clearResults: () =>
    set({
      comparisonResults: [],
    }),

  // UI State
  darkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.darkMode;
      // Update document class for Tailwind dark mode
      if (typeof document !== 'undefined') {
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { darkMode: newDarkMode };
    }),
}));
