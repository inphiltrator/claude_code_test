import * as XLSX from 'xlsx';
import type { ComparisonResult } from '@/types';

export function exportToExcel(results: ComparisonResult[]): void {
  const workbook = XLSX.utils.book_new();

  // Zusammenfassungs-Sheet
  const summaryData = [
    ['CSV-Vergleichsbericht'],
    ['Erstellt am:', new Date().toLocaleString()],
    [],
    ['Datei', 'Neue Zeilen', 'Geänderte Zeilen', 'Gelöschte Zeilen', 'Änderungsrate'],
    ...results.map((r) => [
      r.comparedFileName,
      r.summary.newRows,
      r.summary.changedRows,
      r.summary.deletedRows,
      `${r.summary.changePercentage.toFixed(2)}%`,
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Zusammenfassung');

  // Detail-Sheets für jede Vergleichskombination
  results.forEach((result) => {
    const sheetName = result.comparedFileName.substring(0, 25);

    // Neue Zeilen
    if (result.details.new.length > 0) {
      const headers = result.details.new[0].comparedRow || [];
      const newData = [
        ['NEUE ZEILEN'],
        headers,
        ...result.details.new.map((diff) => diff.comparedRow || []),
      ];
      const newSheet = XLSX.utils.aoa_to_sheet(newData);
      XLSX.utils.book_append_sheet(workbook, newSheet, `${sheetName}_Neu`);
    }

    // Geänderte Zeilen (mit Diff)
    if (result.details.changed.length > 0) {
      const headers = result.details.changed[0].baselineRow || [];
      const changedData = [
        ['GEÄNDERTE ZEILEN (Alt → Neu)'],
        headers,
        ...result.details.changed.flatMap((diff) => [
          diff.baselineRow || [],
          diff.comparedRow || [],
          [], // Leerzeile zwischen Einträgen
        ]),
      ];
      const changedSheet = XLSX.utils.aoa_to_sheet(changedData);
      XLSX.utils.book_append_sheet(workbook, changedSheet, `${sheetName}_Geändert`);
    }

    // Gelöschte Zeilen
    if (result.details.deleted.length > 0) {
      const headers = result.details.deleted[0].baselineRow || [];
      const deletedData = [
        ['GELÖSCHTE ZEILEN'],
        headers,
        ...result.details.deleted.map((diff) => diff.baselineRow || []),
      ];
      const deletedSheet = XLSX.utils.aoa_to_sheet(deletedData);
      XLSX.utils.book_append_sheet(workbook, deletedSheet, `${sheetName}_Gelöscht`);
    }
  });

  // Download
  XLSX.writeFile(workbook, `CSV_Vergleich_${Date.now()}.xlsx`);
}

export function exportToJSON(results: ComparisonResult[]): void {
  const jsonData = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CSV_Vergleich_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(results: ComparisonResult[]): void {
  // Export summary as CSV
  const headers = ['Datei', 'Neue Zeilen', 'Geänderte Zeilen', 'Gelöschte Zeilen', 'Änderungsrate'];
  const rows = results.map((r) => [
    r.comparedFileName,
    r.summary.newRows.toString(),
    r.summary.changedRows.toString(),
    r.summary.deletedRows.toString(),
    `${r.summary.changePercentage.toFixed(2)}%`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CSV_Vergleich_Zusammenfassung_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
