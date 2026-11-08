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
