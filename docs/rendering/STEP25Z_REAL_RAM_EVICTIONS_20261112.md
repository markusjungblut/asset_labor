# Schritt 25Z – Reale Firefox-Cache-Verdrängungen mit 1×-/2×-Tiles

**Datum:** 12. November 2026  
**Draft-PR:** #136 auf #135 → #134 → #133 → #132 → #131 → #130 → #129 → #128.  
**Entscheidung:** `lodRecency=1` bleibt die aktuelle experimentelle Viewer-Voreinstellung; `parallelDecode=0` bleibt ausdrücklich Standard. Der gesamte PR-Stapel bleibt Draft und ungemergt.

## Fragestellung

Schritt 25Y verglich synthetische glatte, texturierte und hochaufgelöste PNG-Pakete bei echtem IndexedDB- und Canvas-Rendering. Die zwölf A/B-Fahrten dort erzeugten jedoch **null Cache-Evictions**. Darum konnte man daraus nicht ableiten, wie gut die Regeln bei einer längeren Kamerarückfahrt, unter wechselnden 1×-/2×-Zoomstufen und knappem Bitmap-RAM funktionieren.

Der Test `tests/automated_browser_ram_churn.cjs` ergänzt genau diesen bisher fehlenden Gegenfall, ohne den Spielkarten-Renderer selbst zu verändern.

## Testarchitektur

In einem **isolierten Playwright-Firefox-Origin** wird vorab eine eigene CI-IndexedDB `vedras-ci-step25z-ram-churn-v1` aufgebaut. Sie enthält **161 fertige Kartenkacheln** (23 Spalten × 7 Zeilen) und **322 gespeicherte PNG-Variant-Pakete**, deren Ground- und Scenery-Layer unabhängig dekodiert werden können:

| Variante | Ground | Scenery | Dekodierte Pixel je Tile-Paket |
|---|---:|---:|---:|
| 1× | 256 × 256 | 384 × 384 | 212.992 |
| 2× | 512 × 512 | 768 × 768 | 851.968 |

Der Renderer verwendet ausschließlich `storage.getVariant(key, variant)` mit **echten IndexedDB-Readonly-Transaktionen**, tatsächliche PNG-Blobs, `createImageBitmap` und sein normales Canvas-/Fog-Rendering. Der Speicher wird über `maxDecodedPixels=10.000.000` begrenzt, nicht durch eine künstliche Beschränkung der PNG-Dateigröße.

Die Kamera durchläuft **18 Posen**: ausgehend von `zoom=.85, panX=0` wechselnde 1×-/2×-Zooms (bei `zoom=.5` bzw. `.85`), Schwenks bis `panX=-2600` und dieselben Bereiche auf dem Rückweg, zuletzt wieder bei `zoom=.85, panX=0`. Vor der nächsten Pose wartet der Test, bis alle sichtbaren Bilder der verlangten LOD vollständig bereit sind; legitimes Offscreen-Prefetch darf weiterhin laufen.

Es werden **zwei getrennte ABBA-Vergleiche** gefahren:

1. **LOD-Rezency:** `lodRecency=0/1/1/0`, stets sequentielle Ground-/Scenery-Dekodierung.
2. **Layer-Parallelität:** `parallelDecode=0/1/1/0`, stets `lodRecency=1`.

Damit gibt es **acht echte Firefox-Kamerafahrten**. Der Test gilt nur, wenn *jede* Variante sowohl `evictions>0` als auch `decodeRepeats>0` produziert. Außerdem kontrolliert er das Pixel-RAM-Limit, alle sichtbaren LOD-Zielzustände, die Zahl der LOD-Wechsel, Fehlerfreiheit und **exakte Gleichheit der finalen Canvas-Hashes**.

## Gemessene Ergebnisse

Erfolgreicher Lauf: [GitHub Actions #43215677362](https://github.com/markusjungblut/asset_labor/actions/runs/43215677362), Code-Commit [`793a8e5`](https://github.com/markusjungblut/asset_labor/commit/793a8e558a95de8896f3f2156e52650aa12f7292).

### A/B 1 – Historie der letzten sichtbaren Zoomstufe

| Einstellung | Evictions | Wiederholte PNG-Tile-Dekodierungen | Sichtbare Tile-Read-Starts | Median vollständige Sichtbarkeit je Lauf |
|---|---:|---:|---:|---:|
| `lodRecency=0`, Fahrt 1 | 94 | 42 | 114 | 81 ms |
| `lodRecency=1`, Fahrt 1 | 83 | 32 | 104 | 66 ms |
| `lodRecency=1`, Fahrt 2 | 83 | 32 | 104 | 68 ms |
| `lodRecency=0`, Fahrt 2 | 94 | 42 | 114 | 82 ms |

**Mittel der Laufmediane:** `lodRecency=0` **81,5 ms**, `lodRecency=1` **67 ms** (−14,5 ms bzw. rund −18 %). **10 weniger Re-Decodes (−24 %)** und **11 weniger Evictions (−12 %)**, dazu **10 weniger sichtbare Tile-Leseanfänge**, in *beiden* unabhängig nacheinander durchgeführten ABBA-Proben.

Das ist ein **tatsächlicher Browser-Nachweis** unter Cache-Verdrängungsdruck für die in Draft #130 eingeführte LOD-Verdrängungsregel; er ist dennoch keine Messung der privaten Originalkarte.

### A/B 2 – Parallelisierung bei denselben Evictions

| Einstellung | Evictions | Wiederholte Tile-Dekodierungen | Median vollständige Sichtbarkeit je Lauf |
|---|---:|---:|---:|
| `parallelDecode=0`, Fahrt 1 | 83 | 32 | 59 ms |
| `parallelDecode=1`, Fahrt 1 | 83 | 32 | 67 ms |
| `parallelDecode=1`, Fahrt 2 | 83 | 32 | 71 ms |
| `parallelDecode=0`, Fahrt 2 | 83 | 32 | 73 ms |

**Mittel der Laufmediane:** sequentiell **66 ms**, parallel **69 ms**. Parallelität beeinflusste hier weder die Anzahl der verdrängten Bitmaps noch die Re-Decodes. Die sichtbare Bereitschaft war im Mittel **3 ms langsamer**, wobei die beiden Einzelfahrten schwanken. Diese Daten sprechen **nicht** für eine Änderung der sequentiellen Standardeinstellung.

### RAM-/Pixel-Invarianten

Alle acht Fahrten hatten **> 0 Evictions** und **> 0 Wiederholungsdekodierungen**; das fehlende Testziel aus 25Y ist damit nun tatsächlich erreicht. Der beobachtete Spitzenwert lag bei **9.797.632 dekodierten Pixeln** und blieb damit unter `maxDecodedPixels=10.000.000`. Das finale Canvas war über **alle acht** Varianten pixelhash-identisch. Keine fehlerhaften IndexedDB-Transaktionen, PNG-Decodes oder Layer-Reihenfolgen wurden gemeldet.

## CI, Messgrenzen und weiteres Vorgehen

[CI #43215677362](https://github.com/markusjungblut/asset_labor/actions/runs/43215677362): **95/95 Node-Tests**, komplette bisherige Headless-Firefox-Regression mit Pan, Fog, Cache und 1×/2×, die vorausgehenden 25V-/25W-/25X-/25Y-Benchmarks sowie der neue echte 1×-/2×-Stressfall **erfolgreich**. Die vollständigen Einzelmesspunkte werden als `test-artifacts/firefox-ram-churn.json` im vorhandenen CI-Artefaktpaket hochgeladen.

Trotz **echter IndexedDB-/PNG-/Canvas-Ausführung** bleiben die Testkacheln **synthetisch**, mit wenigen wiederverwendeten Bildmustern und reproduzierbarer Kameraroute. Es fehlen echte Windows-GPU-Präsentationszeiten, Frame-p95, der originale 397-Hex-Atlas und dessen echte PNG-Kapazitäten. Die Ergebnisse zeigen eine reale Ressourcen- und *sichtbare Bereitschaft*-Verbesserung in diesem Testfall, aber **keine garantierte allgemeine FPS-Steigerung**.

Die getestete `lodRecency`-Strategie ist bereits der experimentelle Default in Draft #130, eine neue Produktivcodeänderung ist daher **nicht erforderlich**. `parallelDecode` bleibt **abgeschaltet**. Der sinnvolle nächste Schritt ist eine Windows-Originalkarten-Kontrollfahrt (Pixel/Fog, RAM, Frame-p95) oder – wenn der PC weiter unzugänglich bleibt – zunächst **keine weitere spekulative Cache-Mechanik**.

PR #136 ist test-/CI-only. Er bleibt auf #135 gestapelt, genauso wie alle Vorgänger als Draft. `main`, der Originalatlas und mögliche lokal uncommittete Windows-Dateien bleiben unverändert.
