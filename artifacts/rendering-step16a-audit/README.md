# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1601 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.7 | 0.75 | 0.46 |
| zoom | ja | 33.4 | 0.4 | 0.2 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | bereit | – | 16 | 7 | 380.8 / 576.0 |
| 4 | warm-pan | warm-candidate | 50.06 | 5 | 2 | 393.3 / 576.0 |
| 4 | warm-zoom | warm-candidate | 16.8 | 1 | 0 | 393.3 / 576.0 |

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; angefragte unbereite World-Cores: –; unbereite Overscan-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":90,"tile.evict":2,"tile.cache-miss":5,"tile.state":549,"tile.source-start":5,"tile.snapshot":5,"tile.bake":5,"tile.accept":2,"tile.source-end":5,"asset.pool-evict":28,"asset.pool-ready":37,"ground.reuse-invalidate":10,"asset.invalidate":10,"terrain.draw":2,"roads.draw":2,"asset.redecode-identical":27,"tile.invalidate":2,"tile.stale-retained":26,"ground.asset-dependency":2,"tile.source-deferred":27}; CPU-Taskzeit: 1.37 s; rAF-p95: 50.06 ms (nur Kalt-Diagnose)
- 4/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; angefragte unbereite World-Cores: –; unbereite Overscan-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"asset.pool-evict":28,"tile.evict":1,"tile.cache-miss":1,"tile.state":3,"tile.source-start":1,"tile.snapshot":1,"tile.bake":1,"tile.accept":1,"tile.source-end":1}; CPU-Taskzeit: 0.35 s; rAF-p95: 16.8 ms (nur Kalt-Diagnose)

## Ground-Asset-Invalidierungen nach konkreter Bilddatei

- preparation: 331 Pool-Decodes ({"first-decode":297,"repeat-decode":30,"quality-upgrade":4}), 83 Pool-Evictions
- preparation: 74 image-ready-ground-Ereignisse; Quellen: assets/terrain/lehmwueste_04.png, assets/terrain/marshland_01.png, assets/terrain/marshland_02.png, assets/terrain/marshland_03.png, assets/terrain/marshland_04.png, assets/terrain/moor_01.png, assets/terrain/moor_02.png, assets/terrain/moor_03.png, assets/terrain/moor_04.png, assets/terrain/ocean_01.png, assets/terrain/ocean_02.png, assets/terrain/ocean_03.png, assets/terrain/ocean_04.png, assets/terrain/oedland_01.png, assets/terrain/oedland_02.png, assets/terrain/oedland_03.png, assets/terrain/oedland_04.png, assets/terrain/sandige_steinige_wueste_01.png, assets/terrain/sandige_steinige_wueste_02.png, assets/terrain/sandige_steinige_wueste_03.png, assets/terrain/sandige_steinige_wueste_04.png, assets/terrain/sandy_badlands_01.png, assets/terrain/sandy_badlands_02.png, assets/terrain/sandy_badlands_03.png, assets/terrain/sandy_badlands_04.png, assets/terrain/savanne_01.png, assets/terrain/savanne_02.png, assets/terrain/savanne_03.png, assets/terrain/savanne_04.png, assets/terrain/schneefeld_01.png, assets/terrain/schneefeld_02.png, assets/terrain/schneefeld_03.png, assets/terrain/schneefeld_04.png, assets/terrain/steinige_badlands_01.png, assets/terrain/steinige_badlands_02.png, assets/terrain/steinige_badlands_03.png, assets/terrain/steinige_badlands_04.png, assets/terrain/steinige_wueste_01.png, assets/terrain/steinige_wueste_02.png, assets/terrain/steinige_wueste_03.png, assets/terrain/steinige_wueste_04.png, assets/terrain/stormy_ocean_01.png, assets/terrain/stormy_ocean_02.png, assets/terrain/stormy_ocean_03.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_05.png, assets/terrain/stormy_ocean_06.png, assets/terrain/stormy_ocean_07.png, assets/terrain/stormy_ocean_08.png, assets/terrain/sumpf_01.png, assets/terrain/sumpf_02.png, assets/terrain/sumpf_03.png, assets/terrain/sumpf_04.png, assets/terrain/tundra_base_01.png, assets/terrain/tundra_base_02.png, assets/terrain/tundra_base_03.png, assets/terrain/tundra_base_04.png, assets/terrain/wald_01.png, assets/terrain/wald_02.png, assets/terrain/wald_03.png
- preparation: Ground-Abhängigkeitsentscheidungen {"global":1}
  - global: 5 Dateien, 54 Hexfelder, null betroffene World-Tiles
- warm-pan: 37 Pool-Decodes ({"quality-upgrade":10,"repeat-decode":27}), 28 Pool-Evictions
- warm-pan: 10 image-ready-ground-Ereignisse; Quellen: assets/terrain/grassland_03.png, assets/terrain/halbwueste_03.png, assets/terrain/grassland_01.png, assets/terrain/grassland_04.png, assets/terrain/cosatal_water_04.png, assets/terrain/cosatal_water_01.png, assets/terrain/cosatal_water_02.png, assets/terrain/cosatal_water_03.png, assets/shorelines/shore_v105_edge_01.png, assets/shorelines/shore_v105_edge_02.png
- warm-pan: Ground-Abhängigkeitsentscheidungen {"selective":2}
  - selective: 8 Dateien, 145 Hexfelder, 108 betroffene World-Tiles
  - selective: 2 Dateien, 36 Hexfelder, 70 betroffene World-Tiles
- warm-zoom: 0 Pool-Decodes ({}), 28 Pool-Evictions
- warm-zoom: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-zoom: Ground-Abhängigkeitsentscheidungen {}

## 4x-Quellrevisionen pro Kachel

- preparation: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- preparation -1,0 mid: terrain (8 -> 16)
- warm-pan: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-zoom: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung

## Optionale visuelle Prüfbilder

- 01-zoom-before: images/4-01-zoom-before.png; Zoom 0.7; Scenery-Builds 8; READY true; manuelle Bildprüfung erforderlich
- 02-zoom-during: images/4-02-zoom-during.png; Zoom 0.77; Scenery-Builds 8; READY nicht geprüft; manuelle Bildprüfung erforderlich
- 03-zoom-settled: images/4-03-zoom-settled.png; Zoom 0.77; Scenery-Builds 9; READY true; manuelle Bildprüfung erforderlich
- 04-ocean-shore: images/4-04-ocean-shore.png; Zoom 0.7; Scenery-Builds 10; READY true; manuelle Bildprüfung erforderlich
- 05-fog-enabled: images/4-05-fog-enabled.png; Zoom 0.7; Scenery-Builds 10; READY nicht geprüft; manuelle Bildprüfung erforderlich

## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
