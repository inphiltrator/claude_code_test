import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { compareVersionFolders } from '@/lib/comparison';
import { extractVersionNumber } from '@/lib/csvParser';
import toast from 'react-hot-toast';
import { Play, Info, AlertCircle } from 'lucide-react';

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

  // Prüfe ob es Koordinaten-Daten sind
  const isCoordinateData = sampleFile &&
    sampleFile.headers.length === 2 &&
    sampleFile.headers.some(h => h.toLowerCase().includes('koordinate'));

  // Finde Dateien, die in beiden Versionen vorkommen
  const matchingFiles = currentFiles.filter((current) =>
    oldFiles.some((old) => old.name === current.name)
  );

  // Extrahiere Versionsnummern
  const oldVersions = oldFiles.map(f => ({
    name: f.name,
    version: extractVersionNumber(f.name)
  })).filter(f => f.version !== null);

  const currentVersions = currentFiles.map(f => ({
    name: f.name,
    version: extractVersionNumber(f.name)
  })).filter(f => f.version !== null);

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
        {/* Info über Koordinaten-Erkennung */}
        {isCoordinateData && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Koordinaten-Daten erkannt
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Composite Key wird verwendet: {sampleFile.headers[0]} + {sampleFile.headers[1]}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                Jede Zeile wird durch die Kombination beider Koordinaten eindeutig identifiziert.
              </p>
            </div>
          </div>
        )}

        {/* Info über Matching */}
        {canCompare && matchingFiles.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm w-full">
              <p className="font-medium mb-1">
                {matchingFiles.length} übereinstimmende Datei(en) gefunden
              </p>
              {oldVersions.length > 0 && currentVersions.length > 0 && (
                <div className="text-muted-foreground text-xs space-y-1">
                  <p>Alte Versionen: {oldVersions.map(v => `LM${v.version}`).join(', ')}</p>
                  <p>Aktuelle Versionen: {currentVersions.map(v => `LM${v.version}`).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnung wenn keine Matches */}
        {canCompare && matchingFiles.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Keine übereinstimmenden Dateinamen
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                Stellen Sie sicher, dass die Dateinamen in beiden Ordnern identisch sind.
              </p>
            </div>
          </div>
        )}

        {!isCoordinateData && sampleFile && (
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
            />
            <p className="text-xs text-muted-foreground">
              Spalte: {sampleFile.headers[settings.keyColumn] || 'Unbekannt'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tolerance">Numerische Toleranz</Label>
          <Input
            id="tolerance"
            type="number"
            min={0}
            step={0.00000001}
            value={settings.numericTolerance}
            onChange={(e) =>
              updateSettings({
                numericTolerance: parseFloat(e.target.value) || 0,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Toleranz für Fließkommazahlen (z.B. 0.00000001 für sehr präzise Koordinaten)
          </p>
        </div>

        <Button
          onClick={handleCompare}
          disabled={!canCompare || matchingFiles.length === 0}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4" />
          Versionen vergleichen ({matchingFiles.length} Dateien)
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
