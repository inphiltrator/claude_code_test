import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { exportToExcel, exportToJSON, exportToCSV } from '@/lib/export';
import toast from 'react-hot-toast';

export function ExportOptions() {
  const comparisonResults = useAppStore((state) => state.comparisonResults);

  if (comparisonResults.length === 0) {
    return null;
  }

  const handleExportExcel = () => {
    try {
      exportToExcel(comparisonResults);
      toast.success('Excel-Datei erfolgreich exportiert');
    } catch (error) {
      console.error('Fehler beim Export:', error);
      toast.error('Fehler beim Excel-Export');
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(comparisonResults);
      toast.success('JSON-Datei erfolgreich exportiert');
    } catch (error) {
      console.error('Fehler beim Export:', error);
      toast.error('Fehler beim JSON-Export');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(comparisonResults);
      toast.success('CSV-Datei erfolgreich exportiert');
    } catch (error) {
      console.error('Fehler beim Export:', error);
      toast.error('Fehler beim CSV-Export');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
        <CardDescription>
          Exportieren Sie die Vergleichsergebnisse in verschiedenen Formaten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          <Button onClick={handleExportExcel} variant="outline" className="w-full">
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </Button>
          <Button onClick={handleExportJSON} variant="outline" className="w-full">
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="w-full">
            <FileText className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
