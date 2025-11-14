import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { FileUpload } from './components/FileUpload';
import { FileLists } from './components/FileLists';
import { ComparisonSettings } from './components/ComparisonSettings';
import { SummaryDashboard } from './components/SummaryDashboard';
import { ComparisonTable } from './components/ComparisonTable';
import { ExportOptions } from './components/ExportOptions';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Trash2, FileSpreadsheet } from 'lucide-react';

function App() {
  const baselineFiles = useAppStore((state) => state.baselineFiles);
  const comparedFiles = useAppStore((state) => state.comparedFiles);
  const comparisonResults = useAppStore((state) => state.comparisonResults);
  const clearAllFiles = useAppStore((state) => state.clearAllFiles);

  const hasFiles = baselineFiles.length > 0 || comparedFiles.length > 0;

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
                  Vergleichen Sie mehrere CSV-Dateien mit intelligenter Diff-Visualisierung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasFiles && (
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
          {/* Upload Section - Two separate areas */}
          <section className="grid md:grid-cols-2 gap-6">
            <FileUpload
              type="baseline"
              title="Baseline-Dateien (Alt)"
              description="Laden Sie die ursprünglichen CSV-Dateien hoch, die als Vergleichsbasis dienen."
            />
            <FileUpload
              type="compared"
              title="Zu vergleichende Dateien (Neu)"
              description="Laden Sie die neuen CSV-Dateien hoch, die mit der Baseline verglichen werden sollen."
            />
          </section>

          {/* Files List */}
          {hasFiles && (
            <section>
              <FileLists />
            </section>
          )}

          {/* Comparison Settings */}
          {hasFiles && (
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
          {!hasFiles && (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine Dateien geladen</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Laden Sie CSV-Dateien hoch, um mit dem Vergleich zu beginnen.
                Sie können Baseline-Dateien (alt) links und neue Dateien rechts hochladen.
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
