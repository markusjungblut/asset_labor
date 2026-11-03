# Schritt 16B – WorldTile-Offscreen-Bake darf Kamera-Chunk-Streamer nicht neu ausrichten

## Reale Firefox-Fehlermeldungen (01.11.2026)

Auch im Draft #96 (`16B-Live-Streaming-2-Lanes`) meldet der Benutzer
deutliches 4×-Wolkenblinken und langsames freies Pannen.

Zwei **zeitlich getrennte** Echt-Browser-Abfragen des jetzt live
instrumentierten `streamingStats().terrain`:

| Wert | Frühere Abfrage | Spätere Abfrage |
|---|---:|---:|
| `queuedVisible` | 57 | 16 |
| `visibleAssistStarted` | 12 | 23 |
| `built` (kumulativ) | 25 | 52 |
| `evicted` (kumulativ) | 0 | 11 |
| `cached` (aktive Map) | 1 | 22 |
| Cachebudget belegt | 30 % | 92 % |

Die Daten zeigen: Der zweite Streaming-Kanal wird verwendet;
auf dem späteren Stand steht der Cache nahe am Limit und es gibt
erste LRU-Verdrängungen. Es sind **keine kontrollierten,
identischen Kamera-/Zoom-Samples**. Darum keine kausale
Durchsatzsteigerung aus den Zählerdifferenzen behaupten.

## Nachgewiesener Codepfad: Globalen Kamera-Scheduler beim Offscreen-Bake überschrieben

Während der WorldTile-Renderer fertig gerenderte Kacheln in
`app.js bakeWorldTile()` neu erzeugt, verwendet sein
Fallback-Pfad nach Herstellung temporärer Zeichen-Canvases
`drawGround(); drawRoads();`.

Diese Methoden rufen intern die bisherigen
`terrainChunks.draw()`, `shorelineChunks.draw()`,
`riverChunks.draw()` und `roadChunks.draw()` auf.
Das vorherige `chunks.js draw()` war aber als **echte
Kamera-Operation** implementiert und hat unabhängig vom
verwendeten Zeichencanvas immer:

1. `diagnosticTiles` und `stats.visible` auf den kleinen
   WorldTile-Ausschnitt gesetzt;
2. `updateStreaming()` auf diesem Ausschnitt ausgeführt:
   `viewportWanted` und `protectedIds` überschrieben;
3. Wartende Kamera-Tiles außerhalb des Ausschnitts
   als nicht mehr sichtbar **entfernt**;
4. den LRU-Cache mit dem falschen Schutzbereich getrimmt;
5. für die Offscreen-Projektion weitere Tile-Aufträge
   eingeplant und `lastDrawnVersions` neu veröffentlicht;
6. eine Offscreen-gezeichnete Kachel fälschlich als
   **bereits im normalen Editor gezeichnet** gekennzeichnet.

Damit können **gleichzeitig** Cache-Churn, nach hinten
fallende Kamera-Jobs, inkonsistente Snapshot-Readiness,
Wolkenblinken und helle vorübergehende Chunk-Übergänge
entstehen. Es ist ein reproduzierbarer Fehler der
Aufgabenverteilung **im Produktionscode**. Dass er
sämtliche sichtbaren Fehler erklärt, muss der Firefox-
Nachtest noch belegen.

## Gezielter Fix

Ein explizites `renderOnly:true` in
`VedrasChunks.draw(ctx,bounds,options)` bedeutet:

- Vorhandene gültige Raster auf den **identischen**
  Kachel-Kernbereich zeichnen, inkl. unveränderter
  Boden-/Wasser-Clips und Relief-/Fallback-Visuals.
- **Kein** `updateStreaming`, `trim`,
  Queue-Enqueue/Cancel, Kamera-Prioritätswechsel,
  `schedule()`, LRU-Förderung, Content-/Cache-Reset.
- **Keine** Veröffentlichung von
  `lastDrawnVersions`; ein Offscreen-Raster zählt
  nicht als ein bereits im Editor gezeichnetes Tile.
- Stale Einträge nicht während des Offscreen-Aufrufs
  entfernen: Die gewöhnliche Editor-/Camera-Operation
  behält die Cache-Lifetime.
- Nur die **lokalen** sichtbaren/gezeichneten Zähler
  dieses Funktionsaufrufs zurückgeben. Globale Kamera-
  Telemetrie und Wartezähler unverändert lassen.

Das Flag wird ausschließlich gesetzt, wenn
`step15PaintContext.origin==='world-tile-fallback'`,
und zwar für **alle vier** Chunk-Layer (Terrain,
Shoreline, RiverBank, Road). Gewöhnliches Editor-
`draw()`, `prime()` und Audit-Warm-Routen behalten
ihren bisherigen Codepfad.

Kein neues Worker-Exemplar, keine Budgeterhöhung,
keine Reduktion der 4×-Grafikqualität und keine
Lockerung der Fog-Berechtigungen.

## Teststatus

Vier neue deterministische `node:test`-Fälle prüfen,
dass Offscreen-Zeichnen:

1. die echten sichtbaren Kamera-Tiles,
   Warteschlangenlänge, aktive Foreground-Quelle
   und Diagnoseansicht unverändert lässt;
2. eine fertig vorbereitete Kachel **nicht** als
   Editor-Paint veröffentlicht;
3. die bereits wartenden echten Kamera-Tile-IDs
   nicht aus der Queue entfernt;
4. in `app.js` bei allen vier Offscreen-
   Zeichenschichten aktiviert ist.

Mit dem **echten** `chunks.js`-Quellcode in
einem isolierten V8-Harness ausgeführt: **4/4 PASS**,
Syntax der Produktionsskripte bestätigt.
Native Windows-Gesamtsuite erwartet nun **113/113**
Tests über 12 Dateigruppen. Noch **kein** Windows-
Nachtest und **kein** Firefox-Live-PASS für diesen SHA.

## Windows

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-world-tile-bake-nonmutating-chunk-draw-20261101
git pull --ff-only origin fix/step16b-world-tile-bake-nonmutating-chunk-draw-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Server vom Test-Branch neu starten, Firefox
`Strg+Umschalt+R`, sichtbare Kennung
`16B-Offscreen-Kamera-Fix`. Bei der gleichen
397er-Karte normal (ohne Audit-Vorwärmung) pannen
und besonders darauf achten, ob fertig gezeigte
Landschaft nach dem Nachladen erneut verschwindet.

Kurze Browserdiagnose:

```js
const v=window.VedrasAssetLabor;
const t=v.streamingStats().terrain;
const q=v.tileDiagnostics({limit:80}).terrain;
const w=v.worldTileStats();
console.log({
 current:v.streamingStats().current,
 terrain:{visible:t.visible,cached:t.cached,
  pending:t.pending,built:t.built,evicted:t.evicted,
  pixels:t.pixels,budgetPixels:t.budgetBytes/4,
  queued:q.queuedVisible,epoch:q.epoch,
  foreground:q.foreground?.id,background:q.background?.id},
 world:{visible:w.visible,tiles:w.tiles,completed:w.completed,
  evicted:w.evicted,missing:w.progress?.missing,lod:w.lod}
});
```

Die **weißen Linien auf Land und Wasser** aus
[Issue #90](https://github.com/markusjungblut/asset_labor/issues/90)
nicht als behoben markieren, bevor der reale
Screenshot-Nachtest sie bei Zwischenständen und
nach vollständigem Ladeende überprüft.

[Live-Performance #92](https://github.com/markusjungblut/asset_labor/issues/92).
**Draft; nichts mergen.**
