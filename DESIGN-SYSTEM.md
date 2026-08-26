# Design System — Vermögensaufstellung

Modernes, zurückhaltendes Dashboard-Vokabular. Inspiration: Stripe / Linear / Mercury — kein Neobroker-Look, keine Verspieltheit, keine Gradients auf großen Flächen.

---

## Farben

Alle Farbtokens leben als CSS Custom Properties im `:root` von `Vermögensaufstellung.html`.

### Neutrale (Hintergrund / Linien / Text)

| Token | Hex | Verwendung |
|---|---|---|
| `--bg` | `#f5f5f7` | Seiten-Hintergrund |
| `--bg-1` | `#ffffff` | Panel-Hintergrund |
| `--bg-2` | `#fafafa` | Sub-Card / Help-Popover |
| `--bg-3` | `#f1f1f4` | Hover, Pille-Hintergrund |
| `--line` | `#e4e4e7` | Hairline-Border |
| `--line-2` | `#d4d4d8` | Border mit etwas mehr Gewicht |
| `--ink` | `#09090b` | Primärer Text |
| `--ink-2` | `#3f3f46` | Sekundärer Text |
| `--ink-3` | `#71717a` | Tertiärer Text / Labels |
| `--ink-4` | `#a1a1aa` | Disabled / Empty States |

### Akzentfarben

| Token | Hex | Verwendung |
|---|---|---|
| `--acid` | `#1e40af` | Primärer Akzent: Buttons, Linienchart, Fokus-Ring |
| `--acid-dim` | `#1e3a8a` | Primary-Button Hover |
| `--positive` | `#16a34a` | Positive Deltas, Gewinner-Badges |
| `--red` | `#dc2626` | Negative Deltas, Verlierer-Badges, Drawdown-Chart |
| `--amber` | `#ca8a04` | Warn-States (mittlere Konzentration) |
| `--gold` | `#ca8a04` | Akzent-Highlights, FIX-Badge-Frame |

### Kategorie-Farben

| Kategorie | Hex |
|---|---|
| Liquide | `#0891b2` (Cyan-600) |
| Kapitalmarkt | `#1e40af` (Indigo-700) |
| Sachwerte | `#b45309` (Amber-700) |

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
| Sekundär | `.btn` | Weiß, hairline border |
| Primär | `.btn .primary` | `--acid` Hintergrund, weißer Text |
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
| Grid-Linien | `rgba(9,9,11,.05)` |
| Tick-Farbe | `#71717a` |
| Tick-Font | Inter 10 px |
| Tooltip-Hintergrund | `#09090b` |
| Tooltip-Border | `#3f3f46` |
| Tooltip-Body | Inter 11–12 px |
| Linien-Stroke | 2 px (Hauptserie), 1.5 px (Benchmark, gestrichelt) |
| Punkt-Radius | 3 px normal, 4 px aktueller Punkt |

Spezifische Charts:
- **Verlauf**: Liniefarbe `--acid`, Flächengradient `rgba(30,64,175,.20) → 0`. Benchmark gestrichelt in Gold.
- **Donut**: 3 Kategoriefarben, Border 2 px weiß. Plugin zeichnet %-Label in jedes Segment ≥ 4 %, Gesamtsumme in der Mitte.
- **Szenario**: 3 Linien — Pessimistisch (rot), Realistisch (blau), Optimistisch (grün), keine Fläche.
- **Radar**: Sechseck-Gitter, `--acid` Fläche bei `rgba(30,64,175,.18)`, 0–100 Skala.
- **Monte Carlo Fan**: 5 gestaffelte Bänder (P10 / P25 / P50 / P75 / P90), Median in `--acid` Vollton, äußere Bänder transparent.
- **Drawdown**: Fläche unter 0 in rot, Y-Achse capped bei 0 (zeigt nur Negative).
- **FIRE**: einfache Liniefläche in `--acid`, fade-to-zero wenn Vermögen erschöpft.

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
