# Schritt 17 – fertige Spielkarte statt ständiger Terrain-Neuberechnung

## Ziel

Im Asset-Labor wird eine **bearbeitbare** Welt bei Bedarf aus Biomen,
Materialien, Übergängen, Ufern, Straßen und Nature-Instanzen generiert.
In der späteren **fertigen Spielkarte** ändern sich diese Grundlagen meist
nicht mehr. Daher sollen diese aufwendigen Material-/Ground-/Scenery-Bakes
**einmalig bei der Kartenerstellung** stattfinden, nicht bei jeder
Kamerabewegung.

Der Spielmodus liest bereits fertig berechnete, unveränderliche
Bildkacheln und setzt sie in Weltkoordinaten zusammen. Er testet damit
den tatsächlichen Laufzeitpfad, den ein Strategiespiel später verwenden
könnte. Das Projekt kann die vorhandene PNG-Grafikqualität beibehalten,
ohne den langsamen Pixel-Worker bei jedem Pan neu zu benötigen.

## Aufteilung statisch / dynamisch

| Schicht | Wie im Spiel zu behandeln |
|---|---|
| Terrainmaterial, Biome, weiche Übergänge, Land/Ozean/Küste | **Statisch**; offline vorberechnen |
| Flussbetten, unveränderliche Straßen und Brücken | **Statisch**; in Ground-Bildkacheln |
| Feste Bäume, Felsen, Berge, fest platzierte dekorative Häuser und Bodenschatten | **Statisch**; in Scenery-Bildkacheln |
| Einheiten, bewegliche Figuren, UI, Auswahl, Bewegungspfade, Effekte | **Dynamische Runtime-Layer**; nicht in das Ground-PNG einbacken |
| Fog of War, Sichtbarkeitsstatus, Multiplayer-Geheimhaltung | **Dynamisch/autorisiert**; die vollständige Karte darf in einem späteren Multiplayer-Spiel nicht an unberechtigte Clients ausgeliefert werden |
| Geänderte Gebäude, Straßen, Terraforming, Zerstörung | **Selektive Aktualisierung** der betreffenden Bildkacheln; im aktuellen statischen Test noch nicht implementiert |

**Wichtig:** In dieser ersten Asset-Labor-Probe enthält die bestehende
`scenery`-Schicht **fertige statische Dekoration**, nicht
spielmechanisch bewegliche Einheiten. Spielaktionen/Fog/Einheiten sind
im eigenständigen Test **noch nicht implementiert**, nicht angeblich
bereits optimiert.

## Implementierte Komponenten

- `world-tile-streamer.js:exportExactPackets()` liefert **nur**
  vollständig vorbereitete, nicht als `dirty`/Preview markierte
  World-Tile-Pakete aus dem aktuellen Sichtbereich; mindestens je eine
  Ground- und Scenery-Schicht erforderlich.
- `frozen-map-runtime.js`: speichert diese Layer als **verlustfreie
  PNG-Blobs in der browserlokalen IndexedDB** und liest sie anschließend
  nach Weltkoordinaten wieder aus. Erhält Source-Crop-/Padding-Metadaten,
  verfügt über eine begrenzte Decoded-Image-LRU und startet keine
  Autotile-, Terrain-Worker- oder WorldTile-Quellen.
- Für jede Karte ein eigenes **Manifest** mit lokalem Karten-Fingerprint,
  Hex-Geometrie und initialer Kamera; statische Inhaltsänderungen erhalten
  eine andere Kennung. Alte Archive bleiben unverändert.
- `frozen-map-package.js` exportiert ZIP mit **PNG-Layern,
  Manifest, Hex-Geometrie und Kamera**. Ein unfertiges Paket wird
  ausdrücklich als `complete:false` mit Zahl der vorhandenen/erwarteten
  Kacheln markiert. Ein ZIP-Import ist noch nicht implementiert.
- **Separater Browserviewer** `frozen-map-game.html` /
  `frozen-map-game.js`. Lädt **ausschließlich**
  `frozen-map-runtime.js` plus den kleinen Viewer, **nicht**
  `app.js`, `chunks.js`, `terrain-worker.js`,
  `world-tile-streamer.js` oder andere Editor-Module.
  Pan und Zoom verändern nur die Kamera über fertigen PNG-Bildern.
- Im Asset-Labor zusätzlich eingebetteter Spielkarten-Test mit
  eigenen Controls und pausierten Chunk-/WorldTile-Warteschlangen.
  Für einen **sauberen Performancevergleich** bevorzugt den
  eigenständigen Viewer im zweiten Tab.
- Für den einmaligen Offline-Backprozess existiert eine abbrechbare
  **Gesamtkarten-Tour**: Sie besucht alle belegten 512er Chunks,
  speichert gefundene `exact`-Layer sofort und überspringt beim
  erneuten Start bereits gespeicherte Kacheln. Sie behauptet keinen
  Erfolg, wenn ein Chunk nicht fertig wurde.

## Konkreter Bedienablauf in Firefox/Windows

1. Den GitHub-Branch
   `feat/step17-frozen-map-runtime-test-20261101` auschecken,
   lokalen Asset-Labor-Server neu starten, Firefox hart aktualisieren.
2. Gewünschte Szene laden, **4×-Renderqualität** wählen,
   Fog-of-War-Demo ausschalten. Die normale Map muss angezeigt werden.
3. Rechts im Bereich **„Spielkarten-Test · fertig vorberechnete Karte“**
   den Button **„Gesamte Karte einmalig als Spielkacheln vorbereiten“**
   betätigen. Das ist bewusst eine **Offline-Vorbereitung im Editor**,
   bei der die bisher langsamen Worker-Chunks noch berechnet werden.
4. Vorgang abwarten; das Statusfeld meldet bereits gespeicherte,
   neue und **noch fehlende** Regionen. Ein Abbruch ist möglich,
   bisherige Bildkacheln bleiben bestehen. Bei fehlenden Regionen
   kann derselbe Vorgang fortgesetzt werden.
5. **„Fertige Spielkarte ohne Asset-Labor öffnen“** startet
   `frozen-map-game.html` in einem neuen Tab. Jetzt kann man pannen
   und zoomen; es werden nur zuvor vorberechnete Bildkacheln gelesen.
   Es werden **keine Materialübergänge** mehr berechnet.
6. Optional **„Fertige Karte als ZIP-Bildatlas exportieren“**.
   Ist die Karte unvollständig, wird das ausdrücklich im ZIP-Manifest
   dokumentiert. Das ZIP wird nicht stillschweigend als fertige
   Multiplayer-Karte behandelt.

Für den Windows-Testlauncher:

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch feat/step17-frozen-map-runtime-test-20261101
git pull --ff-only origin feat/step17-frozen-map-runtime-test-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Die Regressionen erwarten **142/142** Fälle in 15 Testdateien.
**16/16** neue Spielkarten-Tests wurden isoliert mit dem echten
Produktionscode im V8-Testaufbau ausgeführt und bestanden.
Der gesamte native Windows-Lauf **ist noch offen**. Die älteren
118/118 beziehen sich auf PR #98, nicht auf diesen SHA.

## Was genau wird hier gemessen?

**Getrennte Messungen sind Pflicht:**

1. **Einmaliges Karten-Baking:** Gesamtzeit der Offline-Tour,
   Zahl der `exact`-Pakete, nicht fertiggestellte Chunks,
   PNG-Datenvolumen.
2. **Spiel-Ladezeit:** Zeit für IndexedDB-Bildzugriffe und
   PNG-Dekodierung beim ersten Öffnen. Das ist **I/O**, keine
   Gelände-Neuberechnung.
3. **Spiel-Kamerazeit:** `window.__vedrasFrozenGameTest.stats()`
   im eigenständigen Tab meldet `paintMs`, `frames`,
   `decoded`, `pending`, `saved` und Pixelbudget.
4. **Visuelle Integrität:** Vergleich gespeicherter Ground-/Scenery-
   Pakete bei verschiedenen Zoomstufen mit der Editor-Vollqualität,
   besonders die weißen horizontalen/vertikalen Chunk-Grenzen
   aus Issue #90.

**Die geforderte mindestens 50-fache Beschleunigung ist ein
Leistungsziel, kein bereits gemessener Fakt.** Der Vergleich
`Baking während Pan` vs. `fertiges Bild aus Speicher zeichnen`
unterscheidet verschiedene Arbeitsumfänge und darf nicht als
gleichartige Worker-Benchmark ausgegeben werden.

## Grenzen dieses Drafts

- Der Editor muss die ganzen hochwertigen Kacheln **einmalig**
  fertigstellen können. Fehlerhafte, nie vollständig fertiggestellte
  Chunks werden nicht durch provisorische Vorschau ersetzt.
  Die Offline-Tour kann langsam sein und muss bei fehlenden Paketen
  ggf. erneut durchlaufen werden.
- IndexedDB-Archive gelten **nur für denselben Browser und dieselbe
  Origin** (`127.0.0.1` und Port müssen gleich bleiben).
- Der standalone Viewer liest browserlokale Bildpakete; das ZIP
  ist ein transportables Zwischenformat mit Manifest, aber noch
  **kein vollständiger Netzwerk-/Multiplayer-Assetloader**.
- WorldTile-`scenery` enthält den bestehenden Baked-Scenery-
  Output. Ob einzelne Gebäude/Objekte künftig dynamisch sein sollen,
  muss die eigentliche Spiellogik entscheiden.
- Ein separat gespeicherter Bildatlas löst nicht automatisch
  vorhandene weiße Kachelgrenzen. Issue #90 bleibt offen.
- Es fehlt noch ein **echter Firefox-Abnahmelauf** und die
  Gesamtsuite auf Windows. Keine Merges oder Freigabe von
  Schritt 16B/17/20 ohne diese Akzeptanz.

## Nächste Architekturentscheidung

Wenn das **fertige** Kartenbild schnell und stabil läuft, muss
nicht die gesamte Runtime auf GPU umgestellt werden. Ein späterer
GPU-Kompositor kann dennoch helfen, *offline* Bildpakete schneller zu
erzeugen oder dynamische Schichten zu optimieren. Die bekannte
langsame Terrain-Generator-Pipeline darf im Asset-Labor bestehen,
solange sie die Spielansicht nicht blockiert.

[Performance-Issue #92](https://github.com/markusjungblut/asset_labor/issues/92)
· [50×-Ziel #100](https://github.com/markusjungblut/asset_labor/issues/100)
· [Grafiknähte #90](https://github.com/markusjungblut/asset_labor/issues/90).
**Draft, kein Merge.**
