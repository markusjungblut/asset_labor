# Schritt 16A – Architektur-/Performanceaudit

**Status:** INSUFFICIENT_REAL_WARM_EVIDENCE
**Szene SHA-256:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Unabhängiger Szenenimport:** 4: 1328 ms; auto: 1300 ms
**Keine Renderingoptimierungen in diesem Lauf.**

## Produktionscompositor allein (statische 16 vorbereitete Tiles)

| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |
|---|---|---:|---:|---:|
| pan | ja | 50.1 | 0.86 | 0.4 |
| zoom | ja | 50.1 | 0.66 | 0.36 |

## Reale 397-Hex-Szene

| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |
|---|---|---|---:|---:|---:|---:|
| 4 | preparation | NEIN | – | 138 | 6 | 382.0 / 576.0 |
| 4 | warm-pan | UNGÜLTIG | – | 0 | 0 | 382.0 / 576.0 |
| 4 | warm-zoom | UNGÜLTIG | – | 0 | 0 | 382.0 / 576.0 |
| auto | preparation | NEIN | – | 181 | 6 | 157.0 / 288.0 |
| auto | warm-pan | UNGÜLTIG | – | 0 | 0 | 177.0 / 288.0 |
| auto | warm-zoom | UNGÜLTIG | – | 0 | 0 | 177.0 / 288.0 |

## Entscheidung

Investigate real scene preparation/readiness and asset lifetimes before changing backend
- No valid real warm run; cannot claim FPS improvement or choose rewrite
- Actual real camera still allocates/rebuilds or fails readiness

Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.
Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur
die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.
Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.
