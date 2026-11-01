# Schritt 16B – stabile Terrain-/Küsten-Quellrevisionen (01.11.2026)

## Live-Nutzerbefund

Die normalen Firefox-4×-Tests zeigen weiterhin starke Lags und
wiederkehrende Wolken. Trotz der zweiten sichtbaren Chunk-Lane in PR #96
ging die Live-Warteschlange bei zwei nicht exakt vergleichbaren Samples
von 57 auf 16, die Zahl bereits gebauter Chunks von 25 auf 52 und die
aktive Terrain-Cache-Auslastung von 30 % auf 92 %; 11 Evictions wurden
gezählt. Diese Zahlen belegen **keinen** vollständigen Browser-PASS.
PR #97 korrigiert zusätzlich, dass ein Offscreen-WorldTile-Bake
die Kamera-Warteschlange übernehmen konnte.

## Weitere tatsächliche Invalidation-Schwachstelle

Der Produktionspfad für die Version der fertigen WorldTiles war bislang:

1. `terrainChunks`/`shorelineChunks` bauten einen Raster-Chunk,
   dessen `artwork.version` jedes Mal fortlaufend erhöht wird.
2. `fastRender()` berechnete die erwartete WorldTile-
   `groundSourceRevision` mit **diesem Bauzähler**
   (`artwork.version`), sowohl für Terrain als auch für Shoreline.
3. `worldTiles.reconcileGroundRevisions()` stufte daher dieselben
   *unverändert neu gebauten* Boden- und Küstenbilder als **andere
   Inhaltsrevision** ein.
4. Der vorhandene Retain-Pfad schützt zwar die sichtbaren alten
   Pixel, dennoch werden sie erneut als `dirty` markiert und
   die teure Ground-/Scenery-WorldTile-Quelle neu angefordert.

Dieser Mechanismus kann bei Cold-Panning und LRU-Rebuilds
unnötige WorldTile-Bakes und sichtbares Nachladen verstärken.
Die frühere Korrektur für Straßen/Flussufer nutzte bereits
den stabilen `sourceContentRevision(configuration,stamp)`-
Fingerabdruck aus `chunks.js`.

## Kleine Änderung

Nur die **Revisionsermittlung** ändert sich:

- `currentTerrainCore()` fordert den vorhandenen
  `sourceKeys:true`-Fingerabdruck an und lässt den
  **`artwork.version`-Bauzähler selbst unverändert**.
- `fastRender()` lädt den Fingerabdruck für alle aktuellen
  Terrain- und Shoreline-Chunks; die `readyMaps` für
  Road/River benutzen ihn weiterhin wie bisher.
- `groundSourceRevision()` nimmt für Terrain und Küste
  `artwork.sourceRevision`, mit konservativem
  `artwork.version`-Fallback für ältere/möglicherweise
  andere Chunk-Implementierungen.
- Die **strenge Snapshot-Paint-Freigabe**
  `terrainChunks.paintedVersions().get(t.id)===artwork.version`
  bleibt absichtlich unverändert. Der stabile
  Inhaltsfingerabdruck ist **kein** Ersatz für die
  tatsächliche Bereitschaft, und gibt kein unerlaubtes
  Gelände unter der Fog-Maske frei.
- Änderungen an Materialbild/`imageRevision`, Nachbarzellen-
  Stamp, Küstenquelle, Renderfamilie, Dichte oder LOD
  erzeugen weiterhin einen neuen Fingerabdruck.
- Kein Asset, kein Pixel, keine Blend-/Samplingoption,
  keine Workerparallelität und kein 24M-/26M-Budget
  wurde verändert.

`chunks.js` berechnet und merkt sich den Fingerabdruck
**nur bei `sourceKeys:true`**. Normale Snapshot-
und Chunk-Draw-Anforderungen werden dadurch nicht
zusätzlich gehasht.

## Testumfang

Fünf zusätzliche deterministische Node-Regressionsfälle:

1. Gleicher Terrain-Stempel, neue Bitmap nach
   `clear()`: anderer Bauzähler, **gleicher** Fingerabdruck.
2. Dasselbe für Küsten-Chunks.
3. Geänderte Materialien, Source-/Renderkonfiguration:
   **neuer** Fingerabdruck.
4. Die echte extrahierte Produktionsfunktion
   `groundSourceRevision()` bleibt bei bloß geänderten
   Terrain-/Shore-Bauzählern stabil und wechselt bei
   realen Source-Änderungen.
5. Integrationsvertrag: beide Fast-Camera-Layer benutzen
   die stabilen Keys, während der Painter weiterhin
   den aktuellen Buildzähler als Snapshot-Gate verlangt.

Die **5/5 Fälle wurden im isolierten V8-Harness**
mit dem echten Produktions-`chunks.js` und der
extrahierten `groundSourceRevision()` ausgeführt und
bestanden. Die übrigen 113 Fälle sind **auf diesem SHA
noch nicht nativ erneut ausgeführt**. Gesamtlauncher
jetzt **118/118** Tests in 13 Testdateien.

## Windows-Nachprüfung

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-stable-terrain-shore-source-revisions-20261101
git pull --ff-only origin fix/step16b-stable-terrain-shore-source-revisions-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Lokale Änderungen oder bereits archivierte Auditordner **nicht**
resetten/löschen. Den lokalen Server nach dem Branchwechsel
**neu starten**, Firefox mit `Strg+Umschalt+R` neu laden.
Im rechten Bereich muss
`16B-Stabile-Terrain-Revisions-Test` stehen.

**Normaler Firefox-Check, nicht vorwärmen:** Die volle
397-Hex-Szene bei 4× laden, frei pannen, dann ruhig
stehen bleiben und beobachten, ob bereits sichtbare
Land-/Wasser-Kacheln nach späteren Chunk-Fertigstellungen
wieder von Wolken verdeckt werden. Live-Zähler:

```js
const v=window.VedrasAssetLabor;
const t=v.streamingStats().terrain,w=v.worldTileStats();
console.log({
 queued:v.tileDiagnostics({limit:80}).terrain.queuedVisible,
 terrainBuilt:t.built,terrainEvicted:t.evicted,
 terrainCached:t.cached,terrainPixels:t.pixels,
 worldCompleted:w.completed,worldEvicted:w.evicted,
 worldDirty:w.staleTiles,worldExact:w.progress?.exact,
 worldMissing:w.progress?.missing
});
```

**Die weißen horizontalen/vertikalen Linien auf Land,
Küstenwasser und Ozean sind noch nicht visuell
abgenommen.** Unveränderte Revisionen können unnötige
WorldTile-Nachläufe vermeiden, beheben aber nicht
zwangsläufig mögliche Sampling-/Clip-Spalte oder das
teure erstmalige Rendern.
[Produkt-Issue #92](https://github.com/markusjungblut/asset_labor/issues/92)
und [Ground-Naht #90](https://github.com/markusjungblut/asset_labor/issues/90)
bleiben offen. PR bleibt **Draft**, kein Merge.
