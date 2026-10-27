# Entscheidungen – Rendering v0.23

## D-001: Bestandsaufnahme ohne Funktionsänderung (2026-10-27)
**Entscheidung:** Schritt 1 verändert ausschließlich Dokumentation. Das bestehende `asset_labor` v0.22.6 bleibt unverändert; Backup-Branch verweist auf den ursprünglichen Release-Commit. **Grund:** isolierbare Ursachenanalyse und sicherer Vergleich.

## D-002: Bestehende Pipeline wiederverwenden
**Entscheidung:** Vor Neubau von Workern/Tile-Renderer/GPU prüfen, was bereits über `chunks.js`, `terrain-worker-client.js`, `world-tile-streamer.js`, `static-object-layer.js` und GPU-Modulen verfügbar ist. **Grund:** parallele Renderer ohne einheitliche Statuslogik könnten die Fehlersuche verschlechtern.

## D-003: Tests und Messungen sauber trennen
**Entscheidung:** Die 79/79 JS-Tests aus dem v0.22.6-README sind historische Regressionsergebnisse und kein aktueller FPS-Beweis. Die Benutzermessung 449,6 ms ist eine unkontrollierte Ist-Messung, kein reproduzierbarer Benchmark. **Grund:** belastbare Vorher-/Nachher-Vergleiche.

## D-004: Qualitätsreduzierung nur dokumentieren
**Entscheidung:** 1,5×-DPR-Grenze (>500 Nature-Instanzen) sowie Bildpool-Preview-Limits (512/1024 px) in Schritt 1 **nicht** entfernen. Schritt 11 kann erst nach einer erfolgreichen Entkopplung eine neue Qualitätspolitik einführen. **Grund:** keine Performance-Regression durch vorgezogene Änderung.

## D-005: Ladeproblem nicht vorschnell diagnostizieren
**Entscheidung:** 67 Terrain ausstehend trotz null Bilddownloads zeigt einen separaten Berechnungs-/Statuspfad, aber noch keine bewiesene Einzelursache. Schritt 2 instrumentiert `queue`, `inFlight`, `null`-Returns, Epoch, Revision, Bereitschaft und Cache-Invalidierung; Schritt 3 behebt die gemessenen Ursachen. **Grund:** keine spekulativen Fixes.

## D-006: Grafik-/Spielvertrag schützen
**Entscheidung:** Original-Sprites, Materialzuordnung, Weltkoordinaten, durchgängige Ufer-/Waldmasken, helligkeitskonsistente Wolken, gemalte Schatten und serverseitige Geheimhaltung bei späterer Spielintegration behalten Vorrang vor rein synthetischen FPS-Gewinnen. Keine Änderung ohne visuelle Abnahme.

## D-007: GitHub als Fortsetzungsquelle
**Entscheidung:** `ROADMAP.md` und `STATUS.md` im Repository bilden den Übergabestand. Ein dokumentierter Schritt = separater Commit; bei Bedarf ergänzender Branch/PR. **Grund:** Fortsetzung über getrennte ChatGPT-Sitzungen ohne Chatkontext-Abhängigkeit.

## D-008: Passiv instrumentieren, nicht reparieren (2026-10-27)
**Entscheidung:** Separate, begrenzte `diagnostics()`-APIs erfassen Queue, inFlight, fehlende Raster, `source-null`, Fehler, Epoch und Cache-/Paint-Version. Kein Timer, Retry, Qualitätslimit oder Fog-Gate wurde geändert. **Begründung:** Erst konkrete blockierte Tile-IDs identifizieren, bevor Schritt 3 deren Lebenszyklus verändert.

## D-009: Diagnose ist Opt-in
**Entscheidung:** Die teurere per-Tile-Bereitschaftsprüfung wird ausschließlich über `VedrasAssetLabor.tileDiagnostics()` aufgerufen. Höchstens 150 sichtbare Kacheln pro Aufruf; Verlauf maximal 384 letzte Tile-IDs je Renderer. **Begründung:** Dauerinstrumentierung kann die ohnehin schlechte Framerate verschlechtern.

## D-010: Testumgebung kennt Grenzen
**Entscheidung:** 4/4 isolierte JavaScript-/V8-Tests aus dem neuen Diagnose-Test bestanden. Das entspricht noch nicht einem nativen `node --test`-Durchlauf oder einer Browser-Performancefreigabe. **Begründung:** Messergebnisse müssen ihrer tatsächlichen Umgebung zugeordnet bleiben.

## D-011: Terrain braucht echte Raster, andere Ebenen dürfen leer sein (2026-10-27)
**Entscheidung:** `requireRaster:true` nur für Terrain, damit ein `null`-Raster nicht als vollständige Terrain-Kachel im Cache landet. Bei Weg-/Ufer-/Dekorationsebenen kann `null` weiterhin eine absichtlich leere Kachel bedeuten.

## D-012: Begrenzte Retry- und Timeout-Budgets
**Entscheidung:** Terrain erhält vier Versuche und 60 s Build-Watchdog; World-Tiles erhalten fünf Versuche und 45 s Source-Watchdog. Nach Erschöpfung wird die Tile-ID als `retry-exhausted` gemeldet und unter Wolken belassen; Epoch- oder Stempelwechsel ermöglichen einen neuen Anlauf. Kein endloser Retry-Sturm.

## D-013: Fast-Kamera-Direktbake darf vorbereitete, nicht bereits gemalte Chunks verwenden
**Entscheidung:** Bestehende Hintergrund-Snapshots bleiben nur mit exakter bereits gemalter Core-Version zulässig. Der direkte Offscreen-Aufbau darf dagegen bereits fertig berechnete Terrain-Chunks zunächst selbst malen und muss danach streng validieren. Keine Vorab-Freigabe für fehlende Terrain-/Spritequellen.

## D-014: Live-Freigabe noch nicht belegt
**Entscheidung:** Die fokussierten V8-Regressionen beweisen Verhalten der getesteten Jobs unter simulierten Timern, nicht Leistung der gespeicherten dichten Browserkarte. Keine gemessene FPS-Verbesserung oder vollständige Ladefreigabe behaupten, bevor native Tests und echte Szene geprüft sind.

## D-015: Wiederanlaufen ausschließlich bei konkretem Terrain-Ready-Signal
**Entscheidung:** Ein erschöpfter World-Tile-Auftrag darf nach Fertigstellung seines entsprechenden autorisierten Terrain-Chunks gezielt wieder starten. Der Terrain-Renderer meldet dabei nur die fertiggestellte Tile-ID; kein globaler Retry-Reset oder regelmäßiges Polling. Unbekannte und nicht sichtbare Tiles bleiben vorab gefiltert. **Begründung:** Ohne dieses Ereignis könnte ein World-Tile bereits vor Fertigstellung eines langsamen Terrain-Chunks sein Retrybudget aufbrauchen und trotz später bereitstehender Daten dauerhaft verborgen bleiben.

## D-016: Vorhandenen Tile-Compositor statt neuen Renderer für Zoom benutzen (2026-10-27)
**Entscheidung:** `applyZoom()` einschließlich Home-Zentrierung ohne Zoomänderung darf nach erfolgreichen Vorbereitungsarbeiten die bereits vorhandene `fastRender()`-Pipeline nutzen. Dasselbe `id@lod`-Raster wird bei Kamera-Pan/Zoom neu positioniert und skaliert. **Grund:** Slider-/Tastaturzoom verwendete bislang den normalen Editor-Zeichenweg und konnte unveränderte Szene erneut aufbauen.

## D-017: Erstaufbau und Editor-Funktionalität bleiben direkt (2026-10-27)
**Entscheidung:** Kein Einstieg in die Fast-Kamera aus `applyZoom()`, solange weder fertige World-Tiles noch Terrain-Chunks vorhanden sind. Ebenso kein Shortcut bei finalem Export, Strategie-/Nicht-Kartenansichten und blockierenden Edit-/Debug-Overlays. Beim Deaktivieren der Schnellkamera auch nach `pointerup` persistierte Compositor-Anzeige abbauen. **Grund:** Die Optimierung darf nicht den Renderer-Bootstrap, Fog-Gates oder Editorfunktionen verhindern. Keine Änderung an DPR/LOD/GPU und keine selektive Cacheinvalidierung (Schritte 5/10/11).

## D-018: FPS-/Rebuild-Aussagen nur mit tatsächlichem Lauf (2026-10-27)
**Entscheidung:** Neu angelegte Szenarien prüfen unveränderte Source-Aufrufzahlen, Rasterversionen und den Routing-Entscheid. Native Node- und Browsermessungen sind getrennte Anforderungen. Die frühere 449,6-ms-Baseline wird nicht als neuer FPS-Wert ausgegeben.

## D-019: Quelleigene Pixeldichte bestimmt den Tile-Fertigstatus (2026-10-27)
**Entscheidung:** Ein groß skaliertes Bild ist nicht automatisch ein scharfes Tile. Ein aus `backgroundScene` und `staticScenery` kopiertes Welt-Tile trägt `preview:true`, wenn seine Pixel/Welteinheit unter der gewünschten Ground- oder Scenery-LOD liegen. Die Vollauflösung wird anschließend per bestehendem direkten Tile-Bake nachgeholt. **Begründung:** Sonst bleiben optisch grobe und scharfe Kacheln auf unbestimmte Zeit nebeneinander, obwohl die Warteschlange leer erscheint.

## D-020: Sofortige Vorschau erhalten, scharfe Nachbarn schützen
**Entscheidung:** Den bestehenden Fallback anzeigen, bis ein schärferes vollständiges Bild vorliegt. Eine Preview darf ein bereits fertiges Tile nicht herabstufen; nur die ungenügend aufgelöste Tile wird nachgebaut. Provisorische Bitmaps nicht über native Quelldichte aufblasen, Fehler terminal diagnostizieren, Fog-Sicherheit behalten. **Abgrenzung:** Keine allgemeine LOD- oder 4×-Qualitätsreform, keine GPU-Einführung und keine globale Cache-Invalidierungsänderung; dies verbleibt bei den späteren Roadmap-Schritten.

## D-021: Kamerastandort nie als Weltbildrevision verwenden (2026-10-27)
**Entscheidung:** Bei World-Tiles bestimmen nur Background-/Scenery-**Inhalts**signatur und Objektlayoutrevision die allgemeine Invalidierung. Snapshot-`zoom/panX/panY` sind ausschließlich Compositor-Transformationen. **Begründung:** Der alte globale Cache-Wipe beim Overscan-Nachbau widersprach dem retained World-Tile-Ansatz.

## D-022: Lokale Schreiboperationen nach Auswirkungsgebiet abgrenzen
**Entscheidung:** Für gezielte, bekannte Änderungen (Decoding einzelner Natur-/Objektbilder, Materialzelle ohne Küstenwechsel, eine Straßenkante) alle unmittelbar/über Halo betroffenen 512er Tiles über sämtliche LODs invalidieren; unveränderte Nachbarn beibehalten. Unbekannte Reichweite (Wald-/Flussnetz, Relief, Weltgeometrie, biomeweite Quelle) bleibt global. **Begründung:** Bessere Wiederverwendung, ohne grenzüberschreitende Baumkronen, Schatten oder Uferränder zu ignorieren.

## D-023: Road-Stamp statt globaler Straßenlisten-Signatur
**Entscheidung:** Road-Chunk-Familie wird nur durch Zeichnungsverfahren/Relief-/Baueingaben/LOD bestimmt. Pro-Chunk-Stempel enthält Straßenkanten, die den erweiterten Zeichnungsbereich schneiden. **Begründung:** Lokale Straßenänderungen dürfen weit entfernte vorbereitete Road-Raster nicht neu anfordern.

## D-024: Editor-Speichern von Bildinvalidierung trennen
**Entscheidung:** `persistScene(false)` schreibt nur Daten, `persistScene('ground')` aktualisiert ausschließlich Hintergrund/Memo, `persistScene()` bleibt konservativ global. Hintergrund-/Scenery-Canvas wird weiterhin als Ganzes gerendert, wenn dessen tatsächlicher Inhalt geändert wurde. **Begründung:** Speichern und reine Overlay-Optionen sind keine neue Weltrevision; Schritt 6 übernimmt weitere Tile-Vorbereitung.

## D-025: Sichtbare Tiles nach Kamerafokus und Wartealter priorisieren
**Entscheidung:** Die vorhandenen Foreground-/Warm-/Prefetch-Warteschlangen bleiben bestehen. Sichtbare Terrain- und World-Tile-Aufträge erhalten bei jedem Kamera-Update eine neue Reihenfolge anhand des aktuellen Fokus; wartende sichtbare Kacheln werden nach 2,5 Sekunden vor neuen zentralen Aufträgen behandelt. Noch gültige Background-Tiles werden vor einer doppelten Foreground-Berechnung geschützt. Nicht mehr relevante Arbeit wird verworfen beziehungsweise nach Möglichkeit als begrenzter Prefetch weiterverwendet. **Begründung:** Reine FIFO-Priorisierung nach dem ursprünglichen Kamerastand produziert nach schnellen Schwenks unnötige Verzögerungen und kann vorhandene Sichtlücken dauerhaft hinter neuen Aufträgen lassen.

## D-026: Hintergrundvorbereitung fair halten und World-Parallelität begrenzen
**Entscheidung:** Der World-Tile-Streamer begrenzt parallele Quellaufträge auf maximal zwei (Anwendung weiter eins). Die Chunk-Engine behält je eine Foreground- und Background-Arbeitsbahn; bei zugleich aktiven manuellen Warm- und Prefetch-Aufträgen erhält gültiges Prefetch nach sechs manuellen Starts eine Gelegenheit. **Begründung:** Sichtbare Renderaufträge müssen reaktionsfähig bleiben, ohne dass manuelle Großvorbereitung alle spekulativen Arbeiten endlos blockiert. Weitergehende Worker-Migration wird nicht vor Schritt 8 vorweggenommen.

## D-027: Küsten-RGBA-Union in die bestehende Terrain-Worker-Infrastruktur auslagern
**Entscheidung:** Die eindeutig verbleibende synchrone per-Pixel-Küstenkomposition in `VedrasShoreline.build` wird über den vorhandenen `terrain-worker.js`-Worker mit OffscreenCanvas und transferiertem ImageBitmap berechnet. Terrain- und Shoreline-Aufträge teilen sich Worker-Lebenszyklus, PNG-Texturmap, Bitmap-Besitz und Fehlerdiagnose. **Begründung:** Der Mainthread erstellt bislang die großen RGBA-Küstenraster, obwohl die Terrain-Worker-Infrastruktur bereits zur Verfügung steht; die bestehende Zeichenroutine kann unverändert im Worker ausgeführt werden. Eine gemessene Verbesserung bleibt Voraussetzung der abschließenden Abnahme.

## D-028: Worker-Migration mit synchronem Export und lokalem Fallback
**Entscheidung:** Nur der interaktive chunkbasierte Shoreline-Pfad ist asynchron. Bei Finalexport, deaktivierten/nicht unterstützten Workern oder einem Shoreline-Worker-Fehler bleibt `VedrasShoreline.build` synchron. Ein Küstenfehler darf die separate Terrain-Berechnung nicht grundsätzlich deaktivieren. **Begründung:** Exportbild und Plattformkompatibilität dürfen durch eine Performance-Migration nicht verschlechtert werden; gleiche Renderfunktion und Bitmaps ermöglichen Paritätsprüfung.
