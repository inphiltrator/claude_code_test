import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { ComparisonSettings } from './components/ComparisonSettings';
import { SummaryDashboard } from './components/SummaryDashboard';
import { ComparisonTable } from './components/ComparisonTable';
import { ExportOptions } from './components/ExportOptions';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Trash2, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';

function App() {
  const currentFiles = useAppStore((state) => state.currentVersionFiles);
  const oldFiles = useAppStore((state) => state.oldVersionFiles);
  const comparisonResults = useAppStore((state) => state.comparisonResults);
  const clearAllFiles = useAppStore((state) => state.clearAllFiles);

  const hasAnyFiles = currentFiles.length > 0 || oldFiles.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">CSV-Koordinaten Vergleichstool</h1>
                <p className="text-sm text-muted-foreground">
                  Vergleichen Sie alte und aktuelle CSV-Versionen
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasAnyFiles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Alle löschen
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload Section - Zwei Spalten */}
          <section>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Alte Version */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-muted text-muted-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Referenz (Baseline)
                </div>
                <CardContent className="p-6">
                  <FileUpload
                    type="old"
                    title="Alte Version"
                    description="Alle CSV-Dateien der alten Version hochladen"
                  />
                  {oldFiles.length > 0 && (
                    <div className="mt-4">
                      <FileList type="old" title="Geladene Dateien" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pfeil */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-24 -translate-x-1/2 z-10">
                <div className="bg-background border rounded-full p-3">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Aktuelle Version */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Aktuell
                </div>
                <CardContent className="p-6">
                  <FileUpload
                    type="current"
                    title="Aktuelle Version"
                    description="Alle CSV-Dateien der aktuellen Version hochladen"
                  />
                  {currentFiles.length > 0 && (
                    <div className="mt-4">
                      <FileList type="current" title="Geladene Dateien" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Comparison Settings */}
          {hasAnyFiles && (
            <section>
              <ComparisonSettings />
            </section>
          )}

          {/* Results Section */}
          {comparisonResults.length > 0 && (
            <>
              {/* Summary Dashboard */}
              <section>
                <SummaryDashboard />
              </section>

              {/* Export Options */}
              <section>
                <ExportOptions />
              </section>

              {/* Detailed Comparison Tables */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold">Detaillierte Vergleiche</h2>
                {comparisonResults.map((result, index) => (
                  <ComparisonTable key={index} result={result} />
                ))}
              </section>
            </>
          )}

          {/* Empty State */}
          {!hasAnyFiles && (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine Dateien geladen</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Laden Sie CSV-Dateien in beide Bereiche hoch. Die Dateien werden automatisch
                anhand ihrer Namen verglichen: Alte Version (links) vs. Aktuelle Version (rechts).
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            CSV-Koordinaten Vergleichstool • Entwickelt mit React, TypeScript und Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
