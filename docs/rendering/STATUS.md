# Rendering-Status

**Stand:** 2026-10-28  
**Repository:** `markusjungblut/asset_labor` (`main`)  
**Schritt 4:** **Kamera-Komposition mit Qualitätsnachbesserung implementiert und isoliert geprüft; native Node- und echte Browser-Abnahme weiterhin offen.**  
**Ausgangscommit für Schritt 4:** `d465bf32002de6c85cfd2e51586f8572ec449b7a`  
**Schritte 1–3:** Implementierungsstand aus bisherigen Commits beibehalten. Die noch offene Browserprüfung von Schritt 3 bleibt ausdrücklich offen.  
**Schritt 5:** **Selektive Cacheinvalidierung implementiert und isoliert geprüft; native Node- und Browser-Abnahme ausstehend (teilweise).**  
**Schritt 6:** **Statische Natur-/Schatten-Tiles von beweglichen Einheiten getrennt, isoliert geprüft; native Node- und Browser-Abnahme noch offen (teilweise).**  
**Schritt 7:** **Sichtbare Terrain-/World-Tiles nach aktuellem Kamerafokus und Wartealter priorisiert, alte Arbeit verworfen, Background-Fairness begrenzt; isolierte Tests bestanden, native Node-/Browser-Abnahme offen (teilweise).**  
**Schritt 8:** **Shoreline-Pixelberechnung an vorhandenen Terrain-/OffscreenCanvas-Worker angebunden, inklusive Bitmap-Transfer, Profiling und Canvas-Fallback; isoliert geprüft, echte Performance-/Grafikabnahme ausstehend (teilweise).**  
**Schritt 9:** **Progressive Anzeige mit vollständigen LOD-Fallbackpaketen, Priorität nach tatsächlicher Bildqualität und deckender Hex-Wolkenmaske implementiert; simulierte Tests bestanden, native Node-/Browserabnahme ausstehend (teilweise).**  
**Schritt 10:** **Gemeinsamer hysteretischer Welt-/Region-/Lokal-LOD-Vertrag für Terrain, Ufer, Fluss, Straße und World-Tiles implementiert; 110/110 isolierte Testfälle bestanden, native Node-/Browser-/Performanceabnahme ausstehend (teilweise).**  
**Schritt 11:** **Interaktive 4×-Qualität innerhalb expliziter Canvas-/Pixelbudgets implementiert, alte dichteabhängige 1,5×-Sperre ersetzt, effektive DPR in beiden Kamerapfaden synchronisiert und hochauflösende Quellen bedarfsgesteuert nachgeladen. Isolierte Regressionen bestanden; native Node- und Browser-FPS-/Speicherabnahme offen (teilweise).**  
**Nächster Entwicklungsinhalt:** Reale Browserabnahme der Schritte 6–11 mit großen Szenen und 4×-Profil; anschließend Schritt 12 (Fog/Schatten) getrennt untersuchen.

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

## Schritt 4 – Nachbesserung ungleichmäßig scharfer World-Tiles (2026-10-27)

**Benutzerbeobachtung:** Die schnelle Kamera fühlt sich besser an, aber zwischen scharfen Tiles bleiben längere Zeit deutlich verpixelte Felder. Dies ist eine qualifizierte Beobachtung der echten Anwendung, noch keine aus einer reproduzierbaren Browser-Aufzeichnung ableitbare Messung.

**Im Code bestätigte Ursache:** `seedReadyWorldTiles()` und `bakeWorldTile()` konnten einen bei niedriger Zoom-/DPR-Dichte gezeichneten Editor-Snapshot auf die feste Auflösung eines `mid`- oder `near`-World-Tiles hochskalieren. Das Upsampling erzeugt keine neuen Details; der `world-tile-streamer.js` speicherte das Resultat dennoch als endgültiges `id@lod`-Bild und forderte keinen schärferen Nachbau an. Benachbarte direkt gerenderte Kacheln konnten deshalb sichtbar schärfer sein.

**Gezielte Nachbesserung (kein Schritt-10/11-LOD-Umbau):**
- `app.js`: `worldTileSnapshotDensity(snapshot)=snapshot.zoom*snapshot.dpr` und `worldTileSnapshotsSharp(ground,scenery,lod)` prüfen die effektive Weltpixel-Dichte beider Quellen gegen den bisherigen LOD-Vertrag (Ground: `.85/1.5/2.5`, Scenery bis `1.9`). Die feste LOD-Auswahl und alle Qualitäts-/DPR-Sperren bleiben unverändert.
- `seedReadyWorldTiles()` erzeugt weiterhin sofort benutzbare Tiles, kennzeichnet aber unteraufgelöste Snapshots explizit mit `preview:true` und `sourceDensity`. `snapshotTile()` skaliert eine Vorschau **nicht** künstlich über ihre native Quelldichte hinaus und vermeidet damit übergroße niedrigauflösende Canvas-Kopien.
- `world-tile-streamer.js`: Der Cache unterscheidet `preview` und `ready`. Ein `preview` im **angefragten LOD** wird weiter angezeigt, aber nun gezielt als Ersatzkandidat erneut aus `source()` angefordert. Eine bereits scharfe Nachbarkachel bleibt unverändert. Spätere Preview-Seeds überschreiben keine scharfen Tile-Einträge.
- `bakeWorldTile()`: Eine bereits fertige Snapshot-Komposition wird nur noch als endgültiges World-Tile übernommen, wenn ihre Quellen die Auflösung des Ziel-LOD liefern. Andernfalls greift der vorhandene direkte Aufbau mit `drawGround()/drawRoads()/drawMapObjects()` und den strengen Painted-/Sprite-Ready-Gates. Nur nach erfolgreichem vollständigem Paket wird `preview` durch `ready` ersetzt; eine neue scharfe Tile blendet nicht erneut durch die Wolken ein.
- Ausgefallene Vorschau-Upgrades bleiben mit `preview-upgrade-failed`, Retry-/Timeout-Grund und Tile-ID diagnostizierbar. Ein späteres `terrainReady(tileId)` darf einen derartigen Auftrag gezielt reaktivieren. Keine unbegrenzte Retry-Schleife und keine Entsperrung unbekannter Tile-IDs.
- Zusätzliche beobachtbare Werte: `world.visiblePreviews`, `world.previews`, `world.upgraded` sowie `world.tiles[].preview`, `sourceDensity`, `requiredDensity`, `fallbackLod` und `state`. Die Schnellkamera-Statuszeile zeigt die Zahl noch unscharfer Vorschau-/Fallback-Tiles und bereits nachgeschärfter Tiles.

**Tests:** Neuer Satz `tests/test_tile_quality_upgrade_step4_20261027.cjs` **8/8** isoliert bestanden: Dichte-/Upsampling-Prüfungen, provisorisches Seeding, automatische Qualitätsanforderung, Nicht-Downgrade, spät fertiges Terrain, scharfer Snapshot-/Direktbau-Vertrag und unabhängig scharfe Nachbartiles. Acht vorhandene Suites aus Kamera, Streaming, Retry/Diagnose, statischer Szene und Cloud-Loading **60/60** isoliert bestanden. **Gesamt: 68/68 simulierte V8-/Node-API-Testfälle, kein nativer Node-Testlauf.** Geänderte Module `app.js`/`world-tile-streamer.js` erfolgreich auf JavaScript-Syntax geprüft.

**Offene echte Abnahme:** Nach hartem Browser-Reload und vollständigem Aufbau zunächst 30–60 Sekunden über derselben Region bleiben, dann Pan/Zoom in ein bereits vorbereitetes Gebiet. In der Konsole `window.VedrasAssetLabor.tileDiagnostics({limit:150}).world` sowie `window.VedrasAssetLabor.worldTileStats()` ausgeben. `visiblePreviews` sollte beim Fertigladen sinken und `upgraded` wachsen. Wenn sichtbare Kacheln dauerhaft verpixelt bleiben, betroffene `id@lod`, `state`, `sourceDensity`, `requiredDensity`, Retry-Gründe, Worker-/ImagePool-Status protokollieren. Ein neuer FPS- oder Pixelperfektionsnachweis an der Nutzerkarte ist **noch nicht vorhanden**. Die Texturquelle selbst kann trotz scharfer Renderkachel weich sein; Auflösungsbudgets und das `4×`-Profil gehören zu späteren Schritten.

## Schritt 5 – Cache- und Invalidierungsregeln (2026-10-27)

**Ausgangscommit:** `8c49194cc5b362e2d90ac63148be352fae5ea413`. Ziel: Gezielte Bildaktualisierung ohne pauschales Verwerfen der 512er World-Tile-Landschaft nach Kamerabewegungen, lokalen Kartenedits oder einzelnen Sprite-Decodes.

### Konkrete Änderungen

1. **Kamera-/Bildsignaturen trennen:** Der bisherige World-Tile-Invalidierungsschlüssel enthielt `backgroundScene.snapshot().panX/panY/zoom` und die entsprechenden `staticScenery`-Werte. Bei einer Verlagerung des Overscan-Canvas wurden dadurch sämtliche Weltkacheln verworfen. Nun zählt ausschließlich `base.signature`, `scenery.signature` und `objectLayoutCache.revision`. Fertige Bilder überleben Pan, Zoom und reine Snapshot-Neupositionierungen.
2. **Selektive World-Tile-Invalidierung:** `world-tile-streamer.js` bietet `invalidateTiles(ids)`. Das entfernt betroffene Ground-/Scenery-Pakete in **allen LOD-Varianten**, löscht lokale Retry-/Queue-Zustände und bricht laufende Jobs dieser Tile-IDs ab. Späte Ergebnisse sind weiterhin über Job-Token geschützt. Andere bereits freigegebene Tiles, Fog-Autorisierung und LOD-Varianten bleiben erhalten. `seed()` ersetzt ein fertiges Bild nicht mehr durch eine neue möglicherweise ältere Editor-Snapshot-Kopie.
3. **Lokale Bild- und Szenenänderungen:** Bei nachgeladenen Nature-/Objektgrafiken werden die tatsächlich platzierten Instanzen nach Assetpfad ermittelt, ihre Positionen um konservative Sprite-/Schattenränder erweitert und ausschließlich die betroffenen Welt-Tiles verworfen. Änderungen an Geländequellen bzw. reliefrelevanten Gebäuden bleiben konservativ global. Der Bilddecoder-Burst wird weiterhin gebündelt; doppelte globale Invalidierungen innerhalb derselben Batch sind vermieden.
4. **Terrainzelle ohne Küstenwechsel:** Eine lokal ausgewählte Materialänderung bzw. das Leeren einer Zelle darf bei unverändertem Wasser/Land-Status ihren World-Tile-Footprint samt 1280–1400 Welteinheiten Halo erneuern, während unberührte Weltkacheln im Cache verbleiben. Biomeweite Änderungen und Wasser-/Land-Wechsel invalidieren weiterhin global. Der räumliche Chunk-Index bleibt bei reinen Zellen-Overrides erhalten; Terrain-Stamps für Nachbar-Chunks werden erneut ermittelt.
5. **Wege selektiv:** `roadChunks.configure()` verwendet eine von der konkreten Straßenliste unabhängige Layer-Signatur und einen `stampTile()` aus den tatsächlich ins Chunk-Halo reichenden Straßenkanten. Eine neue Straßenkante erzwingt daher keinen Rebuild sämtlicher Road-Chunks. Im Editor eingetragene/geänderte Straßen und die dabei freigeräumten Objektkorridore invalidieren die großzügig erweiterten, betroffenen World-Tiles; nicht berührte Kacheln bleiben erhalten.
6. **Ufer getrennt von Szenerie:** Shoreline-Optionen und ihre debouncten Änderungen erneuern die Hintergrund-/Uferberechnung mit `persistScene('ground')`, **nicht** automatisch den Natur-/Objektindex. Strategielabel- und Editor-Debug-Einstellungen speichern mit `persistScene(false)`, ohne unveränderte Grafikcaches zu löschen.
7. **Bewusst globale Fälle:** Wald-Ökologie, Flussnetz und Wasser-Geometrie, große Karten-/Materialwechsel, Relief-/Berg-/Objektänderungen unbekannter Reichweite und der Export behalten sichere globale Invalidierung. Die komplette Legacy-`backgroundScene` bleibt ein gepaddetes Canvas; dieses muss nach echten Hintergrundänderungen erneut gezeichnet werden. Die selektive Neuerstellung einzelner statischer Natur-/Schatten-Tiles ist erst Schwerpunkt von Schritt 6.

### Qualität, Tests und offene Abnahme

- **Neue Regression:** `tests/test_render_cache_invalidation_v023_step5_20261027.cjs` **10/10** in isoliertem V8 bestanden; prüft selektives Entfernen mit LODs und Pixelbudget, spät ankommende Jobs, unveränderte Nachbarn, Preview-Downgrade-Schutz, snapshot-unabhängigen Kamerazustand, Speicherscopes, Asset-Overhang und straßenbezogene Chunk-Stamps.
- **Vorhandene Tests:** Kamera/World-Tile/Tile-Retry/-Diagnose/Step-4-Qualität **50/50**, Streaming/Frame-Memo/Static-Scene/Cloud-Loading **41/41** in isolierter V8-Umgebung. Alte quellentextgebundene Assertions in drei Testdateien wurden an bereits geänderte Schritt-3-/Schritt-5-Verträge angepasst; Testfunktionen nicht entfernt.
- **Summe: 101/101 isolierte V8-Tests**. Die Skripte wurden syntaktisch geprüft. **Ein echter `node --test`-Lauf, integrierter Browserlauf und visuelle Nahtprüfung wurden nicht durchgeführt.** Daher Status **teilweise**, keine neuen FPS- oder Bildfehlerfreiheits-Behauptungen.

### Browser-Abnahme vor Schritt 6

1. Aktuelles `main` laden, Browsercache komplett aktualisieren, große gespeicherte Szene öffnen.
2. `window.VedrasAssetLabor.worldTileStats()` vor und nach Pan/Zoom und vor/nach lokalen Edits vergleichen: `tiles`, `pixels`, `selectiveInvalidations`, `selectiveTiles`, `completed`, `visiblePreviews`, `upgraded`.
3. Auf derselben scharfen Region mehrfach zoomen/schwenken, ohne Änderungen. `completed` darf dabei für unveränderte LOD-Tiles nicht fortlaufend wachsen.
4. Eine einzelne Straße/Materialzelle bearbeiten: Nur die örtlichen Nachbar-Tiles und die betroffenen Road-/Terrain-Chunks dürfen neue Builds erhalten. Bei Wasser-/Land- oder Flussänderungen ist ein größerer Rebuild korrekt.
5. An den vier Kachelkanten Ufer, Flussmündungen, Straßen und überhängende Baum-/Bergschatten bei wechselndem Zoom kontrollieren. Unfertige Tiles bleiben unter Fog. Im Zweifelsfall `window.VedrasAssetLabor.tileDiagnostics({limit:150})` exportieren.

```bash
node --test tests/test_render_cache_invalidation_v023_step5_20261027.cjs
node --test tests/test_tile_quality_upgrade_step4_20261027.cjs tests/test_camera_only_step4_v023_20261027.cjs
node --test tests/test_world_tile_streamer_v021_20261026.cjs tests/test_priority_chunk_streaming_v019_20261024.cjs
node --test tests/test_terrain_frame_cache_v017_20261023.cjs tests/test_static_scene_v016_20261023.cjs
```

## Schritt 6 – Statische Natur- und Bodenschatten-Kacheln (2026-10-27)

**Ausgangspunkt:** `main` `cca23593149c5f93bb398370234acd69d11f5dcf`. Bearbeitet auf `rendering/step6-static-nature-20261027`. Ziel: Bereits vorhandene Canvas- und World-Tile-Caches so benutzen, dass Bäume, Sträucher, Felsen, Berge und ihre vorbereiteten Bodenschatten nicht bei jeder Kamerabewegung einzeln gezeichnet werden; bewegliche Einheiten dürfen nicht in statischen Bitmaps landen.

### Implementiert

1. `staticScenery.paint().drawScene` führt `drawMapObjects({includeUnits:false})` aus. Der bestehende Objektindex, die gemeinsame Shadow-Pipeline, Mountainsortierung und Nature-Zeichenreihenfolge bleiben erhalten. Die statischen Objekte und Schatten werden beim Snapshot-Build gezeichnet; nachfolgende Cache-Treffer blenden nur das fertige Canvas ein.
2. Bewegliche `unit`-Objekte besitzen im normalen Editorpass nun einen gesonderten `drawMapObjects({onlyUnits:true})`-Durchgang **nach** dem statischen Canvas. Ihre Schatten und Sprites werden separat gezeichnet; der bisherige direkte Editor-/Finalexport-Pfad `drawMapObjects()` bleibt unverändert. Die bereits vorhandene dynamische World-Tile-Komposition `drawTileDynamics()` bleibt ebenfalls unverändert.
3. `seedReadyWorldTiles()` und die scharfe Snapshot-Abkürzung in `bakeWorldTile()` dürfen vorbereitete, unit-freie Scenery-Tiles jetzt **auch in der Nähe von Einheiten** übernehmen. Die früheren einzelnen Unit-Queries für jede Seed-/Snapshot-Kachel entfallen. Der direkte Tile-Build verwendet weiterhin `includeUnits:false` und seine bestehende Besitzer-/Schatten-/Überhanglogik. `world-tile-streamer.js`, Fog, LOD, Sprite-Assets und Terrainberechnung werden nicht umgebaut.
4. Die optionale GPU-Scenery-Komposition erhält bei sichtbaren dynamischen Einheiten einen Canvas2D-Fallback, da die höher liegende GPU-Fläche andernfalls die separat gezeichnete Einheit verdecken würde. Bei anderen Ausschnitten bleibt die bisherige GPU-Option verfügbar.
5. `window.VedrasAssetLabor.sceneryDrawStats()` meldet pro letztem Renderzustand **statische Sprite- und Schatten-Zeichenaufrufe**, dynamische Sprite-Aufrufe, World-Tile-Bildkompositionen und kumulierte Scenery-/World-Tile-Builds. `window.__vedrasObjectProfile` zählt bei wiederverwendeter Szenerie `drawnSprites:0` und `shadowCandidates:0`, anstatt die Aufrufe des früheren Buildframes als aktuelle Framearbeit auszugeben. Dynamische Werte werden separat unter `__vedrasDynamicObjectProfile` geführt.
6. Nur die Query-Version von `app.js` wurde in `index.html` für das Schritt-6-Script aktualisiert. Vorhandene Cache-Invalidierung aus Schritt 5, Qualitätsgates und die 1,5×-DPR-Grenze wurden nicht verändert.

### Prüfung und Messstatus

- **Neu:** `tests/test_static_nature_tiles_v023_step6_20261027.cjs`, sechs Tests für Syntax, getrennte Natur-/Einheitenpässe und Schatten, Original-Zeichenreihenfolge, statische Snapshots sowie zwei bereits vorbereitete Bildlayer bei Pan.
- **6/6 neuer Testfälle** in einem isolierten JavaScript-V8-Testharness mit nachgebildeten `node:test`-/`vm`-Schnittstellen bestanden. Außerdem **8/8 Testfälle** der vorhandenen `test_world_tile_streamer_v021_20261026.cjs` in einem entsprechenden V8-Harness bestanden. **Insgesamt 14/14 gezielt simulierte V8-Testfälle**, kein nativer Node-Testlauf. Ergänzend sind `app.js`, `static-object-layer.js` und `world-tile-streamer.js` in V8 geparst worden.
- **Isolierter Compositor-Smoke-Test:** Eine vorbereitete World-Tile-Kachel wird bei zwei Kamerapositionen mit jeweils **2 Bildkompositionen** gezeichnet, `completed` bleibt **1**. Der gepufferte Scenery-Canvas wird einmal aufgebaut und bei der nächsten Kameraposition wiederverwendet (1 Build, 2 Kompositionen). Dies sind kleine Testfixtures, **keine realen Performance-Zahlen** der großen Karte.
- Bestehenden quellentextgebundenen Test `tests/test_world_tile_streamer_v021_20261026.cjs` an die neue Einheitentrennung angepasst; keine ursprünglichen Testfälle entfernt.
- **Nicht ausgeführt:** vollständiger nativer `node --test`-Lauf, lokaler Build/Server, reale Browser-Grafikabnahme und Vergleichsmessung von p50/p95/FPS an der gespeicherten großen Szene. Die vorher gemeldeten 449,6 ms/Frame und 2.710 Naturinstanzen sind weiterhin **ausschließlich die alte Baseline**. Daher **Status: teilweise**.

### Nächste Abnahme im echten Browser

1. `main` mit aktuellem Schritt 6 laden, hart neu laden, große Szene vollständig vorbereiten lassen. Zunächst ohne Debug-/Finalexport-Overlays im Canvas-Kartenmodus prüfen.
2. `window.VedrasAssetLabor.sceneryDrawStats()` und `worldTileStats()` vor/nach 10 Sekunden wiederholter Kamerabewegung innerhalb derselben vorbereiteten LOD-Stufe vergleichen. Bei warmem Tile-Modus: `staticSpritesThisFrame===0`, `staticShadowsThisFrame===0` und keine neuen `worldTileBakes` für unveränderte Regionen; `worldTileDrawCalls` enthält nur Bildlayer-Zeichenaufrufe statt Tausender Einzelsprites.
3. Im normalen Canvas-Modus und bei einem Cache-Treffer ebenfalls 0 statische Sprite-/Schatten-Aufrufe erwarten; bewegliche Einheiten bleiben separat sichtbar. Ausgabe `window.__vedrasObjectProfile` und `window.__vedrasDynamicObjectProfile` prüfen.
4. Baum-/Bergüberdeckungen, Kronen und Schatten über Tile-Grenzen, Ufer, Straßen, Fog of War, Schatten-Editor, Finalexport und GPU-Option auf visuelle Regressionen prüfen. In Szenen mit GPU-Sprites und sichtbarer Einheit den Canvas-Fallback kontrollieren.
5. Native Tests ausführen; mindestens:
   `node --test tests/test_static_nature_tiles_v023_step6_20261027.cjs tests/test_world_tile_streamer_v021_20261026.cjs tests/test_static_scene_v016_20261023.cjs tests/test_tile_quality_upgrade_step4_20261027.cjs tests/test_render_cache_invalidation_v023_step5_20261027.cjs`
6. Browsertrace mit gleicher Szene/Zoom/DPR und getrennten Normal-/Tile-Kamera-Frametimings aufzeichnen. Erst dann Schritt 6 vollständig abnehmen und zu Schritt 7 übergehen.

**Offene Probleme:** native Integration/FPS und eventuelle Sprite-/Bergnaht-Regressionsbilder fehlen. Bewegliche Einheiten verwenden noch den bestehenden Objektlayoutindex und dessen explizite Invalidierung; der spätere Spielzustands-/Einheitenupdate-Pfad ist Schritt 17, nicht dieser Schritt.

## Schritt 7 – Priorisierte Warteschlangen für sichtbare Kacheln (2026-10-27)

**Basiscommit:** `6a96d6cd29032329d934b697aeabffb7f80a12cc`. Implementiert im Branch `rendering/step7-priority-queues-20261027`. **Status: teilweise bis Browser-/Node-Abnahme.**

### Beobachtung vor der Änderung

Der Nutzer-Screenshot vom 27.10.2026 zeigt sichtbare Wolken über offenbar erreichbaren Kartenregionen, teilweise unvollständige Küsten und weiterhin unzureichende Performance; die Karte befindet sich ungefähr bei 131 % Zoom. Das ist ein **offener realer Produktfehler**, kein nachgewiesener Schedulerfehler. Die große gespeicherte Szene und ihre exakten Bild-/Chunk-Logs wurden hier nicht live ausgeführt. Die ältere Referenz von 449,6 ms/Frame sowie ursprünglich 67 offenen Terrain-Aufträgen ist weiterhin **keine neue Messung**.

### Implementierte, eng begrenzte Änderungen

1. `chunks.js`: Bereits wartende sichtbare Chunks werden bei `prime()`, `draw()` und einem Retry nach dem **aktuellen** Kameramittelpunkt neu sortiert. Wartezeit läuft weiter, statt bei jeder Kamerabewegung zurückgesetzt zu werden. Nach 2.500 ms erhalten wartende, weiterhin sichtbare Tiles Vorrang vor neu hinzugekommenen näheren Kacheln. Sichtbare Jobs verwenden weiterhin den dringenden `setTimeout(0)`-Pfad, kein wartendes Idle-Callback.
2. `chunks.js`: Aufträge außerhalb des neuen sichtbaren Bereichs werden aus der Vordergrundqueue entfernt. Bereits laufende Vordergrundarbeit, die erst **nach** einer Kamerabewegung fertig wird, wird nicht mehr im Cache veröffentlicht, wenn sie weder sichtbar noch im gültigen Prefetch-Ring noch Teil einer ausdrücklich gestarteten manuellen Vorbereitung ist. Alte Ergebnisse werden freigegeben; vorhandene per-Stempel-/Epoch-Schutzregeln bleiben bestehen.
3. `chunks.js`: Ein bereits im Vordergrund oder Hintergrund berechnetes Tile wird nicht zusätzlich als zweiter sichtbarer Auftrag gestartet. Abgeschlossene Hintergrundtiles dürfen stattdessen bei inzwischen sichtbarer Position als gültiges Ergebnis publiziert werden. Die bestehenden zwei unabhängigen Chunk-Arbeitsbahnen bleiben erhalten. Manuelle Warm-Arbeit bleibt grundsätzlich vorrangig, gibt aber nach sechs Starts eine Idle-Gelegenheit an einen weiterhin gültigen Prefetch-Auftrag ab.
4. `world-tile-streamer.js`: Sichtbare Anfragen werden **bei jedem Request** aus dem aktuellen Kamerafokus neu geordnet; alte Map-Einfügereihenfolgen bleiben nicht bindend. Bei gleicher Warteklasse gelten fehlende Raster vor vorhandenem Alternativ-LOD und Preview-Upgrade. Dieselbe maximale sichtbare Wartezeit (2.500 ms) schützt ältere, noch relevante Jobs gegen Verhungern. Nicht mehr angeforderte Queue-/Flight-Einträge werden weiter verworfen und durch Job-Tokens gegen späte Überschreibungen geschützt.
5. `world-tile-streamer.js`: Ein explizites Parallelitätslimit begrenzt die laufenden World-Tile-Aufträge auf 1 bis 2; die Anwendung verwendet weiterhin den bisherigen Standard von **1**. Retry nach `source-null` darf nun auch einen vorhandenen provisorischen `preview`-Tile erneut anfordern, statt dauerhaft am Preview-Cache zu enden. Der normale strikte Ground+Scenery-Freigabevertrag bleibt unverändert.
6. Diagnostik: `chunks.stats()` enthält `priorityReorders`, `agedPromotions`, `backgroundFairTurns`, `duplicateBuildSkips` und `obsoleteVisibleDiscarded`. `worldTileStats()` und `tileDiagnostics().world` melden `priorityReorders`, `agedPromotions`, `discardedObsolete`, `parallelLimit`; die sichtbaren Tileeinträge zeigen `queuedMs`. Die bereits vorhandenen `queuedVisible`-/`queuedWarm`-/`queuedPrefetch`-Zähler bleiben erhalten.
7. Die Browser-Script-Abfragen für `chunks.js` und `world-tile-streamer.js` wurden in `index.html` aktualisiert, damit ein harter Reload die neue Reihenfolge verwendet. **Unverändert:** Terrain-Worker, Materialauswahl, Ufergeometrie, Fog-Berechtigungen, Scene-Cache-Verträge, Sprite-Grafiken, LOD-/DPR-Limits und Finalexport.

### Tests und Grenzen der Abnahme

- **Neuer Regressionstest:** `tests/test_priority_render_queues_v023_step7_20261027.cjs`, **9/9** V8-Fälle: Kamerafokus, Anti-Starvation, obsolete Foreground-Resultate, manuelle Warm-/Prefetch-Fairness, World-Tile-Priorität/Alter, ungültige laufende Jobs, Parallelitätsgrenze und Preview-Recovery.
- **Ältere Regressionen:** `test_priority_chunk_streaming_v019_20261024.cjs` **13/13**, `test_world_tile_streamer_v021_20261026.cjs` **8/8**, `test_tile_recovery_v023_step3_20261027.cjs` **10/10**, `test_tile_quality_upgrade_step4_20261027.cjs` **8/8**, `test_render_cache_invalidation_v023_step5_20261027.cjs` **10/10**.
- **Insgesamt 58/58** fokussierte Testfälle über eine **simulierte V8-/Node-API-Umgebung**. Die geänderten beiden Renderdateien wurden auf JS-Syntax geprüft. Das ist **kein** nativer `node --test`-, Webserver-, Browser- oder GPU-Testlauf und keine p50-/p95-/FPS-Messung. Daher Schritt 7 **noch nicht vollständig abgenommen**.

### Offene Fehler und reproduzierbare Browser-Abnahme

1. Große Nutzerkarte hart neu laden, bei gleichem Viewport/Zoom/DPR und ohne neue Kartenedits zunächst 60 Sekunden warten. `window.VedrasAssetLabor.tileDiagnostics({limit:150})`, `worldTileStats()`, `streamingStats()` und `cameraStats()` bei 0/30/60 Sekunden vergleichen.
2. Schnell in beide Richtungen schwenken und wieder anhalten. Prüfen, ob sichtbare `queued`-/`running`-Aufträge vor weiter entfernten/fremden Tiles abgearbeitet werden, `queuedMs` nicht endlos steigt und `priorityReorders`/Discard-Zähler plausibel wachsen. Die `inFlight`-Anzahl darf die vereinbarten Grenzen nicht überschreiten.
3. Wolken auf **eigentlich sichtbaren** Feldern und unfertige Küsten getrennt untersuchen: `tileDiagnostics().terrain.tiles` (Raster, Stempel, Paint-Version, retry-exhausted, Timeout) sowie `tileDiagnostics().world.tiles` (Scenery+Ground-Ready, Quelle, Preview, LOD und Retry) für die betroffenen Welt-Tile-IDs speichern. Kartenbereiche nicht vorschnell als fertig freigeben, damit Fog of War keine fehlenden oder unbekannten Inhalte enthüllt.
4. Nach vollständiger Vorbereitung denselben Kamerapfad mehrfach bewegen; p50/p95-Framezeit, Zahl der Terrain-/Scenery-Neuaufbauten, Cache-Budget und verbleibende Cloud-Felder messen. Für einen Vergleich die alte Baseline nur bei identischer Szene und Messmethode heranziehen. Auch Screenshots von Berg-/Ufer-/Kachelgrenzen nötig.
5. Nativen Lauf (mindestens die sechs oben genannten Testdateien mit `node --test`) und echten Browser-Build/Serverstart durchführen. Bleibt die sichtbare Wolkendecke oder Küstenlücke trotz leerer Queue stehen, ist dies **separat** als Tile-Readiness-/Raster-/Fog-Bug zu diagnostizieren, nicht durch eine weitere Scheduleränderung zu verdecken.

**Weiterer Arbeitsschritt:** Schritt 8 (Worker-Evaluation) erst nach angemessener Prüfung des erreichten Zustands. Die sichtbaren Küsten-/Cloudfehler und die schlechte Performance bleiben ausdrücklich ungelöst, bis real gemessen und die betroffenen Tile-Zustände bestimmt wurden.

## Fix vor Schritt 8 – LOD-Wolkenflackern und Küstenfreigabe (2026-10-27)

**Ausgangsstand:** `157e265eaa82dc0d19116e6381ffe8f3a0df0aba`. Im Bugfix-Branch `fix/zoom-coast-readiness-20261027`.

- **Chunk-förmiges Wolkenflackern:** `world-tile-streamer.js` hatte auf jede vollständige Bildkachel eine 240-ms-Alpha-Animation gelegt. Gerade nach Zoom/LOD-Wechseln erschien so rechteckig der Wolkenhintergrund, obwohl Terrain-/Scenery-Bilder fertig waren. Beide Tile-Layer werden jetzt unmittelbar bei vollem Alpha dargestellt; die weiterhin erforderlichen **hexweisen** Fog- und Readiness-Masken sind unverändert.
- **Unvollständige Küsten im fertigen Cache:** `tileArtworkStatus` prüfte fertige Terrain-Kerne, jedoch nicht den getrennten asynchronen `shorelineChunks`-Pass. Für Tiles mit einer realen Küstenkante wird nun das passende Shoreline-Raster geprüft: `allowPrepared=true` benötigt einen vorbereiteten Chunk für direkte Offscreen-Bakes, Snapshot-Reuse erfordert zusätzlich die tatsächlich gemalte Version. Küstenfreie Tiles werden nicht blockiert. Nach Fertigstellung eines Shoreline-Chunks wird sein zuvor wartender World-Tile-Auftrag mit `terrainReady(tile.id)` reaktiviert; die Fast-Kamera primt die vorhandene Shoreline-Queue.
- **Abnahme:** 5/5 gezielte simulierte V8-Tests für Tile-Opacity, Küsten-Readiness, No-Coast, abgeschaltete Coast-Layer und Retry-Verdrahtung. Noch keine echten Browserfotos oder nativen Node-Testläufe; gemeldete Kosten und Küstenbilddetails weiterhin live zu prüfen.

**Wichtig:** Diese Korrektur behebt eine bestätigte logische Freigabelücke und die programmierte rechteckige Animation. Eine vollständig fehlerfreie Küste und ruckelfreier Zoom in der gespeicherten großen Karte sind ohne reale Laufzeitabnahme **nicht bestätigt**.

## Schritt 8 – Vorhandene Worker-Pipeline für Küstenraster ergänzen (2026-10-27)

**Basis:** Commit `c374ee033921293cc9d636438544190f0ce5fba7` nach getrenntem Küsten-/Wolken-Bugfix; Branch `rendering/step8-shoreline-worker-20261027`.

### Eng abgegrenzter Hauptthread-Kandidat

Vor Schritt 8 lief `window.VedrasShoreline.build()` unmittelbar im `shorelineChunks.buildTile()`-Callback. Darin liegt eine CPU-basierte MAX-Alpha-Zusammensetzung aus RGBA-Bilddaten; je Chunk können ein Scratch-Bitmap, `getImageData` und per-Pixel-Übertragungen für benachbarte Küstenkanten entstehen. Im Gegensatz zu Terrain war diese Arbeit bisher **nicht** in `terrain-worker.js` ausgelagert. Das ist ein aus dem Code identifizierter Mainthread-Hotspot-Kandidat, aber noch **keine reale Profilermessung der Dominanz oder Laufzeit**.

### Implementation

1. `terrain-worker.js` importiert dasselbe `shoreline.js` und bedient `shoreline-render` zusätzlich zu `render` und `texture`. Die Berechnung übernimmt exakt `VedrasShoreline.build`; das Ergebnis wird über das bestehende `OffscreenCanvas.transferToImageBitmap`- und `postMessage(...,transfer)`-Protokoll geliefert. Keine andere Küstenformel, keine neuen PNGs.
2. `terrain-worker-client.js` exportiert `renderShoreline(data,assets)`, nutzt den bestehenden Worker, dessen Asset-Texturmap, Startup-Gate, Timeout und verwaiste-Bitmap-Freigabe. Shoreline-Ergebnisse werden in `{raster:{canvas:ImageBitmap,x,y,width,height}}` übersetzt, kompatibel mit dem bisherigen `chunks.js`-Rastervertrag. Separate Zähler: `shorelineJobs`, `shorelineCompleted`, `shorelineFailed`, `shorelineMs`.
3. `app.js` ruft diesen Pfad nur für chunkbasiertes, nicht finales Rendering auf, wenn Worker und OffscreenCanvas verfügbar und aktiviert sind. Die Daten enthalten nur serialisierbare Welt-/Wet-Zellen, Segmente innerhalb des Chunk-Halos, benötigte Küstenbildpfade, Rasteroptionen und Mündungsportale. In temporärem Ufermodus werden keine sechs unnötigen Ufertexturen hochgeladen.
4. **Fallback-/Exportparität:** `shorelineChunks.buildTile` bleibt eine normale Funktion. Ohne Worker sowie beim finalen PNG-Export wird `VedrasShoreline.build` weiterhin synchron ausgeführt. Bei einem Fehler einer Shoreline-Worker-Aufgabe wird nur dieser Pfad für die Sitzung deaktiviert und derselbe Canvas-Fallback ausgeführt; andere Terrain-Worker-Jobs werden nicht absichtlich deaktiviert. Spät empfangene ImageBitmaps ohne zugehörigen Job werden geschlossen.
5. **Messpunkte:** `window.VedrasAssetLabor.shorelineBuildStats()` liefert `mainBuilds`, `workerBuilds`, `workerFailures`, `lastMainMs`, `lastWorkerRoundTripMs` und die bestehenden Worker-Statuswerte. Das erlaubt im Browser künftig die tatsächliche Verlagerung und deren Kosten zu überprüfen. Worker- und Canvas-Zählungen sind **keine** vorliegenden FPS-Verbesserungen.
6. Script-Versionen in `index.html` und die Worker-URL wurden für frisches Laden angepasst. Die Warteschlangen, Fog-/Coast-Readiness aus dem vorangehenden Bugfix, LOD-Parameter, Assets, Sprite- und Ground-Komposition sowie GPU-Optionen bleiben unverändert.

### Prüfung

- **Neuer Test:** `tests/test_shoreline_worker_step8_20261027.cjs`, 8/8 isoliert: synchroner finaler Export, kein-Worker-Fallback, erfolgreicher Worker-Build, fehlerhafter Shoreline-Job mit Canvas-Fallback, Worker-Dispatch/Bitmap-Transfer, Client-Resultat/Statistiken, Freigabe verwaister Bitmaps, Verdrahtung und Script-Versionierung.
- **Zusammen mit Regressionen:** **71/71** fokussierte Testfälle über eine simulierte V8-/Node-API-Umgebung: 8 neu, 5 Küsten-/Wolken-Fix, 9 Schritt-7-Priorität, 13 ältere Chunk-Priorität, 8 World-Tile, 10 Recovery, 8 LOD-Qualität, 10 gezielte Cache-Invalidierung. Getestete JavaScript-Quellen syntaktisch gültig.
- **Nicht durchgeführt:** nativer `node --test`-Durchlauf, lokaler Server/Build, tatsächliche Worker-Verfügbarkeit, Bitmap-Parität und Browser-FPS-/p95-Messung auf der großen Szene. Status daher **teilweise**. Der zuvor gemeldete Performanceengpass ist damit **noch nicht als behoben nachgewiesen**.

### Verpflichtende Browser-Abnahme vor Schritt 9

1. Komplett neustarten/hart aktualisieren. Bei einer Küste und festem Zoom `VedrasAssetLabor.shorelineBuildStats()`, `tileDiagnostics({limit:100})`, `worldTileStats()`, `cameraStats()` vor/nach Kartenaufbau aufzeichnen.
2. **Worker aktiv:** `shorelineJobs`/`shorelineCompleted` steigen, `shorelineFailed===0`. Vergleiche die sichtbaren Küsten mit Worker deaktiviert; Küstenform, Flussmündungen, Kanten, Ecküberlagerungen und Tile-Grenzen müssen übereinstimmen.
3. **Export:** PNG mit und ohne Worker-Funktion sowie die große Szene bei deaktivierter Worker-Option kontrollieren. Keine neu auftauchende Küstenlücke, keine verzögerte Veröffentlichung eines unvollständigen Exportbildes.
4. **Zoomen:** Wiederholt über `far/mid/near`-Schwellen zoomen und zurück. Beobachten, dass fertige Tiles ohne chunkweises Alpha-Flackern angezeigt werden, während unvollständige Bildbereiche weiterhin nur hexweise korrekt bewölkt sind. LOD-/Fallback-Raster und Küsten-Aufträge nach maximaler Wartezeit vollständig nachvollziehen.
5. Gleiche Karte, Viewportgröße und Interaktionsfolge gegen die Version vor dem Bugfix und ohne Worker messen: Hauptthread-Blocking, FPS, p50/p95-Framezeit, `worldTileBakes`, `shorelineBuildStats`, Cache-Budget. Erst danach eine Performanceverbesserung beziffern und Schritt 8 vollständig akzeptieren.

**Offen:** Der Nutzer hat weiterhin einen störenden Zoom mit Wolken- und Küstenlücken gemeldet. Die Logik wurde gezielt korrigiert und die Shoreline-CPU-Arbeit verlagert, die echte große Karte jedoch nicht erneut im Browser überprüft. Weitere Fixes sind ggf. nötig; **kein Anspruch auf vollständig behobene Symptome**.

## Korrektur – stabile Natur-Sprite-Tiefenstaffelung beim Schwenken (2026-10-27)

**Meldung:** Der neue Bildschirmvergleich zeigt Bäume mit falscher Kronen-/Stammüberdeckung; nach Wegscrollen und Zurückschwenken wechseln die Überlappungen. Betroffen war besonders die v0.22.x-Tile-Kamera mit vorbereiteten Sprite-Tile-Overhangs.

**Ursache im Code:** `drawMapObjects` sortiert Nature-/Berg-/Gebäudesprites einheitlich nach projiziertem `groundY` und beachtet Bergokklusion. `world-tile-streamer.js` zeichnete die Szene dagegen als Sequenz je 512er-**Tile** inklusive überhängender Sprite-Pixel. Überlappten zwei Bäume, deren Anker verschiedenen Tiles angehören, war nicht die Bodenposition, sondern die Reihenfolge dieser bereits zusammengerechneten Tilebilder ausschlaggebend. Die von einem großen Scene-Snapshot abgeschnittenen Tilebilder konnten zudem dieselbe Baumkrone in mehreren gepufferten Tile-Overhangs enthalten.

**Fix:** World-Tile-Ground bleibt separat und wird weiterhin ausschließlich innerhalb der Tilekerne gezeichnet. Die schnelle Kamera liefert nun `drawStatic:drawFastStaticScenery`: vor separat behandelten dynamischen Units wird einmal pro Frame die **eine global nach Bodenposition sortierte** statische Natur-Ebene aufgetragen, mit derselben `VedrasStaticObjects`-Zwischenspeicherung und exakt derselben Scene-Signatur wie der normale Editor. Aus einzelnen World-Tile-Szenen wird in diesem Modus **nicht mehr** gezeichnet. Die bekannte Hex-Fog- und überhängende Crown-Clipping-Reihenfolge bleibt erhalten. Bestehende World-Tile-API ohne `drawStatic` sowie Finalexport funktionieren weiter mit dem bisherigen Vertrag.

**Teststand:** Fünf neue isolierte V8-Fälle (`tests/test_fast_camera_global_scenery_depth_20261027.cjs`) und **33 weitere Regressionen**, zusammen **38/38**, bestanden. Insbesondere waren bei zwei benachbarten World-Tiles nur die Ground-Bilder und genau eine globale Szene sichtbar; ein Schwenk änderte die Reihenfolge nicht und die statische Bildfläche wurde beim kleinen Pan wiederverwendet. **Nicht ausgeführt:** nativer Node-Test, Browser-/GPU-Lauf und Performanceprofil der 397-Feld-Szene. Der erste Aufbau/Viewport-Verlassen kann weiterhin die globale Sprite-Zeichenfläche neu erstellen; reale FPS müssen gemessen werden.

**Akzeptanz:** Bäume mit Ankern in verschiedenen Chunks an einem Waldsaum beobachten, wegscrollen und zurück. Bei unverändertem Karteninhalt darf sich die lokale Kronen-/Stammreihenfolge weder beim Pan noch beim LOD-Wechsel ändern. p50/p95-Framezeit und `sceneryStats()` messen, um die Kosten neuer Scenery-Builds einzuschätzen.

## Bugfix – Modus „6 Ufergrafiken“ zeichnet prozedurale Testküsten (2026-10-27)

**Gemeldeter Fehler:** Obwohl im Editor **„6 Ufergrafiken“** ausgewählt war, erschienen weiterhin die alten prozeduralen Testkanten.

### Codeursache und Korrektur

1. Das Worker-Protokoll aus Schritt 8 überträgt Küsten-PNGs als `ImageBitmap`, das `width`/`height`, **nicht** `naturalWidth`/`naturalHeight` anbietet. `shoreline.js` nahm allein `asset.naturalWidth` als Erfolgskriterium und zeichnete bei `ImageBitmap` selbst im Grafikmodus den temporären Linien-/Farbfallback. Nun erkennen beide Bildtypen dieselbe gültige Grafik.
2. Im Grafikmodus `mode:'art'` darf eine fehlende Grafik nicht mehr stillschweigend eine Testgrafik ersetzen. `VedrasShoreline.build` liefert dann `canvas:null,missingSides:[...]`. Die Anwendung prüft vorher, ob für tatsächlich benutzte Uferseiten die PNGs im Assetpool dekodiert sind, und zeigt im Status die fehlenden Seitennummern an. Teststriche werden **nur** in `mode:'temp'` erzeugt.
3. Die FrameMemo-Signatur umfasst jetzt Modus, Breite und Überhang; bei Änderungen an Modus, Aktivierung oder Testparametern werden bestehende Shoreline-Chunks, alte World-Tile-Bitmaps und der Retained-Background-Canvas aktualisiert. Dies verhindert, dass zuvor gezeichnete Testkanten nach Auswahl der sechs PNGs erneut angezeigt werden.
4. Der Default für eine neue Szene ist `art`. Bestehende gespeicherte Einstellungen behalten einen **explizit ausgewählten** temporären Modus; Szenenimport/Restoration normalisieren ungültige Moduswerte auf `art`. Die Uferseiten-/Eckentest-Buttons verändern die aktuelle Grafikmodus-Auswahl nicht mehr.
5. Browser, Terrain-Worker und dessen Script-Ladekette haben neue Cache-Query-Versionen, damit keine alte, lediglich über `naturalWidth` prüfende Worker-Datei im Hintergrund weiterläuft.
6. **Regressionen:** `tests/test_shoreline_art_bitmap_mode_20261027.cjs` mit sieben Tests deckt HTMLImageElement, transferiertes ImageBitmap, fehlende Assets, expliziten Testmodus und den Modus-/Versionswechsel ab. Ältere Tests mit veralteten Script-Versionen und selektiver alter Cache-Erwartung wurden an die neuen Garantien angepasst.

**Status:** isolierte JavaScript-/V8-Tests des Renderingpfads geprüft, Browser/echtes Worker-ImageBitmap mit den realen sechs PNG-Dateien und visueller Küstenabgleich noch ausstehend. Sollte das Bild unverändert bleiben, muss kontrolliert werden, ob die aktuelle Serverinstanz tatsächlich den neuen `main`-Stand ausliefert.

Die bereits vorher separat implementierte **globale Sprite-Tiefensortierung** aus PR #53 verhindert, dass Bäume nach einem Schwenk je nach Tile-Compositing unterschiedlich überlappen. Eine native Browserprüfung dieser Überdeckung und der Framezeiten steht ebenso aus.

## Schritt 9 – Progressive Anzeige ohne unfertige Bildfreigabe (2026-10-27)

**Basis:** `main` `f13273c5d2eca8cc27a7debce323b03e83fb715c`, Branch `rendering/step9-progressive-compositing-20261027`. Ziel: die vorhandenen `far/mid/near`-Alternativ-LODs und provisorischen, aber inhaltlich **fertigen** Bilder sicher wiederverwenden, während vollständig fehlende Raster weiterhin unter der authentifizierten/Editor-Hexmaske bleiben.

### Durchgeführte Änderungen

1. **World-Tile-Freigabe:** `accept()` lässt `complete:false` und Pakete ohne Terrain/Ground nicht mehr in den Cache. Bei `requireScenery:true` muss die komplette Scenery-/Structures-Ebene bereits enthalten sein. Dass `seed()` fertige Bilder direkt einträgt, umgeht die Freigabe nicht. Fehlende Küsten-/Sprite-Assets bleiben durch die bestehenden `tileArtworkStatus()`-Gates gesperrt. Das ist ein **Vollständigkeits-**, kein Bildauflösungs-Gate.
2. **Qualitätsstabile Übergänge:** `lookup(t)` bevorzugt ein scharfes Raster der angefragten LOD. Fehlt es, wird ausschließlich ein weiteres **vollständiges** LOD-Paket ausgewählt. Seine tatsächliche Quelldichte schlägt eine verschwommenere `preview:true` derselben angefragten LOD. Ground und Scenery stammen immer aus demselben Paket – keine temporäre Mischung verschiedener LODs.
3. **Cache-Schonung:** `trim(visibleSourceKeys())` schützt die im gerade sichtbaren Weltbereich tatsächlich präsentierte LOD-Variante vor LRU-Eviction, bis deren Ersatz bereit ist. Nicht sichtbare und aktuell nicht gezeichnete Qualitätsvarianten bleiben entsprechend den bestehenden Pixelbudgets freigebbar. Keine Änderung an LOD-Schwellen oder konfigurierten DPR-Grenzen; diese gehören in Schritt 10/11.
4. **Wolken als echte Freigabesperre:** `cloud-artwork.js` legt unter jedes noch nicht fertig freigegebene, sichtbare Hex eine vollflächige, opake Hex-Füllung **vor** die weiterhin gezeichneten Wolken-PNGs (welche transparente Pixel besitzen können). Sind die Wolkenbilder noch nicht geladen oder fehlt `fog-atmosphere.js`, erzeugt `world-tile-streamer.js` selbst eine deckende Hexmaske. Die Abdeckung wird nach statischen Sprites und dynamischen Einheiten aufgetragen. Damit gibt auch eine transparente Wolkentextur keine unfertige Szenerie frei; unbekannte Gebiete werden im bestehenden Fog-Gate weiterhin ausgelassen.
5. **Diagnose und UI:** `worldTileStats().progress` und das Fast-Kamera-Statusfeld unterscheiden `exact` (scharfes Ziel-LOD), `fallback` (anderes vollständiges LOD), `provisional` (vollständiges Qualitäts-Preview der Ziel-LOD) und `missing` (noch kein auslieferbares Bild). Die Einzeldiagnose enthält `displayedLod`, `displayedPreview` und `displayedDensity`, zusätzlich zum bisher angeforderten `lod` und `sourceDensity`. Für die Zähler werden ausschließlich wirklich bildschirmberührende Tiles berücksichtigt.
6. Für die drei geänderten Browserdateien (`cloud-artwork.js`, `world-tile-streamer.js`, `app.js`) wurden Query-Versionen in `index.html` angepasst; ältere quellentextgebundene Versionstests entsprechend aktualisiert. Terrain-Generierung, Strand-/Sprite-Assets, Road-/River-Worker, Bildexport, Fog-Berechtigungsmodell und Work-Steuerung bleiben unangetastet.

### Isolierte Testabnahme und offene Grenzen

- Neuer Test `tests/test_progressive_tile_readiness_step9_20261027.cjs`: **9/9**, darunter: alter LOD bleibt während des Upgrades sichtbar; scharfer älterer LOD schlägt schlechteren Preview; vollständiger neuer Ziel-LOD ersetzt das alte Bild atomar; unvollständiger Seed erhält Wolkenmaske/Fallback; Ground-only ohne Scenery wird nicht angezeigt; `unknown`-Tiles werden nicht gezeichnet; Budget-Eviction erhält die aktuell benutzte Fallbackgrafik; transparente Wolken-PNGs erhalten opake Hex-Unterlegung; Versions-/Statusanzeige.
- Vorhandene 11 Testdateien für Küsten/Worker/Bäume, Schritt 6, Queue, Tile-Recovery, LOD-Qualität und Cache-Invalidierung: **89/89** in demselben simulierten V8-/Node-API-Harness. **Gesamt: 98/98** gezielte simulierte V8-Tests. JavaScript-Syntax der geänderten Quellen geprüft.
- **Nicht ausgeführt:** `node --test` nativ, lokaler Server-/Buildstart, visuelle Browser-/GPU-Tests an der echten Karte, p50-/p95-/FPS-Messung und tatsächlicher Speichervergleich. Diese Ergebnisse dürfen nicht als reale Leistungsabnahme ausgegeben werden. **Status: teilweise**.

### Browserabnahme vor Schritt 10

1. Frischen `main`-Stand starten und mit Strg+F5 die neuen Script-Query-Versionen laden.
2. Über mehrere Zoomwechsel rund um 0,42/0,49 und 0,94/1,08 nach `far/mid/near` beobachten: alte vollständige Raster müssen bis zum qualitativ besseren Ziel-LOD angezeigt werden, ohne rechteckige Leerstellen oder zeitweise fehlende Vegetation. LOD-Schwellen **nicht** in Schritt 9 verändern.
3. Bei einer künstlich verzögerten vollständigen Terrain-/Scenery-Quelle `VedrasAssetLabor.worldTileStats().progress` (exakt/fallback/provisorisch/fehlend) und `tileDiagnostics().world.tiles[].displayedLod` prüfen. Ein fehlendes Scenery-Layer darf auch bei vorhandenem Boden nicht als Bild freigegeben werden.
4. Wolken mit PNGs und bei verzögertem Laden dieser Bilder prüfen: Unfertige sichtbare Hexe müssen unter einer vollständig deckenden Hexmaske bleiben; kein Layer-, Schatten- oder Küsten-Pixel darf durch transparente Wolkenpixel hindurchscheinen. Auch `fogPreview` prüfen.
5. Auf der dicht bewachsenen 397-Hex-Karte Küstenübergänge und die globale Baumstaffelung beim wiederholten Pan/Zoom beurteilen. Median/p95, Worker-Backlog, Bildcache-Budget und Anzahl neu gebackener World-Tiles gegen denselben gespeicherten Stand vergleichen.
6. Native Tests und Browser-Screenshots nachholen; bis dahin Schritt 9 nicht als vollständig abgenommen markieren.

**Weiter:** Erst nach sichtbarer Browserabnahme den LOD-Vertrag (Schritt 10) überarbeiten; kein vorzeitiges Anheben auf 4× oder Auswechseln der bestehenden GPU-/Worker-Architektur.

## Schritt 10 – Gemeinsamer Welt-/Region-/Lokal-LOD-Vertrag (2026-10-27)

**Basis:** `main` `644452b8c689b2c2d5aea13ca64fddec35cb7015` nach Schritt 9, Branch `rendering/step10-unified-lod-contract-20261027`. Getrennt von Strategieansicht `state.mode='far'`, die weiterhin ihre bisherige eigene Umschaltbedingung besitzt.

### Beobachteter Ausgangszustand

- `adaptive-lod.js` wählte für **Terrain, Ufer, Fluss, Straße und Wald** anhand des Zooms `far/mid/near` mit `initial far<.51; near>=.99`, Schwellwerten `.55/.47` und `1.06/.92`.
- `world-tile-streamer.js` wählte bisher unabhängig davon `far/mid/near`, mit abweichenden Hysteresegrenzen (`1.08/.94` und `.42/.49`). Bei identischem Zoom konnten daher World-Tile-Caches und Terrain-/Ufer-Raster unterschiedlichen Qualitätsstufen zugeordnet werden. Das war ohne Qualitätsgewinn eine Ursache möglicher wiederholter Detail-Aufträge nach Zoomwechseln.
- Die vorhandenen Ausgaberasterdichten `far=.85`, `mid=1.5`, `near=2.5` Welt-Tile-Pixel je Welt-Einheit und die Terrain-/Küsten-/Fluss-/Straßen-Faktoren werden **nicht** angehoben. Die adaptive Qualitäts- und DPR-Regel aus Schritt 11 bleibt unberührt.

### Implementation

1. `adaptive-lod.js` ist die **einzige kanonische Quelle** der Levelprofile, Welt-Tile-Rasterdichten und hysteretischen Zoomgrenzen. `far`=`scope:'world'` (Welt), `mid`=`scope:'region'` (Region), `near`=`scope:'local'` (Lokal); bei `full` bleibt der Editorfaktor 1, World-Tiles verwenden das vorhandene `near`-Raster. Geometry/Coast/Road-Konturen, Weltkoordinaten und Wolkenregeln bleiben gleich.
2. `app.js` erzeugt den `adaptiveLOD`-Controller früh **genau einmal** und übergibt dem World-Tile-Streamer den Callback `lodSelector:zoom=>updateTerrainLod(zoom)`. Terrain-`lodProfile()` und World-`chooseLod()` benutzen damit **denselben Hysteresezustand**, nicht lediglich dieselben Konstanten. Reine Kameraverschiebung bei gleichbleibendem Zoom ändert weder LOD-Profil noch Tile-Schlüssel und fordert aus vollem Cache keine neue Rasterberechnung an.
3. `world-tile-streamer.js` nimmt optional `lodSelector` entgegen. Für externe eigenständige Verbraucher erzeugt es einen eigenen Controller von `window.VedrasAdaptiveLOD.create()`; fehlt die Datei, greift ein rückwärtskompatibler Hysterese-Fallback mit identischen Grenzwerten einschließlich des **Initiallevels**. `worldDensity` wird aus dem gemeinsamen Modul gelesen. Der vorhandene Streaming-/Source-/Retry-/Fog-Vertrag bleibt erhalten.
4. Bestehender Schalter `state.adaptiveLod=false` beziehungsweise Finalexport lässt das Terrain-/Ufer-Profil `full` wählen, ohne den interaktiven Hysteresezustand zu überschreiben. World-Tiles ordnen `full` dem vorhandenen `near`-Raster zu; keine zusätzliche vierte Tile-Cacheklasse.
5. `VedrasAssetLabor.lodStats()` gibt nun neben Profil, Tier und Wechselzahl die aktuell vom World-Compositor genutzte Detailklasse und deren Pixel-Dichte zurück; `worldTileStats()` meldet `scope` und `lodDensity`. Die Script-Query-Versionen wurden in `index.html` für alle drei betroffenen Dateien aktualisiert. Ein separater visueller `state.mode='far'`-Strategieansichtswechsel wurde nicht verändert.
6. Für bestehende Qualitäts-Regressionstests wurde der Testzoom auf `.8` gesetzt, da `zoom=1` gemäß dem kanonischen Vertrag jetzt **Lokal** statt vorher unabhängigem World-Tile-`mid` entspricht. Das testet weiterhin Preview-Upgrade und selektives Neuladen, ohne alte Fehlgrenzen zu konservieren.

### Prüfstatus und konkrete Browserabnahme

- **Neue Regressionen:** `tests/test_shared_lod_contract_step10_20261027.cjs`, **12/12** in simulierter V8-/Node-API-Laufzeit: identische Schwellwerte, stabile Hysterese, Welt-/Region-/Lokal-Typ, identische Controllerwahl, Standalone- und Legacy-Fallback, deaktiviertes Adaptive-LOD/`full`, Export ohne interaktive Änderung, Pan ohne Source-Neuaufbau, Fallbackdarstellung, Script-Versionierung und unveränderte DPR-Sperre.
- **Bestandsregressionen:** 11 fokussierte Suites mit **98/98** in derselben V8-Laufzeit (einschließlich progressiver LOD/Fog, Worker, Küsten-PNG, Naturstaffelung, LOD-Qualität, Chunk-Recovery, Priorität und Cacheinvalidierung). **Gesamt: 110/110** simulierte Testfälle bestanden; die drei bearbeiteten JS-Module auf Syntax geprüft.
- **Offen:** Nativer `node --test`-Lauf, Webserverstart, Live-Browser mit der gespeicherten großen Szene und realer Performance-/Speicher-/Canvas-Nahtvergleich. Das ist **kein** nachgewiesener FPS- oder p95-Gewinn. Status **teilweise**.
- **Akzeptanzsequenz:** Frischen Browserstand laden; die Zoomgrenzen `0.47/0.55` und `0.92/1.06` wiederholt von beiden Richtungen durchqueren. `VedrasAssetLabor.lodStats()` und `worldTileStats()` nebeneinander lesen: bei aktiviertem Adaptive-LOD müssen `tier` und `worldTile` gleich sein, ebenso `worldTileDensity`/ `lodDensity`. Bei reinem horizontalen/vertikalen Pan dürfen `changes` und `worldTileBakes` auf geladenen Tiles nicht ansteigen. Küsten-/Wald-/Fluss-/Straßenränder auf Nähte und LOD-Schärfesprünge prüfen. Unfertige Tiles bleiben hexweise verdeckt. Danach erst Schritt 11 separat untersuchen.

## Schritt 11 – Interaktive 4×-Qualität mit messbaren Budgets (2026-10-28)

**Ausgangsstand:** `main` `fc80e26d52bc97b38f7417d79cf26a0e03f2b1bf` (Schritt 10); Implementierungsbranch `rendering/step11-dpr-quality-budgets-20261028`.

### Befund vor Umsetzung

- Trotz UI-Wahl `4×` begrenzte `app.js:deviceRatio()` **jede** dichte interaktive Szene mit mehr als 500 Nature-Instanzen auf `1.5×`, unabhängig von verfügbarer Canvas-Fläche. Zusätzlich kappte `fastView()` selbst ein höher aufgelöstes Editorcanvas unabhängig davon auf **maximal 2×**.
- Retained-Background und Sprite-Scenery hatten jeweils ein eigenes **12-Megapixel-Budget**; selbst erlaubte 4×-Ansichten verloren dadurch leicht die Wiederverwendung und fielen auf teures Direktzeichnen zurück. Der Bildpool reduzierte Quellbilder unabhängig vom gewählten Qualitätsprofil grundsätzlich auf **512 px Terrain bzw. 1024 px Sprites**. Bereits dekodierte kleine Bilder blieben nach Qualitätswechsel unverändert.
- Die GPU-/Finalexport-/World-Tile-Verträge und die Bildqualität auf der konkreten großen Karte waren nicht auf Laufzeitprofiling überprüft. **Diese Änderung setzt keine gemessene FPS-Steigerung voraus und behauptet keine.**

### Umsetzung und harte Grenzen

1. **`render-quality-policy.js` (neu):** Rein berechnete Qualitätsprofile. Gewählt `fast` = höchstens `0,8×` bei `1,3 MP`, `auto` = höchstens `1,35×` bei `3,2 MP`, explizite `1×/2×/3×/4×` = angeforderter Faktor mit **14 MP interaktivem Canvas-Budget**. Bei `objects=true` und `natureCount>500` gilt für das interaktive Canvas **8 MP**, damit auch große Waldszenen ein vorhersehbares Rasterbudget behalten. In beiden Fällen begrenzen **4096 physische Pixel pro Achse** zusätzlich die Ausgabefläche. Ein 800×450-CSS-Pixel-Fenster erreicht bei Auswahl 4× sogar in dichten Szenen echte 4×; bei größeren Viewports wird die **wirksame** DPR nachvollziehbar reduziert. Kein erzwungener 1,5×-Deckel mehr.
2. **Gemeinsamer DPR im Editor und Fast-Compositor:** `deviceRatio()/resize()` verwenden denselben Qualitätsentscheid. `fastView()` reicht genau `state.dpr` weiter, statt weiter stillschweigend höchstens 2× zu zeichnen. Das DPR wird auch bei unveränderten gerundeten Canvasabmessungen synchron gehalten. Die Anwendung berechnet die Obergrenze bei Qualitätswechsel, Display-DPR-Änderung, Canvasgrößenänderung, Nature-Änderungsereignis oder Aktivierung/Deaktivierung der Nature-Layer neu; **kein DPR-Wechsel bei einfachem Pan**.
3. **Retained-Canvas-Budgets:** `backgroundScene` und `staticScenery` besitzen je ein **17-MP-Hardlimit**, mit automatisch reduzierbarem Overscan und `minPadding:24`. Damit ist hochauflösender kleiner Pan öfter aus dem vorbereiteten Cache darstellbar statt vollständiger Neuberechnung. Die Budgetprüfung in `static-object-layer.js` bleibt erhalten; oberhalb der Grenze wird weiterhin konservativ direkt gezeichnet. Das sind **getrennte** 17-MP-Limits, kein beliebig großer gemeinsamer Pixelpool.
4. **Bildquellen bedarfsgesteuert statt global löschen:** `asset-image-pool.js` bietet `setPreviewLimits()`; Quellgrenzen je Qualität: `fast/auto/1×: 512/1024`, `2×: 768/1536`, `3×: 1024/2048`, `4×: 1536/2048` Pixel (Terrain/Sprites). Bereits sichtbare Sprites/Terrainbilder werden erst bei erneutem `ensure()` und Bedarf als größere Quelle geladen. Bis zum Erfolg bleibt die alte Grafik im Einsatz; bei einem Upgrade-Fehler wird sie nicht gelöscht. Nur **eine** große Bitmap-Promotion läuft parallel; bestehende normale Neuladevorgänge nutzen weiterhin ihre übrigen Slots. Bei Erfolg wird die Differenz im dekodierten Budget korrekt gebucht, eine Bildrevision ausgelöst und die bestehende selektive Scenery-/Terrain-Invalidierung verwendet. Das ursprüngliche Bildpoolbudget bleibt **192 MiB**.
5. **Klare visuelle Diagnose:** Direkt unter Renderqualität zeigt `#qualityStats` ausgewählte und **tatsächliche** DPR, Begrenzungsgrund, resultierende Canvasabmessungen und Quellgrafikziele an. `VedrasAssetLabor.qualityStats()` liefert den vollständigen Budget-/Auflösungsentscheid inklusive `images`, `background`, `scenery`. Quellen können selbst dann weniger Bilddetail aufweisen, wenn das Ausgabecanvas 4× groß ist (z. B. World-Tile-`near` bleibt `2,5` Pixel pro Welt-Einheit und manche Original-Sprites sind klein); eine höhere DPR erfindet keine Pixel.
6. **Finalexport unverändert:** Die bisherige exportseitige Wahl `2×` mit `18 MP`-Budget und `previewDensity()=1.5` sowie temporären Originalbildern bleibt erhalten. Exportbezogene Cache-/Bitmap-Regeln und der Terrain-/Welt-LOD-Vertrag werden nicht angehoben; diese Arbeit betrifft die interaktive DPR-Steuerung. Keine Änderung am Fog-Berechtigungsmodell, Shoreline-Algorithmus oder der globalen Naturstaffelung.
7. `index.html` lädt nun die Qualitätsentscheidung vor `app.js`, aktualisiert den Versionsparameter des Asset-Pools und von `app.js`. Der Qualitätsstatus wurde als lesbares UI-Element neben der Auswahl ergänzt.

### Prüfungen und verbleibende Browserabnahme

- Neuer fokussierter Test `tests/test_interactive_quality_step11_20261028.cjs`: **14/14** simulierte V8-Fälle für 4× bei passendem Viewport, 8-/14-MP-Regeln, 4096er-Achsenlimit, kleine und extreme Bildfenster, Auto/Schnell-Profil, Original-PNG-Export, bedarfsgesteuertes Upgrade und Fehler-Fallback, korrektes Poolbudget, höchstens eine gleichzeitige hochauflösende Promotion, identischen DPR in beiden Kameras und die Layer-Pixelgrenzen.
- Bestehende 12 fokussierte Regression-Suites aus Schritten 3–10: **110/110** isolierte V8-/simulierte Node-API-Fälle nach Anpassung lediglich der bisherigen Textassertionen zu Script-URLs und zur entfernten 1,5×-Grenze. Gesamt **124/124** fokussierte simulierte Fälle. Produktionsdateien auf JavaScript-Syntax geprüft.
- **Nicht durchgeführt:** nativer `node --test`-Lauf, Webserver-/Browserstart, echter GPU-/Speicher-Footprint, reale p50-/p95-/FPS-Messung mit der gespeicherten großen 397-Hex-Szene. Der Workload kann bei 4× weiterhin merklich mehr Speicher-/Canvas-Bandbreite brauchen. **Schritt 11 ist bis zu realer Browserabnahme nur teilweise akzeptiert.**

**Verbindliche Browserkontrolle:** `main` neu laden, Server neustarten und Strg+F5; gleiche Kamera/Zoom/DPR auf leerer und dichter Karte bei Schnell, Auto, 1×, 2×, 3×, 4× ausprobieren. Sichtbares `#qualityStats` und `VedrasAssetLabor.qualityStats()` auf angeforderte/wirksame DPR, Canvasgröße und Budget achten. In der Fast-Kamera denselben effektiven DPR und scharfe UI-Kanten prüfen; beim Schwenken keine DPR-Änderung und keine unnötigen Cache-Neubauten zulassen. `imagePool.report()`: `promoted`, `promotionFailures`, `activeUpgrades<=1`, `decodedBytes` beobachten, besonders beim Hoch-/Runterschalten. Anschließend PNG-Export unverändert vergleichen. p50/p95 und Memory des alten/neuen Stands erst **bei gleichem Karten-/Zoom-/Viewport-Szenario** bewerten.
