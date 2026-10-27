# Rendering-Status

**Stand:** 2026-10-27  
**Repository:** markusjungblut/asset_labor (main)  
**Schritt 1:** Dokumentierter Ausgangsstand in Commit `bf3700e0ab06f9404fc8dc4fafbba59715b2d82c`; Live-Browser-Baseline weiterhin offen.  
**Schritt 2:** **Diagnoseinstrumentierung implementiert; vier isolierte V8-Regressionstests bestanden.** Native Node-Tests und Browserprüfung in dieser Umgebung ausstehend.  
**Nächster Schritt:** **3 – Ursachen der hängenden Tile-Aufträge mithilfe der Diagnosen untersuchen und gezielt beheben.**

## Änderungen in Schritt 2
- `chunks.js`: nur auf Anfrage erzeugte, pro sichtbarer Kachel lesbare Diagnose für sichtbare/warm/prefetch-Warteschlange, aktiven Vorder-/Hintergrundauftrag, Epoch, Terrain-LOD, Start-/Änderungszeitpunkt, Cache-/Paint-Versionen, `cached-empty`, Fehler und Obsoleszenz. Letztes Ergebnis von höchstens 384 Tiles gespeichert.
- `world-tile-streamer.js`: identifizierbare `queued`, `running`, `source-null`, `failed`, `aborted`, `discarded`, `fallback-lod`, `ready`, `invalidated`-Zustände nach Tile-ID, LOD und Epoch. Keine neue Retry-Regel.
- `app.js`: `tileArtworkStatus(t,details)` unterscheidet fehlenden Terrain-Core (`terrain-core-not-ready`), bereits gebauten, aber nicht gezeichneten Core (`terrain-not-painted`), fehlende Bildquellen (`sprite-source-not-ready`) und `ready`. Der alte `tileArtworkReady(t)`-Aufruf bleibt für den Produktionspfad erhalten; nur dieser stößt bei Bedarf ein Sprite-Laden an.
- Neue Console-API `window.VedrasAssetLabor.tileDiagnostics({limit:50,includeReadiness:true})` mit `terrain`, `world`, `artwork`, `worker` und `imagePool`. Sie wird **nicht** automatisch auf jedem Frame berechnet.
- `tests/test_tile_diagnostics_v023_step2_20261027.cjs`: vier fokussierte Regressionstests zur Zustandsklassifizierung und funktionalen Gleichheit der normalen Readiness-Prüfung.

## Prüfungen
- Geänderte `app.js`, `chunks.js`, `world-tile-streamer.js` und neue Testdatei erfolgreich syntaktisch als JavaScript kompiliert.
- **4/4 neue Tests in einer isolierten V8-Umgebung mit Node-API-Shims ausgeführt:** Queue/Leer-Cache, Epoch-Wechsel/Fehler, World-Tile-`source-null`/Fehler, Artwork-Bereitschaft ohne Nebenwirkung bei Diagnose; zusätzlich Funktionsprüfung `invalidated`.
- **Nicht ausgeführt:** nativer `node --test`-Lauf, bestehende vollständige Regression, Screenshot-/Browser-FPS-Test. Der frühere 79/79-Teststatus aus v0.22.6 ist historisch und wurde hier nicht wiederholt.
- Bestehende Benutzer-Baseline (449,6 ms pro Frame, 67 Terrain ausstehend) bleibt unverändert; keine Leistungsverbesserung behauptet.
- Der aktuelle Quellcode kann ein leeres Terrain-Ergebnis als Cache-Eintrag ohne Raster führen. Ebenso wird eine World-Tile-Quelle mit `null` nicht als fertige Tile-Grafik gecacht. Beides ist jetzt diagnostizierbar, aber **noch nicht als Ursache der gemeldeten Hänger bewiesen**.

## So wird die Diagnose im echten Editor gesammelt
Nach Aktualisierung des lokalen Editors (Dateien aus main laden und hart neu laden) die Browserkonsole öffnen:

```js
const d = window.VedrasAssetLabor.tileDiagnostics({limit:150});
console.table(d.terrain.tiles);
console.table(d.world?.tiles || []);
console.table(d.artwork.filter(x => !x.ready));
console.log({terrain:d.terrain, world:d.world, worker:d.worker, imagePool:d.imagePool});
```

Dieselben Abfragen zu Beginn, nach 30 Sekunden und nach 60 Sekunden durchführen, Kamera während der Ladebeobachtung nicht bewegen. Für jedes hängende Tile insbesondere `id`, `state`, `epoch`, `lod`, `ageMs`, `lastOutcome`, `lastError`, `stampMatches`, `rasterVersion`, `paintedVersion`, `terrainVersion` und `reason` vergleichen. Diagnosebegrenzung: maximal 150 sichtbare Tiles je Aufruf, begrenzter letzter Ereignisstatus pro Tile (kein vollständiges Trace).

## Schritt 3: Reihenfolge der nächsten Untersuchung
1. Neuen Test nativ ausführen: `node --test tests/test_tile_diagnostics_v023_step2_20261027.cjs`.
2. Bestehende Tests in `BASELINE.md` ausführen und gespeicherte große Originalszene im Browser prüfen.
3. Hängende Tile-IDs zwischen `terrain`, `world` und `artwork` korrelieren. Zunächst `cached-empty`, `source-null`, `terrain-not-painted`, lange `building`-Aufträge sowie veraltete Epochs untersuchen.
4. Nur bestätigte Ursachen beheben. Fog-Bereitschaftsgates, Grafikdetails und Assets unangetastet lassen, sofern nicht nachweislich erforderlich.

## Sicherung und Grenzen
Backup-Branch `backup/v0.23-step1-before-docs-20261027` zeigt weiterhin auf den ursprünglichen v0.22.6-Release `ee769a37f3ca2adfd4d5b2db8dcf8765787ce479`. In Schritt 2 wurden weder Tile-Retries noch Renderqualität, Kamera- und Streaming-Prioritäten, Bilddateien oder Weltdaten verändert.
