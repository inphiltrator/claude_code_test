import type { CSVFile, ComparisonSettings, ComparisonResult, RowDiff, FileCategory, CategoryGroup } from '@/types';

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
    const key = row[keyColumn]?.trim();
    if (key) {
      baselineMap.set(key, row);
    }
  });

  const comparedMap = new Map<string, string[]>();
  compared.content.slice(1).forEach((row) => {
    const key = row[keyColumn]?.trim();
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

      for (let i = 0; i < Math.max(baselineRow.length, comparedRow.length); i++) {
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

export function extractCategory(filename: string): FileCategory {
  // Entferne Version und Basis-Präfix
  // LM545_BLW_V3_L01_columns_COL_int_240_240_GLVL_S_koordinaten.csv

  const winMatch = filename.match(/_(WIN)_/i);
  if (winMatch) {
    return {
      key: 'WIN',
      displayName: 'WIN Fenster',
      type: 'WIN'
    };
  }

  const colMatch = filename.match(/_(COL)_int_(\d+)_(\d+)(?:_([^_]+?))?_/i);
  if (colMatch) {
    const [, , width, height, material] = colMatch;
    const dimensions = `${width}x${height}`;
    const materialName = material || '';

    const key = material
      ? `COL_${dimensions}_${material}`
      : `COL_${dimensions}`;

    const displayName = material
      ? `COL ${width}×${height} ${material}`
      : `COL ${width}×${height}`;

    return {
      key,
      displayName,
      type: 'COL',
      dimensions,
      material: materialName || undefined
    };
  }

  // Fallback
  return {
    key: 'OTHER',
    displayName: 'Sonstige',
    type: 'OTHER'
  };
}

export function groupResultsByCategory(results: ComparisonResult[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();

  results.forEach(result => {
    const category = extractCategory(result.comparedFileName);

    if (!groups.has(category.key)) {
      groups.set(category.key, {
        category,
        results: [],
        summary: {
          totalComparisons: 0,
          totalNew: 0,
          totalChanged: 0,
          totalDeleted: 0,
          avgChangeRate: 0
        }
      });
    }

    const group = groups.get(category.key)!;
    group.results.push(result);
    group.summary.totalComparisons++;
    group.summary.totalNew += result.summary.newRows;
    group.summary.totalChanged += result.summary.changedRows;
    group.summary.totalDeleted += result.summary.deletedRows;
  });

  // Durchschnittliche Änderungsrate berechnen
  groups.forEach(group => {
    const totalChanges = group.summary.totalNew +
                        group.summary.totalChanged +
                        group.summary.totalDeleted;
    const totalRows = group.results.reduce(
      (sum, r) => sum + r.summary.totalRows, 0
    );
    group.summary.avgChangeRate = totalRows > 0 ? (totalChanges / totalRows) * 100 : 0;
  });

  return Array.from(groups.values())
    .sort((a, b) => a.category.displayName.localeCompare(b.category.displayName));
}
