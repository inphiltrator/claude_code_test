# CSV-Vergleichstool: Verbesserungen für Detail-Ansicht und Kategorisierung

## 🎯 Ziel

Die App funktioniert grundsätzlich, aber die Detail-Ansicht und Kategorisierung müssen verbessert werden. Benutzer können aktuell nicht sehen, WELCHE Werte sich konkret geändert haben.

## 📋 Aktuelle Probleme

1. ✅ **Vergleich funktioniert** - Änderungen werden erkannt
2. ❌ **Keine Anzeige der konkreten Wertänderungen** - Nur "Geändert" Badge, aber keine Details
3. ❌ **Detail-Tabelle ist leer/unvollständig** - Zeigt keine Spalten-Werte
4. ❌ **Keine Kategorisierung nach Datei-Typ** - Alle Vergleiche in einer langen Liste

## 📁 Testdaten

Im Ordner **`csv_examples/`** befinden sich Test-CSV-Dateien mit folgender Struktur:

### Dateinamen-Beispiele:
```
LM545_BLW_V3_L00_WIN_koordinaten.csv
LM548_BLW_V3_L00_WIN_koordinaten.csv

LM545_BLW_V3_L01_columns_COL_int_240_240_GLVL_S_koordinaten.csv
LM548_BLW_V3_L01_columns_COL_int_240_240_GLVL_S_koordinaten.csv

LM545_BLW_V3_L01_columns_COL_int_280_200_BauBuche_GL75_koordinaten.csv
LM548_BLW_V3_L01_columns_COL_int_280_200_BauBuche_GL75_koordinaten.csv
```

### CSV-Struktur:
```csv
X-Koordinate;Y-Koordinate
14305.00000000;3332.50000000
10220.00000000;19524.00004244
0.00000000;19524.00004244
14302.50000000;1.00000000
```

**Wichtig:**
- Trennzeichen: **Semikolon (`;`)**
- Dezimaltrennzeichen: **Punkt (`.`)**
- Koordinaten-Präzision: 8 Dezimalstellen
- Kein ID-Feld: Schlüssel = `X-Koordinate_Y-Koordinate`

### Kategorien in Dateinamen:
- **WIN** = Fenster (Windows)
- **COL** = Säulen/Stützen (Columns)
- **Dimensionen**: z.B. `240_240`, `280_200` (Breite x Höhe in mm)
- **Materialien**: z.B. `GLVL_S`, `BauBuche_GL75`, `BSH_GL24h`

---

## 🔧 Anforderungen

### 1. Detail-Tabelle mit vollständiger Diff-Anzeige

#### Aktuell:
```tsx
// Zeigt nur Badges: "Neu", "Gelöscht"
// Keine Spalten-Werte sichtbar
```

#### NEU - Vollständige Tabelle:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-24">Typ</TableHead>
      <TableHead className="w-48">Schlüssel (X_Y)</TableHead>
      <TableHead>X-Koordinate</TableHead>
      <TableHead>Y-Koordinate</TableHead>
      {/* Weitere Spalten dynamisch */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(diff => (
      <TableRow key={diff.key} className={getRowClassName(diff.changeType)}>
        <TableCell>
          <Badge variant={getBadgeVariant(diff.changeType)}>
            {getChangeLabel(diff.changeType)}
          </Badge>
        </TableCell>
        <TableCell className="font-mono text-sm">
          {diff.key}
        </TableCell>
        {diff.columnDiffs.map((col, idx) => (
          <TableCell key={idx}>
            <DiffCell columnDiff={col} changeType={diff.changeType} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Styling pro Änderungstyp:
```typescript
function getRowClassName(changeType: 'new' | 'changed' | 'deleted'): string {
  switch (changeType) {
    case 'new':
      return 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900';
    case 'changed':
      return 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900';
    case 'deleted':
      return 'bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900';
  }
}
```

---

### 2. Erweiterte DiffCell-Komponente

#### Bei NEUEN Zeilen:
```tsx
<div className="text-green-700 dark:text-green-300 font-medium">
  {newValue}
</div>
```

#### Bei GELÖSCHTEN Zeilen:
```tsx
<div className="text-red-700 dark:text-red-300 line-through">
  {oldValue}
</div>
```

#### Bei GEÄNDERTEN Zeilen (wenn Wert unterschiedlich):
```tsx
<div className="space-y-1">
  {/* Alter Wert */}
  <div className="text-gray-400 line-through text-xs">
    {oldValue}
  </div>
  
  {/* Neuer Wert */}
  <div className="text-blue-600 dark:text-blue-400 font-semibold">
    {newValue}
  </div>
  
  {/* Delta bei numerischen Werten */}
  {isNumeric && (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      Δ {calculateDelta(oldValue, newValue)}
    </div>
  )}
</div>
```

#### Bei UNVERÄNDERTEN Spalten (in geänderten Zeilen):
```tsx
<div className="text-gray-600 dark:text-gray-400">
  {value}
</div>
```

#### Delta-Berechnung:
```typescript
function calculateDelta(oldVal: string, newVal: string): string {
  const old = parseFloat(oldVal);
  const neu = parseFloat(newVal);
  
  if (!isNaN(old) && !isNaN(neu)) {
    const diff = neu - old;
    const sign = diff > 0 ? '+' : '';
    const formatted = Math.abs(diff) < 0.01 
      ? diff.toExponential(2) 
      : diff.toFixed(2);
    return `${sign}${formatted}`;
  }
  
  return '-';
}
```

**Beispiel-Ausgabe:**
```
Alt: 14305.00000000
Neu: 14307.50000000
Δ +2.50
```

---

### 3. Kategorisierung mit Tabs

#### Kategorie-Extraktion aus Dateinamen:

```typescript
interface FileCategory {
  key: string;          // "WIN" | "COL_240x240" | "COL_280x200_BauBuche"
  displayName: string;  // "WIN Fenster" | "COL 240×240" | "COL 280×200 BauBuche"
  type: string;         // "WIN" | "COL"
  dimensions?: string;  // "240x240" | "280x200"
  material?: string;    // "GLVL_S" | "BauBuche_GL75"
}

function extractCategory(filename: string): FileCategory {
  // Entferne Version und Basis-Präfix
  // LM545_BLW_V3_L01_columns_COL_int_240_240_GLVL_S_koordinaten.csv
  
  const winMatch = filename.match(/_(WIN)_/i);
  if (winMatch) {
    return {
      key: 'WIN',
      displayName: 'WIN Fenster',
      type: 'WIN'
    };
  }
  
  const colMatch = filename.match(/_(COL)_int_(\d+)_(\d+)(?:_([^_]+?))?_/i);
  if (colMatch) {
    const [, type, width, height, material] = colMatch;
    const dimensions = `${width}x${height}`;
    const materialName = material || '';
    
    const key = material 
      ? `COL_${dimensions}_${material}`
      : `COL_${dimensions}`;
    
    const displayName = material
      ? `COL ${width}×${height} ${material}`
      : `COL ${width}×${height}`;
    
    return {
      key,
      displayName,
      type: 'COL',
      dimensions,
      material: materialName || undefined
    };
  }
  
  // Fallback
  return {
    key: 'OTHER',
    displayName: 'Sonstige',
    type: 'OTHER'
  };
}
```

#### Gruppierung der Vergleichsergebnisse:

```typescript
interface CategoryGroup {
  category: FileCategory;
  results: ComparisonResult[];
  summary: {
    totalComparisons: number;
    totalNew: number;
    totalChanged: number;
    totalDeleted: number;
    avgChangeRate: number;
  };
}

function groupResultsByCategory(results: ComparisonResult[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  
  results.forEach(result => {
    const category = extractCategory(result.comparedFileName);
    
    if (!groups.has(category.key)) {
      groups.set(category.key, {
        category,
        results: [],
        summary: {
          totalComparisons: 0,
          totalNew: 0,
          totalChanged: 0,
          totalDeleted: 0,
          avgChangeRate: 0
        }
      });
    }
    
    const group = groups.get(category.key)!;
    group.results.push(result);
    group.summary.totalComparisons++;
    group.summary.totalNew += result.summary.newRows;
    group.summary.totalChanged += result.summary.changedRows;
    group.summary.totalDeleted += result.summary.deletedRows;
  });
  
  // Durchschnittliche Änderungsrate berechnen
  groups.forEach(group => {
    const totalChanges = group.summary.totalNew + 
                        group.summary.totalChanged + 
                        group.summary.totalDeleted;
    const totalRows = group.results.reduce(
      (sum, r) => sum + r.summary.totalRows, 0
    );
    group.summary.avgChangeRate = (totalChanges / totalRows) * 100;
  });
  
  return Array.from(groups.values())
    .sort((a, b) => a.category.displayName.localeCompare(b.category.displayName));
}
```

---

### 4. UI-Struktur mit Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SummaryDashboard({ results }: { results: ComparisonResult[] }) {
  const categoryGroups = groupResultsByCategory(results);
  
  const allSummary = {
    totalComparisons: results.length,
    totalNew: results.reduce((sum, r) => sum + r.summary.newRows, 0),
    totalChanged: results.reduce((sum, r) => sum + r.summary.changedRows, 0),
    totalDeleted: results.reduce((sum, r) => sum + r.summary.deletedRows, 0),
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
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
          <ComparisonList results={results} />
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
              categoryName={group.category.displayName}
            />
            <ComparisonList results={group.results} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

#### Zusammenfassungs-Karten pro Kategorie:

```tsx
function CategorySummaryCards({ 
  summary, 
  categoryName 
}: { 
  summary: any; 
  categoryName?: string; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Neue Zeilen
          </CardTitle>
          <PlusCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summary.totalNew}
          </div>
          <p className="text-xs text-muted-foreground">
            In allen Vergleichen hinzugefügt
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Geänderte Zeilen
          </CardTitle>
          <Edit className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {summary.totalChanged}
          </div>
          <p className="text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">
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
            {summary.avgChangeRate?.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Durchschnittlich verändert
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 5. Responsive Detail-Tabelle

#### Horizontales Scrollen bei vielen Spalten:

```tsx
<div className="rounded-md border">
  <div className="overflow-x-auto">
    <Table className="min-w-full">
      <TableHeader>
        {/* Sticky erste Spalten */}
        <TableRow>
          <TableHead className="sticky left-0 z-20 bg-background">
            Typ
          </TableHead>
          <TableHead className="sticky left-24 z-20 bg-background border-r">
            Schlüssel
          </TableHead>
          {headers.map((header, idx) => (
            <TableHead key={idx}>
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* ... */}
      </TableBody>
    </Table>
  </div>
</div>
```

#### CSS für Sticky Columns:

```css
/* In globals.css oder component CSS */
.sticky-col {
  position: sticky;
  background: hsl(var(--background));
  z-index: 10;
}

.sticky-col-shadow {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

/* Dark Mode */
.dark .sticky-col {
  background: hsl(var(--background));
}
```

---

### 6. Erweiterte Vergleichs-Detail-Ansicht

#### Aufklappbares Detail pro Vergleich:

```tsx
<Accordion type="single" collapsible className="w-full">
  {categoryGroup.results.map((result, idx) => (
    <AccordionItem key={idx} value={`result-${idx}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">
                {result.comparedFileName}
              </div>
              <div className="text-sm text-muted-foreground">
                vs. {result.baselineFileName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">
              +{result.summary.newRows} Neu
            </span>
            <span className="text-yellow-600">
              ~{result.summary.changedRows} Geändert
            </span>
            <span className="text-red-600">
              -{result.summary.deletedRows} Gelöscht
            </span>
            <span className="text-blue-600 font-medium">
              {result.summary.changePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent>
        <ComparisonDetailTable result={result} />
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

---

### 7. Filter-Funktionen in Detail-Tabelle

```tsx
function ComparisonDetailTable({ result }: { result: ComparisonResult }) {
  const [filter, setFilter] = useState<ChangeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = useMemo(() => {
    let data = [...result.details.new, ...result.details.changed, ...result.details.deleted];
    
    // Filter nach Änderungstyp
    if (filter !== 'all') {
      data = data.filter(row => row.changeType === filter);
    }
    
    // Suche nach Schlüssel
    if (searchTerm) {
      data = data.filter(row => 
        row.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return data;
  }, [result, filter, searchTerm]);
  
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      {/* Filter-Leiste */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Suche nach Schlüssel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Alle ({result.details.new.length + result.details.changed.length + result.details.deleted.length})
          </Button>
          <Button
            variant={filter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new')}
          >
            Neu ({result.details.new.length})
          </Button>
          <Button
            variant={filter === 'changed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('changed')}
          >
            Geändert ({result.details.changed.length})
          </Button>
          <Button
            variant={filter === 'deleted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('deleted')}
          >
            Gelöscht ({result.details.deleted.length})
          </Button>
        </div>
      </div>
      
      {/* Tabelle */}
      <DetailTable data={filteredData} headers={result.headers} />
    </div>
  );
}
```

---

## 📦 Zu aktualisierende Dateien

### 1. `src/components/ComparisonTable.tsx`
- Vollständige Tabelle mit allen Spalten
- Sticky erste Spalten
- Responsive Overflow-Handling

### 2. `src/components/DiffCell.tsx`
- Erweiterte Diff-Visualisierung
- Alt → Neu Anzeige
- Delta-Berechnung
- Styling nach Änderungstyp

### 3. `src/components/SummaryDashboard.tsx`
- Tab-Navigation für Kategorien
- Kategorie-Extraktion
- Gruppierte Statistiken
- Filter-Integration

### 4. `src/lib/comparison.ts`
- Kategorie-Extraktion-Funktion
- Gruppierungs-Logik
- Erweiterte RowDiff mit columnDiffs

### 5. `src/types/index.ts`
- FileCategory Interface
- CategoryGroup Interface
- Erweiterte ComparisonResult

---

## 🧪 Testing

### Test-Szenarien:

1. **Basis-Vergleich:**
   - Lade `LM545_BLW_V3_L00_WIN_koordinaten.csv`
   - Lade `LM548_BLW_V3_L00_WIN_koordinaten.csv`
   - Ändere manuell eine Koordinate in LM548
   - Vergleiche durchführen
   - **Erwartung:** Änderung wird inline angezeigt mit Alt → Neu

2. **Multi-Kategorie:**
   - Lade alle Dateien aus `csv_examples/`
   - **Erwartung:** 
     - Tabs erscheinen: "Alle", "WIN", "COL 240×240", "COL 280×200"
     - Pro Tab: Nur relevante Vergleiche
     - Statistiken pro Kategorie korrekt

3. **Neue/Gelöschte Zeilen:**
   - Füge in LM548 eine Zeile hinzu
   - Lösche in LM548 eine Zeile
   - **Erwartung:**
     - Neue Zeile: Grün hinterlegt, alle Werte sichtbar
     - Gelöschte Zeile: Rot hinterlegt, durchgestrichen

4. **Delta-Berechnung:**
   - Ändere X-Koordinate von `14305.00000000` zu `14307.50000000`
   - **Erwartung:** Delta zeigt `Δ +2.50`

5. **Responsive:**
   - Teste auf kleinem Bildschirm
   - **Erwartung:** Horizontales Scrollen funktioniert, erste Spalten sticky

---

## 🎨 Design-Spezifikationen

### Farbschema (Light Mode):

```css
--color-new: rgb(220 252 231);      /* bg-green-100 */
--color-new-text: rgb(21 128 61);   /* text-green-700 */
--color-changed: rgb(254 249 195);  /* bg-yellow-100 */
--color-changed-text: rgb(161 98 7); /* text-yellow-700 */
--color-deleted: rgb(254 226 226);  /* bg-red-100 */
--color-deleted-text: rgb(185 28 28); /* text-red-700 */
--color-diff-new: rgb(37 99 235);   /* text-blue-600 */
--color-diff-old: rgb(156 163 175); /* text-gray-400 */
```

### Farbschema (Dark Mode):

```css
--color-new-dark: rgb(20 83 45);      /* bg-green-950 */
--color-new-text-dark: rgb(134 239 172); /* text-green-300 */
--color-changed-dark: rgb(113 63 18);  /* bg-yellow-950 */
--color-changed-text-dark: rgb(253 224 71); /* text-yellow-300 */
--color-deleted-dark: rgb(127 29 29);  /* bg-red-950 */
--color-deleted-text-dark: rgb(252 165 165); /* text-red-300 */
--color-diff-new-dark: rgb(96 165 250); /* text-blue-400 */
--color-diff-old-dark: rgb(156 163 175); /* text-gray-400 */
```

### Typografie:

```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-sans: 'Inter', -apple-system, sans-serif;
```

---

## ✅ Akzeptanzkriterien

### Must-Have:

- [ ] Detail-Tabelle zeigt ALLE Spalten mit Werten
- [ ] Geänderte Werte: Alt → Neu inline sichtbar
- [ ] Delta-Berechnung bei numerischen Werten
- [ ] Kategorisierung in Tabs funktioniert
- [ ] Neue Zeilen: Grün, Gelöscht: Rot, Geändert: Gelb
- [ ] Filter nach Änderungstyp funktioniert
- [ ] Suche nach Schlüssel funktioniert
- [ ] Responsive auf Mobile/Tablet/Desktop

### Nice-to-Have:

- [ ] Export pro Kategorie
- [ ] Spalten-Sortierung
- [ ] Spalten ein-/ausblenden
- [ ] Diff-Highlight beim Hovern
- [ ] Keyboard-Navigation in Tabelle
- [ ] CSV-Download der gefilterten Ergebnisse

---

## 🚀 Implementierungs-Reihenfolge

### Phase 1: Detail-Tabelle (Prio 1)
1. ComparisonTable.tsx: Vollständige Spalten-Anzeige
2. DiffCell.tsx: Alt → Neu Visualisierung
3. Delta-Berechnung
4. Styling nach Änderungstyp

### Phase 2: Kategorisierung (Prio 2)
5. Kategorie-Extraktion aus Dateinamen
6. Gruppierungs-Logik
7. Tab-Navigation
8. Kategorie-spezifische Statistiken

### Phase 3: Filter & Suche (Prio 3)
9. Filter-Buttons (Alle/Neu/Geändert/Gelöscht)
10. Suchfeld für Schlüssel
11. Responsive Optimierungen

### Phase 4: Polish (Prio 4)
12. Accordion für Vergleiche
13. Sticky Columns
14. Dark Mode Optimierung
15. Performance-Tuning

---

## 📝 Hinweise für Implementierung

### PapaParse-Konfiguration:

Stelle sicher, dass Semikolon als Delimiter konfiguriert ist:

```typescript
Papa.parse(file, {
  delimiter: ';',        // WICHTIG: Semikolon!
  decimal: '.',
  skipEmptyLines: true,
  encoding: 'UTF-8',
  complete: (results) => {
    // ...
  }
});
```

### Composite Key bei fehlender ID:

```typescript
function createCompositeKey(row: string[]): string {
  // Für X-Y-Koordinaten
  return `${row[0]}_${row[1]}`;
}
```

### Performance bei großen Dateien:

```typescript
// Virtualisierung ab 1000+ Zeilen
import { useVirtualizer } from '@tanstack/react-virtual';

// Oder: Pagination
const ROWS_PER_PAGE = 100;
```

---

## 🔗 Ressourcen

- **shadcn/ui Komponenten**: https://ui.shadcn.com
- **TanStack Table Docs**: https://tanstack.com/table/v8
- **PapaParse Docs**: https://www.papaparse.com/docs
- **Lucide Icons**: https://lucide.dev

---

## 🎯 Zusammenfassung

**Ziel:** Benutzer sollen auf einen Blick sehen:
1. **WAS** hat sich geändert (konkrete Werte: Alt → Neu)
2. **WO** (Kategorisierung nach Datei-Typ)
3. **WIEVIEL** (Delta-Berechnung bei Koordinaten)

**Teste mit:** Dateien im Ordner `csv_examples/`

**Erwartetes Ergebnis:**
- Vollständige, übersichtliche Tabellen
- Klare Diff-Visualisierung
- Intuitive Kategorisierung
- Professionelle, responsive UI

---

Viel Erfolg bei der Implementierung! 🚀