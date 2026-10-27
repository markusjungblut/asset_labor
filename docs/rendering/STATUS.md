# Rendering-Status

**Stand:** 2026-10-27  
**Repository:** `markusjungblut/asset_labor` (`main`)  
**Schritt 4:** **Kamera-Komposition mit Qualitätsnachbesserung implementiert und isoliert geprüft; native Node- und echte Browser-Abnahme weiterhin offen.**  
**Ausgangscommit für Schritt 4:** `d465bf32002de6c85cfd2e51586f8572ec449b7a`  
**Schritte 1–3:** Implementierungsstand aus bisherigen Commits beibehalten. Die noch offene Browserprüfung von Schritt 3 bleibt ausdrücklich offen.  
**Schritt 5:** **Selektive Cacheinvalidierung implementiert und isoliert geprüft; native Node- und Browser-Abnahme ausstehend (teilweise).**  
**Schritt 6:** **Statische Natur-/Schatten-Tiles von beweglichen Einheiten getrennt, isoliert geprüft; native Node- und Browser-Abnahme noch offen (teilweise).**  
**Nächster Entwicklungsinhalt:** Native Tests und Browser-Abnahme der Schritte 3–6, danach Schritt 7.

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
- **6/6 dieser Testfälle** in einem isolierten JavaScript-V8-Testharness mit nachgebildeten `node:test`-/`vm`-Schnittstellen bestanden. Ergänzend sind `app.js`, `static-object-layer.js` und `world-tile-streamer.js` in V8 geparst worden.
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
