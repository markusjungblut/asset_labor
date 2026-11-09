# Schritt 25O – Autorisierungsgetriebene World-Blit-Streifen (experimentelles A/B)

Stand: 09.11.2026 · **Draft / kein Produktivstandard**.

## Ausgangspunkt

Der letzte [Schritt 25N](https://github.com/markusjungblut/asset_labor/pull/124)
wurde nach einem vollständig grünen Firefox-Test ohne Merge geschlossen:
`alpha:false` auf dem Display-Canvas änderte den synchronen
World-Blit nicht (p95 20→20ms) und den Frame-Abstand geringfügig
zum Schlechteren (53→55ms). Die früheren 25J-/25L-Copy-/DOM-Varianten
sind ebenfalls nicht für die Produktivnutzung geeignet.

Im jetzigen Stand werden aus dem vollständigen bereits maskierten
World-Raster pro Pan-Frame nochmals **sämtliche sichtbaren
Viewport-Gerätepixel** auf den Display-Canvas kopiert. Aber
`paintWorld` malt innerhalb seines Puffers **ausschließlich**
in sichtbaren/erkundeten Hexagonen: Ground wird durch
`clipCells(0)`, Scenery und ihre Überhänge durch
`clipCells(45)` begrenzt. Daneben ist die World-Schicht
transparent und darunter liegt der undurchsichtige Cloud-Backdrop.

**Hypothese:** An einem Rand der erkundeten Karte müssen
transparent leer bleibende World-Pixel nicht nochmals per
`drawImage` übertragen werden. Bei vollständig gefülltem
Viewport kann eine Streifenaufteilung teurer sein und muss
automatisch auf den bisherigen Blit zurückfallen.

## Streng opt-in `&worldBands=1`

- `frozen-map-world-blit.js` ermittelt pro Frame konservative
  Bounding-Intervalle aller **sichtbaren und erkundeten**
  Hexagone in gerätepixelgenauen, ca. 224 CSS-px hohen
  Horizontalstreifen. Verdeckte/unbekannte Hexe zählen
  **nicht** zum erlaubten World-Pixel-Footprint.
- Jede Hex-Box umfasst den tatsächlichen `+45`-World-Halo
  der Scenery-Clips sowie drei zusätzliche Gerätepixel für
  Antialiasing, Raster-Snapping und Sampling. Invalides
  Hex-Metadata führt **zum bisherigen vollständigen Blit**,
  niemals zum stillen Abschneiden.
- Bei maximal acht Streifen und mindestens 23% theoretisch
  eingesparten Bildpixeln wird **dieselbe bereits vorhandene
  World-Rasterquelle**, dasselbe 9-Argument-`drawImage` und
  dasselbe DPR verwendet, mit entsprechend eingeschränkten
  Quell- und Zielrechtecken. Andernfalls erfolgt exakt die
  bisherige eine Vollbildkopie.
- Die World-Renderpipeline davor bleibt vollkommen unverändert:
  alle ursprünglichen WorldTiles/Layer, Ground-/Scenery-Tiefen,
  Shadow-Padding, LOD, 25F-Dirty-Patches, 25I-Revision-Guards,
  25M-Budgetlimits, physikalische Display-Pixel und autorisierte
  Fog-Geometrie bleiben wie bisher.
- Kein neuer großer Canvas-/Bitmap-Cache, keine Änderung an
  Atlas-/IndexedDB-Daten oder World-Bake-Workern. Zusätzliche
  CPU-Kosten entstehen durch die Hex-Bounding-Planung;
  insbesondere bei dichter Welt kann der Versuch schlechter
  sein und wird deshalb **nicht voreilig als Default aktiviert**.

## Automatische Abnahme

- **Node:** Deterministische Geometrie-Tests für die konservative
  `+45`-Hexbegrenzung (verschobene Ansicht, fractional DPR,
  sichtbare/erkundete/verborgene Hexfelder), Qualität des
  unveränderten Vollblit-Fallbacks und tatsächliche reduzierbare
  Blit-Gerätepixel im Runtime-Fixture.
- **Headless-Firefox:** Neunter bisheriger Modus plus neuer
  `sparseWorld` (`worldBands=1`) mit Cold-/Pan-JSON,
  bereits vorhandenen synthetischen 120 WorldTiles/399 Hexes,
  vier Cloudtexturen und zwei Kamerafahrten:
  gewöhnlicher Warm-Pan im weitgehend gedeckten Zentrum
  (dort ist der Vollblit-Fallback wichtig), anschließend
  **gepaart** 24 aktive Pan-Frames in einem teilgedeckten
  Kartenrandbereich. Dort müssen mindestens 25% der
  tatsächlich von World-`drawImage` betroffenen Gerätepixel
  entfallen.
- Zusätzliche Telemetrie: `sparseWorldBlitFrames`,
  `sparseWorldBlitFallbacks`, `worldBlitDevicePixels`,
  `worldBlitFullDevicePixels`, `worldBlitLastRectCount`
  und `worldBlitLastFraction`.
- **Sicherheits-Gate:** Nach den Timed-Frames werden beide
  Browser-Seiten bei **derselben Kameraposition** und nach
  abgelaufenem Fog-Dissolve aus dem echten Display-Canvas
  ausgelesen. 140×80 tatsächliche RGBA-Proben müssen
  **ohne** Kanalunterschied >2 übereinstimmen.
  Das ist ein starker Stichprobentest, aber noch kein
  Pixelbeweis aller Karten-/GPU-Situationen.
- Entscheidung anhand des **gesamten** Render- und
  FrameGap-p95 plus Durchschnitt und der tatsächlich
  reduzierten Blit-Pixel. Das reine Einsparen von
  gerenderten Pixeln ist **kein** GPU-Present-Nachweis.

Kein 60-FPS-Versprechen für die unverfügbare private
Windows-/600MB-Karte; keine manuellen Benutzertests und
keine Änderung von Fog-Rechten, Quell-/1×-/2×-PNG,
Welt-Rasterlimiten oder Dekodier-Budgets.
