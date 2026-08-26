# Design System — Vermögensaufstellung

Dunkles Dashboard-Vokabular. Inspiration: Deutsche Bank Mobile (dunkles Navy als
Grundfläche, helles Blau als Akzent, weiße Primär-Buttons) — kein Neobroker-Look,
keine Verspieltheit, keine Gradients auf großen Flächen.

---

## Farben

Alle Farbtokens leben als CSS Custom Properties im `:root` von `app.css`.

### Neutrale (Hintergrund / Linien / Text)

| Token | Hex | Verwendung |
|---|---|---|
| `--bg` | `#0a1420` | Seiten-Hintergrund (dunkles Navy) |
| `--bg-1` | `#101d30` | Panel-Hintergrund |
| `--bg-2` | `#16253c` | Sub-Card / Help-Popover / Inputs |
| `--bg-3` | `#1c2e48` | Hover, Pille-Hintergrund |
| `--line` | `#243854` | Hairline-Border |
| `--line-2` | `#34496a` | Border mit etwas mehr Gewicht |
| `--ink` | `#f4f7fb` | Primärer Text (fast Weiß) |
| `--ink-2` | `#aebbd1` | Sekundärer Text |
| `--ink-3` | `#7c8aa5` | Tertiärer Text / Labels |
| `--ink-4` | `#4f5d78` | Disabled / Empty States |

### Akzentfarben

| Token | Hex | Verwendung |
|---|---|---|
| `--acid` | `#3ea6ff` | Primärer Akzent: Linienchart, Fokus-Ring, aktive Segmented-Control |
| `--acid-dim` | `#2b86d8` | Akzent-Hover (nicht-weiße Elemente) |
| `--on-accent` | `#04101c` | Textfarbe auf hellen Flächen (weiße Primär-Buttons, aktiver Akzent-Chip) |
| `--positive` | `#34d399` | Positive Deltas, Gewinner-Badges |
| `--red` | `#f4685f` | Negative Deltas, Verlierer-Badges |
| `--amber` | `#f2b544` | Warn-States (mittlere Konzentration) |
| `--gold` | `#f2b544` | Akzent-Highlights, FIX-Badge-Frame |

Primär-Buttons (`.btn.primary`) weichen bewusst vom `--acid`-Muster ab: **weißer
Hintergrund, dunkler Text** (`--on-accent`) — analog zum „Next"-Button in der
Deutsche-Bank-Mobile-App. Sekundäre Akzent-Elemente (aktiver Tab in der
Segmented-Control, aktiver Help-Button) nutzen weiterhin `--acid`-Fläche mit
`--on-accent`-Text.

### Kategorie-Farben

| Kategorie | Hex |
|---|---|
| Liquide | `#22d3ee` (Cyan) |
| Kapitalmarkt | `#3ea6ff` (= `--acid`) |
| Sachwerte | `#f0973d` (Orange) |

---

## Typografie

**Eine Schrift, durchgehend**: [Inter](https://rsms.me/inter/). Tabular Figures (`font-variant-numeric: tabular-nums`) auf allen Beträgen und Prozentwerten, damit Zahlen in Tabellen und Verlaufslisten exakt untereinander ausgerichtet bleiben.

`JetBrains Mono` nur in `<code>`-Inline-Highlights innerhalb der Help-Popovers.

### Skala

| Element | Größe | Gewicht | Letterspacing |
|---|---|---|---|
| Gesamtvermögen | 40 px | 600 | -0.025 em |
| Section H3 | 15 px | 600 | -0.01 em |
| Panel H2 | 14 px | 600 | -0.01 em |
| Cat-Title | 13.5–14 px | 600 | -0.005 em |
| Body / Tabellen | 13–13.5 px | 400 | 0 |
| Labels | 11.5–12 px | 500 | 0 |
| Hilfstext / Captions | 11–12 px | 400 | 0 |

Kein All-Caps-Letterspacing, keine kursiven Untertitel — alles in natürlicher Wortform.

---

## Spacing & Layout

- **Body-Padding**: 24 px × 32 px, max-width 1480 px, zentriert
- **Panel-Padding**: Head 14 × 18 px, Body 18 px
- **Border-Radius**: 6 px (Buttons/Inputs/Inline), 10 px (Panels)
- **Section-Abstand**: 32 px oben (`.section-strip { margin-top: 32px }`)
- **Spalten**: 2/3 + 1/3 für Verlauf + Allokation; 50/50 für Szenario + Radar

---

## Komponenten

### Panel

```html
<section class="panel">
  <div class="head">
    <div class="titlewrap">
      <h2>Titel</h2>
      <span class="sub">Untertitel als Erklärung.</span>
    </div>
    <span class="badge">META</span>
  </div>
  <div class="body">…</div>
</section>
```

Hairline-Border `--line`, weißer Hintergrund, 10 px Radius, 1 px Soft-Shadow.

### Button

| Variante | Klasse | Aussehen |
|---|---|---|
| Sekundär | `.btn` | `--bg-2`, hairline border |
| Primär | `.btn .primary` | Weißer Hintergrund, dunkler Text (`--on-accent`) |
| Klein | `.btn .tiny` | Gleiches Vokabular, kleinere Padding |
| Gefahr | `.btn .danger` | Hover wird rot |

### Segmented Control

```html
<div class="seg">
  <button class="on">1M</button><button>3M</button>…
</div>
```

Aktiver Button: `--acid` Hintergrund, weißer Text.

### Input

Weißer Hintergrund, 6 px Radius, `--line` Border. Im Fokus: `--acid` Border + 3 px Glow (`--acid-glow`).

### Help-Popover

```html
<button class="helpbtn" data-help="help-id">?</button>
<div class="help-pop" id="help-id">…</div>
```

`?`-Kreis (20 px, weiß) neben dem Panel-Titel. Klick zeigt den Erklärungsblock direkt unter dem Header an — `--bg-2` Hintergrund, 3 px linke Border in `--acid`. Inline-Code (`<code>`) erscheint als Pille mit JetBrains Mono.

### Chart-Empty-State

Wenn ein Chart noch keine Daten hat: zentrierte weiße Karte mit Titel + Erklärung, hairline-Border. Wird absolut über dem leeren Canvas positioniert.

### Pill-Badges

| Klasse | Zweck |
|---|---|
| `.locked` | „FIX" Marker für Default-Positionen, grauer Pille |
| `.winner` | „★ Gewinner" auf positivem Delta — grüner Pille |
| `.loser` | „▼ Verlierer" auf negativem Delta — roter Pille |
| `.total .delta.up` | Gesamtdelta positiv — grüner Pille mit Fill |
| `.total .delta.down` | Gesamtdelta negativ — roter Pille mit Fill |

---

## Charts (Chart.js Konfiguration)

Allgemeine Konventionen:

| Element | Wert |
|---|---|
| Grid-Linien | `rgba(255,255,255,.06)` |
| Tick-Farbe | `#7c8aa5` (= `--ink-3`) |
| Tick-Font | Inter 10 px |
| Tooltip-Hintergrund | `#16253c` (= `--bg-2`) |
| Tooltip-Border | `#34496a` (= `--line-2`) |
| Tooltip-Body | Inter 11–12 px |
| Linien-Stroke | 2.5 px, runde Kappen/Verbindungen |
| Punkt-Radius | 3 px normal, 4 px aktueller Punkt |

Chart.js kann CSS Custom Properties nicht direkt lesen — die Werte oben sind als
Hex/rgba-Literale in `js/dashboard.js` dupliziert. Bei einer Token-Änderung in
`app.css` müssen die entsprechenden Chart-Konfigurationen manuell nachgezogen
werden.

Spezifische Charts:
- **Verlauf**: Liniefarbe `--acid` (`#3ea6ff`), Flächengradient `rgba(62,166,255,.30) → 0`, `cubicInterpolationMode:'monotone'` (verhindert optisches Über-/Unterschwingen zwischen Punkten). Zeitbereiche: 3M / 6M / 1J / 3J / 5J / Alle. Punkte außer dem aktuellsten sind „hohl" (Fill = `--bg-1`) und kleiner (2.5px), damit sich der aktuelle Punkt (5px, voll gefüllt) als Fokuspunkt absetzt — zusätzlich mit weichem Leuchtkreis (`lineGlowPlugin`) hinterlegt. Keine vertikalen Gridlines, Legende ausgeblendet (nur eine Serie).
- **Donut**: 3 Kategoriefarben, Border 2 px in `--bg-1` (statt Weiß) — Segmente wirken gegen das dunkle Panel „ausgeschnitten". Plugin zeichnet %-Label in jedes Segment ≥ 4 % in Weiß, Gesamtsumme in der Mitte in `--ink`.
- **Szenario**: 3 Linien — Pessimistisch (`--red`), Realistisch (`--acid`), Optimistisch (`--positive`), keine Fläche.
- **Radar**: Sechseck-Gitter, `--acid` Fläche bei `rgba(62,166,255,.20)`, 0–100 Skala.

---

## Interaktions-Pattern

| Aktion | Verhalten |
|---|---|
| Hover auf Buttons | 150 ms ease, Border wechselt zu `--ink-3` |
| Hover auf Zeilen | Hintergrund auf `--bg-2` |
| Klick auf Wert | Inline-Input erscheint, fokussiert + selektiert |
| Klick auf `?` | Popover öffnet, andere schließen automatisch |
| Klick außerhalb Popover | Alle Popover schließen |
| Eingabe Enter | Commit |
| Eingabe Esc | Cancel, Wert bleibt unverändert |

---

## Responsiveness

| Breakpoint | Anpassung |
|---|---|
| `< 1100 px` | Top-Row 2/3+1/3 stapelt sich, Half-Row stapelt sich |
| `< 900 px` | Sparbar 4 → 2 Spalten, Addform-Grid stapelt |
| `< 760 px` | Gesamtvermögen-Schriftgröße sinkt auf 30 px; Brand-Untertitel & Uhr ausgeblendet |
