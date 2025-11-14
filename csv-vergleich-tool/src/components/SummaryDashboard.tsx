import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

export function SummaryDashboard() {
  const comparisonResults = useAppStore((state) => state.comparisonResults);

  if (comparisonResults.length === 0) {
    return null;
  }

  const totalStats = comparisonResults.reduce(
    (acc, result) => ({
      newRows: acc.newRows + result.summary.newRows,
      changedRows: acc.changedRows + result.summary.changedRows,
      deletedRows: acc.deletedRows + result.summary.deletedRows,
    }),
    { newRows: 0, changedRows: 0, deletedRows: 0 }
  );

  const avgChangePercentage =
    comparisonResults.reduce(
      (acc, result) => acc + result.summary.changePercentage,
      0
    ) / comparisonResults.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Zusammenfassung</h2>
        <p className="text-muted-foreground">
          Überblick über alle {comparisonResults.length} Vergleich(e)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Zeilen</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStats.newRows}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In allen Vergleichen hinzugefügt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Geänderte Zeilen
            </CardTitle>
            <Pencil className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalStats.changedRows}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Modifizierte Einträge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gelöschte Zeilen
            </CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalStats.deletedRows}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entfernte Einträge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ø Änderungsrate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgChangePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Durchschnittlich verändert
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaillierte Vergleiche</CardTitle>
          <CardDescription>
            Übersicht aller durchgeführten Vergleiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{result.comparedFileName}</p>
                    <p className="text-sm text-muted-foreground">
                      vs. {result.baselineFileName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      +{result.summary.newRows}
                    </div>
                    <div className="text-xs text-muted-foreground">Neu</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">
                      ~{result.summary.changedRows}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Geändert
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">
                      -{result.summary.deletedRows}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gelöscht
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="font-bold">
                      {result.summary.changePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Änderung</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
