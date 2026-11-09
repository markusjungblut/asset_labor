# Schritt 25N – Opaker Anzeige-Canvas gegen World-Viewport-Blit (A/B)

Stand: 09.11.2026. **Experimenteller Draft; keine Änderung des Standardrenderers.**

## Ausgangspunkt und Hypothese

Die erfolgreich in `main` integrierten Schritte 25I, 25K und 25M
reduzieren zwar CPU-Cache-Arbeit beziehungsweise verhindern bei einem
opt-in vergrößerten Camera-Overscan zwei komplette World-Neuaufbauten.
Der eigentliche warme World-Viewport-Blit bleibt im synthetischen
Headless-Firefox auf ~16–25 ms p95. Der in 25L geprüfte DOM-Compositor
verursachte trotz entfallenem Canvas-Kopiervorgang eine erhebliche
Verschlechterung des p95-Frame-Abstands (51→78 ms); der Versuch wurde
geschlossen und **nicht** in `main` übernommen.

Der sichtbare `#game`-Canvas wird bei jedem Frame vor World und Fog
mit einem opaken Cloud-Backdrop beziehungsweise der bereits vorhandenen
Vollflächen-Ersatzfarbe gefüllt. Anders als die separaten World-,
Cloud- und Fog-Zwischenpuffer benötigt dieser **finale** Display-Canvas
somit logisch keinen Alphakanal. Es ist plausibel, aber nicht sicher,
dass ein Browser dadurch Blending-/Upload-Overhead einspart.

## Streng opt-in `&canvasOpaque=1`

- Nur `canvas.getContext('2d',{alpha:false})` an der finalen
  sichtbaren Anzeige wird ausprobiert. Ohne Schalter bleibt
  `{alpha:true}` die bisherige Vorgabe.
- **Unverändert `alpha:true`:** maskierter World-Raster,
  Ground-/Scenery-Quell-Canvas, Cloud-Komposition, zusätzliche
  25K-Fog-Overlay-Ebene und Zoom-Snapshot-Puffer.
- Keine Änderung an `drawImage`-Quell- oder Zielkoordinaten,
  World-DPR, LOD, 16,5-MP-/8192px-Grenze, Streaming-Dirty-Patches,
  Bildglättung, Maskierung, Sprites oder Fog-Rechte.
- Keine weitere Cacheallokation, kein geänderter IndexedDB-Key,
  keine neuen Tile-Lesevorgänge. `getContextAttributes().alpha`
  belegt im echten Browser, ob die geänderte Surface angelegt wurde;
  ein Browser darf die Option theoretisch nicht unterstützen.
- Bei `fogLayer=1` muss der Fog-Overlay-Canvas weiterhin
  transparent bleiben. Eine etwaige unsichtbare Hintergrundfläche
  darf nicht mit den eigentlichen Fog-Berechtigungen verwechselt werden.

## Automatisierte Abnahme

- Native Regression prüft Default- und Opt-in-2D-Context-Attribute,
  dass alle Offscreen-/Fog-Canvas `alpha:true` behalten und
  World-/Fog-/Cloud-Zeichenaufrufe in beiden Modi gleich bleiben.
- Die vorhandene isolierte Headless-Firefox-Testszene
  (120 WorldTiles/399 Hexes, vier Cloudvarianten) lädt zusätzlich
  `opaqueDisplay` mit `&canvasOpaque=1` und vergleicht gegen
  `guarded` unter der gleichen 30-Frame-Pan-Kamerafahrt.
  Im Bericht: `worldBlitMs`, `worldMs`, `drawMs`,
  `frameGapMs`, `meanPanDrawMs`, Kaltstart und Decode-/Cache-Zustand.
- **Qualitäts-Gate nach der Zeitmessung:** Beide Browser-Seiten
  werden auf dieselbe gespeicherte Kameraposition zurückgesetzt.
  Nach vollständigem Tile-Ready und mehr als 850 ms
  Fog-Dissolve werden 45×30 RGB-/Alpha-Stichproben aus dem
  tatsächlichen Canvas-Framebuffer verglichen. Kein verdeckter
  Screenshot- oder dynamischer Fog-Zeitunterschied darf eine
  vermeintliche Beschleunigung kaschieren.
- Das synchronisierende `getImageData` findet **erst nach**
  den Timed-Pan-Frames statt. Es gehört nicht in die
  `worldBlitMs`-/`drawMs`-Phase der Benchmark-Ergebnisse.
- Ein schnellerer synchroner `drawImage`-Aufruf beweist **nicht**
  unmittelbar eine schnellere GPU-Präsentation oder 60 FPS.
  Die `frameGapMs`-Verteilung und Bildqualität sind mit
  zu prüfen. Bei fehlendem Vorteil oder Visualabweichung wird
  die Alternative verworfen; sonst höchstens opt-in, da
  der private Windows-/600-MB-Atlas nicht als Testfixture vorliegt.

Keine manuellen Tests vom Nutzer, keine persistenten Änderungen
oder Terrain-Worker, kein Ändern von Sichtrechten beziehungsweise
ursprünglichen Kartenbildern.

## Automatische Abnahme, Ergebnis und Entscheidung (09.11.2026)

[GitHub Actions #42588849549](https://github.com/markusjungblut/asset_labor/actions/runs/42588849549),
geprüfter Code-Head `2b73b872dcb162c1f90000af9c4418139e5b54b1`:
**65/65 Node-Tests** und alle **10 realen Firefox-Modi** grün,
`firefox-summary.json` mit `passed:true`, `errors:[]`.
Das archivierte Firefox-Artefakt `frozen-map-firefox-63`
(ID `13660566860`) enthält JSON und Screenshots der
synthetischen 120-WorldTile-/399-Fog-Hex-Szene.

| 30 aktive Warm-Pan-Frames, Headless-Firefox | Standard `alpha:true` | `canvasOpaque=1` |
| --- | ---: | ---: |
| Tatsächlicher 2D-Kontext `getContextAttributes().alpha` | `true` | `false` |
| `worldBlitMs` p95 | **20 ms** | **20 ms** |
| `worldMs` p95 | 28 ms | 27 ms |
| `worldPrepareMs` p95 | 11 ms | 10 ms |
| `drawMs` p95 | **47 ms** | **47 ms** |
| `frameGapMs` p95 | **53 ms** | **55 ms** |
| Mittlere Pan-`drawMs` | **45,13 ms** | **45,47 ms** |
| Cold `firstFullyVisibleMs` | **4577 ms** | 4684 ms |
| Zusätzliche World-Neuaufbauten nach Cold | 2 | 2 |
| Wiederholungsdecodes / Evictions | 0 / 0 | 0 / 0 |

Die **nach dem Timing** gelesenen 45×30 RGB-/Alpha-Proben
bei identischer Kamera zeigten **0 unterschiedliche RGB-Proben**
(Schwelle >2), **0 Alphaabweichungen** und
`maxChannelDelta=0`. Die beiden Fog-Dissolve-Zustände waren
abgeschlossen. Das bestätigt die gewählte Bildstichprobe;
es ersetzt keine vollständige deterministische Prüfung sämtlicher
Bildschirm-Pixel oder anderer Browser-/Windows-Treiber.

**Entscheidung: keine Integration des opaken Ausgabe-Canvas.**
Auf dem untersuchten Linux-Firefox ergab sich weder bei
`worldBlitMs` noch beim tatsächlichen p95-Zeichen-/Frame-
Abstand eine relevante Verbesserung. `canvasOpaque=1` bleibt
ausschließlich im geschlossenen [PR #124](https://github.com/markusjungblut/asset_labor/pull/124)
nachvollziehbar. Der Hauptbranch behält seine bislang sichere
`alpha:true`-Voreinstellung und den unveränderten Renderer.

**Nächster fachlich begründeter Schwerpunkt:** Eine neue
Copy-Mikrovariante ohne nachweisbaren Vorteil wäre nicht
zielführend. Nötig sind besser gepaarte,
browser-/hardwareübergreifende Messungen der World-Blit-Pipeline
oder eine **architektonisch** andere Reduktion der zu
übertragenden sichtbaren Pixel, ohne Fog-Maskierung oder
Quellqualität zu gefährden. Die alte 25L-DOM-Variante
(verschlechterter p95-Frame-Abstand) ist keine sichere Lösung.
Das Originalarchiv und seine IndexedDB-Derivate wurden bei
25N nicht verändert.
