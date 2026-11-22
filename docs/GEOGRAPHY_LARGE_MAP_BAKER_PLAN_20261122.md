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
