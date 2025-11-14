# CSV-Koordinaten Vergleichstool

Eine moderne React-Webanwendung zum Vergleichen von mehreren CSV-Koordinatendateien mit professioneller Visualisierung der Unterschiede.

## Features

### Kernfunktionalität

- **Multi-File Upload**: Drag & Drop Zone für beliebig viele CSV-Dateien
- **Baseline-Auswahl**: Wählen Sie eine Referenzdatei für den Vergleich
- **Intelligenter Vergleich**:
  - Schlüsselbasierter Vergleich (konfigurierbare ID-Spalte)
  - Numerische Toleranzschwelle für Koordinaten
  - Erkennung von neuen, geänderten und gelöschten Zeilen

### Visualisierung

- **Farbcodierung**:
  - 🟢 Grün: Neue Zeilen
  - 🟡 Gelb: Geänderte Zeilen (mit Inline-Diff)
  - 🔴 Rot: Gelöschte Zeilen
- **Summary Dashboard**: Statistiken und Änderungsraten
- **Interaktive Tabellen**: Sortierung, Filterung und Suche

### Export

- **Excel (.xlsx)**: Mit Farbcodierung und separaten Sheets
- **JSON**: Strukturierte Diff-Daten
- **CSV**: Zusammenfassungs-Report

### UX Features

- **Dark/Light Mode**: Umschaltbarer Theme
- **Responsive Design**: Desktop, Tablet, Mobile
- **Toast-Benachrichtigungen**: Echtzeit-Feedback

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build-Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI-Komponenten**: shadcn/ui
- **State Management**: Zustand
- **Libraries**:
  - PapaParse (CSV-Parsing)
  - React Dropzone (Drag & Drop)
  - TanStack Table (Tabellen)
  - SheetJS (Excel-Export)
  - React Hot Toast (Benachrichtigungen)
  - Lucide React (Icons)

## Installation

```bash
# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Build für Production
npm run build

# Production-Build lokal testen
npm run preview
```

## Verwendung

### 1. CSV-Dateien hochladen

Ziehen Sie mehrere CSV-Dateien in die Upload-Zone oder klicken Sie zum Auswählen. Die Dateien werden automatisch geparst.

### 2. Baseline-Datei wählen

Klicken Sie bei einer der hochgeladenen Dateien auf "Als Baseline wählen". Diese dient als Referenz für alle Vergleiche.

### 3. Vergleichseinstellungen konfigurieren

- **Schlüsselspalte**: Index der Spalte, die als eindeutiger Identifikator dient (Standard: 0)
- **Numerische Toleranz**: Toleranzschwelle für Koordinaten (z.B. 0.001 für ±0.001mm)

### 4. Vergleich starten

Klicken Sie auf "Vergleich starten". Alle Dateien werden gegen die Baseline verglichen.

### 5. Ergebnisse analysieren

- **Dashboard**: Überblick über alle Änderungen
- **Filter**: Zeigen Sie nur neue, geänderte oder gelöschte Zeilen
- **Suche**: Filtern Sie nach spezifischen Schlüsseln
- **Export**: Exportieren Sie die Ergebnisse in verschiedenen Formaten

## Projektstruktur

```
csv-vergleich-tool/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui Komponenten
│   │   ├── FileUpload.tsx       # Drag & Drop Upload
│   │   ├── FileList.tsx         # Dateiliste
│   │   ├── ComparisonSettings.tsx  # Einstellungen
│   │   ├── SummaryDashboard.tsx    # Dashboard
│   │   ├── ComparisonTable.tsx     # Vergleichstabelle
│   │   ├── DiffCell.tsx            # Diff-Zelle
│   │   ├── ExportOptions.tsx       # Export-Buttons
│   │   └── ThemeToggle.tsx         # Dark Mode Toggle
│   ├── lib/
│   │   ├── csvParser.ts         # CSV-Parsing
│   │   ├── comparison.ts        # Vergleichsalgorithmen
│   │   ├── export.ts            # Export-Utils
│   │   └── utils.ts             # Allgemeine Utils
│   ├── store/
│   │   └── useAppStore.ts       # Zustand Store
│   ├── types/
│   │   └── index.ts             # TypeScript-Typen
│   ├── App.tsx                  # Hauptkomponente
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## CSV-Format

Die Anwendung erwartet CSV-Dateien mit folgender Struktur:

```csv
ID,X,Y,Z,Beschreibung
P001,100.0,200.0,50.0,Punkt 1
P002,150.5,220.3,55.1,Punkt 2
...
```

- **Erste Zeile**: Header mit Spaltennamen
- **Erste Spalte**: Eindeutiger Identifikator (Standard, konfigurierbar)
- **Weitere Spalten**: Koordinaten oder andere Daten

## Entwicklung

### Neue UI-Komponente hinzufügen

```bash
# Beispiel: Badge-Komponente von shadcn/ui
# (Derzeit manuell erstellen, da shadcn/ui CLI nicht konfiguriert ist)
```

### TypeScript-Typen erweitern

Bearbeiten Sie `src/types/index.ts` für neue Datenstrukturen.

### Vergleichsalgorithmus anpassen

Siehe `src/lib/comparison.ts` für die Vergleichslogik.

## Deployment

### Vercel (empfohlen)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel
```

### Netlify

```bash
# Build
npm run build

# dist/ Ordner zu Netlify hochladen
```

### GitHub Pages

```bash
# vite.config.ts anpassen
export default defineConfig({
  base: '/csv-vergleich-tool/',
  // ...
})

# Build und deploy
npm run build
gh-pages -d dist
```

## Performance-Hinweise

- Die Anwendung ist für große CSV-Dateien (>10.000 Zeilen) optimiert
- Bei sehr großen Dateien kann die Verarbeitung einige Sekunden dauern
- Der Export großer Excel-Dateien kann langsam sein

## Bekannte Limitierungen

- Keine Backend-Integration (alles client-seitig)
- Keine Persistierung (Daten gehen bei Reload verloren)
- Excel-Export unterstützt keine bedingte Formatierung
- Maximale Upload-Größe hängt vom Browser ab

## Lizenz

Dieses Projekt wurde gemäß der Spezifikation in `CLAUDE.md` erstellt.

## Kontakt

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository.
