# Schritt 25P – Sinnvolle Optimierungen standardmäßig an, räumliche Tile-Auswahl

Stand: 09.11.2026 · konservativer Implementierungs-/CI-Branch.

## Vorgabe und Entscheidung

Auf Nutzerwunsch sollen **generell nützliche** Verbesserungen zunächst
aktiv sein, jedoch per Schalter wieder abgeschaltet werden können.
Die folgenden Defaults gelten ausschließlich für den
**eigenständigen Read-only-Kartenspielviewer**:

| Option | Neuer Default | Abschalten | Einordnung |
| --- | --- | --- | --- |
| `worldFast` | an | `&worldFast=0` | Bereits seit 25I standardmäßig aktiv |
| `streamCache`, `cloudPad`, `cloudAuto`, `fogCull` | an | jeweils `=0` | Bestehende kontrollierte Optimierungen |
| `worldPad` | **an** | **`&worldPad=0`** | 25M: Verhindert im synthetischen Pan zwei teure Voll-Neuaufbauten, innerhalb 16,5-MP-Budget. Kann bis ~14 MiB zusätzlichen Raster-RAM beanspruchen, gemischte p95-Frame-Gap-Befunde |
| `worldBands` | **an** | **`&worldBands=0`** | 25O: Spart am lückenhaften Kartenrand ~53 % World-Copy-Pixel; bei voll deckender Welt fällt konservativer Planer auf den bisherigen einzelnen Blit zurück |
| `tileIndex` | **an ab 400 Tiles** | **`&tileIndex=0`** | 25P: Einmaliger räumlicher Schlüsselindex; spart Kandidatenscans bei großen Welten, während kleine Karten unverändert gescannt werden |
| `fogLayer` | **aus** | einschalten `&fogLayer=1` | 25K: Isolierte Fog-Frames schneller, aber ~29 MiB zusätzlicher Canvas und gemischte Pan-p95 |
| Alte DOM-, 5-Arg-Blit-, opake-Canvas-Experimente | **aus / nicht gemergt** | – | Negative Firefox-A/B aus 25J/25L/25N |

Die Voreinstellung ist keine unwiderrufliche Festlegung:
Wer an einer speicherengen Maschine eine Regression bemerkt,
kann die speicherintensivere 25M-Reserve sofort mit
`&worldPad=0` deaktivieren. Automatische adaptive RAM-Wahl
ohne Hardwaredaten wird nicht behauptet.

## Indexkonstruktion: Read-only, nur tatsächliche Kandidaten

Vor Schritt 25P iterierte die Runtime bei **jedem Draw** durch
`available`, also sämtliche im ausgewählten LOD gespeicherten
Tile-Schlüssel, obwohl nur ein kleiner Ausschnitt sichtbar oder
für die vorhandene Kamera-Pad-Reserve relevant ist.
Bei 15.000 Schlüsseln kostet das 15.000 String-Slices,
`split(',')`, Number-Parsing und Boundingbox-Tests pro Frame.

Jetzt baut `load()` einmalig aus den von
`storage.keys(scene+'|'+level+'|')` zurückgegebenen
**unveränderten Schlüsselstrings** einen `Map<ix, rows[]>`-
Index. Jede Spalte ist nach Tile-`iy` sortiert; binäre
Suche ermittelt die erste Zeile im konservativen
`viewportPolicy.screenBounds`-Rechteck, danach werden
nur tatsächliche Index-Kandidaten gelesen.

Der bisherige `visible`- versus `prefetch`-Test
mit exakt denselben 512-Welteinheiten, Scenery-Pads,
Projektionsfaktoren und `snap()` bleibt **unverändert**.
Die Ergebnisse werden nach der **ursprünglichen
Schlüsselreihenfolge** sortiert, bevor die alte
Kamera-Distanzpriorisierung ausgeführt wird.
Damit werden die 25C/25D-Read-/Decode-/LRU- und
25F-Patch-Semantiken nicht stillschweigend verändert.

Der Index wird erst bei mindestens **400 vorhandenen
Schlüsseln** gebaut und bei Szenen-/LOD-Reload/Stop
vollständig verworfen; darunter läuft die alte
Set-Schleife ohne Indexallokation. Unplausibel große
Kamera-Suchfenster oder fehlende Bounds verwenden
ebenfalls den bisherigen sicheren Vollscan.
Der Index enthält nur Schlüssel und ganzzahlige
Tilekoordinaten, keine PNGs, keine zusätzlichen
Images/Canvases, keine Original-/Derivat-IndexedDB-Writes.

Zähler im `report()`:
`indexedTileSelection`,
`indexedTileSelectionActive`,
`tileIndexEntries`, `tileIndexQueries`,
`tileIndexCandidateChecks` und
`tileLegacyCandidateChecks`.

## Automatische Abnahme

- Neue Node-Regression `tests/test_rendering_step25p_tile_index_20261109.cjs`:
  Eine echte künstliche Schlüsselmenge mit 15.000 Tiles
  wird in beiden Runtime-Modi über mehrere reale
  Kamerapositionen verglichen. `visibleRequested`,
  `prefetchRequested`, Decode-Starts, Cache-/Streaming-
  Zähler und Fehler müssen identisch bleiben.
  Ziel: wenigstens **90 % weniger Kandidatenprüfungen**
  durch den Index. Zusätzlich: 120-Tile-Fallback
  und Index-Neuaufbau nach Szenewechsel.
- Echter GitHub-Actions-Headless-Firefox testet
  weiterhin sämtliche alten Standard-/Kontrollmodi.
  Der alte Vergleichsmodus wird durch
  `&worldPad=0&worldBands=0` ausdrücklich auf seine
  historische Basis festgelegt; ein zusätzlich
  `modernDefault` ohne beide Parameter prüft
  die nun automatisch aktivierten Opt-ins.
- Ein isolierter Firefox-**15.000-Schlüssel-Stress**
  verwendet nur kleinste synthetische In-Memory-
  PNG-Bilder, **keine** 15.000 Originalatlas-PNGs,
  und vergleicht den alten und neuen
  Auswahlpfad auf denselben Kameraposen:
  ausgewählte Tile-Reads, Kandidatenzahlen und
  echte RGBA-Samples der finalen Bildschirmausgabe.
  Die gemessene Auswahlzeit ist kein GPU-Benchmark
  der privaten Windows-/600-MB-Karte.
- Nach positivem PR-Head-Test: nur dann in
  `main` übernehmen und eine erneute Main-CI
  abwarten. Konservative p95-/Pixel-/Fog-Regressions-
  Grenzen der bestehenden Tests bleiben erhalten.

**Keine** Änderung der Cloud-/Fog-Autorisierung,
850-ms-Fade-Logik, Quelle PNGs, 1×/2×-LODs,
16,5-/8,5-MP-Hardlimits, 8192-Devicepixelgrenze,
Decoded-Pixel-LRU, Cachepersistenz oder
Terrain-/Authoring-Worker. Kein 60-FPS-Versprechen.

## Erste automatisierte CI und tatsächliche 15.000-Tile-Ergebnisse

[GitHub Actions #42661915005](https://github.com/markusjungblut/asset_labor/actions/runs/42661915005):
**70/70 Node-Tests und echter Headless-Firefox vollständig bestanden**.
Alle historischen A/B-Modi werden mit expliziten
`worldPad=0&worldBands=0`-Kontrollen verglichen; der neue
`modernDefault`-Modus verwendet keine dieser beiden URL-Flags.

| Dieselbe synthetische 120-Tile-Firefox-Kamera, 30 aktive Pan-Frames | Historische Voreinstellung | Neue Voreinstellung |
| --- | ---: | ---: |
| `worldPad` / `worldBands` | aus / aus | **an / an** |
| `drawMs` p95 | 45 ms | **41 ms** |
| `frameGapMs` p95 | 54 ms | **49 ms** |
| Durchschnittliches `drawMs` | 45,90 ms | **36,03 ms** |
| World-Raster-Overscan | 272 CSS-px | **434 CSS-px** |

Ein **echter zweiter Firefox-Browsertest mit 15.000
In-Memory-Schlüsselmetadaten** (nicht 15.000
privaten PNGs) ergab:

| Zähler nach identischer synthetischer Kamerafahrt | Vorher: Set-Scan | Neuer räumlicher Index |
| --- | ---: | ---: |
| Geprüfte vorhandene Tile-Schlüssel | 705.000 | **1.153** |
| Reduktion | – | **99,84 %** |
| Fertig dekodierte Tiles | 31 | **31** |
| Sichtbare Tile-Reads | 26 | **26** |
| Prefetch-Reads | 5 | **5** |
| Fehler | 0 | **0** |
| Abweichende RGBA-Kanäle in 720 echten Browser-Proben | – | **0** |
| Summierte Test-Draw-Wallclock (sieben Kamerapositionen) | 297 ms | **139 ms** |

Die Wallclock-Werte stammen aus einem einzigen, sehr kleinen
synthetischen Tile-Canvas-Firefox-Lauf; sie sind **kein**
separater Windows-GPU- oder 600-MB-Atlas-Benchmark.
Die **99,84 % weniger Kandidatenprüfungen** sind dagegen
eine direkt instrumentierte, reproduzierbare strukturelle
Reduktion. Node testet zusätzlich die richtige Auswahl-
und Rückgabereihenfolge über weitere Pan-Pfade.

## Sichtbare Leistungsschalter

In der eigenständigen Kartenansicht befindet sich ein
zugeklappter Menüpunkt **„Optimierungen“**. Dort lassen
sich die drei neuen Standardmodi und die freiwillige
Fog-Ebene mit Checkboxen ändern. Die Umschaltung setzt
nur den entsprechenden bestehenden URL-Parameter
(`worldPad`, `worldBands`, `tileIndex`, `fogLayer`);
die Kartenseite wird dafür **neu geladen**.
Alle sonstigen URL-Parameter, einschließlich Szene,
LOD und Profiling, bleiben erhalten.
Das Reload setzt die Kameraposition zurück; es
verändert **keine** gespeicherten Tiles oder Sichtrechte.

Ein zusätzlicher realer Firefox-Test prüft nun auch
jede Checkbox, ihre tatsächliche URL-Navigation
und die anschließend aktiven Runtime-Optionen.

## Finale UI-, Index- und Pan-Abnahme

[GitHub Actions #42664009369](https://github.com/markusjungblut/asset_labor/actions/runs/42664009369)
bestand **70/70 Node-Tests** und das vollständige Headless-Firefox-
Programm einschließlich aller sichtbaren Checkbox-Navigationen.
`firefox-summary.json`: `passed:true`, `errors:[]`,
Artefakt `frozen-map-firefox-82` (ID `13696340578`).

Das UI hat die URL-Parameter `worldBands=0`, `worldPad=0`,
`tileIndex=0`, `fogLayer=1` und wieder `worldBands=1`
**tatsächlich gesetzt**; nach jeder Navigation wurde
der wirksame Renderer-Status im Browser überprüft.

Die zweite 15.000-Key-Browserprobe bestätigte:
**705.000→1.153** geprüfte Keys (−99,84 %),
exakt **31/31** fertig decodierte Tiles, **26/26**
sichtbare Reads, **5/5** Prefetch-Reads, keine Fehler und
**0 unterschiedliche Kanäle in 720 RGBA-Pixelproben**.
Ihre synthetische summierte Draw-Wallclock betrug
**163 ms** ohne Index und **92 ms** mit Index.
Nicht repräsentativ für GPU-Uploads des echten Atlas.

Wichtig: Die *kombinierten neuen Standardeinstellungen*
`worldPad=1`+`worldBands=1` haben bei demselben
30-Frame-Firefox-Test zwar erneut
**zwei vollständige World-Raster-Neuaufbauten verhindert**
und die *mittlere* Zeichenzeit von **31,23→27,27ms**
gesenkt, aber das `drawMs`-p95
lag **28→45ms** und der
`frameGapMs`-p95 **36→53ms**.
Die einzeln geprüfte größere Randreserve
(`worldPad=1`, `worldBands=0`)
lag dagegen bei **27ms Draw-p95/36ms FrameGap-p95**.
Bei nur 30 sequenziellen Frames und nicht
gepaart synchronisierten Firefox-Cloud-/GPU-Takten ist
die erhöhte p95-Spitze nicht eindeutig
der konservativen World-Band-Planung zuzuordnen.
Ein allgemeiner 60-FPS-Vorteil wird
**ausdrücklich nicht behauptet**.

Gemäß der Nutzer-Vorgabe bleiben
die **einzeln abschaltbaren Verbesserungen zunächst
standardmäßig aktiv**. Wer eine schwankende Frame-Kadenz
bemerkt, kann `worldBands=0` und/oder
`worldPad=0` direkt im Optimierungen-Menü wählen;
die Fog-Layer-Sondervariante bleibt aus.
Spätere automatische Entscheidungen müssen
auf wiederholten gepaarten GPU-/Pan-Daten beruhen.
