import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { compareMultipleFiles } from '@/lib/comparison';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';

export function ComparisonSettings() {
  const baselineFiles = useAppStore((state) => state.baselineFiles);
  const comparedFiles = useAppStore((state) => state.comparedFiles);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setComparisonResults = useAppStore((state) => state.setComparisonResults);

  const baselineFile = baselineFiles.find((f) => f.id === settings.baselineFileId);
  const canCompare = baselineFiles.length >= 1 && comparedFiles.length >= 1 && settings.baselineFileId !== null;

  const handleCompare = () => {
    if (!baselineFile) {
      toast.error('Bitte wählen Sie zuerst eine Baseline-Datei');
      return;
    }

    if (comparedFiles.length === 0) {
      toast.error('Bitte laden Sie mindestens eine Datei zum Vergleichen hoch');
      return;
    }

    try {
      toast.loading('Vergleiche werden durchgeführt...', { id: 'compare' });

      const results = compareMultipleFiles(baselineFile, comparedFiles, settings);
      setComparisonResults(results);

      toast.success(`${results.length} Vergleiche abgeschlossen`, {
        id: 'compare',
      });
    } catch (error) {
      console.error('Fehler beim Vergleich:', error);
      toast.error('Fehler beim Vergleichen der Dateien', {
        id: 'compare',
      });
    }
  };

  const maxColumns = baselineFile ? baselineFile.headers.length - 1 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergleichseinstellungen</CardTitle>
        <CardDescription>
          Konfigurieren Sie die Parameter für den CSV-Vergleich
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyColumn">Schlüsselspalte (Index)</Label>
          <Input
            id="keyColumn"
            type="number"
            min={0}
            max={maxColumns}
            value={settings.keyColumn}
            onChange={(e) =>
              updateSettings({ keyColumn: parseInt(e.target.value) || 0 })
            }
            disabled={!baselineFile}
          />
          <p className="text-xs text-muted-foreground">
            {baselineFile
              ? `Spalte: ${baselineFile.headers[settings.keyColumn] || 'Unbekannt'}`
              : 'Bitte zuerst Dateien hochladen'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tolerance">Numerische Toleranz</Label>
          <Input
            id="tolerance"
            type="number"
            min={0}
            step={0.001}
            value={settings.numericTolerance}
            onChange={(e) =>
              updateSettings({
                numericTolerance: parseFloat(e.target.value) || 0,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Toleranz für numerische Werte (z.B. 0.001 für ±0.001)
          </p>
        </div>

        <Button
          onClick={handleCompare}
          disabled={!canCompare}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4" />
          Vergleich starten
        </Button>

        {!canCompare && (
          <p className="text-sm text-muted-foreground text-center">
            {baselineFiles.length === 0
              ? 'Bitte Baseline-Datei hochladen'
              : comparedFiles.length === 0
              ? 'Bitte Dateien zum Vergleichen hochladen'
              : 'Bitte Baseline-Datei wählen'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
