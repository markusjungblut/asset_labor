# Rendering-Status

**Stand:** 2026-10-27  
**Repository:** `markusjungblut/asset_labor`  
**Ausgangscommit Schritt 3:** `99a70d45500f7a5f6efbf411c138a56309ff921b`  
**Schritt 1:** Ausgangsstand dokumentiert, Backup: `backup/v0.23-step1-before-docs-20261027`.  
**Schritt 2:** Tile-Diagnostik umgesetzt.  
**Schritt 3:** **Codeimplementierung und fokussierte isolierte Regression erfolgreich; Abnahme an echter dichter Browserkarte noch offen.**  
**Als Nächstes:** **Schritt 3 im echten Browser verifizieren**, danach erst Schritt 4 freigeben.

## Reproduzierte Defekte und gezielte Reparaturen

1. **Terrain: leerer Raster-Cache blockiert Fertigstellung.** `chunks.js` behandelte `null` als gültigen Cache-Eintrag; `prime()` hielt ihn dadurch für „bereit“, während `readyTiles()` ein Raster verlangte. Für **Terrain allein** fordert `app.js` jetzt `requireRaster:true` an. Fehlende Raster werden nicht als fertig gespeichert, sondern mit begrenzter Verzögerung erneut aufgebaut; nach vier Versuchen folgt `retry-exhausted`. Absichtlich leere Wege/Ufer-/andere Ebenen behalten die alte erlaubte Null-Semantik.
2. **World-Tiles: `source-null` und unvollständige Pakete ohne eigenständiges Wiederanlaufen.** `world-tile-streamer.js` legt verzögerte, begrenzte Wiederholungen für leere/fehlerhafte Ergebnisse an (bis zu fünf Versuche; 400/800/1600/3200 ms). Im Editor sind vollständig nutzbare Ground-/Scenery-Layer erforderlich; ein halbes Paket wird nicht als fertiges Tile veröffentlicht.
3. **Feststeckende asynchrone Jobs.** Terrain-Aufträge besitzen im Terrainmodus ein 60-Sekunden-Watchdog; World-Quellen besitzen ein 45-Sekunden-Watchdog. Nach Timeout wird der Renderer-Slot frei, der Fehler erfasst und eine begrenzte Wiederholung ermöglicht. Später eintreffende Bitmaps werden verworfen und, wenn im Eigentum des Jobs, freigegeben.
4. **Gezieltes Wiederanlaufen bei nachgeladenem Terrain.** Wenn ein sichtbarer Terrain-Chunk fertig aufgebaut ist, übergibt sein vorhandener `redraw`-Callback die genaue Tile-ID an `worldTiles.terrainReady(id)`. Ein vorher durch `source-null`/`incomplete-source` erschöpfter World-Tile-Auftrag wird **nur für diese autorisierte sichtbare Tile-ID** reaktiviert, nicht pauschal für die ganze Karte. So bleibt das Gebiet nicht hängen, wenn das Terrain erst nach dem World-Tile-Retrybudget fertig wurde.
5. **Veraltete Generationen/Signaturen.** Das World-Tile-Ergebnis darf nur veröffentlicht werden, wenn der aktuelle Job-Token noch passt. Wird während eines laufenden Terrainjobs der Tile-Stempel geändert, folgt für die weiterhin sichtbare Kachel eine neue Queue-Anforderung, statt nur das veraltete Ergebnis zu verwerfen.
6. **Schnelle Kamera wartet auf „painted“, obwohl Terrain bereits „ready“ ist.** `app.js` erlaubt ausschließlich dem **direkten Offscreen-Tile-Builder** den Start aus einem fertig berechneten Terrain-Core, der noch nicht im Editor gezeichnet wurde. Bereits vorhandene Hintergrund-Snapshots benötigen weiterhin die exakte gemalte Version. Nach `drawGround()/drawRoads()` wird vor Veröffentlichung erneut die strenge `tileArtworkReady()`-Prüfung angewandt. Unfertiges Terrain oder fehlende Sprites bleiben unter Wolken.

## Explizite Grenzen und Status bei permanenten Fehlern
- Dauerhaft defekte Tiles werden nach wenigen Versuchen **nicht stillschweigend aufgedeckt**: Zustand `retry-exhausted`, letzter Grund und Tile-ID sind in `tileDiagnostics()` auslesbar. Ein neuer Epoch/Material-Stempel hebt diese Sperre wieder auf.
- Neue UI-Statuszähler kennzeichnen endgültig fehlgeschlagene Terrain- bzw. World-Tiles; keine automatische Dauer-Retry-Schleife.
- Es wurden **keine** DPR-/LOD-/GPU-/Textur-, Pixeldichte-, Fot-/Fog-, Sprite- oder Spielwelt-Änderungen vorgenommen. `index.html` erhält lediglich Cache-Busting-Parameter für die drei geänderten JS-Skripte.
- Keine Aussage, dass die ursprünglich gemeldeten **67 ausstehenden Chunks** oder **449,6 ms/Frame** auf dem echten Rechner bereits behoben/gemessen sind.

## Durchgeführte Checks
- JavaScript-Syntax der geänderten Renderer-Module und neuen Testdatei im V8-Parser: erfolgreich.
- `tests/test_tile_recovery_v023_step3_20261027.cjs`: **10/10** Tests mit simulierten Timern und Node-API-Shims in V8 bestanden (leer→Retry→fertig, terminale Fehler, beabsichtigt leere Nebenschichten, Timeout und Bitmap-Freigabe, Stempelwechsel, World-Null-Retry, unvollständige Pakete, verspätete Pakete, Offscreen-Ready-Gates).
- Bestehender `tests/test_tile_diagnostics_v023_step2_20261027.cjs`: **4/4** unter denselben Testbedingungen bestanden.
- Bestehender `tests/test_world_tile_streamer_v021_20261026.cjs`: **8/8** unter denselben Testbedingungen bestanden.
- **Nicht ausgeführt:** echter nativer `node --test`-Lauf, kompletter alter Testsatz, Browser-FPS-Profil und Test gegen die gespeicherte 2710-Sprite-Szene. Diese Abnahme ist erforderlich, bevor Schritt 3 als vollständig im Produkt verifiziert gilt.

## Nächste Verifikation
Nach `git pull` und hartem Browser-Neuladen:

```bash
node --test tests/test_tile_recovery_v023_step3_20261027.cjs
node --test tests/test_tile_diagnostics_v023_step2_20261027.cjs
node --test tests/test_world_tile_streamer_v021_20261026.cjs tests/test_priority_chunk_streaming_v019_20261024.cjs
```

Browserkonsole: `window.VedrasAssetLabor.tileDiagnostics({limit:150})`. Zu Beginn, nach 30 und nach 60 Sekunden prüfen: `terrain.queuedVisible`, `terrain.retryWaiting`, `terrain.retryExhausted`, `world.running`, `world.retryWaiting`, `world.retryExhausted`, `artwork[].reason`, `worker.pending`, `imagePool.queued`. Beim Pan/Zoom prüfen, dass obsolete Job-Resultate die aktuelle Variante nicht überschreiben. Bei erschöpften Retries die in `recent` angegebenen letzten Fehler mit der Bild-/Terrainquelle vergleichen.

**Aufgabe nach erfolgreicher Browserprüfung:** Schritt 4 – Kamera-Komposition ohne unnötigen Szenen-Neuaufbau. Schritt 4 wurde in diesem Commit **nicht** begonnen.

### Ergänzende Schritt-3-Kontrolle
Auch der Fall „World-Tile-Retries erschöpft, anschließend trifft das fertige Terrain ein“ ist getestet: Der eine sichtbare Tile wird ohne Kamerabewegung neu angefordert und bei vollständigem Ground-/Scenery-Paket freigegeben; unbekannte Tiles werden nicht nachgeladen. **10/10** neue und insgesamt **22/22** fokussierte isolierte V8-Tests erfolgreich; nativer Node- und Browserlauf bleiben offen.
