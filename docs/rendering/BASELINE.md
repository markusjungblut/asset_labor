# Baseline v0.23 – Ausgangslage

Quelle: vom Benutzer am 2026-10-27 übermittelte Analytics; **keine** in dieser Sitzung neu erzeugte Messung. Browser, Betriebssystem, Bildschirmauflösung, konkrete Zoomposition, GPU-Modus und Testszene sind nicht vollständig belegt; bei der nächsten Messung ergänzen.

## Gemeldete aktuelle Werte (normaler Editor-Renderpass)
| Messgröße | Wert |
|---|---:|
| Gemittelte Framezeit | 449,6 ms (ca. 2,22 FPS) |
| Gelände | 239,9 ms |
| Wege/Flüsse | 79,8 ms |
| Sprites/Schatten | 125,2 ms |
| Sichtbare Hexfelder bereit | 153 / 292 |
| Terrain-Aufträge ausstehend | 67 |
| Bildpool wartend / aktiv | 0 / 0 |
| Sichtbare Natur-Instanzen | 2710 |
| Sprite-Bilder bereit | 245 / 245 |
| Zusätzliche Bildabrufe / fehlende Pfade | 0 / 0 |
| Hintergrund-Canvas | neu, Rand 220 px, 8,7 MP |
| Background-Cache | 450 Treffer / 229 Neuaufbauten (kumuliert) |
| Chunk-Index | 74410 Treffer / 6 Aufbauten (kumuliert) |
| Geländequelle / Chunk-Graph | 0,0 / 70,0 ms (letzter Aufbau) |
| Waldboden / Ufer / Diagnose | 10,0 / 86,0 / 228,0 ms (letzter Aufbau) |
| Flüsse/Uferbänke / Straßen/Brücken | 19,0 / 106,0 ms (letzter Aufbau) |
| Objekt-/Scenery-Layer | 2714 / 2714 vorbereitet; 2714 Sprites und 2710 Schatten im gespeicherten Layer |
| Szenen-Cache | 5 Builds / 8173 Treffer (kumuliert) |
| Bodenschatten / Sprite-Zeichnung | 18,1 / 81,3 ms |
| Scenery-Raster | 12,0 MP, Komposition 21,0 ms |
| GPU-Uploads | 0 |

**Messwert-Interpretation:** Der 449,6-ms-Zähler in `app.js` wird für `draw()` als Mittel der letzten bis zu 16 Proben ermittelt. Die reine schnelle Tile-Kamera besitzt mit `fastLastMs`/`fastCameraStats` eine **andere** Metrik. Die 228 ms „Diagnose“ sind die Zeit eines Abschnitts am Ende von `drawGround()` beim letzten Hintergrundaufbau und dürfen nicht unbesehen zu den übrigen Frame-Subzeiten addiert werden. Zähler für Cache-Hits sind kumuliert, keine Einzelbildwerte.

## Bereits dokumentierte ältere Referenzen
- v0.22.5-README: 2163 ms/Frame in einer anderen Szene mit ca. 3746 Sprites, 12 MP; nicht direkt mit den 449,6 ms vergleichbar.
- v0.22.6-README: 79/79 isolierte JavaScript-Tests nach Sprite-/Fog-Hotfix; **kein echter Browser-FPS- oder Originalgrafik-Abnahmelauf**.
- GitHub Actions: vorhandener Workflow baut Sprite-Atlanten; der letzte erfolgreiche Lauf 2026-10-23 betrifft nicht den aktuellen Render-FPS-Benchmark.

## Reproduzierbare Referenz-Szenarien (noch auszuführen)
A. **Start/Laden**: Asset-Labor v0.22.6, gespeicherte große Szene, Standard-Canvas-/Streaming-/Worker-Schalter protokollieren, 60 s ohne Interaktion beobachten. Nach 10/30/60 s: `window.__vedrasRenderProfile`, `window.__vedrasChunkProfile`, `window.__vedrasCloudReveal`, `window.__vedrasSpriteDemand` und `worldTileStats` über `window.VedrasAssetLabor` prüfen.
B. **Kamera warm**: nach Bereitschaft für 10 s mehrfach über dieselben Felder schwenken; normalen `perfStats` und separaten `fastCameraStats` dokumentieren, Cache-Builds vorher/nachher vergleichen.
C. **Kamera kalt**: in unvorbereitete Region schwenken und 60 s beobachten; Queue, inFlight, errors, fertig/ausstehend und Fog-Bereitschaft protokollieren.
D. **Zoom**: gleiche Szene bei 0,28 / 0,65 / 1,20 Zoom; `4×` gegen tatsächlich angezeigte DPR und LOD vergleichen. Beachten: Standard-Editor begrenzt bei >500 Nature-Instanzen auf 1,5×.
E. **A/B-Profile**: Diagnose-DOM sichtbar und verborgen vergleichen; Worker an/aus, GPU an/aus jeweils **einzeln** ändern und Einstellungen zurücksetzen. Keine Projektdateien dabei speichern.

Je Szenario dokumentieren: Git-Commit, Browser/Gerät, Viewport, Zoom, DPR, Nature-Anzahl, Worker-/GPU-/Streaming-Schalter, Cache warm/kalt, p50/p95 Framezeit (Browser Performance-Trace), Zeit bis zur letzten fertigen Hex und Anzahl dauerhaft offener Aufträge nach 60 s. Nicht nur `Ø ms` vergleichen.

## Bestehende Regressionstests (noch auszuführen)
`node --test tests/test_cloud_loading_performance_v0225_20261027.cjs tests/test_sprite_recovery_cloud_background_v0226_20261027.cjs`
`node --test tests/test_world_tile_streamer_v021_20261026.cjs tests/test_priority_chunk_streaming_v019_20261024.cjs tests/test_worker_pipeline_0118.cjs`
`node --test tests/test_static_scene_v016_20261023.cjs tests/test_object_layout_cache_20261023.cjs tests/test_adaptive_lod_v018_20261024.cjs`

Keine neuen Testergebnisse behaupten, bevor diese Befehle und ein echter Browserlauf tatsächlich durchgeführt wurden.

## Zusatz ab Schritt 2 – Tile-Diagnose
`window.VedrasAssetLabor.tileDiagnostics({limit:150})` erstellt eine explizite, nur auf Abruf berechnete Zustandsaufnahme. Im 0/30/60-Sekunden-Vergleich die sichtbaren Tile-IDs, `state`, `epoch`, `lod`, `ageMs`, `lastOutcome`, `lastError`, Cache-/Paint-Version, Terrain-Core-Bereitschaft, Worker- und ImagePool-Warteschlangen erfassen. Die bereits übermittelten 449,6 ms und 67 offenen Terrain-Aufträge sind keine in Schritt 2 neu gemessenen Werte.

## Schritt-3-Vergleich (keine neue FPS-Messung)
Die im Code nachgewiesenen Liveness-Defekte wurden gezielt adressiert. `retry-exhausted` ist ein **expliziter Endfehler**, kein Erfolg und kein aufzudeckender Hex. Ein realer Browser-/Original-Sprite-Vergleich von p50/p95-FPS, 30/60-Sekunden-Queue-Länge und Hex-Freigabe wurde noch nicht durchgeführt; die Benutzer-Baseline bleibt daher unverändert. Fokussierte V8-Regression: neue 10/10, Schritt 2 4/4, älterer World-Tile-Test 8/8 bestanden – dies ersetzt keinen nativen Node-Testlauf.

Die fokussierten isolierten Tests nach dem letzten Schritt-3-Nachtrag umfassen **22/22** erfolgreiche V8-Fälle einschließlich nachträglicher Terrain-Bereitschaft; weiterhin keine FPS-Messung am echten Browser.

## Schritt 4 – Reproduzierbarer Kamera-A/B-Vergleich (ausstehender Browserlauf)
Erstmals können `window.VedrasAssetLabor.cameraStats()` und `window.VedrasAssetLabor.worldTileStats()` die beiden tatsächlich unterschiedlichen Pfade sichtbar machen. Nach vollständig vorbereiteter Startkarte Zählerstände `before` und `after` für Zoom-Slider, Tastatur-Zoom, Home-Zentrierung und Drag über ein bereits geladenes Gebiet erfassen. Im Tile-Modus werden vorhandene Image-Layer ausschließlich verschoben und skaliert; im regulären `draw()` können Hintergrund- und Scenery-Snapshot-Misses Neubauten auslösen. Bei warmem Pan/Zoom im gleichen LOD darf `worldTileBakes` nicht steigen, während `fastFrames` wächst; `backgroundBuilds` und `sceneryBuilds` sollen stabil bleiben. Nicht aus isolierten Tests auf echte FPS schließen. Alte Baseline 449,6 ms betrifft den regulären Editor-Pass, nicht die Fast-Kamera.

## Referenz für nachträgliches Tile-Nachschärfen (Schritt-4-Ergänzung)
Die alte Messung mit 449,6 ms und 67 Terrain-Aufträgen enthält keinen separaten Wert für schwach aufgelöste World-Tiles. Die neu dokumentierten `visiblePreviews`/`upgraded`-Zähler unterscheiden provisorische aus Snapshots upgesampelte Bildkacheln von fertigen direkten Raster-Tiles. Browser A/B nach `main`-Update: (1) initial nach Normalrender, (2) nach erstem Fast-Camera-Wechsel, (3) nach 30 s unveränderter Kamera, (4) nach Zoom-Grenzwechsel. Dabei `world.tiles[].preview`, `sourceDensity`, `requiredDensity`, `state` und `renderMs` mit identischen Tile-IDs vergleichen. Diese Werte wurden hier nicht neu gemessen.
