import { create } from 'zustand';
import type { CSVFile, ComparisonSettings, ComparisonResult } from '@/types';

interface AppState {
  // Files
  files: CSVFile[];
  addFiles: (files: CSVFile[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  // Settings
  settings: ComparisonSettings;
  updateSettings: (settings: Partial<ComparisonSettings>) => void;
  setBaselineFile: (id: string) => void;

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
  files: [],
  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      settings:
        state.settings.baselineFileId === id
          ? { ...state.settings, baselineFileId: null }
          : state.settings,
    })),
  clearFiles: () =>
    set({
      files: [],
      settings: defaultSettings,
      comparisonResults: [],
    }),

  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setBaselineFile: (id) =>
    set((state) => ({
      settings: { ...state.settings, baselineFileId: id },
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
