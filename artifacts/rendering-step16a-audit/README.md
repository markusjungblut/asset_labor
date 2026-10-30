# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1497 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.7 | 0.7 | 0.46 |
| zoom | ja | 50.02 | 0.4 | 0.25 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | NEIN | – | 39 | 6 | 379.5 / 576.0 |
| 4 | warm-pan | cold-diagnostic | 43.34 | 4 | 2 | 382.0 / 576.0 |
| 4 | warm-zoom | warm-candidate | 133.4 | 17 | 2 | 390.8 / 576.0 |

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: cold-diagnostic; Gate-Gründe: not-quiescent-before-sampling; asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: 12; Bilddateien noch ausstehend: 0
  - Quellursachen: {"terrain-not-painted":12}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":2,"tile.cache-miss":4,"tile.state":14,"tile.source-start":4,"tile.snapshot":4,"terrain.draw":3,"roads.draw":3,"tile.bake":4,"tile.accept":4,"tile.source-end":4,"tile.ground-revision-detail":2,"tile.ground-revision-changed":2,"tile.invalidate":2,"tile.ground-revision-deferred":4}; CPU-Taskzeit: 0.78 s; rAF-p95: 43.34 ms (nur Kalt-Diagnose)
- 4/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":91,"asset.invalidate":33,"tile.evict":1,"tile.invalidate":2,"tile.cache-miss":23,"tile.state":217,"tile.source-start":17,"tile.snapshot":17,"terrain.draw":16,"roads.draw":16,"tile.bake":17,"tile.source-end":17,"tile.source-deferred":13,"tile.accept":16,"scenery.invalidate":1,"fog.mask":1,"camera.mode-retained":1}; CPU-Taskzeit: 3.86 s; rAF-p95: 133.4 ms (nur Kalt-Diagnose)

## Globale Ground-Invalidierungen nach konkreter Bilddatei

- preparation: 30 image-ready-ground-Ereignisse; Quellen: assets/terrain/lehmwueste_04.png, assets/terrain/marshland_01.png, assets/terrain/marshland_02.png, assets/terrain/marshland_03.png, assets/terrain/marshland_04.png, assets/terrain/moor_01.png, assets/terrain/moor_02.png, assets/terrain/moor_03.png, assets/terrain/moor_04.png, assets/terrain/ocean_01.png, assets/terrain/ocean_02.png, assets/terrain/ocean_03.png, assets/terrain/ocean_04.png, assets/terrain/oedland_01.png, assets/terrain/oedland_02.png, assets/terrain/oedland_03.png, assets/terrain/oedland_04.png, assets/terrain/sandige_steinige_wueste_01.png, assets/terrain/sandige_steinige_wueste_02.png, assets/terrain/sandige_steinige_wueste_03.png, assets/terrain/sandige_steinige_wueste_04.png, assets/terrain/sandy_badlands_01.png, assets/terrain/sandy_badlands_02.png, assets/terrain/sandy_badlands_03.png, assets/terrain/sandy_badlands_04.png, assets/terrain/savanne_01.png, assets/terrain/savanne_02.png, assets/terrain/savanne_03.png, assets/terrain/savanne_04.png, assets/terrain/schneefeld_01.png, assets/terrain/schneefeld_02.png, assets/terrain/schneefeld_03.png, assets/terrain/schneefeld_04.png, assets/terrain/steinige_badlands_01.png, assets/terrain/steinige_badlands_02.png, assets/terrain/steinige_badlands_03.png, assets/terrain/steinige_badlands_04.png, assets/terrain/steinige_wueste_01.png, assets/terrain/steinige_wueste_02.png, assets/terrain/steinige_wueste_03.png, assets/terrain/steinige_wueste_04.png, assets/terrain/stormy_ocean_01.png, assets/terrain/stormy_ocean_02.png, assets/terrain/stormy_ocean_03.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_05.png, assets/terrain/stormy_ocean_06.png, assets/terrain/stormy_ocean_07.png, assets/terrain/stormy_ocean_08.png, assets/terrain/sumpf_01.png, assets/terrain/sumpf_02.png, assets/terrain/sumpf_03.png, assets/terrain/sumpf_04.png, assets/terrain/tundra_base_01.png, assets/terrain/tundra_base_02.png, assets/terrain/tundra_base_03.png, assets/terrain/tundra_base_04.png, assets/terrain/wald_01.png, assets/terrain/wald_02.png, assets/terrain/wald_03.png
- warm-pan: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-zoom: 7 image-ready-ground-Ereignisse; Quellen: assets/terrain/grassland_03.png, assets/terrain/halbwueste_03.png, assets/terrain/grassland_04.png, assets/terrain/cosatal_water_04.png, assets/terrain/cosatal_water_01.png, assets/terrain/cosatal_water_02.png, assets/terrain/cosatal_water_03.png

## 4x-Quellrevisionen pro Kachel

- preparation: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- preparation -1,-1 mid: terrain (6 -> 18)
- warm-pan: 4 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-pan -1,1 mid: road,river (22 -> 22)
- warm-pan -2,1 mid: road,river (21 -> 21)
- warm-zoom: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung

## Optionale visuelle Prüfbilder


## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
