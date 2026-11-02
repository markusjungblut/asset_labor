# Schritt 24 – Stabile WorldTile-Sortierung und scharfe Live-Kamera

Stand: 02.11.2026 · baut auf Draft-PR #108 (Schritt 23) auf.

## Auslöser: Echter Firefox-Screenshot

Der Nutzer meldet bei Pan/Zoom:
- Baum-/Sprite-Gruppen erscheinen plötzlich vor anderen oder wirken versetzt; teils bleibt die Überlagerung nach Ende des Ladevorgangs inkorrekt.
- Während des Pannings ist der gesamte Kartenausschnitt unscharf.
- Kacheln laden scheinbar erst nach dem Ziehen, und Ladewolken bleiben während der Kamerabewegung stehen.
- Die bisherigen Panorama-Cache-Optimierungen haben die vollständige Qualität nicht ausreichend abgesichert.

Der Screenshot zeigt ein abruptes wolkiges Dreieck am rechten Kartenrand und noch aktive Zoomvorschau (`Zoomvorschau aktiv`, sehr viele Zwischenbilder). Das erlaubt **nicht** den Schluss, dass die gespeicherten 2×-PNGs selbst defekt sind. Es legt Fehler im Bild-Kompositing und beim gepufferten Bildschirmbild nahe.

## Root Cause 1 – Sicht-/Lade-Reihenfolge beeinflusste Sprite-Z-Ordnung

Der bisherige Renderer sortierte `visible`-Tiles nach **Distanz zur Bildschirmmitte**, bevor `paintWorld` sie als `scenery`/Ground zeichnete. `paintOverview()` sortierte geladene Kacheln dagegen nach **Tile-ID**. Auch das LRU-System verändert die Reihenfolge der dekodierten Maps.

**Das ist für ausladende Baumkronen falsch:** Scenery aus benachbarten 512-Welteinheiten-WorldTiles überlappt sich um bis zu 128 Welteinheiten. Die Kompositionsreihenfolge darf deshalb nicht von Kamera-, Cache- oder Lade-Reihenfolge abhängen.

**Fix:** Beide Renderpfade verwenden vor dem Zeichnen dieselbe, deterministische **Welt-Y-Tiefe, danach Welt-X-Koordinate, dann Tile-ID**. Die vorhandenen internen Pixelpositionen, Schatten, PNG-Crops und Padding bleiben unverändert. Die sichtbare Kachelauswahl berücksichtigt zusätzlich den 128-Einheiten-Überhang, damit die Krone einer außerhalb liegenden Nachbarkachel gezeichnet wird, **bevor** ihr Terrainkern den Bildschirm betritt. Die Panorama-Quellauswahl enthält ebenfalls diesen Überhang (mindestens 160 Welteinheiten).

**Grenze:** Weil Scenery im Originalatlas bereits je WorldTile zu einem gemeinsamen PNG verflacht wurde, kann Tile-Y-Sortierung **keine perfekte individuelle globale Z-Sortierung jedes einzelnen Baumes aus unterschiedlichen Tiles** garantieren. Wenn die Fehlüberlagerung auch im direkten Referenzmodus bestehen bleibt, müssen die vorhandenen Bake-Ownership-/Layer-Aufteilungen genauer geprüft werden. Ohne visuelle Gegenprüfung wird keine vollständige Korrektheit behauptet.

## Root Cause 2 – Unschärfe und stehenbleibende Wolken durch statische Vorschau

Schritt 22/23 zeichnete beim Drag oder Zoom ein temporäres `zoomPreview` aus einer stark heruntergerechneten (maximal 4 Millionen Pixel), bereits zusammengesetzten Bildschirm- bzw. Panoramafläche. Diese Fläche wurde beim Pan **gestreckt und verschoben**, also unscharf. Gleichzeitig enthielt sie die Cloud-Overlays **zum Aufnahmezeitpunkt**. Neue PNGs konnten zwar parallel laden, doch ihre Wolken verschwanden visuell erst nach Preview-Ende.

**Fix im Spiel-Viewer:**
- `player.beginZoomPreview()` und `player.endZoomPreview()` werden bei normalen Maus-/Wheel-Ereignissen **nicht mehr aufgerufen**. Bei Drag werden stets die wirklichen Welt-Layer live gezeichnet; neue `storage.get`-Fertigstellungen rufen `repaint()` auf und Wolken können **während** des Pannings transparent werden.
- Bestehende, bereits korrekte **gepufferte World- und Cloud-Raster-Caches** bleiben erhalten. Sie nutzen keinen verkleinerten 4-Megapixel-Snapshot, sondern sind in echter aktueller Canvas-DPR gezeichnet; Panbewegungen innerhalb der Pufferfläche sind nur ein präziser Bitmap-Offset.
- Zoomschritte berechnen die **echten** Layer bei jeder dargestellten Zoomstufe. Um teure Canvas-Neuallokationen beim Scrollen zu reduzieren, wird während des Wheel-Gestures eine feste temporäre DPR ≤1,25 verwendet und nach 130 ms Ruhe einmal das korrekte 2×-/Übersichts-DPR wiederhergestellt. Beim normalen Pan wird die tatsächliche Auflösung **nicht** abgesenkt.
- Der Preis: Starke Zoombewegungen sind ggf. zunächst weniger flüssig als eine unscharfe Preview; dafür gibt es keine falsch skalierte Pixel-/Fog-/Z-Ordnung. Weitere Performanceoptimierungen dürfen erst nach visuell korrekter Kamerakomposition erfolgen.

## Diagnostischer A/B-Modus

Normaler Viewer:

`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near`

Unabhängiger Referenzrenderer ohne Panorama-/Wolken-Canvas-Caches:

`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&render=direct`

**Beide** nutzen dieselben gespeicherten 2×-PNG-Ableitungen, dieselbe CROP-Metadaten und identische feste Tile-Tiefenordnung. `render=direct` dient ausschließlich der Fehleranalyse und kann langsamer sein. Der Modus ändert **keine** IndexedDB-Daten oder Originaldateien. `window.__vedrasFrozenGameTest.stats().renderMode` zeigt `cached` bzw. `direct`.

## Lokaler Test

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step24-stable-world-sprites-live-camera-20261102
git pull --ff-only origin fix/step24-stable-world-sprites-live-camera-20261102
node --test tests/test_rendering_step24_live_camera_depth_20261102.cjs
```

Der Viewer muss unter derselben Firefox-Origin `127.0.0.1:8780` wie die bisherige Karte laufen. **Keine Browserdaten löschen, keine erneute Vorbereitung der Karte, kein 4×-Bake.**

Prüfen:
1. Normal bei 100–273 % Pan: Bei bereits geladenen Kacheln darf die Ansicht **nicht durch eine heruntergerechnete Vorschau unscharf werden**. Die Baumkronen dürfen bei Kamerabewegung nicht ihre Z-Reihenfolge wechseln.
2. Mehrere Hexfelder nach rechts/links ziehen, während Kacheln noch laden: Die Ladewolken sollen **während** der Bewegung und nicht erst danach auflösen. Neue Bildbereiche werden vom Reader sofort angefordert, nicht erst beim Loslassen.
3. Von 100 % auf 25 % herauszoomen, Randwolken, Kronen und Schatten prüfen. Beim Zoom wird ggf. temporär auf DPR ≤1,25 heruntergeschaltet, anschließend auf die von der Display-Policy vorgegebene Dichte.
4. Dasselbe Weltgebiet bei derselben Zoomstufe einmal mit `&render=direct` ansehen. Wenn die Objekt-/Schattenordnung nur mit Cache falsch ist, folgt ein Cache-Kompositions-Fix. Wenn beide Versionen identisch falsch sind, muss die im Atlas eingefrorene Kachel-Eigentümer- bzw. Sprite-Tiefenordnung repariert werden.
5. `window.__vedrasFrozenGameTest.stats()`: `zoomPreviewActive:false`, `zoomPreviewFrames:0`, `renderMode:'cached'|'direct'`, `pending`, `overviewRasterHits`, `paintMs`.

## Prüfstand

Alle geänderten JS-Dateien sind syntaktisch geprüft. Isolierter V8-Test mit neun vollständig geladenen Paketen: Direct- und Cache-Renderer geben dieselbe Abfolge der 9 Scenery-Tiles aus; Wechsel von 80 % auf 90 % Zoom ändert diese Reihenfolge nicht. Weiterer isolierter Test zeigt, dass eine Kachel deren Groundcore rechts knapp außerhalb des 400px-Bildschirms liegt, mit ihrer um 128 Welteinheiten überhängenden Scenery **bereits im Bild gemalt wird**. Der produktive Viewer enthält keinen Aufruf der alten Vorschaumethoden. **Ein echter Firefox-E2E-Lauf mit 120 gespeicherten Tiles steht noch aus**; PR bleibt Draft.
