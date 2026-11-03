# Schritt 16B – selektive Materialrevision bei geografischem Relief

## Tatsächlicher Hardwarebefund in ZIP 7

Referenzszene `artifacts/rendering-step13/vedras_scene.json`,
SHA-256 `1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`:
397 Hexfelder und 2.631 Nature-Instanzen. **Relief ist eingeschaltet
(`enabled:true`, `mode:'geography'`, `strength:90`).**
Diese Einstellung hatte die vorherige Funktion
`selectedGroundAssetChanges` immer mit `null` (global) verlassen,
unabhängig davon, ob PNG, Wasserklasse und Flussquelle bekannt waren.
Deshalb waren PR #78/#79 in dieser Szene bislang keine wirksame
selektive Ground-Optimierung.

ZIP 7: Keine JavaScript-Fehler und fünf 4×-Screenshots.
4×-Pan: globaler Ground-Reset zweimal; erster Reset
verwirft 15 fertige Tiles, acht Ground-Asset-Events
(sechs Landtexturen, zwei Ufergrafiken), 21 Bakes,
p95 250,24 ms, 50 % Coverage und elf Pending am Ende.
4×-Zoom: kein globaler Ground-Reset, aber fünf
Terrain-Revisionswechsel, vier zurückgestellte
Pending-Übergänge, zwölf Bakes, p95 200,22 ms.
Beide 4×-Phasen sind **nicht warm-valid**.
Der isolierte Compositor-only-Test ist gültig.

## Minimaler Fix

- Für `state.relief.enabled && state.relief.mode==='geography'`
  wird der reine Materialpfad nach den vorhandenen
  Hex-/Wasserstatus- und Flussquellenprüfungen lokal freigegeben.
  `VedrasRelief` berechnet in diesem Modus die Höhen aus
  festgelegten Hügelhexen, Koordinaten und Reliefparametern;
  die Ausgangstextur wird im lokalen Terrain-Raster verformt.
- Bei geänderter Land-/Wasserklassifikation, fehlender
  Referenz-Auswahl, ungültigen Bildquellen, forest_floor-
  Overlays oder externen Uferkantengrafiken bleibt der
  globale Ground-Reset bestehen. **Legacy-Relief** bleibt
  vorerst ebenfalls global.
- Die geografische Terrain-Chunk-Stamp enthält bereits
  `asset.imageRevision` pro Material und die Nachbarhexes
  mit 470-Welteinheiten-Halo. Nur fertig aktualisierte
  Quelltiles dürfen wieder gecacht werden.
- Der `staticTerrain.keyFor`-Schlüssel berücksichtigt nun
  `imageRevision` zusätzlich zu Dateipfad und mtime.
  So kann eine PNG-Revision nicht fälschlich ein älteres
  Raster aus dem persistenten Terrain-Cache laden.
- Revisionsprüfung, Fog-Autorisierung, 4×-Dichte,
  Ufer-/Fluss-Fallback, Exportcode und allgemeine
  Editor-Edit-Invaliderung bleiben unverändert.

## Visuelle Prüfbilder

Die 4×-Screenshots vor/während/nach Zoom zeigen
keinen offensichtlichen Verlust von Bäumen/Scenery.
Das Küstenbild zeigt das korrekte angeforderte Ozeanhex,
aber **zwei dünne vertikale Linien im Wasser**
mit Abstand entsprechend einer projizierten 512er
World-Tile-Spalte. Ob dies ein Raster-Resampling-/
Compositor-Seam ist, muss mit einem gezielten
pixelgenauen Vergleich geprüft werden.
Der Fog-Screenshot zeigt die autorisierte
Hex-/Frontier-Verdeckung. **Visuelle Abnahme von 16C
steht ausdrücklich noch aus.**

## Tests

Zusätzliche Fälle für geografisches Relief:
Grassland-Pixelrevision, Coastal-Water-Pixelrevision
mit gleicher Wet-Topologie, Wet-Klassenwechsel
führt weiterhin zum Globalpfad, Legacy-Relief global
und persistenter Terrain-Cache unterscheidet
`imageRevision`. Insgesamt **25/25** Tests der
Ground-Dependency-Datei im isolierten V8 bestanden.
Native Windows-/Chromium-Prüfung ausstehend.

## Ein sinnvoller Hardware-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-geography-relief-ground-dependencies-20261030
git pull --ff-only origin fix/step16b-geography-relief-ground-dependencies-20261030
node --test tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 12000 --visual
```

Jetzt besonders wichtig: 
`groundAssetDependencyModes` und `groundAssetDependencies`
müssen bei reinen Land-/Wassertexturen in `geography`-
Relief wirklich `selective` zeigen und betroffene
World-Tile-IDs zählen. Die separaten
`assets/shorelines/`-Grafiken bleiben global.
Danach Coverage, neue Bakes, Cache-Revisionswechsel,
4×-Visuals und Fog prüfen. Ein einzelner ungültiger
Warm-Lauf ist weiterhin **kein FPS-Nachweis**.

PR-Draft, kein Merge. Schritt 16C/17 gesperrt.
