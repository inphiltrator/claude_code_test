# CSV-Koordinaten Vergleichstool - React App

## Projektübersicht

Erstelle eine moderne React-Webanwendung zum Vergleichen von mehreren CSV-Koordinatendateien mit professioneller Visualisierung der Unterschiede.

## Funktionale Anforderungen

### Kernfunktionalität

1. **Multi-File Upload**
   - Drag & Drop Zone für mehrere CSV-Dateien gleichzeitig
   - Unterstützung für beliebig viele Dateien
   - Dateinamen-Erkennung mit Versionsnummern (z.B. LM545, LM548)
   - Vorschau der hochgeladenen Dateien mit Größe und Zeilenanzahl

2. **CSV-Parsing**
   - Robuster CSV-Parser (mit PapaParse Library)
   - Korrekte Behandlung von Kommas in Anführungszeichen
   - Automatische Spaltenerkennung
   - Fehlerbehandlung bei invaliden CSV-Dateien

3. **Intelligenter Vergleich**
   - **Baseline-Auswahl:** Nutzer wählt eine Referenzdatei aus
   - **Multi-Way-Vergleich:** Alle anderen Dateien werden gegen Baseline verglichen
   - **Schlüsselbasierter Vergleich:** Nach erster Spalte (ID/Name) oder nutzerdefinierbarer Schlüsselspalte
   - **Änderungserkennung:**
     - Neue Zeilen (in neueren Versionen hinzugefügt)
     - Entfernte Zeilen (aus neueren Versionen gelöscht)
     - Geänderte Zeilen (mit Spalten-granularer Diff-Anzeige)
   - **Numerische Toleranz:** Optionale Toleranzschwelle für Koordinaten (z.B. ±0.001mm)

4. **Ergebnis-Visualisierung**
   - **Zusammenfassungs-Dashboard:**
     - Anzahl der Änderungen pro Datei
     - Prozentuale Änderungsrate
     - Änderungs-Heatmap (welche Spalten ändern sich am häufigsten)
   - **Detail-Ansicht:**
     - Tabellen mit farblicher Kennzeichnung:
       - 🟢 Grün: Neue Zeilen
       - 🟡 Gelb: Geänderte Zeilen (mit Inline-Diff: alt → neu)
       - 🔴 Rot: Entfernte Zeilen
     - Filterfunktion nach Änderungstyp
     - Sortierung nach beliebiger Spalte
     - Such-Funktion für IDs/Namen
   - **Diff-Visualisierung:**
     - Für geänderte Zellen: Alten Wert durchgestrichen, neuen Wert fett
     - Hover-Tooltip mit detaillierter Änderungsinfo
     - Spaltenweise Diff-Statistiken

5. **Export-Funktionen**
   - **Excel-Export (.xlsx):**
     - Separate Sheets für jede Vergleichskombination
     - Farbcodierung wie in der Web-Ansicht
     - Zusammenfassungs-Sheet mit Statistiken
   - **JSON-Export:** Strukturierte Diff-Daten für weitere Verarbeitung
   - **CSV-Export:** Gefilterte Ergebnisse als CSV
   - **PDF-Report:** Übersichtsbericht mit Zusammenfassung und wichtigsten Änderungen

6. **Benutzerfreundlichkeit**
   - **Responsive Design:** Funktioniert auf Desktop, Tablet, Mobile
   - **Dark/Light Mode:** Umschaltbarer Theme
   - **Persistenz:** Letzte Einstellungen im LocalStorage speichern
   - **Keyboard-Shortcuts:** z.B. Strg+U für Upload, Strg+E für Export
   - **Hilfe-System:** Tooltips und Onboarding-Tour für neue Nutzer

## Technische Anforderungen

### Tech Stack

**Frontend:**
- React 18+ mit TypeScript
- Vite als Build-Tool
- Tailwind CSS für Styling
- shadcn/ui für UI-Komponenten
- Zustand für State Management

**Wichtige Libraries:**
- **PapaParse** - CSV-Parsing
- **React Dropzone** - Drag & Drop Upload
- **TanStack Table** (React Table v8) - Tabellen mit Sorting/Filtering
- **SheetJS (xlsx)** - Excel-Export
- **jsPDF + jsPDF-AutoTable** - PDF-Export
- **Recharts** - Diagramme für Statistiken
- **React Hot Toast** - Benachrichtigungen
- **Lucide React** - Icons

### Projekt-Struktur

```
csv-vergleich-tool/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui Komponenten
│   │   ├── FileUpload.tsx   # Drag & Drop Zone
│   │   ├── FileList.tsx     # Hochgeladene Dateien Übersicht
│   │   ├── BaselineSelector.tsx  # Referenzdatei auswählen
│   │   ├── ComparisonSettings.tsx  # Einstellungen (Schlüsselspalte, Toleranz)
│   │   ├── SummaryDashboard.tsx    # Zusammenfassungs-Dashboard
│   │   ├── ComparisonTable.tsx     # Detail-Tabelle mit Änderungen
│   │   ├── DiffCell.tsx            # Zelle mit Diff-Visualisierung
│   │   ├── ExportOptions.tsx       # Export-Buttons
│   │   └── HelpDialog.tsx          # Hilfe-Dialog
│   ├── hooks/
│   │   ├── useFileUpload.ts        # File-Upload-Logic
│   │   ├── useCSVParser.ts         # CSV-Parsing
│   │   ├── useComparison.ts        # Vergleichs-Logik
│   │   └── useExport.ts            # Export-Logik
│   ├── lib/
│   │   ├── csvParser.ts            # CSV-Parsing-Utils
│   │   ├── comparison.ts           # Vergleichs-Algorithmen
│   │   ├── export.ts               # Export-Utils
│   │   └── utils.ts                # Allgemeine Utils
│   ├── types/
│   │   └── index.ts                # TypeScript-Typen
│   ├── store/
│   │   └── useAppStore.ts          # Zustand Store
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## TypeScript-Typen

```typescript
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
```

## Implementierungs-Details

### 1. CSV-Parsing (csvParser.ts)

```typescript
import Papa from 'papaparse';

export async function parseCSVFile(file: File): Promise<CSVFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        
        // Leere Zeilen am Ende entfernen
        const cleanedData = data.filter(row => 
          row.some(cell => cell.trim() !== '')
        );
        
        const headers = cleanedData[0] || [];
        const rows = cleanedData.slice(1);
        
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          content: cleanedData,
          headers: headers,
          rowCount: rows.length,
          uploadedAt: new Date()
        });
      },
      error: (error) => reject(error),
      skipEmptyLines: true,
      encoding: 'UTF-8'
    });
  });
}
```

### 2. Vergleichs-Algorithmus (comparison.ts)

```typescript
export function compareCSVFiles(
  baseline: CSVFile,
  compared: CSVFile,
  settings: ComparisonSettings
): ComparisonResult {
  const keyColumn = settings.keyColumn;
  const tolerance = settings.numericTolerance;
  
  // Maps für schnellen Lookup erstellen
  const baselineMap = new Map<string, string[]>();
  baseline.content.slice(1).forEach((row, index) => {
    const key = row[keyColumn]?.trim();
    if (key) {
      baselineMap.set(key, row);
    }
  });
  
  const comparedMap = new Map<string, string[]>();
  compared.content.slice(1).forEach((row, index) => {
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
  
  return {
    baselineFileName: baseline.name,
    comparedFileName: compared.name,
    summary: {
      totalRows: compared.rowCount,
      newRows: newRows.length,
      changedRows: changedRows.length,
      deletedRows: deletedRows.length,
      unchangedRows: compared.rowCount - newRows.length - changedRows.length,
      changePercentage: ((newRows.length + changedRows.length + deletedRows.length) / compared.rowCount) * 100
    },
    details: {
      new: newRows,
      changed: changedRows,
      deleted: deletedRows
    },
    columnChangeCounts
  };
}

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
```

### 3. Excel-Export (export.ts)

```typescript
import * as XLSX from 'xlsx';

export function exportToExcel(results: ComparisonResult[]): void {
  const workbook = XLSX.utils.book_new();
  
  // Zusammenfassungs-Sheet
  const summaryData = [
    ['CSV-Vergleichsbericht'],
    ['Erstellt am:', new Date().toLocaleString()],
    [],
    ['Datei', 'Neue Zeilen', 'Geänderte Zeilen', 'Gelöschte Zeilen', 'Änderungsrate'],
    ...results.map(r => [
      r.comparedFileName,
      r.summary.newRows,
      r.summary.changedRows,
      r.summary.deletedRows,
      `${r.summary.changePercentage.toFixed(2)}%`
    ])
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Zusammenfassung');
  
  // Detail-Sheets für jede Vergleichskombination
  results.forEach((result, index) => {
    const sheetName = `${result.comparedFileName.substring(0, 25)}`;
    
    // Neue Zeilen
    if (result.details.new.length > 0) {
      const newData = [
        ['NEUE ZEILEN'],
        result.details.new[0].comparedRow || [],  // Header
        ...result.details.new.map(diff => diff.comparedRow || [])
      ];
      const newSheet = XLSX.utils.aoa_to_sheet(newData);
      
      // Grüne Hintergrundfarbe für neue Zeilen
      const range = XLSX.utils.decode_range(newSheet['!ref'] || 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!newSheet[cellAddress]) continue;
          newSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'C6EFCE' } }
          };
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, newSheet, `${sheetName}_Neu`);
    }
    
    // Geänderte Zeilen (mit Diff)
    if (result.details.changed.length > 0) {
      const changedData = [
        ['GEÄNDERTE ZEILEN (Alt → Neu)'],
        result.details.changed[0].baselineRow || [],  // Header
        ...result.details.changed.flatMap(diff => [
          diff.baselineRow || [],
          diff.comparedRow || [],
          []  // Leerzeile zwischen Einträgen
        ])
      ];
      const changedSheet = XLSX.utils.aoa_to_sheet(changedData);
      XLSX.utils.book_append_sheet(workbook, changedSheet, `${sheetName}_Geändert`);
    }
    
    // Gelöschte Zeilen
    if (result.details.deleted.length > 0) {
      const deletedData = [
        ['GELÖSCHTE ZEILEN'],
        result.details.deleted[0].baselineRow || [],  // Header
        ...result.details.deleted.map(diff => diff.baselineRow || [])
      ];
      const deletedSheet = XLSX.utils.aoa_to_sheet(deletedData);
      XLSX.utils.book_append_sheet(workbook, deletedSheet, `${sheetName}_Gelöscht`);
    }
  });
  
  // Download
  XLSX.writeFile(workbook, `CSV_Vergleich_${Date.now()}.xlsx`);
}
```

### 4. React-Komponenten

#### FileUpload.tsx

```tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.csv') || file.type === 'text/csv'
    );
    onFilesSelected(csvFiles);
  }, [onFilesSelected]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: true
  });
  
  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
        }
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium mb-2">
        {isDragActive 
          ? 'Dateien hier ablegen...' 
          : 'CSV-Dateien hierher ziehen'
        }
      </p>
      <p className="text-sm text-gray-500">
        oder klicken zum Auswählen (mehrere Dateien möglich)
      </p>
    </div>
  );
}
```

#### ComparisonTable.tsx

```tsx
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';
import type { ComparisonResult, RowDiff, ChangeFilter } from '@/types';
import { DiffCell } from './DiffCell';

interface ComparisonTableProps {
  result: ComparisonResult;
  filter: ChangeFilter;
}

export function ComparisonTable({ result, filter }: ComparisonTableProps) {
  const data = useMemo(() => {
    switch (filter) {
      case 'new': return result.details.new;
      case 'changed': return result.details.changed;
      case 'deleted': return result.details.deleted;
      case 'all': return [
        ...result.details.new,
        ...result.details.changed,
        ...result.details.deleted
      ];
    }
  }, [result, filter]);
  
  const columns = useMemo(() => {
    const headers = result.baselineFileName 
      ? ['Änderungstyp', ...result.details.changed[0]?.baselineRow || []]
      : ['Änderungstyp'];
    
    return [
      {
        accessorKey: 'changeType',
        header: 'Typ',
        cell: ({ row }) => {
          const type = row.original.changeType;
          const colors = {
            new: 'bg-green-100 text-green-800',
            changed: 'bg-yellow-100 text-yellow-800',
            deleted: 'bg-red-100 text-red-800'
          };
          const labels = {
            new: 'Neu',
            changed: 'Geändert',
            deleted: 'Gelöscht'
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
              {labels[type]}
            </span>
          );
        }
      },
      ...headers.slice(1).map((header, index) => ({
        accessorKey: `col_${index}`,
        header: header,
        cell: ({ row }) => (
          <DiffCell
            diff={row.original}
            columnIndex={index}
          />
        )
      }))
    ];
  }, [result]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### DiffCell.tsx

```tsx
import { Tooltip } from '@/components/ui/tooltip';
import type { RowDiff } from '@/types';

interface DiffCellProps {
  diff: RowDiff;
  columnIndex: number;
}

export function DiffCell({ diff, columnIndex }: DiffCellProps) {
  const columnDiff = diff.columnDiffs?.[columnIndex];
  
  if (!columnDiff) {
    return <span className="text-gray-400">-</span>;
  }
  
  if (diff.changeType === 'new') {
    return (
      <span className="text-green-700 font-medium">
        {columnDiff.newValue}
      </span>
    );
  }
  
  if (diff.changeType === 'deleted') {
    return (
      <span className="text-red-700 line-through">
        {columnDiff.oldValue}
      </span>
    );
  }
  
  if (diff.changeType === 'changed' && columnDiff.isDifferent) {
    return (
      <Tooltip content={`${columnDiff.oldValue} → ${columnDiff.newValue}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through text-xs">
            {columnDiff.oldValue}
          </span>
          <span className="text-yellow-700 font-medium">
            {columnDiff.newValue}
          </span>
        </div>
      </Tooltip>
    );
  }
  
  return <span>{columnDiff.newValue || columnDiff.oldValue}</span>;
}
```

## Design-Anforderungen

### UI/UX-Prinzipien

1. **Klarheit:** Änderungen sofort erkennbar durch Farben
2. **Geschwindigkeit:** Große Dateien (>10.000 Zeilen) ohne Lag
3. **Zugänglichkeit:** WCAG 2.1 AA-konform
4. **Responsiveness:** Mobile-first Design

### Farbschema

**Light Mode:**
- Neue Zeilen: `bg-green-100`, `text-green-800`
- Geänderte Zeilen: `bg-yellow-100`, `text-yellow-800`
- Gelöschte Zeilen: `bg-red-100`, `text-red-800`

**Dark Mode:**
- Neue Zeilen: `bg-green-900`, `text-green-200`
- Geänderte Zeilen: `bg-yellow-900`, `text-yellow-200`
- Gelöschte Zeilen: `bg-red-900`, `text-red-200`

## Performance-Optimierungen

1. **Virtualisierung:** TanStack Virtual für große Tabellen (>1000 Zeilen)
2. **Web Workers:** CSV-Parsing und Vergleich in Background-Thread
3. **Memoization:** React.memo, useMemo, useCallback strategisch einsetzen
4. **Lazy Loading:** Code-Splitting für Export-Module
5. **Debouncing:** Such- und Filter-Operationen debounced

## Testing

### Unit Tests (mit Vitest)
- CSV-Parsing-Logik
- Vergleichs-Algorithmen
- Utils-Funktionen

### Integration Tests
- File-Upload-Flow
- Vergleichs-Workflow
- Export-Funktionalität

### E2E Tests (mit Playwright)
- Kompletter User-Flow: Upload → Vergleich → Export

## Deployment

**Empfohlene Plattformen:**
1. **Vercel** - Einfachstes Deployment, optimiert für React
2. **Netlify** - Alternative mit guten DX
3. **GitHub Pages** - Kostenlos für öffentliche Repos

**Build-Optimierungen:**
- Code-Splitting für bessere Load-Times
- Asset-Komprimierung (Brotli)
- Service Worker für Offline-Nutzung (optional)

## Erweiterungen für die Zukunft

1. **SharePoint-Integration:** Direkter Zugriff auf SharePoint-Ordner via Microsoft Graph API
2. **Batch-Processing:** Automatischer Vergleich bei neuen Uploads
3. **Historische Trends:** Änderungsverlauf über mehrere Versionen
4. **Collaborative Features:** Kommentare und Annotations zu Änderungen
5. **API-Endpoints:** Backend für Team-Sharing von Vergleichen

## Implementierungs-Reihenfolge

### Phase 1: MVP (Woche 1)
1. ✅ Projekt-Setup (Vite + React + TypeScript + Tailwind)
2. ✅ File-Upload-Komponente
3. ✅ CSV-Parsing
4. ✅ Basis-Vergleichslogik (2 Dateien)
5. ✅ Einfache Tabellen-Darstellung

### Phase 2: Core Features (Woche 2)
6. ✅ Multi-File-Vergleich
7. ✅ Baseline-Auswahl
8. ✅ Farbcodierung und Diff-Visualisierung
9. ✅ Filter und Sortierung
10. ✅ Zusammenfassungs-Dashboard

### Phase 3: Polish (Woche 3)
11. ✅ Excel/CSV/JSON-Export
12. ✅ Settings (Schlüsselspalte, Toleranz)
13. ✅ Dark Mode
14. ✅ Responsive Design
15. ✅ Error Handling & Loading States

### Phase 4: Extras (Optional)
16. ⚡ PDF-Export
17. ⚡ Keyboard-Shortcuts
18. ⚡ Performance-Optimierungen (Virtual Scrolling)
19. ⚡ Hilfe-System / Onboarding
20. ⚡ Tests

## Start-Befehle

```bash
# Projekt erstellen
npm create vite@latest csv-vergleich-tool -- --template react-ts
cd csv-vergleich-tool

# Dependencies installieren
npm install

# shadcn/ui initialisieren
npx shadcn-ui@latest init

# Development-Server starten
npm run dev

# Build für Production
npm run build
```

## Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.2",
    "papaparse": "^5.4.1",
    "@tanstack/react-table": "^8.13.0",
    "react-dropzone": "^14.2.3",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "recharts": "^2.12.2",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.344.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@types/papaparse": "^5.3.14",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.18",
    "vitest": "^1.3.1",
    "@testing-library/react": "^14.2.1",
    "playwright": "^1.42.0"
  }
}
```

---

## Zusammenfassung für Claude Code

**Aufgabe:** Entwickle eine vollständige React-Webanwendung zum Vergleichen von mehreren CSV-Koordinatendateien.

**Wichtigste Features:**
1. Multi-File Drag & Drop Upload
2. Auswahl einer Baseline-Datei
3. Intelligenter Vergleich aller anderen Dateien gegen Baseline
4. Farbcodierte Visualisierung (Grün=Neu, Gelb=Geändert, Rot=Gelöscht)
5. Export zu Excel, CSV, JSON
6. Responsive, modernes UI mit Dark Mode

**Tech Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- PapaParse (CSV), SheetJS (Excel), TanStack Table
- Zustand (State)

**Fokus auf:**
- Robustheit: Große Dateien (10.000+ Zeilen) ohne Performance-Probleme
- UX: Intuitive Bedienung, klare Visualisierung
- Code-Qualität: TypeScript, modularer Aufbau, gut testbar

Beginne mit dem MVP (Phase 1) und baue iterativ aus!