# Schritt 25K – Trennbare Fog-Ebene, unveränderte Welt bei Fog-only-Frames

Stand: 08.11.2026 · **PR #121 nach `main` gemergt** (Merge `10b0dca411125e62ac03093997bc2be76f1dc7fa`). Die Funktion bleibt **ausdrücklich opt-in** via `&fogLayer=1`; Standard ist weiterhin der bisherige einlagige Renderer.

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
  Atlas-Panorama-Cache** und ändert weder die 16,5-/8,5-MP-Cachelimits
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

## Erste automatische CI-Abnahme (08.11.2026)

[GitHub Actions #42508929187](https://github.com/markusjungblut/asset_labor/actions/runs/42508929187)
bestand nach Anpassung zweier zu breiter Assertions **56/56 Node-Tests**
und den echten Firefox-Test mit `passed:true`, `errors:[]`.
`frozen-map-firefox-44` (ID `13628587938`) enthält die acht
A/B-Modi, JSON, Screenshots und den separaten Static-Redraw-Vergleich.
Die 120-Tile-/399-Hex-CI-Karte ist synthetisch, keine Windows-/600-MB-Replik.

| Je 30 aktive Warm-Pan-Frames, Firefox | Ein Canvas (Standard) | `fogLayer=1` |
| --- | ---: | ---: |
| `drawMs` p95 | **49 ms** | 53 ms |
| `frameGapMs` p95 | **64 ms** | 67 ms |
| `worldMs` p95 | 35 ms | 35 ms |
| `fogMs` p95 | 11 ms | 11 ms |
| Wiederholungsdecodes / Evictions | 0 / 0 | 0 / 0 |
| Transparenter Overlay-Canvas | keiner | **29 MiB** |

**Gezielter Fog-only-Proxy:** Je 24 echte `requestAnimationFrame`-
Canvas-Draws bei unveränderter, vorbereiteter Kamera:

| p95 | Ein Canvas (Standard) | `fogLayer=1` |
| --- | ---: | ---: |
| `drawMs` | 48 ms | **9 ms** |
| `worldMs` | 19 ms | **0 ms** |
| Zusätzliche `baseFrames` | 24 | **0** |
| Zusätzliche `fogOnlyFrames` | 0 | **24** |

Die gemessene **deutliche Beschleunigung betrifft nur statische
Kamera-/Fog-Animationsframes**; die Bewegung wird auf derselben
CI-Hardware leicht langsamer. Die zweite Canvas-Ebene ist daher
noch **nicht als Standardeinstellung gerechtfertigt**.
Die Bildvergleiche der ursprünglichen Pan-Screenshots zeigen praktisch
pixelidentische obere Hälften (ca. 0,001% Abweichung >2 pro RGB-Kanal),
aber noch 2,89% Abweichung über das ganze Bild, überwiegend im
zeitabhängigen unteren Fog. Diese Messung ist kein Beweis der
Pixelgleichheit bei synchronem Fade.

**Vorläufige Entscheidung:** Die streng opt-in aktivierte,
archivschonende Variante kann nach zusätzlicher Browserprüfung der
Fog-Alpha-Pixel und der exakt überdeckenden CSS-Geometrie in `main`
integriert werden, ohne die bestehende Standard-Performance zu verändern.
Nicht automatisch aktivieren. Eine automatische Wahl benötigt zuerst
ein eigenes Last-/Speicherbudget und eine belegte Verbesserung beim
konkreten Nutzungsfall.

## Adaptive 25K-Revision: kein separater Overlay-Canvas beim Schwenken

Eine weitere kontrollierte Firefox-Wiederholung
[#42509457214](https://github.com/markusjungblut/asset_labor/actions/runs/42509457214)
bestätigte den statischen Vorteil (Draw-p95 48→9ms),
zeigte aber im **ständig aktiven Zwei-Canvas-Modus** eine
nicht akzeptabel starke Pan-Schwankung (Draw-p95 **42→66ms**,
FrameGap-p95 **52→71ms**). Die erste positive Messung allein
war deshalb **kein** ausreichender Grund für die Aktivierung.

Die Implementierung wurde daraufhin geändert:
Die zusätzliche Fog-Ebene wird **während jeder Kamerabewegung ausgeblendet**.
Dann werden Cloud, World und Fog wie zuvor gemeinsam auf dem alten
Spielcanvas gezeichnet. Bei der nächsten unveränderten Kameraansicht
wird die saubere Untergrundkomposition genau **einmal** neu erzeugt,
um zuvor direkt gebackenen Fog nicht doppelt darzustellen; erst dann
darf die separate transparente Ebene wiederholt aktualisiert werden.
Ein Frame-Flag `fogLayerActive` und Node-Tests überprüfen diese
Umschalt-Invariante. Der Overlay-Canvas bleibt zwar im RAM, belastet aber
während Pan nicht den sichtbaren CSS-Compositor.

Die erste echte Firefox-Abnahme dieser adaptiven Variante,
[Run #42510064655](https://github.com/markusjungblut/asset_labor/actions/runs/42510064655),
ergab für 30 Pan-Frames:

| Warm-Pan p95 | Standard | adaptives `fogLayer=1` |
| --- | ---: | ---: |
| `drawMs` | 33 ms | 43 ms |
| `frameGapMs` | **44 ms** | **44 ms** |
| `worldMs` | 22 ms | 22 ms |

Bei 24 Frame-Redraws **ohne** Kamerabewegung sank
`drawMs` p95 von **22 auf 6 ms**, `worldMs` von 16 auf 0 ms.
Die mittlere Pan-Draw-Zeit war **32,63 gegenüber 34,47 ms**,
die Pan-p95-Differenz beruht bei nur 30 Frames zum Teil auf
wenigen langsamen Einzelbildern. Der Preis bleibt der zusätzliche
~29-MiB-Viewport-Canvas.

Der anschließende CI-Lauf verifiziert zusätzlich explizit, dass
**kein einziger aktiver Pan-Frame** die zweite Fog-Ebene nutzt.
Bis zur erfolgreichen Abnahme der finalen Instrumentierung bleibt
der Branch im Draft. Auch bei Erfolg bleibt `fogLayer=1` zunächst
ausdrücklich **opt-in**; der vorhandene einlagige Renderer bleibt
Default, bis hardwareübergreifende Vorteile und das RAM-Budget
ausreichend abgesichert sind.

## Finale automatische Abnahme und Merge (08.11.2026)

[GitHub Actions #42510464245](https://github.com/markusjungblut/asset_labor/actions/runs/42510464245)
bestand sämtliche **57 Node-Tests** und den echten Firefox mit
`passed:true` und ohne Browserfehler.
Der getestete PR-Head war `6f188d6e3582ce34481ac5224b95ef1f0cdf2cd6`.
Das Artefakt `frozen-map-firefox-54` (ID `13629635707`) enthält
24 statische und 30 aktive Pan-Frames je Vergleichsvariante:

| Kennzahl | Standard, ein Canvas | adaptives `fogLayer=1` |
| --- | ---: | ---: |
| Pan-`drawMs` p95 | 40 ms | 46 ms |
| Pan-`frameGapMs` p95 | 47 ms | 49 ms |
| Mittlere Pan-`drawMs` | 39,87 ms | 41,47 ms |
| Pan-Frames mit sichtbarer zweiter Ebene | entfällt | **0 von 30** |
| Static-`drawMs` p95 (24 Redraws) | 33 ms | **8 ms** |
| Static-`worldMs` p95 | 19 ms | **0 ms** |
| Static-Base-Neuaufbauten | 24 | **0** |
| Zusätzlicher Fog-Viewport-Speicher | 0 | **29 MiB** |

Die CSS-Flächen des eigentlichen und separaten Canvas waren im echten
Browser deckungsgleich; ein Alpha-Readback der 4096×1844-Overlay-Pixel
fand 1694 opake, 76154 transparente und 19 teiltransparente Pixel in
einer Stichprobe. Keine Repeat-Decodes oder ImageBitmap-Evictions.

Die oberen Bildhälften der vergleichbaren Pan-Screenshots stimmen nahezu
pixelgenau überein (ca. **0,0005 %** der Pixel mit RGB-Abweichung >2);
über das gesamte Bild gibt es ca. **3,57 %** Abweichung, hauptsächlich
im zeitabhängigen unteren Fog. Dies ist keine streng synchronisierte
Pixelgleichheitsabnahme des gesamten Fog-Lebenszyklus.

**Abschluss:** Die technische Implementierung und die automatische
Sicherheits-/Funktionsabnahme sind als **optionale Diagnosefunktion**
[#121](https://github.com/markusjungblut/asset_labor/pull/121)
in `main` integriert. Wegen zusätzlichem GPU-/RAM-Footprint und
weiterhin ungesichertem Pan-p95-Vorteil **keine automatische Aktivierung**
im Standalone-Spielviewer.

**Nächste Priorität (Schritt 25L):** ausschließlich Pan-Frames mit
~20–30ms synchronem World-Canvas-Blit untersuchen; unterscheide dabei
Canvas-Aufruf, Software-Komposition und tatsächliche GPU-Präsentation.
Eine begrenzte Alternative (z. B. DOM-/Compositor-geführte Darstellung
eines unveränderten Welt-Rasters) braucht echte Browser-A/B,
DPR-/LOD-/Fog-Sicherheit, GPU-/RAM-Budget und reproduzierbare
Viewport-/Kamera-Szenen. Keine manuelle Windows-Nutzerabnahme und kein
blindes Erhöhen von Raster-/Dekoderbudgets.
