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

## Phase 2.3 – Originales geografisches 2,5D-Relief (22.11.2026)

**Neu:** Die direkte Kachelprobe des Geografielabors kann optional
die **Hügelgeometrie aus dem vorhandenen
`VedrasRelief.make()`** zeichnen. Aktivierung über
„Hügelrelief mit Originalrenderer“ bei der Material-PNG-Probe.

- `large-map-bake-ground-relief.js` berechnet dieselben
  geografischen Hügelparameter aus `reliefClass='hills'`,
  `hillProfile`, `hillStrength`, absoluten Q/R und dem
  Default-Reliefseed 43781. Die Küsten-Landmaske nutzt
  die `VedrasAutotile.hexAt()`-Zuordnung und die
  `materialClass='water'`-Deklarationen aus dem
  aktuellen Terrainkatalog. Wie im normalen
  `drawGround()` werden **Wasser-Layer zuerst flach** und
  der 2,5D-**Land-Layer danach erhöht** ausgegeben.
  Andere Grafikfunktionen werden nicht nachgebaut.
- Weil `geoHeight()` Hügel in einem Umkreis bis zu drei
  Hex-Schritten berücksichtigt, erweitert
  `large-map-bake-source.js` auf Wunsch den
  Quell-Halo pro Tile von 470 auf **1.280 Welteinheiten**.
  Die reguläre Planungs-/Grundterrain-Geometrie,
  die default-470er-Chunks und ihre Keys bleiben
  unverändert. Der Zusatzbereich ist auf maximal
  2.048 Einheiten beschränkt.
- Die Benutzeroberfläche exportiert entweder die
  bisherige **`material-only-preview`** oder die neue
  **`material-relief-preview`**. Beide sind
  `complete:false`, `readyForViewer:false`.
  Nur der Quellbereich der aktiven Kachel wird benötigt.
- **Wichtig:** Hier handelt es sich weiterhin um eine
  **Ground-Probe mit 2,5×-Materialauflösung und
  1295×1101 Ausgabepixeln**, nicht um eine fertige
  4×-Ground-/Scenery-Kachel. Die originale
  `VedrasAutotile.build()`-Rasterdichte ist
  auf höchstens 3× und begrenzte Pixelbudgets
  ausgelegt; ein späteres einfaches Hochskalieren
  auf 4× wäre kein echter 4×-Quellrender.
  Ungeprüft sind die exakte Pixelparität zur
  Offline-Editor-Tour, Uferartwork, Flussufer/
  Flusswasser, Waldboden, Natur, Bergobjekte,
  Schatten und Sektorimport im Viewer.

**Neue Tests:** 1.280er-Neighbor-Parität mit
`chunks.js`, unveränderte Default-Quellen,
Terrain-/Wasser-Maske, originale
`VedrasRelief.make()`-Reihenfolge und
korrekte `complete:false`-Ausgabe.

## Phase 2.4 – Originale sechsseitige Ufergrafiken (Fortsetzung)

**Neu:** Die direkte Ground-Probe kann die sechs vorhandenen
`assets/shorelines/shore_v105_edge_01.png` bis
`shore_v105_edge_06.png` über den **bestehenden**
`VedrasShoreline.segments()/build()`-Compositor ausgeben.
Dazu gibt es den Schalter **„Original-Ufergrafiken“** in
`geography-lab.html`.

- `large-map-bake-shoreline.js` bestimmt Ufergrenzen allein aus
  echten axialen Land-/Wasser-Nachbarn. Er nutzt ausschließlich
  die `materialClass: water`-Werte des aktuellen Terrainkatalogs,
  keine eigens erfundenen Farbflächen oder gezeichneten
  Ersatzlinien. Benötigte Original-PNG-Seiten werden dekodiert
  und geprüft. Fehlt eine einzige für die Kachel benötigte
  Seite, **bricht der Export mit Fehlermeldung ab**.
- Für Sprites, die über die 512er-WorldTile hinausragen,
  steht ein **768er Source-Halo** zur Verfügung (der
  reguläre Ground-Plan behält 470, Relief 1.280).
  Die originale Ufer-Rasterdichte ist 1,5× und wird
  in die bestehende 2,5×-Near-Ground-Kachel
  nach Gelände und optionalem erhöhten Land gemischt.
  Die Kachelposition bleibt absolut; keine
  lokal rezentrierten Q/R-Koordinaten.
- Die **vollen Flussrouten** der geografischen Welt
  werden vorab mit `VedrasRivers.valid()` geprüft.
  Die originalen Mündungspositionen kommen aus
  `VedrasRivers.mouthPortals()` auf der kompletten Welt,
  nicht aus gekappten Tile-Routen.
  Beim jetzigen Küsten-Test werden Mündungsöffnungen
  bewusst **noch nicht aus den Ufergrafiken ausgeschnitten**,
  da das echte Flusswasser in der Probe noch nicht gezeichnet
  wird. So fehlen an Küsten keine Bildteile. Die
  Mündungspositionen bleiben als
  `riverMouthPortalsDeferred` dokumentiert und müssen
  im späteren Original-Fluss-Layer mit Uferöffnung
  gemeinsam aktiviert werden.
- `large-map-bake-material-preview.js` stellt jetzt vier
  kombinierbare Teil-Proben bereit: Material,
  Material+Relief, Material+Küste, Material+Relief+Küste.
  Die letzten beiden heißen
  `material-shoreline-preview` bzw.
  `material-relief-shoreline-preview`.
  Alle bleiben **`complete:false`** und
  **`readyForViewer:false`**; der endgültige 4×-
  Bake-Runner akzeptiert sie ausdrücklich nicht.
- Neue Tests `tests/test_large_map_bake_shoreline_20261122.cjs`
  prüfen Referenzwelt, gültige Flüsse, globale Mündungen,
  Original-Seitenauswahl, notwendige Quellgrafiken,
  Fehlerfälle, UI-Verkabelung und Nicht-Fertig-Markierung.
  Es gibt noch **keinen abgenommenen Pixelvergleich**
  mit einer exportierten 397-Hex-Editor-Küstenkarte.

**Nächster Bauabschnitt:** das bestehende Flusswasser und
die Flussufer als eine gemeinsame Ground-Stufe mit
Mündungsöffnungen in der Küste zeichnen;
danach Waldboden, Natur, Berge, Schatten/Scenery und
tatsächliche 4×-Quellqualität. Der echte
Firefox-Großkarten-Bildtest ist separat erforderlich.

## Phase 2.5 – Originales Flusswasser und Flussufer

**Neu:** Die direkte Kachelprobe ruft nun die zwei **bestehenden**
Asset-Labor-Renderer `VedrasRivers.render()` für texturiertes
Flusswasser und `VedrasRiverBanks.prepare()/render()` für die
polygonal geformten Uferwände auf. Kein neu erfundener
Flussmaler. Aktivierung im Geografielabor über
**„Original-Flusswasser und Flussufer“**.

- `large-map-bake-rivers.js` validiert sämtliche geografischen
  Flussrouten **gegen ihre vollständigen absoluten Q/R-Wege**
  und berechnet ihre realen Kantenkurven und Mündungen **einmal
  pro Welt**, nicht aus lokal abgeschnittenen Flussabschnitten.
  Pro WorldTile werden nur geometrisch relevante Flüsse und
  die dazu benötigten Original-Wassertexturen geladen. Fehlt
  eine Original-Wassertextur, wird die Probekachel verweigert;
  der vorhandene Farb-Fallback in `VedrasRivers.render()`
  wird dadurch im direkten Export nicht benutzt.
- Der Uferbank-Renderer zeichnet **zuerst** seine
  transparenten Uferwände; danach zeichnet
  `VedrasRivers.render()` das texturierte Flusswasser,
  entsprechend dem Editor. Der 1.280er Source-Halo
  und optional die bestehende `VedrasRelief.at()`-
  Höhenprojektion kommen ohne Szenenzentrierung aus.
- `large-map-bake-shoreline.js` öffnet die Original-Ufergrafiken
  bei den vollständig berechneten Flussmündungen **erst
  dann**, wenn gleichzeitig die originale Flusswasser-
  Zeichenstufe aktiv ist. Ohne Flusswasser bleiben Ufer
  geschlossen; Löcher im Strand werden vermieden.
- Neue Ergebnisstufe `original-river-ground-preview`,
  stets `complete:false` und `readyForViewer:false`,
  mit sichtbaren Zählern für Original-Flussläufe,
  Uferwandschichten, Wassertexturen und geöffnete
  Mündungen. **Noch keine vollständige Spielkarte.**
- Tests `tests/test_large_map_bake_rivers_20261122.cjs`
  überprüfen die zehn realen Flussrouten, absolute
  Kurven, Auswahl, Zeichenreihenfolge, Asset-Gates,
  Fehlerfälle und UI-/Modulverkabelung.

**Performance-Fortsetzung:** `river.js` erhält eine
**optionale `render(...,{bounds})`-Schnittstelle**.
Sie berechnet weiterhin die **vollständige, identische
Fluss-/Ecken-/Mündungsgeometrie**, beschränkt aber
Canvas, Masken, Bilddaten und Originalwasser-Texturing
auf die benötigte WorldTile-Region (mit 128er Padding).
Die Pixelursprünge sind auf ein **globales
Weltkoordinatenraster** ausgerichtet, um sichtbare
Nahtverschiebungen zu verhindern. Ohne `bounds`
bleibt der alte Editor-Aufruf unverändert. Die neue
Kachelquelle selektiert darüber hinaus die
tatsächlich vorbeiführenden Kurvensegmente statt
jedes Tile innerhalb einer riesigen Fluss-Bounding-Box
zu rendern. Ein separater Node-Test prüft
vollständige Routen-/Mündungsparität, begrenzte
Canvasgröße, identisches Pixelraster zweier
benachbarter Ausschnitte und frühe Rückgabe bei
leeren Bereichen.

**Offene Risiken:** Die Originalroute wird weiterhin
je relevanter WorldTile geometrisch verarbeitet und
Uferfarben werden im lokalen Kontext abgetastet.
Eine echte Pixel-/Naht-Abnahme im Firefox mit
Originalwasser-PNG ist **noch nicht durchgeführt**.
Längere Vollwelten erfordern Benchmark/Limitierung
der Gesamt-Canvas-/RAM-Zeit. Ferner fehlen
Waldboden, Natur-/Bergobjekte, Schatten,
die finale 4×-Quelldichte und Sektorimport.

## Phase 2.6 – Originaler Waldboden aus globalen Waldregionen

Die direkte Geografie-Kachelprobe verwendet jetzt
`VedrasForest.generate()` und
`VedrasForestGround.build()` für echte, originaltexturierte
Waldbodenmasken. Keine zweite Wald-Malroutine.

- Die 7.125 Waldklassen des Referenz-Weltgenerators bleiben
  authoritativ, einschließlich der Klasse `none`. Bei
  vollständigen Geo-Overrides ist die synthetische Grove-
  Ausbreitung unnötig; `coverage:0` überspringt sie,
  während Original-Logik für Randbäume, Dichte und global
  deterministische Lichtungen weiterhin läuft.
- Die ganze Welt wird **einmal** für Waldregionen,
  Lichtungen und gemeinsame Regionsdeckkraft ausgewertet.
  Kachelweise Builds verwenden diesen globalen Deckkraftwert,
  damit ein großer Wald nicht je WorldTile anders transparent ist.
  Dschungel, Schnee und gefrorene Tundra werden wie im
  bisherigen Editor von der normalen Waldbodenmaske ausgenommen.
- `forest-ground.js` bekommt ausschließlich für neue Aufrufer
  zwei **optionale** Parameter `bounds` (global
  ausgerichtete Rasterpixelschnitte) und
  `regionOpacityOf` (globale Regionsdeckkraft).
  Bei beiden nicht gesetzten Parametern bleibt der
  alte Editorpfad unverändert. Das Raster ist auf
  **768×768 Welteinheiten plus weiches Maskenpadding**
  und 1,4× Detaildichte begrenzt, nicht auf 60.000
  Hexfelder in einem riesigen Canvas.
- Die reale Ground-Zeichenfolge ist nun Terrain,
  optionales Relief, **Original-Waldboden**,
  Küsten und danach Flussufer/-wasser. Genau wie
  im Editor wird das Waldüberlagerungsbild nur
  auf die **äußere Welt-Silhouette** beschnitten,
  nicht auf harte Schnee-/Waldgrenzen.
- Neues Geography-Lab-UI: Checkbox **Original-Waldboden**.
  Die `original-forest-ground-preview` bleibt
  `complete:false` und `readyForViewer:false` –
  weiterhin fehlen Nature-/Scenery-Objekte,
  Berge und Schatten.
- Tests: reine Geography-Adapter- und
  Originalrenderer-Verträge sowie erweiterter
  echter Firefox-Pixeltest auf die Nachbar-WorldTile-
  Texturübergänge mit `wald_03.png`.

**Noch offen:** pixelgenaue 37/397-Hex-Referenz,
große 4×-Quellauflösung, Nature-/Mountain-/Shadow-
Scenery, speicherschonender 7.125-Hex-Langlauf
und Sektor-Import in den Spielviewer.

## Phase 2.7 – Weltweiter Original-Bergplatzierungsplan und PNG-Teilprobe

`large-map-bake-scenery-source.js` berechnet die
Gebirgskomponenten auf den **absoluten geografischen
Q/R-Koordinaten**. Die Platzierung verwendet
`VedrasMountains.candidate()` und
`VedrasNatureCatalog.mountainAllowed()`,
die originale `autoGeoMountains`-Seedmischung (12345)
sowie ausschließlich tatsächlich gelistete
Originalgrafiken aus dem Live-Nature-Katalog.

Die derzeitige Referenzwelt enthält **346
geografische Berghexe**, gruppiert in **sieben**
Gebirgsregionen. Auf Grundlage der aktuell
vorliegenden **21 Original-Berggrafiken**
werden **275 Platzierungen** geplant; 71 Hexe bleiben
wegen Habitat-/Kollisionsregeln unbelegt.
Diese Zahlen sind ein **Plaungsergebnis**, kein
versprochenes vollständiges Gebirge.
**Alle 21 Quellen tragen derzeit
`artStatus:'candidate'`**.

`large-map-bake-mountain-png.js` erzeugt daneben
aus dekodierten Original-Berg-PNGs eine **separate
transparente Scenery-Testkachel**. Der Ausschnitt
wird an globalen Weltkoordinaten ausgerichtet;
sichtbare Alpha-Bounds und die vorhandene
`0.965`/ `0.012`-Spriteperspektive des Editors
werden verwendet. Das Geografielabor bietet
zwei neue Aktionen: **Original-Bergplatzierungen
prüfen** und **Original-Berg-Scenery-PNG testen**.
Die Probe kann zusammen mit einer Ground-PNG
sichtgeprüft werden, ist aber **nicht** als
fertige Scenery integrierbar.

Der Testpfad ist streng von produktiven Atlas-Kacheln
isoliert: `rasterized:false` im Platzierungsplan,
`complete:false`/`readyForViewer:false` in
beiden Ausgabeformen. **Noch nicht eingebunden:**
visuell verifizierte Berg-Silhouettenkollisionen,
klassische Nature-Baum-/Strauchverteilung,
Flächenreservierung für Berge, originale
Nature-/Bergschatten, Terrain-Flattening,
Pixelgleichheit zur 397-Hex-Editor-Tour,
vollständige echte 4×-Scenery sowie das
statische Viewer-Sektorformat.

## Phase 2.8a – Weltweiter Original-Nature-Baumstandort-Audit

Der nächste kleine Schritt nach Phase 2.7 prüft **Originalbaumquellen**
und die **geografische Habitateignung** vor jeder tatsächlichen Platzierung.
`large-map-bake-nature-source.js` verwendet die unveränderten Originalregeln
`VedrasNatureCatalog.canPlace/effectiveTypes`,
`VedrasForest.treeTarget/maxObjects/preferredFamily`,
`VedrasNatureBalance.reserveClearings/isCanopy`,
`VedrasPolish.patch` und `VedrasMountains.occupied`.
Die autoritativen geografischen Waldklassen und originalen Nature-PNG-Dateien
bleiben Voraussetzung. Einzige neue Grenze: **maximal 10.000 Hexe** für diese
vorläufige Quotenprüfung, da die editorseitige globale Reservierung noch nicht
für größere Welten optimiert wurde.

Im Geografielabor: **„Original-Baumstandorte prüfen (unvollständig)”**.
Die Ausgabe zählt geeignete Baumquellen, theoretische Zielquoten,
fehlende Quellen, reservierte Bauflächen und Berge.
**Noch keine tatsächlich platzierten Bäume:** lokale `localOffset`-Versuche,
Stammabstände, Fluss-/Straßen-Sperren, die übrige Nature-Verteilung,
Originalschatten, Silhouetten- und Editor-Pixelvergleich folgen.
`rasterized:false`, `complete:false`, `readyForViewer:false`;
kein Schreibzugriff auf bestehende Atlanten oder Editordaten.

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

### Phase 2.8b – deterministische Original-Baumstämme (22.11.2026)

- `large-map-bake-nature-trunks.js` erzeugt **reale Q/R-basierte Stammanker** mit `dx`, `dy`, `scale` und physischem Original-Assetpfad. Voraussetzung sind der unveränderte Nature-Standort-Audit und derselbe Bergplan. Baumarten und Standorte werden auf einen stabilen globalen Durchlauf sortiert.
- Der reine Baumdurchlauf ruft `VedrasPolish.localOffset` (72 Versuche), `VedrasForest.inGlade`, `VedrasNatureCatalog.canPlace`, `VedrasNatureBalance.placementScale` für Stammabstände innerhalb eines 2-Hex-Halos, `VedrasRivers.blocksPoint` für vollständige geografische Flussrouten und `VedrasRoads.blocksPoint` für vorhandene Straßen auf. Bergkerne und `reserveClearings` sind ausgeschlossen. Keine erfundenen Ersatzgrafiken.
- Im Geografielabor kann **„Original-Baumstämme platzieren und JSON exportieren (unvollständig)“** reale Anker, Ablehnungszähler und Qualitäts-Gates als JSON ausgeben. Die Generatorgeografie enthält **keine Straßen**: Der Report weist daher 0 Straßenkanten aus, das Original-Straßengate prüft sie bei späterer vorhandener Eingabe dennoch.
- **Paritätsgrenze:** Dies ist nur die erste Baumstamm-Passage, **nicht** das vollständige `nature-ui.populate()`. Zuvor gesetzte Findlinge, Schnee, Akzente, Sträucher und von tatsächlich dekodierten PNG-Kronen abhängige Zusatzbelegung werden noch nicht übernommen. Eine vollständige Instanzgleichheit zum Editor wird nicht behauptet.
- Stets `rasterized:false`, `complete:false`, `readyForViewer:false`; keinerlei Änderungen an vorhandenen Karten, Originalgrafiken oder dem Spielviewer.
- **Phase 2.8c:** Original-Baum-PNGs dekodieren, transparente Scenery-Teil-PNGs mit Pixelüberhang rendern, die visuelle Stamm-/Kronenparität gegen den Editor prüfen; anschließend weitere Nature-Typen und Schatten.


### Phase 2.8c – transparente Original-Baum-PNG-Probe (23.11.2026)

- `large-map-bake-tree-png.js`: **eigene transparente Baum-Scenery-Teilprobe** aus dem globalen Baumstammplan 2.8b. Physisch in `/api/assets` gelistete originale PNGs werden **vor** dem Zeichnen geladen; Dekodierungsfehler oder vollständig transparente Dateien brechen ab. Keine Fakegrafiken und keine Änderungen an gespeicherten Atlanten.
- Bild- und Größenpfad wie beim Editor: Original-`visibleBounds` (Alpha > 12, 256er Downsample), `VedrasSpritePlanner.visualWidth`, `VedrasNatureBalance.sizeFactor`, `VedrasPolish.natureFilter`, originaler Fußanker und `objectPerspective` (Shear 0.012, Vertikalskalierung 0.965). Globale Q/R-Koordinaten plus Stammoffsets aus 2.8b bleiben stabil; 512er Weltkacheln werden mit 128er überhängender Alphazone ausgegeben.
- **2,5×/0,85-Projektion** (1.920×1.632 Pixel mit 128 Welt-Einheiten Rand): 512 Welt-Einheiten ergeben genau **1.280 horizontale bzw. 1.088 vertikale Pixel** pro Nachbarkachel. So kann ein tatsächlicher, PNG-basierter Pixelnahttest auf derselben globalen Sampling-Lattice erfolgen. Kein falsches 4×-Qualitätsversprechen.
- Vorberechnete 512er Bucket-Indizes begrenzen die Kandidatensuche je Kachel, statt für jede der 1.678 Kacheln die weltweite Baumliste zu durchsuchen. Originalgrafiken werden nur für die relevante Kachelumgebung dekodiert; ein Dateifehler führt nicht zum stillen Ersatz.
- Geografielabor: **„Original-Baum-Scenery-PNG testen (unvollständig)“**. Ausgabe ist eine separate, originale, transparente 2,5×-PNG; kein Merge in Editor, bestehendes Terrain, Spielviewer oder WorldTile-Receipt. `rasterized:true` bezieht sich **nur** auf diese Teilprobe; `complete:false` und `readyForViewer:false` bleiben invariant.
- Weiter offen: tatsächliche Kronendeckungs-Quoten und vollständige Editor-Nature-Reihenfolge, Bäume-gegen-Berge-Silhouettenkollision, Schatten (auch Bergschatten), Sträucher/Findlinge/Schnee, 4×-Produktionsqualität und ein 7.125-Hex-Vollatlas. Nachfolgend sind Pixelvergleich/visuelle Kontrolle und Kombinationslayer sicherzustellen.


### Phase 2.8d – bildbasierter Editor-Kronendeckungsproxy (23.11.2026)

- `large-map-bake-canopy-audit.js` prüft die **tatsächlichen originalen PNG-Bildabmessungen** der bereits platzierten Baumstämme gegen die unveränderte `nature-ui.populate()`-Kronendeckungsformel: `0.72 × (SpritePlanner.visualWidth × NatureBalance.sizeFactor)² / Hexfläche × Instanzskalierung²`. Der originalgetreue Alpha-Zuschnitt und die Normierungsfunktion werden wiederverwendet. Es handelt sich **nicht** um eine direkte Kronenpixelmaske, sondern ausdrücklich um den existierenden Editor-Proxy.
- Der Audit arbeitet **pro WorldTile** und prüft nur dessen Standortzellen: Ziel-Baumslots, tatsächliche Stammzahl, `forest.canopyCoverage`, `forest.maxObjects` und die geschätzte Restkapazität **ohne** reservierte Felsen/Bauten. Der lokale Audit lädt nur jene Original-PNGs, die für diese Zellen gebraucht werden, und ersetzt fehlende Grafiken niemals durch Platzhalter.
- Im Geografielabor steht die Aktion **„Original-Baumkronendeckung gegen Editor-Proxy prüfen (unvollständig)”** bereit. Fehlende Baumslots und unzureichender Kronen-Proxy werden sichtbar, statt unkontrolliert Bäume nachzupflanzen.
- **Wichtig:** Das vollständige Editor-`populate()` setzt Findlinge vor die Kronen-Erweiterung, kann anschließend bis `objectCap-2` zusätzliche Bäume platzieren und enthält noch viele andere Nature- und Schattenpässe. Der Audit verändert keine Positionen und erlaubt keinen voreiligen Übergang zur finalen Scenery. `rasterized:false`, `complete:false`, `readyForViewer:false`.
- Nachfolge: kontrollierte zusätzliche Kronenpassage mit Originalregeln; Bäume und Berge im gemeinsamen Sortier-/Alpha-Szenenpass; echte Editor-Sichtprüfung und später Schatten.


### Phase 2.8e – gemeinsame Baum-/Berg-Scenery-Testkachel (23.11.2026)

- `large-map-bake-joint-scenery.js` dekodiert **Original-Nature-PNGs für Bäume und Berge in einem Raster**. Bisherige separate Baum- und Bergproben werden **nicht** nachträglich zusammengesetzt; sonst wären Zeichenreihenfolge, Relief und ihre unterschiedlichen Auflösungen falsch.
- Ein einziges global ausgerichtetes Weltpixelgitter: 512 Welt-Einheiten = exakt 1.280 horizontale und 1.088 vertikale Pixel bei `SCALE=2.5`, `PROJECT_Y=.85`, plus 128 Welt-Einheiten Alpha-Überhang. Beide Typen verwenden originalen Alphazuschnitt, Kataloganker, `VedrasPolish.natureFilter` und die originale 0.012/0.965-Perspektive. Keine Ersatzgrafiken oder Schreibzugriffe auf alte Atlanten.
- `VedrasLargeMapBakeGroundRelief.createOptions` stellt das kontinuierliche **Original-Geografierelief** bereit. Original-Bergketten werden mit `VedrasMountains.chainGroups` gruppiert; pro Kette wird die Original-`relief.rawAt`-Referenzhöhe ermittelt und werden die gleichen kompakten, geglätteten Fundament-Pads wie in `app.js.currentRelief` angelegt. Für jede globale Spritefußposition werden nur lokal wirksame Pads übergeben, damit das im Originalrenderer vorhandene 60-Pad-Limit nicht entferntere Ketten abschneidet und benachbarte Tiles konsistent bleiben. Ein nicht darstellbarer Überlappungsfall scheitert kontrolliert.
- **Original-Verdeckung:** Für jeden sichtbaren Baum-Berg-Kandidaten testet der Renderer wie `app.js.mountainCoversBase` den reliefkorrigierten Baumfuß in der 64×64-Alpha-Maske des Bergs (Alpha > 50). Trifft der Fuß die Silhouette, wird der Baum vor dem Berg gezeichnet – er wird **nicht** aus der Welt entfernt. Angezeigt werden geprüfte und verdeckte Baum-Berg-Paare.
- Im Geografielabor: **„Bäume und Berge gemeinsam als Original-PNG testen (unvollständig)”** mit separatem transparentem PNG-Download einer einzelnen WorldTile-Kachel. Zwei spezielle Prüfpfade: fokussierte Node-Kontrakte und ein echter Firefox-Test mit `birke1.png` plus `berg_01.png`, einschließlich übereinstimmender Pixel über eine gemeinsame Kachelnaht.

- **Pixelnaht-Korrektur:** Ein einzelnes Canvas2D-Rendering direkt in verschiedene WorldTile-Canvas kann die Original-Nature-Alpha-PNGs trotz rechnerisch identischem globalen 2,5×-Raster um wenige Farbwerte unterschiedlich abtasten. Die gemeinsame Probe zeichnet deshalb jeden Baum/Berg zuerst in ein begrenztes, auf **ganzzahlige globale Zielpixel** ausgerichtetes Sprite-Zwischenraster (wiederverwendeter Offscreen-Canvas) und überträgt diese Pixel anschließend 1:1 mit ganzzahligen Koordinaten in die WorldTiles. Der Sprite-Fuß, die Perspektive, der originale Alpha-Zuschnitt und die Tiefe bleiben unverändert. Ein lokaler reproduzierbarer Firefox-unabhängiger Test mit synthetischen Alpha-Sprites ergab dadurch 0 statt 75 unterschiedlicher Vergleichspixel; der Test mit echten Nature-PNGs muss dies separat bestätigen.
- **Noch offen:** Vollständige Editor-Nature-Population, weitere Kronenpassagen, warmes Findlings-Prepass, Büsche/Schnee/Totholz, Berg-Berg-Überlappung und Bildparität bei 37/397 Hexen, Relief-/Sprite-Mountain-Casts, vollständige 4×-Scenery, persistenter Kachelstore und Spielviewer. Die hier gerenderte Probe bleibt `rasterized:true`, `complete:false`, `readyForViewer:false`.


### Phase 2.8e – direkt ausführbare WorldTile-Pixelnahtkontrolle

- `large-map-bake-scenery-seam.js` prüft zwei **unabhängig erzeugte** transparente 2,5×-Baum-/Bergkacheln auf tatsächlich identische RGBA-Pixel. Für horizontale Nachbarn sind dies 640×1.632 Pixel, für vertikale 1.920×544 Pixel. Die Prüfroutine dekodiert beide echten PNG-Blob-Daten, liest Pixel mit Canvas2D und ermittelt abweichende Pixel, maximale Kanaldifferenz und die ersten acht Abweichungen.
- `passesPixelIdentity` setzt **sowohl** null unterschiedliche Pixel **als auch mindestens einen bemalten Pixel** in der Überlappung voraus; ein vollständig transparentes Paar kann somit keinen Schein-Erfolg auslösen. Ein anderer Welt-Fingerprint, beschädigte PNGs, falsche Kacheln und künstlich als fertig markierte Ausgaben werden abgelehnt.
- Geografielabor: **„Pixelnaht zweier Original-Baum-/Bergkacheln exakt prüfen”**. Gewählte WorldTile-ID oder geeigneter Nachbar aus dem vorhandenen Renderplan; keine Änderung an Editor, Viewer oder Atlanten. Der Statusbericht unterscheidet ausdrücklich erfolgreiche RGBA-Parität von nicht bewiesenen Gesamtqualitäten.
- Die Firefox-Regression verwendet denselben Prüfer zusätzlich zum bisherigen manuellen Originalbildvergleich. Die gezielte Node-Suite beinhaltet Null-Differenz, Pixelstörung, vollständig transparenten Überhang, Quellversionskonflikt und beide Nachbarschaftsrichtungen.
- Die neue Nahtprüfung **ändert weder** den noch ausstehenden Original-PNG-Nachweis für den zuletzt korrigierten gemeinsamen Renderer **noch** die Freigabemerkmale `complete:false`, `readyForViewer:false`.


### Phase 2.8f – Bergketten-Bildabstände nach Originaleditor (23.11.2026)

- `large-map-bake-mountain-envelope-audit.js` dekodiert **alle tatsächlich referenzierten Berg-Original-PNGs** und übernimmt die Definition von `nature-ui.mountainGeometry`: `meta.logicalWidth` und **ungecropptes** physisches PNG-Seitenverhältnis `naturalHeight/naturalWidth` mit dem Originalanker. Damit entspricht der Test exakt der **AABB-Bildhüllenregel** von `mountain.js.screenBox/visualOverlap`, nicht einer selbst erfundenen Berg-Silhouetten-Heuristik.
- Die Bergquellen der Phase 2.7 wählen Varianten anhand der Biome, nutzen aber nicht die im Editor zusätzlich verwendeten **Bergkettenspacing-Informationen** `visualInfo` / `visualInfoOf`. Dieses Audit macht die mögliche Abweichung nun explizit messbar: Gleichketten-Bildumschlag mit `SPACING.tight=0.52`, gemeinsame Bergkerne und Überschneidungen fremder Berg-Einflusszonen. Probleme werden nur gemeldet, niemals durch stilles Verschieben oder Weglassen von Originalbergen kaschiert.
- Die Auswertung nutzt räumliche Bildhüllen-Buckets (512 Rastereinheiten), dedupliziert Paarkonflikte und begrenzt Fehlerbeispiele auf 200, ohne den tatsächlichen Konfliktzähler zu kürzen. Die Bergquelle, Nature-Katalog-Revision und alle referenzierten physischen PNGs werden vor dem Audit validiert; fehlende/unlesbare Originalbilder sind harte Fehler.
- Neue separate Geografielabor-Aktion: **„Original-Bergketten gegen Editor-Abstandsregel prüfen (unvollständig)”**. Ergebnis: globale Bergzahl, dekodierte Varianten, zu dicht stehende gleichkettige Bildumschläge, Kern-/Einflusskonflikte und nicht freigegebene candidate-Grafiken.
- **Wichtig:** Der Editor selbst verwendet für die Bergplatzierung AABB-Envelope-Geometrie. Dies ist **kein** tatsächlicher Pixel-Alpha-Überlappungstest, keine positive Bildparität der Gesamtkarte und keine fertige 4×-Scenery. `rasterized:false`, `complete:false`, `readyForViewer:false`.
- Ergänzt sind eng begrenzte Node-Vertragstests für zulässige Ketten, exakt erkannten >52%-Abstandskonflikt, Überschneidungen zwischen Ketten, doppelte Kernbelegung, harte Bild-/Katalogfehler und UI-/CI-Verdrahtung. Ein vollständiger CI- und Original-Firefox-Test auf dem aktuellen PR-HEAD ist nach wie vor offen.


### Phase 2.8g – Bergplatzierung mit echter Original-PNG-Abstandsgeometrie (23.11.2026)

- **Bisheriger Fehler:** `large-map-bake-scenery-source.js.create()` nutzt zwar `VedrasMountains.candidate()`, übergab bisher aber keine `visualInfo` und `visualInfoOf`. Damit war die vom Originaleditor geforderte `SPACING.tight=0.52`-Kettenbildregel stillschweigend deaktiviert. Der spätere Phase-2.8f-Audit erkannte die Abweichung nur nachträglich.
- Neuer **explizit bildbasierter** Pfad `SCENERY.createWithOriginalImages(...,loadImage)`: Jeder physisch gelistete, nicht als veraltet markierte Berg wird anhand seiner dekodierten originalen PNG-Dimensionen (unkomprimiertes Seitenverhältnis, Originalanker und logische Katalogbreite) vermessen. Fehlende/kaputte PNGs oder unvollständige Geometrie sind harte Fehler, nicht zu erratende Fallbackwerte. `create()` bleibt aus Kompatibilitätsgründen zunächst als markierter legacy/ohne Bildabstand-Pfad bestehen.
- `VedrasMountains.candidate` erhält nun bei der **Auswahl neuer Berginstanzen** die gemessenen `visualInfo` und `visualInfoOf`. Ein wegen der Bildhülle zu enger Berg wird durch die Originalregel nicht platziert. Relevante Zähler: `rejectedVisualSpacing`, `usesDecodedOriginalMountainSpacing`, `originalMountainImageVariants` und die schon bestehenden `unmatched`-Berghexes. Keine Änderungen der Geografiewelt, Katalogdaten, PNG-Dateien oder bestehenden Editor-Positionen.
- Das Geografielabor verwendet `await SCENERY.createWithOriginalImages()` als **gemeinsamen Ursprung sämtlicher Berg-Audit-, Nature- und Scenery-Testvorschauen**. Es ist kein fertiger Viewer und kein Publish-Vorgang. Ein unabhängiger Phase-2.8f-Audit kann nun über den bildbasierten Placementplan laufen und verbliebene Konflikte gesondert melden.
- Neue gezielte Node-Kontrakte für die deterministische Auswahl bei 64,44 % Bildhüllenüberdeckung (>52 %), den akzeptierten kleineren Berg, unabhängige Audit-Parität, fehlende/defekte Originalbilder, stabile Listenreihenfolge und die UI-Einbindung.
- **Weiterhin offen:** vollständiger 95×75-Originalbild-Pixeltest in Firefox, originale Berg-/Baumschatten, weitere Nature-Schichten und 4×-Game-Atlas. Die Bergplanung bleibt ausdrücklich `rasterized:false`, `complete:false`, `readyForViewer:false`.


### Phase 2.8h – Warme Findlinge vor der Baumquote (23.11.2026)

- `large-map-bake-warm-boulders.js` ist ein neuer **read-only** Prepass für die Original-Nature-Katalogfamilie `stones`, `kind:rock` mit `boulder_36–54`. Er nutzt `VedrasNatureBalance.isWarmBoulder/warmBoulderPool/reserveClearings/placementScale`, originale `VedrasNatureCatalog.canPlace/effectiveTypes`, `VedrasExistingAssets.canAutoPlaceInTest`, `VedrasPolish.localOffset`, Fluss-/Straßengates, 2-Hex-Nachbarschaft und den originalen Seed-Zufallsgenerator. Keine Fakebilder, keine geänderten PNGs oder Weltzellen.
- Wie in `nature-ui.populate()` sichert der Vorlauf auf einer Welt mit mindestens drei geeigneten warmen Standorten nach erfolgreichem Kollisionscheck mindestens eine warme Variante, bevor die normal gewichteten warmen Findlingschancen pro Hex bearbeitet werden.
- `large-map-bake-nature-trunks.js` akzeptiert optional den auf Welt, Seed und Katalog geprüften Findlingsplan. Er reserviert Objekt-Slots und berücksichtigt bei Baumstammkollisionen vorhandene Findlinge (für Baum–Fels-Paare der originale mindestens 0,85-Abstandsfaktor). Die bisherige Baum-only-API bleibt kompatibel.
- `large-map-bake-joint-scenery.js` prüft und rendert warme Findlinge mit den **Original-PNGs** zusammen mit Bergen und Bäumen, demselben globalen Pixelraster, Gelände-Relief und den bekannten Berg-Verdeckungsregeln. Berichte: `drawnWarmBoulders`, `testedRockMountainOcclusions`, `occludedRockMountainPairs`. Mit vorhandenem Findlingsplan ist `needsPriorBoulderPass:false`, jedoch bleiben `needsOtherBoulderPass`, `needsShrubsAndSnow` und die Originalschatten offen.
- Geografielabor: Die gemeinsame 2,5×-PNG-Vorschau berücksichtigt den warmen Findlingsvorlauf; ohne Veröffentlichung in den Viewer und ohne Atlas-Freigabe. Die nachgelagerten übrigen Felsvarianten, Sträucher, Schnee, Totholz, vollständige Kronendichte und Schatten bleiben bewusst Folgephasen.
- Geplante neue gezielte Node-Vertragstests und die Original-Firefox-Nahtprüfung müssen auf dem aktuellen PR-HEAD noch ausgeführt werden. `complete:false`, `readyForViewer:false`.


### Phase 2.8i – Gewöhnliche Original-Findlinge und Schneeflächen nach den Bäumen (23.11.2026)

- Neuer read-only Nachlauf `large-map-bake-nature-late-rock-snow.js` für **gewöhnliche** `rock/stones`-Findlinge und `ground_cover/snow`-Grafiken **nach** dem warmen Vorlauf und **nach** den gesetzten Baumstämmen, aber vor noch fehlenden Sträuchern/Totholz. Der Lauf verwendet nur Katalog-/Asset-Referenzen, nie Ersatzbilder. Alle früheren Originalanker bleiben erhalten.
- Übernimmt die im `nature-ui.populate()` verwendeten Seed-Salts **1601/1602** (gewöhnliche Findlinge) und **1643/1644** (Schnee), die Original-Felsdichte `min(0.32,maxDensity×1.15)` und Schnee-Habitatquoten `0.58` (Schneefelder/Gefrorene Tundra), `0.25` (Hochland), `0.14` (andere geeignete Biome). Wie im Editor werden gewöhnliche Felsen ausgelassen, wenn in einer Zelle warme Boulder-Varianten passend sind. Erst nach den regulären Felsen werden Schneeflächen versucht.
- Objektkapazität `VedrasForest.maxObjects`, reservierte Bau-/Lichtungshexe, Bergkerne, Original-Habitat-/Familienregeln, 72 Versuche je Position, 2-Hex-Nachbarkollisionen, Straßen-/Flussmasken und bereits platzierte Baum-/Findlingsanker werden geprüft. Keine Änderungen an Originalkatalogen, Szenen oder Spielviewer.
- Die gemeinsame 2,5×-Scenery rendert jetzt optional auch **Originalbilder** gewöhnlicher Findlinge und von Schneeflächen im identischen globalen Pixelraster; eigene Draw-/Verdeckungszähler. Neue Quelle bleibt `rasterized:false`, `readyForViewer:false`. Bei integriertem Nachlauf entfallen die offenen Flags für die gewöhnliche Fels- und Schneevorplatzierung, nicht aber für Sträucher, Akzente/Totholz, Kronenbild-Parität, Schatten und finale 4×-Spielkacheln.
- Der Firefox-Original-PNG-Test wird um `boulder_01.png` und `snow_patch_01.png` erweitert. Diese Nahtprüfung ist ausdrücklich kein vollständiger Atlas-Eignungsnachweis.

### Phase 2.8j – Sträucher, Totholz und Original-Akzente (separate Vorschau)

- `large-map-bake-nature-accents.js` übernimmt den *nachgelagerten* Original-Akzentdurchlauf aus `nature-ui.js` für physische Shrub-/Cluster-/Ground-Cover-/Deadwood-/stehende Totholzvarianten. Baum-, Warmfindling-, Spätfindling- und Schneepositionen werden zuerst reserviert. Katalog-Habitat, globale Akzentlimits je Landfläche, Seed-Ranking, Wald-/Randgewicht, `Polish.patch`, Objekt-Slots, 2-Hex-Kollisionen, Straßen-/Flusssperren und die erhöhte Flusssperre für liegende Stämme bleiben erhalten.
- Die gemeinsame Scenery-Probe kann die zusätzlichen PNGs mit derselben globalen 2,5×-Rasterung rendern. Eine Browser-Nahtregression berücksichtigt zusätzlich `bush_01.png` und `fallen_log_01.png`. Ein eigener fokussierter Vertragstest prüft Seed-Stabilität, globale Akzentgrenzen, Mindestabstände und veraltete Vorläufe.
- Alle Resultate verbleiben `complete:false`, `readyForViewer:false`; die neue Nature-Planung ist keine Aussage über vollständige 397-Hex-Editor-Parität, Baumkronenabdeckung, Schatten oder einen produktionsreifen 4×-WorldTile-Atlas. Original-PNGs, Nature-Katalog und bestehende Karten bleiben unverändert.

### Phase 2.8k – native Sprite-Schattenprobe (vorläufig)

- Opt-in gemeinsame Scenery mit gespeicherten Original-Sprite-Schattenprofilen aus `/api/sprite-shadows` (niemals generische Ersatzprofile); originale PNG-Alphas, `VedrasSpriteShadows.draw()` mit `VedrasManualShadows`, sowie `VedrasShadowTone.withMaskPass()` werden wiederverwendet.
- Neuer rein lesender, begrenzter Rasteradapter mit ganzzahliger Weltpixelverankerung und unionsbasierter Schattenmaske. Alte Scenery-Probe ohne Checkbox bleibt unverändert.
- Native **Bergschatten sind nicht enthalten**, ebenso keine echte 4×-Atlasauflösung und noch keine vollständige Kronen-/Editor-Bildparität. `complete:false`, `readyForViewer:false` bleiben.
- Eigene Firefox-Regression mit echten Originalprofilen ist ergänzt. Der Bildvergleich muss vor der Freigabe der Probe erfolgreich sein.

### Phase 2.8l – Native Bergschatten im WorldTile-Schattenvorschau-Layer

- Natives `VedrasShadows.paintMountain()` mit originaler Fuß-Alphaanalyse (`VedrasShadows.alphaFoot()`), `mountainOrigin()` und `mountainShape()`; ausschließlich globale ganzzahlige Pixel-Scratch-Raster, keine alternativen Schattenformen.
- Drei ausdrücklich getrennte Vorschauen: ohne Schatten, mit nativen Sprite-Schattenprofilen, mit Sprite- **und** Bergschatten. Alte Vorschau bleibt unverändert; die Bergschattenoption setzt gespeicherte Original-Sprite-Profile voraus.
- Anders als bei normalen Sprite-Grafiken können Schatten in eine Kachel hineinreichen, obwohl die zugehörige Berggrafik außerhalb liegt. Für den Bergschattenmodus werden solche Bergkandidaten aus dem vorhandenen globalen Scenery-Halo einbezogen. Ein Schatten außerhalb dieses Halos führt zum Fehler statt zu fehlenden Nachbarpixeln.
- Separater Node-Vertragstest und Firefox-Echtbildtest mit Pixelnaht sowie Bildvergleich mit/ohne Bergschatten sind vorgesehen. **Die Prüfungsergebnisse werden erst nach CI-Lauf dokumentiert.**
- Der Geografiegenerator besitzt keine gespeicherten Editor-Szeneinstellungen zu Berg-Presets, Berg-Instanzen oder Schattenempfängern. Die Vorschau verwendet deshalb ausschließlich die Original-Editor-**Standardwerte**, bezeichnet dies ausdrücklich und lässt `needsMountainShadowScenePresetParity:true`, `needsMountainSpriteReceiverParity:true`, `complete:false`, `readyForViewer:false` bestehen. Erst ein späterer tatsächlicher Editorvergleich kann Vollparität belegen.

### Phase 2.8m – Schreibgeschützter Import gespeicherter Editor-Bergschatten

- `large-map-bake-authored-mountain-shadows.js` prüft den **tatsächlichen Editor-Export** `vedras-asset-labor-scene-0.8` Schema-Version 3 und Projektion `256/.85`, validiert globale Berg- und Asset-Profile und wertet die exakt gleichen Rangfolgen aus wie `app.js`: Szenenstandard → Asset-Preset → Instanzwerte. Die historische `reach/spread/contact`-Umrechnung ist enthalten.
- **Wichtig:** Positionsabhängige Instanz-Overrides werden nur bei vollständiger 1:1-Übereinstimmung aller `q,r,assetPath`-Berginstanzen mit dem aktuell generierten Weltplan übertragen. Bei Abweichung wirken ausschließlich gültige Szenenstandards und Asset-Presets. Keine stille Positionsprojektion.
- Über das Geografielabor kann optional eine zuvor aus dem Asset-Labor exportierte `vedras_scene.json` nur im Arbeitsspeicher ausgewählt werden. Der gespeicherte `shadowTone` wird ausschließlich für die Probe übernommen und sofort zurückgesetzt (`persist:false`), keine Änderungen an LocalStorage, WorldTiles, Original-PNGs oder Editor-Dateien.
- Der vorherige Standardpfad bleibt exakt wie zuvor; `complete:false`, `readyForViewer:false`, `needsMountainSpriteReceiverParity:true` bleiben explizit bestehen. CI-Vertragstests und echte Firefox-Pixelidentität mit importierten Szenen-Overrides sind vorgesehen; Ergebnisse folgen aus der Prüfung.

### Phase 2.8n – Bergschatten auf Original-Sprites (getrennte Opt-in-Probe)

- Neue native **Bodenanker-Fußpunktprüfung** anhand des Original-Distanzfelds `VedrasShadows.mountainAlphaAt()` (nur positive Fußpunktreichweite führt zur Schattierung), inkl. exklusivem eigenen Bergcast und der originalen südwestlichen Berg-Nachbar-Ausnahme.
- Native Schatten-Pixelmaske wird als begrenzte unabhängige Kopie des bereits gerenderten Original-`paintMountain()`-Cast gespeichert; keine zweite neue Schattengeometrie. Cast-Overlays werden mit `source-atop` zunächst gegen die untransformierte Original-PNG-Alpha gemalt; erst danach erfolgt die gemeinsame 2,5×/.85-Perspektivtransformation des Sprites. Die globale Scratch-Lattice verhindert Tile-versetzte Rundung.
- Der neue Haken `Bergschatten auch auf Original-Objekten` ist nur zusammen mit Berg- und Sprite-Schatten möglich. Das Pixelnaht-Gate fordert ausdrückliches `allowReceiverPreview:true` und mindestens einen gezeichneten Empfänger aus dem überprüften WorldTile-Paar.
- Original-Dateien, Editor, Weltplan, `main` und bisherige Default-/Sprite-/Berg-Vorschauen bleiben unverändert. `needsFullEditorReceiverImageParity:true`, `complete:false`, `readyForViewer:false` bleiben als Sperren. CI-Ergebnisse werden nach tatsächlichem Node/Firefox-Lauf ergänzt.

### Phase 2.8p – Opt-in Editor-Fußpunktprojektion im echten WorldTile-Kompositor

- Die bestehende gemeinsame 2,5×-WorldTile-Renderer-Kette unterstützt `previewEditorProjection:true` **explizit als zusätzlichen isolierten Bildmodus**. Default bleibt die frühere projizierte Sprite-Höhe, unverändert für bisherige Pixelreceipts.
- Der Editor-Referenzrenderer malt echte Bildkörper mit **unprojizierter Original-PNG-Höhe** und projiziert ausschließlich den Relief-Ground-Foot mit `.85`. Er benutzt `app.js`-artige Fuß-Perspektive `shear=.012, vertical=.965`. Vorsichtige, global ganzzahlig gerundete und tatsächlich transformierte Pixel-Bounds verhindern Wegschneiden bei 512er-WorldTile-Rändern.
- `mountainCoversBase()`-Semantik für Bäume: Bäume, deren Fuß in **opaker originaler Bergalpha** liegt, werden nur im neuen Editor-Projektionsmodus aus dem Sprite-/Bodenschatten-Pass entfernt (andere Nature-Typen bleiben hinter Bergen). Berge aus dem Bild-Halo werden auch bei der Baumverdeckung berücksichtigt. Vorheriger Vorschaupfad bleibt unangetastet.
- Originale native Bergschatten werden weiterhin am wirklichen Fuß auf Empfänger geprüft und anschließend **in derselben Original-`source-atop`-Kompositingreihenfolge wie im Editor** unter dem tatsächlichen Sprite-Perspektivmodus aufgebracht. Alle Casts behalten ihre globalen Pixelkoordinaten.
- Das Geography Lab und der Original-Seam-Verifier erfordern den expliziten Editor-Projektions-Checkbox-/Gate-Parameter; der Referenzmodus wird im Rückgabeschema klar vom bestehenden Preview unterschieden. Er wird nie als kompletter Viewer-Atlas markiert.
- Im tatsächlichen Editor gibt es zusätzlich Downsampling und Render-Layer-/Szenenkontext; vollständige Editor-Weltbildparität, ganzer Nature-Katalog, Original-Terrain-Integration, 4×-Finalbake und Player-Viewer bleiben gesperrt. CI-Ergebnisse nach dem realen Browserlauf.

### Phase 2.8r – Strukturierte Editor-RGBA-Abweichungsdiagnose (separater Auditpfad)

- Neues unabhängiges, begrenztes Modul `large-map-bake-editor-composite-audit.js`. Es vergleicht den **tatsächlichen vorkodierten Canvas-Pixelinhalt** von WorldTile und `app.js`-Editor für zwei identische Original-PNG-Mehrfachszenen, mit und ohne Schatten. Es verändert keine Spiel-/Editor-Darstellung.
- Die RGBA-Rechnung weist **getrennt** je Farbkanal, absoluten Maximalfehler, 1-/2-/3–4-/5–16-/17–64-/65–255-Byte-Fehlerklassen, Transparenz (transparent/low/mid/high/opaque), nur RGB/nur Alpha/beides, Fehlerrechteck und 32×16-Heatmap aus. Eine **gepaarte** Auswertung zeigt Schatteneffekt auf beiden Renderern sowie `introduced`/`resolved`/`persistent`-Abweichungen und `shadeTouchedWorldOnly`/`shadeTouchedEditorOnly`/beide/keiner.
- Es gibt Invarianten für Pixelpartitionen, einen Fail-closed-Inputvertrag (Uint8ClampedArray, gleiche Größe, max. 3,5 Mio. Bildpixel) und Node-Regressionsverträge.
- Der reale Firefox-Pixeltest schreibt zwei **vergängliche CI-Artefakte**: `phase28r_editor_composite_rgba_heatmap.png` und `phase28r_editor_composite_rgba_report.json` mit unveränderten Quell-PNGs. Die Berichte werden bei CI-Fehlern ebenfalls hochgeladen.
- Die ursprüngliche Nahtprüfung (0 RGBA-Abweichungen) und alle `needsFullEditorImageParity:true` / `complete:false` / `readyForViewer:false`-Sperren bleiben zwingend. Die Phase dient der quantitativen Ursachenisolierung, **nicht der behaupteten vollständigen Editor-Bildparität**.

### Phase 2.8s – Echte Originalobjekt- und Schatten-Attribution (Testpfad)

- Nur im strikt opt-in, auf 36 Objekte begrenzten `captureEditorCompositeReference`-Audit werden nach dem echten Bergschattenpass und nach dem gemeinsamen Sprite-Bodenschattenpass **native getrennte Canvas-Snapshots** festgehalten, bevor Originalobjekte gezeichnet werden.
- **Pro tatsächlich gezeichnetem Original-PNG** wird die **echte gerasterte Alpha-Silhouette aus dem globalen Original-Sprite-Scratch** als kompaktes Bitset gespeichert (max. 8 MB Maskendaten). Damit kann der Audit einen Problem-Pixel einem *möglicherweise darüberliegenden realen, deckenden Sprite* zuordnen, ohne transparente Teile der Kronen als bedeckende Bounding-Boxen auszugeben. Letzter opaker Sprite und Überlappung werden getrennt ausgewiesen; Alpha-Masken werden **nicht** in Spiel- oder Editor-Daten gespeichert.
- Neues eigenständiges, fail-closed Modul `large-map-bake-shadow-pixel-attribution.js` prüft 6 echte `Uint8ClampedArray`-Pixelströme (WorldTile/Editor ohne und mit Schatten, echter Mountain-only-/Mountain+Sprite-Ground-Pass) sowie das tatsächliche Original-Sprite-Bitmaskenraster. Es ermittelt **nur-im-Editor** versus **nur-in-WorldTile** geänderte Schattenpixel, deren obere konkrete PNG-Quelle, Überlagerungen und Ground-Mountain-/Sprite-Shadow-Präsenz. Die bereits aus Phase 2.8r bekannten `>64`-Farb-/Alpha-Ausreißer werden als exakte Koordinaten mit RGBA-Werten und Sprite-Quelle dokumentiert.
- Die reale Browserprobe verknüpft diese Gruppen **numerisch 1:1** mit den unabhängigen `RGBA.paired()`-Statistiken, prüft weiter **0 Pixelabweichungen an der Kachelnaht** und erzeugt den temporären CI-Bericht `phase28s_original_sprite_shadow_attribution.json`. Eine Attribution nennt die im WorldTile positiv-alpha-pixelenden Sprites, **nicht** automatisch die kausale Ursache einer Editorabweichung.
- **Keine Renderer-Pixeländerung**, keine Änderung von `main`, Nature-Originaldateien oder produktiven Viewer-Gates. Nach Auswertung der realen CI-Daten folgen nur bei belegtem Nutzen gezielte, nahtbewahrende Grafikfixes.

### Phase 2.8t – 2 alternative Original-Sprite-Alpha-Kompositionen (striktes A/B)

- Ein **getrennter, nicht in den Renderer einzuschaltender**, streng begrenzter Diagnosepfad `captureAlphaAB:true` erfordert `captureEditorCompositeReference:true` und die ausdrückliche Editor-Projektion. Die bestehenden WorldTile-Originalpixel, die exakte Überlappungs-Naht, alle produktiven Draw-Casts und die Release-Sperren bleiben unverändert.
- Die Probe kopiert den **wirklichen pre-encode RGBA-Grundhintergrund** direkt aus dem Ausgabe-Canvas und die **Original-Pixel jedes global-ganzzahlig platzierten Sprite-Scratch** (maximal 36 Source-Sprites, 48 MB Pixelbudget). Damit können alternative Source-over-Alpha-Rundungen **ohne** die zweite Canvas2D-`drawImage`-Komposition auf denselben Originalquellen gegeneinander getestet werden.
- In `large-map-bake-alpha-source-over-ab.js` stehen als **reine nur diagnostische Berechnungsmodi** `straight-rounded` (unpremultiplizierte Alpha-Formel mit 8-bit Ausgabe) und `premultiplied-byte` (auf Byte quantisierte Vormultiplikation). Keine Konvertierung von Nature-PNGs, keine Veränderung an `app.js` und keine Produktivsektoren.
- Der echte Firefox-Test vergleicht beide Alternativen gegen den **unveränderten Original-`app.js`-Editor** je Kachel und misst zugleich den **exakten RGBA-Abgleich der kompletten 640×1632 Nachbarkachel-Überlappung** für die jeweilige A/B-Alternative. `eligibleForReview` kann nur wahr werden, wenn (a) auf beiden Kacheln die Abweichungen kleiner sind als beim derzeitigen Preview, (b) das maximale Kanaldelta nicht steigt und (c) die Kachelnaht weiter **0** Unterschiede hat. Auch bei positiver Probe ist KEIN Renderer-Upgrade automatisiert.
- Die CI erzeugt `phase28t_original_sprite_alpha_composite_ab.json` als kurzlebigen Report. Ausgangszustand bleibt explizit `complete:false`, `readyForViewer:false`, `needsFullEditorImageParity:true`. Die A/B-Rezepte sind Kandidaten, **keine** Aussage über erfolgreich reduzierte Abweichungen vor dem echten Firefox-Receipt.

### Phase 2.8t – Tatsächliche A/B-Ergebnisse: BEIDE Alpha-Alternativen verworfen

- [Firefox-Original-PNG-A/B- und 640×1632-Seam-Receipt auf HEAD `f7f2281`](https://github.com/markusjungblut/asset_labor/actions/runs/45214295776) **PASS**. Beide rein diagnostischen Varianten erzeugen **0 verschiedene RGBA-Pixel** an der echten WorldTile-Naht; der bestehende Originalkompositor bleibt ebenfalls bei **0**.
- **Originalnative `app.js`-Editor-Pixelabweichungen unter gleichem Schatteninhalt:** Ausgangsrenderer **40.788 / 12.099** (Tile `0,0`/`1,0`); `straight-rounded` **41.404 / 14.275** (**+616 / +2.176**, also schlechter); `premultiplied-byte` **44.384 / 14.529** (**+3.596 / +2.430**, ebenfalls schlechter). In beiden Varianten war `eligibleForReview:false`; beide sind für einen Rendererfix **ABGELEHNT**, obwohl die Kachelnaht bestehen blieb.
- Im Pixel-Beleg wurden **19 / 11 echte global gerasterte Sprite-Patches** verarbeitet und **398.617 / 780.376** durch Sprite-Alpha berührte Pixel evaluiert. Es handelt sich weder um synthetische Farben noch um erfundene Ausgangspositionen.
- **Schlussfolgerung nur für diese Messung:** Eine naive alternative Source-over-Komposition mit 8-bit-Werten verbessert die volle Bildparität nicht. Diese Probe isoliert Alpha-Rundung, belegt aber nicht, dass Alpha-Rundung die **alleinige** Ursache ist. Weiterhin fehlen die echte vollständige Editor-Komposition, gesamte Nature-Welt, finaler 4×-Bake und Spieler-Viewer-Freigabe.
- **Nächste Phase 2.8u:** Den nachgewiesenen **großen Zugewinn nur beim Ausgangspfad** als Baseline beibehalten und die tatsächliche **Quelle der Schattenalpha-Differenzen an Original-Mountain-Scratch versus Original-Editor-Casts** separat prüfen, statt weitere unbelegte Rundungsrezepturen zu veröffentlichen. `main`/Original-PNGs/Viewer-Flags bleiben unangetastet.

### Phase 2.8u – Originales Editor-Bergschattenraster unabhängig geprüft (Test-Only)

- **Quellabweichung direkt in `app.js` entdeckt:** `shadowLocalMask(width,settings,global)` rastert Bergschatten mit `factor = min(.60, 320/width)`, skaliert `softness` mit und zeichnet den gecachten lokalen Schatten anschließend als Bild auf den Weltcanvas. Der bisherige Baker-Adapter rief zwar die **richtige VedrasShadows-Distanzfeldformel** auf, erzeugte diese aber in **voller 2,5× Pixelauflösung**. Das kann Masken-Sampling und vor allem die Empfänger-`source-atop`-Composites unterscheiden.
- Neues unabhängig begrenztes Modul `large-map-bake-editor-local-mountain-mask.js` spiegelt exakt die originalen Formeln für lokale Editor-Crop-Koordinaten, maximale 320px Rasterbreite, scaled softness und Cast-Placement. Der echte Browserlauf extrahiert dazu den **unveränderten `shadowLocalMask()`-Funktionskörper aus `app.js`**, führt ihn in Firefox aus und vergleicht **sämtliche Pixel der Original-Cast-Raster sowie Größe, Peak-Alpha und die ungefilterten globalen Schattenrechtecke**. `pixelDifference=0` und `placementError=0` sind zwingende Testgates, keine Annahmen.
- Nur bei **`previewEditorLocalMountainMask:true`**, zusammen mit `previewEditorProjection:true`, `previewSpriteShadows:true`, `previewMountainShadows:true`, `previewMountainReceivers:true`, `captureEditorCompositeReference:true` wird eine neue Diagnose ausgeführt. Die ursprünglichen 2.5×-WorldTile-Renderer einschließlich der erfolgreich nahtfreien Shadow-Preview bleiben **unverändert**. Das lokal gerasterte Original-Editor-Cast wird zum globalen integer-aligned Scratch kopiert, um die Pixelidentität in beiden Nachbarkacheln ausdrücklich erneut zu prüfen. Auf Original-Sprites wird dagegen der *wirkliche gecachte Editor-Cast mit fractional Box* für `source-atop` verwendet.
- Der reale Test vergleicht die neue Maskenkomposition zusätzlich mit der **direkten Originaleditor-Cast-Platzierung** vor jedem Sprite und ermittelt `baselineDifferent/localDifferent`; danach vergleicht er beide kompletten gepufferten WorldTiles gegen die unabhängig zusammengesetzte Editor-Szene und kontrolliert die gesamte **640×1.632** Überlappung ohne Toleranzen.
- Es gilt ein expliziter `eligibleForReview`-Filter: beide komplette Kacheln müssen geringere Pixelabweichungen zur unabhängigen Editor-Komposition zeigen, die Maskenkomposition muss in beiden Kacheln näher am Original sein **und** der gesamte Overlap muss 0 verschiedene RGBA-Pixel zeigen. Kein automatisches Upgrade der Bildausgabe. `complete:false`, `readyForViewer:false`, `needsFullEditorImageParity:true` bleiben.
- Der kurzlebige Firefox-Bericht heißt `phase28u_original_editor_cached_local_mountain_mask.json`; die Ergebnisaussagen werden nach CI erst anhand realer Firefox-Pixelzahl getroffen.
