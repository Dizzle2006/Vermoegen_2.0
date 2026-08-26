# Vermögensaufstellung auf GitHub Pages veröffentlichen

So bekommst du die App auf **iPhone und MacBook** ohne 404-Fehler.

---

## Welche Dateien gehören ins Repository?

**Pflicht** (genau diese Namen, exakt so geschrieben — Groß/Kleinschreibung beachten!):

```
index.html              ← HTML-Gerüst, lädt alles andere
app.css                 ← alle Styles
js/state.js             ← State + localStorage
js/helpers.js           ← Formatierung + Berechnungen
js/dashboard.js         ← Dashboard-Rendering
js/main-dashboard.js    ← Bootstrap & „Render all"
favicon.svg             ← App-Icon
manifest.webmanifest    ← für „Zum Home-Bildschirm hinzufügen"
404.html                ← fängt falsche URLs ab
.nojekyll               ← (leere Datei) verhindert GitHub-Pages-Filter
```

> **Wichtig:** Der Ordner `js/` muss genau so heißen (kleingeschrieben). Die `<script>`-Tags in `index.html` zeigen auf `js/state.js` usw. — falls du den Ordner umbenennst, schlägt das Laden fehl.

**Optional** (Dokumentation, schadet nicht):

```
README.md
ARCHITEKTUR.md
DESIGN-SYSTEM.md
ANLEITUNG-GITHUB-PAGES.md   ← diese Datei
Vermögensaufstellung.html   ← leitet auf index.html weiter (Alt-Link-Schutz)
```

> **Wichtig:** Die App läuft komplett aus `index.html`. Alles andere ist nur Doku.

---

## Schritt-für-Schritt-Anleitung

### 1. Alle Dateien herunterladen
Klick in diesem Projekt auf **Download** → Du bekommst einen ZIP-Ordner mit allen Dateien.

### 2. Neues GitHub-Repository erstellen
1. Auf [github.com](https://github.com) einloggen.
2. Oben rechts auf **+** → **New repository**.
3. Repository-Name: z. B. `vermoegen` (**nur Kleinbuchstaben, keine Umlaute, keine Leerzeichen**).
4. **Public** auswählen (GitHub Pages braucht das im Gratis-Plan).
5. Häkchen bei „Add a README" **weglassen** (haben wir schon).
6. **Create repository** klicken.

### 3. Dateien hochladen
1. Im neuen Repo: **„uploading an existing file"** klicken (Link in der Mitte).
2. ZIP entpacken, **alle** Dateien (inklusive der versteckten `.nojekyll`) per Drag & Drop ins Browser-Fenster ziehen.
   - **Auf dem Mac**: Im Finder mit `Cmd+Shift+.` versteckte Dateien sichtbar machen, sonst fehlt `.nojekyll`!
3. Unten **Commit changes** klicken.

### 4. GitHub Pages aktivieren
1. Im Repo oben auf **Settings**.
2. Links im Menü auf **Pages**.
3. Bei **Source** → **Deploy from a branch** wählen.
4. **Branch**: `main` (oder `master`), **Folder**: `/ (root)`.
5. **Save** klicken.
6. Ca. 1–2 Minuten warten, dann erscheint oben die URL:

```
https://DEIN-USERNAME.github.io/vermoegen/
```

### 5. Aufrufen + testen
- **MacBook**: URL im Safari/Chrome öffnen — fertig.
- **iPhone**: URL in Safari öffnen → Teilen-Symbol → **„Zum Home-Bildschirm"**. Jetzt liegt das App-Icon „Vermögen" auf dem Homescreen und öffnet die App im Vollbild.

---

## Warum bekomme ich keine 404-Fehler mehr?

| Problem | Lösung |
|---|---|
| Umlaut `ö` im Dateinamen wird auf iOS anders encodiert | Hauptdatei heißt jetzt `index.html` |
| GitHub Pages filtert manche Dateien (Jekyll-Verhalten) | `.nojekyll` deaktiviert das komplett |
| Tippfehler in der URL führen ins Leere | `404.html` fängt das ab und leitet zur App zurück |
| App auf iPhone wie ne Webseite mit Browserleiste | `manifest.webmanifest` + Apple-Meta-Tags → echte App-Optik |

---

## Updates: was wenn ich die App ändere?

Wenn du nur **eine** Datei änderst (z. B. `js/dashboard.js`):

1. Im Repo durch die Ordner zur Datei navigieren.
2. Auf das Stift-Symbol klicken, ändern, **Commit changes**.

Wenn du **mehrere** Dateien gleichzeitig austauschen willst:

1. Im Repo-Root auf **Add file** → **Upload files**.
2. Neue Dateien reinziehen (gleiche Pfade!) → **Commit changes**.

Innerhalb von ~1 Minute ist die neue Version live (evtl. mit `Cmd+Shift+R` neu laden, um den Browser-Cache zu umgehen).

> **Bei Änderungen am `js/`-Ordner:** Achte darauf, dass die Pfade in `index.html` (`<script src="js/...">`) zu den Dateinamen passen. Tippfehler = 404 = App lädt nicht.

---

## Häufige Stolperfallen

- **404 nach dem Aktivieren von Pages**: 1–2 Minuten warten. Die erste Veröffentlichung dauert.
- **Weiße Seite auf dem iPhone**: Cache leeren — Einstellungen → Safari → Verlauf löschen.
- **Repo heißt `username.github.io`** (z. B. `dein-name.github.io`): Dann liegt die App direkt unter `https://dein-name.github.io/` ohne Unterordner. Funktioniert auch.
- **`.nojekyll` fehlt im Upload**: Im Finder versteckte Dateien einblenden (`Cmd+Shift+.`), neu hochladen. Ohne diese Datei werden manchmal Ressourcen mit `_` im Namen verschluckt.
- **Daten weg nach Neuladen?** Die App speichert alles im `localStorage` des Browsers. Pro Gerät getrennt. Wenn du die Daten zwischen iPhone und Mac synchron halten willst, musst du die Export-/Import-Funktion in der App nutzen.

---

## Datenschutz

Die App läuft **vollständig im Browser**. Es werden keine Daten an einen Server geschickt. GitHub Pages liefert nur die HTML-Datei aus, danach läuft alles lokal.
