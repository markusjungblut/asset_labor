# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1237 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 60.06 | 0.75 | 0.4 |
| zoom | ja | 33.4 | 0.4 | 0.2 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | NEIN | – | 132 | 7 | 380.8 / 576.0 |
| 4 | warm-pan | warm-candidate | 60.06 | 34 | 2 | 386.3 / 576.0 |
| 4 | warm-zoom | warm-candidate | 126.76 | 11 | 5 | 390.8 / 576.0 |

## Warum reale Kameraphasen nicht warm sind

- 4/warm-pan: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":91,"tile.evict":2,"tile.cache-miss":37,"tile.state":267,"tile.source-start":34,"tile.snapshot":5,"tile.bake":34,"tile.accept":4,"tile.source-end":34,"asset.invalidate":34,"tile.invalidate":2,"terrain.draw":4,"roads.draw":4,"scenery.invalidate":1,"fog.mask":1,"camera.mode-retained":1}; CPU-Taskzeit: 5.43 s; rAF-p95: 60.06 ms (nur Kalt-Diagnose)
- 4/warm-zoom: warm-candidate; Gate-Gründe: asset/tile work occurred during camera-only test; nicht bereite Editor-Cores: –; Bilddateien noch ausstehend: –
  - Quellursachen: {}
  - Tile-Ereignisse: {"camera.request":90,"tile.evict":1,"tile.cache-miss":11,"tile.state":195,"tile.source-start":11,"tile.snapshot":11,"terrain.draw":6,"roads.draw":6,"tile.bake":11,"tile.accept":10,"tile.source-end":11,"asset.invalidate":27,"tile.ground-revision-detail":4,"tile.ground-revision-changed":4,"tile.invalidate":5,"tile.ground-revision-deferred":2,"scenery.invalidate":1,"fog.mask":1,"camera.mode-retained":1}; CPU-Taskzeit: 5 s; rAF-p95: 126.76 ms (nur Kalt-Diagnose)

## 4x-Quellrevisionen pro Kachel

- preparation: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- preparation -1,0 mid: terrain (3 -> 12)
- warm-pan: 0 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-zoom: 2 temporäre Road/River-pending-Verluste ohne Cache-Invalidierung
- warm-zoom -1,-2 mid: road (37 -> 37)
- warm-zoom -2,-2 mid: road,river (43 -> 43)
- warm-zoom -2,-1 mid: road,river (36 -> 36)
- warm-zoom 1,-2 mid: road,river (44 -> 44)

## Optionale visuelle Prüfbilder


## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
