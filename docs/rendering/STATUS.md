# Rendering-Status

**Stand:** 2026-10-27  
**Repository:** `markusjungblut/asset_labor` (`main`)  
**Schritt 4:** **Kamera-Komposition implementiert und mit isolierten Tests geprüft; native Node- und echte Browser-Abnahme noch offen.**  
**Ausgangscommit für Schritt 4:** `d465bf32002de6c85cfd2e51586f8572ec449b7a`  
**Schritte 1–3:** Implementierungsstand aus bisherigen Commits beibehalten. Die noch offene Browserprüfung von Schritt 3 bleibt ausdrücklich offen.  
**Nächster Entwicklungsinhalt:** Schritt 5 erst nach Abnahme von Schritt 3/4.

## Änderung ausschließlich in Schritt 4

- Bereits vorhanden: Pointer-Drag und Mausrad verwenden `beginFastCamera()` → `fastRender()`. Ein fertiges World-Tile wird bei reiner Kamerabewegung vom vorhandenen `world-tile-streamer.js` an neuer Position/Größe komponiert; in unverändertem LOD kein neuer Terrain-/Scenery-Build. `endFastCamera(true)` hält den Tile-Compositor nach einer Bewegung aktiv.
- **Neu:** `requestCameraOnly()` in `app.js` leitet auch programmatische Kameraänderungen (Zoom-Slider, Tastatur und Home-Zentrierung auch bei unverändertem Zoom) auf diesen bereits vorhandenen Compositor um. Zuvor ging `applyZoom()` ohne Pointer-/Wheel-Geste immer über `requestDraw()` und potenziell durch teure `drawGround()`/`drawRoads()`/`drawMapObjects()`-Pfade.
- **Sicherer Erstaufbau:** Die Umleitung ist nur bei freigegebener Fast-Kamera und bereits vorbereiteten World-Tiles oder Terrain-Chunks zulässig. Bei leerem Anfangscache zeichnet der normale Renderer zuerst Materialgraph, Worker-/Terrain-Chunks und erste Snapshots. Keine leere Schnellkamera, die den Erstaufbau verhindert.
- **Editor-Schutz:** Kein Shortcut bei Export (`finalRendering`), Strategieansicht, Nicht-Kartenansichten, verbotenen Edit-/Debug-Overlays oder deaktivierter Fast-Kamera. Die reguläre `draw()`-Pipeline bleibt dort unverändert. Beim Abschalten des Fast-Camera-Toggles wird auch ein nach `pointerup` retained `tileModeActive` deaktiviert; der Karten-Canvas übernimmt wieder.
- **Messbar:** `window.VedrasAssetLabor.cameraStats()` berichtet `zoomComposites`, `zoomFallbacks`, `fastFrames`, `worldTileBakes`, `backgroundBuilds`, `sceneryBuilds`, `terrainBuilds`, `active` und `interacting`.
- **Browsercache:** Nur das `app.js`-Script bekommt eine neue Query-Version in `index.html`. Kein Umbau an Fog, World-Renderer, Raster-LOD, DPR oder GPU. Keine neuen Render-Caches oder globalen Invalidierungsregeln aus Schritt 5.

## Isolierte Validierung

- Neue `tests/test_camera_only_step4_v023_20261027.cjs`: 11 fokussierte Tests für Slider-/Keyboard-/Home-Routing, Initial-Fallback, Terrain-Bootstrap, Editor-Schutz, No-op-Zoom, Strategieumschaltung, deaktivierbaren persistenten Compositor, transformierte wiederverwendete World-Tiles, unveränderten Export-Pfad und `pointerup` ohne Vollaufbau.
- **60/60 isolierte V8-Tests bestanden (acht Suites):** Schritt-4-Kamera 11/11, Progressive Fast Camera 9/9, World-Tiles 8/8, Schritt-3-Recovery 10/10, Schritt-2-Diagnose 4/4, Static-Scene-Fallback 4/4, Static-Scene 8/8, Cloud-Loading 6/6. V8 mit simulierten Node-Schnittstellen; **kein nativer Node-Testlauf**.
- Vorhandener Code `static-object-layer.js` bleibt unverändert. Das schließt Mehrkosten durch Neuaufbau bei Debug-Modi oder bei unvorbereiteten Regionen nicht aus.
- **Keine neuen Browser-FPS-Zahlen**: Die alte Benutzermessung (449,6 ms/Frame) betrifft `draw()`, nicht `fastRender()`. Eine Verbesserung dieses konkreten FPS-Werts darf nicht ohne Browsermessung behauptet werden.

## Manuelle Abnahme auf der gespeicherten großen Szene

1. `main` aktualisieren, Editor hart neu laden, die Karte erst vollständig vorbereiten lassen.
2. Browser-Konsole: `const before = window.VedrasAssetLabor.cameraStats();`
3. Im Kartenmodus Zoom-Slider betätigen, mit `+`/`-` zoomen, dann mit der Maus schwenken – zunächst innerhalb desselben LOD.
4. Browser-Konsole: `const after = window.VedrasAssetLabor.cameraStats(); console.table({before,after});`
5. Erwartet: `zoomComposites` und `fastFrames` wachsen; im bereits vorbereiteten Gebiet und bei gleichem LOD bleiben `worldTileBakes`, `backgroundBuilds` und `sceneryBuilds` stabil. Neue sichtbare Tiles oder erstmals angefragtes LOD **dürfen** gebaut werden; dies ist kein unnötiger Scene-Rebuild.
6. Kartenränder, Wolken, vollständige Terrain- und Sprite-Freigabe prüfen; insbesondere bei Pan/Zoom und Karten-/Strategie-Wechsel. Danach Fast-Camera-Option abschalten und überprüfen, dass die normale Map-Ansicht wieder sichtbar ist.
7. Separat einen vollständigen `node --test`-Lauf und Browser-Performance-Trace ausführen. Alte Probleme aus Schritt 3 (67 pending) damit ebenfalls neu messen.

```bash
node --test tests/test_camera_only_step4_v023_20261027.cjs
node --test tests/test_progressive_fast_camera_v0201_20261026.cjs tests/test_world_tile_streamer_v021_20261026.cjs
node --test tests/test_tile_recovery_v023_step3_20261027.cjs tests/test_tile_diagnostics_v023_step2_20261027.cjs
```

**Abnahmegrenze:** Als Codeänderung abgeschlossen, als Produkt-/FPS-Verbesserung **teilweise**, bis reale Browser- und native Node-Tests erfolgreich vorliegen.
