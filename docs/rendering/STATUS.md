# Rendering-Status

> **Schritt 15:** Reale 397-Hex-Windows-Diagnose wurde ausgewertet (4×-Pan: 12 Terrain-Fallbacks, 1128 ms; Auto-Pan: 25, 3014 ms; 4×-Zoom: 0 bei bereits bereiten Tiles). [Messanleitung](STEP15_TILE_CAMERA_DIAGNOSTICS.md). **Schritt 16:** [Ground-Reuse/Revisionstrennung](STEP16_GROUND_REUSE.md) implementiert, **Performance-/Bildabnahme auf Windows offen**. Schritt 17 noch nicht freigegeben.

> **Nächste Entwicklungsreihenfolge:** [Verbindlicher Rendering-Fahrplan nach Schritt 14 – Schritte 15–20](RENDERING_ROADMAP_AFTER_STEP14.md). **Nächster offener Schritt ist 15**, keine GPU-Migration vor den Ursachen-/Cachetests. Ergebnisse und Abnahmen in diesem Statusdokument nachtragen.

**Stand:** 2026-10-29  
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
**Schritt 12:** **Fog-Berechtigungsmaske und unbekannte Frontier-Hexe gegen Sprite-/Schatten-Überhänge abgesichert; Wolkenbilder ohne Rotation, weltverankert und mit opakem Underlay. 136/136 fokussierte simulierte Tests erfolgreich, Browser-Grafik-/GPU-Abnahme offen (teilweise).**  
**Schritt 13:** **Chromium-CDP-Messskript und reproduzierbares Browser-Abnahmeprotokoll hinzugefügt; reale 397-Hex-/GPU-/Visual-Abnahme weiterhin ausstehend (teilweise).** Vier lokale native Node-CLI-Tests bestanden; ein isolierter Chromium-Start erreichte CDP, doch die Assistenz-Browserumgebung blockierte die localhost-Szene. Kein gemessener FPS-Gewinn behauptet.
**Nächster Entwicklungsinhalt:** Schritt 13 mit gespeicherter 397-Hex-Szene und Originalassets auf dem Zielrechner ausführen, Screenshots und p50/p95/Heap prüfen; erst danach fachlich abnehmen.

## Schritt 13 – automatisierte reale Browser-Abnahme vorbereitet (2026-10-28)

- **Neu:** `scripts/rendering-step13-browser.mjs` für echte Chrome-DevTools-Protokoll-Messung per Node 22+, ohne npm-Abhängigkeiten und ohne zusätzlichen CI-Workflow. Pro Qualitätsstufe (`fast`, `auto`, `1×`–`4×`) werden Pan und Zoom mit Fog-Preview aufgezeichnet. Ausgegeben werden PNG-Screenshots, JSON mit CDP-Heap-/Task-Zeit, rAF-p50/p95, Longtasks und Render-Cache-/LOD-Statistik sowie ein Markdown-Bericht. Die rAF-Zeiten dürfen **nicht** als gemessene `draw()`-Laufzeit missverstanden werden.
- **Neu:** `docs/rendering/STEP13_BROWSER_ACCEPTANCE.md` mit Verfahren für die gespeicherte 397-Hex-Nutzerszene und verbindlichen visuellen Abnahmepunkten für Küsten, Relief, Waldtiefe, Nebel-Fog, Bildqualität und Speicherdruck. **Keine Änderung** an Renderalgorithmus, Artwork, Schatten oder Relief; keine automatisierte CI-Ausführung.
- **Test:** `tests/test_rendering_step13_cli_20261028.cjs` – 4/4 native Node-Tests bestanden (CLI-Hilfe, localhost-Beschränkung, Qualitätswerte und Mindestdauer), JavaScript-Syntaxprüfung bestanden. Der Versuch eines isolierten Chromium-Smoke-Starts bestätigte Debug-Protokollzugriff, erreichte aber wegen der Netzwerkrestriktion der Assistenzumgebung nicht die lokale Testseite. Die originale gespeicherte 397-Hex-Szene ist dort ebenfalls nicht vorhanden.
- **Offen:** End-to-End-Messung auf der realen großen Karte, visuelle Screenshot-Abnahme, kompletter nativer Bestandsregressionslauf und GPU-/Speichervergleich auf derselben Zielhardware. **Schritt 13 bleibt teilweise.**

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

## Schritt 12 – Fog- und Schattenüberhänge an Hex-Fronten (2026-10-28)

**Basis:** `main` `238ab977381965723e02d776ceb4799274c756f7` nach Schritt 11. Branch `rendering/step12-fog-frontier-shadow-overhang-20261028`.

### Prüfung und bestätigte Risikostellen

1. `world-tile-streamer.js` erkannte eine leere ausdrückliche Fog-Freigabe nicht als Maske: `hasMask=Array.isArray(fog)&&fog.length>0` führte bei `setFogCells([])` oder `render({fog:[]})` zum **Aussetzen der Clipmaske**. Vorbereitetes Terrain, global sortierte Nature-/Gebäude-Sprites und Einheiten konnten dadurch trotz fehlender Freigabe hinter der Wolkenbasis gezeichnet werden. `fogConfigured` trennt nun den bislang zulässigen standalone-Sonderfall **ohne jemals gesetzte Maske** von einer ausdrücklich leeren Autorisierung: bei letzterer werden Ground, Scenery/Schatten und Dynamics auf einen leeren Pfad beschnitten.
2. Am äußeren Weltumriss und zwischen bekannten/unbekannten Hexen dürfen statische Baumkronen und projizierte Bergschatten über den geometrischen Rand hinweg verarbeitet werden (45-Welteinheiten-Halo). `cloud-artwork.js:drawTransitions` zeichnete bisher nur transparente Wolken-Hard-/Soft-Bitmaps darüber. Nun werden die **unbekannten Nachbar-Hexkerne nach der gesamten Sprite-/Schatten-Pipeline zuerst opak gefüllt**, dann **alle** Hard-Core-Clouds und erst danach **alle** Soft-Fringes gezeichnet. So kann die spätere Hard-Core-Textur einer Nachbarwolke nicht mehr bereits gezeichnetes Soft-Feathering überschreiben.
3. Der neue opake Frontier-Pass wird auch bei `bases.length===0` ausgeführt, solange die Wolkeneinheit geladen ist. In `world-tile-streamer.js` wird er im Cloud-Loading-Fallback ebenfalls aufgerufen; falls die Cloud-Moduldatei selbst fehlt, zeichnet `maskFrontierWithoutArtwork` aus axialen Nachbar-Koordinaten eine opake, weltverankerte Ersatzmaske. Es werden weder unbekannte Nachbar-Sprites freigegeben noch Rechteck-Überhänge sichtbar gemacht.
4. **Wolkengrafiken behalten ihre Beleuchtungsorientierung.** `fieldAt(q,r).rotation===0`; der Stempel übersetzt/skaliert für Perspektive, rotiert/spiegelt die vier originalen Wolken-PNGs aber nicht. Die Phase ist `q,r`-abhängig und bewegt sich beim Kameraschwenk ausschließlich mit Weltposition/Zoom, nicht mit der Bildschirmfläche.
5. **Schattenzeichnung geprüft und nicht umgebaut:** `drawMapObjects()` zeichnet Terrain-/Bergschatten vor den global tiefensortierten Sprites. Der World-Tile-Compositor zeichnet den globalen statischen Schatten-/Sprite-Pass vor den beweglichen Einheiten und erst danach die Wolken-Freigabe. Offscreen-Caches und die räumlichen Sprite-Überhänge behalten ihre bisherigen Budgets. `mountainShadowDefaults`, der globale Schattenregler und die Relief-Engine bleiben unverändert.
6. **Sumpf-Fund geklärt:** Die zuvor auffällige Zweiteilung war vom Nutzer auf das Relief zurückgeführt; kein Forest-Transition-, Chunk-Naht- oder Schattenfehler daraus abgeleitet. **Keine Relief-Änderung** in Schritt 12.
7. Versionen `cloud-artwork.js` und `world-tile-streamer.js` wurden in `index.html` aktualisiert. Bestehende alte versionsbezogene Assertionen aus Schritt 9/10 entsprechend aktualisiert; `app.js` und die anderen Renderingdateien bleiben unverändert.

### Abnahmegrenzen

- Neuer fokussierter Test `tests/test_fog_shadow_overhang_step12_20261028.cjs`, **12/12** in isoliertem V8/Node-API-Mock: komplett leere Fog- und Unknown-Only-Autorisierung, Standalone-Fallback, Schatten-/Baumüberhang, unbekannte Nachbarhex-Deduplizierung, Weltkoordinaten und Perspektivprojektion, stabil orientierte Cloud-PNGs, Soft/Hard-Pass-Reihenfolge, Landschaftsgrenze, komplett fehlende Cloudbibliothek und unveränderte Schatten-/Relief-Pipeline.
- Die bisherigen **124/124** fokussierten Rendering-Regressionstests aus Schritt 3–11 bestanden in denselben simulierten JavaScript-Testharnesses. **Gesamt: 136/136 isolierte V8-Testfälle**. Die geänderten Produktions-JS-Dateien syntaktisch geprüft.
- **Nicht durchgeführt:** nativer `node --test`-Durchlauf, Webserver-/GPU-Lauf, visuelle Browserbildabnahme auf der gespeicherten 397-Hex-Karte, effektive p50-/p95-/FPS- und Langzeit-Speichermessung. Deshalb **Schritt 12 auf Codeebene implementiert, grafische Abnahme offen (teilweise)**.

**Schritt-13-Browsercheck:** Auf einer bekannten Küste/Waldkante bei unveränderter Karte mehrfach pan/zoom; Baum-/Bergschatten dürfen außerhalb freigegebener Hexe **nicht** durch transparente Clouds schimmern. Fog-Preview einschalten und sichtbare/unbekannte Fronten sowie externe Weltkanten bei 1×–4× prüfen; Wolkenbeleuchtung darf sich beim Verschieben/Zoomen nicht drehen. Cloud-Assets künstlich verzögert bereitstellen und erneut prüfen. Interaktive Fog-Freigabe und `setFogCells([])` vergleichen, ohne einem Editor-Client echte serverseitige Geheimhaltung zuzuschreiben. Schattenwerte, Relief und Export wie zuvor. Anschließend Schritt 13 mit echten Framezeiten/Heap/Replay beginnen.


## 2026-10-28 – Schritt 13: Korrekturrunde nach erster echter Windows-Messung (Bildpool, Zoom, Kamera-Abnahme)

**Quelle:** Erste Nutzer-Messung vom 28.10.2026 in `step13-results.zip`, 397 Hexfelder / 2.631 Naturinstanzen. Browser über CDP erfolgreich; Initialbilder teils nur Wolken (fast/4× nicht ladebereit), großes Pool-Überbudget und signifikante Zoom-Frameintervalle. **Diese Messung ist die Vorher-Basis, kein Leistungsnachweis der neuen Änderungen.**

- **Pool-Ursache analysiert:** `draw()` schützte bisher ausnahmslos alle Terraingrafiken, und `prune()` ignorierte in den ersten 24 Sekunden sogar ungeschützte Assets unter Budgetdruck. Dazu kamen bei 2×–4× über 200 große Sprite-Promotionen. `asset-image-pool.js` räumt nun ungeschützte Bildpuffer unter Druck sofort aus, beschränkt die Anzahl gleichzeitiger Upgrade-Aufträge auf zwei, reserviert zusätzlichen Speicher nur soweit möglich und meldet `protectedBytes`, `overLimitBytes` sowie `deferredUpgrades`. Notwendige sichtbare Assets werden nicht blind gelöscht. `app.js` schützt Terrain nur im aktuellen Kamerabereich sowie gemeinsame Küstenassets; der Schutz wird sowohl im normalen Canvas-Pfad als auch bei Camera-only-World-Tiles aktualisiert. Fehlende evizierte Terrainmaterialien können jetzt bei Bedarf erneut geladen werden.
- **Initiale Kachelfreigabe:** Der Schritt-13-Test aktiviert die Tile-Kamera explizit und wartet maximal 45 Sekunden auf 99,9-%-Abdeckung, keine offenen/fehlenden/provisorischen World-Tiles und vollständig verfügbares sichtbares Artwork. **Nicht ladebereite Baselines/Sites erzeugen kein Screenshot**; Grund und Wartezeit werden als Warnung protokolliert. Vor jedem Lauf werden alte PNGs aus dem eigenen Messordner entfernt.
- **Geografische Bildabnahme:** Zusätzlich zur Qualitätsschleife feste, aus `artifacts/rendering-step13/vedras_scene.json` ermittelte Kamera-Anker für Zentrum, dichten Wald, Küste, Gebirge, Moor und offenes Wasser; je ein Kartenbild in fast und 4×, mit exakter axialer Koordinate und Asset-/Kachel-Ladeprüfung. Das bisherige separate Fog-Vergleichspaar bleibt. ZIP-Archiv wird wie zuvor vom Windows-Starter erzeugt.
- **Messbewertung:** `result.json` / Report enthalten jetzt Bildpool-Überhang und zurückgestellte Promotions, Ladezustand je Site, Zoom-p95-Diagnose und gültigen/ungültigen Startzustand. Grenzwertverletzungen führen zum Status `PARTIAL`, nicht zu einer fingierten visuellen Abnahme.
- **Regressionen:** Neuer Test `tests/test_rendering_step13_memory_sites_20261028.cjs` prüft sofortige LRU-Verdrängung unter Druck, geschützte Bildquellen, sechs konkrete Szenenpositionen, Strict-Gates und Kameraschutz. Browser-Syntax und geografische Testpunkte wurden separat geprüft. **Eine neue Windows-Chromium-/GPU-Wiederholungsmessung nach dieser Korrektur steht aus.**


## 2026-10-28 – Schritt 13: zweiter Windows-Lauf und Hotfix gegen Asset-Thrashing

Die neue ZIP mit der 397-Hex-Referenzszene enthielt 12 Bewegungsmetriken, 31 erfolglose Ladeprüfungen, 0 PNGs, 0 Browser-Ausnahmen und 51 Warnungen. Alle 2.631 Nature-Instanzen waren importiert. Bildpool: 74.166 Ressourcenladungen, 74.025 Eviktionen, 3.648.518 zurückgestellte Upgrades; 504–662 MiB verwendet bei festem 192-MiB-Budget. Hauptursache: sofortiges Eviktieren und wiederholtes Anfordern gerade benötigter Bildpuffer. Atlas-Seiten wurden zudem trotz sechsseitigem LRU ständig neu geladen. Beim Zoom blieben erhebliche rAF-Aussetzer (u. a. 3× p95 4.097 ms). Als Folge lief der Screenshot-Test bei 31 mal 45 Sekunden Wartezeit über 23 Minuten und lieferte keine visuellen Belege.

Hotfix: Adaptives Preview-Limit und differenzierte Budgets für dichte Szenen (fast/auto/1×: 512px / 288 MiB; 2×: 576px / 352 MiB; 3×: 640px / 448 MiB; 4×: 768px / 576 MiB). Der physische DPR bleibt unverändert. Ein kurzer LRU-Schutz für jüngst verwendete Assets reduziert sofortiges Nachladen; Upgrade-Deferral nur einmal pro Asset je fünf Sekunden; 10-Sekunden-Atlas-Cooldown mit Original-PNG-Fallback. Der automatisierte Test beschränkt die Readiness-Gates auf neun Sekunden, unterscheidet World-Tile-Zustand und editorinternen Chunk-Painted-Status, schreibt bei fehlender Freigabe ausdrücklich diagnostische PNGs mit verified=false und zeigt Phasenfortschritt statt HTTP-200-Logflut. Mock-Regressionen für Eviktion, Abkühlung und Previewgrößen geprüft; echter neuer Windows-Chromium-Lauf und Grafikabnahme weiterhin offen.


## 2026-10-28 – Dritter Windows-Lauf: Verifikation der zweiten Korrekturrunde

Erhaltene ZIP `step13-results(2).zip` enthält 32 PNGs, 31 Ladeprüfungen (14 READY, 17 DIAGNOSTIC), 12 Bewegungsmessungen und keine Browser-Ausnahmen. Der Szenenimport ist vollständig (397 Hexfelder, 2631 Nature-Instanzen, 0 nicht zugeordnete Pfade). Der einzelne Asset-Pool verzeichnet 388 geladene Ressourcen und 100 Eviktionen statt 74.166/74.025 im vorherigen Lauf; bei fast liegt er bei 288/288 MiB, bei 4× bei etwa 420/576 MiB. Der Pool-Neuladefehler ist dadurch erheblich reduziert. Bei 4× Zoom waren p95 Frameabstände von 3729,66 ms (nur vier Samples), bei 3× 4593,82 ms (nur drei Samples) messbar. Die höheren Qualitätsstufen sind daher **nicht** performanceseitig freigegeben.

Die separate Atlas-Telemetrie zeigt weiterhin 3226 Atlas-Seitenladungen und 3220 Eviktionen sowie 144560 Cooldown-Fallbacks. Deshalb umgeht der Renderer den nur sechs Seiten großen Atlas bei mehr als 500 platzierten Nature-Instanzen vollständig und verwendet die bereits dekodierten ImagePool-Vorschaubilder. Diese Änderung ist eine konkrete Gegenmaßnahme und benötigt einen weiteren lokalen GPU-Benchmark vor einem Performanceversprechen.

Visuelle Prüfung: Wald, Berge, Moor und Gelände sind in mehreren Screenshots deutlich sichtbar. Die als `open-water` (Hex -4,5, in JSON `baseBiomeByHex=ocean`) bezeichneten Screenshots zeigen allerdings überwiegend grünes Gelände; die Kameraposition und die Zuordnung zwischen Scene-Biom und tatsächlich gerendertem Tile müssen separat geprüft werden. Der Fog-on-Screenshot ist vollständig von Wolken bedeckt; das klare Vergleichsbild zeigt Gelände. Eine verlässliche Fog- und Biomabnahme ist noch offen. Hohe Qualitäten wechseln teilweise zwischen aktiven und inaktiven World-Tiles; auch diese Zustandsübergänge sind weiter zu untersuchen.


## 2026-10-29 – Schritt 14: reproduzierbare Atlas-AN/AUS-Messung und Zoom-Profiling

Implementiert ist ein **separater Diagnose- und A/B-Benchmark**, keine neue Renderer-Optimierung.
Die Messung umgeht den alten automatischen Atlas-Bypass bewusst nur im Modus ON;
OFF zeichnet dieselbe Szene mit den bereits dekodierten PNGs. Zwei frische
Chromium-Prozesse mit getrennten User-Data-Verzeichnissen erhalten dieselbe
397-Hex-/2631-Nature-JSON, Kameraposition (0,0), Zoom (0,70), identische DPR,
Qualitätsstufen und Eingabefolgen. Warm-Pan, Warm-Zoom und **Cold-Zoom mit
einmaliger identischer Chunk-/Terrain-Invalidierung** werden getrennt gemessen.
Wiederholungen mit umgekehrter Reihenfolge sind über `--order off,on` möglich,
um OS-Caching-Reihenfolgeeffekte nicht unbemerkt als Atlasvorteil auszulegen.

Opt-in-Probes erfassen folgende Teilkosten: Editor-Terrain-/Straßenzeichnung,
Weltkachel-Bake-Wandzeit und ihre Boden-/Scenery-Abschnitte, Komposition,
Vegetationslayout und Sprite-Pass, Schattenpass, ImagePool-Fetch-/Decode-Wartezeit
und synchrones Vorschau-Resampling. Dazu Chrome-CDP `TaskDuration` als
**Main-Thread-Auslastungsproxy** (nicht gesamte CPU-Last), rAF-p50/p95,
LongTasks, ResourceTiming für Bild-/Atlas-Anforderungen und Speicherindikatoren
(CDP-JS-Heap, geschätzte ImagePool-RGBA- und GPU-Texturbytes). Einzelne
verschachtelte Messzeiten dürfen nicht addiert werden; die gemischte
Image-Onload-Wall-Zeit ist **keine reine Decode-CPU-Zeit**.

`START_ATLAS_AB_WINDOWS.cmd` startet ohne npm-Abhängigkeiten einen eigenen
lokalen Python-Server und führt den A/B-Vergleich mit zwei Chrome-Profilen aus.
`artifacts/rendering-step14-ab/step14-atlas-ab.zip` enthält den gepaarten
JSON-Vergleich, README und verifizierte bzw. diagnostisch markierte Bilder je
Variante. Schritt 13 bleibt unverändert startbar; sein CLI lädt durch
Entry-Point-Guard weiterhin direkt, kann aber intern vom neuen Test importiert
werden. Gültige A/B-Aussagen benötigen echte Atlas-Treffer, keine Atlasversuche
mit ausschließlich PNG-Fallback, und vollständig geladene Vor-/Nachzustände.
Regressionstests prüfen Opt-in-Verhalten, Atlas-Umschaltung, Messgrößen und
Windows-Starter.

**Prüfung:** JavaScript-Syntax des Messinstrumentariums, der Runner und Tests
sowie isolierte Profiler-Zähler in V8 geprüft; ein echter Windows-/Chromium-Lauf
und native `node --test`-Abnahme sind auf dem Assistentensystem nicht erfolgt.
Erst nach deren A/B-Ergebnissen eine Entscheidung für oder gegen einen
grundlegenden GPU-Renderer treffen.


## 2026-10-29 – Schritt 15: Tile-Ursachenmessung und Kamera-/Biomdiagnostik (Implementierung)

**Implementiert, nicht auf echter Zielhardware abgenommen.** Eingeführt wurde ein standardmäßig deaktiviertes, auf 1800 Ereignisse begrenztes Trace-Protokoll für World-Tile-Cache-Misses, global und lokal begründete Invalidierungen, Snapshot-Hit/Miss-Gründe, `tile.id@lod`-Auftrags-/Warte-/Bake-Status und editorseitige `drawGround`-/`drawRoads`-Aufrufkosten. Der bisherige Renderer wird in dieser Phase **nicht optimiert**. Direkte Kamera- und Referenzbiomdiagnose prüft sechs Hex-Zielpositionen einschließlich Meer `(-4,5)` sowie Fog-ON/OFF ohne die Kartenlogik zu verändern. Die Import-/Demo-Geografie-Zuordnung bleibt als Hypothese bis zu einem realen Messbericht offen.

**Start:** `START_STEP15_WINDOWS.cmd` nach `git pull --ff-only origin main`. Ausgegeben wird `artifacts/rendering-step15-diagnostics/step15-diagnostics.zip` mit `result.json`, `README.md` und Diagnosebildern. 7/7 gezielte Tests wurden im V8-Mock erfolgreich ausgeführt; JavaScript-Syntax geprüft. Native `node --test`-Durchführung sowie reale Chromium-/GPU-Messung stehen aus. **Nächster offener Schritt bleibt 15 (Hardware-Abnahme); Schritt 16 erst nach verifiziertem Warm-4×-Befund.**


## 2026-10-29 – Schritt 16: gezielte World-Tile-Revisionsprüfung und Ground-Reuse

**Implementierung:** Der Editor-Snapshot hat eine andere Lebensdauer als die semantische Szene. Aktualisierung einer kameralokalen gepufferten Hintergrund-/Sceneryfläche wird deshalb nicht mehr als globale World-Tile-Invalidierung behandelt. Stattdessen vergleicht der World-Tile-Compositor je aktiver LOD-Stufe vorbereitete Terrain-/Ufer-/Straßen-/Flussrevisionen und invalidiert nur tatsächlich veraltete Tile-IDs. Ein separater 44-MiB-/24-Tile-Ground-Cache speichert ausschließlich vollständig geprüfte Terrain-/Straßenbilder und erlaubt deren Verwendung bei Änderungen an Scenery/Schatten, ohne Ground-Darstellung erneut zu berechnen. Dynamische Einheiten, Fog, Biome-Import und Canvas-/WebGL-Architektur sind nicht verändert. Bereits fertige scharfe Tiles werden bei Snapshot-Neuerzeugung nicht erneut resampelt.

**Nachweisbasis:** Realer Step-15-Lauf: 4×-Pan 12 Ground-Fallbacks mit 1128 ms, Auto-Pan 25/3014 ms und mehrere `staging-signature-changed`-Vollinvalidierungen; diese Ereignisse waren aber teils unready, also **kein** endgültiger Warm-Benchmark. Neue Zähler: `groundReuseHits`, `groundReuseMisses`, `groundReuseBytes`. Die Ziele sind 0 Ground-/Roads-Fallbacks bei vollständig warmem 4×-Pan, keine globalen Cache-Flashes durch Staging-Neuerstellung, keine verschwundenen Hex-/Ufer-/Schattenbilder und stabiler Speicher. **Noch nicht auf Nutzer-Windows-Chrome gemessen**. [Detaillierte Abnahme und Testanleitung](STEP16_GROUND_REUSE.md). Die erste noch nicht abgenommene Phase ist **Schritt 16**; erst danach Schritt 17.


## 2026-10-29 – Schritt-16-Windows-Abnahme: Regression nachgewiesen und Bake-Scope-Fix

**Echte Windows-Diagnose nach PR #68:** Die exakt gleiche Referenzszene (SHA-256 `1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`) wurde mit `START_STEP15_WINDOWS.cmd` erneut getestet. Der Lauf war formal vollständig, aber **0 von 8 Start-/End-Readiness-Prüfungen erfolgreich** (gegenüber 5/8 zuvor). Bei 4×-Pan stiegen die Terrain-Fallbacks von 12 auf 38 und die Ground-Zeichenzeit von 1128 auf 2763 ms, während der World-Tile-Status 103 fehlgeschlagene und 0 fertig akzeptierte Kacheln meldete. Bei Auto-Zoom 22 statt 16 Ground-Fallbacks und 4538 statt 1363 ms. Dies ist **keine erfolgreich abgenommene Beschleunigung**.

**Konkrete Ursache in PR #68:** `sourceGroundVersion` wurde innerhalb des `try`-Blocks von `bakeWorldTile` mit `const` deklariert, aber im zugehörigen `finally`-Block für das Step-15-Tracing verwendet. Das bewirkt `ReferenceError` bei der Abschlussprotokollierung jeder Bake-Ausführung, einschließlich vorzeitig abgebrochener Aufträge, und löst fehlgeschlagene Quellaufträge samt Retry-Stürmen aus. **Fix:** `let sourceGroundVersion=null` vor dem `try`; Zuweisung innerhalb und unveränderte Fehlerweitergabe an den World-Tile-Runner. Ein neues Testcase ruft die tatsächliche `bakeWorldTile`-Funktion mit frühem Abbruch auf; alle 10/10 Tests bestehen im V8-Mock. Fehler werden im Trace künftig mit Typ/gekürzter Nachricht erfasst.

**Abnahmestatus:** Fix implementiert; **erneuter realer Browser-/Screenshotlauf auf Windows erforderlich**. Die zusätzliche Cache-/LOD-Optimierung aus Schritt 16 kann erst nach erfolgreichem Retest bewertet werden. **Schritt 17 weiterhin nicht freigegeben.**

## 2026-10-29 – Schritt 16A: auditierbare Architekturentscheidung statt Hotfix-Schleife

Die vierte Windows-Step15-Diagnose aus der 397-Hex-/2.631-Nature-Szene
zeigte **0 Tile-Bake-JavaScript-Exceptions**, aber nur **2/8 Readiness-
Prüfungen**. Ende Auto-Pan READY, andere Phasen teils unvollständig.
Die geografische Referenz an Hex (-4,5) meldet nun `ocean` und zeigt
visuell Wasser. Die Performance ist wegen fehlender Warm-Gates nicht
abgenommen. Im Lauf wurden 202 `tile.cache-miss`-Ereignisse erfasst;
separat davon meldet die Ground-Raster-Reuse-Messung **2 Hits und
29 Misses** (nicht 2 Hits von 202 Ground-Zugriffen).
Die Auto-Pan-Bildpoolgrenze war 288 MiB, tatsächlich dekodiert waren
501,3 MiB und geschützt ca. 395,3 MiB. Pauschales Evicten oder
Cachevergrößern wäre ohne Ursachennachweis riskant.

**Schritt 16A implementiert** auf dem isolierten Branch mit
`START_STEP16A_WINDOWS.cmd`: Ein eigener HTML-Kontrolllauf nutzt
den unveränderten World-Tile-Compositor und 16 bereits vorbereitete
synthetische Layer-Tiles ohne Editor und Asset-Loader. Die echte Szene
wird daneben nur nach vollem Ready-/Quiet-Gate als Warm-Test gewertet.
Aufbereitung, Tile-/Asset-Invalidierungen und geschützter Bildspeicher
werden separat dokumentiert. V8-Quellsyntax und der isolierte
Compositor-Kontrollpfad wurden mit 16/16 retained Tiles, 100 % Coverage,
0 Evictions und 0 neuen Tile-Akzeptanzen geprüft; echte Browser-
Rasterzeit und GPU-Relevanz bleiben ausdrücklich offen.

**Nächster Gate:** Ein echter Step16A-Windows-Auditlauf. 16B erst
nach Attribution des dominanten Engpasses; 16C erst nach validen
Warm-/Cold-Messungen, visueller Freigabe und drei Hardwarewiederholungen.
Schritt 17 bleibt offen/gesperrt.

## 2026-10-30 – Ergebnis von Schritt 16A und erster zielgerichteter Schritt-16B-PR

Audit: `step16a-audit.zip`, Referenzszenen-SHA
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.
Beide frischen Browser-Imports brachten 397 Hex / 2631 Vegetationsinstanzen
ohne fehlende Instanzen und ohne Skriptfehler.

- Isolierter Production-WorldTile-Compositor: beide Kontrollen valide,
  16/16 vorbereitete Tiles, 0 Evictions, 0 neue Source-Tiles, Coverage 100 %.
  Compositor-Zeichnen p95 **0,40 ms Pan / 0,20 ms Zoom**;
  rAF-p95 **60,04 / 33,50 ms**. Diese Zahlen sind nicht austauschbar.
- Reales Auto-Pan: 89 Intervalle, rAF-p95 **16,80 ms**, aber 2
  neue Tile-Bakes/Cache-Misses, daher warm **nicht abgenommen**.
- Reales Auto-Zoom: 13 Intervalle, rAF-p95 **817,34 ms** (nicht valide),
  0 Tile-Bakes/Invalidierungen/Asset-Dekodes, jedoch **13 neue
  StaticScenery-Builds**. `static-object-layer.js` erforderte exakte
  Zoom-Gleichheit und baute die gesamte Vegetations-/Schattenebene
  bei jedem Zoom-Inkrement wieder auf. Das ist ein belegter Hotspot.
- Reales 4×-Pan: 27 zusätzliche Tile-Bakes, 13 Terrain-Builds,
  Tile/Asset-Revisionsänderungen und rAF-p95 133,40 ms; nicht warm.
- Reales 4×-Zoom: 5 Sampleintervalle und p95 3803,04 ms,
  Tile-/Terrain-Fallbacks plus 5 Scenery-Builds; nicht warm.
- In diesem Test: Bildpool Auto 288/288 MiB, geschützt 177 MiB.
  4× etwa 626 MiB dekodiert gegenüber 576 MiB Limit;
  geschützte Assets ~380 MiB. Keine Aussage, dass der
  Auto-Bildpool grundsätzlich gelöst wäre; Speicherprofil
  unterscheidet sich zwischen den Benchmarkläufen.

**Schritt 16B – ein Ursache-Patch als Draft #73:**
Nur Fast-Scenery-Zoom kann statische Layer aus identischer Source
innerhalb Skalierungs-/Viewport-Grenzen geometrisch re-projizieren.
Nach Zoomstillstand folgt einmal ein exakter Pixel-Rasteraufbau.
Alle anderen Renderpfade behalten ihre vorherigen Regeln.
Geometrie und Code im isolierten V8 geprüft; Windows-Test, Native-
Node-Suite und visueller Vergleich ausstehend. Kein nachgewiesener
Performancegewinn, kein Merge, keine Schritt-16C-Freigabe.
4×-Ground/World-Tile-Revisionen sind ein separater noch offener Fall.
Schritt 17 weiterhin gesperrt.

## 2026-10-30 – Nachweis der Auto-Zoom-Korrektur und 4×-Quellenattribution

Hardware-Retest `step16a-audit(1).zip` bestätigte **Auto-Zoom
16,80 ms rAF-p95 über 89 Intervalle** statt 817,34 ms p95
über nur 13 Intervalle in der vorherigen Diagnose. Die
statischen Scenery-Neuaufbauten sanken von **13 auf 0**
innerhalb der Kameramessung. Bei gleicher Szenen-SHA und
gleichzeitig 0 Tile-/Asset-Invalidierungen, 0 Terrain-Builds.
Die Phase blieb formal **nicht vollständig warm** wegen eines
zusätzlichen Reuse-Ground-Tile-Bakes. Auto-Pan erreichte
16,92 ms p95 über 89 Intervalle (zuvor 16,80 ms),
ebenfalls mit zwei kleinen Kachel-Nachfüllvorgängen.
Keine belastbare Faktor-48-Beschleunigungsbehauptung aus
der vorherigen unzureichenden 13-Frame-Probe.

Zoom-Fix #73 bleibt ein Draft, bis Bilder von Bäumen,
Schatten, Meer/Küste und Fog vor/während/nach Zoom überprüft
sind. Ein optionaler, ausschließlich Kartenviewport-
bezogener 5-PNG-Test kann auf dem gestapelten Branch mit
`--visual` erstellt werden.

4× ist davon unabhängig offen: 13 Terrain-Revision-
Invalidierungen und neue Kachel-/Terrain-Arbeit. Der
vorherige Trace reichte nicht für die Attribution
der Versionsteile (Terrain, Shore, Road, River).
Der neue Draft #74 zeichnet diese Versionen je Tile
nur bei aktivierter Trace auf; die Cached-Tile-
Entscheidungen bleiben unverändert. Vier Regressionen
im isolierten V8 mit echter Tile-Streamer-Quelle: 4/4.

**Nächster Schritt:** Ein kombinierter lokaler
`START_STEP16A_WINDOWS.cmd --qualities 4,auto --frames 90 --settle-ms 12000 --visual`
zur Ursachenbestimmung plus Bildabnahme; nicht weitere
ungenannte Performance-Patches auf Verdacht. Schritt 16C
nicht abgenommen, Schritt 17 gesperrt.

## 30.10.2026 – 4×-Ground-Revisionsquelle nach Hardwarelauf geklärt

Aus `step16a-audit(2).zip`: 397 Hex, 2.631 Naturinstanzen,
Szene unverändert. 4×-Pan: 89 Intervalle, 133,40 ms p95,
14 Invalidierungs-Events, 16 einzelne Ground-Version-Details;
8 Road-only, 6 Road+River, 2 Terrain-only. Bei den
14 Road-/River-Ereignissen bleibt der Terrainwert gleich;
Road-/River-Varianten springen zwischen fertig und `pending`.
Von 16 konkreten Details sind **acht** exakt
fertige Road/River → vorübergehend `pending`
und damit Kandidaten für das gezielte Defer im Draft #75.
Die übrigen acht sind z.B. `pending → neu fertig`
oder echte Terrainänderungen und bleiben invalidierend.

4×-Zoom: 89 Intervalle, 16,8 ms p95, aber nach Warm-Gate
weiter ungültig wegen nicht vollständig ruhigem Zustand.
Auto-Pan und Auto-Zoom ebenfalls 89 Intervalle, 16,8 ms p95;
beide neue Tile-Nachladungen, daher keine reine Warm-Abnahme.
Alle Visuals vorhanden: Scenery-Builds 8 vor/8 während/
9 nach Zoom, Ozean-Hex (-4,5) effektiv `ocean`, Fog-Screenshot
hat sichtbare Wolkenabdeckung. Wasser-Kachelgrenzen müssen
bei der visuellen 16C-Abnahme separat auf Artefakte geprüft werden.

**Neuer isolierter Draft #75:** Behalte fertige World-Tiles bei
fertige Road-/River-Version → `pending`; erst bei einer anderen
fertigen Version oder echtem Edit invalidieren. Gezielte
10/10 Tests mit echter World-Tile-Streamer-Quelle im isolierten
V8 bestanden. Native Windows-Tests und Hardwarevergleich fehlen;
keine Performanceverbesserung für 4× behauptet. Nur ein
gezielter 4×-Windowslauf erforderlich, danach erst über
16C entscheiden. Schritt 17 weiter gesperrt.

## 30.10.2026 – Schritt 16B: 4×-Nachtest ZIP3 zeigt Kameramodus-Abbruch

Neuer Windows-Audit `step16a-audit(3).zip` auf Draft #75,
gleiche Referenz-SHA wie ZIP2, Import 397 Hex/2631 Nature,
0 JavaScript-Ausführungsfehler:

- 4×-Preparation: 151 Bake-Versuche (ZIP2: 155),
  101× Terrain-Core-not-ready, 43× Sprite-not-ready;
  39 MiB über dem 576-MiB-Decodingbudget.
- 4×-Pan: 0 Frameintervalle (ZIP2: 89),
  WorldTile-Modus inaktiv, Coverage 75 %.
- 4×-Zoom: 51 Frameintervalle, rAF-p95 1651,35 ms
  (ZIP2: 89 und 16,80 ms), 22 Tile-Bakes,
  15 Cache-Misses, 2 Invalidierungen;
  am Ende Modus inaktiv und Coverage 25 %.
- Kein `tile.ground-revision-deferred`,
  keine `tile.ground-revision-detail`; Draft #75
  wird durch diesen Test nicht beurteilt.
- Während 4×-Zoom 30 `asset.invalidate`-Events.

Quellcode bestätigt: Der spät laufende `imagePool.onReady`-Batch
ruft `invalidateSpriteLayout()` auf, was bislang immer
`tileModeActive=false` setzt. Dadurch fällt der nächste
`requestDraw()` potenziell in den direkten Editorpfad.
Das stimmt mit dem beobachteten Modusabbruch überein;
kausale Bestätigung braucht den Hardwaretest mit neuem Trace.

**Draft #76** isoliert diesen Fehler: Nur beim
späten Asset-Batch darf ein bereits aktiver und
weiter zulässiger Tile-Kameramodus erhalten werden,
inklusive sofortigem `tileFog()`-Neubau. Edit- und
Strategie-Moduswechsel bleiben unverändert.
5/5 gezielte isolierte V8-Tests bestanden, native
Windows-/Chrome-Messung ausstehend.
Die alte Road/River-Pending-Regel in #75 bleibt unabhängig
und unbewiesen. Schritt 16C/17 weiterhin gesperrt.
