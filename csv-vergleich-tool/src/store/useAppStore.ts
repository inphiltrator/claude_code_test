import { create } from 'zustand';
import type { CSVFile, ComparisonSettings, ComparisonResult } from '@/types';

interface AppState {
  // Files
  baselineFiles: CSVFile[];  // Alte Dateien
  comparedFiles: CSVFile[];  // Neue Dateien zu vergleichen
  addBaselineFiles: (files: CSVFile[]) => void;
  addComparedFiles: (files: CSVFile[]) => void;
  removeBaselineFile: (id: string) => void;
  removeComparedFile: (id: string) => void;
  clearAllFiles: () => void;

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
  baselineFiles: [],
  comparedFiles: [],
  addBaselineFiles: (newFiles) =>
    set((state) => {
      const files = [...state.baselineFiles, ...newFiles];
      // Auto-select first baseline file if none selected
      const baselineFileId = state.settings.baselineFileId || (files.length > 0 ? files[0].id : null);
      return {
        baselineFiles: files,
        settings: { ...state.settings, baselineFileId },
      };
    }),
  addComparedFiles: (newFiles) =>
    set((state) => ({
      comparedFiles: [...state.comparedFiles, ...newFiles],
    })),
  removeBaselineFile: (id) =>
    set((state) => {
      const files = state.baselineFiles.filter((f) => f.id !== id);
      return {
        baselineFiles: files,
        settings:
          state.settings.baselineFileId === id
            ? { ...state.settings, baselineFileId: files.length > 0 ? files[0].id : null }
            : state.settings,
      };
    }),
  removeComparedFile: (id) =>
    set((state) => ({
      comparedFiles: state.comparedFiles.filter((f) => f.id !== id),
    })),
  clearAllFiles: () =>
    set({
      baselineFiles: [],
      comparedFiles: [],
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
