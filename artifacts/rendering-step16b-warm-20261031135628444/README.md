# Schritt 16A – Architektur-/Performanceaudit

**Status:** REAL_WARM_MEASURED
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 594 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 66.66 | 0.7 | 0.4 |
| zoom | ja | 43.4 | 0.5 | 0.3 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | bereit | – | 30 | 10 | 397.0 / 576.0 |
| 4 | warm-pan | gültig | 16.8 | 0 | 0 | 436.5 / 576.0 |
| 4 | warm-zoom | gültig | 16.8 | 0 | 0 | 429.8 / 576.0 |

## Vorbereitung der tatsächlichen Pan-/Zoom-Strecken

- 4/warm-pan: vorbereitet; Quellen 194; fehlend 0; nicht vollständig geladen/hochgestuft 0; reservierte World-Tiles 16/16; WorldTile-Quellrevisionen abweichend 0; WorldTile-Pixel über Budget 0; Ground-Pixel (reserviert) 8205120; Scenery-Pixel (reserviert) 7683350; unreservierte Cache-Pixel 0; Raster-Zählabweichungen 0; Stichprobenpositionen 20; vorbereitete Kamerapositionen 20/20; idle evicted during preparation 11; decoded / budget MiB 576.0 / 576.0
- 4/warm-zoom: vorbereitet; Quellen 191; fehlend 0; nicht vollständig geladen/hochgestuft 0; reservierte World-Tiles 16/16; WorldTile-Quellrevisionen abweichend 0; WorldTile-Pixel über Budget 0; Ground-Pixel (reserviert) 8205120; Scenery-Pixel (reserviert) 7683350; unreservierte Cache-Pixel 0; Raster-Zählabweichungen 0; Stichprobenpositionen 20; vorbereitete Kamerapositionen 20/20; idle evicted during preparation 0; decoded / budget MiB 576.0 / 576.0

## Warum reale Kameraphasen nicht warm sind


## Ground-Asset-Invalidierungen nach konkreter Bilddatei

- preparation: 354 Pool-Decodes ({"first-decode":270,"repeat-decode":79,"quality-upgrade":5}), 132 Pool-Evictions
- preparation: 49 image-ready-ground-Ereignisse; Quellen: assets/terrain/savanne_01.png, assets/terrain/savanne_04.png, assets/terrain/savanne_03.png, assets/terrain/schneefeld_01.png, assets/terrain/schneefeld_02.png, assets/terrain/schneefeld_03.png, assets/terrain/schneefeld_04.png, assets/terrain/steinige_badlands_01.png, assets/terrain/steinige_badlands_02.png, assets/terrain/steinige_badlands_03.png, assets/terrain/steinige_badlands_04.png, assets/terrain/steinige_wueste_02.png, assets/terrain/steinige_wueste_01.png, assets/terrain/steinige_wueste_03.png, assets/terrain/steinige_wueste_04.png, assets/terrain/stormy_ocean_01.png, assets/terrain/stormy_ocean_02.png, assets/terrain/stormy_ocean_03.png, assets/terrain/stormy_ocean_04.png, assets/terrain/stormy_ocean_05.png, assets/terrain/stormy_ocean_06.png, assets/terrain/stormy_ocean_07.png, assets/terrain/stormy_ocean_08.png, assets/terrain/sumpf_01.png, assets/terrain/sumpf_02.png, assets/terrain/sumpf_03.png, assets/terrain/sumpf_04.png, assets/terrain/tundra_base_01.png, assets/terrain/tundra_base_02.png, assets/terrain/tundra_base_03.png, assets/terrain/tundra_base_04.png, assets/terrain/wald_01.png, assets/terrain/wald_02.png, assets/terrain/wald_03.png, assets/terrain/wald_04.png, assets/terrain/weideland_01.png, assets/terrain/weideland_02.png, assets/terrain/weideland_03.png, assets/terrain/weideland_04.png, assets/terrain/wueste_01.png, assets/terrain/wueste_02.png, assets/nature/berg_01.png, assets/terrain/wueste_03.png, assets/terrain/wueste_04.png, assets/shorelines/shore_v105_edge_01.png, assets/shorelines/shore_v105_edge_02.png, assets/shorelines/shore_v105_edge_03.png, assets/shorelines/shore_v105_edge_04.png, assets/shorelines/shore_v105_edge_05.png
- preparation: Ground-Abhängigkeitsentscheidungen {"global":1,"selective":2}
  - global: 2 Dateien, 36 Hexfelder, null betroffene World-Tiles
  - selective: 1 Dateien, 16 Hexfelder, 44 betroffene World-Tiles
  - selective: 2 Dateien, 31 Hexfelder, 68 betroffene World-Tiles
- warm-pan: 0 Pool-Decodes ({}), 0 Pool-Evictions
- warm-pan: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-pan: Ground-Abhängigkeitsentscheidungen {}
- warm-zoom: 0 Pool-Decodes ({}), 0 Pool-Evictions
- warm-zoom: 0 image-ready-ground-Ereignisse; Quellen: 
- warm-zoom: Ground-Abhängigkeitsentscheidungen {}

## 4x-Quellrevisionen pro Kachel

- preparation: 2 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- preparation 1,0 mid: shore (11 -> 11)
- preparation 0,-1 mid: shore (3 -> 3)
- preparation 1,-1 mid: shore (9 -> 9)
- preparation -1,0 mid: shore (4 -> 4)
- preparation 0,-1 mid: shore (3 -> 3)
- warm-pan: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-zoom: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung

## Optionale visuelle Prüfbilder

- 01-zoom-before: images/4-01-zoom-before.png; Zoom 0.7; Scenery-Builds 18; READY true; manuelle Bildprüfung erforderlich
- 02-zoom-during: images/4-02-zoom-during.png; Zoom 0.77; Scenery-Builds 18; READY nicht geprüft; manuelle Bildprüfung erforderlich
- 03-zoom-settled: images/4-03-zoom-settled.png; Zoom 0.77; Scenery-Builds 19; READY true; manuelle Bildprüfung erforderlich
- 04-ocean-shore: images/4-04-ocean-shore.png; Zoom 0.7; Scenery-Builds 20; READY true; manuelle Bildprüfung erforderlich
- 05-fog-enabled: images/4-05-fog-enabled.png; Zoom 0.7; Scenery-Builds 20; READY nicht geprüft; manuelle Bildprüfung erforderlich

## Entscheidung

Compare compositor-only and real-warm frame timing and memory; prioritize measured deltas

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
