import Papa from 'papaparse';
import type { CSVFile } from '@/types';

export async function parseCSVFile(file: File): Promise<CSVFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];

        // Leere Zeilen am Ende entfernen
        const cleanedData = data.filter(row =>
          row.some(cell => cell.trim() !== '')
        );

        if (cleanedData.length === 0) {
          reject(new Error('CSV-Datei ist leer'));
          return;
        }

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

export async function parseMultipleCSVFiles(files: File[]): Promise<CSVFile[]> {
  const parsePromises = files.map(file => parseCSVFile(file));
  return Promise.all(parsePromises);
}
