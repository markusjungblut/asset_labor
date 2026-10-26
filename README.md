## v0.20.1 – Progressives Nachladen beim Wischen (26.10.2026)

**Anlass:** In v0.20 konnte sich die Kamera schnell bewegen, aber bei 200 %
Zoom zeigte der Editor am Bildrand nur den neutralen Canvas-Hintergrund
und frei schwebende Bäume. Erst nach dem Loslassen wurden Terrain und
weitere Schichten vollständig aufgebaut; die exakte Neuzeichnung
benötigte teils etwa zwei Sekunden.

### Sofortmaßnahmen

- **Bäume und Schatten dürfen nicht außerhalb vorbereiteten Geländes
  schweben.** Der neue Echtzeit-Compositor beschneidet die statische
  Objekt-/Schattenebene auf den tatsächlich vorhandenen Hintergrund-
  Snapshot und bereits fertig berechnete neue Terrain-Chunks.
  Die zugrunde liegenden Sprites oder Weltpositionen werden nicht
  verändert.
- **Terrain beginnt während der Geste zu laden.** Der Fast-Camera-
  Pfad ruft ungefähr alle 90 ms `terrainChunks.prime(...)` für den
  aktuellen Bildschirm-Ausschnitt auf. Diese Jobs sind dringend und
  bleiben trotz des angehaltenen spekulativen Prefetch verfügbar.
  `readyTiles()` stellt die im Cache tatsächlich fertigen Raster
  dem Compositor direkt zur Verfügung; die Worker-Resultate lösen
  unmittelbar einen schnellen Frame aus.
- **Neu fertige Chunks werden sofort sichtbar:** Außerhalb des
  gepolsterten alten Hintergrunds werden fertige Raster auf ihren
  *exklusiven 512-Weltpixel-Kern* begrenzt gezeichnet. Innerhalb
  eines alten Hintergrund-Snapshots wird nur nachgezeichnet, wenn
  dessen gespeicherte Tile-Version veraltet oder unvollständig ist.
  Damit werden keine bereits korrekt zusammengesetzten Flüsse,
  Straßen und Schatten grundlos überdeckt.
- **Grobe Welt-Vorschau statt völlig leerer Fläche:** Für noch nicht
  fertig gezeichnete Hexfelder zeigt die schnelle Kamera
  vorübergehend ein einfaches, aus den echten globalen
  Hexkoordinaten abgeleitetes Land-/Wasser-Schema. Sobald ein
  fertiger Raster-Snapshot oder Terrain-Chunk vorhanden ist,
  deckt er die grobe Vorschau ab. Keine neuen Assets notwendig.
- **Diagnose:** Live-Kamera meldet jetzt die Terrain-Abdeckung,
  die Anzahl vorbereiteter Terrain-Chunks und noch ausstehende
  dringende Aufträge.
- **Unverändert:** exportierte Szenen und hochwertige PNGs,
  Editor-Werkzeuge, 3-stufiges adaptives LOD, bisherige
  Terraintypen und aktuelle Quellen von Schatten/Sprites.

### Geplantes v0.21 – Fog of War und Kachel-Streaming

Die grobe Land-/Wasser-Vorschau in v0.20.1 ist **nicht**
der spätere Fog of War. Für v0.21 ist festgelegt:

1. **Nie entdeckt:** Die Karte zeigt Wolken; unbekannte
   Weltinhalte werden an den Client nicht ausgeliefert.
2. **Entdeckt, aktuell außer Sicht:** Das bekannte Gelände
   bleibt erkennbar, aber grau/gedämpft (Age-of-Empires-
   Prinzip). Aktuelle fremde Einheiten bleiben verborgen.
3. **Sichtbar und geladen:** Hochwertige Gelände-/
   Objektkacheln ohne grauen Sichtschleier.
4. **Sichtbar, aber noch nicht geladen:** Dieselbe Wolkenoptik
   wie für unentdecktes Gebiet, unabhängig davon, ob es
   sich um eine neue Weltregion, einen Ausschnitt am Rand
   oder einen aus dem Speicher verdrängten Chunk handelt.
   Sobald die autorisierten Bilddaten eintreffen, lösen sich
   die Wolken weich auf.

**Wichtig:** Die *optische* Wolkenbehandlung eines Ladelochs
darf nicht mit *Zugriffsberechtigungen* verwechselt werden:
Der Server entscheidet verbindlich, welche Weltinhalte
ein Spieler jemals und aktuell sehen darf.

### Noch offene Leistungsgrenze

Dieses Update entfernt **nicht** den teuren vollständigen
Editor-Neuaufbau nach dem Loslassen und lädt noch keine
fertigen Region-Dateien von Server/CDN. Das Terrain erscheint
schrittweise bereits während des Wischens, aber Flüsse,
Küsten, Straßen und die volle Objektqualität außerhalb
älterer Raster folgen erst im präzisen Editor-Refresh.
Die vollständige Ablösung des alten Vollbildaufbaus und
ein lückenloser 500 × 500-Hex-Streaming-Pfad sind für v0.21+
vorgesehen. Es liegt kein gemessener FPS-Nachweis auf dem
Zielrechner vor; bei CPU-seitigem Rasterbau können weiterhin
Frame-Spitzen auftreten.

### Regression

`node --test tests/test_progressive_fast_camera_v0201_20261026.cjs`

Neue Modul- und Vertragstests prüfen Landschafts-/Scenery-
Clipping, progressive Vorlade-/Anzeige-Logik, Wasser vor
Relief, die schnelle Hex-Vorschau, Versionsabgleich
innerhalb alter Snapshots und den unveränderten Export.

## v0.20.0 – Echtzeit-Kartenrenderer: Fast-Pan / Zoom und wiederverwendbarer Tile-Compositor (24.10.2026)

**Ziel:** Beim Wischen und Zoomen nicht mehr die gesamte teure
Terrain-, Fluss-, Wald-, Straßen- und Objekterzeugung anstoßen.
Der neue Präsentationsrenderer ist vom Generatorzustand getrennt
und kann später vorab berechnete Weltgrafiken aus dem Spiel anzeigen.

### Neue gemeinsam nutzbare Komponente

`realtime-map-renderer.js` stellt `window.VedrasRealtimeMap.create({canvas,maxTiles,maxPixels})`
bereit. Das Modul kennt keine Hexgenerierung, keine Datenbank,
keine Bildquellenregeln und keine Editorwerkzeuge.

- **Raster-Snapshot-Modus:** `setSnapshots([{role:'ground',canvas,
  width,height,pad,dpr,zoom,panX,panY}, ...])` verwendet die
  tatsächlich gerenderten Canvas-Ebenen und ihre Weltkoordinaten.
  `render(camera)` berechnet nur ihre Kameratransformation und
  schneidet ausschließlich den benötigten Bildausschnitt per
  9-Parameter-`drawImage` zu. Kein Nachrendern der Wald-/Berg-
  schatten und kein erneutes Autotiling pro Kameraframe.
- **Weltkachel-Modus:** `putTile({id,layer,image,x,y,width,height,
  revision,owned})` nimmt **fertige** Kartenkacheln mit globalen
  Weltkoordinaten auf; `render(camera)` prüft ihre Sichtbarkeit,
  respektiert `projectY` und rendert sie von Gelände über
  Objekte bis zu Einheiten in definierter Reihenfolge.
  `removeTile(layer,id)` und `clearTiles()` verwalten Änderungen
  bzw. Cachefreigabe. Der LRU begrenzt Anzahl und Pixelbudget;
  nur ausdrücklich als `owned` markierte transferierte Ressourcen
  werden beim Evict geschlossen, nicht gemeinsam genutzte Assets.
- **Separate dynamische Ebene:** `render(camera,{drawDynamic(ctx,camera)})`
  kann Einheiten, Markierungen und andere zeitabhängige Elemente
  zeichnen, ohne den statischen Tile-Cache zu invalidieren.
- **Kamera:** Normierte Canvas-Kamera mit Zoom, Pan,
  Viewportgröße, DPR und orthografischer Projektion.
  Einmalige Größenanpassung statt Canvas-Neuallokation bei
  jeder Bewegung; der Renderer gibt Framezeit,
  Abdeckung, Tileanzahl und Belegung aus.
- **Keine externen Laufzeitbibliotheken.** Der Kern ist
  eigenständig und kann unter `window.VedrasRealtimeMap` in
  einem späteren Spielclient eingebunden werden.

### Asset-Labor: echte Interaktion mit der neuen Renderstrecke

- Neues, standardmäßig gesetztes Kontrollkästchen
  **Echtzeit-Kamera beim Wischen und Zoomen**;
  Einstellung `fastCamera` wird lokal gespeichert.
- Bei einer bereits warmen normalen Canvas-Testszene
  übernimmt während Pointer-Drag, Touch-Pan, Zweifinger-
  Zoom und Mausrad-Zoom die neue, pointertransparente
  `realtimeCanvas`-Ebene. Die Canvas-Quellen sind die
  **realen originalen** Hintergrund- und Sprite-/Schatten-
  Raster aus `static-object-layer.js`. Keine Neuberechnung
  von 1.549 Sprites oder Geländeshader im schnellen Frame.
- Solange eine Geste aktiv ist, stellt `requestDraw()` keine
  teure Editor-Hintergrund-Komposition in die Renderqueue.
  Bereits vorhandene Hintergrundvorlade-Jobs aller vier
  Chunkrenderer werden über `setInteractive(true)`
  pausiert und nach der Geste wieder fortgesetzt.
- Nach Loslassen / kurzem Mausrad-Leerlauf (160 ms) wird
  die vollständige **präzise** Editoransicht neu gezeichnet.
  Der Schnell-Canvas bleibt bis zu diesem Abschluss im
  Vordergrund; anschließend wird er versteckt.
- Die Kamera ist unabhängig von der Spieleingabe; das
  ursprünglich interaktive `mapCanvas` bleibt für
  Hexauswahl, Straßenbearbeitung und Schatten-Handles
  zuständig. Für Debug-Overlays und GPU-A/B-Modi wird
  vorsichtshalber weiterhin die vorhandene exakte Strecke
  verwendet. Zum Vergleich **GPU-Terrain und GPU-Sprites
  ausschalten**.
- Diagnose `Live-Kamera` zeigt die Anzahl schneller
  Kompositionsbilder, den Zeitbedarf ihrer Bildkomposition
  und die Abdeckung durch den vorhandenen Hintergrund.
  `VedrasAssetLabor.realtimeStats()` gibt Statistiken aus.

### Absichtliche Grenzen dieser ersten Integration

- Die Generatorvorschau nutzt **vorhandene vorbereitete
  Canvas-Ausschnitte**. Deren Überhang kann wegen der
  bestehenden 12-Megapixel-Caches auf hochauflösenden
  Bildschirmen nur ~87 px betragen. Bei großen, noch
  nicht im Cache vorhandenen Schwenks bleiben die
  nicht vorbereiteten Bereiche vorübergehend neutral;
  nach Gestenende wird exakt neu gezeichnet.
  Das ist **noch kein lückenloses Weltstreaming**.
- Der neue Weltkachel-Compositor ist für die spätere
  Spielanwendung vorbereitet, aber **noch nicht** an den
  Offline-Export der hochwertigen Landschafts-Kacheln,
  die Weltregions-Datenbank, CDN-Download, Karten-Fog-of-
  War, Versionswechsel oder den Multiplayer-Server
  angeschlossen. Die gemeinsamen Hexdaten bleiben
  dafür erhalten.
- Kein vollständiger 60-FPS-Nachweis: Die Darstellung
  wurde Quelltext-/Modultests unterzogen, aber noch
  **nicht auf dem Zielgerät oder realen Browser**
  profiliert. Das vollständige Neuaufbauen bei
  Gestenende kann weiterhin kostenintensiv sein.
  Während die vorbereitete Szene verschoben wird,
  ist der Renderpfad dagegen von der Weltberechnung getrennt.
- Der bestehende hochwertige PNG-Export, die Szene-JSONs
  und die bisherige Editor-/WebGL-A/B-Strecke bleiben
  unverändert und umgehen den Fast-Pan-Canvas.

### Test

`node --test tests/test_realtime_map_v020_20261024.cjs`

Die neuen Regressionen prüfen Kamera-Mapping, 9-Parameter-
Blit mit Cropping, HiDPI, Zoom und Pan, Out-of-Bounds,
Renderreihenfolge der Weltkacheln, optionale dynamische
Objekte, Pixel-/Tile-LRU, Ressourcenfreigabe, UI-Pointer-
Transparenz, Gestenpfad, Pausieren des Prefetch sowie
den präzisen Final-PNG-Pfad. Die vorherigen Regressionen
v0.15–v0.19 bleiben weiterhin relevant.

## v0.19.0 – Priorisiertes, vorausschauendes Welt-Chunk-Streaming (24.10.2026)

**Ziel:** Ergänzung der bisherigen kameragesteuerten 512er-Chunks
um vorausschauende Nachbarregionen, priorisierte Aufträge, robuste
Invalidierung bei Kameraschwenks und begrenzten Raster-Speicher.
Aufbau auf v0.17 (gecachter Hintergrund) und v0.18 (LOD-Varianten).

### Architektur und Priorität

- **Priorität 1, Bildschirm:** Alle fehlenden sichtbaren Chunks
  werden sofort mit `setTimeout(...,0)` vorbereitet und
  nie an `requestIdleCallback` gebunden. Eine separate
  Foreground-Auftragsspur kann starten, selbst wenn bereits
  ein spekulativer Hintergrundauftrag ausgeführt wird oder auf
  das nächste Browser-Idle-Ereignis wartet.
- **Priorität 2, explizite Vorberechnung:** Die existierende
  Schaltfläche `Statische Terrain-Chunks vorberechnen` behält
  ihre eigene Warteschlange, progressives Feedback und den
  persistenten Datenträger-Cache. Sie läuft weiterhin
  hinter der sichtbaren Karte, aber **vor** spekulativem
  Streaming im Hintergrund.
- **Priorität 3, automatische Vorladung:** Eine begrenzte
  Anzahl benachbarter und in Schwenkrichtung vorausliegender
  512er-Chunks wird zur Idle-Zeit vorbereitet, ohne sie
  außerhalb des Sichtfelds darzustellen. Die Auswahl basiert
  auf exakten Chunk-/Weltbelegungen, Kameraausschnitt und
  Verschiebung des Kamerazentrums. Ein Ring (große Szenen ab
  271 Hex: zwei Ringe); maximal 12 vorgemerkte Gelände-,
  8 Straßen-, 6 Ufer- bzw. 6 Flussufer-Chunks je Layer.
  Nach Richtungswechsel wird die Vormerkliste neu sortiert.
- **Stale- und Generationserkennung:** Bei Zoom-/LOD-/Szene-
  Änderungen werden die Warteschlangen zurückgesetzt und
  erledigte Ergebnisse früherer Generationen freigegeben.
  Wird eine vorab geladene Region während der Arbeit
  irrelevant, werden die Raster verworfen. Die vorhandenen
  Terrain-Worker können bereits gestartete, tatsächlich
  ausgeführte Aufgaben nicht physisch abbrechen; ihre
  **veralteten Ergebnisse werden jedoch nicht übernommen**.
- **Speicher:** Die bestehenden Layer-LRU-Budgets bleiben
  verbindlich (Gelände: 24 Mio. Rasterpixel, Ufer: 8,5 Mio.,
  Flussufer: 12 Mio., Straßen: 12 Mio., plus maximale Tile-
  Anzahlen). Automatische Vorladung darf höchstens rund
  85 % der pro Layer reservierten Rasterpixel belegen;
  ein Rest ist für sichtbare Raster und LOD-Ersatz gedacht.
  Abgewiesene spekulative Chunks werden nicht fortlaufend
  erneut berechnet. Sichtbare Raster und derzeit notwendige
  alte LOD-Fallbacks bleiben vorrangig; wenn der **sichtbare**
  Bereich selbst größer als das Budget ist, kann die
  momentane Belegung höher sein.
- **Warm-Frame-Streaming:** Die vollständig gecachte
  Hintergrundkomposition aus v0.17 führt beim Kameraschwenk
  normalerweise keinen `chunk.draw()`-Aufruf aus.
  Neu: `chunk.prime()` informiert alle relevanten Layer
  bei einem wiederverwendeten Bild über das aktuelle
  Sichtfeld. So funktioniert vorausschauendes Nachladen
  auch während die fertige Hintergrundgrafik nur verschoben
  wird. Vorab geladene Tiles erhalten eine Rasterversion.
  Wenn ein solches Tile erstmalig sichtbar wird, erkennt
  `prime()`, dass die alte Szenenkomposition es noch nicht
  enthält, und fordert **einmalig** ein neues Hintergrundbild.
- **Sichtbare Neuberechnungen** statt aller fertiggestellten
  Hintergrundjobs steuern die Signatur des statischen
  Hintergrunds. Damit verursacht die Fertigstellung eines
  _noch unsichtbaren_ Chunks nicht bereits ein teures
  Neuzeichnen der aktuellen Karte.

### Editor, Diagnose und Verträge

- Der Szenenschalter `Vorausschauendes Chunk-Streaming`
  ist standardmäßig aktiv und kann für A/B-Messungen
  deaktiviert werden. Seine Einstellung wird lokal gespeichert,
  ohne die geografischen Kartendaten anzutasten.
- Neue Anzeige `Chunk-Streaming`: zuletzt sichtbare /
  gemalte Chunks, im Voraus fertiggestellte und vorgemerkte
  Chunks, dringend wartende Aufträge, verworfene
  Generationsergebnisse, LRU-Verdrängungen sowie
  aktuelle RGBA-Bytes und Layer-Budgets. Die Vorlade- und
  Verdrängungszähler sind kumulativ.
- Programmgesteuert:
  `VedrasAssetLabor.streamingStats()` und
  `window.__vedrasStreamingProfile`.
- Unverändert: Quellassets, exportierte Szenen, Weltkoordinaten,
  Flussgeometrie, Auto-Tiling, Schatten, GPU-Terrain-
  Vergleichsmodus und **hochwertiger PNG-Export**
  (keine spekulative Hintergrundladung im Finalrendering).
  Ein eigenständiger Server/CDN-Datenstream für beliebig
  große, noch nicht im Browser vorhandene Welten ist
  damit **noch nicht** eingeführt. Aktuell verwaltet die
  Engine die Weltzellen weiterhin vollständig im Speicher;
  v0.19 streamt ihre **Rasterdarstellung**.

**Tests:** `node --test tests/test_priority_chunk_streaming_v019_20261024.cjs`
sowie bestehende Regressionstests. Prüfungen umfassen
sichtbare Priorität, bereits wartende Idle-Callbacks, Warm-Canvas-
Pans, Richtungswechsel, Speicherschranken, manuelles Baking,
LOD-Fallback, veraltete asynchrone Ergebnisse,
Rasterversionen und die HTML-/Python-/Exportintegration.
Tests wurden in einer isolierten JavaScript-Ausführungsumgebung
gegen den Branch-Quelltext ausgeführt. Ein echter Browser-FPS-
und Speichertest auf dem Zielrechner sowie der vollständige
native Node-Testlauf stehen noch aus.

## v0.18.0 – Adaptives Gelände-, Fluss- und Straßen-LOD (24.10.2026)

**Ziel:** Nach dem v0.17-Hintergrundcache sollen neu zu erstellende
Terrain-/Gewässer-/Straßen-Chunks beim Herauszoomen deutlich weniger
Rasterpixel erzeugen. Eine LOD-Stufe gilt **einheitlich für alle
sichtbaren Chunks**, damit an Biome-, Fluss- oder Straßenübergängen
keine unterschiedlichen world-space-Geometrien entstehen.

- **Neues Modul `adaptive-lod.js`:** Drei Vorschau-Stufen
  `far` (Fern), `mid` (Mittel) und `near` (Nah), mit Hysterese:
  Fern → Mittel ab 55 % Zoom; Mittel → Fern bei höchstens 47 %,
  Mittel → Nah ab 106 % und Nah → Mittel bei höchstens 92 %.
  Bei der erstmaligen Auswahl liegen die mittleren Trennwerte
  bei 51 % und 99 %. Große Zoomsprünge können direkt von
  Fern zu Nah bzw. umgekehrt wechseln. Das verhindert flackernde
  Qualität und unkontrolliertes Neuberechnen an Schwellen.
- **LOD-Faktoren relativ zur bisher gewählten Editorqualität:**

  | Renderpfad | Fern | Mittel | Nah |
  | --- | ---: | ---: | ---: |
  | Terrain-Autotiling / Worker / Reliefquelle | 0,60× | 0,83× | 1,00× |
  | Küsten- und Ufermasken | 0,72× | 0,90× | 1,00× |
  | Flussuferbänke | 0,76× | 0,90× | 1,00× |
  | Flusswasser-SDF | 0,72× | 0,86× | 1,00× |
  | Straßenraster | 0,62× | 0,82× | 1,00× |
  | Waldboden-Overlay | 0,78× | 0,90× | 1,00× |

  Bestehende Pixelbudget-/Mindestauflösungsgrenzen einzelner Module
  gelten weiterhin. In Fernansicht entfallen zusätzlich feine
  dekorative Straßenstriche; Straßenlage und Brückenkreuzungen
  bleiben identisch.
- **Originalgeometrie bleibt unverändert:** Hexgröße und -projektion,
  Auto-Tiling-Bänder, gesamte Küsten- und Flussführung, echte
  Flussmündungen, Schattenpositionen, Straßenkorridore und Brücken
  werden nicht vereinfacht. Die Fluss-SDF verwendet nur einen
  kleineren Rastermaßstab. Ein echter River-Render-Test prüft,
  dass Position, Weltbreite und Welthöhe identisch bleiben, aber
  weniger Pixel berechnet werden.
- **Nahtsichere Chunkvarianten:** Die bestehenden
  `VedrasChunks`-Caches halten bei gleicher Material-/Geometriefamilie
  alte Auflösungen als Fallback sichtbar, bis die neue Version fertig
  ist. Für Ufer und Flussuferbänke wird jetzt ebenfalls die
  Familienidentität verwendet; Straßen und Terrain hatten diese
  Mechanik bereits. Asynchrone Terrain-Worker-Aufträge halten ihre
  ursprünglich angeforderte LOD-Auflösung fest.
- **Vergleichsschalter:** Im Editor `Adaptives LOD für Gelände,
  Flüsse und Straßen`. Deaktiviert wird das gesamte Bild in
  der regulären gewählten Vorschauqualität ohne weitere LOD-Senkung
  gerendert. Die Einstellung ist lokal szenengespeichert,
  verändert aber keine Game- oder Geografiedaten.
- **PNG-Finalexport:** Erzwingt unverändert Vollauflösung unabhängig
  von der Editor-Einstellung und stellt danach die interaktive
  LOD-Stufe wieder her. Keine Änderungen am Exportformat.
- **Profiler:** `LOD Fern/Mittel/Nah`, Zoom, effektive
  Terrain-/Ufer-/Fluss-/Straßen-Auflösungen, Anzahl der
  Schwellenwechsel und noch gehaltene ältere Chunkvarianten.
  JavaScript: `window.__vedrasRenderProfile.lod` sowie
  `VedrasAssetLabor.lodStats()`.

**Tests:** `node --test tests/test_adaptive_lod_v018_20261024.cjs`
und die unveränderten/versionsunabhängig aktualisierten
Regressionstests aus v0.15.3–v0.17.0. Zusätzlich ist die
Flusswasser-Rasterisierung real gegen einen minimalen
zweizelligen Fluss ausgeführt worden. Die Tests wurden in
einer isolierten JS-Umgebung gegen die GitHub-Quelldateien
ausgeführt. Native Kompletttests, visueller Browservergleich
und tatsächliche Frametimings auf dem Ziel-PC sind noch offen.

**Grenze von v0.18:** LOD spart vor allem Aufbereitung bei
Zoom und erstmalig geladenen Chunks; es beseitigt nicht die
Wartezeit durch wirklich neue, nicht vorbereitete Weltregionen.
Das nachfolgende v0.19-Weltstreaming kann darauf aufbauen.

## v0.17.0 – Gelände-, Straßen- und Flusspipeline schneller wiederverwenden (23.10.2026)

**Messbasis:** 169-Hex-Karte unter v0.16.1, 370,1 ms pro gezeichnetem
Frame, davon Gelände 257,4 ms, Wege/Flüsse 73,9 ms und
Sprites/Schatten 38,7 ms. Die Objekt-/Schattenebene wurde bereits
erfolgreich wiederverwendet. Diese Zahlen stammen **vor** v0.17.0.

**Optimierung:**
- `frame-preparation-cache.js`: Szenenrevision statt erneuter
  vollständiger `JSON.stringify`-Vergleiche aller Zellen und
  Katalogeinträge pro Kamera-Frame. Terrain-Materialauswahl,
  Auto-Tiling- und Worker-/LOD-Familien, normalisierte Flussrouten,
  Ufersignaturen, Wald- und Reliefvorbereitung sowie
  Flussbank-, Straßen- und Brückensignaturen werden bis zur nächsten
  Szenen-/Katalog-/Assetänderung wiederverwendet. Bei Fehlern in
  der Berechnung wird kein unvollständiger Cacheeintrag angelegt.
  Neue Bilder und relevante Editoren-Aktionen invalidieren die
  abhängigen Vorbereitungen.
- `chunks.js`: Weltzellen werden je Array-Identität und
  Chunkgröße in einen räumlichen Belegungsindex aufgenommen.
  `visible()` prüft die ursprünglichen Grenzbedingungen exakt,
  jedoch über eine vorberechnete Menge belegter Kacheln statt
  pro Kandidat erneut alle Weltzellen zu durchsuchen.
  `neighbors()` verwendet die vorberechneten Weltkoordinaten.
  Bei expliziter Zell- oder Weltänderung wird der Geometrieindex
  invalidiert. Reihenfolge und Halo-Ränder bleiben erhalten.
- **Fertiger Hintergrund-Layer:** Gelände, Flussufer, Wasserstraßen,
  Wege und Brücken werden gemeinsam als transparentes bzw.
  hintergrundgefülltes, über den sichtbaren Ausschnitt
  hinausreichendes Canvas vorbereitet. Während warmen
  Kameraschwenks bei konstantem Zoom wird nur ein Raster auf
  das Haupt-Canvas komposited. Der Layer kann maximal
  12 Mio. Gerätepixel beanspruchen, passt den Sicherheitsrand
  an und fällt bei Überschreitung auf die Originalrenderer zurück.
- **Keine eingefrorenen Worker-Ergebnisse:** Cache-Schlüssel
  berücksichtigen die Fertigstellungszähler der Terrain-,
  Straßen-, Ufer- und Fluss-Chunks und den Terrain-Worker-Status.
  Nachgeladene Kacheln lösen weiterhin ein neues Zeichnen aus;
  die fertigen Kacheln werden im folgenden Hintergrundaufbau
  sichtbar. Zusätzliche Asset-Load- und Edit-Invalidierungen
  erhalten korrekte Biom-/Flussänderungen.
- **Direkter Präzisionsweg erhalten:** PNG-Finalexport,
  experimentelle GPU-Terrain-Darstellung und interaktive
  Debug-/Straßen-/Fluss-Overlays umgehen den statischen
  Hintergrund-Cache. Die bisherige statische Objektebene
  v0.16.1 und ihr optionaler GPU-Kompositor bleiben erhalten.
  Die beiden Optimierungen können unabhängig voneinander
  wirken.
- **Diagnose:** Unter dem allgemeinen Leistungsprofil erscheint
  `Hintergrund: canvas wiederverwendet`, bei Abweichungen
  `direct` samt Ursache, außerdem Kompositionszeit,
  Sicherheitsrand, physische Rastergröße, Signaturcache- und
  Chunk-Belegungsindex-Treffer. Programmgesteuert über
  `window.__vedrasRenderProfile.background`,
  `VedrasAssetLabor.backgroundStats()` und
  `VedrasAssetLabor.preparationStats()`.
  Zusätzlich trennt `terrainDetailStats` beim letzten
  Hintergrundaufbau Quellvorbereitung, Chunk-/Autotile-Zeichnung,
  Waldboden, Ufer, Diagnostik, Flussuferbänke und
  Straßen/Brücken. Diese Detailwerte beziehen sich bei
  `canvas wiederverwendet` auf den **letzten tatsächlichen Aufbau**,
  nicht auf ausgeführte Arbeit des gerade angezeigten Frames.
  Der nachgeladene Brücken-SVG-Assetpfad invalidiert den
  Szenen-Cache ebenfalls ausdrücklich.

**Tests:** `node --test tests/test_terrain_frame_cache_v017_20261023.cjs`
plus die bestehenden v0.15.3–v0.16.1-Regressionstests.
Ein lokaler Browser-Grafikvergleich und die native Node-Gesamtsuite
müssen weiterhin auf dem Entwicklungsrechner erfolgen.

**Leistungsgrenzen:** Der erste Bildaufbau, Kamerazoom,
Szenenänderungen, Worker-Chunk-Fertigstellungen und große
Schwenks über den Cache-Rand können weiterhin teurer werden.
Dies ist noch kein vollständiges unendliches
Weltstreaming und auch kein Pixel-Instancing aller Terrain-
und Flusssegmente auf der GPU. Es werden **keine gemessenen
v0.17.0-FPS-Ergebnisse behauptet**, bevor die identische
169-Hex-Szene erneut getestet wurde.

## v0.16.1 – Statische Szenenebene bei großen Fenstern aktivieren (23.10.2026)

**Rückmeldung aus v0.16.0 auf einer 169-Hex-Karte:**
776,3 ms/Frame, Gelände 301,6 ms, Wege/Flüsse 71,0 ms,
Sprites/Schatten 403,6 ms, davon Objektlayout 119,0 ms,
Bodenschatten 180,3 ms, Sprite-Zeichnung 103,9 ms.
Entscheidend: Der Profiler meldete `Szene direct neu`;
der in v0.16.0 eingeführte statische Layer war also nicht aktiv.

**Ursachen und Maßnahmen:**
- v0.16.0 nutzte einen **fixen 440px-Sicherheitsrand** und ein
  6-Millionen-Pixel-Limit für den erweiterten Szenen-Canvas.
  Auf größeren Browserfenstern reichte dies schon für einen
  stillen Fallback in die vollständige Einzelobjekt-Zeichnung.
  v0.16.1 verwendet ein auf 12 Mio. Gerätepixel begrenztes
  Cache-Budget und **verkleinert den Rand automatisch** bis
  mindestens 64px, bevor es auf den direkten Renderer
  zurückfällt. Auf extrem großen Displays, bei denen selbst
  der Mindestpuffer zu groß ist, bleibt der sichere Fallback.
  Mehr Cache verbraucht auch mehr Speicher (bis ca. 48 MiB RGBA
  für diese Ebene, ggf. zusätzlich eine GPU-Textur).
- Nicht-interaktive Diagnose-Overlays für Gebäudebereiche,
  Walddiagnose und Bergfootprints deaktivieren die **Canvas**
  -Szenenebene nicht länger, da sie ohnehin außerhalb des
  Spritepasses gezeichnet werden. Bei aktiviertem experimentellem
  GPU-Spritekompositor bleibt für diese Debug-Overlays der direkte
  Weg nötig, damit sie nicht vom höherliegenden GPU-Canvas
  verdeckt werden. Schattenbearbeitungs- und Schatten-Debugmodi
  verwenden weiterhin den direkten Renderer.
- **Diagnose im Objektprofil:** `Szene direct neu · Grund:
  <Ursache>` zeigt nun aktive Debug-Flags oder einen
  überschrittenen Pixel-Rahmen explizit.
  Wenn der Layer nutzbar ist, zeigt der Profiler
  `Szene canvas neu` und bei folgenden Schwenks
  `Szene canvas wiederverwendet`,
  den tatsächlich gewählten Rand in CSS-Pixeln sowie die
  Größe des Puffers in Megapixeln.
- Vorhandene Kartenbilder, gespeicherte Szenen und die
  Python-3.8-Server-Kompatibilität sind unverändert.
  Der hochwertige PNG-Export bleibt auf dem direkten Renderer.
- **Regressionstests:** 
  `node --test tests/test_object_layout_cache_20261023.cjs tests/test_spatial_shadow_cache_20261023.cjs tests/test_static_scene_v016_20261023.cjs tests/test_static_scene_fallback_v0161_20261023.cjs`.
  Insgesamt 27 Tests wurden gegen die aktuellen Branch-Quelltexte
  in einer isolierten JavaScript-Testlaufzeit bestanden. Eine
  vollständige native Node-Gesamtsuite oder ein echter Browsertest
  auf der 169-Hex-Karte wurde nicht ausgeführt.

**Wichtig:** Auch nach erfolgreichem Layer-Reuse wird der
Canvas-Hintergrund mit Gelände, Flüssen und Straßen noch einzeln
gezeichnet. Der Hotfix behebt eine Bypass-Ursache für die neue
statische Objektkomposition, ist aber kein vollständiger Umbau
der Gelände-/Flusspipeline. Eine tatsächliche Beschleunigung
muss mit warmen Frames und unverändertem Zoom gemessen werden.

## v0.16.0 – Statische Szene statt 756 Objekte bei jedem Schwenk (23.10.2026)

**Ausgangslage, Messung des Nutzers auf 169 Hexfeldern unter v0.15.3:**
684,6 ms/Frame, Gelände 284,8 ms, Wege/Flüsse 73,4 ms,
Sprites/Schatten 326,5 ms. Im Objektprofil: Layout 0,2 ms,
Bergüberdeckung 0,1 ms, Sortierung 0,2 ms, Bodenschatten 213,4 ms
und Spritezeichnung 112,5 ms bei 756 vorbereiteten Objekten.
v0.15.4 hat bereits einen Index und Schattenraster-LRU ergänzt;
diese Messung ist ausdrücklich **nicht** das Ergebnis von v0.15.4.

**Neu in v0.16.0:**
- `static-object-layer.js`: Die **gesamte statische Objektkomposition**
  (Bodenschatten, Bergausschnitte, tiefensortierte Spritegrafiken) wird
  in einen transparenten, über die Ansicht hinausreichenden Canvas
  gerendert. Solange die Kamera innerhalb des Overscans bleibt und
  derselbe Zoom, DPR und Szenen-/Schattenstand gelten, rendert die
  Karte nicht erneut alle Sprites; es genügt **ein Canvas-Bild**.
  Beim Überschreiten des Ausschnitts, Zoom, Resize, neuer
  Bildquelle oder Szenenänderung wird neu zusammengesetzt.
- Cache-Budget: 6 Mio. Gerätepixel (ca. 24 MiB reine RGBA-Daten),
  maximal 8192 px je Seite. Bei Überschreitung direkter
  Canvas2D-Fallback ohne gigantische Offscreen-Texturen.
  Pro Szene nur ein Raster; keine Änderung an den PNG-Assets.
- `gpu-sprite-layer.js`: **Optionaler** WebGL2-Vergleichskompositor
  für die fertige statische Objekt-/Schattenebene. Bei einem
  Szenenaufbau wird eine GPU-Textur hochgeladen; Kameraschwenks
  zeichnen anschließend nur ein Textur-Quad ohne weiteren Upload.
  Dies ist **noch kein individuelles GPU-Instancing der einzelnen
  Sprites** – die Vorbereitung aller Objekte erfolgt weiterhin auf
  Canvas2D. Standard bleibt die kompatible Canvas-Komposition;
  experimentellen Schalter in der Testszene aktivieren, um
  CPU-Canvas versus GPU-Ausgabe zu vergleichen.
- Editor- und PNG-Sicherheit: Bei der hochwertigen PNG-Ausgabe,
  ausgewählten Debugmodi und Editorüberlagerungen bleibt der
  vorherige direkte Zeichenpfad erhalten. Bei fehlendem WebGL2
  funktioniert automatisch weiterhin Canvas2D.
- Der Schattenprofil-Editor besitzt einen Versionszähler;
  Profiländerungen invalidieren die statische Komposition.
  Die Szenenversion aus v0.15.3 bleibt maßgeblich für Objektänderungen.
  Der GPU-Vergleichsschalter selbst invalidiert **keine** Bilddaten.
- Diagnose unter `Objekte`: Ebenenmodus (`canvas`/`webgl`/
  `direct`), `wiederverwendet`/`neu`, Kompositionszeit und
  kumulierte GPU-Uploads. Zusätzliche Kennzahlen:
  `VedrasAssetLabor.sceneryStats()`,
  `VedrasAssetLabor.spriteGpuStats()`.

**Regression:** `node --test tests/test_static_scene_v016_20261023.cjs`
(acht Tests: Kamera-Pan, Zoom/Edits, Rastergrenze, Grafikbudget,
GPU-Fallback, echte WebGL2-Upload-Wiederverwendung, Schattenprofiländerung und Integration). Tests wurden
gegen die tatsächlichen Dateien im Branch in einer isolierten
JavaScript-Testlaufzeit ausgeführt. Eine vollständige native
Node-Testsuite sowie ein realer Browser-FPS-Test mit der
169-Hex-Szene fehlen noch.

**Performance-Grenzen:** Das erstmalige Zusammensetzen einer
Szene und Zoom-/Editoränderungen können weiterhin viel CPU-Zeit
beanspruchen. Gelände und Flüsse/Straßen bleiben unverändert in
ihrer bisherigen Renderpipeline, weshalb die ursprünglichen
284,8 ms Gelände und 73,4 ms Wege/Flüsse nicht mit diesem
Patch allein verschwinden. Erst neue Vergleichsmessungen
zeigen den tatsächlichen Geschwindigkeitsgewinn.

## v0.15.4 – Räumlicher Objektindex + wiederverwendete Sprite-Schatten (23.10.2026)

**Ziel:** Die warmen Render-Frames großer Nature-Szenen beschleunigen,
ohne Grafikdateien, Spielstand oder Projektionsregeln zu verändern.
Baseline des Nutzers vor v0.15.3 auf einer 169-Hex-Szene:
832,9 ms/Frame insgesamt, davon 523,8 ms für Sprites/Schatten.

- **Objektindex:** `object-layout-cache.js` ordnet das in v0.15.3 vorbereitete
  Weltlayout jetzt konservativen 512-Welt-Einheiten-Rastern zu.
  Die Originalreihenfolge bleibt erhalten, jedes Objekt wird höchstens
  einmal zurückgegeben, negative Koordinaten und überhängende Kronen
  sind berücksichtigt. Besonders große Objekte bleiben über einen
  abgesicherten Overflow-Pfad erreichbar. Der vorhandene
  Sichtbarkeitsfilter kontrolliert jedes gefundene Objekt erneut.
- **Sprite-Schattenraster:** `VedrasSpriteShadows.drawCached()`
  zeichnet Schattenfilter, Silhouetten und Richtungsprojektionen in
  einen begrenzten lokalen Canvas und zeichnet diesen bei identischer
  Sprite-Bildquelle, Schattenvorlage, Breitenklasse und Schattenstärke
  kostengünstig erneut. Größen werden für die Vorschau in 4- bzw.
  8-Pixel-Klassen gruppiert; dies kann geringe Abweichungen im
  weichgezeichneten Schattenrand bewirken. Die PNG-Exportroutine
  (`finalRendering`) verwendet weiter `draw()` in Originalauflösung.
- **Cache-Stabilität:** maximal 144 Schattenraster und 18 MiB.
  Ein Frame reserviert die Raster aller bereits verwendeten Schatten;
  bei ausgeschöpftem Budget erfolgt direkter Legacy-Fallback statt
  permanentem Verdrängen, Nachberechnen und erneutem Verdrängen.
  Ein neues Schattenprofil über `set()` leert den Rastercache sofort.
  Individuell gezeichnete Schatten bleiben stets auf dem präzisen
  `VedrasManualShadows`-Renderer.
- **Profiler erweitert:** Objektanzeige meldet
  `Index N Kandidaten / M Zellen` und
  `Schattenraster X Treffer / Y neu / Z direkt (MiB)`.
  Weitere Statistiken:
  `window.VedrasSpriteShadows.cacheStats()` und
  `window.__vedrasRenderProfile.object.shadowRaster`.
- **Prüfung:** `node --test tests/test_spatial_shadow_cache_20261023.cjs`
  (acht neue Regressionstests). Die acht Tests wurden mit dem
  tatsächlichen Branch-Code erfolgreich in einer isolierten
  JavaScript-Testumgebung ausgeführt; die vollständige native
  Node-Suite und die visuelle Browserabnahme stehen noch aus.
  Python-3.8-Support und v0.15.2-Atlas-Fix bleiben erhalten.

**Nächster Vergleich:** Dieselbe 169-Hex-Karte bei identischem Zoom,
Quality und Sichtbarkeit zuerst neu öffnen, nach dem Aufwärmen erneut
schwenken. `Schattenraster Treffer` sollte mit wiederholter
Sichtbarkeit steigen; `direkt` zeigt bewusst nicht gecachte
Varianten. Performance-Auswirkungen sind noch **nicht** durch
einen Browserbenchmark auf dem Zielrechner belegt.

## v0.15.3 – Objekt-Layoutcache und erweiterter Performance-Profiler (23.10.2026)

**Ausgangsmessung (Nutzer, 169 Hexfelder):** insgesamt 832,9 ms/Frame;
Gelände 237,3 ms, Wege/Flüsse 71,8 ms, Sprites/Schatten 523,8 ms;
Bergschatten-Cache 0 Treffer / 0 neu. Der Bergschatten-Zähler misst
**nicht** die normalen Sprite-Bodenschatten, daher ist 0/0 kein Beleg
für deren Abwesenheit.

- **Objektpositionen und Reliefhöhe nur bei Szenenänderung vorbereiten.**
  `object-layout-cache.js` hält die vollständige vorbereitete Szenen-Objektliste
  unabhängig von der Kamera. Verschieben/Zoomen filtert nur sichtbar
  gewordene Elemente; Straßen- und Flussplatzierungsprüfungen,
  Natur-Metadatenabfragen und die komplexe Geländehöhenberechnung
  (`displayGroundY`/`currentRelief`) werden nicht bei jedem Frame für jedes
  Objekt wiederholt. Die bisherige Bild-/Schatten-Zeichenreihenfolge
  bleibt unverändert.
- **Gezielte Cache-Invalidierung:** Änderungen an Welt-/Terrain-/
  Reliefparametern, platzierter Szene, Nature-Katalog, Wald, oder
  neuen Sprite-Bilddaten erzwingen einen neuen Aufbau. Die
  Original-Grafiken und gespeicherten Szenen bleiben unverändert.
- **Separates Objektleistungsprofil** unter dem vorhandenen
  Frame-Profil: Objekte gesamt/sichtbar, gezeichnete Sprites und geprüfte Schattenkandidaten,
  Layoutkosten inkl. Cache-Hit, Berg-Überdeckungsprüfung,
  Sortierung, Bodenschatten-Pass und Sprite-Pass. Außerdem
  `window.__vedrasObjectProfile` und
  `window.__vedrasRenderProfile.object` für Browserdiagnosen.
- **Wichtige Messgrenze:** Der bisherige globale Wert
  `Sprites/Schatten` umfasst auch Wald-Debug-Zeichnung,
  Berg-Footprints und Frame-Verwaltung; der neue detaillierte
  Profiler erfasst den eigentlichen Objektpass. Die
  `requestAnimationFrame`-Callback-Zeit ist noch keine verlässliche
  Framerate oder vollständige asynchrone Worker-Ausführungszeit.
- **Regression:** `node --test tests/test_object_layout_cache_20261023.cjs`.
  Für eine reale Performance-Beurteilung vor/nach dem Update dieselbe
  169-Hex-Karte, denselben Zoom und dieselbe Renderqualität verwenden;
  erste Frames nach Szenenänderungen getrennt von warmen
  Cache-Frames betrachten. Gemessene Beschleunigungen werden erst
  nach dieser Browserabnahme angegeben.

## v0.15.2 – Stabile Sprite-Ausschnitte und Atlas-Seiten (23.10.2026)

- **Korrektur von wandernden und falsch vergrößerten Sprites:** Das Asset-Labor verwendet zur schnellen Vorschau teilweise auf maximal 1024 Pixel verkleinerte Natur-/Gebäude-/Einheiten-Grafiken. Der Atlas-Renderer rechnet jetzt die Vorschau-Ausschnittkoordinaten vor der Atlas-Abtastung zurück in die Originalauflösung; Zielgröße und Anker bleiben dabei unverändert.
- **Kein permanentes Atlas-Neuladen:** Maximal sechs Atlas-Seiten werden je Frame reserviert; bei mehr sichtbaren Seiten wird für weitere Sprites zuverlässig die ohnehin geladene Original-/Vorschau-PNG gezeichnet. Die sechs Seiten dürfen erst beim Wechsel der sichtbaren Szene verdrängt werden.
- Neue Regressionstests in `tests/test_sprite_atlas_stability_20261023.cjs`. Die Atlas-Erstellung und der Terrain-Chunk-Cache aus v0.15.1 bleiben unverändert.

## Python 3.8: Lokaler Terrain-Cache ohne HTTP-Tracebacks (23.10.2026)

Der lokale Editor-Server unterstützt bei der Terrain-Cache-Abfrage wieder Python 3.8:
`GET /api/static-terrain/<hash>` verwendet keine erst ab Python 3.9 verfügbare
`str.removeprefix()`-Methode mehr. Fehlende oder ungültige Chunk-Schlüssel
liefern kontrolliert HTTP 404, statt einen `AttributeError` pro Chunk-Anfrage
auszulösen. Der bestehende Disk-Cache und die Original-PNGs werden nicht
verändert.

Regressionstests ohne externe Bibliotheken:
`python -m unittest discover -s tests -p test_python38_static_terrain_api.py -v`.
Wenn weitere andere Fehler auftreten, bitte den ersten vollständigen Traceback
separat prüfen – nicht jeder HTTP-Verbindungsabbruch ist dieser Python-Fehler.
Für sehr große lokale Atlas-Builds ist eine aktuelle **64-Bit-Python-Version**
wegen des erhöhten Speicherbedarfs zu bevorzugen; dies ist unabhängig von dem
hier behobenen Python-3.8-Fehler.

## v0.15.1 – Vorgerenderte statische Terrain-Chunks + echte Originalgrafik-Atlanten (23.10.2026)

**Ziel:** Die CPU-intensive Erzeugung der Gelände-/Reliefpixel darf nicht bei jeder erneuten Kartenöffnung oder Kamerabewegung erneut laufen. Die Grundkarte ist unabhängig von Straßen, Gebäuden, Einheiten und Vegetationssprites. Ihre Weltpositionen und Renderparameter bestimmen dagegen, welche vorgerenderten Geländetexturen gültig sind.

### Statisches Gelände: Vorberechnen, speichern, wiederverwenden

- Im Abschnitt **Testszene**: **„Statische Terrain-Chunks vorberechnen“**. Der Editor berechnet alle von der aktuellen Szene belegten **512-Welteinheiten-Chunks**, mit Quell-Halo und ohne die Kamera bewegen zu müssen. Die sichtbaren Chunks behalten Vorrang vor Hintergrundarbeiten; außerhalb der Ansicht fertiggestellte Chunks erzwingen **keine neue Gesamtkartenzeichnung**. Die Fortschrittszeile zeigt abgearbeitete und auf den Datenträger geschriebene Einträge getrennt.
- `static-terrain-cache.js` berechnet pro Chunk einen **SHA-256-Schlüssel** aus Version, Weltkoordinaten, lokalen Hex- und Biomeigenschaften, referenzierten Terrainmaterialien mit Dateistand, Reliefparametern, Mountain-Topografie, Renderparametern und Vorschau-LOD. **Kamera, Straßen, Gebäude, Selektionen und Nature-Spritepositionen sind keine Bestandteile dieses Schlüssels.**
- `server.py` und `static_terrain_store.py` speichern nach erfolgreichem Rendern zwei PNG-Layer (**Land inkl. Relief** und optional **Wasser**) mit Weltkoordinaten-/Auflösungsmetadaten nach `precomputed/terrain/xx/<hash>.*`. Cache-Index und HTTP-Zugriff erlauben späteres Laden statt erneutem Bildaufbau. Maximal 600 ältere Cache-Snapshots bleiben auf dem Server; ungültige Schlüssel, PNGs und Geometrien werden abgewiesen. Writes sind atomar, Originalgrafiken werden nie überschrieben.
- Bei einem **Cachetreffer** zeichnet das Asset-Labor die fertigen PNG-Chunks mit den vorhandenen Exklusivkanten, Wasser-/Relief- und Sprite-Layern. Bei Cachemiss, defektem PNG, älterem Server oder geänderten Render-/Material-/Biomparametern wird wie bisher über Worker/Canvas neu berechnet und anschließend bei Leerlauf wieder gespeichert. Es ist keine Internetverbindung erforderlich.
- Terrainmaterialänderungen, Biom-/Relief-/Topografieänderungen erzeugen neue Schlüssel; **Straßen, Siedlungen und Einheiten bleiben separate dynamische Layer**. Die Bake-Funktion arbeitet für die gerade ausgewählte Welt. Andere Weltseeds bzw. Topologien benötigen ihren eigenen Satz Chunks.
- `precomputed/` wird nicht in Git versioniert. Es ist ein regenerierbares Buildprodukt und kann für den späteren mobilen Spielclient in einen Content-CDN-Ordner übernommen werden. Ohne vorgebakene Karten-Chunks besteht weiterhin die Kostenbelastung des ersten Builds.

### Sprite-Atlanten aus allen aktuellen Original-PNGs

- Der GitHub-Actions-Workflow `.github/workflows/build-sprite-atlases.yml` checkt das **tatsächliche Repository** aus, installiert Pillow, führt `scripts/build_sprite_atlases.py` aus, validiert alle Originalquellen mit `scripts/verify_sprite_atlases.py`, prüft die Python-Terrain-Cachetests und stellt `vedras-sprite-atlases` als herunterladbares Artefakt bereit.
- **Erfolgreicher Build vom 23.10.2026 (Run 39981583598): 352 PNG-Sprites, 138 Desktop-Seiten, 26 Mobil-Seiten.** Die ZIP-Datei hat etwa **424 MB**. Alle beiden Atlassätze wurden in CI überprüft, ohne die Original-PNGs zu bearbeiten. Die Desktop-Atlas-Seiten sind zahlreich; sie werden deshalb **bedarfsgesteuert** geladen und dürfen nicht alle gleichzeitig im mobilen Grafik-RAM liegen.
- Bei künftig hinzukommenden PNGs in `assets/nature/`, `assets/buildings/` oder `assets/units/` startet derselbe Workflow auf Push erneut. Der Datei-Fingerprint basiert auf den tatsächlichen PNG-Bytes und bleibt über unterschiedliche Git-Checkouts stabil. Lokaler Build: `python -m pip install Pillow`, danach `python scripts/build_sprite_atlases.py --assets assets --out atlases`. Der UI-Knopf **„Sprite-Atlanten offline aktualisieren“** verwendet dieselbe Pipeline.
- **Das CI-Artefakt wird nicht automatisch auf deinen Windows-Rechner kopiert.** Zur lokalen Atlasverwendung die entpackten `desktop/`, `mobile/` und `manifest.json` in den Projektordner `atlases/` legen, oder den lokalen Atlas-Knopf verwenden. Solange das Atlasmanifest fehlt, zeichnet der Editor die Einzel-PNGs wie bisher.

### Technische Validierung und Grenzen

- **56 gezielte isolierte JavaScript-Regressionstests** bestanden (29 vorhandene Fluss/Küste/Chunk/Layout, 23 bisherige Strategie-/GPU-/Schattenfälle, 4 neue statische Chunk-Cachetests). Der erfolgreiche GitHub-Workflow hat die **zwei Python-Cache-Tests** und die **echte Sprite-Atlas-Dateiprüfung** absolviert.
- Kein FPS-Versprechen: Die einmalige Terrain-Vorberechnung ist weiterhin CPU-/Worker-intensiv; die Gewinne entstehen **bei wiederholtem Laden desselben Welt-/Materialstandes**. Die endgültige FPS-/RAM-Prüfung mit dem tatsächlichen Chrome/Firefox-Editor auf einer RX 580 und mobilen Geräten steht noch aus.
- Für das fertige Spiel sollten CDN-gehostete vorgebackene Weltkacheln, LOD-spezifisches sichtbares Streaming und die dynamischen Gameplay-Layer zusätzlich eigene Versions- und Retentionsregeln erhalten. Die aktuellen Änderungen liefern die dafür notwendige Cache- und Atlas-Datengrundlage, **noch keinen vollständigen mobilen WebGL2-GPU-Spriteclient**.

---

## v0.14.2 – Stabile Karte statt unkontrollierter Cache-Neuaufbauten (23.10.2026)

**Fehlerbild v0.14.1:** Bei 169 Hexfeldern blieben Landtexturen auch nach mehreren Minuten teils unsichtbar, während Nature-Sprites und Küsten bereits gerendert wurden. Bilder verschwanden und wurden neu geladen. Das ist eine schwerwiegende Regression des GPU-/Image-Pool-Umbaus und keine akzeptable normale Ladezeit.

**Konkret gefundene Cache-Ursache:** Der `onReady`-Callback der Bildbibliothek hat **für jedes nachträglich geladene Terrainbild `invalidateTerrain('material')`** ausgeführt. Dieser Befehl verwirft alle bereits aufgebauten Gelände-Chunks, Relief-/Autotile-Caches und Worker-Zwischenergebnisse. Noch während eines langen Chunk-Aufbaus konnte ein einzelnes neu dekodiertes PNG somit die gesamte Arbeit annullieren. Gleichzeitig konnte der 192-MiB-LRU-Pool sichtbare Nature-Sprites entsorgen, worauf das Zeichnen dieselben Quellen sofort neu anforderte. So entstand ein ständiger Nachlade-/Verwerfungszyklus.

**Korrektur:** Das Eintreffen eines Terrainbilds invalidiert **nicht mehr global**, sondern lässt die betroffenen Tile-Abhängigkeiten anhand `asset.imageRevision` neu prüfen. `terrainRasterCache.tileStamps` memoisiert die teuren Zell-/Material-Abhängigkeiten pro Tile statt sie pro Frame mehrfach zu bilden. **Sichtbare Nature-Sprites, Bergsprites, Szenenobjekte und die gemeinsam benötigten Terrain-/Küstenquellen** bleiben während ihrer Nutzung vor LRU-Freigabe geschützt. Mehrere abgeschlossene Sprite-Decodes werden auf eine neue Kartendarstellung pro 100 ms gebündelt, statt nach jedem Bild eine aufwendige komplette Neuzeichnung auszulösen.

**Sicherer Grafikmodus:** Da der neue WebGL2-Compositor nach dem letzten Fix immer noch unvollständige Landschaften zeigte und weder auf der Radeon RX 580 noch mit den vollständigen lokalen Bildern visuell freigegeben wurde, aktiviert v0.14.2 **standardmäßig die bewährte Canvas2D-Geländekomposition**. Beim Umstieg werden ältere, automatisch auf `gpuTerrain:true` gespeicherte Einstellungen einmalig in den sicheren Modus migriert. Der separat markierte WebGL2-Schalter bleibt für bewusstes A/B-Testen vorhanden und merkt sich eine aktive Benutzerfreigabe. **GPU-Auslastung ist kein unabhängiger Qualitätsnachweis:** Die komplexe Material-/Fluss-/Relieferzeugung läuft weiterhin überwiegend CPU-seitig, weshalb selbst bei aktiver WebGL2-Komposition nur geringe GPU-Auslastung möglich ist.

**Tests:** Vier neue Regressionstests prüfen die selektive Terrain-Invalidierung und debouncte Bildmeldungen, alte GPU-Einstellungen sowie LRU-Schutz sichtbarer Sprites und nachvollziehbar inkrementierte Image-Revisionen. Außerdem laufen sechs bestehende WebGL2-/Bildpooltests, 29 Chunk-/Terrain-/Fluss-/Küsten-/Layouttests und acht Schatteneditor-Tests – insgesamt **47/47 gezielte isolierte JavaScript-Tests erfolgreich**. Der tatsächliche Browser- und FPS-Test mit den 472 lokalen Grafiken steht aus. Es wird keine Performanceverbesserung in Millisekunden oder FPS behauptet.

---

## v0.14.1 – Korrekte GPU-Landschaft und echte Vorschau-Speicherbegrenzung (23.10.2026)

**Warum die Karte in v0.14.0 aus horizontalen Streifen bestand:** Der GPU-Compositor setzte für alle Texturen `UNPACK_FLIP_Y_WEBGL=true` und übergab im Shader vertikal invertierte UV-Koordinaten. Bei den vom Terrain-Worker übertragenen **ImageBitmap**-Quellen ignoriert WebGL diese Upload-Einstellung jedoch ausdrücklich (vgl. WebGL-Spezifikation und Chromium). Canvas-basierte und ImageBitmap-basierte Chunkquellen erhielten somit **verschiedene Texturorientierungen**. In `gpu-terrain.js` werden deshalb sämtliche Quellen jetzt **ohne Y-Flip** hochgeladen und mit einheitlichen Top-Left-UVs (`v=sy` oben, `v=ey` unten) dargestellt. Das beseitigt die systematische vertikale Verdrehung der Worker-Chunks und führt bei den bestehenden GPU-Texturen wieder zur korrekten Lage der Terrain-Biome. Die übrigen Layer und die ursprüngliche Fluss-/Küstenform bleiben unverändert.

**Erhebliche RAM-Reduktion in der Vorschau:** Der Bildpool aus v0.14.0 kontrollierte zwar die Parallelität, behielt aber auch bei 110 großen Terrain-/Küstenbildern deren vollständig dekodierte Pixel vorübergehend im RAM. Die tatsächliche Vorschau braucht nicht sämtliche 2K/4K-Pixel jedes Terrainbilds. `asset-image-pool.js` reduziert jetzt **Terrain- und Küstenquellen auf maximal 512px pro längster Achse**, Natur-/Gebäude-/Einheitenbilder auf **1024px** – inklusive transparenter Ränder und Bildproportionen. Die Metadaten der **Originalpixelmaße** bleiben erhalten. Dadurch sinkt der geschätzte dekodierte Speicher für ein quadratisches 2048er Terrainbild theoretisch von 16 MiB auf 1 MiB (Faktor 16). Der LRU-Pool bevorzugt kleine gemeinsam verwendete Terrainquellen gegenüber nur vorübergehend angesehenen Objektsprites; die Grenze von 192 MiB bleibt ein **Zielwert**, keine harte Gesamtprozess-RAM-Grenze. GPU-/Chunk-Caches kommen zusätzlich hinzu.

**Exportqualität unverändert:** Vor dem 2×-PNG-Export lädt die Anwendung **nur die tatsächlich benötigten** Originale der verwendeten Terrainvarianten, Küsten, Forest-Floor-Grafiken und platzierter/geladener Sprites. Sie leert die Terrain-/Worker-Caches und baut das Finalbild in voller Auflösung im bisherigen Canvas2D-Pfad neu. Im `finally`-Block werden die verkleinerten Vorschauquellen zurückgesetzt, der Worker neu gestartet und die Vorschau wiederhergestellt. Die Original-Dateien auf dem Datenträger bleiben immer unverändert.

**Übersichts-Lod bei kleinem Zoom:** Unter 46 % Kartenzoom wird in der interaktiven Vorschau die **aufwendige Projektion von Bergschatten auf einzelne Spriteoberflächen** ausgelassen, weil diese dort nur wenige Bildschirmpixel breit ist. Bodenschatten, Vegetation und sämtliche ursprünglichen Spritegrafiken bleiben sichtbar. Der hochwertige PNG-Export zeichnet alle Schatten wie zuvor. Die neue Statistik unterscheidet jetzt **im Katalog gefundene Assets** von **bereits dekodierten Bildern**. Der veraltete Server-Versionsalarm meldet kompatible lokale 0.13.x/0.14.x-Server nicht länger fälschlich als Konflikt.

**Validierung:** 6 GPU-/Bildpool-Tests (darunter die explizite unflipped-ImageBitmap-UV-Prüfung sowie Source/512px-Vorschau/1024px-Original-Roundtrip), 8 Schatteneditor-Tests und 29 bestehende Karten-/Chunk-/Fluss-/Küsten-/Layout-Tests: **43/43 gezielte Tests erfolgreich** in isolierter JavaScript-Laufzeit. JavaScript-Syntax geprüft. Eine echte visuelle Browserabnahme mit lokalen PNGs sowie Vorher-Nachher-Messungen auf der Radeon RX 580 sind **noch offen**; ein garantierter FPS-Wert wird nicht behauptet. Wenn ein visueller Fehler bleibt, kann die GPU-Vorschau weiterhin ausgeschaltet werden, ohne den CPU-Canvas-/PNG-Exportpfad zu verändern.

---

## v0.14.0 – begrenzte Bilddekodierung und GPU-Vorschau (23.10.2026)

**Ausgangslage:** Das Asset-Labor hat bisher in `loadLibrary()` alle PNG-/SVG-Grafiken mit einem ungebremsten `Promise.all(assets.map(new Image()))` geladen und dauerhaft als dekodierte Bilder im Hauptspeicher gehalten. Der Editor zeichnete zudem sämtliche vorbereiteten Terrain-Chunks über `CanvasRenderingContext2D.drawImage()` zusammen – auch wenn bei Kamerabewegungen nur die Ansicht und nicht der Inhalt verändert wurde.

**Bild-/RAM-Pool (`asset-image-pool.js`):**
- Maximal **vier parallele** vollständige Bilddekodierungen. Beim Ordnerladen werden zunächst nur `terrain/`, `shorelines/` und die eventuell zuvor ausgewählte Grafik benötigt. Naturgrafiken, Gebäude und Einheiten werden **bei tatsächlicher Verwendung** nachgeladen. Der Schatten-Editor kann noch nicht dekodierte Sprites weiterhin listen und lädt nur das jeweils ausgewählte Bild.
- Ein LRU-Pool verwaltet die zugänglichen `Image`-Referenzen mit einem konfigurierbaren **192-MiB-Zielbudget** für geschätzte dekodierte RGBA-Pixel. Nach einer Schonfrist von 24 Sekunden können nicht mehr benutzte Bilder freigegeben und später erneut geladen werden. Die Statistik zeigt geschätzte dekodierte Bilddaten und Anzahl laufender/ausstehender Requests; der Browser kann zusätzliche Kopien intern behalten, weshalb das Budget **kein garantiertes Prozess-RAM-Limit** ist. Fehlgeschlagene Bildpfade werden bis zum nächsten Reload nicht permanent neu angefragt. Ausgewählte Bilder und benötigte Nature-Sprites werden nach dem Laden automatisch aktualisiert.
- Bibliotheksminiaturen erhalten `loading="lazy"` und `decoding="async"`. Die Original-PNGs und Dateikataloge bleiben unverändert.

**WebGL2-GPU-Compositor (`gpu-terrain.js`):**
- Separate WebGL2-Ausgabe hinter dem bestehenden transparenten Canvas2D-Kartenoverlay. Echte GPU-Texturen (`texImage2D`) zeichnen die bereits durch CPU oder Offscreen-Worker aufbereiteten Wasser-/Land-/Relief-Chunks. Der Quell-Halo bleibt für sauberes Texturfiltern vorhanden; die GPU-Quads werden auf gemeinsame Pixelkanten gerundet, sodass Chunk-Kreuze nicht zurückkehren.
- Kameraschwenk und Zoom verändern nur die Quad-Koordinaten und **erzeugen keine neuen Terrain-Pixel**, solange die vorhandene Cache-/LOD-Konfiguration gültig bleibt. GPU-Texturen werden pro Rasterquelle wiederverwendet und nach dem Frame durch einen **128-MiB-/112-Texturen-LRU** begrenzt. Die angezeigte GPU-Statistik enthält Uploads, Cachetreffer/Texture-Count und geschätzte GPU-MiB.
- Neuer Schalter **„GPU-Vorschau (WebGL2) für Gelände-Chunks“**. Bei deaktiviertem WebGL2, fehlender Hardwarebeschleunigung, Kontextverlust oder Nichtverfügbarkeit läuft das alte Canvas2D-Terrain-Rendering weiter. **Fluss-, Küsten-, Sprite-, Natur- und Schatten-Overlays bleiben bewusst zunächst Canvas2D**, genau wie die hochauflösenden PNG-Exporte (`finalRendering` deaktiviert den GPU-Pfad). Die bestehende Szene-/JSON-/PNG-Semantik und der Shadow-Painter bleiben erhalten.
- **Wichtig:** Ein GPU-Compositor verlagert die *Zusammensetzung* fertiger Chunks auf die Radeon, nicht die CPU-intensive **Erzeugung** von Biomen, prozeduralen Pixelmasken oder neuen Flussgeometrien. Ob sich die Gesamtbildrate auf der RX 580 verbessert, muss in einer echten Browsermessung des Renderprofils, Cachehits und Bildaufbereitungsaufwands belegt werden. Die GPU-Auslastung darf dabei trotz Beschleunigung relativ niedrig bleiben.

**Regressionen:** Neue Tests prüfen maximal vier parallele Bildladeoperationen, Nachladen/Freigeben aus dem LRU, GPU-Quad- und UV-Koordinaten, GPU-Texturwiederverwendung sowie WebGL2→Canvas-Fallback. Zusammen mit den vorhandenen Fluss-, Chunk-, Küsten-, Shadow-Painter- und UI-Tests wurden **42 von 42 isolierten JavaScript-Tests** bestanden. Die Syntax der bearbeiteten JS-Module wurde geprüft. Browser-End-to-End, Qualitätsvergleich WebGL2 vs. Canvas2D und reale FPS-/VRAM-Messungen mit sämtlichen lokalen Assets bleiben zur Abnahme vor Merge erforderlich.

---

## v0.13.0 – Neuste Spritegrafiken und frei gezeichnete Schatten (22.10.2026)

**Neue Grafiken zuerst:** Im Schatteneditor stehen `Neueste Dateien zuerst`, `Dateiname A–Z` und `Kategorie / Name` zur Verfügung. Außerdem kann man **nur Sprites ohne individuelles Schattenprofil** anzeigen lassen. So lassen sich neue `snow_patch_01`–`snow_patch_10` (sofern als Natur-/Gebäude-/Einheiten-Sprites importiert) finden, ohne Hunderte alte Grafiken durchzublättern. Die Sortierung verwendet nach Möglichkeit die echte Dateierstellung (`st_birthtime`) und andernfalls zuverlässig die letzte Änderung (`mtime`); nicht vorhandene Zeitstempel stehen unten. Gelöschte Dateien wie ein entfernter Ahorn werden nicht als noch auswählbare Sprites angezeigt. Existierende Profile anderer Grafiken werden nicht verändert.

**Freie Schattenform:** Die Vorschau wird zur Zeichenfläche. **Polygon** setzt Eckpunkte, **Freihand** zeichnet eine zusammenhängende Kontur, **Fläche füllen** schließt und aktiviert die Kontur. Auch mehrere getrennte Konturen pro Sprite sind möglich; im Modus **Konturpunkte verschieben** sind die orangefarbenen Griffpunkte editierbar. **Rückgängig** entfernt den letzten Punkt bzw. die letzte abgeschlossene Kontur, **Zeichnung entfernen** stellt wieder den bisherigen automatischen Schatten her. Der automatisch projizierte Schatten bleibt unverändert, bis explizit eine Fläche gefüllt wird. Die gezeichnete Schattenform nutzt die bereits bekannte Stärke, Deckkraft und Weichzeichnung; sie wird **vom echten Kartenrenderer gezeichnet**, nicht nur in der Vorschau. Einfache Schatten werden weiterhin vollständig über die bisherigen Regler angepasst.

**Dateiformat:** Der bisherige `schemaVersion:1`-Katalog bleibt erhalten. Ein Spriteprofil darf zusätzlich `manual:{mode:"polygons",polygons:[[[x,y],...], ...]}` enthalten. Die Koordinaten werden relativ zum Bodenanker in Spritebreiten gespeichert, sodass die Form bei Zoom, anderer Kartengröße und Wiederimport am Sprite verankert bleibt. Bis zu zwölf Konturen mit je 3–180 Punkten sind erlaubt und werden im Frontend und im lokalen Python-Server validiert. `Profile speichern` schreibt weiterhin nach `assets/shadows/sprite_shadow_profiles.json`; JSON-Export und -Import verwenden dasselbe Format. Falls die kanonische Profildatei fehlt, kann der lokale Server kompatible Version-1-Profile aus `assets/shadows/shadow.json`, `shadows.json` oder `schatten.json` einlesen; nicht kompatible fremde Formate werden nicht stillschweigend konvertiert. Das vorhandene Backup-System bleibt bestehen.

**Wichtig:** Der separate Bergschatteneditor hat weiterhin Vorrang. Neue flächige Schatten sind ausschließlich für Sprite-Dateien der Kategorien **Natur, Gebäude und Einheiten** vorgesehen, nicht für flächendeckende Terrainkacheln. Die PNG-Originale und ihre Platzierungsregeln bleiben unverändert.

**Prüfung:** Gezielte Regressionstests prüfen die chronologische Sortierung, fehlende und entfernte Grafiken, Zeichnung und Füllung per Pointer, Korrektur der Polygonpunkte, Freihand, Rückgängig, JSON-Validierung und die Verwendung der manuellen Kontur im eigentlichen Shadow-Renderer. Noch offen ist der vollständige Browserdurchlauf mit deinen lokalen neuen Grafiken und vorhandenen Schattenprofilen.

---

## v0.12.9 – Kopfzeile „Neu einlesen“ wieder dauerhaft sichtbar (22.10.2026)

**Behobene Layoutregression:** Die vorherige Deaktivierung der äußeren Scrollbar hat `html/body` auf `overflow:hidden` gestellt. Ein vom Browser wiederhergestellter Dokument-Scrolloffset konnte dadurch die oberste **70px-Kopfzeile** samt Status, **„Neu einlesen“** und **„Ordner importieren“** aus dem sichtbaren Bereich schieben. Auf Desktop (`min-width:801px`) liegt `.app` jetzt mit `position:fixed; inset:0` vollständig im tatsächlichen Browser-Viewport – unabhängig von vorherigen Seitenscrollpositionen. `.topbar` erhält unverkleinerbare 70px, die rechte Button-Gruppe schrumpft nicht; darunter füllt die Karte den verbleibenden Platz.

**Scrollverhalten:** Kein äußeres Dokument-Scrolling. Die Bibliothek links und der Inspector rechts bleiben **unabhängig vertikal scrollbar**; das Karten-Canvas bleibt in der Mitte. Die mobile Ansicht (`max-width:800px`) nutzt weiterhin die bestehende vertikale Dokumentanordnung. Keine Änderungen an `app.js`, Wasser, Ufern, Chunk-Renderern oder Nature-Platzierung.

**Tests:** `tests/test_editor_header_viewport_20261022.cjs` prüft drei Layoutverträge (Kopfzeilen-/Button-Markup, viewportfester Desktop-Root und interne Scrollbereiche inklusive mobiler Darstellung). Zusammen mit den bereits bestehenden Grafiktests: **29/29** im isolierten JS-Harness bestanden. Browserprüfung mit dem vollständigen lokalen Asset-Labor bei hohem Zoom bleibt empfohlen.

---

## v0.12.8 – Chunk-Kreuze und Übergang Küste → Flussmündung (22.10.2026)

**Nahtfreies Chunk-Compositing:** Der alte `VedrasChunks.draw`-Pass ließ jedes überlagernde Chunk-Canvas um zwei Welt-Einheiten über die eigene 512er-Grenze hinaus zeichnen. Gerade bei transparenten Küsten-/Böschungslayern führte das am Treffpunkt von vier Kacheln zu sichtbaren dunklen oder hellen **Kreuzen**. Die neue Funktion `clipCore` berechnet aus der tatsächlichen Canvas-Transformation identische, gerundete **Backing-Store-Pixelkanten** für jedes angrenzende Chunk. Jedes Zielpixel wird exakt einem Chunk zugeordnet, ohne Lücken und ohne doppelte Alphakomposition. Die Quelltexturen behalten weiterhin ihren Raster-Halo. Der Renderer stellt nach dem Clipping dieselbe World-Space-Transformation wieder her und verschiebt oder streckt die Originalgrafiken **nicht**. Ein sicherer World-Space-Fallback besteht für reine Test-Contexts ohne `getTransform`.

**Küstenmündung ohne Streifen:** `shoreline.js` richtet nun Küsten-Chunk-Samples mit einem gemeinsamen, weltverankerten Pixelraster aus, auch wenn der Editor mit 0,8× oder anderen fraktionalen Stufen rendert. Die Mündungsmaske nutzt die tatsächliche Wasser-Normale der sechseckigen Land↔Wasser-Kante; der Strand wird entlang des Flusskanals geöffnet und sowohl land- als auch seewärts weich ausgeblendet. Seitlich schließen die normalen Küstenüberlagerungen glatt an die schon vorhandene Flussböschung an. Keine ganzen Küstenkanten entfallen und das Wasser bleibt verbunden.

**Kompatibilität:** Der hochwertige Wasserlook, Materialassets, River-Topologie in sechs Richtungen, Küsten-Grafik-Assets, Seed-Determinismus und Nature-/Sprite-Überhänge bleiben unverändert. `index.html` erhöht die Asset-Labor-Anzeige auf **v0.12.8** und aktualisiert die Browser-Cache-Versionen für `chunks.js`/`shoreline.js`.

**Prüfung:** `tests/test_chunk_stitch_coastal_portal_20261022.cjs` überprüft die gemeinsame gerundete Pixelgrenze an Vierfach-Kreuzungen bei mehreren Zoom-/Pan-/DPR-Werten, den Fallback und die übereinstimmende RGBA-Mündungsmaske in zwei überlappenden 0,8×-Küstenchunks. Die frühere Performance-/Fluss-/Wassernaht-Testreihe bleibt erhalten. Eine visuelle Browser-Abnahme auf dem lokalen Asset-Labor-Server mit Originalgrafiken und ein FPS-Profil stehen vor dem Merge weiterhin aus.

---

## v0.12.7 – Flussmündungen, Wassernaht und äußere Scrollbar (22.10.2026)

**Saubere Flussmündungen:** Zwei getrennte Uferanteile wurden bislang ins Wasser über den Küstenübergang hinweg gezeichnet: die neue facettierte Böschung aus `river-banks.js` und der ältere dunkle Wasserrand aus `river.js`. Beide Randmasken enden jetzt auf der **Landseite** der hexkantengenauen Mündung und laufen innerhalb der letzten ca. 20 Welt-Einheiten sanft aus. Der eigentliche Fluss-Wasserkanal und die Mündungsöffnung bleiben durchlässig; Wasser und Küstengeometrie, Brücken, Flusskollision und Vegetationsüberhang bleiben erhalten. Dies funktioniert über Richtungsvektoren in **allen sechs** Hexrichtungen.

**Senkrechte Wassernaht:** Mit reduzierter Vorschauauflösung nutzten benachbarte Material-Chunks bisher unterschiedliche Pixelphasen – auch bei identischem Material. `autotile.js` verankert seine Rasterursprünge jetzt an einem gemeinsamen Weltpixelgitter. Ergänzend fügt `water-texture.js` eine wiederverwendbare Weltkoordinaten-Texturfüllung für `river.js` hinzu und gleicht ausschließlich die wenigen Randpixel von Repeat-Texturen aneinander an. Ein isolierter, durchgehender vertikaler Strich in der **Mitte einer Wasser-Quellgrafik** kann zusätzlich anhand eines strengen, zeilenübergreifenden Kriteriums geglättet werden. Wasserbilder selbst werden **nicht verändert**; gelegentliche, echte Wellendetails sollen dabei erhalten bleiben. Die Wasserfüllung wird aus der ursprünglichen Textur erzeugt, nicht durch eine einfarbige Ersatzfläche ersetzt. Das neue Modul wird ebenso im vorhandenen Offscreen-Worker geladen.

**Nur interne Panels scrollbar:** Auf Desktop (`min-width:801px`) verhindert `style.css` das Scrollen von `html/body`, begrenzt die App auf die tatsächliche Viewporthöhe und hält die mittlere Karte stationär. Linke Grafikbibliothek und rechte Inspector-Steuerleiste behalten unabhängig ihre vertikalen Scrollbereiche. Die responsive mobile Dokumentnavigation bleibt erhalten.

**Tests:** `tests/test_river_mouth_water_seams_scroll_20261022.cjs` enthält sechs neue Prüfungen: Mündung in allen Richtungen, Erkennung und selektive Beseitigung einer künstlichen Mittennaht, randgleiche Wassertexturen, texturtreue wiederholte Compositing-Operationen, Chunk-Rastergleichheit bei 0,6× sowie äußere/interne Scrollregeln. Die älteren Böschungs- und Performance-Regressionsprüfungen bleiben bestehen. **Grenze:** Ohne laufenden Asset-Labor-Browser mit den konkreten 463 lokalen PNGs kann nicht bestätigt werden, dass der Screenshot-Artefakt ausschließlich diese beiden Ursachen hatte; eine visuelle Überprüfung bei 37 und 397 Hexfeldern sollte vor dem Merge erfolgen.

---

## v0.12.6 – Korrektur: Originalwasser + plastisch modellierte Böschungsufer (22.10.2026)

**Wasser wieder unverändert:** PR #18 hatte die bis dahin hochwertige Flussoberfläche unbeabsichtigt durch eine eigene, optisch flachere Wasserfüllung ersetzt. Dieser Fehler ist korrigiert: `app.js` zeichnet die Flüsse wieder über die **unveränderte** Funktion `VedrasRivers.render` aus `river.js`, mit derselben Original-Wassertextur des Mündungshexes, derselben Rand-/Quell-/Mündungsmaske und demselben Flussverlauf wie vor der Uferänderung. Der neue Renderer zeichnet **keine Wasserpixel** mehr; er liefert ausschließlich eine transparente Böschungs-Ebene **unter** der alten Wasseroberfläche.

**Stilisierte Uferböschungen:** Deutlich erkennbare 2,5D-Ufer aus dunkler feuchter Fußkante, schräg modellierter Erd-/Felswand mit prozeduralen steinigen Facetten und einem beleuchteten Rand, der durch abnehmende Deckkraft in den bestehenden Terrain-Untergrund übergeht. Böschungsschatten variieren mit lokalen Flusstangenten/-normalen und einer festen Lichtrichtung, nicht mit sechs separat aufgekleben Ufersprites. Terrainabhängige Materialprofile (Fels/Gebirge/Hügel, Wald, Moor/Feuchtland, Gras-/Erdland, Wüste/Steppe, Schnee/Tundra) mischen sich entlang der Hexkanten; der Auslauf ist nicht auf Grasland beschränkt.

**Topologie und vorhandene Naturregeln bewahrt:** Das bestehende Hexkanten-Flussnetz, alle sechs Richtungen, Quelle, Mündung, Kurven, Zusammenflüsse, Fluss-/Baum-Kollisionsabstände und überhängende Pflanzen-Sprites bleiben unverändert. Die gemeinsamen Böschungsmasken verhindern doppelt dunkel überzeichnete Ufer an Zusammenflüssen. Ufer werden wie zuvor in sichtbaren weltverankerten Chunks mit Halo und LRU-Cache gerendert. „Natürliche Flussufer einbetten“ lässt sich abschalten: dann bleibt **ausschließlich das alte Wasser** erhalten. „Uferplastizität“ skaliert nur die Böschung, nicht die Wasserfarbe.

**Regressionen:** 16/16 gezielte JavaScript-Tests im isolierten Test-Harness bestanden (10 Fluss-/Bank-Tests einschließlich wiederhergestelltem Wasserpfad, facettierter Uferprofilierung, Core-Ausnahme, Biome, sechs Richtungen, Zusammenflüssen, Chunk-Nähten; 6 Preview-Performance-Tests). Syntax der betroffenen Skripte erfolgreich geprüft. **Eine visuelle Browser-Abnahme mit echten Terrain- und Wasser-PNGs sowie FPS-Messungen steht noch aus.** Die Änderung liegt im bestehenden PR #18, der weiterhin auf PR #17 aufbaut; weder Original-Assets noch Kataloge oder bestehende Nature-Verteilungslogik wurden geändert.

---

## v0.12.5 – Immersive Flussufer und zusammenhängende Flussnetze (22.10.2026)

**Priorität 2 umgesetzt – visuelle Einbettung statt separater Fluss-Sprites:** `river-banks.js` führt die bisherigen hexkantengenauen, geglätteten Flusskurse zu einer gemeinsamen geometrischen **MIN-Distanzfeld-Vereinigung** zusammen. Ufer werden ausschließlich an der äußeren Flussgrenze schattiert: an Ecken, Richtungswechseln und Zusammenflüssen entstehen keine additiv dunklen doppelten Uferstreifen. Alle sechs Hexrichtungen nutzen lokale Tangente und Normale und eine einheitliche weltkoordinatenbasierte Rasterung.

**Landschaftliche Materialien:** Am Fluss liegt eine schmale, leicht gewellte Erd-/Sedimentzone mit dunklerer feuchter Innenkante, subtiler äußerer heller Böschung und sonnenrichtungsabhängiger Plastik. Statt sechs richtungsabhängigen Rand-PNGs entstehen Fels-/Geröllflecken (Hügel, Gebirge, Hochland), feuchte dunkle Ufer mit kleinen organischen Vegetationsflecken (Moor, Sümpfe, Mangroven, Feuchtland), weiche Erdufer (Grasland), bewachsene dunklere Böden (Wald), sandige trockene Böschungen (Wüste/Savanne) sowie blass-kühle Zonen in Schnee/Tundra. Materialien werden über Weltkoordinaten und Nachbarhexe weich gemischt, nicht hart an Hexseiten umgeschaltet. **Niedrige Uferkante, kein Canyon**; Originalterrain, Relief, Nature-Grafiken und Fluss-Spiellogik bleiben unverändert.

**Performance/Nahtschutz:** Das gesamte Flussnetz wird in sichtbaren 512-Welteinheiten-Chunks mit Halo und begrenztem LRU gerendert (30 Chunks, max. 12 Mio. Rasterpixel plus vorübergehend geschützte sichtbare Chunks). Volle Szenendaten/Geometrie werden nur bei signaturrelevanten Änderungen neu vorbereitet. Pixelursprünge werden auch bei einer Editorauflösung von 0,6× weltweit auf dieselbe Pixelmatrix ausgerichtet; damit bleiben Material, Schattensprung und kleine Geröllformen an Chunk-Übergängen kontinuierlich. Final-PNG-Export wartet auch auf den neuen Ufer-Layer, nicht aber auf legitimerweise leere Fluss-Chunks.

**Bedienung:** Im Abschnitt **Flüsse** ist **„Natürliche Flussufer in die Landschaft einbetten“** standardmäßig an. **Uferplastizität** 0–100 %, Standard 80 %. Schalter und Regler werden im lokalen Szenenzustand sowie im `vedras_scene.json` gespeichert und aus älteren Szenen rückwärtskompatibel mit Defaultwerten ergänzt. Keine Änderungen an Original-PNGs oder Katalogen.

**Prüfung:** `tests/test_immersive_river_banks_20261022.cjs` prüft sieben Aspekte (sechs Richtungen, fünf Materialklassen plus Frost, Uferprofil, doppelte Flussrouten, Chunk-Randüberlappung, 0,6× Pixelankergitter und UI/Import/Export). Sieben von sieben Tests erfolgreich im isolierten JavaScript-Harness; sechs frühere Performance-Regressionstests weiterhin bestanden. Syntax der betroffenen JS-Dateien geprüft. **Noch offen:** echte Browser-E2E-Abnahme mit Quell-PNGs und konkreten FPS-/Framezeiten bei vielen Flüssen, eine optische Gegenüberstellung der Biomübergänge sowie sichtbare Flussmündungen bei unterschiedlichen Wassertexturen.

---

## v0.12.4 – Reaktionsschnelles Asset-Labor / schneller Editor, hochwertiger Export (21.10.2026)

**Schnelle Standardvorschau:** Die neue Qualität **Schnell** ist standardmäßig ausgewählt (ca. 0,8× Canvas-Pixelratio, bis 1,3 Mio. Framebuffer-Pixel, Materialraster mit 0,6× Zielauflösung). **Ausgewogen** liegt dazwischen; die manuellen Stufen 1× bis 4× stehen weiter bereit. Chunk-Rendering ist für neue kleine und große Testkarten standardmäßig aktiv. Die vorhandenen 512-Welteinheiten-Chunks mit Randüberhang werden nur im Kamerasichtfeld aufgebaut; unsichtbare Chunks bleiben im begrenzten LRU statt bei jedem Kameraschwenk neu zu entstehen.

**Änderungen während des Bearbeitens:** Teure Regler (Terrainmuster, Materialskalierung, Blendbreite, Kantenunregelmäßigkeit, Küstenbreite/-auslauf) warten nach der letzten Eingabe **170 ms**, bevor Szenen-JSON gespeichert und die teure Ebene neu aufgebaut wird. Reliefänderungen behalten das Basismaterial; einzelne Terrain-/Flussmündungs-Hexänderungen verwenden lokale Tile-Fingerabdrücke und bauen nur betroffene Material-Chunks neu. Alte Worker-Ergebnisse mit veraltetem Tile-Fingerabdruck werden verworfen. Wald-Bodenraster werden nicht bei jedem Zoom mit einer anderen Rasterauflösung erzeugt. Ein nach Geländeart indexierter Texturkatalog ersetzt wiederholte Scans der gesamten Assetbibliothek pro Hex und Frame. Flüsse und Waldflächen haben weiterhin getrennte Cache-Signaturen.

**Speicherkontrolle:** Terrain-Chunk-Limit 56 Tiles / 24 Mio. Rasterpixel (vorher 120 / 60 Mio.), Küsten 20 / 8,5 Mio., Straßen 36 / 12 Mio., separate Geografie-Rohmaterialvarianten maximal 20. Die tatsächlich sichtbaren, vorübergehend geschützten Chunks können je nach Sichtfeld vor der Verdrängung priorisiert werden. Geografie-Relief kann nun, wenn verfügbar, im Web Worker/OffscreenCanvas gerendert werden; die vorherige Hauptthread-Material-Reuse-Variante bleibt als Fallback vorhanden.

**Separater Final-Export:** **„Aktuelle Ansicht als hochwertiges PNG exportieren (2×)“** zeichnet die aktuell sichtbare Karte bei erhöhter Qualität neu, wartet auf fertige sichtbare Chunks und exportiert ein PNG. Das ist **ein Export der aktuellen Kameraperspektive, kein Komplettwelt-Export**. Danach wechselt der Editor automatisch zurück zur schnellen Vorschau. **Szene als JSON exportieren** bleibt unverändert. Alle separaten RGBA-Nature-/Terrain-PNGs, Kataloge, Geografie-Seeds und Weltgen-Verträge bleiben unangetastet; der neue PNG-Export erzeugt kein Spritesheet.

**Prüfung:** `tests/test_asset_labor_preview_perf_20261021.cjs` enthält sechs Regressionen für UI-Vertrag, 170-ms-Debounce, unabhängige Wald-/Geländeebenen, Export, sichtbare Chunk-Auswahl und selektives Rebuild. Alle sechs liefen in einer isolierten JavaScript-Testumgebung erfolgreich; Syntax von `app.js`, `chunks.js` und `river-ui.js` geprüft. **Nicht behauptet:** Es gibt noch keine belastbaren Chrome-/Firefox-Vorher-Nachher-Messungen mit den vollständigen Original-Assets. Dazu in der Karte das eingebaute Renderprofil (`window.__vedrasRenderProfile` / „Renderprofil“) auf gleichen Szenen mit 37 und 397 Hexfeldern vergleichen. Manuelle Sichtkontrolle des neuen PNG-Exports bei Biomen, Wald, Fluss, Relief und hohen Zoomstufen bleibt erforderlich.

---

## v0.12.3 – Bergschatten haben Vorrang vor generischen Sprite-Schatten (21.10.2026)

Bergsprites benutzen ausschließlich den spezialisierten Bergschatten-Renderer. Der allgemeine Sprite-Schatten-Editor zeichnet bei Bergobjekten keine zusätzliche Silhouette/Kontaktellipse und überschreibt nicht mehr die Werte von mountainShadowSettings(). **Priorität:** Berg-Standardwerte → optionales Berggrafik-Preset → einzelne platzierte Berginstanz. Die gemeinsame globale Schattenstärke von 0–200 % bleibt erhalten und wirkt einmal auf die Bergprojektion.

Bei Auswahl eines Bergsprites im Schatten-Editor werden generische individuelle Regler verborgen. Die Schaltfläche **„Bergschatten einstellen“** öffnet die maßgebliche Sektion **Große Berge → Form und Ursprung**, selbst wenn sie zugeklappt ist. Die Bergvorschau verwendet dieselbe Bergkonfiguration wie die Karte. Vorherige generische Bergprofile im separaten Schatten-JSON bleiben erhalten, werden aber bei Bergobjekten ignoriert (kein destruktiver Katalogeingriff). Original-PNGs, Nature-Kataloge und Instanzwerte werden nicht verändert.

Regressionen: tests/test_mountain_shadow_priority_20261021.cjs, tests/test_sprite_shadow_editor_20261021.cjs und tests/test_mountain_sprite_cast_20261020.cjs bestanden in isolierter JavaScript-Ausführung. Visuelle Kontrolle im Browser mit mehreren benachbarten Bergen ist weiterhin empfohlen.

## v0.12.2 – Neue Waldgeneration mit Kronenziel und Lichtungen (21.10.2026)

**Bedienung:** Im Asset-Labor **Wälder & Dschungel – Vegetationsschicht** öffnen. **Waldgeneration zum A/B-Vergleich** bietet drei Stufen: **Bisherig** (unveränderte historische Grundquote), **Dichter** (mehr Bäume/Gruppen) und **Geschlossener Wald** (Standard; sehr dichte Waldkerne mit überlappenden Baumkronen und kleinen zusammenhängenden Lichtungen). **Kronenbedeckung – Zielwert** regelt die angestrebte Dichte im geschlossenen Bestand (Standard 82 %; Näherung aus gerenderter Baumkronenbreite, **keine pixelgenaue Deckungsmessung**). **Lichtungsanteil** regelt kleine, deterministische Gladen im geschlossenen Bestand (Standard 10 %; statistischer Zielwert, nicht je Hex erzwungen). Nach jeder Auswahl wird **Natur verteilen** für die Testszene erneut berechnet. Waldränder und lichte Wälder bleiben abgestuft offener als Waldkerne.

**Geografie bleibt maßgeblich:** `forestClass` und numerische `forestDensity` aus dem Geografie-Labor werden übernommen; der separate Waldanteil-Regler beeinflusst vor allem die Demo-/Zufallswälder. Die Herkunft geographischer Klassen wird nun gespeichert, damit automatisch generierte Lichtungen in ihnen möglich sind, während bewusst manuell auf „dicht“ gesetzte Waldhexe keine ungefragten Lichtungen erhalten. Die Waldbodenmaske bleibt ein zusammenhängender Flächenverbund mit weich ausgeblendeten, organischen Lichtungen statt radialer Hexränder.

**Schutz & Performance:** Bäume dürfen mit ihren **Kronen überlappen**, aber Stammabstände zu anderen Objekttypen werden nicht entsprechend verkleinert. Wege, Flusskanten, Bauplätze, Berge und bereits manuell platzierte Sprites bleiben geschützt. Automatische Bau-/Freiflächenreservierungen bevorzugen offene Regionen vor dichten Waldkernen. Platzierungen nutzen einen lokalen Hex-Nachbarschaftsindex statt die vollständige Szene bei jedem Versuch zu durchsuchen. Vorhandene Nature-PNGs und alle Nutzerkataloge bleiben unangetastet.

**Tests:** `node tests/test_forest_canopy_generation_20261021.cjs` und `node tests/test_p3_visual_quality_20261020.cjs` bestanden in isolierter JS-Testausführung. Die reale Dichte, Objektüberlappung, Browserleistung und Blickwirkung bei 37/397 Hexen müssen noch mit den tatsächlichen hochgeladenen Naturgrafiken visuell geprüft werden. Der neue Modus betrifft die **grafische Testszene**, nicht ungefragt die Weltgenerator-Verträge des Spiels.

## v0.12.1: Geografie-Relief und getrennte Terrain-Cache-Stufen (21.10.2026)

Der **Reliefmodus „Geografie-Labor“** verformt Land jetzt aufgrund der **tatsächlich importierten Hügelhexe** (nicht mehr anhand einer einzigen ausgewählten Kuppe). Pro Hügelfeld werden die Felder `reliefClass=hills`, `hillProfile` (rounded/steep/chain/plateau/ridge), `hillStrength` sowie die ursprünglichen Weltkoordinaten berücksichtigt. Mehrere benachbarte Hügel ergeben eine hexübergreifend stetige Höhenfläche; Wasser und Küsten laufen gegen Meereshöhe 0 aus. Ein `mountain`-Hex wird weiterhin von den separaten Bergsprites dargestellt und erzeugt nicht automatisch einen zusätzlichen unsichtbaren Gipfel.

Das Geografie-Labor unter **Geografie-JSON importieren → Testszene bestätigen** setzt `Relief aktivieren` und `Reliefquelle = Geografie-Labor` automatisch. Danach kannst du unter **Hügel & Relief** die globale Stärke und die Beleuchtung verändern. `Altes Relief-Labor` bleibt für manuelle Einzelhügel-/A/B-Tests verfügbar; die alten Testknöpfe wechseln ausdrücklich zurück. Die Geografie-Testszene mitsamt Profilen wird nun in der lokalen Szene wiederhergestellt, sofern die Szenengröße unverändert ist.

**Rechenaufwand:** Die Reliefberechnung ist weiterhin eine 2,5D-Pixelprojektion; geänderte Höhen erfordern somit eine **neue Reliefprojektion betroffener Pixel**. Die ursprünglichen Terrain-PNGs und das gemischte Autotile-Basismaterial werden dabei aber nicht erneut zusammengestellt: Im klassischen Renderer gilt der bestehende Material-Raster-Cache, im Chunkmodus werden bis zu 36 unveränderte Rohmaterial-Chunks getrennt von den Reliefvarianten aufbewahrt. Alte Chunks bleiben beim Reglerwechsel sichtbar, bis die neue Variante bereitsteht. Der Reliefstärke-Regler aktualisiert die aufwendige Geometrie **erst beim Loslassen**. In der Geografie-Reliefansicht erfolgt der neue Chunk-Reliefpfad vorläufig im Hauptthread, damit das Rohmaterial wiederverwendet werden kann; die frühere Worker-Version kann diese Material-Reuse-Stufe noch nicht. Sehr große Reliefansichten benötigen daher einen realen Browser-/Performancecheck.

**Noch bewusst unverändert:** Alle Original-PNGs, Terrain- und Nature-Katalogdaten, geografische Höhenklassen `flat/hills/mountain`, unpassierbare Berghexe, die Flusswege entlang von Hexkanten, die Waldgeneration und die produktive Spiel-Weltgenerierung. Geografisches Relief wird nur im Asset-Labor aus dem Worldgen-Datensatz visualisiert; die Integration dieses 2,5D-Renderers in die produktive Gameplay-Karte ist ein eigener Schritt.

Regression: `node tests/test_geography_relief_integration_20261021.cjs` (fünf Profile, Stetigkeit über Hexgrenzen, fehlende Hügel, Legacy-Fallback, Preset-Import, Materialcache und Speicher-Vertrag). Die echte optische Browserabnahme mit Originalgrafiken steht noch aus.

**Gemeinsamer Sprite-Schatten-Editor (21.10.2026):** Über den neuen Schnellzugriff **Schatten** öffnet sich ein eigenständiger visueller Inspector mit durchklickbarer Live-Vorschau aller geladenen Nature-, Berg-, Gebäude- und Einheiten-Sprites. Globale Richtung (Standard: links), Stärke (0–200 %), Schattenlänge, Breite, Ursprung, Weichheit, Deckkraft und Bodenkontakt wirken einheitlich; individuelle Abweichungen können pro Sprite überschrieben oder zurückgesetzt werden. Alte kreisförmige Kontakte, falsch gerichtete PNG-Schatten und die bisherige separate Fallen-Log-Konstruktion werden in der Kartenanzeige durch eine gemeinsame echte Alpha-Silhouettenprojektion ersetzt. Berge behalten ihre eigene großformatige Bodenmaske, folgen aber den Editor-Profilen. Profile liegen **separat** unter `assets/shadows/sprite_shadow_profiles.json` und werden über den lokalen Server gespeichert, validiert und vorher unter `.bak` gesichert; Import/Export ist möglich. Die bisherigen Nature-/Terrain-Kataloge, Quell-PNGs und gespeicherten alten Schattenzuordnungen werden **nicht gelöscht**. Alte manuell zugewiesene Shadow-PNGs werden nur bei aktiviertem neuen Renderer nicht zusätzlich gezeichnet, um Doppel- und Gegenrichtungsschatten zu vermeiden. Tests: `node tests/test_sprite_shadow_editor_20261021.cjs`. Für den visuellen Feinschliff ist eine Browserabnahme mit Originalgrafiken erforderlich.

**Neue Nature-Serien / Habitatregeln (21.10.2026):** `Baumstumpf_16–20` werden **nicht** auf kalten Terrains platziert (ihre bisherigen gemäßigten, feuchten und warmen Böden bleiben möglich; `Baumstumpf_16` im bestehenden Katalog korrigiert). `berg_14–16` sind **nur für `snowfields`**, `berg_17–21` nur für gemäßigtes Gras-/Weideland und Feuchtgebiete vorgesehen, nicht für kalte, warme oder trockene Landschaften. `boulder_31–35` gehören zu den vier kalten Terrains (`snowfields`, `frozen_tundra`, `tundra`, `highland`), `boulder_36–44` ausschließlich zu den warmen und trockenen Terrains (Savanne, Dschungel und Wüsten/Badlands; **nicht** Grasland). `Eisblock_01–05` beziehungsweise `ice_block_01–05` sind nur in `snowfields`, `frozen_tundra` und `tundra` zulässig (**nicht** `highland`). Die Regeln gelten bei manueller Verteilung und beim Natur-/Berg-Generator, auch gegen veraltete Katalogfreigaben. Noch nicht im Repository katalogisierte Varianten werden anhand der Dateinamen beim lokalen Asset-Import zugeordnet. Unveränderte und gelöschte Dateien werden nicht wiederhergestellt. Test: `node tests/test_nature_habitats_20261021.cjs`.

**Fallen-Log-Schatten (21.10.2026):** `fallen_logs` und `snow_fallen_logs` erhalten jetzt einen flachen, über die Stammlänge verlaufenden Schatten mit Auslauf nach links. Die Form kombiniert eine weichgezeichnete längliche Bodenauflage mit der tatsächlichen Alpha-Silhouette des Stamms. Der bisherige runde Kontaktfleck und zusätzliche generische Shadow-Sprites werden für liegende Stämme nicht mehr gerendert. Schnee-Stämme bleiben etwas heller; der globale Schattenregler gilt weiter. Keine PNG- oder Katalogänderungen. Regression: `node tests/test_fallen_log_shadows_20261021.cjs`.

**Kalte Nature-Habitate (20.10.2026):** `boulder_21.png` bis `boulder_30.png` und neue Dateien `snowy_bush.png`, `snowy_bush_01.png` usw. gehören **ausschließlich** zu `snowfields`, `frozen_tundra`, `tundra` und `highland`. Die bestehende Nature-Habitatprüfung gilt für manuellen Besatz, `Natur verteilen` und den Aufräum-/Renderpfad; alte, versehentlich breite Katalogfreigaben können die Regel nicht umgehen. Bereits katalogisierte Boulder 21–25 sind entsprechend angepasst; 26–30 und snowy_bush werden beim künftigen Import korrekt erkannt. Boulder 01–20 behalten ihre bisherigen Regeln. Keine Quell-PNGs verändert.

**Bergschatten – große Nachbarobjekte (20.10.2026):** Ein Berg beschattet Berg- oder Gebäudesprites im unmittelbar links darunterliegenden Nachbarhex (axial `q−1, r+1`) nicht mehr. Kleinere Natur-Sprites und der Bodenschatten bleiben wie bisher betroffen. Schatten anderer, weiter entfernter Berge werden weiterhin berücksichtigt; dies ist eine gezielte Objekt-Ausnahme, keine Abschaltung der Bergschatten. Die unveränderten PNGs und der 0–200-%-Schattenregler bleiben erhalten.

**Priorität 3 – visueller Qualitätsausbau (20.10.2026):** Ohne PNG-Änderung werden Objekt-Sprites beim Anzeigen dezent perspektivisch angepasst (Y 96,5 %, Scherung 1,2 %) und lebende Bäume gegenüber der bestehenden Größenbalance um 10 % vergrößert. Dichte Wälder werden sichtbar voller als lichte und übernehmen neben der Klasse auch `forestDensity` aus der Geografie-Vorschau. `boulder_NN.png` wird für alle vorhandenen und später importierten Varianten klassifiziert, mit 25 % der bisherigen Klassengröße dargestellt und nicht in Schneefeldern/gefrorener Tundra verteilt. „Natur verteilen“ berücksichtigt außerdem geografische Berghexe; Chunk-Grenzen erhalten eine kleine rasterbasierte Überzeichnung gegen Haarlinien. [Details und Qualitätsgrenzen](docs/PRIORITY3_VISUAL_QUALITY_20261020.md).

**Geografie v2.1 (Weltgenerator/Asset-Labor):** Das **Geografie-Labor** erstellt aus absoluten Hex-Weltkoordinaten eine vorab überprüfbare Landschaft. 59 gruppierte Regler steuern Klima, Wasser, Biomgrößen, alle vorhandenen Terrain-Untertypen, Relief, Wald, Flüsse und Tier-/Fundorthexe. **Stürmischer Ozean ist ein festes Terrain, Flüsse liegen auf Hexkanten**; die Karte zeigt den realen Waldanteil in Prozent. Keine künstliche Nord-/Süd-Abkühlung, keine Umklassifizierung bereits erzeugter Hexe bei einer Weltvergrößerung. Alte v2.0-Presets werden nur mit Zustimmung migriert; bestehende Spielwelten bleiben unangetastet. [Details und Einschränkungen](docs/GEOGRAPHY_V2_SHARED.md).

**v0.11.9 · Zoom-Stabilität, Wegkreuzungen & Schatten bis 200 % (20.10.2026):** Terrain und Straßen behalten beim schnellen LOD-Wechsel die vorherige, bereits fertige Auflösung sichtbar, bis neue Chunks eintreffen; beim Zurückzoomen wird eine alte Qualität sofort aus dem Cache reaktiviert. LOD-Hysterese bei 48/76 %, strategische Namen erst unter 17 % (zurück zur Grafik ab 23 %), Zoom bis 12 %. Straßenarme werden als **eine gemeinsame Maske** eingefärbt – ohne additiv dunkle Knicke. Globaler Schattenfaktor **0–200 %**, sichtbar und synchron unter Ansicht und Bergoptionen; über 100 % wirken Bergschatten deutlich dunkler. Wald-Bodentexturen und Originalgrafiken bleiben unverändert. [Implementierung und Tests](docs/ZOOM_LOD_SHADOW_ROAD_0119.md).

**v0.11.8 · Web Worker + OffscreenCanvas (20.10.2026):** Terrain- und Relief-Chunks werden auf unterstützten Browsern in einem Hintergrundthread mit `OffscreenCanvas` berechnet und als fertige `ImageBitmap` zurückgegeben. Terrain-Quelltexturen werden einmal übertragen, bisherige Weltkoordinaten-Auto-Tiling-Logik und Wassertrennung bleiben erhalten. Asynchrone Chunk-Warteschlange mit Szenenversionsschutz, Bitmap-Freigabe und Hauptthread-Fallback; neuer Worker-A/B-Schalter und Diagnose im Testszene-Panel. **Wald-Bodentexturen unverändert.** [Details und Tests](docs/WORKER_OFFSCREEN_0118.md).

**v0.11.7 · Große Karten & Chunk-Rendering (20.10.2026):** Der Generator unterstützt jetzt **91, 169, 271 und 397 Hexfelder** zusätzlich zu den bisherigen Karten. Ab 91 Hexen arbeiten Terrain/Relief, Küsten und Straßen automatisch mit weltverankerten **512er-Chunks** inklusive Randüberhang, Sichtbarkeitsprüfung, progressivem Idle-Bau und begrenzten LRU-Caches; ferne Zoomstufen sparen Rasterauflösung. Neue Kamerasichtbarkeitsprüfung für Nature und Brücken/Flüsse, sichtbare Chunk-Statusanzeige und A/B-Schalter für kleine Karten. Die zusammenhängende Wald-Bodenmaske bleibt zur Vermeidung von Nähten unverändert. [Technik, Grenzen & Game-Architektur](docs/CHUNK_RENDERING_0117.md).

**v0.11.6 · Eingetretene Wege, Bergstraßensperre und Performance (20.10.2026):** Trampelpfade sind jetzt unregelmäßig abgenutzt, mit sanften Vertiefungen und teils durchscheinender Erdoberfläche. Befestigte Erdwege haben Fahrspuren, Pflasterstraßen Fugen. Keine Straßen auf `mountain_ground` oder in der direkten Einflussfläche platzierter Bergmassive. Sechs markantere Holzbrücken mit echten einzelnen Dielen. Die größten Redraw-Risiken (Bergschatten, Relief, Auto-Tiling, Pflanzensortierung und Fluss-/Straßenkollisionen) nutzen begrenzte Caches; der Generator zeigt Render-Zeitmessungen an. Wald-Bodentexturen und Originalgrafiken unverändert. [Umsetzung und spätere Spielarchitektur](docs/ORGANIC_ROADS_PERFORMANCE_0116.md).

**v0.11.5 · Sandige Wege und Holzbrücken (19.10.2026):** Wege werden nun **über** Flüssen gezeichnet, echte Flussquerungen erhalten eines von **sechs transparenten, richtungsgetreuen Brücken-SVGs**. Trampelpfade sind heller, schmaler, sandiger und mit sanfter Erdtextur versehen; Ausbauten behalten dieselbe Geometrie. Beim Bau einer Wegkante werden Pflanzen und Objektanker im Straßenkorridor entfernt, ohne überhängende Kronen abzuschneiden; neue Nature-Verteilung spart den Weg aus. Wald-Bodentexturen und vorhandene Terrain-/Naturgrafiken bleiben unverändert. [Details](docs/ROAD_BRIDGES_0115.md).

**v0.11.4 · Wege & Straßen · Hexmitten-Kreuzungen (19.10.2026):** Wegverbindungen sind jetzt echte editierbare Kanten zwischen benachbarten Hexmitten (0–6 Abzweige pro Hex). Ein neuer prozeduraler **bräunlicher Trampelpfad** mit körniger Textur zeichnet Kreuzungen nahtlos; die Upgrades *befestigter Erdweg* und *Steinstraße* verwenden dieselbe Topologie. Wege lassen sich im neuen Panel platzieren, upgraden, entfernen, ein-/ausblenden und mit Szenen sichern. Keine Änderungen an Wald-Bodentexturen. [Road-Dokumentation](docs/HEX_ROADS_0114.md).

**v0.11.3 · Nature-Sprites +20 % (19.10.2026):** Alle regulären Nature-Sprites werden gegenüber v0.11.2 um 20 % größer dargestellt. **Ausnahmen unverändert:** stehendes Totholz (auch Schneevarianten), liegende Äste/Stämme (auch Schneevarianten) und Baumstümpfe/Totholz-Objekte (`deadwood`). Berge bleiben wie zuvor von der Nature-Skalierung ausgenommen. Die Abstandsberechnung für neue automatische Platzierungen nutzt dieselben Faktoren. Auch die alten Demo-Nature-Sprites wurden angepasst; Wald-Bodentexturen und ursprüngliche PNGs bleiben unverändert.

**v0.11.2 · Bergschatten 2.0 + Nature-Dichte (19.10.2026):** Der links am PNG-Fuß beginnende Schatten ist jetzt eine kurze, breite, gerichtete Bodenfläche mit diagonalem Kontakt, einem festen rechten Ausbreitungslimit und Reglern für Winkel, Länge und Querschnitt. Bäume relativ zum letzten Rendererstand **weitere 50 % kleiner**, restliche Vegetation **weitere 30 % kleiner**, pro Waldhex moderat höhere Quote und entsprechend verringerte Pflanzabstände. Waldbodentexturen/-masken **unverändert**. [Umsetzung und Bedienung](docs/MOUNTAIN_SHADOW_FIELD_0112.md).

**v0.11.1 · Schatten-/Fluss-/Natur-Feinabstimmung (19.10.2026):** Gemeinsame Schattenstärke für Berge, Bäume und Gebäude; pro Berginstanz und Grafik anpassbare Schattensilhouette (inklusive verschiebbarem Schattenursprung), breiter und kürzer. Abgerundete Flussbögen entlang der Hexkanten mit schmalem Ufersaum; kleinere Nature-Sprites und dichtere natürliche Pflanzgruppen. **Waldbodentexturen und ihre Masken bleiben unverändert.** [Bedienung und Testhinweise](docs/SHADOW_RIVER_NATURE_REFINEMENT.md).

**Waldboden-Nahtfix (19.10.2026):** Waldboden wird jetzt nicht mehr pro Hex mit eigener Fade-Grafik aufgestempelt, sondern einmal je zusammenhängender Waldregion als weltverankerte Textur mit gemeinsamer Alpha-Maske gerendert. Nur die Außenkante der Waldregion blendet weich aus. Details: `docs/FOREST_SYSTEM.md`, Test: `tests/test_forest_floor_regions.cjs`.

**Block 4 · Grafik-Finish (19.10.2026):** Flüsse nutzen eine einzige,
weich auslaufende **Distanzfeldmaske** statt sichtbarer Halbkreise an
Hexkanten; ihre Mündungen liegen auf dem gemeinsamen Küsten-Seitenmittelpunkt.
Der Strand bleibt an allen Küstenseiten vollständig erhalten und wird
nur in einer schmalen, verlaufenden Flussöffnung zurückgenommen.
Die neuen Regler **Nature-Farbangleichung**, **Terrainmuster beruhigen**
und **Natürliche Pflanzengruppen** wirken ausschließlich im Renderer
beziehungsweise bei der nächsten automatischen Vegetationsverteilung.
Echte PNGs und Habitatregeln werden nicht verändert. Dokumentation:
`docs/VISUAL_POLISH.md`; Tests:
`tests/test_block4_visual_polish.cjs` und
`tests/test_block4_coast_aperture.cjs`.

**Block 3 · Schatten und 2,5D (19.10.2026):** Bergschatten
werden nun aus der echten PNG-Silhouette **nach links unten** auf
den Boden projiziert – zuvor fielen sie weitgehend nach links *oben*
und verschwanden unter dem Berg. Ein kräftigerer Fußkontakt und
zwei sanfte Wurfschattenschichten machen die Silhouette sichtbar.
Bäume, Büsche, Gebäude und Einheiten erhalten konsistente
Bodenkontaktschatten; Nature-Sprites können zusätzlich
silhouettenbasierte Schatten und ihre bestehenden Schatten-PNGs nutzen.
Schatten werden vor den Sprites gezeichnet, Objekte nach
reliefkorrigiertem Fußpunkt gestaffelt. Der Berg-Schatten-Debug zeigt
goldene Linien vom Fuß zum Wurfschatten. Einzelheiten in
`docs/SHADOW_SYSTEM.md`; Regression
`tests/test_block3_shadows.cjs`.

**Block 2 Natur-Balancing (19.10.2026):** Naturgrößen werden jetzt im
Kartenrenderer artabhängig verkleinert, tote Bäume und Stämme seltener
verteilt, lebende Baumquoten reduziert und 18 % geeigneter Landhexe in
benachbarten Bau-/Freiflächen von automatischer Vegetation freigehalten.
Gebäude erhalten auch auf Nachbarhexen eine gesperrte Fundamentzone.
Die Werte liegen in `nature-balance.js`, ohne die 258 PNGs und
Katalogmaße zu verändern; Tests in `tests/test_block2_nature_balance.cjs`.

## Nature-Bestand und Schneevarianten · 19. Oktober 2026

**258 reale Nature-PNGs katalogisiert und im Inventar sowie in FloraV2 abgeglichen.**
Die jüngsten Uploads ergänzen 77 Nature-Grafiken (5 Dschungelbüsche, 10 Kakteen, 15 tote Bäume,
24 gefallene Stämme, 10 Farne, 5 Mangroven und 8 Baumstümpfe). Die 4 zusätzlichen
`frozen_tundra_base_01–04.png` sind Gelände-Texturen, keine Flora.

**Verbindliche Schneevarianten:** `dead_tree_11–15` (5), `fallen_log_11–20` (10)
und `tanne_schnee_01–10` (10). Diese 25 PNGs sind nur für
`snowfields`, `frozen_tundra`, `tundra`, `highland` zugelassen;
**Schneetannen/-kiefern auf gewöhnlicher Tundra sind bei der Zufallsplatzierung selten
(2-%-Prüfung je Kandidat)**. Manuelle Platzierungen in passenden Kältebiomen bleiben erlaubt.
`fallen_log_21–24` sowie `Baumstumpf_09–16` werden **nicht** als verschneit angesehen.
Andere Pflanzen können auf Tundra vorkommen, sind aber nicht automatisch Schneevarianten.

**Pflanzenplanung abgeschlossen:** keine offenen neuen Floraarten, keine Mangrovengruppen.
Nur künftige optionale *Schneeversionen* werden bei Bedarf ergänzt. Die verbleibenden
Planungsaufträge Findling, Felsgruppe, Eisblock, Schneeberg gehören zu Steinen/Eis/Geologie;
Tiere sind ein unabhängiger späterer Bereich.

**Habitat-Schutz:** Mangrovenwurzeln stehen ausschließlich auf Land in geeigneten warmen
Feuchtgebieten, ihre Kronen dürfen angrenzendes Wasser überragen. Flusskorridore blockieren
auch breite liegende Baumstämme. Alte Fehlplatzierungen werden anhand von Habitat und
Flussmasken überprüft. Nur katalogisierte Grafiken werden zuverlässig automatisch verteilt;
optische Einzelfreigaben der 77 Uploads stehen weiterhin aus.

---
**Grafik-/Habitat-Korrektur v0.16 (19.10.2026):** Der Flusskörper wird nicht mehr mit Canvas-Strichen gemalt, sondern als gefüllte, entlang realer Hexkanten orientierte Wasser-Segmentmaske mit weichem Alpharand und ohne Sandkante gerendert. Fluss-Sperrflächen verhindern Nature-Platzierungen im Wasserkanal, auch bei manuellen Aktionen; bisherige, überprüfbar unzulässige Instanzen werden beim Laden des Nature-Katalogs, bei relevanten Änderungen sowie per **„Fehlplatzierungen prüfen und bereinigen“** entfernt. Mangroven bleiben auf feuchte, warme Uferlandhexe beschränkt und dürfen visuell in angrenzendes Wasser hineinragen. Palmen stehen ausschließlich in Dschungel/Savanne. Der aktuelle Bestandskatalog enthält unverändert **181 PNGs** aus **17 Familien**; die Habitatfreigaben wurden familienweise geprüft. Die neu erstellten zusätzlichen Pflanzen sind noch **nicht im Repository eingelesen**; der offene Sprite-Produktionsplan enthält nur noch vier geologische Aufgaben (Findling, Felsgruppe, Eisblock, Schneeberg). Zur Detailprüfung: [Habitat- und Fluss-Audit](docs/NATURE_HABITAT_AUDIT.md). Ein echter Bild-/Browser-QA-Lauf bleibt nötig.

**Fluss- und Palmenkorrektur v0.15:** Flüsse verlaufen entlang der Hexkanten und Hex-Ecken, wie die Küsten-Overlays. Die Küsten-PNGs bleiben unverändert; sie definieren die Ausrichtung, nicht das Flussmaterial. Für den Fluss wird Wasser ohne Strand mit transparenter Kante verwendet. Die elf Palmen sind nur für warme Landbiome zugelassen, nicht mehr für Moor, Marschland oder Sumpf. Vorher erzeugte, manuell platzierte Instanzen werden nicht ungefragt gelöscht; eine neue Naturverteilung entfernt alte Zufallsplatzierungen.

## Flusssystem (v0.14.0)

Die frühere fest eingezeichnete Flussdemo mit Sand-/Uferstreifen wurde durch ein richtungsabhängiges, an die sechs Hexseiten angebundenes **Wasser-Overlay** ersetzt. Ein normales Flusssegment folgt den Hexkanten und verbindet sich an deren gemeinsamen Eckpunkten – niemals über die Hexmitte. Eine Quelle verwendet **dieselbe Flussdarstellung**, nur das nicht verbundene Ende liegt an einer Hexecke und erhält einen runden Wasserabschluss. An der Mündung läuft der Fluss in ein echtes Wasserhex aus und überblendet dort, ohne dass die Ufer-/Strandgrafik der Küstenlogik diese Einmündung überzeichnet. Das Wasser wird aus dem tatsächlichen Mündungs-Wasserbild bezogen; am Rand wird lediglich die Transparenz ausgeblendet, sodass Grasland, Tundra, Savanne, Gebirge oder Dschungel darunter erhalten bleiben.

Im Bereich **Flüsse – richtungsabhängige Hexsegmente** kannst du mit **Testfluss mit Wasserhex erzeugen** sofort einen Fluss samt echtem Wasser-Mündungshex testen oder einen Verlauf Hex für Hex zeichnen. Außerdem kannst du ein Landhex als Quelle auswählen und die kürzeste erreichbare Route bis zum nächsten Wasserhex erzeugen, Flussbreite einstellen, Flüsse löschen und Anschlüsse im Debugmodus prüfen. Existiert kein Wasserhex, kann kein gültiger Fluss erzeugt werden. Routen werden gespeichert und im Szenenexport mitgeführt. Näheres unter [Flusssystem](docs/RIVER_SYSTEM.md).

## Nature-Import: 33 neue Grafiken (19.10.2026)

Die 33 neu gepushten PNGs sind als reale Nature-Assets eingetragen: 8 Baumstümpfe (`deadwood`), 4 Erlen und 4 Weiden (`riparian_trees`), 3 Marulabäume (`savanna_trees`), 4 Tundra-Zwergsträucher (`cold_bushes`), 4 Schilfgruppen (`reeds`), 3 Sukkulenten (`succulents`) und 3 weitere Wacholder (`conifers`). Der **Nature-Katalog hat 181 Einträge**; die bereits bestehenden 148 Metadaten wurden nicht überschrieben. Die beiden versehentlich doppelt gepunkteten PNGs sind bei identischem Bildinhalt von `Marula2..png` und `Tundra_Zwergstrauch4..png` auf `Marula2.png` bzw. `Tundra_Zwergstrauch4.png` korrigiert.

Der **Sprite-Planungskatalog enthielt damals 11 offene Vorhaben und 34 abgeglichene Altposten**; der neuere v0.16-Stand mit vier offenen Geologie-Arten steht oben. Schilf, Weide, Erle, Baumstumpf, Tundra-Zwergstrauch und Sukkulente gelten als vorhanden. Die FloraV2-Referenz umfasst **106 Gruppen mit 181 echten PNG-Aliassen**. Einträge bleiben `candidate` bis zur optischen Prüfung. Normale Kapokbäume sowie Wald- und Dschungelgenerierung sind unverändert.

---

# Vedras Reiche – Asset-Labor v0.13.0 (zusammengeführt)

## Wälder und Dschungel (v0.12.0)

Das Asset-Labor besitzt nun eine zusätzliche **Waldschicht** unabhängig von Terraintexturen und Biomen: `light_forest`, `dense_forest` sowie einen **ein Hex breiten Waldrand-Auslauf**, durch den auch benachbarte Hexe mehr Bäume erhalten. Das eigenständige Jungle-Biom `jungle` lässt sich auf Landhexen als Dschungelgebiet markieren; vorhandener Waldboden dient bis zu einem echten Jungle-Terrain ausschließlich als visuelle Fallbacktextur. Seed-basierte Waldgruppen, Biomverträglichkeit, individuelle Nature-Größen und -Abstände werden berücksichtigt. Testkarte: **Natur auf Karte verteilen → Wälder & Dschungel**. Die Waldklassen werden in der Szene gespeichert und pro Hex als `forestByHex` exportiert. Für technische Details und noch offene Hauptspiel-Integration siehe [Wald- und Dschungelsystem](docs/FOREST_SYSTEM.md).

**Kapokbäume:** Alle acht `tree_12.png` bis `tree_19.png` sind normale, im Dschungel automatisch und manuell platzierbare Kapokbäume. Die frühere Journal-/API-Klassifizierung beruhte auf einem Missverständnis und wurde vollständig aufgehoben.


**Aktueller Stand:** v0.11.0 mit 37-Hex-Testkarte, 17 tatsächlich offenen Spritearten (ursprünglich 45 Planposten) und geprüftem Bestandsmanifest: 25 Geländequellfamilien (104 PNGs), 148 Nature-PNGs einschließlich acht gewöhnlicher Kapokbäume. Eindeutige Dateinamen liefern Metadatenvorschläge, bestehende Katalogwerte werden nicht überschrieben. Neue Vorschläge bleiben bis zur Bildabnahme Kandidaten.

**[Quellcode auf GitHub](https://github.com/markusjungblut/asset_labor)** · **[Verbindliche Grafikentscheidungen](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md)** · **[Release-Hinweise](README_V0110_UPDATE.md)**

Die historischen Versionsnotizen folgen unten. Für den aktuellen Stand gelten die v0.11.0-Regeln.

---

> **Aktuell v0.10.9:** Gerichtete Bergschlagschatten, live gespeicherte Instanzregler und Kettenabstände. Siehe [README_V0109_UPDATE.md](README_V0109_UPDATE.md) und [DESIGN_V0109_ADDENDUM.md](DESIGN_V0109_ADDENDUM.md).

> **v0.10.9 – Bergketten, Kernzone statt gesperrtem Hexring und Berganker Y=0,67:** Siehe `README_V0108_UPDATE.md`.

> **v0.10.7 – Bergplatzierung mit reservierten Hexringen:** Siehe `README_V0107_UPDATE.md`.

> **Asset-Labor v0.10.6:** Wasserbilder werden ohne innere Bildwiederholung einmal pro Hex dargestellt. Keine 22-%-Randmischung mehr. Die unveränderten v0.10.5-Uferoverlays, Nature-Sprites und das Landrelief bleiben bestehen. Siehe `README_V0106_UPDATE.md`.

**Aktueller Stand v0.10.5:** Küstenwasser-Migration, Wasser-Mixing, 6 Seiten der Ufer-Overlays; siehe [README_V0105_UPDATE.md](README_V0105_UPDATE.md) und [DESIGN_V0105_ADDENDUM.md](DESIGN_V0105_ADDENDUM.md).

> Stand: v0.10.4 – Wasser-Wasser-Mixing + Shoreline-Overlay-System. Details in `README_V0104_UPDATE.md`.

> **Neuer eigenständiger Renderer-Bugfix v0.10.3:** [README_V0103_UPDATE.md](README_V0103_UPDATE.md) – nahtlos wiederholbare Wassertexturen, A/B-Diagnose, keine Änderung an PNG-Dateien oder Landrelief.

> **Neue Version v0.10.2:** Siehe [README_V0102_UPDATE.md](README_V0102_UPDATE.md) für flaches Wasser, Wasser-zu-Wasser-Übergänge, Wasserklassifizierung und Tests.

> **Neue Version v0.10.1:** Siehe [README_V0101_UPDATE.md](README_V0101_UPDATE.md) für Installation, automatische Regionstests, den Nature-Katalog-Regressionsschutz und das Gebäude-Relief.

# Vedras Reiche – Asset-Labor v0.10.3

**Lokal startbarer Grafikviewer für eine modulare 2,5D-Pointy-Hex-Weltkarte.** Diese Version ist ein **technischer Teststand**, kein produktiver Kartenrenderer. Die zentrale Neuerung ist ein expliziter Geländekatalog mit geänderter Auto-Tiling-Materialmischung.

## Neuer Teststand v0.10.1 – Sanfte Hügel ohne Biomextra-Texturen

Das Asset-Labor hat unter **Hügel & Relief** fünf geometrisch definierte, deterministische 2,5D-Hügelprofile, einen Höhenregler, rechtsseitigen Lichteinfall, automatische Kontinuität über Hexgrenzen, einen A/B-Flachland-/Relief-Vergleich und zwei 19-Hex-Beispielkarten. Jedes Profil wird auf den bereits zusammengesetzten Bodenraster angewandt; Bäume, Felsen und Teststraßen folgen derselben Höhe. Terrainmaterial und Relief sind zwei unabhängige Schichten; vorhandene Biome, Sprite-Presets und Kataloge bleiben erhalten.

**Für bestehende Installationen:** Nur das `v0.10.1_Update.zip` über die vorhandenen Programmdateien entpacken, vorher `assets/` sichern. Der neue Startport ist **8771**, sofern frei. Siehe [README_V010_UPDATE.md](README_V010_UPDATE.md). Die geänderte Demo ist **noch keine vollwertige 3D-Engine**; Relief wird per CPU-gestütztem Höhenraster auf der Terrain-Mischung simuliert. Beim exakten Hochrelief sowie auf großen Karten stehen Sicht- und Performancetests noch aus.

## Neuer Teststand v0.9.1 – Freigaben nach Kategorie, Presets und Schattenkontakt

- **Ganzes Biomset freigeben:** Im Nature-Inspektor unter „Gesamte Terrain-Kategorien“ beispielsweise „Kalte Regionen“, „Gras- und Weideland“ oder „Feuchtgebiete“ anhaken. Eine neue Geländeart in einer bereits ausgewählten Kategorie wird automatisch beim nächsten Laden/Rendern einbezogen. Die Abhängigkeit wird durch stabile `categoryId` statt durch einen kopierten Satz alter Terrain-IDs gespeichert.
- **Einzelarten-Ausnahmen:** Bei jedem Terrain separat „Automatisch“ (Kategorie/Preset entscheidet), „Zusätzlich“ oder „Ausschließen“ wählen. Die Ausnahme schlägt eine Kategorienfreigabe.
- **Benannte Setups:** Aktuelle Kategorien/Freigaben als Preset speichern und bei anderen Sprites über die Auswahlliste verknüpfen. Ein Preset bleibt verknüpft: Änderungen am Preset gelten für alle verknüpften Sprites. Beim Löschen eines Presets werden die bisherigen Regeln in die Sprites übernommen; ein ungespeichertes, beschädigtes Preset darf keine Zuordnungen löschen.
- **Schattenkorrektur:** Nature-PNGs werden anhand der sichtbaren Alpha-Silhouette gezeichnet; großer transparenter Rand wird bei Darstellung und Bodenanker nicht mehr als Bildinhalt gerechnet. Generische Schatten liegen nahe beim Bodenkontakt, kurz und leicht nach links (Licht von rechts). X-/Y-Versatz, Breite und Schattentiefe sind im Nature-Inspektor editierbar. Die Debug-Option „Bodenanker und Schattenkontakt markieren“ hilft bei der optischen Feinabstimmung. Große Bäume und Gebäude benötigen weiterhin eigene Schattenbilder.
- **Verlustfreie Migration:** Die alte `assets/nature/nature_catalog.json` bleibt lesbar (v1-Schema); neue Felder sind optional. Die Server-API validiert Kategorien, Presets und Schattenparameter; beim Speichern entsteht weiter eine `.bak`-Kopie. Keine neuen Nature-Sprites ohne Sidecar automatisch als freigegeben markieren.

**Installationshinweis:** Für vorhandene Nutzerbestände das **v0.9.1_Update** in denselben Labor-Ordner entpacken (vorher `assets/` sichern), nur geänderte Programmdateien überschreiben. Das Update enthält keinerlei Terrain-Bilder, Terrain-/Nature-Kataloge oder andere Nutzerdaten. Die zentrale Grafikdokumentation ist im Repository unter `docs/graphics/Design.md` auf v2.4 und wird durch das ZIP nicht auf einen alten lokalen Dokumentstand zurückgesetzt. Das vollständige v0.9.1-ZIP ist ein **separates Beispielprojekt** und ersetzt nicht die eigenen Dateien.

**Offen:** Echte Sichtabnahme des gemalten Schattens auf allen neu hochgeladenen Busch- und Baumgrafiken; vollständige 30×30-Weltgeneration und großer Performance-Test. Die generischen PNGs sind anpassbare Testschatten, keine finalen individuellen Baumschatten.

## Start

1. ZIP vollständig entpacken (keine Dateien direkt aus dem ZIP starten).
2. Unter Windows `START_WINDOWS.bat` doppelklicken. Benötigt Python 3, **keine Drittbibliotheken** für den Betrieb.
3. Die im Konsolenfenster angezeigte Firefox-/Browser-URL öffnen. Startport ist **8774**; bei Belegung weicht der Starter auf den nächsten freien Port aus. Browser-Tabs vom alten Labor (`8765`, `8767`) nicht wiederverwenden.
4. Im Kopf muss **Asset-Labor v0.10.3** erscheinen. Das Terminalfenster geöffnet lassen.
5. Neue Bilder nach `assets/terrain/`, `assets/nature/`, `assets/buildings/` etc. kopieren und auf **Neu einlesen** klicken.

`http://127.0.0.1:<angezeigter-port>/api/version` liefert die Server- und Ordneridentität.

Ohne Python lässt sich `index.html` auch direkt öffnen; über **Ordner importieren** können Dateien eingelesen werden. Änderungen am Katalog können in dieser Betriebsart exportiert werden. Ein Browser darf importierte Ordner **nicht automatisch wieder beschreiben**.

## Fix v0.8.1 – „Neu einlesen“ behält Zuordnungen

In v0.8.0 wurde beim erneuten Laden der Assetliste der Katalog vom Server unabhängig vom aktuellen Bearbeitungsstand ersetzt; nicht zuvor ausdrücklich gespeicherte Grafikzuordnungen konnten dadurch unter „Nicht zugeordnet“ zurückfallen. v0.8.1 behebt diesen Fehler:

- **Neu einlesen** lädt neue Dateien, ohne die aktuellen Bearbeitungen zu verwerfen. Ausstehende Änderungen werden zuerst gespeichert; bei einem Speicherfehler bleiben die lokalen Zuordnungen bestehen und es erscheint eine Meldung.
- Der lokale Server **speichert Änderungen automatisch** (mit kurzer Verzögerung), seriell nach Änderungsstand. Das manuelle Speichern bleibt möglich.
- Beim Speichern des Katalogs wird die vorherige Datei als `assets/terrain/terrain_catalog.json.bak` gesichert. Bereits zuvor durch v0.8.0 verlorene, nie gespeicherte Zuordnungen können dadurch allerdings nicht rückwirkend rekonstruiert werden.
- **Wichtig beim Update:** Für eine vorhandene v0.8-Installation das kleine **Hotfix-Update-ZIP** in genau den alten Asset-Labor-Ordner entpacken und die gleichnamigen Programmdateien ersetzen. **Nicht `assets/terrain/terrain_catalog.json` überschreiben oder den Ordner `assets/` durch den aus einem frischen Vollpaket ersetzen.** Dadurch bleiben alle bereits hinzugefügten Bilder, Kategorien und Zuordnungen erhalten. Vorher die vorhandene `terrain_catalog.json` zur Sicherheit kopieren.
- Alte Serverfenster schließen und `START_WINDOWS.bat` neu starten. Im Kopfbereich muss **v0.8.1** stehen. Zum endgültigen Auslagern oder vor einem Ordnerwechsel immer zusätzlich **Katalog exportieren**.

### Fehlerprüfung

1. Eine vorhandene Grafik auswählen und einer anderen Geländeart zuordnen.
2. Sofort „Neu einlesen“ drücken, ohne zuvor manuell „Katalog speichern“ zu benutzen.
3. Die Zuordnung muss bleiben und nach einem Browser-Neustart weiterhin geladen werden. Der neue Bildbestand muss ebenso eingelesen werden.
4. Im Servermodus zeigt der Katalogstatus nach erfolgreichem Speichern keine offenen Änderungen mehr an.
5. Ohne lokalen Server muss der Katalog als JSON exportiert werden; ein reiner Ordnerimport hat keine Schreibberechtigung.

## Neuer Geländekatalog

Die Grafikbibliothek gruppiert Terrainassets jetzt in der Hierarchie **Kategorie → Geländeart → Varianten**. Es gibt die sechs vereinbarten Kategorien mit 19 Geländearten:

- **Wasser und Küste:** Ozean, Küstengewässer, Küste
- **Kalte Regionen:** Gefrorene Tundra, Tundra, Schneefelder
- **Gras- und Weideland:** Grasland, Weideland, karges Weideland
- **Warme Regionen:** Savanne, Dschungel
- **Feuchtgebiete:** Moor, Marschland, Sumpf
- **Trockene Regionen:** Steinwüste, Sandwüste, Lehmwüste, Badlands, Ödland

Eine **siebte, ausdrücklich als Testbestand gekennzeichnete Kategorie** „Weitere Testgelände“ verwaltet zusätzlich die vier älteren Demo-Texturen Waldboden, Hügelboden, Gebirgsboden und trockener Boden. Sie sind keine stillschweigenden Varianten von Grasland, sondern eigene Testarten. Daraus ergeben sich derzeit **7 Kategorien und 23 Geländearten**.

Über **Neue Kategorie anlegen**, **Neue Geländeart anlegen** und die beiden Bearbeiten-Bereiche kannst du Kategorien und Geländearten anlegen, umbenennen, verschieben oder archivieren. Die IDs bleiben dabei stabil.

### Neue Grafik richtig einsortieren

1. Eine vollflächige, rechteckige Bodenmaterialgrafik in `assets/terrain/` kopieren und **Neu einlesen**.
2. Sie steht ohne gültige Zuordnung unter **Nicht zugeordnet**. Die Dateibenennung alleine ist **keine** automatische Biomerkennung.
3. Grafik auswählen, rechts unter **Geländeart der Grafik** die korrekte Art auswählen (z. B. Tundra).
4. **Automatische Speicherung:** Im lokalen Servermodus wird jede neue Geländearten-Zuordnung und Kategorie-/Typänderung nach kurzer Verzögerung automatisch nach `assets/terrain/terrain_catalog.json` geschrieben. **Katalog speichern** ist zusätzlich als sofortige manuelle Sicherung vorhanden. Im reinen HTML-/Ordnerimport-Modus muss der JSON-Export weiterhin heruntergeladen und eigenständig in den richtigen Ordner kopiert werden.
5. **Auf ausgewähltes Hex setzen** oder eine gesamte Test-Biomgruppe mit derselben Grafik belegen.

Der Katalog lässt sich auch **exportieren, importieren und neu einlesen**. Die von dir erstellten IDs sind beständig; veränderte Anzeigenamen verursachen keine Identitätswechsel. Eine Szene kann exportiert und wieder importiert werden. Alte Szenen aus v0.6/v0.7 werden mit ihren explizit zuordenbaren Grafiken gelesen; unbekannte Grafiken/Typen werden **nicht** willkürlich auf Grasland gemappt, sondern übersprungen und gemeldet.

**Mitgeliefert:** Vier Tundra- und vier Gefrorene-Tundra-Grafiken aus dem bisherigen Entwurfsprozess, ausdrücklich als **KI-Kandidaten** und **nicht als bewiesen nahtlos wiederholbar** deklariert.

## Auto-Tiling v0.8

- **Getrennte Schalter:** „Geländeartenübergänge“ für verschiedene Arten und „Nur Varianten derselben Geländeart mischen“ für Varianten **derselben** Art.
- **Ein gemeinsames Weltkoordinatenfeld:** Ein Materialpunkt wird nur einmal berechnet, nicht mit getrennten Hexclip-/Alpha-Layern überlagert.
- **Gemeinsame Verformung:** Die organische Kantenunregelmäßigkeit basiert auf einer identischen Weltposition für alle angrenzenden Materialien. Sie erhält die Symmetrie entlang derselben Grenze.
- **Normierte Eckmischung:** Bis zu drei benachbarte Materialproben teilen sich die Gewichte. Es entstehen keine zusätzlichen unabhängigen Eck-Overlays.
- **Kernzonenschutz:** Außerhalb des Übergangsbandes bleibt das eigene Material unverändert; weiter ins Innere reichende keilförmige Ausläufer werden vermieden.
- **Bilineare periodische Abtastung** statt ausschließlich ganzzahliger Quellpixelabtastung; periodische Nahtprobleme der ursprünglichen PNG können aber weiterhin sichtbar sein.
- **Sonderfall Küste/Wasser:** Bei diesen Geländearten ist ein eigenes Ufer-/Gewässerprofil vorgesehen. Solche Kanten werden derzeit **nicht** wie normale Erdmaterialien ineinandergeblendet. Das vollständige Shoreline-System ist noch nicht implementiert.

Rechts im Viewer findest du Kantenbreite, organische Unregelmäßigkeit, Dreifachkontakt-Test, Nahtkontrolle, hohe Zoomstufen und Diagnosemodi. Im Bereich **Ausgewähltes Hex** wird jetzt ausdrücklich erklärt, ob der jeweilige Nachbar ein Variantenwechsel, eine Geländeartengrenze oder eine ungeklärte Uferregel ist.

### Gebäude und Nature-Sprites

Die Objekt-Grafiken bleiben getrennte Sprites; der Terrainblender verändert sie nicht. Die derzeitige Testmine enthält noch eine unpassende Bodenzone und ist **kein finales Produktionsasset**. Künftige Gebäude-Grafiken werden ohne biomeigene Gras-/Schnee-/Sandfläche erzeugt und bekommen gemäß Designstandard einen separaten, individuell gemalten Bodenschatten. Das Testmaß Level-1-Mine beträgt 160 logische Einheiten, Gebäudebreite maximal 192 bei Hexbreite 256.

## Entwicklertests

Im Projektordner (nur für die Tests benötigst du Playwright / pytest und einen installierten Chromium-Browser):

```bash
python tests/test_v08_browser.py
python tests/test_catalog_api.py
```

Der erste Test verwendet eingebettete Grafikdateien, da direkte Browsernavigation auf localhost in manchen Ausführungsumgebungen administrativ blockiert sein kann. Der zweite Test startet den Python-Server selbst und prüft Katalog-API, persistentes Schreiben und ungültige Payloads.

Numerische Kriterien der Materialmischung mit künstlichen Farbflächen: an der Zweiergrenze ungefähr (127,128,0), an der symmetrischen Dreifachgrenze (85,85,85), im Feldzentrum 100 % eigene Farbe. Diese Tests sind keine visuelle Freigabe aller generierten Materialbilder.

## Grenzen und Folgearbeiten

- Die Texturen sind **nicht alle nahtlos wiederholbar**. Die v0.8-Rechnung löst die geometrische Mischnaht, nicht jeden sichtbaren Wiederholungsbruch einer KI-Quelltextur.
- Bilder mit fester Seitenwand/Hexblock, schwarzem Hintergrund oder großen bereits hineingemalten Steinen sind keine freigegebenen Terrain-Bases.
- Das Terrain wird im Viewer auf der CPU als zusammenhängender Canvas2D-Bildpuffer erzeugt und gecacht. **Performance mit 200+ sichtbaren Hexen** und auf schwächeren Firefox-/Mobilgeräten bleibt ein separates Gate; für eine große Spielwelt sind Chunks und/oder GPU-Rendering nötig.
- Gezielte Übergangsprofile für Küste/Ufer, Höhenstufen und Wasser sowie ausführliche A/B-Materialtests müssen noch ausgebaut werden.
- Die Asset-Labor-Tests sind **kein Gameplay- oder produktives Weltkarten-Abnahmeprotokoll**.

Die zentralen Grafikvorgaben liegen in `Design.md`, die Meilensteinplanung in `AUTOTILING_PLAN.md`. Die **maßgeblichen Projektversionen** werden im GitHub-Repository unter `docs/graphics/` gepflegt.

---

## Neues in v0.9.0 – Nature-Sprite-Verwaltung

Das Labor ergänzt einen **separaten Nature-Katalog** unter `assets/nature/nature_catalog.json` mit automatischer Speicherung, Import und JSON-Export. Über den rechten Nature-Sprite-Inspektor lassen sich für jeden freigestellten Busch, Baum, Felsen, Kaktus oder sonstigen Gegenstand IDs, Herkunft, Familie, Größe, Schatten, Bodenanker, geeignete Geländearten und Platzierungsregeln bearbeiten.

**Startport: 8769**; die Version wird in Kopfzeile und `/api/version` angezeigt. Für bestehende Installationen bitte **das kleine v0.9-Update-Paket benutzen**, das Terrain-Katalog und eigene Grafiken nicht überschreibt. Siehe `README_V09_UPDATE.md`.

**Ablauf für neue Sprites:** PNG in `assets/nature/` plus gleichnamige JSON-Sidecar aus `NATURE_SPRITE_CONTRACT.md` ablegen → „Neu einlesen“ → rechts prüfen → „Nature-Sprites auf Testkarte verteilen“. Mehrere Instanzen können unterschiedlich auf einem Hex stehen. Die Verteilung ist reproduzierbar, nicht beim Neuladen neu ausgewürfelt. Die bisherigen Platzhalter bleiben Testgrafiken; es wurden keine der Nutzer-Vorlagen automatisch zu fertigen Einzel-PNGs erklärt.

Der bisherige Terrainrenderer bleibt erhalten. Eine große, vollwertige Weltgeneration mit 30×30 Feldern und optimiertem Chunk-/GPU-Rendering ist **noch nicht implementiert**; v0.9 dient bewusst als erster geprüfter Nature-Sprite-Produktionsvertrag.

Testaufrufe: `python tests/test_nature_v09_api.py` (Server) und `python tests/test_nature_v09_embedded.py` (Browser via Playwright/Chromium). Die älteren v0.8-Browser-Testskripte werden historisch mitgeliefert und sind nicht auf alle neuen v0.9-IDs aktualisiert.

**Dokumentationsstand:** Die mitgelieferte `Design.md` ist ausdrücklich ein älterer Offline-Schnappschuss. Der aktuelle verbindliche Stand ist [aktueller Design.md](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md) plus [Nature-Sprite-Vertrag](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/NATURE_SPRITES.md) im Repository. Die eigenständig nutzbare detaillierte Nature-Anleitung liegt hier lokal als `NATURE_SPRITE_CONTRACT.md`.


## Quellcode und geplanter Sprite-Katalog (v0.11.0)

Der kanonische **Asset-Labor-Quellstand** liegt im separaten Repository [markusjungblut/asset_labor](https://github.com/markusjungblut/asset_labor). Dort liegen Programmcode, Tests und `plans/sprite_catalog_plan.json` (17 offene Vorhaben, 28 abgeglichene ältere Planposten). Designentscheidungen aus dem Gesamtspiel werden weiterhin in `browsergame/docs/graphics/Design.md` abgestimmt.

**Git-Stand nach Nutzer-Commit vom 18.10.2026:** In `assets/` sind inzwischen 148 Nature-PNGs, 104 Terrain-PNGs, 4 Schatten-PNGs und 6 Ufer-PNGs versioniert. Ebenso sind `assets/nature/nature_catalog.json` und `assets/terrain/terrain_catalog.json` jetzt eingecheckt. Die Nutzerin/der Nutzer hat die vorher ergänzten PNG-/Katalog-Ignore-Regeln ausdrücklich entfernt. Neue Bilder werden dadurch bei `git status` angezeigt, gelangen aber **erst nach `git add`, `git commit` und `git push`** nach GitHub; ein Dateikopiervorgang allein reicht nicht. `.bak` und temporäre Dateien bleiben ignoriert. Katalogspeicherung im lokalen Servermodus erzeugt vor dem Überschreiben ein Backup; individuelle vorhandene Zuordnungen werden beim automatischen Vorschlag nicht ersetzt.

**Dateinamen-Audit:** `plans/terrain_asset_plan.json` ordnet die 25 vereinbarten Terrainfamilien ihren 104 tatsächlich vorhandenen PNGs zu. `stormy_ocean_01.png` bis `stormy_ocean_08.png` sind nach Nutzerumbenennung einheitlich benannt. Das frühere `mountain_01.png` ist im aktuellen Repository nicht mehr enthalten. `cosatal_water_*` bleibt aus Bestandsschutz unter seinem bisherigen Dateinamen, ist aber als `coastal_water` klassifiziert. Waldboden (`wald_*`) ist ein Sondermaterial, kein automatisch eigener Weltbiomtyp. Neue `marula*`- oder `wacholder*`-Bilder gehören in `assets/nature/`, nicht in `assets/terrain/`.

**Kapokbäume (Korrektur):** `tree_12.png` bis `tree_19.png` sind acht normale Dschungelbäume mit den IDs `kapok_tree_12` bis `kapok_tree_19`, `kind=tree`, `family=jungle_trees`, Größenklasse `giant` und der Geländeart `jungle`. Sie werden wie andere Nature-Bäume manuell oder automatisch platziert. Es gibt keine separate Kapok-API und keine Journal-Sonderbehandlung. Die ursprünglichen PNG-Dateinamen bleiben erhalten. Alle vorhandenen Nature-Grafiken dürfen auf der Testkarte auch im Status `candidate` verwendet werden, wenn die Biomfreigaben passen.

### Neue PNGs & Verteilung (Oktober 2026)

Neue Bilder in `assets/nature/` kopieren und im laufenden lokalen Asset-Labor **Neu einlesen**. Die Server-Assetliste erkennt PNGs ohne weiteren Code, aber die automatische Metadatenklassifizierung funktioniert nur für **bekannte, exakt geprüfte Namensfamilien**: beispielsweise `wacholder4.png`, `wacholder_04.png`, `marula_01.png`, `marulabaum1.png` und `marula-baum_01.png`. Ein unbekannter Dateiname erscheint weiterhin in der Bibliothek; seine Klasse und Biome müssen manuell im Nature-Inspektor festgelegt und gespeichert werden. Bestehende individuelle Metadaten werden nicht überschrieben.

Der Button **Nature-Sprites auf Testkarte verteilen** (ebenso die Schnellaktion **Natur verteilen**) verwendet auch `candidate` und `test`; dies gilt ausschließlich zum Testen, nicht als Produktionsfreigabe. Es zählen ausschließlich passende Geländearten und die jeweilige Dichte-/Abstandslogik. Bei 0 Instanzen zeigt die Oberfläche nun einen Grund an, statt stillschweigend 0 zu melden. Kapokbäume `tree_12`–`tree_19` sind normale Dschungelbäume und dürfen platziert werden.

**Palmen:** `palme_01` bis `_05` gehören zur Familie `palms`, Größenklasse `medium` (126 Welt-Höheneinheiten); `_06` bis `_11` sind `large` (174). Alle bleiben auf Landbiome (`warm_regions`, `wetlands`) begrenzt, nicht auf offenes Küsten-/Ozeanwasser. Dies sind relative Bildschirmgrößen, keine realen Meter. Die botanische Unterart bleibt ungeklärt.

## Vegetationskatalog & bereinigte Aufgabenliste (18. Oktober 2026)

Der **Sprite-Planungskatalog ist keine Liste sämtlicher Grafikarten**. Die alte Sammlung von 45 Arten enthielt bereits produzierte Naturgrafiken unter abweichenden englischen Soll-Dateinamen. Daraus entstand die missverständliche Anzeige `0 von 45 Bilddateien`. Der bereinigte Plan hat **17 noch offene Arten**. Weitere 28 ältere Einträge stehen unter `resolved`: **21** werden durch vorhandene Varianten abgedeckt beziehungsweise nicht eigens benötigt; **7** Kleinstobjekte werden nicht als einzelne Nature-Sprites produziert, sondern gegebenenfalls in Terrain-Bodenmaterial integriert. Im Viewer steht deshalb die Zahl *noch offener Vorhaben*, nicht die irreführende 45er-Quote. Vorhandene Bilder verbleiben im realen Nature-Katalog; es wurden weder Platzhalterbilder noch leere Sidecars angelegt.

**Büsche:** `bush_01`–`04` mittel; `05`–`06` klein; `07`–`10` groß; `11`–`14` mittel; `15` klein; `16` mittel; `17`–`19` groß; `20`–`29` trockene Büsche (Größe derzeit grob als 20–24 mittel und 25–29 klein angesetzt); `30`–`33` mittel; `34`–`41` echte Buschgruppen (`kind=cluster`). Die zehn Trockenbüsche bekommen die Familie `dry_bushes`, die anderen stehen unter `temperate_bushes`. Die Gruppengrößen und Trockenbusch-Feinabstufungen bleiben später optisch justierbar.

**Beschneite Nadelhölzer:** `tanne_schnee_01`–`05` heißen im Katalog *Verschneite Kiefer*, `tanne_schnee_06`–`10` *Verschneite Tanne*. Diese Einteilung ist vom Nutzer frei gewählt, keine botanische Bestimmung. Die ursprünglichen Dateinamen und Sprite-IDs bleiben aus Kompatibilität erhalten. Die elf unbeschneiten `tanne_01`–`11` bleiben vorläufig Tannen und können später als Kiefern neu zugeordnet werden.

**Kapokbäume:** Die acht Bilder `tree_12`–`19` gehören zur Familie `jungle_trees` und erscheinen als normale Bäume auf Dschungel-Hexen. Ihre IDs wurden in `kapok_tree_12`–`kapok_tree_19` geändert; der frühere Journal-/API-Sonderstatus wurde entfernt.

**Als noch offen gelten unter anderem:** Schilf, Farn, Kakteen, Mangroven und deren Gruppen, Weide, Erle, markantes Totholz, größere Felsen und Eisblöcke. Klee, Moospolster, Alpengras sowie mehrere weitere Kleinstobjekte werden nicht mehr als Einzel-PNGs geplant. Für bereits hergestellte Varianten wie Thymian, Wacholder, Buschgruppe, Akazie, Palmen und Tannen gibt es keine unnötigen Doppelaufträge. Neue Dateinamen lassen sich gegebenenfalls auch über im Plan aufgeführte deutsche Aliasse zuordnen.

## Branch-Zusammenführung: FloraV2 als zusätzliche Referenz

Der frühere Branch `codex/flora-v2-asset-registry` wurde in `main` integriert. Seine 37 Pflanzenfamilien-Verzeichnisse und die FloraV2-Referenz mit 104 Kategorien sind im **FloraV2 – Pflanzenreferenz**-Panel durchsuchbar. Das ist **kein neuer Produktionsauftrag** und überschreibt weder den bestehenden Nature-Katalog (148 real vorhandene PNGs) noch die 17 tatsächlich offenen Spritearten. Die ursprüngliche FloraV2-Baumverteilung wurde **nicht** übernommen: Sie würde die neuere Wald-/Dschungel-Engine einschließlich der gewöhnlichen Kapokbäume ersetzen. Ihre Daten und die historischen Waldprofile stehen als Referenz zur Verfügung. Terrain-Seed-Werte sind informativ und überschreiben nicht die realen Geländezuweisungen.

Die 37 Ordner enthalten ausschließlich textliche `_ASSET_PLAN.md`-Referenzen, **keine PNG-Platzhalter**. Für die tatsächliche Erstellung neuer Sprites gilt allein die aktuelle Produktionsliste `plans/sprite_catalog_plan.json`.
