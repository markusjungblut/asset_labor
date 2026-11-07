# Schritt 25I – Schnelle Wiederverwendung unveränderter World-Raster und World-Phasenprofiling

Stand: 07.11.2026 · **PR-Abnahme ausstehend**. Ausgangspunkt ist der in `main` gemergte Schritt 25H (#118).

## Messhypothese

Der synthetische Firefox-25H-Lauf zeigte Warm-Pan-p95 von `worldMs=19ms`,
`fogMs=8ms` und `drawMs=30ms` in der Standardvariante (je 30 aktive Frames).
Die p95-Werte sind nicht additiv. `worldMs` vermischte bisher Cache-Auswahl,
mögliche Dirty-Patches/Neuaufbauten und den Canvas-`drawImage`-Blit.
Insbesondere prüfte `paintOverview` **auch bei unverändertem warmem Cache**
alle dekodierten Tiles erneut, erstellte eine sortierte Liste und verglich die
zusammengefügte Signatur. Die Kosten des Blits bzw. einer möglichen GPU-Upload-
Synchronisierung können daraus **nicht** abgeleitet werden.

## Änderung: konservativer World-Fast-Hit

- Im Runtime-RAM zählt `decodedRevision` ausschließlich **inhaltliche** Änderungen
  des dekodierten Tile-Bestands: erfolgreicher neuer PNG-Decode, Eviction oder
  `clearDecoded()`. LRU-Neuordnung und unveränderte Referenzen erhöhen den Wert
  nicht. Die Revision beeinflusst weder DB-Schlüssel noch persistierte Daten.
- Ein `overviewRaster` darf die erneute Map-Suche und Signaturprüfung überspringen,
  wenn Revision, gewählte 1×/2×-Variante, Zoom, DPR, Canvas-Breite/-Höhe,
  Raster-Pad, `projectY` und die strengen bisherigen Pan-Overscan-Grenzen
  weiterhin übereinstimmen. Der vorhandene 16,5-MP-/8192px-Rasterlimitcheck
  bleibt **vor** dieser Entscheidung aktiv.
- Schon eine neue Dekodierung, Eviction, ein Pan über den verfügbaren Rand oder
  eine geänderte Projektion führt zur bisherigen vollständigen Tile-Prüfung und
  ggf. dem existierenden 25F-Dirty-Patch. Nach einem erfolgreichen Patch oder
  unveränderten vollständigen Signaturvergleich wird die Revision aktualisiert.
- Dieselbe Pixelquelle wird wie zuvor **einmal pro Frame geblittet**. Keine
  Bildqualitätsänderung, kein Ausschalten autorisierter Fog-Überdeckung,
  keine zusätzlichen Allocations, keine neuen Background-Ladevorgänge.
  `&worldFast=0` deaktiviert allein den Optimierungszweig als A/B-Kontrolle.

## Instrumentierung und automatisierte Tests

`perf=1` misst zusätzlich `worldPrepareMs` (inklusive Cache-Recheck/Neuaufbau/
Dirty-Patch) und `worldBlitMs` (synchroner Canvas-Aufruf). Diese Größen sind
Teil von `worldMs` und keine GPU-Present- oder tatsächlichen Upload-Zeitmessungen.
Der Runtime-Report führt `worldCacheFastReuse`, `overviewFastHits` und
`overviewRechecks`, der Frame-Report die kumulativen Zähler.

Die Node-Regression `tests/test_rendering_step25i_world_cache_fast_reuse_20261107.cjs`
prüft warmes Streaming, neue PNG-Ankunft und Dirty-Rect-Invalidierung,
Kamera-/Projektionsänderung sowie den Legacy-A/B-Pfad.

Die GitHub-Actions-Firefox-Reihe führt bei identischer synthetischer
120-WorldTile-/399-Fog-Hex-Karte nun **sieben** Modi aus: `guarded`, `legacy`,
`noStream`, `noCloudPad`, `forceCloud`, `noFogCull`, `noWorldFast`.
Kaltstart-/Warm-Pan-JSON, Screenshots und p95 von `worldMs`, `worldPrepareMs`,
`worldBlitMs`, `drawMs` und `frameGapMs` sind maschinell auswertbar.
Die CI stellt das tatsächliche Durchlaufen von Fast-Hits und der Legacy-Rechecks
sicher und verhindert große Regressionen.

## Abnahmekriterien und Grenzen

1. Node und echtes headless Firefox müssen automatisch grün laufen.
2. `worldFast=0` muss den alten Signature-Scan weiterhin ausführen.
3. Die Standardvariante muss im echten Browser Warm-Hits ohne Map-Neuscan
   ausführen und Bild-/Fog-Qualität unverändert lassen.
4. Die tatsächliche Messung entscheidet erst, ob die ersparte CPU-Auswahl
   relevant ist oder `worldBlitMs` (das vollständige World-Canvas-Copy)
   gegenüber der Vorbereitung dominiert.

**Kein 60-FPS-Versprechen** auf dem privaten Windows-/600MB-Originalatlas,
keine manuelle Pan-/Zoom-Messung durch den Nutzer und keine Eingriffe in
Archiv-, Manifest-, LOD-, Render-DPR- oder Fog-Autorisierungsregeln.
