# Architektur

Technische Referenz zur App-Struktur, Datenmodell und Persistenz.

---

## Technologie-Stack

- **Single-file HTML** — kein Build, keine Dependencies außer 2 CDN-Skripten
- **Chart.js 4.4.1** für alle Visualisierungen
- **Vanilla JavaScript** — keine Frameworks
- **CSS Custom Properties** für das Design-Token-System
- **localStorage** für Persistenz (kein Server, kein IndexedDB)
- **Intl.NumberFormat / Intl.DateTimeFormat** für deutsche Lokalisierung

Keine externen Abhängigkeiten außer Chart.js und den Google Fonts (Inter, JetBrains Mono).

---

## Datenmodell

Alle Daten liegen in einem JSON-Objekt im `localStorage` unter dem Key **`vermoegen.v2`**.

### Top-Level

```ts
{
  entries: {
    LIQUIDE: Entry[],
    KAPITALMARKT: Entry[],
    SACHWERTE: Entry[],
  },
  snapshots: Snapshot[],
  settings: Settings,
}
```

### Entry

```ts
{
  id: string,           // uid()
  name: string,         // z.B. "Trade Republic Tagesgeld"
  value: number,        // aktueller Wert in €
  locked: boolean,      // true für Default-Positionen (FIX-Badge)
  note: string,         // optionale Notiz
  sparrate: number,     // monatliche Sparrate in €
}
```

### Snapshot

```ts
{
  id: string,
  t: string,            // ISO-8601 Timestamp
  value: number,        // Gesamtwert zum Zeitpunkt des Snapshots
  note: string,         // optionale Notiz
  entries: {            // Wert jeder einzelnen Position zum Zeitpunkt
    [entryId: string]: number,
  },
  breakdown: {          // Kategoriesummen zum Zeitpunkt
    LIQUIDE: number,
    KAPITALMARKT: number,
    SACHWERTE: number,
  },
}
```

`entries[id]` ist die Basis für Per-Asset-Δ und Winner/Loser-Berechnung. `breakdown` für den Monats-Report.

### Settings

```ts
{
  inflationRate: number,        // % p.a., Default 2.5
  target: number,               // Zielvermögen in €
  openCats: {                   // welche Kategorien sind aufgeklappt
    LIQUIDE: boolean,
    KAPITALMARKT: boolean,
    SACHWERTE: boolean,
  },
  scenarioReal: boolean,        // Szenario-Endwerte real anzeigen
}
```

---

## Kategorien-Konstante

Die Kategorien selbst sind **hartkodiert**:

```js
const CATS = [
  { id:'LIQUIDE',      label:'Liquide',      color:'#22d3ee', sw:'sw-liq' },
  { id:'KAPITALMARKT', label:'Kapitalmarkt', color:'#3ea6ff', sw:'sw-kap' },
  { id:'SACHWERTE',    label:'Sachwerte',    color:'#f0973d', sw:'sw-sac' },
];
```

Die Default-Positionen (mit `locked: true`) werden beim allerersten Start angelegt:

```js
const LOCKED = {
  LIQUIDE:      ['Trade Republic Tagesgeld', 'Festgeld'],
  KAPITALMARKT: ['Maxblue Depot', 'Cominvest Depot', 'Trade Republic Depot'],
  SACHWERTE:    ['Gold', 'Sachwerte'],
};
```

Wenn eine Default-Position gelöscht wird, wird sie **nicht** automatisch wieder angelegt. Die `LOCKED`-Liste dient nur als initiale Seed-Quelle.

---

## State-Lifecycle

```
loadState()
  ├─ localStorage[vermoegen.v2] existiert?
  │   ├─ ja → JSON.parse, padding für neue Felder, return
  │   └─ nein → migrateV1() oder defaultState()
  └─ saveState() schreibt jeden änderungsrelevanten Pfad
```

`saveState()` wird nach **jeder** Wertveränderung aufgerufen — kein Throttling, Daten gehen unter keinen Umständen verloren.

`renderAll()` ist der zentrale Refresh: läuft nach jedem `saveState()` und rendert alle 14 Bereiche neu. Chart.js-Instanzen werden wiederverwendet (`chart.update()` statt Neuerstellung) um Flackern zu vermeiden.

---

## Migration

Beim ersten Start mit altem v1-State:

```
localStorage[vermoegen.v1] existiert
  ├─ JSON.parse
  ├─ migrateV1(): pad neue Felder (note, sparrate)
  ├─ in localStorage[vermoegen.v2] schreiben
  └─ alte v1-Daten bleiben unangetastet (Backup-Sicherheit)
```

---

## Formatierung (de-DE)

Alle Beträge laufen durch `Intl.NumberFormat`:

```js
new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
```

→ Ausgabe: **„1.234,56 €"**

`parseNum()` akzeptiert beide Schreibweisen (deutsch mit `,` und englisch mit `.`):
- `"1.234,56 €"` → `1234.56`
- `"1234.56"` → `1234.56`
- `"1.234.567"` → `1234567` (mehrfache Punkte = Tausendertrenner)
- `"1,5"` → `1.5`

Wird in jedem Inline-Edit und in den Tool-Inputs verwendet — Komma oder Punkt funktioniert immer.

---

## Datei-Inhalte

`Vermögensaufstellung.html` enthält in dieser Reihenfolge:

| Block | Inhalt |
|---|---|
| `<head>` | Fonts, Chart.js |
| `<style>` | ~600 Zeilen CSS |
| HTML-Body | Topbar, Verlauf+Allokation, Szenario+Radar, Kategorien, Sparraten, Zielwert, Tools, Snapshots |
| `<script>` | State-Layer, Format-Helper, Renderer pro Sektion, Event-Listener |

Etwa **2500 Zeilen**, **125 KB** uncomprimiert.

---

## Performance

- Chart.js-Instanzen werden cached und nur per `update('none')` neu gerendert (keine Re-Creation)
- Inputs entkoppelt — typing in Tool-Inputs triggert nur die Tool-Berechnung, nicht volle `renderAll()`
- Monte Carlo läuft asynchron in 80er-Chunks mit `setTimeout(0)` zwischen Chunks
- localStorage ist synchron, aber bei < 200 KB irrelevant

---

## Mögliche Erweiterungen

Ideen, die das aktuelle Modell ohne große Umbauten erlauben würde:

- **Mehrere Profile** — z. B. „Privat", „Familie" — über zusätzliche Top-Level-Keys im localStorage
- **Snapshot-Vergleich** über beliebige Zeiträume statt nur letzter zwei
- **Asset-Klassen-Sub-Tags** (z. B. „Aktien-ETF" vs. „Anleihen-ETF" innerhalb Kapitalmarkt)
- **Dividenden / Ausschüttungen** als separates Cashflow-Feld pro Asset
- **Export als PDF-Report** mit eingebettetem Verlaufschart und Monats-Zusammenfassung
- **Browser-Notification** zum Monatswechsel als Snapshot-Reminder

Datenmodell ist absichtlich flach gehalten — Schema-Migrations sind dadurch trivial.
