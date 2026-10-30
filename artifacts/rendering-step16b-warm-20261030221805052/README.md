# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1514 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.8 | 0.8 | 0.4 |
| zoom | ja | 50 | 0.5 | 0.2 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | bereit | – | 22 | 8 | 383.3 / 576.0 |
| 4 | warm-pan | warm-candidate | 27.36 | 3 | 1 | 420.8 / 576.0 |
| 4 | warm-zoom | warm-candidate | 26.7 | 1 | 0 | 398.3 / 576.0 |

## Vorbereitung der tatsächlichen Pan-/Zoom-Strecken

- 4/warm-pan: vorbereitet; Quellen 187; fehlend 0; nicht vollständig geladen/hochgestuft 0; vorbereitete Kamerapositionen 3/3; idle evicted during preparation 122; decoded / budget MiB 576.0 / 576.0
- 4/warm-zoom: vorbereitet; Quellen 177; fehlend 0; nicht vollständig geladen/hochgestuft 0; vorbereitete Kamerapositionen 2/2; idle evicted during preparation 8; decoded / budget MiB 576.0 / 576.0

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; angefragte unbereite World-Cores: –; unbereite Overscan-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":2,"tile.cache-miss":3,"tile.state":10,"tile.source-start":3,"tile.snapshot":3,"tile.bake":3,"tile.accept":3,"tile.source-end":3,"terrain.draw":2,"roads.draw":2,"asset.pool-ready":10,"asset.redecode-identical":10,"tile.ground-revision-detail":1,"tile.ground-revision-changed":1,"tile.invalidate":1,"tile.stale-retained":1,"tile.ground-revision-deferred":3}; CPU-Taskzeit: 0.95 s; rAF-p95: 27.36 ms (nur Kalt-Diagnose)
- 4/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; angefragte unbereite World-Cores: –; unbereite Overscan-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":89,"tile.evict":1,"tile.cache-miss":1,"tile.state":3,"tile.source-start":1,"tile.snapshot":1,"tile.bake":1,"tile.accept":1,"tile.source-end":1}; CPU-Taskzeit: 0.38 s; rAF-p95: 26.7 ms (nur Kalt-Diagnose)

## Ground-Asset-Invalidierungen nach konkreter Bilddatei

- preparation: 374 Pool-Decodes ({"first-decode":302,"repeat-decode":61,"quality-upgrade":6,"source-change":5}), 119 Pool-Evictions
- preparation: 86 image-ready-ground-Ereignisse; Quellen: assets/terrain/karges_weideland_03.png, assets/terrain/karges_weideland_04.png, assets/terrain/lehmwueste_01.png, assets/terrain/lehmwueste_02.png, assets/terrain/lehmwueste_03.png, assets/terrain/lehmwueste_04.png, assets/terrain/marshland_01.png, assets/terrain/marshland_02.png, assets/terrain/marshland_03.png, assets/terrain/marshland_04.png, assets/terrain/moor_01.png, assets/terrain/moor_02.png, assets/terrain/moor_03.png, assets/terrain/moor_04.png, assets/terrain/ocean_01.png, assets/terrain/ocean_02.png, assets/terrain/ocean_03.png, assets/terrain/ocean_04.png, assets/terrain/oedland_01.png, assets/terrain/oedland_02.png, assets/terrain/oedland_03.png, assets/terrain/oedland_04.png, assets/terrain/sandige_steinige_wueste_01.png, assets/terrain/sandige_steinige_wueste_02.png, assets/terrain/sandige_steinige_wueste_03.png, assets/terrain/sandige_steinige_wueste_04.png, assets/terrain/sandy_badlands_01.png, assets/terrain/sandy_badlands_02.png, assets/terrain/sandy_badlands_03.png, assets/terrain/sandy_badlands_04.png, assets/terrain/savanne_01.png, assets/terrain/savanne_02.png, assets/terrain/savanne_03.png, assets/terrain/savanne_04.png, assets/terrain/schneefeld_01.png, assets/terrain/schneefeld_02.png, assets/terrain/schneefeld_03.png, assets/terrain/schneefeld_04.png, assets/terrain/steinige_badlands_01.png, assets/terrain/steinige_badlands_02.png, assets/terrain/steinige_badlands_03.png, assets/terrain/steinige_badlands_04.png, assets/terrain/steinige_wueste_01.png, assets/terrain/steinige_wueste_02.png, assets/terrain/steinige_wueste_03.png, assets/terrain/steinige_wueste_04.png, assets/terrain/stormy_ocean_01.png, assets/terrain/stormy_ocean_02.png, assets/terrain/stormy_ocean_03.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_05.png, assets/terrain/stormy_ocean_06.png, assets/terrain/stormy_ocean_07.png, assets/terrain/stormy_ocean_08.png, assets/terrain/sumpf_01.png, assets/terrain/sumpf_02.png, assets/terrain/sumpf_03.png, assets/terrain/sumpf_04.png, assets/terrain/tundra_base_01.png, assets/terrain/tundra_base_02.png
- preparation: Ground-Abhängigkeitsentscheidungen {"global":1,"selective":1}
  - global: 5 Dateien, 56 Hexfelder, null betroffene World-Tiles
  - selective: 7 Dateien, 58 Hexfelder, 89 betroffene World-Tiles
- warm-pan: 10 Pool-Decodes ({"repeat-decode":10}), 0 Pool-Evictions
- warm-pan: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-pan: Ground-Abhängigkeitsentscheidungen {}
- warm-zoom: 0 Pool-Decodes ({}), 0 Pool-Evictions
- warm-zoom: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-zoom: Ground-Abhängigkeitsentscheidungen {}

## 4x-Quellrevisionen pro Kachel

- preparation: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- preparation 0,-1 mid: terrain (6 -> 15)
- warm-pan: 3 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-pan -1,-2 mid: road (38 -> 38)
- warm-zoom: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung

## Optionale visuelle Prüfbilder

- 01-zoom-before: images/4-01-zoom-before.png; Zoom 0.7; Scenery-Builds 10; READY true; manuelle Bildprüfung erforderlich
- 02-zoom-during: images/4-02-zoom-during.png; Zoom 0.77; Scenery-Builds 10; READY nicht geprüft; manuelle Bildprüfung erforderlich
- 03-zoom-settled: images/4-03-zoom-settled.png; Zoom 0.77; Scenery-Builds 11; READY true; manuelle Bildprüfung erforderlich
- 04-ocean-shore: images/4-04-ocean-shore.png; Zoom 0.7; Scenery-Builds 12; READY true; manuelle Bildprüfung erforderlich
- 05-fog-enabled: images/4-05-fog-enabled.png; Zoom 0.7; Scenery-Builds 12; READY nicht geprüft; manuelle Bildprüfung erforderlich

## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
