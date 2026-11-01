# Schritt 16B – normaler Firefox-Kamera-Chunk-Durchsatz (01.11.2026)

## Messung in realem Asset-Labor

Der Benutzer hat in Firefox bei 4× während eines normalen,
**nicht audit-vorgewärmten** Kamerabetriebs folgende Werte gemessen:

- Ein stationärer Kameravergleich über **8 Sekunden**:
  `terrainEpoch=9` unverändert, `queuedVisible:47→38`,
  `errors=0`, `retryExhausted=0`.
  Genau neun **unterschiedliche** Tile-IDs erhielten je einen weiteren
  Bauanfang. Dies ist ein beobachteter Durchsatz von etwa
  **1,125 Bauanfängen pro Sekunde**, **kein** Beweis für
  neun abgeschlossene, endgültig präsentierte Weltkacheln.
- Eine spätere Aufnahme an einer anderen Kamera zeigt
  `terrain.queuedVisible=49`, einen aktiven
  `foreground`-Job (`0,-4`), `background=null`,
  weiterhin `errors=0` / `retryExhausted=0`.
- Worker ist aktiv, `failed=0`, insgesamt 965 Worker-Aufträge,
  davon 751 Shoreline-Aufträge (diese Zahlen sind kumulativ;
  `workerMs=256` ist **keine** durchschnittliche Chunks-Zeit).
- `streamingStats().terrain` meldete `built=1339`,
  `evicted=1287`, `cached=0`, `variants=2`,
  `pixels=23.322.000` / `24.000.000`.
  **Achtung:** Diese Quelle war vor diesem PR im aktiven
  Fast-Kamera-Modus ein möglicherweise **veralteter Snapshot**
  aus `draw()`, weil `draw()` während `tileModeActive`
  absichtlich nicht vollständig läuft. Das Paket `cached=0`
  darf deshalb **nicht** als aktueller Live-Cachezustand behauptet
  werden; die Zahlen sind Indizien, keine bestätigte Ursache.

Die gezeigten hellen Streifen sind laut Benutzer **horizontal und
vertikal**, über **Land, Küstenwasser und Ozean**, und verschwinden
teilweise, wenn die Nachbarchunks fertig laden. Ein Screenshot
zeigt insbesondere schmale vertikale Linien. Der gemeinsame
Ground-/Fog-/Chunk-Compositor wird separat in
[Issue #90](https://github.com/markusjungblut/asset_labor/issues/90)
untersucht. **Kein ungeprüfter Bildsampling- oder Alpha-Fix**
in diesem PR.

## Nachvollziehbarer Scheduler-Engpass

`chunks.js` hat zwei asynchrone Jobs/Lanes,
`foreground` und `background`. Vorher konnten sichtbare
Tiles ausschließlich in der ersten Lane gebaut werden.
Während eine solche Quelle läuft, bleibt die zweite Lane
beim normalen Fast-Kamera-Streaming häufig unbenutzt, da
dort `prefetch:{enabled:false}` gesetzt ist.

Die minimale Änderung:

- Eine **zweite sichtbare** Quelle darf den ungenutzten
  Background-Slot belegen, **nur während**
  `!backgroundPaused` und ein erster `foreground`-Build
  läuft.
- Sichtbare Jobs haben Vorrang vor Warm-/Prefetch-Arbeit;
  sie werden mit `setTimeout(…,0)` statt
  `requestIdleCallback` eingetaktet.
- Während `beginFastCamera` / aktivem Pan/Drag aktiviert
  `setInteractive(true)` unverändert `backgroundPaused=true`.
  Dann bleibt es bei einem sichtbaren Build, um Eingaben
  nicht mit zusätzlicher Arbeit zu belasten.
- Epoch-, Sichtbarkeit-, Stempel-, Bitmap-Lifetime-,
  Timeout-/Retry- und Render-Fog-Verträge bleiben erhalten.
  Die Zahl gleichzeitig gestarteter eigener Chunk-Aufträge
  steigt maximal von 1 auf **2** (nicht die Zahl der Worker).
- Neuer Diagnosezähler
  `streamingStats().terrain.visibleAssistStarted` für
  tatsächlich über den zweiten Kanal gestartete sichtbare Jobs.

**Einschränkung:** Wenn der einzelne Terrain-Worker selbst
CPU-limitiert ist, werden zwei gleichzeitig wartende Worker-
Aufträge nicht automatisch doppelt so schnell. Der zweite
Slot kann aber die vorbereitende Arbeit (Disk-Cache/Hashing/
Textures) überlappen. Der **tatsächliche Zeitgewinn**
muss im normalen Firefox-Browser gemessen werden.

## Der bisher stale Telemetrie-Bug

`window.VedrasAssetLabor.streamingStats()` liest jetzt
die `stats()`-Methoden der vier Chunkrenderer **live**
(`terrain`, `shore`, `rivers`, `roads`) und
fügt `current:true` hinzu. Diese Änderung misst nicht
durch zusätzliches Zeichnen und startet keine neuen Jobs.
Der vorher nur bei einem vollen Editor-`draw()`
gespeicherte `window.__vedrasStreamingProfile` bleibt als
kompatible Basis erhalten; seine vier Statfelder werden
mit echten Live-Countern überschrieben.

## Prüfungen

Syntaktische Prüfung von `chunks.js`, `app.js`,
Tests und ESM-Launcher. Ein isolierter Lauf mit der
**echten Produktionsfunktion** `VedrasChunks.create()` und
kontrollierten ausstehenden Promises demonstriert:

- Ruhende Kamera: zwei verschiedene sichtbare Chunks
  in zwei Job-Lanes; `visibleAssistStarted=1`.
- Aktiver Pan: ein sichtbarer Chunk, zweite Lane pausiert.

Vier zusätzliche `node:test`-Regressionen liegen in
`tests/test_rendering_step16b_idle_visible_chunk_parallelism_20261101.cjs`.
Der native Launcher verlangt jetzt **109/109**
Tests in elf Dateien. Die **109 Fälle sind noch nicht
nativ auf Windows ausgeführt**, und es liegt kein
realer FPS-/Durchsatznachtest mit der Änderung vor.

## Windows-Test und unveränderte reale Kamera

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-idle-visible-chunk-parallelism-20261101
git pull --ff-only origin fix/step16b-idle-visible-chunk-parallelism-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Falls `git status --short` lokale Änderungen meldet,
keinesfalls resetten oder löschen. Nach dem Test
den lokalen Server **neu starten**, Firefox
**Strg+Umschalt+R**. Im rechten Bereich muss
`16B-Live-Streaming-2-Lanes` stehen.

**Ohne Audit-Vorwärmung:** 4×-Karte an einer noch nicht
vollständig geladenen Region, Kamera 8 Sekunden ruhend.
In Firefox F12:

```js
const v=window.VedrasAssetLabor;
const t=v.streamingStats().terrain;
const d=v.tileDiagnostics({limit:80}).terrain;
console.log({
 current:v.streamingStats().current,
 queued:d.queuedVisible,
 foreground:d.foreground,
 background:d.background,
 visibleAssistStarted:t.visibleAssistStarted,
 built:t.built,evicted:t.evicted,cached:t.cached,
 pixels:t.pixels,budgetPixels:t.budgetBytes/4,
 world:v.worldTileStats()
});
```

Bei gleicher Szene und Bewegung sind
`queuedVisible`-Differenzen vor/nach acht Sekunden
vergleichbar. **Nicht** die alte 47→38-Messung als exakt
gleichen Workload interpretieren, falls Kamera/LOD/Region
verschoben wurden.

**Nicht Bestandteil:** Änderung des 24M-/26M-Budgets,
Laden unsichtbarer Terrain-Daten, Lockerung von Fog-Gates,
Quellbildersetzung, WebGL-Umbau oder voreilige Abnahme
der weißen Chunk-Grenzen.

[Live-Leistungsfehler #92](https://github.com/markusjungblut/asset_labor/issues/92)
bleibt offen; [Ground-Naht #90](https://github.com/markusjungblut/asset_labor/issues/90)
bleibt offen. Draft auf #95, **kein Merge**.
