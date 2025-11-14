import Papa from 'papaparse';
import type { CSVFile } from '@/types';

/**
 * Extrahiert die Versionsnummer aus dem Dateinamen (z.B. LM545 -> "545")
 */
export function extractVersionNumber(filename: string): string | null {
  const match = filename.match(/LM(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Extrahiert die Versionsnummer als Zahl (z.B. LM545 -> 545)
 */
export function extractVersion(filename: string): number {
  const match = filename.match(/LM(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Entfernt die Versionsnummer aus dem Dateinamen (Base-Name)
 * Beispiel: LM545_BLW_V3_koordinaten.csv -> BLW_V3_koordinaten.csv
 */
export function getBaseName(filename: string): string {
  return filename.replace(/LM\d+_?/i, '');
}

/**
 * Parst eine CSV-Datei mit Semikolon als Trennzeichen
 */
export async function parseCSVFile(file: File): Promise<CSVFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ';',  // WICHTIG: Semikolon statt Komma!
      complete: (results) => {
        const data = results.data as string[][];

        // Leere Zeilen am Ende entfernen
        const cleanedData = data.filter(row =>
          row.some(cell => cell && cell.trim() !== '')
        );

        if (cleanedData.length === 0) {
          reject(new Error('CSV-Datei ist leer'));
          return;
        }

        const headers = cleanedData[0] || [];
        const rows = cleanedData.slice(1);

        // Extrahiere Versionsnummer aus Dateinamen
        const version = extractVersionNumber(file.name);

        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          content: cleanedData,
          headers: headers,
          rowCount: rows.length,
          uploadedAt: new Date(),
          // @ts-ignore - Erweitere temporär den Typ für Versionsnummer
          version: version
        });
      },
      error: (error) => reject(error),
      skipEmptyLines: true,
      encoding: 'UTF-8',
      dynamicTyping: false  // Keine automatische Typ-Konvertierung
    });
  });
}

export async function parseMultipleCSVFiles(files: File[]): Promise<CSVFile[]> {
  const parsePromises = files.map(file => parseCSVFile(file));
  return Promise.all(parsePromises);
}
