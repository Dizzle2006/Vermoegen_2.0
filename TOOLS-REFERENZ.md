# Tools-Referenz

Alle neun Rechner in der App — Formeln, Beispiele, Edge Cases.

Jeder Rechner ist auch in der App selbst per **?**-Icon im Titel kurz erklärt. Dieses Dokument geht tiefer.

---

## 1. CAGR-Rechner

**Compound Annual Growth Rate** — durchschnittliche jährliche Wachstumsrate mit Zinseszins.

```
CAGR = (Endwert / Startwert) ^ (1 / Jahre) − 1
```

**Beispiel**: 10.000 € → 18.500 € in 7 Jahren entspricht ca. **+9,18 % p.a.** Multiplikator × 1,85.

**Edge Cases**: Startwert ≤ 0 oder Jahre ≤ 0 → kein Ergebnis. Endwert kleiner als Startwert ergibt negativen CAGR.

---

## 2. Inflations-Adjuster

Was ist dein Geld in Zukunft real noch wert?

```
Realwert = Nominalwert / (1 + Inflation) ^ Jahre
Kaufkraftverlust = Nominalwert − Realwert
```

**Beispiel**: 100.000 € bei 2,5 % Inflation über 10 Jahre = **78.120 €** Realwert. Verlust: 21.880 € (≈ 21,88 %).

---

## 3. Zielrechner

Wann erreichst du dein Sparziel mit monatlichen Einzahlungen?

```
Ziel = Start · (1+i)^n + Rate · ((1+i)^n − 1) / i
```

Wobei `i = Rendite p.a. / 12` und `n` die gesuchten Monate. Wird nach `n` aufgelöst.

```
n = ln( (Ziel · i + Rate) / (Start · i + Rate) ) / ln(1 + i)
```

**Edge Cases**:
- Start ≥ Ziel → 0 Monate, Datum = heute
- Rendite = 0 % → `n = (Ziel − Start) / Rate`
- Rate = 0 und Start < Ziel → kein Ergebnis (geht nie auf)

**Auto-Button**: vorbelegt mit aktuellem Gesamtvermögen (Start) und Sparraten-Summe (Rate).

---

## 4. Entnahme-Rechner (FIRE)

Wie lange reicht ein Vermögen, wenn du monatlich einen festen Betrag entnimmst?

Iterative Berechnung Monat für Monat:
```
für jeden Monat m:
   bal = bal · (1 + i) − Entnahme
   wenn bal ≤ 0: erschöpft nach m Monaten
```

**Sicheres Szenario**: Wenn `bal · i ≥ Entnahme`, wächst das Vermögen schneller als entnommen wird → **∞ unbegrenzt**.

**Mini-Chart**: zeigt jährlichen Restbestand. Cap bei 100 Jahren.

---

## 5. Monte Carlo Simulation

1.000 zufällige Pfade mit normalverteilten monatlichen Renditen.

```
für jeden Pfad (1..1000):
   für jeden Monat:
      r_m = µ/12 + σ/√12 · randn()
      bal = bal · (1 + r_m) + Sparrate
```

Wobei `randn()` aus einer Standard-Normalverteilung (Box-Muller-Transformation) kommt.

**Output**:
- **P10 / P25 / P50 / P75 / P90** — die Perzentile der End-Verteilung
- **Erfolgsrate** — Anteil der Pfade, die den Zielwert erreichen

**P50 (Median)** ist der wahrscheinlichste Wert, kein Durchschnitt. **P90** = in 90 % der Fälle erreichst du mindestens diesen Wert. **P10** ist das pessimistische Szenario.

**Standard µ = 6 %, σ = 15 %** entspricht ungefähr globalen Aktienmärkten.

Läuft asynchron in Chunks von 80 Pfaden, damit die UI nicht einfriert.

---

## 6. Max Drawdown

Größter prozentualer Einbruch deiner Vermögenshistorie ab einem bisherigen Hoch.

```
peak = max(snapshots bis jetzt)
drawdown(t) = (value(t) − peak) / peak · 100
maxDD = min(drawdown über alle t)
```

**Ausgabe**:
- **Tiefe**: maxDD in %
- **Dauer**: Datum des Hochs → Datum des Tiefs
- **Status**: „Erholt" wenn aktueller Wert ≥ ursprüngliches Hoch, sonst „Noch X € offen"

Braucht mindestens 2 Snapshots.

---

## 7. Diversifikations-Score

Wie ausgewogen ist dein Portfolio auf die drei Anlageklassen verteilt?

Basiert auf dem **Herfindahl-Index**:
```
HHI = Σ (Anteil_i)^2     für i in {Liquide, Kapitalmarkt, Sachwerte}
Score = (1 − (HHI − 1/N) / (1 − 1/N)) · 100
```

Mit `N = 3` (drei Klassen). HHI minimal = 1/3 (perfekt gleichverteilt) → Score 100. HHI = 1 (alles in einer Klasse) → Score 0.

**Ampel**:
- 🟢 **75–100** — gut diversifiziert
- 🟡 **50–74** — Konzentration moderat
- 🔴 **< 50** — stark konzentriert

**Klumpenrisiko-Warnungen**:
- Anlageklasse > 60 % → rote Warnung
- Einzelposition > 30 % → orange Warnung (rot ab 45 %)

---

## 8. Cashflow-Projektion

Tabelle mit den Horizonten **1, 3, 5, 10 Jahre**. Für jeden:

```
i = Rendite/12
n = Monate
Endwert  = Start · (1+i)^n + Rate · ((1+i)^n − 1) / i
Einzahlungen = Start + Rate · n
Zinseszins = Endwert − Einzahlungen
```

Zeigt explizit, wie der **Zinseszins-Anteil** mit längerem Horizont gegenüber den reinen Einzahlungen wächst — der wichtigste Hebel beim Vermögensaufbau.

---

## 9. Monats-Report

Auto-generiert aus den letzten zwei Snapshots. Keine Eingaben nötig.

**Inhalt**:
- Vermögen jetzt + Δ seit letztem Snapshot (absolut + %)
- Größter Gewinner / Verlierer auf Asset-Ebene
- Δ pro Anlageklasse
- Zielerreichung in % (falls Zielwert gesetzt)

Bei nur einem Snapshot wird ein Hinweis angezeigt, dass zwei nötig sind. Wird mit jedem neuen Snapshot automatisch aktualisiert.

---

## Auto-Buttons

Mehrere Tools haben kleine **Auto**-Buttons an den Inputs. Diese füllen den Wert sofort aus dem aktuellen App-State:

| Auto-Feld | Quelle |
|---|---|
| Zielwert (Zielrechner, MC) | globaler Zielwert |
| Startkapital (Zielrechner, FIRE, MC, Cashflow) | aktuelles Gesamtvermögen |
| Monatsrate (Zielrechner, MC, Cashflow) | Summe aller hinterlegten Sparraten |

So müssen die Tools nicht doppelt befüllt werden — die Hauptansicht ist die Quelle der Wahrheit.

---

## Szenario-Projektion (oberhalb der Tools)

Ist kein Tool im engeren Sinn, aber ein wichtiger Rechner: zeigt 3 Zinseszins-Wachstumslinien (3 % / 6 % / 10 %) über den eingegebenen Zeitraum. Inflations-Toggle blendet zusätzlich die **realen** Endwerte (inflationsbereinigt) ein.

---

## Portfolio-Radar (oberhalb der Tools)

Sechs berechnete Score-Achsen (jeweils 0–100):

| Achse | Berechnung |
|---|---|
| **Diversifikation** | HHI-basiert wie Tool 7 |
| **Wachstum** | Anteil Kapitalmarkt × 100 |
| **Liquidität** | min(100, Liquide-Anteil / 30 % × 100) — kein Bonus über 30 % |
| **Stabilität** | (Sachwerte + Festgeld) / Gesamt × 100 |
| **Konzentration⁻¹** | 100 − max(Asset-Anteil) · 200 (linear: 0 % Asset → 100, 50 % Asset → 0) |
| **Zielerreichung** | min(100, Gesamt / Zielwert · 100) |

Je größer die ausgefüllte Fläche, desto besser. Direkter visueller Eindruck deiner Portfolio-Charakteristik.
