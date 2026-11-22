# Großkarten-Baker: Geografielabor → vorbereitete Spielkarten

**22.11.2026 · Implementierungsplan und Phase-1-Prototyp.** Branch:
`feat/geography-large-map-bake-plan-20261122`.

## Entscheidung

**Die vorhandene Rendertechnik wiederverwenden, nicht nachbauen.**
Das Geografielabor ist die geografische Quelle. Das Asset-Labor bleibt der
Referenzrenderer für Boden, Küste, Fluss, Wald, Gebirge und statische
Dekoration. Ein **separater, offscreen und batchweise aufrufbarer Bake-Runner**
soll die beiden verbinden, ohne große Welten im interaktiven Test-Editor
vorzuhalten. Das Asset-Labor darf dieselben Karten optional später importieren;
es ist für den regelmäßigen Export **keine zwingende Zwischenstation**.

Eine Geografie-JSON ist **keine fertige Spielkarte**: erst vorberechnete,
vollständige PNG-Schichten und eine zugehörige semantische Weltbeschreibung
ergeben das schnelle Kartenformat.

## Code- und Formatbestand (Stand main bei Planerstellung)

| Quelle | Konkreter Bestand | Einschränkung |
|---|---|---|
| `worldgen-geography.js` / `geography-io.js` | Deterministische Version `geography-v2.1.2`, absolute Q/R, 26 Terrain-IDs, Klima, Wald, Flüsse; maximal 60.000 Felder durch Generator, UI auf max. 240 je Achse begrenzt | Kein High-Fidelity-PNG-Rendering |
| `geography-lab.js` | Vollständige Welt-JSON oder Parameterexport; 95×75 Vielfalt-Mix mit 7.125 Hexen | Canvas ist Vorschau, keine Asset-Labor-Grafik |
| `app.js` / `chunks.js` | Material-, Küsten-, Fluss-, Berg- und Scenery-Rendering; 512-Welteinheiten-Grid | `importGeographyWorld` schneidet auf die Editor-Szenengröße von 7–397 Hexen zu und zentriert lokale Koordinaten |
| `world-tile-streamer.js` | Nur vollständig gerenderte, nicht dirty/Preview markierte Ground+Scenery-Kacheln als `exportExactPackets` | An Kamera und Editor-Caches gebunden, keine Großwelt-Job-API |
| `frozen-map-runtime.js` | Speichert/liest unveränderliche PNG-Kacheln in IndexedDB; Standalone-Spielkarten-Viewer | Atlas-Bake heute noch im Editor-Offline-Tour-Pfad |
| `frozen-map-package.js` / ZIP-Importer | Manifest und PNG-Atlas als ZIP32; `complete:false` bei Teilkarte, separate Importprüfung | Kein offenes Streaming-/Sektorformat für beliebig große Gesamtarchive |
| `authored-world-contract.js` | Semantische Welt + Herkunft, 60k Zellen, JSON-Obergrenze 28 MiB | Editor-v3-Szene und Terrain-Metadaten sind nicht identisch mit 60k-Generatorwelt |

Die bestehenden Arbeiten an semantischer Persistenz
(`docs/rendering/SEMANTIC_MAP_PERSISTENCE_20261118.md`) sind Voraussetzung,
aber **nicht gleichbedeutend mit einer getesteten großen Karte**. Aus
`docs/rendering/STEP17_FROZEN_MAP_TEST_20261101.md` behalten wir den Grundsatz:
Rendern **einmalig vor dem Spiel**, Laufzeit zeichnet nur PNGs;
Einheiten, Besitz, Fog und Server-Sichtrechte bleiben dynamisch.

## Zielpipeline

```text
Geografielabor (Seed, v2.1.2-Parameter, Welt-JSON)
      |
      v
Preflight: Weltvalidierung + absolute Koordinaten + Quell-Fingerprint
      |
      v
512er-WorldTile-Plan (nur tatsächlich belegte Kacheln)
      |
      v
Queue/Batches -> Renderer-Adapter aus Asset-Labor (offscreen)
    |    Ground: Relief/Material/Ufer/Flüsse
    |    Scenery: Wald/Berge/Dekoration/Schatten
    |    angrenzende Geografie und Source-Assets als Halo
      |
      v
Pro Tile: vollständige PNGs + Quelle/Qualität/Revision prüfen
      |
      v
Append-only persistieren, Fortschritt sichern, nach Abbruch fortsetzen
      |
      v
Vollständigkeits-Audit -> Manifest + semantische Sektor-Records
      |
      +--> Standalone-Spielviewer (ohne Terrain-Worker)
      +--> portables ZIP/Sektor-Archive
      +--> optional Asset-Labor-Editor-Import
```

### Unverhandelbare Datenverträge

1. Die **absolute geografische Q/R** gilt für alle Renderjobs. Kein
   veränderliches Zentrieren, keine neue Seed-Verteilung pro Renderbatch.
   `chunks.js worldPos({q,r}) = {x:256*(q+r/2),
   y:1.5*(256/sqrt(3))*r}`. Bildtilegröße 512 Welt-Einheiten,
   mathematische Zuordnung identisch zur vorhandenen
   `spatialFor`-Occupancy inklusive ±150 Einheiten.
2. **Source-Halo 470 Welt-Einheiten** als Mindest-Verarbeitungsumfeld für
   vorhandene `chunks.js neighbors`-Abfragen. Dies ist eine
   Startannahme, **noch keine nachgewiesene ausreichende** Abdeckung für
   große Bergsilhouetten/Flussrouten/Schatten. Vor dem Near-Bake
   Pixelgleichheit an Kachelgrenzen und große Überhänge testen.
3. Jeder Bake-Job hat die Kachelkennung `cx,cy`, Weltgrenzen
   `x,y,512`, Quelldaten-/Katalog-/Rendererrevision und gewünschtes LOD.
   **Nie** Preview-/dirty-/unvollständige Layers als fertig veröffentlichen.
4. Rasterquellen werden vom **einen bestehenden Asset-Katalog** aufgelöst.
   Fehlende Texturen, Reliefbilder, PNG-Crop/Padding oder River-Segmente
   verursachen ein sichtbares `missing/failed`, **keinen** stillen
   Ersatz durch flache Previewfarben.
5. Statische Layer: **Ground und Scenery**. Dynamische Gebäude,
   bewegliche Einheiten, Auswahl, Interaktion, Fog und serverseitige
   Sichtkontrolle gehören nicht in die Bilder. Die semantischen Daten
   mit Terrain-ID, Klima, Relief, Wald, Fundorten und Flussgeometrie
   sind separat abrufbar.
6. Die Weltidentität muss Generatorversion, Seed, Parameter, Geografie-
   Hexdaten, Flussverlauf **und beim tatsächlichen Bake zusätzlich alle
   bildrelevanten Asset-/Rendererrevisionen** einschließen. Ein anderer
   Renderstand bekommt neue unveränderliche Bildkachel-IDs. Kein
   Überschreiben alter Atlas-Bilder, privaten Firefox-Origin-Store
   oder der Originalkarte `v1-0374527a`.
7. `complete:true` erst nach exaktem Inventar aller erwarteten
   Kacheln **und beider geprüften PNG-Layer**. Die spätere Archivierung
   muss fehlende Tiles ausdrücklich auflisten, nicht durch Preview
   vortäuschen.

## Phase 1 – implementiert in diesem Branch

- Neues read-only Modul `large-map-bake-plan.js` (Browser und CommonJS).
  Es akzeptiert nur konsistente, vollständig vorliegende Weltfelder,
  berechnet deterministisch und global-koordinatenstabil sämtliche
  belegten 512er-Kacheln und gruppiert sie in Batches 1–128.
- `geography-lab.html`/`geography-lab.js`: neue Funktion
  **„Renderplan erstellen und als JSON exportieren“**. Der aktuelle
  Seed samt Geografie wird **nicht** verändert. Der exportierte
  `vedras-geography-bake-plan-v1` trägt `stage:"plan-only"`,
  `rasterized:false`, `readyForViewer:false`.
- **Konkrete Rechnung** für 95×75, `vedras-welt-01`, Vielfalt-Mix:
  **7.125 Zellen**, **1.678** 512er-Kacheln, **105** Batches bei
  max. 16 Kacheln (letzter Batch 14). **0 PNGs erzeugt.**
- `source.fingerprint` ist lediglich ein reproduzierbarer
  **nicht-kryptografischer Änderungsindikator**; er beweist nicht
  Bildintegrität. Finale PNG-Pakete brauchen Inhaltsprüfungen/Hashes.
- Absichtlich **kein** IndexedDB-/ZIP-Schreibzugriff und **keine**
  Änderungen an `app.js`, Materialien, bestehenden Szenen oder
  produktivem `browsergame`.

### Schnittstelle

```js
const plan = VedrasLargeMapBakePlan.plan(generatedWorld);
const batches = VedrasLargeMapBakePlan.batches(plan, 16);
// output: plan.tiles [{id:"0,0", x:0, y:0, size:512}, ...]
// each batch is only a queue of tasks, NOT proof of rendered artwork
```

Tests `tests/test_large_map_bake_plan_20261122.cjs`:
deterministisches Ergebnis, exakt die Tile-Mengen/WorldPos aus
`chunks.js`, vollständige Weltvalidierung, negative Koordinaten,
geänderter Seed, verfälschte Zellen, 57.600 synthetische Zellen,
ungültige Batches, explizite Nicht-Fertig-Markierung.

## Phase 2 – begonnene Implementierung (Fortsetzung 22.11.2026)

**Erledigte, additive Vorarbeiten auf demselben Branch:**

- `large-map-bake-source.js` baut aus Welt und geprüftem Renderplan einen
  kachelweisen, nach 512er-Räumen indexierten **BakingContext**.
  `contextFor(tileId)` liefert die **originalen absoluten Q/R-Werte**
  samt Terrain, Relief, Features, allen berührten Flussrouten (nicht
  unbemerkt abgeschnitten), Owner-by-Anchor-Zellen und dem 470er-Source-Halo.
  Die Quelldaten werden beim Übergang vom geografischen Weltobjekt gelöst.
  **1.678/1.678 Kacheln** stimmen hinsichtlich der Nachbar-Hex-Auswahl
  mit `chunks.js.neighbors(...,470)` überein; durchschnittlich rund
  **33 relevante Hexe pro Kachel**.
- `large-map-bake-authoring.js` übersetzt jeden kachelbezogenen
  BakingContext in das **vorhandene Asset-Labor-Authoringformat**
  (`q/r`, `worldQ/worldR`, `biome`, `terrainTypeId`,
  `hillProfile`, Relief, Waldklasse/-dichte,
  `geographyHexes`, Junglegebiete und Owner-by-Anchor-Zellen).
  Die geografischen **absoluten Koordinaten bleiben erhalten**.
  Flüsse werden als volle Routen mitgegeben, nicht anhand des
  lokalen Source-Halos zerstückelt. Dieser reine Adapter
  wählt noch **keine** Terrain-PNGs oder dekorativen Sprites aus.
- `large-map-bake-runner.js` bildet die asynchrone Pipeline
  `contextFor → renderer.renderTile → PNG-Format-/Dimensionsprüfung →
  SHA-256 → store.add`. Zwei Qualitätsprofile sind festgelegt:
  `native-near` (Ground 2,5× / Scenery 1,9×) für den
  Referenztest und `near-4x` (Ground 4× / Scenery 2×) wie im
  bestehenden Offline-Editor. Der Runner akzeptiert **nur Ground+Scenery,
  vollständig, nicht dirty/Preview**, mit passenden Padding- und
  optionalen Scenery-Crop-Metadaten.
- Für Resume wird jeder bestehende Receipt einschließlich beider
  **tatsächlich gespeicherten PNG-Blobs und ihrer SHA-256** erneut geprüft.
  Veränderte Quelle/Renderer-/Katalogversion erhalten neue
  Schlüssel; korrupte Einträge blockieren den Job, werden niemals
  überschrieben. Abbruch lässt erfolgreiche Einzelkacheln stehen.
  `all-tiles-verified` bedeutet **nicht** bereits
  `readyForViewer:true`: die anschließende Atlas-/Semantik-Publikation
  ist weiterhin separat erforderlich.
- `large-map-bake-storage.js` verwendet ausschließlich die **neue
  `vedras-large-map-bake-v1`-IndexedDB** mit atomarem `add()`.
  Die produktive Datenbank `vedras-frozen-world-v1` wird nicht
  geöffnet oder verändert. Noch kein automatisches Aufräumen.
- Der bestehende Renderer in `app.js` erhält einen ausschließlich
  **optional aufrufbaren Near-Probelauf**. `bakeWorldTile` kann nun mit
  `forceSource:true` den möglicherweise veralteten Screenshot-Pfad
  überspringen und tatsächlich `drawGround`, `drawRoads`
  und `drawMapObjects` ausführen; Default bleibt unverändert.
  Unter **Spielkarten-Test → Großkarten-Baker: Referenzkachel**
  kann eine bereits vorbereitete Kachel per Tile-ID gerendert werden.
  Der neue Runner prüft beide PNGs und das vorhandene
  `frozen-map-package.js` exportiert sie gemeinsam in einem
  **reinen Referenz-ZIP**. Es ist **kein importierbares Spielkarten-ZIP**.
  Kein Rendern und keine Speicherung erfolgt automatisch.
- Getrennte `node --test`-Suiten überprüfen Quellenparität,
  Negativfälle, 57.600 synthetische Zellen, vollständige PNG-
  Bildabmessungen, Revisions-/SHA-Prüfung, Resume/Abbruch und den
  isolierten Browser-Store. Das optionale UI ist zusätzlich per
  Vertrags-/Quelltest verdrahtet. Eine eigene schlanke
  GitHub-Actions-CI benötigt keine Bitmap-Atlanten.

**Noch offen:** Echter Firefox-Referenzkacheltest mit den
vollständigen Asset-Labor-Grafikquellen; 4×-Pixelvergleich gegen die
bestehende 397-Hex-Offline-Tour; ein **vollständig unabhängiger,
nicht editorgebundener Raster-Adapter** für die BakingContexts;
Job-/Fortschritts-UI und finaler Karten-/ZIP-Publisher für 7.125 Hexe.
Der schon implementierte Runner akzeptiert einen echten
`renderer.renderTile(context)`-Callback, doch der endgültige
Großwelt-Adapter ist **noch nicht verdrahtet**.

## Phase 2.1 – Direkter Originalmaterial-Test im Geografielabor

**Neu auf dem Branch (22.11.2026):**

- `large-map-bake-material-preview.js` nutzt **direkt**
  `VedrasAutotile.build()` aus `autotile.js`; das ist dieselbe
  bildbasierte Terrainmaterial-Mischtechnik wie beim Editor und
  im `terrain-worker.js` (nicht die farbige Geografie-Vorschau).
- Das Geografielabor enthält jetzt die Schaltfläche
  **„Echtes Terrainmaterial-PNG testen (unvollständig)“** und
  optional eine WorldTile-ID. Ohne ID wird die mittlere belegte
  Kachel aus dem 512er-Renderplan benutzt. Der Export ist eine
  einzelne tatsächlich generierte PNG, keine bloße JSON-Planung.
- Der Material-Renderer fordert **schreibgeschützt**
  `GET /api/terrain-catalog` und `GET /api/assets` vom
  lokalen Asset-Labor-Server an. Er wählt unter den dort
  *wirklich zugeordneten* Bodenvarianten mit demselben
  absoluten `hash(q,r,11)` wie `app.js`; nur für Dschungel
  gilt die bereits im Editor vorhandene Waldboden-Ersatzregel.
  Fehlende Terrainmaterialien oder kaputte Bilder werden
  **nicht** durch Grasland/Flachfarben ersetzt.
- Nur die benötigten Texturen der angefragten Kachel werden
  dekodiert. `VedrasAutotile.build()` erzeugt den
  Materialausschnitt auf 512er-Weltkachel mit 128 Einheiten
  Quellpadding; die 2,5×-PNG ist auf die bestehende
  0,85-Y-Projektion und das 3er-Ground-Gutter ausgerichtet.
  Bilddimension **1295 × 1101 Pixel**.
- Die Ergebnisdaten tragen zwingend
  `stage:"material-only-preview"`, `complete:false` und
  `readyForViewer:false`; die Probekachel kann **nicht**
  in die vollständigen Bake-Receipts des Runners oder den
  Spielkartenviewer gelangen. Dies ist ein belastbarer Test
  des **ersten tatsächlichen Renderabschnitts ohne den Editor**,
  nicht der fertigen Spielkarte.
- **Neu: Vollständigkeits-Check des Live-Terrain-Katalogs** im
  Geografielabor („Originalmaterialien für gesamte Welt prüfen“).
  Er betrachtet jeden der tatsächlich vorkommenden Terrain-Typen und
  meldet fehlende Typen mitsamt Anzahl ihrer Hexfelder. Er ist eine
  Vorprüfung **nur für Grundmaterialien**, keine Garantie für einen
  fertigen 4×-Atlas.
  Im zuletzt geprüften `assets/terrain/terrain_catalog.json` auf
  `main` fehlen direkte Zuweisungen für `sandy_desert` und
  `jungle`. Für `jungle` ist die bestehende, ausdrücklich
  zulässige `forest_floor`-Ersatzregel hinterlegt; dagegen sind
  die **131 `sandy_desert`-Hexe** im kalibrierten 95×75-Mix
  tatsächlich **blockiert**. Ohne neue originale Sandwüsten-Textur
  und bewusste Katalog-Zuordnung darf der finale Bake nicht
  erfolgreich melden. Das Audit ändert **keine** Zuweisungen.
- Noch **nicht** im direkten Materialtest: Relief,
  Küstengrafiken, Flüsse und Flussufer, Walddecke,
  Berge/Natur/Schatten sowie 4×-Vollqualität. Insbesondere
  eine andere Bodenvariante oder eine manuelle
  Editorkatalog-Zuweisung kann die Bildgleichheit beeinflussen;
  die erste Abnahme testet zunächst Materialquellen, Renderzeit,
  Pixelkoordinaten und sichtbare Teilkachelgrenzen.
- Tests `tests/test_large_map_material_preview_20261122.cjs`
  prüfen Echtkatalog-Zuweisung, Seed-/Koordinatenwahl,
  Autotile-Aufruf, projizierte Pixelgröße, Incomplete-Flag,
  Negativfälle und Skript-/UI-Verkabelung.

**Bedienung:** Asset-Labor lokal über `START_WINDOWS.bat`
starten, `/geography-lab.html` im selben Origin öffnen,
Welt erstellen, unten **„Echtes Terrainmaterial-PNG testen
(unvollständig)“** wählen und das exportierte PNG prüfen.
Die bisherige Editor-Testszene, IndexedDB und bereits
gespeicherte Spielkarten bleiben unverändert.

## Phase 2.2 – Sektorarchiv aus geprüften Bildkacheln

`large-map-bake-export.js` kann nach der noch ausstehenden
vollständigen 4×-Renderstufe die **tatsächlich gespeicherten**
Ground-/Scenery-Paare über `VedrasLargeMapBakeRunner.validateReceipt()`
nochmals prüfen und kleine **ZIP32-Sektorarchive** erzeugen.
Es benutzt die bestehende ZIP-Routine
`VedrasFrozenMapPackage.zipEntries()` (CRC32/STORE).
Standardmäßig umfasst ein Sektor **16 Bildkacheln**,
maximal 32, mit einem Sicherheitsbudget von 512 MiB pro ZIP.

- Jeder Sektor trägt Rasterdateien und ein `manifest.json`
  mit WorldTile-ID, Bilddimensionen, PNG-SHA-256,
  Renderer-/Assetversion, dem eigenen Anteil der
  **originalen geografischen Hexdaten** und berührten
  Flussrouten. Hexe werden genau einem Sektor anhand ihres
  globalen 512er-Owners zugeordnet, nicht per Editor-Zentrum.
- Der `audit()`-Durchlauf unterscheidet vorhandene, fehlende
  und hash-ungültige PNG-Paare. Ein Sektor mit auch nur
  einer fehlenden/korrupten Kachel wird nicht exportiert.
  Testbar ohne Editor oder große Bildarchive.
- `exportCollectionIndex()` erstellt nur nach
  vollständigem Receipt-Audit einen geografischen Index mit
  Original-Seed, Konfiguration, gesamter semantischer
  Welt sowie der erwarteten Sektorliste. Er behauptet
  ausdrücklich **nicht**, dass alle Sektor-ZIPs schon
  erstellt oder heruntergeladen wurden.
- Formatkennungen:
  `vedras-geography-bake-sector-v1` und
  `vedras-geography-bake-collection-v1`.
  Auch geprüfte Sektoren tragen **`readyForViewer:false`**.
  Ein Sektor-Importer und der zugehörige Laufzeit-
  Streaming-Index für den bestehenden Frozen-Viewer
  sind **noch nicht implementiert**.
- Die Funktion arbeitet nur **lesend** auf dem separaten
  experimentellen Receipt-Speicher. Keine Änderung
  vorhandener Frozen-Map-ZIPs, IndexedDB-Rekords,
  Original-Szene oder des Asset-Katalogs.

Für die 95×75-Referenzwelt wären bei 1.678 Kacheln
**105 Sektoren** à maximal 16 Kacheln vorgesehen.
Dies ist eine **geplante** Anzahl – noch keine
tatsächlich erstellten Kartenbilder.

## Phase 2 – Renderer-Adapter, erster echter Grafiktest

1. Einen **Offscreen-Raster-Adapter** aus den vorhandenen
   `app.js`-Funktionen `bakeWorldTile`, `freeze4xGroundSources`,
   `frozenPrepare4xSourceQueues`, der Terrain-/Wasser-/River-
   Rasterquelle und dem Nature-/Berg-Renderer ableiten. Abhängigkeiten
   von `state.sceneSize`, interaktiver Kamera und `worldCells`
   in eine übergebene **BakingContext**-Schnittstelle verschieben.
   Kleine Editor-Nutzung muss weiter unverändert funktionieren.
2. Je Renderjob nur Zellen innerhalb Tile **plus Halo** laden,
   den Ausschnitt als **absolute Q/R-Welt** interpretieren.
   Relative Editor-Zuordnungen nicht blind kopieren; Origin-Mapping
   sauber definieren. Alle erforderlichen Assets vor dem einzelnen
   Bake prüfen. Originalquellen können wiederverwendet werden,
   aber kein Neuzeichnen aller 7.125 Hexe pro Tile.
3. Renderer-Aufruf `renderTile(context, tile, quality)` →
   `{tileId,level,groundPNG,sceneryPNG,revision,complete:true}`.
   PNG-Erzeugung/Pixelgröße und Padding muss zur Frozen-Runtime
   passen. Zunächst **37/397-Hex-Referenz** als exakter Bildvergleich
   gegen die Editor-Tour. Unfertige Jobs und fehlende Quellen
   explizit protokollieren.
4. Erst anschließend 95×75 auf **Near-Qualität** versuchen;
   zu Testzwecken kann Mid/1× vorher laufen, aber nicht als
   angebliche endgültige Near-Karte publizieren.

## Phase 3 – Persistenz, Resume, Veröffentlichung

- Eigener nicht-destruktiver Job-/Kachelstore, höchstens wenige
  aktive PNG-Canvas/Decoded Assets gleichzeitig; nach jeder
  vollständig geprüften Tile beide PNGs persistieren und RAM freigeben.
- Abbruch und Resume überspringen ausschließlich tatsächlich
  nachgewiesene, zur identischen Welt- und Rendererrevision
  passende Tiles. Ein Planer-Batch/JSON alleine berechtigt
  **nicht** zum Überspringen.
- Fortschritt: erwartete, vollständig verifizierte, ausstehende,
  fehlgeschlagene und ausdrücklich abgebrochene Kacheln,
  gespeicherte Bytes, Peak-RAM, Backzeit sowie sichtbare Naht-Diagnosen.
- Bei Vollständigkeit Originalformate des Frozen-Viewers einhalten.
  Für sehr große Karten ZIP32-Grenze (4 GiB, 65.535 Einträge),
  Browser-Quota und 32-MiB-Manifestlimit beachten: bei Bedarf
  **Sektorarchive** mit globalem Index statt einem riesigen
  ZIP in einem RAM-Blob. Keine ungetestete ZIP64-Annahme.
- Finales Atlas-Paket kann im separaten
  `frozen-map-game.html` aus ZIP/Store geladen werden.
  Optionaler Rückweg in Asset-Labor: einzelne Sektoren
  oder ein bestätigter, begrenzter Editier-Ausschnitt.

## Abnahme und Nicht-Ziele

| Gate | Nachweis |
|---|---|
| P1 read-only | 95×75 = 1.678 Tiles; `chunks.js`-Parität, 57.600 Zellen ohne Raster, kein Szenenwrite |
| P2 kleiner Referenztest | 37 und 397 Hexe: Ground/Scenery/Flüsse/Bäume/Schatten visuell und pixelbasiert gegen Editor-Bake prüfen |
| P2 großer Probelauf | 7.125 Hexe; alle Tiles vollständig; Speicherpeak, Dauer, fehlende Quellen und Kachelnaht-Fehler protokollieren |
| P3 Wiederaufnahme | Prozess mitten im Batch abbrechen, ohne eine einzige bereits vollständige Kachel oder Originalszene zu beschädigen; nur fehlende neu rendern |
| P3 fertige Karte | Neuer Atlas öffnet nach Browser-Neustart im Standalone-Viewer; Manifest, Semantik, Bild-PNGs und Export sind vollständig |
| P4 Skalierung | 15.000 und später 57.600+ Hexe mit Sektorpaketen, begrenztem Speicher, nachvollziehbaren Qualitäts-/Zeitmetriken |

**Nicht Bestandteil dieser Implementierung:** produktive
`browsergame/domain/worldgen`-Umstellung; Supabase-Migration,
Live-Multiplayer, freie Sichtbarkeit nicht erkundeter Felder,
automatisches Überschreiben privater Originalatlanten, verbindliche
Renderzeitversprechen oder fertiger 7.125-Hex-Atlas in Phase 1.

Die erste Priorität ist **ein realistischer, vollständig prüfbarer
7.125-Hex-Bake mit derselben Grafikqualität wie der bestehende
Renderer**, nicht das schnellste ungetestete Einmalbild.
