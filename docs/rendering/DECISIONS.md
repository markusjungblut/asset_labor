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
