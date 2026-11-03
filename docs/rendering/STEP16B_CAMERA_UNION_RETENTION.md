# Schritt 16B – vollständige Kamerastrecke und Source-Revisionen

## Anlass und nachprüfbarer Ausgangsbefund

Die mit PR #86 erfasste reale Qualität-4-Szene mit 397 Hexfeldern
und 2631 Nature-Objekten (`step16a-audit(20261030-222532).zip`)
zeigte bei vollständig bestandener Vorbereitung dennoch:

- Pan: 10 **identische** Neudekodierungen von Naturgrafiken,
  sämtlich `protected:false`, 3 World-Tile-Bakes, 3 Cache-Misses,
  1 Ground-Revisionsinvalidierung.
- Pan-Bake `-1,-2@mid`: Road-Quelltoken wechselte tatsächlich von
  `pending` auf `src-1f3-…`; das erneute Rendern war korrekt.
- Zoom: keine ImagePool-Decodes, keine Pool-Evictions, aber 1 neu
  gebackenes World-Tile `-2,-2@mid`.
- Beide realen Warm-Phasen **ungültig**. rAF-p95 war
  27,36 ms (Pan) und 26,70 ms (Zoom): nur Kalt-Diagnose.

Das ursprüngliche Ergebnis wurde unverändert gelassen.

## Gezielte Implementierung

1. **Ganze Geste statt nur drei Kamerapunkte:** Der Audit plant die
   mathematisch gleiche Sinus-Pan- beziehungsweise Cosinus-Zoom-Bewegung
   wie der reale Probe-Lauf (bei 90 Frames: 93 Pan- bzw. 92 Zoom-Posen,
   inklusive exakt berechneter Extrema). Eine begrenzte Tour bereitet
   Zwischenpositionen vor. Das Ergebnis ist NICHT schon dann warm,
   wenn nur die einzelnen Stationen READY sind.

2. **Authorisierte World-Tile-Union:** Aus denselben 96-Pixel-Streaming-
   Viewports wird die Vereinigung benötigter Tile-IDs und LODs gebildet,
   einschließlich Fog-Freigabe. Der bereits vorhandene World-Tile-Cache
   erhält dazu eine **ausschließlich bei expliziter Audit-Aktivierung**
   genutzte Reservierung. Die Reservierung schützt gegen LRU-Verdrängung,
   erhöht aber weder die Obergrenze von 144 Tiles noch die von
   26 Millionen Tile-Pixeln. Passt die Vereinigung nicht in beide Limits,
   liefert `warmTileStatus().overBudgetPixels` oder
   `overTileLimit` den konkreten Blocker.

3. **Aktuelle Tile-Revisionen:** `warmTileStatus()` zählt nur komplette,
   nicht-stale, nicht-provisorische Tiles, deren gespeicherte Revision mit
   der aktuellen **vorbereiteten** Quellrevision übereinstimmt.
   Ein Straßen- oder Flusswechsel von `pending` auf ein stabiles
   `src-…` bleibt ein echter Unterschied und blockiert die Messung,
   statt stillschweigend als warm durchzugehen.

4. **Quellen für Überhänge:** Zusätzlich zu den bisherigen Kamera-
   Bounding-Boxes übernimmt die Bildvorbereitung die gleiche
   Kachelkern-plus-320-Welteinheiten-Umgebung, die
   `tileArtworkStatus()` für Natur-/Gebäude-/Berggrafiken kontrolliert.
   Die Abhängigkeiten werden für die gesamte Kamerastrecke vereinigt,
   nicht nur an Start und Extrempunkten. Innerhalb dieser expliziten
   Audit-Lease löst die globale `genericObjects()`-Indexerstellung
   keine Dekodierung anderer, off-camera Naturbilder mehr aus.
   Der normale Spielbetrieb bleibt unverändert.

5. **Road-/River-Quellen:** An jeder Station werden die bereits
   konfigurierten Terrain-, Ufer-, Straßen- und Fluss-Chunk-Queues
   ausdrücklich vorbereitet, bevor die World-Tile-Bereitschaft geprüft
   wird. Für diese Vorbereitung gibt es keine künstliche
   Revisionsüberschreibung, keine höheren Budgets und keine
   Abschwächung des Fog-Schutzes.

6. **Harte Abschlusskontrolle:** Nach der Tour werden sämtliche
   reservierten Tiles auf Missing, Preview, Stale, Revision-Mismatch,
   Pixelbudget und Tile-Limit geprüft. Maximal zwei Touren; danach wird
   auch bei fortbestehenden Blockern die eigentliche Warm-Kamera-Geste
   nur noch **als ungültige Kalt-Diagnose** gemessen. Die vorhandenen
   1,2-s-Quiet- und während-der-Geste-Mutationsgates bleiben bestehen.
   Nach der Messung wird die Reservierung entfernt und ein
   überbudgetierter Restcache sofort mit dem normalen LRU bereinigt.

## Tests

Neuer Test: `tests/test_rendering_step16b_camera_union_20261031.cjs`
mit 10 Regressionen für reservierte Tiles, Budgetüberschreitung,
fehlende/Preview-/stale-Reife, Quellrevisionen, korrekte
Viewport-Geometrie, Fog und Nature-Überhang sowie Audit-Gates.

Die 11 Tests in `test_rendering_step16b_warm_trajectory_20261030.cjs`
wurden an die erweiterten, strengeren Fußabdruck- und Cache-Gates
angepasst. Keine produktiven Bild- oder Wasser-Pixel bearbeitet;
die vertikalen Küstenlinien sind weiterhin ein separates visuelles
Problem.

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step16b-camera-union-source-retention-20261031
git pull --ff-only origin fix/step16b-camera-union-source-retention-20261031
node --test tests/test_rendering_step16b_camera_union_20261031.cjs tests/test_rendering_step16b_warm_trajectory_20261030.cjs tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

**Abnahmestand:** Die ursprünglichen 58/58 Tests auf PR #85 sind
nativ unter Windows bestanden; die 11 geerbten Tests von PR #86
und diese 10 neuen Tests sowie die neue reale Warm- und
Bildprüfung sind **noch nicht nativ bestätigt**.
Alle Änderungen bleiben Draft und ungemergt. 16C/17 sind gesperrt.
