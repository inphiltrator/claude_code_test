import type { CSVFile, ComparisonSettings, ComparisonResult, RowDiff } from '@/types';
import { getBaseName, extractVersion } from './csvParser';

function valuesEqual(val1: string, val2: string, tolerance: number): boolean {
  if (val1 === val2) return true;

  // Numerischer Vergleich mit Toleranz
  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);

  if (!isNaN(num1) && !isNaN(num2)) {
    return Math.abs(num1 - num2) <= tolerance;
  }

  return false;
}

/**
 * Erstellt einen eindeutigen Schlüssel für eine Zeile
 * - Bei Koordinaten-Dateien (2 Spalten): Composite Key aus X_Y
 * - Sonst: Nutzt die angegebene Schlüsselspalte
 */
function createRowKey(row: string[], keyColumn: number, headers: string[]): string {
  // Prüfe ob es Koordinaten-Daten sind (genau 2 Spalten mit "koordinate" im Namen)
  const isCoordinateData = headers.length === 2 &&
    headers.some(h => h.toLowerCase().includes('koordinate'));

  if (isCoordinateData || keyColumn === -1) {
    // Composite Key aus den ersten beiden Spalten (X, Y)
    const x = row[0]?.trim() || '';
    const y = row[1]?.trim() || '';
    return `${x}_${y}`;
  } else {
    // Einzelne Schlüsselspalte
    return row[keyColumn]?.trim() || '';
  }
}

export function compareCSVFiles(
  baseline: CSVFile,
  compared: CSVFile,
  settings: ComparisonSettings
): ComparisonResult {
  const keyColumn = settings.keyColumn;
  const tolerance = settings.numericTolerance;

  // Maps für schnellen Lookup erstellen
  const baselineMap = new Map<string, string[]>();
  baseline.content.slice(1).forEach((row) => {
    const key = createRowKey(row, keyColumn, baseline.headers);
    if (key) {
      baselineMap.set(key, row);
    }
  });

  const comparedMap = new Map<string, string[]>();
  compared.content.slice(1).forEach((row) => {
    const key = createRowKey(row, keyColumn, compared.headers);
    if (key) {
      comparedMap.set(key, row);
    }
  });

  const newRows: RowDiff[] = [];
  const changedRows: RowDiff[] = [];
  const deletedRows: RowDiff[] = [];
  const columnChangeCounts: Record<string, number> = {};

  // Neue und geänderte Zeilen finden
  comparedMap.forEach((comparedRow, key) => {
    const baselineRow = baselineMap.get(key);

    if (!baselineRow) {
      // Neue Zeile
      newRows.push({
        key,
        rowIndex: -1,
        changeType: 'new',
        comparedRow
      });
    } else {
      // Prüfen auf Änderungen
      const changedColumns: number[] = [];
      const columnDiffs: RowDiff['columnDiffs'] = [];

      // Bei Koordinaten-Daten: Alle Spalten prüfen
      // Bei anderen Daten: Nur Nicht-Key-Spalten prüfen
      const startColumn = 0; // Immer alle Spalten prüfen für vollständige Diff-Info

      for (let i = startColumn; i < Math.max(baselineRow.length, comparedRow.length); i++) {
        const oldVal = baselineRow[i]?.trim() || '';
        const newVal = comparedRow[i]?.trim() || '';

        const isDifferent = !valuesEqual(oldVal, newVal, tolerance);

        if (isDifferent) {
          changedColumns.push(i);
          const columnName = baseline.headers[i] || `Column ${i}`;
          columnChangeCounts[columnName] = (columnChangeCounts[columnName] || 0) + 1;
        }

        columnDiffs.push({
          columnIndex: i,
          columnName: baseline.headers[i] || `Column ${i}`,
          oldValue: oldVal,
          newValue: newVal,
          isDifferent
        });
      }

      if (changedColumns.length > 0) {
        changedRows.push({
          key,
          rowIndex: -1,
          changeType: 'changed',
          baselineRow,
          comparedRow,
          changedColumns,
          columnDiffs
        });
      }

      // Aus baselineMap entfernen = als verarbeitet markieren
      baselineMap.delete(key);
    }
  });

  // Gelöschte Zeilen (alles was in baselineMap übrig bleibt)
  baselineMap.forEach((baselineRow, key) => {
    deletedRows.push({
      key,
      rowIndex: -1,
      changeType: 'deleted',
      baselineRow
    });
  });

  const totalRows = baseline.rowCount;
  const unchangedRows = totalRows - newRows.length - changedRows.length - deletedRows.length;

  return {
    baselineFileName: baseline.name,
    comparedFileName: compared.name,
    summary: {
      totalRows,
      newRows: newRows.length,
      changedRows: changedRows.length,
      deletedRows: deletedRows.length,
      unchangedRows: Math.max(0, unchangedRows),
      changePercentage: totalRows > 0
        ? ((newRows.length + changedRows.length + deletedRows.length) / totalRows) * 100
        : 0
    },
    details: {
      new: newRows,
      changed: changedRows,
      deleted: deletedRows
    },
    columnChangeCounts
  };
}

export function compareMultipleFiles(
  baseline: CSVFile,
  files: CSVFile[],
  settings: ComparisonSettings
): ComparisonResult[] {
  return files
    .filter(file => file.id !== baseline.id)
    .map(file => compareCSVFiles(baseline, file, settings));
}

/**
 * Vergleicht automatisch Dateien aus zwei Ordnern basierend auf Base-Namen-Matching
 *
 * NEUE LOGIK:
 * 1. Gruppiert Dateien nach Base-Namen (ohne LM-Versionsnummer)
 * 2. Pro Gruppe: Niedrigste Version = Baseline
 * 3. Vergleicht alle höheren Versionen gegen Baseline
 *
 * Beispiel:
 * - LM545_BLW_koordinaten.csv
 * - LM548_BLW_koordinaten.csv
 * → Base-Name: "BLW_koordinaten.csv"
 * → Baseline: LM545 (niedrigste Version)
 * → Vergleich: LM548 vs LM545
 */
export function compareVersionFolders(
  oldVersionFiles: CSVFile[],
  currentVersionFiles: CSVFile[],
  settings: ComparisonSettings
): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  // Kombiniere alle Dateien (alte + aktuelle) für Gruppierung
  const allFiles = [...oldVersionFiles, ...currentVersionFiles];

  // Gruppiere Dateien nach Base-Namen
  const fileGroups = new Map<string, CSVFile[]>();

  allFiles.forEach((file) => {
    const baseName = getBaseName(file.name);
    if (!fileGroups.has(baseName)) {
      fileGroups.set(baseName, []);
    }
    fileGroups.get(baseName)!.push(file);
  });

  // Pro Gruppe: Vergleiche alle Versionen gegen die Baseline (niedrigste Version)
  fileGroups.forEach((files) => {
    // Sortiere Dateien nach Version (aufsteigend)
    const sortedFiles = files.sort((a, b) => {
      const versionA = extractVersion(a.name);
      const versionB = extractVersion(b.name);
      return versionA - versionB;
    });

    // Mindestens 2 Dateien nötig für einen Vergleich
    if (sortedFiles.length < 2) {
      return;
    }

    // Erste Datei (niedrigste Version) = Baseline
    const baseline = sortedFiles[0];

    // Vergleiche alle höheren Versionen gegen Baseline
    for (let i = 1; i < sortedFiles.length; i++) {
      const comparedFile = sortedFiles[i];
      const result = compareCSVFiles(baseline, comparedFile, settings);
      results.push(result);
    }
  });

  return results;
}

/**
 * Gruppiert Dateien nach Base-Namen und gibt Info über die Gruppen zurück
 */
export interface FileGroup {
  baseName: string;
  files: CSVFile[];
  baseline: CSVFile | null;
  versionsToCompare: CSVFile[];
}

export function groupFilesByBaseName(files: CSVFile[]): FileGroup[] {
  const fileGroups = new Map<string, CSVFile[]>();

  files.forEach((file) => {
    const baseName = getBaseName(file.name);
    if (!fileGroups.has(baseName)) {
      fileGroups.set(baseName, []);
    }
    fileGroups.get(baseName)!.push(file);
  });

  const groups: FileGroup[] = [];

  fileGroups.forEach((files, baseName) => {
    // Sortiere nach Version
    const sortedFiles = files.sort((a, b) => {
      const versionA = extractVersion(a.name);
      const versionB = extractVersion(b.name);
      return versionA - versionB;
    });

    groups.push({
      baseName,
      files: sortedFiles,
      baseline: sortedFiles.length > 0 ? sortedFiles[0] : null,
      versionsToCompare: sortedFiles.slice(1)
    });
  });

  return groups;
}
