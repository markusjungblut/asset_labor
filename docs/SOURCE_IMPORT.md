# Asset-Labor v0.11.0 – GitHub-Quellstand

## Status: Quellcode ist bereits importiert

Der Quellcode des Asset-Labors v0.11.0 wurde am 18.10.2026 in dieses Repository übernommen und anschließend geprüft. Es liegen **54 im lokalen Source-ZIP enthaltene Quell-, Dokumentations- und Testdateien** sowie zusätzliche initiale Repository-Dokumente vor. Daher ist ein weiterer manueller Erstimport des Source-ZIP **nicht mehr erforderlich**.

Relevante Dateien: `app.js`, `autotile.js`, `nature-ui.js`, `mountain.js`, `sprite-planner.js`, `ui-organizer.js`, `index.html`, `server.py`, `style.css`, `plans/sprite_catalog_plan.json`, `tests/`.

## Was bewusst noch nicht auf GitHub liegt

- Die beiden tatsächlichen Katalogdateien `assets/nature/nature_catalog.json` und `assets/terrain/terrain_catalog.json` wurden inzwischen ausdrücklich vom Nutzer ins Git-Repository aufgenommen. Im aktuellen Stand sind 262 PNGs (148 Nature, 104 Terrain, 4 Schatten, 6 Ufer) getrackt. `.bak`-Sicherungen bleiben lokal. Vor einem Commit die geänderten Dateinamen und Metadaten prüfen.
- Temporäre Testbilder unter `previews/` und Katalogsicherungen (`*.bak`).
- Eine produktive 30×30-Weltgenerator-Integration.

Die Dateien bleiben für den lokalen Betrieb erhalten. Die komplette Demo-Vollversion ist **nicht** zum Überschreiben bestehender Nutzergrafiken gedacht.

## Lokaler Start mit bestehender Grafikbibliothek

1. Dieses Repository klonen oder aktualisieren: `git clone https://github.com/markusjungblut/asset_labor.git` bzw. `git pull`.
2. Den vorhandenen lokalen `assets/`-Ordner aus der bisherigen Installation in den Arbeitsordner kopieren bzw. dort getrennt belassen.
3. `START_WINDOWS.bat` oder `START_MAC_LINUX.sh` starten.
4. Im Browser **v0.11.0** prüfen.
5. In `git status --short` sicherstellen, dass keine persönlichen Grafik- oder Katalogdateien erscheinen.

## Neue Funktionen und Verifikation

- 37 Hexfelder (Radius 3), weiterhin 7/19 als Testoptionen.
- Aufklappbare Arbeitsbereiche und Schnellzugriffe für Nature-Verteilung, Bergketten und 37-Hex-Szenen.
- Planungsbestand mit 45 Sprite-Arten und exakt zuordenbaren Bilddateinamen.
- Automatische Metadatenvorschläge nur für bisher nicht katalogisierte Grafiken und nur bei exaktem Dateinamen.
- Größenkalibrierung per `sizeMode=class` und sichtbarer Zielhöhe. Alte Bestände ohne `sizeMode` bleiben unverändert, bis eine explizite Sammelkalibrierung bestätigt wird.

**Geprüft:** Node-Syntax aller 10 JavaScript-Dateien, Python-Serversyntax, Node-Tests für Berg-, Relief- und Ufergeometrie; isolierter Chromium-Test von v0.11.0 (37/19-Hex-Umschaltung, 45 Planposten, Birke/Thymian-Metadaten, UI-Bereiche) ohne JavaScript-Ausnahmen.

**Offen:** Abschließende Bildabnahme und Laufzeitmessung mit den eigenen Nutzergrafiken in lokalem Firefox, automatisierte Volltests mit echten Bestandskatalogen, Bewertung/Ergänzung des 45-Einträge-Katalogs sowie spätere Kontrolle freigegebener Assets für eine absichtliche GitHub-Veröffentlichung.

## Sicherheit

Die aktuelle `.gitignore` schließt NICHT mehr PNGs oder echte Kataloge aus, sondern nur `previews/`, Sicherungen und temporäre Dateien. Sie schützt aber keine persönlichen Geheimnisse, die an einem anderen Pfad abgelegt werden: Vor jedem Commit `git status` und `git diff --cached --name-only` prüfen. Die Quelle der Wahrheit für Produktionsgrafiken bleibt vorerst deine **lokale** Bibliothek.

**Aktualisierung 18.10.2026:** Der historisch beschriebene Erstimport von v0.11.0 mit 45 Sollposten war der Ausgangsstand. Nach Bestandsabgleich führt der aktuelle Plan 17 offene Spritearten und 28 erledigte/entfallene Altposten. Die Nature-Gruppen für Büsche, verschneite Kiefern/Tannen und Kapokbäume wurden mit dem echten Nature-Katalog abgeglichen. Die historische v0.11.0-Chromium-Prüfung beschreibt ausdrücklich noch den damaligen Teststand, nicht den aktuellen Plan.
