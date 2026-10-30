# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1302 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.7 | 0.7 | 0.4 |
| zoom | ja | 33.4 | 0.4 | 0.2 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | bereit | – | 25 | 8 | 385.8 / 576.0 |
| 4 | warm-pan | warm-candidate | 173.6 | 2 | 1 | 388.3 / 576.0 |
| 4 | warm-zoom | warm-candidate | 16.8 | 1 | 0 | 390.8 / 576.0 |

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":90,"tile.evict":1,"tile.cache-miss":17,"tile.state":366,"tile.source-start":3,"tile.snapshot":3,"terrain.draw":2,"roads.draw":2,"tile.bake":2,"tile.accept":1,"tile.source-end":2,"asset.invalidate":27,"tile.invalidate":1,"ground.asset-dependency":1,"scenery.invalidate":1,"fog.mask":1,"camera.mode-retained":1,"tile.source-deferred":23}; CPU-Taskzeit: 2.35 s; rAF-p95: 173.6 ms (nur Kalt-Diagnose)
- 4/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":1,"tile.cache-miss":1,"tile.state":3,"tile.source-start":1,"tile.snapshot":1,"tile.bake":1,"tile.accept":1,"tile.source-end":1}; CPU-Taskzeit: 0.3 s; rAF-p95: 16.8 ms (nur Kalt-Diagnose)

## Globale Ground-Invalidierungen nach konkreter Bilddatei

- preparation: 85 image-ready-ground-Ereignisse; Quellen: assets/terrain/karges_weideland_02.png, assets/terrain/karges_weideland_03.png, assets/terrain/karges_weideland_04.png, assets/terrain/lehmwueste_01.png, assets/terrain/lehmwueste_02.png, assets/terrain/lehmwueste_03.png, assets/terrain/lehmwueste_04.png, assets/terrain/marshland_01.png, assets/terrain/marshland_02.png, assets/terrain/marshland_03.png, assets/terrain/marshland_04.png, assets/terrain/moor_01.png, assets/terrain/moor_02.png, assets/terrain/moor_03.png, assets/terrain/moor_04.png, assets/terrain/ocean_01.png, assets/terrain/ocean_02.png, assets/terrain/ocean_03.png, assets/terrain/ocean_04.png, assets/terrain/oedland_01.png, assets/terrain/oedland_02.png, assets/terrain/oedland_03.png, assets/terrain/oedland_04.png, assets/terrain/sandige_steinige_wueste_01.png, assets/terrain/sandige_steinige_wueste_02.png, assets/terrain/sandige_steinige_wueste_03.png, assets/terrain/sandige_steinige_wueste_04.png, assets/terrain/sandy_badlands_01.png, assets/terrain/sandy_badlands_02.png, assets/terrain/sandy_badlands_03.png, assets/terrain/sandy_badlands_04.png, assets/terrain/savanne_01.png, assets/terrain/savanne_02.png, assets/terrain/savanne_03.png, assets/terrain/savanne_04.png, assets/terrain/schneefeld_01.png, assets/terrain/schneefeld_02.png, assets/terrain/schneefeld_03.png, assets/terrain/schneefeld_04.png, assets/terrain/steinige_badlands_01.png, assets/terrain/steinige_badlands_02.png, assets/terrain/steinige_badlands_03.png, assets/terrain/steinige_badlands_04.png, assets/terrain/steinige_wueste_01.png, assets/terrain/steinige_wueste_02.png, assets/terrain/steinige_wueste_03.png, assets/terrain/steinige_wueste_04.png, assets/terrain/stormy_ocean_01.png, assets/terrain/stormy_ocean_02.png, assets/terrain/stormy_ocean_03.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_05.png, assets/terrain/stormy_ocean_06.png, assets/terrain/stormy_ocean_07.png, assets/terrain/stormy_ocean_08.png, assets/terrain/sumpf_01.png, assets/terrain/sumpf_02.png, assets/terrain/sumpf_03.png, assets/terrain/sumpf_04.png, assets/terrain/tundra_base_01.png
- preparation: Ground-Abhängigkeitsentscheidungen {"global":1,"selective":2}
  - global: 5 Dateien, 56 Hexfelder, null betroffene World-Tiles
  - selective: 2 Dateien, 38 Hexfelder, 78 betroffene World-Tiles
  - selective: 2 Dateien, 30 Hexfelder, 85 betroffene World-Tiles
- warm-pan: 24 image-ready-ground-Ereignisse; Quellen: assets/terrain/schneefeld_04.png, assets/terrain/tundra_base_04.png, assets/terrain/icy_ocean_02.png, assets/terrain/icy_ocean_03.png, assets/terrain/schneefeld_03.png, assets/terrain/frozen_tundra_base_04.png, assets/terrain/frozen_tundra_base_02.png, assets/terrain/frozen_tundra_base_01.png, assets/terrain/frozen_tundra_base_03.png, assets/terrain/halbwueste_03.png, assets/terrain/hochland_01.png, assets/terrain/hochland_02.png, assets/terrain/hochland_03.png, assets/terrain/grassland_03.png, assets/terrain/sandy_badlands_02.png, assets/terrain/sandy_badlands_04.png, assets/terrain/hochland_04.png, assets/terrain/oedland_02.png, assets/terrain/oedland_03.png, assets/terrain/moor_04.png, assets/terrain/ocean_02.png, assets/terrain/stormy_ocean_08.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_06.png
- warm-pan: Ground-Abhängigkeitsentscheidungen {"selective":1}
  - selective: 24 Dateien, 95 Hexfelder, 114 betroffene World-Tiles
- warm-zoom: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-zoom: Ground-Abhängigkeitsentscheidungen {}

## 4x-Quellrevisionen pro Kachel

- preparation: 2 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-pan: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-zoom: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung

## Optionale visuelle Prüfbilder

- 01-zoom-before: images/4-01-zoom-before.png; Zoom 0.7; Scenery-Builds 14; READY true; manuelle Bildprüfung erforderlich
- 02-zoom-during: images/4-02-zoom-during.png; Zoom 0.77; Scenery-Builds 14; READY nicht geprüft; manuelle Bildprüfung erforderlich
- 03-zoom-settled: images/4-03-zoom-settled.png; Zoom 0.77; Scenery-Builds 15; READY true; manuelle Bildprüfung erforderlich
- 04-ocean-shore: images/4-04-ocean-shore.png; Zoom 0.7; Scenery-Builds 17; READY true; manuelle Bildprüfung erforderlich
- 05-fog-enabled: images/4-05-fog-enabled.png; Zoom 0.7; Scenery-Builds 17; READY nicht geprüft; manuelle Bildprüfung erforderlich

## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
