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
