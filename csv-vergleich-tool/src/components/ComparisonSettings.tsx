import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { compareVersionFolders } from '@/lib/comparison';
import toast from 'react-hot-toast';
import { Play, Info } from 'lucide-react';

export function ComparisonSettings() {
  const currentFiles = useAppStore((state) => state.currentVersionFiles);
  const oldFiles = useAppStore((state) => state.oldVersionFiles);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setComparisonResults = useAppStore((state) => state.setComparisonResults);

  // Prüfe, ob beide Versionen Dateien haben
  const canCompare = currentFiles.length > 0 && oldFiles.length > 0;

  // Finde gemeinsame Dateien für Spalten-Info
  const sampleFile = currentFiles[0] || oldFiles[0];
  const maxColumns = sampleFile ? sampleFile.headers.length - 1 : 0;

  // Finde Dateien, die in beiden Versionen vorkommen
  const matchingFiles = currentFiles.filter((current) =>
    oldFiles.some((old) => old.name === current.name)
  );

  const handleCompare = () => {
    if (!canCompare) {
      toast.error('Bitte laden Sie Dateien in beide Versionen hoch');
      return;
    }

    try {
      toast.loading('Vergleiche werden durchgeführt...', { id: 'compare' });

      const results = compareVersionFolders(oldFiles, currentFiles, settings);

      if (results.length === 0) {
        toast.error('Keine übereinstimmenden Dateinamen gefunden', {
          id: 'compare',
        });
        return;
      }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergleichseinstellungen</CardTitle>
        <CardDescription>
          Dateien werden automatisch anhand ihrer Namen verglichen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info über Matching */}
        {canCompare && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">
                {matchingFiles.length} übereinstimmende Datei(en) gefunden
              </p>
              <p className="text-muted-foreground text-xs">
                {matchingFiles.map((f) => f.name).join(', ')}
              </p>
            </div>
          </div>
        )}

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
            disabled={!sampleFile}
          />
          <p className="text-xs text-muted-foreground">
            {sampleFile
              ? `Spalte: ${sampleFile.headers[settings.keyColumn] || 'Unbekannt'}`
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
          Versionen vergleichen
        </Button>

        {!canCompare && (
          <p className="text-sm text-muted-foreground text-center">
            {currentFiles.length === 0 && oldFiles.length === 0
              ? 'Bitte laden Sie Dateien in beide Upload-Bereiche'
              : currentFiles.length === 0
              ? 'Bitte laden Sie aktuelle Versionen hoch'
              : 'Bitte laden Sie alte Versionen hoch'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
