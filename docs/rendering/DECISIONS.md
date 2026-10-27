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
