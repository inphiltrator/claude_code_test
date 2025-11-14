import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { compareVersionFolders, groupFilesByBaseName } from '@/lib/comparison';
import { extractVersionNumber } from '@/lib/csvParser';
import toast from 'react-hot-toast';
import { Play, Info, Layers } from 'lucide-react';

export function ComparisonSettings() {
  const currentFiles = useAppStore((state) => state.currentVersionFiles);
  const oldFiles = useAppStore((state) => state.oldVersionFiles);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setComparisonResults = useAppStore((state) => state.setComparisonResults);

  // Prüfe, ob Dateien vorhanden sind
  const hasFiles = currentFiles.length > 0 || oldFiles.length > 0;

  // Finde gemeinsame Dateien für Spalten-Info
  const sampleFile = currentFiles[0] || oldFiles[0];
  const maxColumns = sampleFile ? sampleFile.headers.length - 1 : 0;

  // Prüfe ob es Koordinaten-Daten sind
  const isCoordinateData = sampleFile &&
    sampleFile.headers.length === 2 &&
    sampleFile.headers.some(h => h.toLowerCase().includes('koordinate'));

  // NEUE LOGIK: Gruppiere Dateien nach Base-Namen
  const allFiles = [...oldFiles, ...currentFiles];
  const fileGroups = groupFilesByBaseName(allFiles);

  // Filter: Nur Gruppen mit mindestens 2 Dateien können verglichen werden
  const comparableGroups = fileGroups.filter(group => group.files.length >= 2);

  // Zähle Gesamtanzahl der Vergleiche
  const totalComparisons = comparableGroups.reduce((sum, group) => {
    return sum + (group.files.length - 1); // Alle außer Baseline
  }, 0);

  const canCompare = comparableGroups.length > 0;

  const handleCompare = () => {
    if (!canCompare) {
      toast.error('Bitte laden Sie mindestens 2 Dateien mit gleichem Base-Namen hoch');
      return;
    }

    try {
      toast.loading(`${totalComparisons} Vergleiche werden durchgeführt...`, { id: 'compare' });

      const results = compareVersionFolders(oldFiles, currentFiles, settings);

      if (results.length === 0) {
        toast.error('Keine Vergleiche möglich. Mindestens 2 Dateien pro Gruppe nötig.', {
          id: 'compare',
        });
        return;
      }

      setComparisonResults(results);

      toast.success(`${results.length} Vergleiche abgeschlossen (${comparableGroups.length} Dateigruppen)`, {
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

        {/* Info über Dateigruppen */}
        {hasFiles && comparableGroups.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <Layers className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm w-full">
              <p className="font-medium text-green-900 dark:text-green-100 mb-2">
                {comparableGroups.length} Dateigruppe(n) gefunden
              </p>
              <div className="space-y-3">
                {comparableGroups.map((group, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                      📁 {group.baseName}
                    </p>
                    <div className="text-green-700 dark:text-green-300 ml-4 space-y-0.5">
                      {group.files.map((file, fileIdx) => {
                        const version = extractVersionNumber(file.name);
                        const isBaseline = fileIdx === 0;
                        return (
                          <p key={file.id}>
                            {isBaseline ? '📌' : '📄'} LM{version} {isBaseline && '(Baseline)'} - {file.rowCount} Zeilen
                          </p>
                        );
                      })}
                    </div>
                    <p className="text-green-600 dark:text-green-400 ml-4 mt-1 italic">
                      → {group.files.length - 1} Vergleich(e)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info wenn nur einzelne Dateien (keine Gruppen) */}
        {hasFiles && comparableGroups.length === 0 && fileGroups.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Einzelne Dateien erkannt
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Laden Sie weitere Versionen mit gleichem Base-Namen hoch (z.B. LM545 und LM548 mit gleichem Namen-Rest).
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Vorhandene Dateien:
                <ul className="ml-4 mt-1 space-y-0.5">
                  {fileGroups.map((group, idx) => (
                    <li key={idx}>• {group.baseName} (nur 1 Datei)</li>
                  ))}
                </ul>
              </div>
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
          disabled={!canCompare}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4" />
          {canCompare
            ? `${totalComparisons} Vergleich(e) starten (${comparableGroups.length} Gruppe${comparableGroups.length === 1 ? '' : 'n'})`
            : 'Bitte Dateien hochladen'
          }
        </Button>

        {!canCompare && hasFiles && (
          <p className="text-sm text-muted-foreground text-center">
            Laden Sie mindestens 2 Dateien mit gleichem Base-Namen hoch
            (z.B. LM545_BLW.csv und LM548_BLW.csv)
          </p>
        )}

        {!hasFiles && (
          <p className="text-sm text-muted-foreground text-center">
            Bitte laden Sie CSV-Dateien in die Upload-Bereiche
          </p>
        )}
      </CardContent>
    </Card>
  );
}
