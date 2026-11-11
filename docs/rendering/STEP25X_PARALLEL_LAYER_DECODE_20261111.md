# Schritt 25X – Vergleich der parallelen Ground-/Scenery-PNG-Dekodierung

**Datum:** 11. November 2026  
**Branch:** `perf/step25x-parallel-layer-decode-20261111`  
**Entscheidung:** *Nur reversibler experimenteller Opt-in.* Nicht als neue Produktionseinstellung aktivieren.

## Anlass

Der vorige echte Firefox-IndexedDB-Versuch **25W** stellte bei vorberechneten
synthetischen Kartenkacheln fest: Median für das Lesen aus IndexedDB
rund **8 ms**, für sequentielles Dekodieren der zwei PNG-Layer rund
**24,75 ms**. Ground und Scenery sind selbständige PNG-Daten.
Daher ist ein streng kontrollierter Parallel-Decode-Versuch technisch
sinnvoll; daraus folgt **nicht**, dass dieser insgesamt schneller ist.

## Code

`?parallelDecode=1` schaltet pro gelesenem Tile-Paket ein
`Promise.allSettled` für die unabhängigen PNG-Layer ein.
`?parallelDecode=0` (und ohne Parameter) verwendet den bisherigen
**sequentiellen** `await decodePNG`-Pfad.

Die Ausgabe verwendet die **ursprüngliche Reihenfolge des Archiv-Arrays**
(bei Ground/Scenery ebenfalls diese Reihenfolge), auch wenn die
Dekodierungen in umgekehrter Reihenfolge fertig werden. Falls ein
Decode scheitert, wartet `allSettled` auf alle Geschwister und schließt
sämtliche bereits oder später erfolgreich dekodierten ImageBitmaps,
**bevor** es den gesamten Tile-Read als fehlgeschlagen markiert.
Ein halb dekodierter Tile darf nie in `decoded` gelangen.

Unverändert sind `maxDecodedPixels`, `MAX_INFLIGHT`,
`MAX_SPECULATIVE`, Visible Borrowing, LOD-Hysterese,
Fog-/Authorized-Clip-Regeln, Canvas-Geometrie, Tile-PNGs und
IndexedDB-Speicherdaten. Kein Terrain-Re-Bake. Runtime-Diagnostik:
`parallelLayerDecode`, `parallelTileDecodes` und
`parallelDecodeFailures`.

## Echte Firefox-A/B-Messung

[GitHub Actions #43079132196](https://github.com/markusjungblut/asset_labor/actions/runs/43079132196) auf Commit
[`1ec7897`](https://github.com/markusjungblut/asset_labor/commit/1ec78973c01b3c8c096ff0191b166f37466516c3).

Im isolierten Firefox wurden 99 synthetische vorberechnete
PNG-Pakete mit Ground 512×512 und Scenery 768×768 in einer **echten
IndexedDB** gespeichert. Der Browser benutzte `IDBTransaction`/
`IDBObjectStore.get`, `createImageBitmap` und
`CanvasRenderingContext2D.drawImage`. Für den *Decodervergleich*
blieb `visibleBorrow=1` in allen vier ABBA-Läufen eingeschaltet;
nur `parallelDecode` wechselte **aus / an / an / aus**.
Alle vier Fahrten durchliefen dieselben sieben Kamera-Positionen
und enthielten jeweils 15 echte IndexedDB-Reads.

| Lauf | Parallel | Median IndexedDB | Median Dekodierung | Median bis zur vollständig sichtbaren Karte |
|---|---|---:|---:|---:|
| Sequenziell 1 | aus | 4 ms | **20 ms** | **35 ms** |
| Parallel 1 | an | 4 ms | **22 ms** | **42 ms** |
| Parallel 2 | an | 4 ms | **15 ms** | **29 ms** |
| Sequenziell 2 | aus | 3 ms | **21 ms** | **36 ms** |

Die Mittelwerte der beiden **Laufmediane** der Dekodierung betragen
**20,5 ms** (sequenziell) gegenüber **18,5 ms** (parallel).
Bei der entscheidenderen Zeit bis zum fertigen sichtbaren Viewport
betragen sie jedoch **35,5 ms für beide Varianten**.

Es gab also **keine konsistente End-to-End-Beschleunigung**;
eine parallele Probe war langsamer, die andere schneller.
Eine allgemeine FPS-/Frame-p95-Verbesserung wird **nicht** behauptet.
Die geringe Zahl zweier Proben je Variante und die synthetischen
Bildmuster reichen nicht für eine Produktionsentscheidung.

Alle acht Firefox-Proben (einschließlich der vier
vorherigen Borrowing-Referenzen) erzeugten den
gleichen Pixelhash `56fceb94`. Die parallele Variante
verarbeitete in ihren zwei Fahrten je **15 echte Tile-Pakete**.
Das Laufzeit-Budget für dekodierte Bitmaps blieb begrenzt.
Zusätzliche temporäre Parallel-Dekodierungen können trotzdem
CPU-/Decoder-Konkurrenz verursachen.

## Sicherheitstests

CI #43079132196: **95/95 Node-Tests** erfolgreich,
komplette bisherige echte Firefox-120-WorldTile-Regression
(Pan, Fog, 1×/2×, Cache) erfolgreich,
sechsfacher verzögerter 25V-Latenztest erfolgreich und
achtfacher **echter IndexedDB-/Decoder-Vergleich** erfolgreich.

Die fünf neuen Node-Tests prüfen insbesondere:

- Die **alte** sequentielle Standardausführung.
- Parallel startende Ground- und Scenery-Dekodierung.
- Erhaltene Layer-Reihenfolge trotz umgekehrter Fertigstellung.
- Vollständiges Schließen erfolgreicher Ground-Bitmaps bei
  fehlgeschlagener Scenery.
- Schließen einer **später** fertig gewordenen Scenery-Bitmap
  bei bereits fehlgeschlagenem Ground-Decode.
- Den abschaltbaren Schalter und den unveränderten Atlas-/Fog-/Bake-Zustand.

**Wichtig:** Die CI-Quellbilder stammen aus künstlicher Vorberechnung,
nicht aus der privaten originalen 397-Hex-Karte; sie verwenden auch
nicht den echten lokalen Windows-GPU-/Decoder-Stack. Ohne Windows-Reality-
Check sind daraus keine garantierten FPS-Steigerungen abzuleiten.

## Entscheidung / Integration

`parallelDecode` bleibt **standardmäßig ausgeschaltet** und wird
als prüfbare, reversible Hypothese in Draft #134 gehalten.
Kein Merge allein wegen der möglicherweise 2 ms kürzeren
Dekodierlauf-Mittelwerte, denn bei sichtbarer Vollbereitschaft
besteht in diesem Laborversuch **kein Medianvorteil**.

#134 wird auf #133 → #132 → #131 → #130 → #129 → #128
gestapelt. Das unabhängige Experiment #127 bleibt außerhalb.
`main`, die Originalkarte und potenziell uncommittete lokale
Windows-Arbeiten wurden nicht verändert.
