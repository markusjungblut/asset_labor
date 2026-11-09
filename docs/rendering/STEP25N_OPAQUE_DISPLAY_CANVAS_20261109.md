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
