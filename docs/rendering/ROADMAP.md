# Rendering-Roadmap v0.23–v0.25

Stand: 2026-10-27. Zuständiges Repository: markusjungblut/asset_labor.
Verbindliche Reihenfolge: Korrektheit -> Kamerapfad/Cache -> asynchroner Aufbau -> Bildqualität -> Messung -> Spielanbindung.

## Arbeitsprotokoll
Ein nummerierter Schritt pro Änderung/Commit. Zuerst `STATUS.md` und die relevanten Dateien lesen; vor Änderungen Ist-Verhalten prüfen; möglichst kleine Änderung; gezielte Tests; Ergebnisse dokumentieren. Keine vollständigen Quelldateien in Chatantworten ausgeben. Bei unvollständiger Abnahme Status „teilweise“ statt „abgeschlossen“.

## Phase I – Diagnose und Stabilität (v0.23.0)
1. **Baseline/Bestandsaufnahme**: Aktuellen Source-Stand, Renderpfade, Limits, Caches, Warteschlangen und Testabdeckung dokumentieren. Code unverändert lassen. Akzeptanz: `BASELINE.md`/`ARCHITECTURE.md`/`STATUS.md`/`DECISIONS.md` vorhanden und Snapshot-Commit gesichert. **Status: abgeschlossen als statische Bestandsaufnahme; Live-Browsermessung ausstehend.**
2. **Tile-Zustände instrumentieren**: Für Terrain- und World-Tile-Aufträge je Kachel key, Epoch/Revision, LOD, Queue-/Flight-Status, letzte Aktivität, Fehlergrund erfassen. Akzeptanz: jede unerledigte sichtbare Kachel hat erklärbaren Zustand. Keine funktionale Reparatur in diesem Schritt.
3. **Nicht endende Ladevorgänge reparieren**: Mit Messdaten aus Schritt 2 Queue, Requeue, Abort, Retry und Ready-/Painted-Bedingungen korrigieren. Akzeptanz: keine dauerhaft ungeklärte Ladeposition; Fog bleibt bis zu kompletter Freigabe deckend.

## Phase II – Rendering entkoppeln (v0.23.1)
4. **Kamera ohne Scene-Rebuild**: Gecachte Kacheln beim Pan/Zoom nur transformieren. Vorhandenen Fast-/Normal-Renderpfad vor Umbau vergleichen. Akzeptanz: reine Kamerabewegung baut keine unveränderte Landschaft neu.
5. **Cache-/Invalidierungsregeln**: Terrain, Welt-Tiles, Ufer, Wege, Wald, Scenery sowie Revisionen selektiv aktualisieren. Akzeptanz: stabiler Cache ohne unnötige globale Invalidierung; keine Nähte.
6. **Statische Natur/Schatten**: Vorhandenes `static-object-layer.js` und `object-layout-cache.js` weiterverwenden; nur nachweisbar fehlende Tile-Vorbereitung ergänzen. Akzeptanz: Kamera-Pan führt nicht zu Tausenden einzelnen Sprite-Zeichnungen.

## Phase III – Vorbereitung abseits des Interaktionspfads (v0.23.2)
7. **Priorität sichtbarer Tiles**: Bestehendes `chunks.js`/`world-tile-streamer.js`-Scheduling auf Fairness und unnötige Arbeit prüfen, korrigieren. Akzeptanz: sichtbare Tiles vor Warm-/Prefetch-Tiles, keine hängenden Aufträge.
8. **Worker-Pipeline ergänzen – nicht neu erfinden**: `terrain-worker.js` und `terrain-worker-client.js` sind bereits vorhanden. Erst mit Messungen belegen, welche Hauptthread-Arbeit verbleibt; nur sinnvolle weitere Aufgaben migrieren. Akzeptanz: Reaktionsfähigkeit verbessert, Parität und Fallback erhalten.
9. **Progressive Anzeige**: Vorhandene LOD-Alternativen und wolkenbedeckte unvollständige Kacheln korrekt nutzen. Akzeptanz: keine transparente Terrainlücke und kein Aufdecken unvollständiger Szenerie.

## Phase IV – Bildqualität (v0.24)
10. **LOD-Vertrag**: Vorhandenes `adaptive-lod.js` und das separate World-Tile-LOD aufeinander abstimmen; Welt/Region/Lokal. Akzeptanz: konsistente Zoomwechsel ohne Raster-Neuerstellung für reinen Pan.
11. **4× interaktive Qualität**: Vorhandene dichteabhängige 1,5×-DPR-Sperre, Canvas-Budgets und Bildpool-Previewlimits erst nach erfolgreicher Entkopplung neu bewerten. Akzeptanz: angezeigte wirksame DPR entspricht erlaubtem Qualitätsprofil ohne massive Stotterer; Finalexport unbeeinträchtigt.
12. **Fog und Schatten**: Cloud-Orientierung, Clip, Hex-Sichtbarkeit, Landschaftskanten und Overhang visuell prüfen. Akzeptanz: keine sichtbaren Artefakte.

## Phase V – Nachweis und Rendererentscheidung (v0.24.1)
13. **Reproduzierbare Browser- und Performancetests** auf dichter Karte, Flüssen, Bergen, Zoomwechsel, Pan und längerem Betrieb; Median/p95, Speicher, Warteschlange, Tile-Wiederaufbauten.
14. **GPU-Evaluierung**: existierendes `gpu-terrain.js` und `gpu-sprite-layer.js` als Vergleich einbeziehen; PixiJS nur bei gemessenem Nutzen. Ergebnis ist eine dokumentierte Entscheidung, keine erzwungene Migration.
15. **Freigabe**: Ziel 60 FPS beim Kamerapan über vollständig geladenes Gebiet, Mindestziel 30 FPS und keine unerklärten Tile-Hänger. Referenzgerät, Zoom und Detailgrad dokumentieren; keine Messwerte erfinden.

## Phase VI – Editor und Spiel (v0.25)
16. **Gemeinsamer MapViewport**: Editorwerkzeuge von Darstellung und Kamera trennen.
17. **Spielzustandsebenen**: Besitz, Straßen, Städte, Einheiten und persönlicher Fog getrennt von globaler Weltbasis führen; serverseitige Geheimhaltung berücksichtigen.
18. **Spielnahe Kartenansicht**: Hauptstadt, Hexauswahl, Erkundung, Gebietszustandsänderung und Bewegung mit derselben Engine demonstrieren.

## Fortsetzen
Nur Schritt 2 beginnen, sobald der Baseline-Browserlauf nachgeholt beziehungsweise ausdrücklich als offene Referenz dokumentiert ist. Aktuellen Stand immer aus `STATUS.md` und dem Git-Log übernehmen; alte Chat-Zusammenfassungen sind keine verlässliche Implementierungsquelle.
