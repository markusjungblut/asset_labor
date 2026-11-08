# Schritt 25J – A/B-Messung der World-Canvas-Blit-Strategie

Stand: 08.11.2026 · Experiment in separatem PR; **noch keine Produktionsumstellung**.

## Ausgangspunkt

Schritt 25I (#119) wurde nach `main` integriert. Im synthetischen Headless-Firefox-Lauf [#42397319828](https://github.com/markusjungblut/asset_labor/actions/runs/42397319828) lagen im Warm-Pan (30 aktive Frames)
`worldBlitMs p95=25ms`, `worldMs p95=34ms`, `drawMs p95=60ms`.
Die Einzelperzentile sind nicht additiv. Das hohe Blit-p95 beweist **keine**
GPU-Uploadkosten: `drawImage`-Wallclock enthält auch Software-Rasterisierung,
Synchronisierung, Skalierung und Browser-/Treiberartefakte.

## Kontrollierter erster Versuch

Der vorhandene Standard verwendet die 9-Argument-`drawImage`-Form, die
exakt den Viewport-Bereich aus dem gepufferten World-Raster kopiert:

```js
target.drawImage(m.canvas, sx, sy, width*dpr, height*dpr,
  0, 0, width, height);
```

Der ausschließlich per `&worldBlit=whole` aktivierbare Versuch nutzt die
5-Argument-Form mit unverändertem Gerätepixelmaßstab:

```js
target.drawImage(m.canvas, -sx/dpr, -sy/dpr,
  m.canvas.width/dpr, m.canvas.height/dpr);
```

Das Display-Canvas begrenzt die Pixel auf denselben Viewport. Die bestehende
Bildglättung, DPR, Weltposition, rasterisierte Ground-/Scenery-Inhalte,
Layerreihenfolge und Fog-Überdeckung werden nicht verändert. Dieses Verfahren
kann **langsamer sein**, falls der Browser das ganze 16,5-MP-Panorama verarbeitet
anstatt nur den sichtbaren Ausschnitt zu samplen. Daher wird es nicht unbesehen
zum Standard gemacht.

## Abnahme und Entscheidung

- Neue Node-Regression prüft für unveränderte und gepannte Kamera,
  dass beide Varianten dieselben Quellpixel-Koordinaten im Viewport
  berechnen und der 9-Argument-Standard unverändert bleibt.
- Die bestehende isolierte GitHub-Actions-Firefox-Szene mit 120 synthetischen
  WorldTiles, 399 Fog-Hexes und vier Cloudvarianten misst jetzt zusätzlich
  `wholeWorldBlit` gegen `guarded` (gleiches Testsystem/Kameramuster).
  Beide Varianten werden als JSON und Screenshot archiviert.
- Prüfe `worldBlitMs`, `worldMs`, `drawMs`, `frameGapMs`, Browserfehler,
  Raster-Hits und Darstellungsähnlichkeit. Eine alternative Strategie ist
  nur sinnvoll, wenn der **innerhalb des gleichen CI-Laufs** gemessene Effekt
  stabil positiv und die Darstellung korrekt ist.
- Bei negativem oder nicht eindeutigem Befund bleibt der bisherige Blit
  maßgeblich; die darauffolgende Optimierung benötigt eine andere
  Kompositionsarchitektur (z. B. getrennte Layer für bewegte Fog-Effekte).

Kein manueller Nutzertest, keine geänderten IndexedDB-Keys/Original-PNGs,
kein neues Bake, kein größerer Cache oder garantierte 60 FPS auf Windows.

## Abschlussmessung: Alternative verworfen (08.11.2026)

Automatischer [GitHub-Actions-Lauf #42507855991](https://github.com/markusjungblut/asset_labor/actions/runs/42507855991):
**alle Node-Tests und Headless-Firefox bestanden**,
`firefox-summary.json`: `passed:true`, `errors:[]`.
Artefakt `frozen-map-firefox-41` (ID `13627668417`).

| Derselbe Firefox-/120-Tile-Warm-Pan (je 30 aktive Frames) | 9-Argument-Standard | `worldBlit=whole` |
| --- | ---: | ---: |
| `worldBlitMs` p95 | **23 ms** | 23 ms |
| `worldPrepareMs` p95 | **8 ms** | 13 ms |
| `worldMs` p95 | **26 ms** | 31 ms |
| `drawMs` p95 | **41 ms** | 47 ms |
| `frameGapMs` p95 | **48 ms** | 55 ms |
| Wiederholungsdecodes / Evictions | 0 / 0 | 0 / 0 |

Auf dem großen synthetischen Linux-Firefox-Viewport ist die Vollraster-
Zeichenvariante **nicht schneller**, obwohl sie dieselbe World-Abbildung
nutzt. Die Standardstrategie bleibt unverändert. Die beiden vollständigen
Screenshots haben eine pixelidentische obere Bildhälfte; über die gesamte
Ansicht unterscheiden sich ca. **3,73 %** der Pixel in mindestens einem
Kanal um mehr als 2 Werte, vor allem im unteren zeitabhängigen Fog-Bereich.
Dies ist kein deterministischer Pixelbeweis des gesamten Spiels.

**Entscheidung:** Dieser rein opt-in Versuch wird **nicht gemergt** und nicht
als Produktionsoptimierung eingeschaltet. Der nachgewiesene Flaschenhals
lässt sich durch das bloße Wechseln der `drawImage`-Signatur nicht
beseitigen. Als nächster kontrollierter Versuch bieten sich getrennte
World-/Fog-Kompositionslayer an, damit statische World-Pixel beim
laufenden 850-ms-Fog-Dissolve nicht erneut über die gesamte Anzeigefläche
kopiert werden müssen. Pan-Performance und zusätzlicher Canvas-Speicher
müssen dabei eigens im echten Firefox geprüft werden.
