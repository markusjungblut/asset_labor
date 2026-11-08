# Schritt 25K – Trennbare Fog-Ebene, unveränderte Welt bei Fog-only-Frames

Stand: 08.11.2026 · **experimenteller A/B-Branch, noch nicht als Produktionsstandard akzeptiert**.

## Warum keine weitere drawImage-Mikrooptimierung

Der separate Schritt-25J-Versuch ([PR #120](https://github.com/markusjungblut/asset_labor/pull/120),
Firefox #42507855991) zeigte: Ein 5-Argument-Vollraster-`drawImage`
ist bei gleicher Quellpixelzuordnung **nicht** schneller als der vorhandene
9-Argument-Viewport-Crop: `worldBlitMs p95=23ms` in beiden Varianten,
aber `drawMs p95=41ms` Standard gegen **47ms** Vollraster.
Der PR wurde ohne Merge geschlossen.

Die verbleibende Hypothese ist daher nicht *anders blitten*, sondern:
**Bei einer Fog-Opacity-Animation dieselbe statische Welt gar nicht blitten.**

## Opt-in-Laufzeitarchitektur

- `frozen-map-game.html` enthält ein standardmäßig **verstecktes**
  transparentes `<canvas id="fogOverlay">` exakt über dem ursprünglichen
  Spielcanvas `#game`; `pointer-events:none` erhält sämtliche
  Kamera-/Zoom-Eingaben.
- Nur `&fogLayer=1` aktiviert es. Das Original bleibt Standard und dient als
  unveränderter A/B-Vergleich. Die 2D-Fog-Painter `drawUnready` und
  `drawTransitions` zeichnen weiter dieselbe Geometrie mit identischem
  DPR, 850-ms-Dissolve und denselben Sicherheitsprüfungen, jetzt auf die
  transparente Ebene.
- Bei jeder Zeichnung wird ausschließlich die Fog-Ebene transparent
  gelöscht und neu befüllt. Auf `#game` bleibt die letzte Welt-/Cloud-
  Komposition stehen, **aber nur** wenn Viewport, Zoom, Pan, DPR, Projektion,
  dekodierte Tile-Revision und Cloud-Asset-Revision gleich geblieben sind.
- Kamera-, Projektions-, Fenster- oder DPR-Änderungen, neue/entfernte
  Decodes, Cloud-Asset-Wechsel, Szenenwechsel und Zoomvorschauen invalidieren
  die statische Basis. Die erste Anzeige und jeder relevante Wechsel zeichnen
  weiterhin erst die unveränderte Welt **unter** dem aktuellen Fog.
- Zoom-in-Snapshots kombinieren ausdrücklich beide Canvas-Ebenen in derselben
  Vorschau und verhindern doppelten Fog beim Wiedergeben; Zoom-out-Snapshots
  behalten den schon vorhandenen autorisierten Welt-/Fog-Renderpfad bei.
- Es bleibt ein zusätzlicher **viewportgroßer transparenter Display-Canvas**
  im Speicher (typisch maximal ~8 Mio. Gerätepixel bzw. ~30,5 MiB,
  wenn die vorhandene 8MP-Spielansicht gilt). Es ist **kein zusätzlicher
  Atlas-Panorama-Cache** und ändert weder die 16,5-/8,5-MP-Cacheländer
  noch die gespeicherten 1×-/2×-Dateien. Der RAM-Aufpreis ist Teil der
  Entscheidung und darf nicht verschwiegen werden.

## Automatisches A/B und Akzeptanz

- Native Regression `test_rendering_step25k_fog_overlay_20261108.cjs`:
  Unveränderte Fog-only-Frames berühren den Basis-Canvas nicht,
  Fog wird immer gelöscht/neu gezeichnet, Kamera-/Cloud-Änderungen
  invalidieren, der unveränderte Standard rendert auf einem Canvas,
  und Zoom-in-Snapshots beinhalten World **und** Fog.
- GitHub Actions testet zusätzlich zu den bisherigen sieben Browser-Modi
  `layeredFog` auf der isolierten synthetischen Karte (120 Tiles/399 Hexes).
  Die Screenshots erfassen mit `main` **beide Ebenen zusammen**, nicht nur
  das untere Game-Canvas.
- Warm-Pan-A/B prüft `drawMs`, `frameGapMs` und Fehler: die zweite
  Ebene darf das normale aktive Panning nicht grob verschlechtern.
- Zusätzlich erfolgen 24 echte Canvas-Redraws **ohne Kameraänderung** je
  Variante. Das stellt isoliert dar, was während laufender
  Fog-Opacity-Frames geschieht. In der getrennten Variante wird
  `worldMs=0` erwartet, während die bisherige Variante jedes Mal die
  statische Welt komponiert. Der isolierte Replay ist ein *Proxy*,
  kein automatisch exakt reproduzierter 850-ms-Decode-Fade.
- `report()` zählt `baseFrames`, `fogOnlyFrames`,
  `fogOverlayMiB` und meldet `layeredFog`.
  Ein Merge als Standard setzt **messbare Browser-Vorteile** in der
  relevanten Animation, funktionsrichtige Bilder **und** vertretbare
  Pan-/Speicherfolgen voraus; weder Node-Gates noch reine geometrische
  Gleichheit sind allein genügend.

**Kein** Schreibzugriff auf den privaten Windows-Atlas, keine unautorisierten
Hexes, keine Änderung an Quell-PNG, Cloud-Feather, 850-ms-Fade,
Raster-DPR, Berechtigungen, LOD oder Bake-Workern. Keine manuellen Tests
durch den Nutzer und kein 60-FPS-Versprechen auf Windows.
