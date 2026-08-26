# Design System — Vermögensaufstellung

Helles Dashboard-Vokabular mit Blau als klar abgegrenztem Akzent. Inspiration:
die echte Deutsche Bank Mobile App (verifiziert über offizielle Screenshots von
deutsche-bank.de, nicht nur Marketing-Mockups) — dort ist der Hintergrund
überwiegend **weiß**, Blau taucht nur in abgegrenzten Flächen auf: dem
Saldo-Kreis auf der Startseite, CTA-Buttons, einzelnen Karten. Kein
Neobroker-Look, keine Verspieltheit, kein durchgehender dunkler Hintergrund.

Die App hatte zwischenzeitlich eine Variante mit durchgehend dunklem
Navy-Hintergrund — das war eine Fehleinschätzung auf Basis eines einzelnen,
nicht repräsentativen Onboarding-Mockups. Seit der Korrektur gilt: **Blau ist
ein Element, kein Hintergrund.**

---

## Farben

Alle Farbtokens leben als CSS Custom Properties im `:root` von `app.css`.
`--acid` (`#0550d0`) und `--navy` (`#1e2978`) sind direkt aus den offiziellen
App-Screenshots gepixelt (SEPA-Überweisung-Button bzw. Interner-Kontoübertrag-
Button) — keine Schätzung.

### Neutrale (Hintergrund / Linien / Text)

| Token | Hex | Verwendung |
|---|---|---|
| `--bg` | `#f5f6f8` | Seiten-Hintergrund (helles Grau) |
| `--bg-1` | `#ffffff` | Panel-Hintergrund |
| `--bg-2` | `#f7f8fa` | Sub-Card / Help-Popover / Inputs |
| `--bg-3` | `#eef0f3` | Hover, Pille-Hintergrund |
| `--line` | `#e3e5ea` | Hairline-Border |
| `--line-2` | `#d1d5dc` | Border mit etwas mehr Gewicht |
| `--ink` | `#0b0d12` | Primärer Text (fast Schwarz) |
| `--ink-2` | `#454a52` | Sekundärer Text |
| `--ink-3` | `#6b7280` | Tertiärer Text / Labels |
| `--ink-4` | `#9aa0aa` | Disabled / Empty States |

### Akzentfarben

| Token | Hex | Verwendung |
|---|---|---|
| `--acid` | `#0550d0` | Primärer Akzent: Buttons, Linienchart, Fokus-Ring, aktive Segmented-Control |
| `--acid-dim` | `#0442ab` | Akzent-Hover |
| `--navy` | `#1e2978` | Zweites, dunkleres Blau — nur für den Hero-Verlauf der Gesamtvermögens-Kachel |
| `--on-accent` | `#ffffff` | Textfarbe auf blauen Flächen |
| `--positive` | `#16a34a` | Positive Deltas, Gewinner-Badges |
| `--red` | `#dc2626` | Negative Deltas, Verlierer-Badges |
| `--amber` | `#ca8a04` | Warn-States (mittlere Konzentration) |
| `--gold` | `#ca8a04` | Akzent-Highlights |

Primär-Buttons (`.btn.primary`) sind blau mit weißem Text (`--acid` /
`--on-accent`) — analog zum „SEPA Überweisung"-Button in der echten App.
Sekundär-Buttons bleiben neutral (`--bg-2`, hairline border).

### Kategorie-Farben

| Kategorie | Hex |
|---|---|
| Liquide | `#0891b2` (Cyan) |
| Kapitalmarkt | `#0550d0` (= `--acid`) |
| Sachwerte | `#b45309` (Amber) |

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
- **Border-Radius**: 6 px (Buttons/Inputs/Inline), 10 px (Panels), 16 px (Hero-Kachel Gesamtvermögen — bewusste Ausnahme)
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

### Hero-Kachel (Gesamtvermögen)

```html
<div class="total">
  <span class="label">Gesamtvermögen</span>
  <div class="value">91.000,00 €</div>
  <span class="delta up">▲ +2.000,00 € / +2,25 %</span>
</div>
```

Einziges Element mit vollflächigem Blau — bewusst als Ausnahme, angelehnt an
den Saldo-Kreis auf der Startseite der echten App. Verlauf
`linear-gradient(135deg, var(--acid) 0%, var(--navy) 100%)`, 16 px Radius
(großzügiger als der Rest der App), weißer Text, Delta-Pille als
halbtransparente weiße Fläche (`rgba(255,255,255,.14)`) statt der sonst
üblichen Grün/Rot-Töne — die stehen stattdessen als helle Varianten
(`#baf3d3` / `#ffd0cc`) für ausreichend Kontrast auf Blau.

### Button

| Variante | Klasse | Aussehen |
|---|---|---|
| Sekundär | `.btn` | `--bg-2`, hairline border |
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
| `.winner` | „★ Gewinner" auf positivem Delta — grüner Pille |
| `.loser` | „▼ Verlierer" auf negativem Delta — roter Pille |
| `.total .delta.up` | Gesamtdelta positiv — grüner Pille mit Fill |
| `.total .delta.down` | Gesamtdelta negativ — roter Pille mit Fill |

---

## Charts (Chart.js Konfiguration)

Allgemeine Konventionen:

| Element | Wert |
|---|---|
| Grid-Linien | `rgba(11,13,18,.05)` |
| Tick-Farbe | `#6b7280` (= `--ink-3`) |
| Tick-Font | Inter 10 px |
| Tooltip-Hintergrund | `#0b0d12` (= `--ink`, dunkler Chip auf hellem Grund) |
| Tooltip-Border | `#454a52` (= `--ink-2`) |
| Tooltip-Body | Inter 11–12 px |
| Linien-Stroke | 2.5 px, runde Kappen/Verbindungen |
| Punkt-Radius | 3 px normal, 4 px aktueller Punkt |

Chart.js kann CSS Custom Properties nicht direkt lesen — die Werte oben sind als
Hex/rgba-Literale in `js/dashboard.js` dupliziert. Bei einer Token-Änderung in
`app.css` müssen die entsprechenden Chart-Konfigurationen manuell nachgezogen
werden.

Spezifische Charts:
- **Verlauf**: Liniefarbe `--acid` (`#0550d0`), Flächengradient `rgba(5,80,208,.20) → 0`, `cubicInterpolationMode:'monotone'` (verhindert optisches Über-/Unterschwingen zwischen Punkten). Zeitbereiche: 3M / 6M / 1J / 3J / 5J / Alle. Punkte außer dem aktuellsten sind „hohl" (Fill = `--bg-1`, also weiß) und kleiner (2.5px), damit sich der aktuelle Punkt (5px, voll gefüllt) als Fokuspunkt absetzt — zusätzlich mit weichem Leuchtkreis (`lineGlowPlugin`) hinterlegt. Keine vertikalen Gridlines, Legende ausgeblendet (nur eine Serie).
- **Donut**: 3 Kategoriefarben, Border 2 px in `--bg-1` (Weiß) — Segmente wirken gegen das weiße Panel „ausgeschnitten". Plugin zeichnet ein gerundetes %-Label (`'JetBrains Mono'`, 600, weiß mit Lesbarkeits-Schatten) in jedes Segment, aber nur wenn es in die Segmentbreite passt (Fit-Check via `measureText` gegen die Bogenlänge) — zu schmale Segmente bleiben ohne Label, die Legende darunter zeigt den exakten Wert immer. Gesamtsumme in der Mitte in `'JetBrains Mono'` 600 (`--ink`), Label „GESAMT" in `'Inter'` (`--ink-3`).
- **Szenario**: 3 Linien — Pessimistisch (`--red`), Realistisch (`--acid`), Optimistisch (`--positive`), keine Fläche.
- **Radar**: Sechseck-Gitter, `--acid` Fläche bei `rgba(5,80,208,.14)`, 0–100 Skala.

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
