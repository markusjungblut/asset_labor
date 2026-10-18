# Asset-Labor v0.8.0 – Implementierungsbericht

Stand 12.10.2026. **Lokales Browser-Assetlabor, keine Produktionsfreigabe für die Spielkarte.**

## Umgesetzt

1. **Gelände-Katalog:** 6 verbindliche Kategorien mit 19 Geländearten; zusätzlich die **separat gekennzeichnete** Kategorie „Weitere Testgelände“ mit 4 historisch verwendeten Demoarten. Frei erweiterbar, auch ohne Änderung am Quellcode.
2. **Bearbeiten/Speichern:** Neue Kategorien und Geländearten, Umbenennen, Verschieben, Archivierungsstatus; Zuordnung von Bildvarianten zu Terrainarten. JSON-Katalog `assets/terrain/terrain_catalog.json`. Lokales API speichert atomar und prüft die Eingaben. Manueller Browserimport ermöglicht JSON-Export.
3. **Keine implizite Terrain-Heuristik:** Importierte Terrainbilder ohne Zuordnung werden als „Nicht zugeordnet“ geführt und können nicht stillschweigend als Grasland gerendert werden. Unterschiedliche Terrainarten vs. Varianten desselben Typs werden unabhängig behandelt.
4. **Auto-Tiling:** Ein kontinuierlicher, normalisierter Material-Feldpuffer. Keine kandidatenspezifischen Kanten-Noise-Bias-Werte; stattdessen gemeinsames weltverankertes Warp-Feld, begrenzter Blendbereich und periodisches bilineares Bildsampling. Keine gesonderten Alpha- oder Eckoverlays.
5. **Inspektor:** Ausgewähltes Hex zeigt Geländearten der sechs Nachbarn und den jeweiligen Mischmodus. Zusätzliche Debug-Auswahlen `Geländearten-Kennungen` und `Kernzonen`.
6. **Kompatibilität:** Vorhandene Karte, Zoom, Farview, Platzhalterobjekte, A/B-Vergleich, Import und Szenenexport erhalten; Szenenimport von `scene-0.6`, `scene-0.7`, `scene-0.8` mit Ablehnung fehlender/unzugeordneter Materialien.
7. **Grafikmaterial:** Vorliegende vier Tundra- und vier Gefrorene-Tundra-Kandidaten eingeordnet. Die acht KI-Grafiken sind **nicht** als „nahtlos wiederholbar“ geprüft oder freigegeben.

## Geprüft

- `python tests/test_v08_browser.py` in eingebettetem Chromium: Grafiken laden, Kategorie/Art neu anlegen, Speicher- und Klassifikationslogik, Varianten gegenüber Artübergang, 19er-Testszenen, 2er-/3er-Kontinuität. Keine JavaScript-Ausnahmen.
- `python tests/test_catalog_api.py`: lokale Katalog-Endpunkte, gültiges JSON, persistentes Update, Zurückweisung doppelter IDs und unzulässiger Asset-Pfade.
- Numerischer Probelauf mit künstlichen Materialien: Zweierkante RGB `(127,128,0)`; Dreifachpunkt `(85,85,85)`; Feldzentrum `(255,0,0)`.
- Technischer JavaScript-Syntaxcheck für `catalog.js`, `autotile.js`, `app.js` und Python-Compile für `server.py` bestanden.

**Grenzen:** Die direkte Navigation von Headless-Chromium auf `localhost` war in der Ausführungsumgebung eingeschränkt, daher wurden Originalskripte und Daten als eingebettete HTML-Browser-Testseite geprüft. Server-API wurde separat über lokales HTTP getestet. **Firefox wurde nicht automatisiert getestet.** Es gibt keine verlässliche 200+-Hex-/Mobilperformance-Abnahme. Ufer-/Küstenprofile sind nur als gesondert zu implementierende Übergänge erfasst. Der neue Blender kann nicht die bereits in einer nicht kachelbaren KI-Textur enthaltene sichtbare Wiederholungsnaht entfernen.

## Nächste Schritte

1. Reale Firefox-Bildprüfung bei 160 und 240 % mit Grasland↔Tundra↔Trockenboden. Insbesondere Wiederholungsnähte der Quelle gegenüber Geometrienähten unterscheiden.
2. Küstengewässer/Ozean/Ufer als explizite eigene Shader-/Overlayregeln implementieren.
3. Wiederholungs- und Kantenqualität jeder KI-Terrain-Textur vor Freigabe in einem Materialtest prüfen.
4. Chunk-/GPU-Puffer für 200+ sichtbare Hexe entwickeln und Desktop-/Mobildaten messen.
5. Biomneutrale Gebäude ohne Terrainboden und mit getrenntem individuell gezeichnetem Schatten erstellen.

## Hotfix v0.8.1 – stabile Katalogzuordnungen beim erneuten Einlesen

- Ursache: `reloadFromServer()` setzte beim Importieren der Assetliste den lokalen Katalog immer durch die Datenträgerversion zurück, auch wenn `catalogDirty` wahr war. Der Benutzer musste vorher manuell speichern.
- Lösung: serialisierte Hintergrundspeicherung nach Änderungen; beim Neu-Einlesen offenen Stand zuerst speichern und nur bei unverändertem lokalen Änderungsstand die Dateiversion übernehmen; bei HTTP-Fehler lokale Zuordnungen behalten. Katalogdaten werden durch `loadLibrary()` nicht verändert.
- Schreibsicherung: vor `os.replace()` Kopie der bisherigen Katalogdatei als `terrain_catalog.json.bak`; keine automatische Löschung von Benutzerassets.
- Regression: `tests/test_reload_persistence_v081.py` testet unmittelbares Neu-Einlesen, wiederholtes Reload, neue Kategorie, simulierten Serverfehler, erneutes Speichern und korrekte Wiederherstellung; `tests/test_catalog_api.py` prüft lokale Speicherung und ungültige Payloads.
- **Updatehinweis:** eine bestehende Installation mit dem kleinen Hotfix-Archiv aktualisieren, damit der vorhandene `assets/terrain/terrain_catalog.json` und die selbst hinzugefügten Bilddateien unangetastet bleiben.


## v0.9.1 – 13. Oktober 2026

- Nature-Katalog weiterhin Schema v1; optionale Presets und Kategorie-/Ausschlussfelder. Bestehende Zuordnungen bleiben kompatibel.
- UI erlaubt ganze Terrain-Kategorien, dynamische Freigabe neuer Terrainarten, lokale Include-/Exclude-Ausnahmen und verknüpfte benannte Presets.
- Schatten: sichtbares Alpha-Bounding-Box-Cropping für Nature-Sprites und Schattenbilder, Schattenkontakt am Standanker, kurze linksliegende Schatten für Lichteinfall von rechts. Frei editierbare Offset-/Breiten-/Tiefenparameter sowie Kontakt-Overlay.
- Vorhandene Terrain-Tiles, Nature-Grafiken und Kataloge sind nicht Bestandteil des Update-ZIPs.
- Produktionsregel präzisiert: eine Referenzfigur/ein Referenzbusch entspricht einem eigenen Sprite; keine generische Mittelung mehrerer Ausgangsmotive.
- Gezielt geprüft: neuer Chromium-Browsertest und Python-API-Schemavalidierung. Full-Regression und Firefox-Sichtfreigabe bleiben offen.