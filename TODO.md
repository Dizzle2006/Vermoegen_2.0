# To-Do / Future-Verbesserungen

Sammlung offener Punkte aus der Code-Durchsicht vom 2026-08-26. Nichts davon
ist dringend — hier nur notiert, damit es nicht verloren geht.

## Dokumentation ist teils veraltet

- **`ARCHITEKTUR.md`** beschreibt noch den alten Ein-Datei-Aufbau
  (`Vermögensaufstellung.html` mit allem drin, ~2500 Zeilen). Tatsächlich ist
  `Vermögensaufstellung.html` heute nur ein Redirect-Stub auf `index.html`,
  und die App ist in `index.html` + `js/state.js`, `js/helpers.js`,
  `js/dashboard.js`, `js/main-dashboard.js` aufgeteilt. Der komplette
  Abschnitt „State-Lifecycle" / „Datei-Inhalte" braucht eine Neufassung.
- **`README.md`** listet unter „GitHub Pages hosten" noch
  `Vermögensaufstellung.html` als die eigentliche App und `index.html` als
  reinen Redirect — das ist inzwischen genau umgekehrt.
- **`README.md`** beschreibt eine JSON-Export-/Import-Funktion („Backup &
  Übertragung"), die es im Code nicht (mehr) gibt — keine Buttons, keine
  Funktionen in `js/`. Entweder Funktion nachbauen oder Doku-Absatz streichen.
- **`ANLEITUNG-GITHUB-PAGES.md`** hat an einer Stelle „Daten zwischen iPhone
  und Mac synchron halten … Export-/Import-Funktion" — selbes Problem wie
  oben.

## Toter Code

- **`app.css`**: `.ie-actions` / `.ie-status` (Zeilen ~231–238, „Import/Export")
  sind CSS-Regeln für eine Funktion, die nirgends im HTML/JS existiert.
  Vermutlich Überbleibsel der nie fertiggestellten Export/Import-Funktion.
  Entweder Funktion bauen oder CSS-Block löschen.

## Erledigt in dieser Sitzung

- Tools-Seite (`tools.html`, 9 Rechner-Module) komplett entfernt —
  `js/tools.js`, `js/main-tools.js`, `TOOLS-REFERENZ.md` gelöscht, Nav aus
  `index.html`, zugehöriges CSS aus `app.css` raus.
- `git init` + Commits als Sicherheitsnetz angelegt (Projekt hatte vorher
  kein Git-Repo).

## Bewusst nicht angefasst

- „3-Szenario-Projektion" und „Portfolio-Radar" auf dem Dashboard
  (`index.html`) bleiben — waren nicht Teil der Tools-Seite, sondern fest im
  Haupt-Dashboard verankert (`js/dashboard.js`).
