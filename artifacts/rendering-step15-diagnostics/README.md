# Schritt 15 – Tile- und Kameradiagnose

**Status:** RECORDED; visual and hardware acceptance pending
**Szene:** 1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f
**Beobachtung, keine Optimierung:** Das Rendering wurde nicht absichtlich beschleunigt.
Weltkachel-/Snapshot-Ereignisse und Geländezuordnung sind Diagnosewerte, keine visuelle Freigabe.

## Pan/Zoom mit Tile-IDs und konkreten Cache-Miss-Gründen

| Qualität | Geste | Start ready | Ende ready | p95 (ms) | Main-Thread Task (s) | Terrain-Fallback-Aufrufe | Fallback-Terrainzeit (ms) | Ground-Reuse-Treffer | Ground-Reuse-Misses | Cache Misses | Lange Bakes |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 4 | pan | NEIN | NEIN | 282.02 | 12.71 | 40 | 6601 | 1 | 12 | 104 | 20 |
| 4 | zoom | NEIN | NEIN | 3482.1 | 28.75 | 8 | 1512.1 | 0 | 3 | 33 | 7 |
| auto | pan | NEIN | ja | 163.42 | 3.9 | 38 | 5592.4 | 1 | 14 | 42 | 20 |
| auto | zoom | ja | NEIN | 759.79 | 0.38 | 15 | 3541.6 | 0 | 0 | 23 | 15 |

## Auslösegründe der teuersten Kacheln

- 4/pan **-2,-1** / mid: 1021.5 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/pan **-1,0** / mid: 747.7 ms; Ergebnis fallback-ground-changed, Snapshot insufficient-snapshot-density
- 4/pan **0,-2** / mid: 731.7 ms; Ergebnis fallback-ground-changed, Snapshot not-painted
- 4/pan **0,-1** / mid: 633.7 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/pan **-2,0** / mid: 438.8 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/pan **-1,-1** / mid: 415.9 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/pan **-2,-1** / mid: 329.7 ms; Ergebnis fallback-ground-changed, Snapshot insufficient-snapshot-density
- 4/pan **-2,-1** / mid: 317.1 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **-1,-1** / mid: 445.9 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **-1,-2** / mid: 368.9 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **1,0** / mid: 338.6 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **-2,-1** / mid: 287.3 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **-1,-1** / mid: 275.8 ms; Ergebnis fallback-ground-changed, Snapshot not-painted
- 4/zoom **1,-2** / mid: 137.9 ms; Ergebnis fallback-complete, Snapshot not-painted
- 4/zoom **-1,-2** / mid: 130.3 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/pan **-1,0** / mid: 543.9 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/pan **0,-1** / mid: 530.6 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/pan **0,0** / mid: 522.3 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/pan **-2,-1** / mid: 321.1 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/pan **-2,-2** / mid: 315.4 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/pan **-1,-1** / mid: 260.8 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/pan **-2,-2** / mid: 233.5 ms; Ergebnis fallback-ground-changed, Snapshot insufficient-snapshot-density
- auto/pan **-2,-1** / mid: 228.2 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/zoom **-1,-1** / mid: 940.1 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/zoom **1,-1** / mid: 726.8 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/zoom **-2,-1** / mid: 537.7 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/zoom **-2,0** / mid: 508.8 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/zoom **-1,1** / mid: 470.0 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/zoom **0,0** / mid: 426.1 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density
- auto/zoom **1,1** / mid: 348.8 ms; Ergebnis fallback-complete, Snapshot not-painted
- auto/zoom **0,1** / mid: 346.1 ms; Ergebnis fallback-complete, Snapshot insufficient-snapshot-density

## Kamera/Geografie (Soll ist Szenen-JSON, Ist ist editorseitiger Geländetyp)

| Region | Soll Hex | Kameramitte Hex | Soll-Biom | Effektives Biom | gleich? | Fog-Zentrum |
|---|---|---|---|---|---|---|
| center | 0,0 | 0,0 | grassland | grassland | ja | 0,0 |
| dense-forest | -3,0 | -3,0 | grassland | grassland | ja | 0,0 |
| coast | 1,3 | 1,3 | grassland | grassland | ja | 0,0 |
| mountains | -10,3 | -10,3 | highland | highland | ja | 0,0 |
| moor | -7,4 | -7,4 | moor | moor | ja | 0,0 |
| open-water | -4,5 | -4,5 | ocean | ocean | ja | 0,0 |

## Entscheidungsregel

- Quelle des nächsten Eingriffs ist die tatsächliche Ereigniszeitlinie in result.json, nicht die subjektive Wirkung des Screenshots.
- Step 16 erst nach Prüfung von Tile-ID, Cache-Miss- und Invalidierungsgrund auf der Zielhardware.
- Falls Trace-Ereignisse verworfen wurden, Diagnosetest kürzer ausführen; dropped ist kein Fehler in der Renderinglogik.
- Readiness-gate false bleibt diagnostisch und darf nicht in FPS-Abnahme einfließen.
- Die aufgezeichneten Zeitspannen beinhalten ggf. Wartezeit und verschachtelte Arbeit; keine Summen über Kategorien bilden.
- Byte-/Pixelvergleich für Wasser, Fog und Höhen über PNGs separat durchführen.

Alle Ereignisse, Tile-IDs und Revisionen stehen in result.json; Screenshots im Verzeichnis images/.
