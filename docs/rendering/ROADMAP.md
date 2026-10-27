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
4. **Kamera ohne Scene-Rebuild**: Gecachte Kacheln beim Pan/Zoom nur transformieren. Vorhandenen Fast-/Normal-Renderpfad vor Umbau vergleichen. Akzeptanz: reine Kamerabewegung baut keine unveränderte Landschaft neu. **Code-Status: implementiert und isoliert getestet; echte Browser-Abnahme ausstehend (teilweise).**
5. **Cache-/Invalidierungsregeln**: Terrain, Welt-Tiles, Ufer, Wege, Wald, Scenery sowie Revisionen selektiv aktualisieren. Akzeptanz: stabiler Cache ohne unnötige globale Invalidierung; keine Nähte. **Code-Status: implementiert und isoliert getestet; echte Karten-/Naht-Abnahme ausstehend (teilweise).**
6. **Statische Natur/Schatten**: Vorhandenes `static-object-layer.js` und `object-layout-cache.js` weiterverwenden; nur nachweisbar fehlende Tile-Vorbereitung ergänzen. Akzeptanz: Kamera-Pan führt nicht zu Tausenden einzelnen Sprite-Zeichnungen.

## Phase III – Vorbereitung abseits des Interaktionspfads (v0.23.2)
7. **Priorität sichtbarer Tiles**: Bestehendes `chunks.js`/`world-tile-streamer.js`-Scheduling auf Fairness und unnötige Arbeit prüfen, korrigieren. Akzeptanz: sichtbare Tiles vor Warm-/Prefetch-Tiles, keine hängenden Aufträge. **Code-Status: implementiert und 58/58 isolierte V8-Regressionen bestanden; echte Browser-/native Node-Abnahme ausstehend (teilweise).**
8. **Worker-Pipeline ergänzen – nicht neu erfinden**: `terrain-worker.js` und `terrain-worker-client.js` sind bereits vorhanden. Erst mit Messungen belegen, welche Hauptthread-Arbeit verbleibt; nur sinnvolle weitere Aufgaben migrieren. Akzeptanz: Reaktionsfähigkeit verbessert, Parität und Fallback erhalten. **Status: Shoreline-CPU-Komposition als verbleibender Mainthread-Pfad identifiziert und in vorhandenen Worker integriert, 71/71 isolierte V8-Tests bestanden; echter Browser-Profiler/Native-Node-Lauf/visuelle Parität weiter offen (teilweise).**
9. **Progressive Anzeige**: Vorhandene LOD-Alternativen und wolkenbedeckte unvollständige Kacheln korrekt nutzen. Akzeptanz: keine transparente Terrainlücke und kein Aufdecken unvollständiger Szenerie. **Code-Status: implementiert, 98/98 gezielte simulierte V8-Regressionstests; echte Node-/Browser-/Performanceabnahme ausstehend (teilweise).**

## Phase IV – Bildqualität (v0.24)
10. **LOD-Vertrag**: Vorhandenes `adaptive-lod.js` und das separate World-Tile-LOD aufeinander abstimmen; Welt/Region/Lokal. Akzeptanz: konsistente Zoomwechsel ohne Raster-Neuerstellung für reinen Pan. **Code-Status: implementiert; 110/110 isolierte V8-Testfälle bestanden, native Node-/Browser-Abnahme ausstehend (teilweise).**
11. **4× interaktive Qualität**: Vorhandene dichteabhängige 1,5×-DPR-Sperre, Canvas-Budgets und Bildpool-Previewlimits erst nach erfolgreicher Entkopplung neu bewerten. Akzeptanz: angezeigte wirksame DPR entspricht erlaubtem Qualitätsprofil ohne massive Stotterer; Finalexport unbeeinträchtigt. **Code-Status: Budget- und Quellpolicy implementiert, 124/124 simulierte V8-Tests; FPS-/Browser-/Node-Abnahme noch ausstehend (teilweise).**
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

## Schritt-2-Übergabe (2026-10-27)
Die geplante Instrumentierung aus Schritt 2 ist in `chunks.js`, `world-tile-streamer.js` und `app.js` umgesetzt; 4/4 isolierte V8-Tests bestanden. Vollständige lokale Node- und Browser-Regression ist offen. Vor einer Reparatur in Schritt 3 die Diagnosebefunde der echten gespeicherten Szene erfassen; `STATUS.md` ist die aktuelle Übergabe.

## Schritt 3 – gezielte Tile-Liveness-Reparaturen (2026-10-27)
Die in Schritt 2 erkannten Codepfade (`cached-empty`, `source-null`, alte Signaturen und nichtsettende Quellen) besitzen jetzt begrenzte Wiederholungen und einen terminalen Diagnosezustand. Die reine Tile-Freigabe wurde in der schnellen Kamera so ergänzt, dass vorbereitete, aber noch unbemalte Terrain-Cores **nur direkt offscreen** fertig gezeichnet werden können; Bild-Snapshots verlangen weiterhin gemalte Core-Versionen. Die Implementierung ist durch isolierte V8-Tests geprüft, die echte Browser-Abnahme aus `STATUS.md` ist noch offen. Erst danach Schritt 4 ausführen.

### Schritt-3-Nachtrag: Terrain-Ready-Signal
Die rein zeitgesteuerten World-Tile-Retries wurden um ein zielgerichtetes `terrainReady(tileId)` ergänzt. Nach Fertigstellung eines konkreten Terrain-Chunks kann genau dieses zuvor erfolglos angefragte sichtbare World-Tile ohne Pan/Zoom wieder starten. Keine globale Cache-Invalidierung; keine Änderung der späteren Roadmap.

## Schritt-4-Übergabe (2026-10-27)
Die Maus-/Wheel-Fast-Kamera war bereits vorhanden und blieb unverändert. `applyZoom()` für Slider/Tastatur/Home aktiviert sie nun bei vorbereitetem Gelände ebenfalls, statt trotz unverändertem Weltsnapshot einen vollständigen Editor-Frame anzufordern. Nach `pointerup` bleiben vorbereitete World-Tiles im Compositor. Editor-/Strategie-/Exportansichten und kalte Erstansichten nutzen weiterhin den normalen Renderer. Neuer Test: `tests/test_camera_only_step4_v023_20261027.cjs`; Details und offene Browserprüfung in `STATUS.md`. Arbeiten an Schritt 5 (selektive Cacheinvalidierung) und Schritt 10/11 (LOD/4×) nicht vorziehen.

### Schritt-4-Nachbesserung: Vorschau ist nicht gleich Fertigbild
Neue Kacheln aus einem zu niedrig aufgelösten Editor-Snapshot bleiben als sofortige Vorschau zulässig; sie zählen aber nicht mehr als endgültiges Bild in der gewünschten LOD-Dichte. `world-tile-streamer.js` stellt bei gleichbleibendem Kamera-LOD eine gezielte Qualitätsanforderung, ohne scharfe Nachbarn neu aufzubauen. Keine vorgezogene Änderung an globaler LOD-Politik, GPU oder DPR-Limits. Isolierte Tests 8/8 neu; nativer Node-/Browservergleich weiter offen; siehe `STATUS.md`.

## Schritt-5-Übergabe (2026-10-27)
World-Tile-Inhalte werden nur noch bei tatsächlicher Bildrevision oder räumlich bekannten Eingriffen invalidiert, nicht wegen Verschiebung der Kamera-/Overscan-Snapshots. Terrain-Zelländerungen ohne Küstenwechsel, Änderungen an Straßen und einzelne nachgeladene Spritequellen können ihren lokalen Weltkachel-Footprint erneuern; betroffene LOD-Varianten und wartende Jobs werden sicher verworfen. `roadChunks` erkennt Änderungen jetzt mit per-Tile-Stamps. Shoreline- und speichernde UI-Aktionen invalidieren nicht mehr pauschal Szenerie. Große Abhängigkeiten (Waldökologie, Flussnetz, Wasserwechsel, globale Relief-/Materialänderungen) bleiben konservativ, damit keine veralteten Bilder/Nahtartefakte stehen bleiben. Ausführliche Fälle/Tests und Browser-Abnahme: `STATUS.md`. Schritte 6 und 7 wurden anschließend implementiert, die Browserabnahme bleibt ausstehend.


## Schritt-7-Übergabe (2026-10-27)
`chunks.js` und `world-tile-streamer.js` ordnen sichtbare Jobs bei Kamerabewegungen nach der aktuellen Position neu; länger als 2,5 Sekunden wartende sichtbare Tiles behalten ihre Wartezeit und erhalten Vorrang. Veraltete Ergebnisse werden verworfen, Doppelstarts vermieden, World-Tile-Parallelität begrenzt und manuelle Hintergrundvorbereitung durch gelegentliche Prefetch-Turns fair gehalten. Detailprüfungen: `docs/rendering/STATUS.md`. Wolken im sichtbaren Bereich, unvollständige Küsten und schlechte gemeldete Browserperformance bleiben ausdrücklich ungeklärt. Die nächste Arbeit ist die echte Browser-/Native-Abnahme dieser Fehler, nicht bereits Schritt 8.


## Schritt-8-Übergabe (2026-10-27)
Auf Grundlage des bestätigten synchronen `VedrasShoreline.build`-Aufrufs im Chunk-Renderer nutzt die Küsten-RGBA-Überlagerung den bereits existierenden Terrain-/OffscreenCanvas-Worker. Neue Worker-Befehle, Client-Routing und getrennte Messzähler wurden hinzugefügt; bei Export, fehlender Workerunterstützung oder Fehler bleibt die bestehende Canvas2D-Berechnung erhalten. Der vorangegangene Bugfix beseitigt die rechteckige 240-ms-Tile-Fade-Animation und verhindert Küstencache-Freigabe vor Shoreline-Readiness. Keine LOD-/DPR-Politik und kein Schritt 9 vorweggenommen. **Browsermessungen und Sprite-/Coast-Vergleich fehlen weiterhin**; bis dahin Schritt 8 nur teilweise abgenommen. Details: `STATUS.md`.


## Schritt-9-Übergabe (2026-10-27)
Die bereits existierenden LOD-Alternativen werden bei laufendem Zoomwechsel als **vollständige** Ground+Scenery-Pakete weitergenutzt. Ein vorhandenes hochwertiges Alternativ-LOD wird nicht durch einen unschärferen provisorischen Seed ersetzt; ein vollständig berechnetes Ziel-LOD übernimmt atomar. Unfertige oder unvollständige Bildpakete werden nicht als fertige Vorschau gespeichert. Transparente Bereiche der Wolkengrafiken haben nun eine opake, hexgenaue Sicherung, auch solange PNGs/Fog-Modul laden. Messfelder: `worldTileStats().progress`, `tileDiagnostics().world.tiles[].displayedLod`. **98/98 isolierte V8-Testfälle bestanden; native Node/Browserprüfung offen**. Der konkrete LOD-Schwellenvertrag bleibt unverändert und gehört zu Schritt 10. Siehe `STATUS.md`.


## Schritt-10-Übergabe (2026-10-27)
`adaptive-lod.js` definiert jetzt die gemeinsamen Welt-/Region-/Lokal-Level inklusive Welt-Tile-Dichten und Hysterese. `app.js` verwendet denselben `adaptiveLOD`-Controller für Terrain, Ufer, Flüsse, Straßen und die World-Tile-Komposition. Der unabhängige World-Tile-Schwellenwertpfad wurde ersetzt, inklusive eines passenden Backwards-Compatibility-Fallbacks. Reiner Pan erzeugt keine LOD-Umschaltung und bei vorbereiteten Caches keinen Raster-Neuaufbau; Zoomwechsel folgen denselben Grenzwerten. **Teststand: 110/110 isolierte V8-Fälle**, nativer Node-/Browser-/Küstennahtvergleich noch ausstehend. **Keine Änderung am strategischen Fernmodus, DPR-/4×-Sperren, World-Tile-Rasterdichte, Fog oder Finalexport.** Details: `STATUS.md`.


## Schritt-11-Übergabe (2026-10-28)
Eine explizite `render-quality-policy.js` ersetzt die dichteabhängige starre `1,5×`-Grenze durch Canvas-Budgets (normal 14 MP, Nature-dicht 8 MP, Maximalachse 4096). Auch die Fast-Kamera nutzt jetzt genau die wirksame `state.dpr`, keinen stillen 2×-Cap. Die beiden vorbereiteten Canvas-Layer haben je 17-MP-Hardlimits mit adaptivem Overscan. Quellen im bestehenden 192-MiB-Bildpool lassen sich über `setPreviewLimits()` bei bedarfsgesteuertem `ensure()` selektiv nachladen: Fast/Auto 512/1024, 4× 1536/2048, höchstens ein Upgrade gleichzeitig und die vorherige Grafik bleibt als Fallback. Effektive DPR, Limitierungen und Speicherwerte sind im Editor/über `qualityStats()` einsehbar. Finalexport, LOD-Vertrag, Fog, Terrain-/Küsten-/Sprite-Geometrie unverändert. **124/124 isolierte JavaScript-Testfälle**, Browser-FPS-/Speicher-/PNG-Vergleich ausstehend. Siehe `STATUS.md`.
