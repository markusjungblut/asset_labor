# Schritt 16B – temporäre Road-/River-Pending-Revisionen

## Ursache anhand echter 4×-Hardwaredaten, 30.10.2026

Referenzszene: 397 Hexfelder, 2.631 Nature-Instanzen, SHA-256
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.
Der kombinierte Step16A-Audit (2) enthielt gültige Real-/Control-Skripte
(Fehler 0), fünf PNG-Visuals, aber keine vollständig gültige reale
Warm-Kameraphase.

4×-Pan: 89 rAF-Intervalle, p95 133,40 ms, 41 Bake-Ereignisse,
14 WorldTile-Invalidierungen, 16 per-Tile-Ground-Revisionsdetails,
13 revision-change groups, 49 Tile-Cache-Misses und 10
Editor-Cores mit `terrain-not-painted`.

Die 16 Details zerfallen in **8× ausschließlich Road**,
**6× Road+River**, **2× Terrain**. Bei den 14 Road-/River-
Übergängen bleibt der Terrain-Quellwert exakt gleich.
Road-/River-Quellen wechseln für dieselben Tiles abwechselnd
von fertig (z.B. `163`) zu `pending`, dann von `pending` zu
einer neuen fertigen Version (`184`). Wiederholte Invalidierungen
dieser Art erhöhen CPU-/Tile-Bake-Arbeit, ohne dass Terrain selbst
geändert wurde.

4×-Zoom: 89 rAF-Intervalle, p95 **16,8 ms**, ein neuer
Tile-Bake und kein neuer Revisionswechsel, aber der Warm-Gate
bleibt wegen nicht vollständig ruhiger Vorbereitung ungültig.
Auto-Pan/Zoom: beide 89 Intervalle mit p95 **16,8 ms**;
Auto-Zoom hatte null Scenery-Neuaufbauten während der Bewegung
und genau **einen** nach dem Stillstand (visuelle Aufnahme).

## Gezielte Produktionsänderung

`world-tile-streamer.js` behält eine bereits abgeschlossene
World-Tile-Raster-Kachel, **wenn die einzige gemeldete
Quellrevisionänderung darin besteht, dass eine zuvor fertige
Road-/River-Version vorübergehend als `pending` gemeldet wird**.
Der alte fertige Packet-Stand bleibt sichtbar und wird nicht
als `pending` überschrieben. Sobald eine neue fertig vorbereitete
Quellversion vorliegt, wird die alte mit dieser verglichen
und wie bisher bei Abweichung invalidiert.

**Keine** Unterdrückung bei Terrain- oder Küstenänderungen,
bei Road/River `off`, bei `pending → ready` oder bei
tatsächlich neuen fertigen Versionen. Editoränderungen benutzen
weiterhin explizite `invalidateTiles`-/Invalidierungswege.
Der Defer-Trace ist pro Tile/Revision dedupliziert und
bei Cache-Invalidierung bereinigt.

Diese Änderung soll die **erste** von zwei unnötigen
Invalidierungen pro Road-/River-Übergang vermeiden. Die
spätere tatsächliche `ready → neue ready`-Invalidierung
wird dadurch nicht abgeschaltet. Deshalb keine pauschale
Behauptung, dass alle 14 Ereignisse verschwinden.

## Tests und Abnahme

**Zehn gezielte Tests** mit der tatsächlichen `world-tile-streamer.js`
im isolierten V8 bestanden: Road-to-pending, anschließender neuer
ready-Stand, simultanes Road-/River-Pending, Terrain- und
Küstenänderungen, `off`, `pending → ready`, manuelles Tile-Edit,
identische Revision und 90-faches Trace-Dedupe.

Native Node-/Windows-Runtime, visuelle Vergleiche und Performance-
und Readiness-Wiederholungen sind noch erforderlich.
Der Patch darf nicht gemergt werden, falls Straßen oder
Flüsse nach einem Edit sichtbar alt bleiben, sondern muss
dann auf den tatsächlichen Edit-Lifecycle abgestimmt werden.

Ein gezielter lokaler Wiederholungslauf:

```powershell
node --test tests/test_rendering_step16b_transient_ground_revisions_20261030.cjs
node --test tests/test_rendering_step16b_4x_revision_trace_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 12000
```

Erwartet: `tile.ground-revision-deferred` für temporäre
Road-/River-Verfügbarkeit; **weniger** Ground-Invalidierungen
und Tile-Bakes bei unveränderter Szenen-SHA; keine
Regression bei Readiness, Fog, Küsten, Terrain.

## Visuelle Bilder aus dem kombinierten Vorläufer

Alle fünf Screenshots wurden erstellt. Scenery-Builds:
8 vor Zoom, 8 während Zoom, 9 nach Idle, 10 am Ozean
und 10 mit Fog. Ozean-Terraintyp (-4,5) ist `ocean`.
Ein visueller Vergleich zeigt keine offensichtlichen
verschobenen Baumkronen oder Schatten zwischen Zoom
und exaktem Endbild; ein pixelgenauer oder vollständiger
16C-Bildvergleich wurde nicht behauptet. An einigen
Wasserflächen sind Übergänge von Kachelgrafiken sichtbar;
ihre Bewertung bleibt Teil der späteren visuellen Abnahme.

Schritt 16C nicht freigegeben, Schritt 17 bleibt gesperrt.
