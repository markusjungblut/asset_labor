# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1177 ms; auto: 1318 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.7 | 0.6 | 0.36 |
| zoom | ja | 33.5 | 0.4 | 0.2 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | NEIN | – | 155 | 6 | 380.8 / 576.0 |
| 4 | warm-pan | cold-diagnostic | 133.4 | 41 | 14 | 378.8 / 576.0 |
| 4 | warm-zoom | cold-diagnostic | 16.8 | 1 | 0 | 383.3 / 576.0 |
| auto | preparation | NEIN | – | 135 | 6 | 177.0 / 288.0 |
| auto | warm-pan | warm-candidate | 16.8 | 2 | 0 | 177.0 / 288.0 |
| auto | warm-zoom | warm-candidate | 16.8 | 1 | 0 | 177.0 / 288.0 |

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: cold-diagnostic; Gate-Gründe: tile-queue-pending:2; not-quiescent-before-sampling; asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: 10; Bilddateien noch ausstehend: 0
  - Quellursachen: {"terrain-not-painted":10}
  - Tile-Ereignisse: {"camera.request":94,"tile.cache-miss":49,"tile.state":157,"tile.ground-revision-detail":16,"tile.ground-revision-changed":13,"tile.invalidate":14,"terrain.draw":26,"roads.draw":26,"tile.bake":41,"tile.source-end":41,"tile.source-start":41,"tile.snapshot":30,"tile.accept":25,"asset.invalidate":24}; CPU-Taskzeit: 4.66 s; rAF-p95: 133.4 ms (nur Kalt-Diagnose)
- 4/warm-zoom: cold-diagnostic; Gate-Gründe: tile-queue-pending:3; not-quiescent-before-sampling; asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: 12; Bilddateien noch ausstehend: 0
  - Quellursachen: {"terrain-not-painted":12}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":1,"tile.cache-miss":1,"tile.state":3,"tile.source-start":1,"tile.snapshot":1,"tile.bake":1,"tile.accept":1,"tile.source-end":1}; CPU-Taskzeit: 0.33 s; rAF-p95: 16.8 ms (nur Kalt-Diagnose)
- auto/warm-pan: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":2,"tile.cache-miss":2,"tile.state":6,"tile.source-start":2,"tile.snapshot":2,"tile.bake":2,"tile.accept":2,"tile.source-end":2}; CPU-Taskzeit: 0.33 s; rAF-p95: 16.8 ms (nur Kalt-Diagnose)
- auto/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":1,"tile.cache-miss":1,"tile.state":3,"tile.source-start":1,"tile.snapshot":1,"tile.bake":1,"tile.accept":1,"tile.source-end":1}; CPU-Taskzeit: 0.35 s; rAF-p95: 16.8 ms (nur Kalt-Diagnose)

## 4x-Quellrevisionen pro Kachel

- preparation 0,-1 mid: terrain (7 -> 19)
- warm-pan 1,-1 mid: road (22 -> 22)
- warm-pan 1,-1 mid: road (22 -> 22)
- warm-pan -2,1 mid: road,river (34 -> 34)
- warm-pan 0,1 mid: road (32 -> 32)
- warm-pan -2,1 mid: road,river (34 -> 34)
- warm-pan -2,-2 mid: road,river (33 -> 33)
- warm-pan 0,1 mid: road (32 -> 32)
- warm-pan -2,-1 mid: road,river (29 -> 29)
- warm-pan 1,1 mid: road (35 -> 35)
- warm-pan -1,-2 mid: road (23 -> 23)
- warm-pan -2,-1 mid: road,river (29 -> 29)
- warm-pan -1,-2 mid: road (23 -> 23)
- warm-pan 1,-2 mid: road,river (24 -> 24)
- warm-pan 1,-1 mid: road (22 -> 22)
- warm-pan 0,0 mid: terrain (21 -> 40)
- warm-pan 0,-1 mid: terrain (20 -> 41)

## Optionale visuelle Prüfbilder

- 01-zoom-before: images/01-zoom-before.png; Zoom 0.7; Scenery-Builds 8; READY true; manuelle Bildprüfung erforderlich
- 02-zoom-during: images/02-zoom-during.png; Zoom 0.77; Scenery-Builds 8; READY nicht geprüft; manuelle Bildprüfung erforderlich
- 03-zoom-settled: images/03-zoom-settled.png; Zoom 0.77; Scenery-Builds 9; READY true; manuelle Bildprüfung erforderlich
- 04-ocean-shore: images/04-ocean-shore.png; Zoom 0.7; Scenery-Builds 10; READY true; manuelle Bildprüfung erforderlich
- 05-fog-enabled: images/05-fog-enabled.png; Zoom 0.7; Scenery-Builds 10; READY nicht geprüft; manuelle Bildprüfung erforderlich

## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
