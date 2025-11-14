// src/types/index.ts

export interface CSVFile {
  id: string;
  name: string;
  size: number;
  content: string[][];  // 2D-Array: [row][column]
  headers: string[];
  rowCount: number;
  uploadedAt: Date;
}

export interface ComparisonSettings {
  baselineFileId: string | null;
  keyColumn: number;  // Index der Spalte für ID-Vergleich
  numericTolerance: number;  // Toleranz für numerische Vergleiche
  compareOnlySelected: boolean;  // Nur ausgewählte Dateien vergleichen
}

export interface ComparisonResult {
  baselineFileName: string;
  comparedFileName: string;
  summary: {
    totalRows: number;
    newRows: number;
    changedRows: number;
    deletedRows: number;
    unchangedRows: number;
    changePercentage: number;
  };
  details: {
    new: RowDiff[];
    changed: RowDiff[];
    deleted: RowDiff[];
  };
  columnChangeCounts: Record<string, number>;  // Anzahl Änderungen pro Spalte
}

export interface RowDiff {
  key: string;  // ID/Name aus Schlüsselspalte
  rowIndex: number;
  changeType: 'new' | 'changed' | 'deleted';
  baselineRow?: string[];  // Alte Zeile (bei changed/deleted)
  comparedRow?: string[];  // Neue Zeile (bei new/changed)
  changedColumns?: number[];  // Indices der geänderten Spalten (bei changed)
  columnDiffs?: Array<{
    columnIndex: number;
    columnName: string;
    oldValue: string;
    newValue: string;
    isDifferent: boolean;
  }>;
}

export type ChangeFilter = 'all' | 'new' | 'changed' | 'deleted';
