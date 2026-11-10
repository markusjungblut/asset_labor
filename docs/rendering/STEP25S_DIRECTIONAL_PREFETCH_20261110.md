# Schritt 25S – Richtungsabhängiges Vorladen fertiger Kartenkacheln

**Datum:** 10. November 2026  
**Branch:** `perf/step25s-directional-prefetch-20261110`  
**Abhängigkeit:** Draft-PR #128 (statische Tile-/Hexmetadaten). Die experimentelle Index-Änderung aus PR #127 ist **nicht** Voraussetzung.

## Konkreter Engpass

Der bisherige Frozen-Viewer wählt vorhandene Kacheln außerhalb des sichtbaren Bildausschnitts anhand ihrer Distanz zur Bildschirmmitte. Selbst bei maximal **einem** spekulativen Ladevorgang (`MAX_SPECULATIVE=1`) kann bei einer Kamerafahrt eine Kachel **hinter** der Bewegung den einzigen freien Hintergrund-Leseslot beanspruchen. Zugleich können vorne neue, sichtbare Tile-Reads beginnen. Ein erneutes Einlesen und Dekodieren kostet CPU-Zeit, Bandbreite und eventuell Cache-Evictions.

Das Terrain ist dabei bereits vollständig gebacken und als PNG/abgeleitete 1×-/2×-Kachel vorhanden; **keine** Terrain-Arbeit findet in diesem Viewer statt.

## Änderung (ausschließlich read-only Viewer)

- Bei einer Pan-Bewegung von mindestens sechs CSS-Pixeln zwischen zwei Zeichnungen wird aus der Differenz der alten/neuen Bildschirmposition die neue Bewegungsrichtung bestimmt.
- Im bestehenden, nach Abstand sortierten Prefetch-Kandidatenfeld werden nur Offscreen-Kacheln **vor** dieser Bewegungsrichtung für eine spekulative `read()`-Anfrage zugelassen. Hinter dem Kamerapfad liegende Kandidaten werden nur während der aktiven Bewegung zurückgestellt.
- Nach dem Ende einer Kamerabewegung gilt die Richtung noch für bis zu **fünf stationäre Zeichnungen**, danach automatisch wieder die alte Distanz-Priorisierung. Ein Zoom-/DPR-Wechsel löscht die Richtung sofort.
- Bei `prefetchGuard=0`, während Zoom-Preview oder mit `leadPrefetch=0` bleibt die alte Prefetch-Zulassung unverändert.
- Sichtbare Tile-Reads haben weiterhin Vorrang. Bestehende Grenzen `MAX_INFLIGHT=3`, `MAX_SPECULATIVE=1`, `maxDecodedPixels` und die RAM-Reserve für Prefetch bleiben unverändert. Auch Speicher- und Fog-Rechte, Terrain-PNGs, Fog-Clips und Cache-Dateien ändern sich nicht.

**Zur Diagnose:** Der Laufzeitbericht enthält `directionalPrefetch`, `directionalPrefetchFrames`, `prefetchTrailingSkipped` und `prefetchLeadingStarts`. Im Performancefenster erscheint der Wert **„Nachlauf vermieden“**. Dieser zählt übersprungene Kandidatenprüfungen, **nicht** automatisch eingesparte tatsächliche I/O-Vorgänge.

## Reproduzierbarer A/B-Kontrollfall

Ein isolierter V8-Fall verwendet **55 synthetische, vollständig vorgefertigte Tile-Pakete**, 600 × 340 CSS-Pixel Viewport, 6,5 Millionen dekodierte Pixel RAM-Budget, dieselbe 15-Punkte-Kamerafahrt und exakt **zwei** Warmup-Zeichnungen.

Bei dieser festgelegten Eingabe ergab die Vorprüfung:

| Messgröße | `leadPrefetch=1` | `leadPrefetch=0` |
|---|---:|---:|
| Sichtbare Tile-Leseanfänge | 9 | 10 |
| Cache-Evictions | 1 | 2 |
| Fertig geladene Tile-Pakete | 13 | 14 |
| Spekulative Tile-Leseanfänge | 4 | 4 |
| Rendering-/Storage-Fehler | 0 | 0 |

Der dazugehörige Node-Test `tests/test_rendering_step25s_directional_prefetch_20261110.cjs` fordert die Reduzierung von **sichtbaren Reads und Evictions** unter exakt denselben Eingaben.

Der Effekt ist **nicht universell**: Bei länger vorgewärmtem Cache und einer anderen Kamerafahrt ergab ein zweiter synthetischer V8-Vergleich **keine Differenz**. Die Änderung zielt bewusst auf Situationen mit begrenztem RAM und noch unvollständigem, schnell wechselndem Cache.

## Validierung und Grenzen

```bash
node --test tests/test_rendering_step2[1-5]*.cjs
node tests/automated_browser_frozen_map.cjs
```

Für den Browserlauf ist die in `.github/workflows/frozen-map-ci.yml` installierte Playwright-Firefox-Umgebung erforderlich. Die A/B-Schalter sind im Viewer **`?leadPrefetch=1`** (neuer Pfad, Standard in diesem Draft) bzw. **`?leadPrefetch=0`** (alte Kandidatenzulassung).

**Kein behaupteter FPS-Zuwachs:** Diese Tests erfassen gezielte Node-/synthetische Browser-Regressionen, nicht die private 397-Hex-Originalkarte und nicht den nativen Windows-GPU-Framep95. Die neue Priorisierung sollte deshalb als überprüfbare Hypothese mit Rückfallpfad gelten. Draft nicht automatisch mergen. Lokale, uncommittete Windows-Arbeiten und `main` bleiben unverändert.

## Automatisierte Abnahme

[GitHub Actions #42923512748](https://github.com/markusjungblut/asset_labor/actions/runs/42923512748)
bestätigt **80/80 bestandene Node-Tests** und die vollständige
Headless-Firefox-Regression einschließlich Pan/Zoom, LOD,
persistiertem Kartenatlas und Fog. Der ergänzte reale
Node-V8-Speichervergleich prüft ausdrücklich, dass auf der
fixierten 55-Tile-Strecke bei unveränderten vier
spekulativen Starts ein sichtbarer Leseanfang und eine
Eviction vermieden werden. Der erste erfolgreiche Lauf
[GitHub Actions #42922939650](https://github.com/markusjungblut/asset_labor/actions/runs/42922939650)
hatte zuvor **78/78 Node-Tests** samt vollständigem
Headless-Firefox-Test bestanden.

CI ist damit ein Funktions-/Ressourcennachweis auf
synthetischer Karte, keine Abnahme der 397-Hex-Originalkarte.
PR #129 bleibt Draft und ist als gezielte Änderung auf
Draft #128 gestapelt; PR #127 bleibt unabhängig.
