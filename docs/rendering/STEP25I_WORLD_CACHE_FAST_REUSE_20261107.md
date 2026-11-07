# Schritt 25I – Schnelle Wiederverwendung unveränderter World-Raster und World-Phasenprofiling

Stand: 07.11.2026 · **Schritt 25I mit PR #119 nach `main` integriert** (Merge `d4f195d3199dcaa49a4c42bcd4dde57abe75d543`). Automatische PR-CI #42397319828 und erneute Main-CI #42397677335 vollständig grün. Ausgangspunkt ist der in `main` gemergte Schritt 25H (#118).

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

## Tatsächliche CI-Abnahme (07.11.2026)

[Workflow #42397319828](https://github.com/markusjungblut/asset_labor/actions/runs/42397319828)
auf Code-Commit `28c302748bb2f14578de8eba916f39691077c199`:
**51/51 Node-Tests und Headless-Firefox vollständig grün**, `passed:true`,
keine Browserfehler. Es wurden sieben identische A/B-Kameraläufe getestet;
zusätzlich lief ein separater 1×/2×-LOD-Kontinuitätstest erfolgreich durch.
Die Firefox-Artefakte mit JSON/PNGs sind als `frozen-map-firefox-38`
(ID `13583787874`) archiviert.

| Warm-Pan-p95, gleiche synthetische Firefox-Map | `worldFast=0` | Step-25I-Standard |
| --- | ---: | ---: |
| `worldPrepareMs` | 16 ms | **13 ms** |
| `worldBlitMs` | 27 ms | **25 ms** |
| `worldMs` inklusive Vorbereitung und Blit | 43 ms | **34 ms** |
| `drawMs` | 62 ms | **60 ms** |
| `frameGapMs` | 70 ms | **67 ms** |
| Aktive Messframes | 30 | 30 |
| World-Fast-Hits beim Kaltstart | 0 | **53** |
| Volle World-Rechecks beim Kaltstart | 81 | **22** |
| World-Raster-Neuaufbauten beim Kaltstart | 1 | **1** |

Die p95-Einzelphasen sind unterschiedliche Frames und daher nicht additiv.
Dies sind unpaarige Browserläufe auf dem **synthetischen Linux-CI-Runner**;
kleine Unterschiede bei `drawMs`/`frameGapMs` sind kein hochsignifikanter
Performance-Nachweis für alle GPUs. Gegenüber dem vorherigen 25H-Run
schwanken absolute p95-Werte mit Runner/Kaltstart/Browserzustand; der
**innerhalb dieses CI-Laufs** kontrollierte Vergleich ist maßgeblich.
Die große `worldBlitMs`-Phase bleibt trotz des Fast-Hits bestehen; ein
GPU-Upload ist durch Canvas-Wallclock alleine **nicht** direkt gemessen.

Die beiden Firefox-PNGs `guarded` und `noWorldFast` zeigen denselben
Weltaufbau; sie sind jedoch **nicht pixelidentisch** (2,47% der Pixel
weichen in mindestens einem RGB-Kanal um mehr als 2 ab, überwiegend
im unteren dynamischen Fog-Bereich). Ohne synchronisierte Fade-Zeitpunkte
ist dies keine deterministische Pixelgleichheitsprüfung.

**Entscheidung:** begrenzte, archivschonende CPU-Fast-Hit-Optimierung mit
positivem Firefox-A/B und vollständigen funktionalen Tests in `main`
integriert. Auch der anschließende Main-Workflow
[#42397677335](https://github.com/markusjungblut/asset_labor/actions/runs/42397677335)
hat alle Node-/Firefox-Tests bestanden. Als nächster Schritt ist der World-Canvas-Blit separat
zu untersuchen, mit Qualitätsschutz und realem Browservergleich statt
blindem Cache-Aufbau oder Erhöhung des Canvas-/RAM-Budgets.
