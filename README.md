# Vermögensaufstellung

Persönliche Single-Page-App zur Vermögensverfolgung. Alles lokal, kein Server, keine Anmeldung. Eine einzige HTML-Datei, die in jedem modernen Browser läuft.

---

## Schnellstart

1. **`Vermögensaufstellung.html`** im Browser öffnen (Doppelklick reicht).
2. In den Kategorien (Liquide / Kapitalmarkt / Sachwerte) auf die Werte klicken und deine aktuellen Beträge eintragen.
3. Optional: monatliche Sparraten pro Position hinzufügen, Notizen schreiben, Zielwert oben setzen.
4. Mit **„+ Snapshot speichern"** den aktuellen Stand einfrieren → Verlaufschart und Monatsvergleich werden ab dem zweiten Snapshot lebendig.

Die App lädt zwei externe Ressourcen über CDN:
- **Chart.js 4.4.1** (alle Diagramme)
- **Inter** & **JetBrains Mono** (Schriftarten, Google Fonts)

Ohne Internet zeigt die App eine System-Fallback-Schrift; alle Funktionen außer den Diagrammen funktionieren trotzdem.

---

## Was die App kann

### Überblick
- **Gesamtvermögen oben rechts** mit Delta zum letzten Snapshot (absolut + %)
- **Vermögensverlauf** als Liniendiagramm mit wählbarem Zeitbereich (3M / 6M / 1J / 3J / 5J / Alle)
- **Allokations-Donut** mit Prozent-Labels in den Segmenten und Gesamtsumme in der Mitte
- **3-Szenario-Projektion** über frei wählbaren Zeitraum: pessimistisch (3 %) / realistisch (6 %) / optimistisch (10 %), nominal oder real
- **Portfolio-Radar** mit sechs berechneten Kennzahlen

### Kategorien
- Drei Hauptkategorien: **Liquide, Kapitalmarkt, Sachwerte**
- Vorbelegte Default-Positionen können editiert, umbenannt und gelöscht werden
- Beliebig viele eigene Positionen hinzufügen
- Pro Position: Wert, monatliche Sparrate, Notiz
- Klick auf einen Wert öffnet ein Inline-Editierfeld
- Δ zum letzten Snapshot pro Position, Winner/Loser-Badges

### Wiederkehrende Einzahlungen
Übersicht aller Sparraten: monatlich, jährlich, 10 Jahre ohne Zins, 10 Jahre mit 6 % Zinseszins. Wird automatisch aus den pro-Asset-Raten zusammengerechnet.

### Snapshot-Verlauf
Liste aller gespeicherten Stände mit Notiz, Wert, Δ zum vorherigen. Notizen jederzeit nachträglich editierbar.

---

## Daten & Persistenz

- Alles wird im **`localStorage`** des Browsers gespeichert (Schlüssel: `vermoegen.v2`).
- Beim ersten Start mit alten v1-Daten wird automatisch migriert.
- **Browser-spezifisch**: Wechsel des Browsers oder Geräts ohne Export = keine Daten.
- Privates Surfen / Inkognito = Daten verschwinden beim Schließen des Tabs.

### Backup & Übertragung
Über die Buttons **JSON exportieren** und **JSON importieren** (am Ende der Tools-Sektion) lassen sich alle Daten in eine Datei sichern und auf einem anderen Gerät / Browser wiederherstellen.

**Empfehlung**: monatlich nach dem Speichern eines Snapshots einen JSON-Export ziehen.

---

## Tastatur-Shortcuts

| Aktion | Taste |
|---|---|
| Inline-Edit bestätigen | `Enter` |
| Inline-Edit abbrechen | `Esc` |
| Snapshot-Notiz speichern | `Enter` |

---

## Datei-Übersicht

| Datei | Zweck |
|---|---|
| `index.html` | Start-Seite (leitet automatisch zur App weiter — wichtig für GitHub Pages) |
| `Vermögensaufstellung.html` | Die App (single-file, alles enthalten) |
| `README.md` | Diese Datei |
| `DESIGN-SYSTEM.md` | Farben, Schriften, Komponenten |
| `ARCHITEKTUR.md` | Datenmodell, State-Struktur, Migration |

---

## GitHub Pages hosten

1. Repo bei GitHub anlegen, alle Dateien hochladen.
2. **Settings → Pages → Source: Deploy from a branch → main / root**.
3. Nach ca. 1 Minute ist die App unter `https://<dein-user>.github.io/<repo-name>/` erreichbar.
4. `index.html` leitet automatisch auf `Vermögensaufstellung.html` weiter — du landest direkt im Dashboard.

Deine Daten bleiben dabei **immer nur in deinem Browser**. GitHub Pages hostet nur die statischen Dateien, sieht keine deiner Einträge.

---

## Lizenz

Privates Projekt. Keine Garantie. Beträge bitte vor finanziellen Entscheidungen gegenprüfen.
