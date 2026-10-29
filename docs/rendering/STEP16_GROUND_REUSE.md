# Schritt 16 – World-Tile-Ground-Reuse und gezielte Revisionsprüfung

**Stand:** 29.10.2026 · **Implementiert; echte Windows-GPU-/Performance- und
Bildabnahme offen.** Grundlage: [Roadmap 15–20](RENDERING_ROADMAP_AFTER_STEP14.md)
und [Schritt-15-Tile-Diagnostik](STEP15_TILE_CAMERA_DIAGNOSTICS.md).

## Ausgangsbefund

Der vom Nutzer ausgeführte Schritt-15-Test (397 Hexfelder, 2631 Nature)
ergab beim 4×-Schwenken 12 Terrain-Fallbacks und 1128 ms darin
gemessene Ground-Zeichenzeit; beim Auto-Schwenken 25 Fallbacks und 3014 ms.
Die 4×-Zoomphase hatte 0 Ground-Fallbacks bei bereits bereiten Tiles.
Nicht alle Phasen waren zu Beginn/Ende ready, die p95-Framezeiten sind daher
**keine** gültige Hardware-Vorher-Benchmark-Basis ohne Ready-Gates.

Grundlage für diese Implementierung sind zwei belegte Ursachen:
- `endFastCamera` konnte alle World-Tiles invalidieren, wenn die Signatur
  eines **kameralokalen Editor-Snapshots** wechselte. Diese Signatur enthält
  insbesondere asynchron wechselnde `visibleRevision`-Zähler der Chunkpuffer.
  Solche Änderungen sind **keine globale Szenenrevision**.
- `bakeWorldTile` zeichnete Terrain und Straßen auch dann vollständig neu,
  wenn der Ground-Anteil einer anderen World-Tile-Layerrevision unverändert war.

## Änderungen

1. **Semantische Revision statt Staging-Signatur.** Ein bloß neu aufgebautes
   Editor-Snapshot ist jetzt ausschließlich ein Seed-Anlass, **kein** globaler
   World-Tile-Invalidierungsgrund. Wirkliche Semantikänderungen
   (Scene-/Materialrevision, nicht-selektive Scenery-/Road-Änderungen,
   Renderqualität bzw. DPR) invalidieren weiterhin; selektive Edits
   verwenden ihre bestehende World-Tile-Footprint-Liste.
2. **Pro-Kern-Quellversion.** Die tatsächliche vorbereitete
   Terrain-/Shoreline-/Road-/River-Chunksignatur wird an jedes akzeptierte
   World-Tile-Paket gebunden. `reconcileGroundRevisions` ersetzt bei
   asynchronem Eintreffen **nur** World-Tiles mit tatsächlich verändertem
   Kern und nur im aktuell verwendeten LOD. Szenenänderungen invalidieren
   alle abhängigen LOD-Varianten. Unfertige Quellbilder werden nicht als
   fertige Kacheln publiziert.
3. **Separater, begrenzter Ground-Cache.** `world-tile-ground-reuse.js`
   behält bis zu 44 MiB und 24 vollständige Ground-Layer (Terrain,
   Ufer, Flüsse, Straßen) anhand von Tile-ID, LOD, Chunk-Version,
   Scene-/Materialrevision und relevanten Ground-Einstellungen.
   **Weder Pan- noch Zoom-Koordinaten sind Cache-Keys.**
   Beim nur durch Scenery nötigen Neubau kann `bakeWorldTile` den
   kompletten Ground-Layer kopieren, statt `drawGround()/drawRoads()`
   auszuführen. Dynamische Einheiten bleiben separat.
4. **Keine wiederholte Snapshot-Kopie.** `needsSeed` verhindert
   Resampling/Kopieren schon fertiger scharfer World-Tiles beim Update
   eines Editor-Snapshots; Provisional-Tiles werden nur bei höherer
   Quelldichte erneut gesät.
5. **Neue Messwerte.** `groundReuseHits`, `groundReuseMisses`,
   `groundReuseBytes` erscheinen in den vorhandenen Browser-JSONs.
   Der Schritt-15-Bericht zeigt die Ground-Reuse-Treffer und -Misses
   zusammen mit den zuvor gemessenen Fallback-Terrain-Zeiten.

**Bewusst unverändert:** Canvas-2D- und WebGL-Pfade, Fog-Berechtigungslogik,
Biome-Import, Weltkoordinaten, Tiefensortierung, Scene-JSON, Shadow-Padding,
World-Tile-Gutter, Atlas-Strategie und Bildpoolbudgets.

## Unveränderte visuelle Sicherheitsbedingungen

- Eine Tile wird erst dann als `complete` gespeichert, wenn
  `tileArtworkReady` für Terrain, Ufer und erforderliche Assetbilder
  bestätigt wurde. Stale Terrainversionen werden vor der Annahme
  erneut geprüft. Im Zweifel wird der bisherige vollständige
  `drawGround/drawRoads`-Fallback verwendet.
- Ein schneller Hintergrund-Cache ersetzt **nicht** die unabhängige
  Scenery-/Schattenebene; Objekt-Owner-Bounds und Ground-Gutter
  bleiben erhalten. Ein Terrain-Edit invalidiert gezielt seine Weltkachel
  (und deren LOD-Varianten), weitere Hintergrundinformationen behalten
  ihre bisherigen Footprint-Regeln.
- Verschiedene Qualitäten/DPRs können verschiedene Quellauflösungen haben.
  Wenn sich das Qualitätsprofil ändert, werden nicht mehr passende
  Weltkacheln weiterhin neu aufgebaut.
- Wasser bei `(-4,5)` und der Fog-ON-Screenshot sind bereits als
  *separate* visuelle Fehlerkandidaten bekannt. Schritt 16 behebt sie
  **nicht** automatisch; Bildvergleich ist Pflicht.

## Tests und lokale Abnahme

Deterministische Node-Tests:

```powershell
node --test tests/test_rendering_step16_ground_reuse_20261029.cjs
node --test tests/test_rendering_step15_diagnostics_20261029.cjs
```

Anschließend mit aktueller `main` auf dem Windows-PC:

```powershell
.\START_STEP15_WINDOWS.cmd --qualities 4,auto --duration 1800 --warmup 1500
```

Ergebnis: `artifacts/rendering-step15-diagnostics/step15-diagnostics.zip`.
Die ZIP enthält weiterhin die einzelnen Bake-/Invalidierungsereignisse,
Kamerapositionen, Biom-/Fog-Screenshots und jetzt zusätzlich Ground-Reuse-Zähler.

**Harte Abnahmekriterien:**
- Bei **vorgewärmtem, vollständig bereitem** 4×-Warm-Pan innerhalb einer
  gleichbleibenden LOD/Scene **0 durch World-Tile-Fallback verursachte
  `drawGround`- und `drawRoads`-Durchläufe**.
- Keine `staging-signature-changed`-Vollinvalidierungen für
  bloße Kamera-/Editor-Snapshot-Aktualisierungen.
- Gezielte Terrainänderung regeneriert betroffene Tiles, ohne
  unbeteiligte Nachbarn oder andere LOD-Varianten grundlos zu verwerfen.
- Bildprüfung an Meer, Küste, Wald, Moor und Bergen inklusive Shadows,
  Fog, Kachelnaht und PNG-Export. Keine fälschlich als `READY` gemeldeten
  vorläufigen Land-/Wasserkacheln.
- Frame-p95, CDP-Hauptthreadzeit, Terrain-/Ground-Fallbackzahl,
  Kachelqualität, speicherverbrauch und zusätzliche 44-MiB-Cachekappe
  über **mindestens drei echte Wiederholungen** dokumentiert.

Falls eine GPU-/Bildabnahme scheitert, **Schritt 16 offen lassen**,
den verursachenden Teilpatch isolieren oder zurücknehmen und die
gleiche Referenzszene erneut prüfen. **Schritt 17 nicht vor
dieser Abnahme als erledigt melden.**

**Bislang verifiziert:** JavaScript-Syntax und isolierte deterministische
V8-Tests (kein Chrome-GPU-Lauf). **Keine gemessene Beschleunigung behaupten.**
