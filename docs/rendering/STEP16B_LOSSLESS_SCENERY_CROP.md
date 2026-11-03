# Schritt 16B – verlustfreie Verdichtung der World-Tile-Scenery

## Ausgangslage und Ziel

Der native Windows-Audit `step16a-audit(20261031-010022).zip`
zeigte für die unveränderte 397-Hex-/2631-Nature-Szene bei 4×:

- **16/16 World-Tiles** vollständig und mit aktuellen Ground-Revisionen.
- Während Warm-Pan/Zoom **0 ImagePool-Decodes, 0 Evictions, 0 Bakes,
  0 Cache-Misses, 0 Ground-Invalidierungen**.
- Beide Gesten bei rAF-p95 **16,8 ms**, aber wegen Rasterbudget
  **formal ungültig**; kein validierter FPS-Nachweis.
- **26.250.048** genutzte von **26.000.000** erlaubten WorldTile-Pixeln,
  also **250.048 Pixel zu viel**.

Die `mid`-Fallbackraster eines Tiles haben bei Dichte 1,5
und projiziertem Y-Faktor 0,85 die Größen

- Ground mit 3-Welteinheiten-Gutter: **777×660 = 512.820 Pixel**
- Scenery mit vollständigen 128-Welteinheiten-Überhang:
  **1152×979 = 1.127.808 Pixel**

16 × beide Raster = **26.250.048** Pixel. Die Scenery benötigt
rund 69 % dieser Pixel. Diese Werte folgen direkt aus den
Renderer-Formeln; `rasterDetails` aus PR #88 ermöglicht jetzt
die Prüfung gegen die tatsächlichen im Browser gehaltenen Layer.

## Gezielte Umsetzung

**Der Überhang wird nicht verkleinert und die Pixelauflösung wird
nicht abgesenkt.** Stattdessen werden fertig gerenderte Scenery-Canvases
im `mid`-LOD nur dann *nach dem fertigen Bake* beschnitten,
wenn sich an ihren Außenkanten nachweislich vollständig transparente
Pixel befinden:

1. `packWorldTileScenery(canvas,level)` liest die Alpha-Werte eines
   fertig gezeichneten `mid`-Scenery-Rasters einmalig in der
   Quellvorbereitung (niemals im Kamera-rAF).
2. Die äußersten Pixel mit **Alpha > 0** bestimmen die belegte
   Bildfläche. Jeder belegte Rand behält weitere **zwei Originalpixel**
   als transparenten Schutzrand für Canvas-Interpolation. Auch
   sehr schwache Transparenz (Alpha 1) gilt als belegter Bildinhalt.
3. Nur ab **4.096 tatsächlich eingesparten Rasterpixeln** wird ein
   entsprechend kleineres Canvas mit unveränderter Pixeldichte
   angelegt. Bei vollständig transparenter Scenery wird der nachweislich
   leere Canvasinhalt durch einen transparenten 1×1-Ausschnitt
   repräsentiert; die Scene-/Asset-Readiness wurde vorher geprüft.
4. Jedes beschnittene `scenery`-Layer speichert zusätzlich seine
   Originalabmessungen und den Pixeloffset als
   `crop:{x,y,fullWidth,fullHeight}`.
5. Der WorldTile-Compositor zeichnet den kleineren Ausschnitt mit
   mathematisch identischer Pixel-zu-Welt-Skalierung genau an der
   ursprünglichen Position. Für unbeschnittene und ältere
   Rasterpakete bleibt der bisherige Pfad unverändert.
6. `accept()` validiert `crop` strikt. Falsche oder aus dem
   Originalbild herausragende Crop-Koordinaten werden nicht als
   fertige Scenery-Layer akzeptiert. Ground- und Terrain-Layer
   bekommen nie solche Crops.
7. Die Optimierung gilt für vollständige `mid`-Scenery-Pakete aus
   dem direkten Tile-Bake und aus scharfen Staging-Snapshots.
   **Preview-Tiles und andere LODs bleiben unverändert.**

Wenn die Browser-Canvas-Alpha-Werte wegen CORS/SecurityError nicht
lesbar sind, das Crop-Canvas nicht angelegt werden kann oder kaum
transparente Ränder vorhanden sind, wird **ohne Korrektur oder
Qualitätsminderung** das gesamte originale Raster verwendet.

`tile.scenery-pack`-Trace und
`VedrasBenchmarkProfiler.tile.sceneryPackMs` dokumentieren
die Einsparung bzw. den einmaligen Aufwand im kalten Tile-Aufbau.

## Was sich ausdrücklich nicht ändert

- WorldTile-Limit **144 Tiles / 26 Millionen Pixel**,
  Bildpool-Limit und parallele Decode-Slots.
- Original-PNGs, Vegetations-/Schattenpositionen,
  Scenery-Überhang (128 Welt-Einheiten), Terrain-/Ground-Gutter.
- Reihenfolge der Draw-Pässe, Hex-Fog, Cloud-Underlay,
  Berechtigungsprüfung und Source-Revisionen.
- `complete`-/Preview-/Stale-Readiness-Gates.
- Dynamische Einheiten, direkte Editorzeichnung,
  Kamera-Bildrate und finaler PNG-Exportpfad.

**Wichtig:** Das Vorhandensein vollständig transparenter Außenränder
ist eine Eigenschaft der tatsächlich gerenderten Szene, keine
garantierte Zahl. Der neue Lauf muss `rasterDetails` und
`overBudgetPixels` messen. Sollte jeder Scenery-Layer vollständig
bis zum Rand belegt sein, darf der Warm-Test weiterhin scheitern.

## Tests und Abnahmekriterien

Neuer deterministischer Test
`tests/test_rendering_step16b_lossless_scenery_crop_20261031.cjs`
mit 10 Fällen zu: Alpha-Präzision, 2-Pixel-Guard, leeren Flächen,
Randbelegung, Nicht-Promotion anderer LODs, CORS-/Readback-Fallback,
Crop-Metadata/Fog-Gates und identischer Pixel-zu-Welt-Geometrie.

In einem isolierten V8-Harness wurden diese zehn Testfunktionen
mit Produktionscode durchlaufen. **Noch kein nativer Windows-Node-Test
und kein Chromium-Pixelvergleich dieses Branches.**

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step16b-lossless-scenery-raster-crop-20261031
git pull --ff-only origin fix/step16b-lossless-scenery-raster-crop-20261031

node --test tests/test_rendering_step16b_lossless_scenery_crop_20261031.cjs tests/test_rendering_step16b_raster_footprint_20261031.cjs tests/test_rendering_step16b_camera_union_20261031.cjs tests/test_rendering_step16b_warm_trajectory_20261030.cjs tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs

.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

Zu verifizieren:
- `prewarm.world.rasterDetails`: echte Crop-Pixel,
  Layeroffsets, keine `rasterAccountingMismatch`.
- `overBudgetPixels=0` **ohne** Tileverlust, reduzierte Auflösung,
  erhöhte Speicherlimits oder neue Berechtigungsfreigabe.
- Alle 16 reservierten WorldTiles `exact`, keine
  Revision-Mismatches, Preview-, Stale- oder Missing-Tiles.
- Kein Bake, ImagePool-Decode/-Eviction, Cache-Miss oder Ground-
  Invalidierung während der Warm-Gesten.
- Visueller Vorher/Nachher-Vergleich insbesondere
  Waldkronen, Bergschatten, Küste, Wolkenfront, Fog
  und Kartenränder. Keine sichtbare Änderung gegenüber #87.
- Gültige Warm-Pan/Zoom-Gates in mindestens drei Wiederholungen
  auf derselben Zielhardware, bevor FPS beurteilt werden.

**Der Küsten-/Wasserlinienfehler bleibt unabhängig davon offen.**
Keine Merges, 16C/17 weiter gesperrt.
