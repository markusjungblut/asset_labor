# Schritt 16B – tatsächliche Raster-Pixel der Warm-Kamerastrecke

## Befund vom Windows-Audit 31.10.2026, 01:00

Die neue vollständige Kamerastrecke von PR #87 hielt **16/16** fertige
World-Tiles in ihrem Cache, ohne Tile-Bakes, ImagePool-Decodes,
Invalidierungen oder Evictions während Pan/Zoom. Der Warm-Test war wegen
**26.250.048 / 26.000.000 Tile-Rasterpixeln** formell ungültig:
**250.048 Pixel (0,96 % des Budgets) zu viel**.

Der Produktionscode für einen fertig gebackenen `mid`-Tile erzeugt
mit Dichte 1,5, Projektion 0,85, Ground-Gutter 3 Welt-Einheiten und
Scenery-Überhang 128 Welt-Einheiten exakt folgende Rastermaße:

| Ebene | Berechnete Dimensionen | Pixel je Tile | 16 Tiles |
|---|---:|---:|---:|
| Ground | 777 × 660 | 512.820 | 8.205.120 |
| Scenery | 1152 × 979 | 1.127.808 | 18.044.928 |
| Gesamt | – | 1.640.628 | **26.250.048** |

Die Summe stimmt **exakt** mit dem Budgetbefund überein. Das legt
nahe, dass die 16 Tiles die vollständige Mid-Fallback-Rasterform nutzen;
die konkrete Layer-Verteilung muss der nächste native Audit dennoch
einzeln auslesen, da die gleiche Gesamtsumme andere Kombinationen
theoretisch nicht ausschließt. Etwa 69 % des berechneten Speichers
entfallen auf die Scenery-Raster mit Überhang.

## Implementierte schreibgeschützte Diagnose

`worldTiles.warmTileStatus()` enthält zusätzlich:

- `rasterDetails`: Für **jeden reservierten** Tile-Key die wirklich
  gecachten Layer samt `layer`, `width`, `height`, `pad`,
  `owned`, `pixels`, den tatsächlichen `totalPixels`, dem aus den
  Layern rekonstruierten `accountedPixels` und Preview/Dirty-Flags.
- `reservedPixels`: Speicher der reservierten Tiles.
- `unreservedPixels`: übrige tatsächlich gespeicherte Cache-Pixel.
- `layerPixels`: Summe der Ebenen über **alle** gespeicherten Tiles.
- `reservedLayerPixels`: Summe der Ebenen nur über die reservierte
  Kamerastrecke.
- `rasterAccountingMismatch`: Zahl der Tiles, bei denen die
  tatsächlich abgerechneten Pixel nicht der Summe ihrer Layer entsprechen.

Die Diagnose arbeitet ausschließlich mit bereits gespeicherten
Metadaten (Canvas-/Bitmap-Breite und -Höhe). Sie ruft keine
`getImageData`-Scans auf, erzeugt keine zusätzlichen Raster und
fordert keine neuen Bilder an. Der bestehende sichere
Fog- und Readiness-Vertrag sowie die Grenzen von
**144 Tiles / 26.000.000 Pixel** bleiben unverändert.

Im Audit werden die Summen zusätzlich in `README.md` ausgegeben;
`result.json → real[].prewarm.world.rasterDetails` enthält die
detaillierte Aufteilung. Die ZIP wird wie bisher in einem neuen
Zeitstempelverzeichnis erstellt.

## Warum noch keine Scenery-Randkürzung?

Die Überhänge sind wichtig für Baumkronen, Felsen,
Gebäude und Schatten. Die Reduktion von 128 auf 125 oder ein
bewusster Verzicht auf Scenery-Layer könnte Bildteile abschneiden
oder die Fallback-Darstellung beschädigen. Darum wird kein
Rastermaß allein zur Erfüllung der Abnahme reduziert.

Die nächste gezielte Implementierung sollte auf den **tatsächlichen
Layer- und Padding-Daten** basieren. Nur nachgewiesen
unbenutzte/inhaltlich transparente Pixel sind Kandidaten für
eine verlustfreie Verdichtung; ein solcher Eingriff benötigt
zusätzliche Pixel- und Fog-Regressionstests.

## Nativer Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step16b-raster-footprint-diagnostics-20261031
git pull --ff-only origin fix/step16b-raster-footprint-diagnostics-20261031
node --test tests/test_rendering_step16b_raster_footprint_20261031.cjs tests/test_rendering_step16b_camera_union_20261031.cjs tests/test_rendering_step16b_warm_trajectory_20261030.cjs tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

**Abnahme:** Nur die ursprünglichen 58 Node-Regressionen aus
PR #85 wurden auf Windows positiv bestätigt. Die neuen Tests und
die realen Pan-/Zoom-Gates müssen erneut nativ laufen.
Draft beibehalten, kein Merge; Schritt 16C/17 gesperrt.
