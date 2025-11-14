import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { groupResultsByCategory } from '@/lib/comparison';
import type { ComparisonResult } from '@/types';

interface CategorySummaryCardsProps {
  summary: {
    totalNew: number;
    totalChanged: number;
    totalDeleted: number;
    avgChangeRate?: number;
  };
}

function CategorySummaryCards({ summary }: CategorySummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Neue Zeilen</CardTitle>
          <Plus className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summary.totalNew}
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
            {summary.totalChanged}
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
            {summary.totalDeleted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Entfernte Einträge
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Änderungsrate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.avgChangeRate?.toFixed(1) || '0.0'}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Durchschnittlich verändert
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ComparisonListProps {
  results: ComparisonResult[];
}

function ComparisonList({ results }: ComparisonListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaillierte Vergleiche</CardTitle>
        <CardDescription>
          {results.length} Vergleich(e) in dieser Kategorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
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
  );
}

export function SummaryDashboard() {
  const comparisonResults = useAppStore((state) => state.comparisonResults);

  if (comparisonResults.length === 0) {
    return null;
  }

  const categoryGroups = groupResultsByCategory(comparisonResults);

  const allSummary = {
    totalComparisons: comparisonResults.length,
    totalNew: comparisonResults.reduce((sum, r) => sum + r.summary.newRows, 0),
    totalChanged: comparisonResults.reduce((sum, r) => sum + r.summary.changedRows, 0),
    totalDeleted: comparisonResults.reduce((sum, r) => sum + r.summary.deletedRows, 0),
    avgChangeRate: comparisonResults.reduce((sum, r) => sum + r.summary.changePercentage, 0) / comparisonResults.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Zusammenfassung</h2>
        <p className="text-muted-foreground">
          Überblick über alle {comparisonResults.length} Vergleich(e)
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="all" className="flex-shrink-0">
            Alle ({allSummary.totalComparisons})
          </TabsTrigger>
          {categoryGroups.map(group => (
            <TabsTrigger
              key={group.category.key}
              value={group.category.key}
              className="flex-shrink-0"
            >
              {group.category.displayName} ({group.summary.totalComparisons})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Alle Vergleiche */}
        <TabsContent value="all" className="space-y-6">
          <CategorySummaryCards summary={allSummary} />
          <ComparisonList results={comparisonResults} />
        </TabsContent>

        {/* Pro Kategorie */}
        {categoryGroups.map(group => (
          <TabsContent
            key={group.category.key}
            value={group.category.key}
            className="space-y-6"
          >
            <CategorySummaryCards
              summary={group.summary}
            />
            <ComparisonList results={group.results} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
