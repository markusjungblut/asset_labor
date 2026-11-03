# Schritt 25F — Weltpanorama während des PNG-Streamings im Canvas cachen

Stand: 03.11.2026. Ausgangspunkt: gesamte bisherige Entwicklungsfolge [PR #115](https://github.com/markusjungblut/asset_labor/pull/115) erfolgreich nach `main` gemergt (464 Commits). Neue Änderung basiert **direkt auf `main`**.

## Nachweis im letzten realen Firefox-Profil

`vedras_profile_v1-0374527a_cached(5).json`: 596 Frames / 164 Interaktionsframes, `drawMs p95=180ms`, Weltzeichnung `p95=98ms`, Wolken `p95=91ms`, Fog `p95=70ms`. Bei **525 von 596 Frames** konnte `paintOverview()` kein Weltpanorama wiederverwenden, obwohl der Weltcache grundsätzlich aktiviert war. Insbesondere die ersten **23,605 Sekunden** bei der 33-%-Übersicht benötigten zum anfänglichen vollständigen Sichtbarwerden: Viele der 112 sichtbaren WorldTile-Varianten waren noch asynchron zu dekodieren.

Konkrete Codeursache:

```js
if (loading.size && !visibleComplete) return false;
```

Dieser Rücksprung in `paintOverview()` unterdrückte den Welt-Rastercache **solange auch nur eine sichtbare PNG-Kachel noch geladen wurde**. `draw()` fiel daraufhin jeden einzelnen Frame auf `paintWorld(ctx,...) ` zurück. Dadurch musste während des nachlaufenden Streamings bereits fertige Landschaft wiederholt direkt in den großen Canvas gemalt werden. Für sich bereits verfügbare Ground-/Scenery-Layer hilft ein PNG-Speicherarchiv hier nicht, wenn die Bildkomposition selbst wiederholt wird.

## Änderung ohne Datenmigration

`streamingWorldCache=true` ist die neue Standardstrategie. Ein bereits verfügbarer Ausschnitt der Welt wird als **korrekt geschnittenes, exakt zoom- und DPR-passendes gepuffertes Raster** gezeichnet, auch während andere Kacheln noch aus der persistenten 1×-/2×-IndexedDB in `ImageBitmap` dekodieren. Weiterhin gelten **dieselben Welt-Rasterpixelgrenzen** und alle bereits vorhandenen Mechanismen für Kamera-Overscan, bildgenaue Szene, Scenery-Reihenfolge, Fog und Dunkelregionsschutz.

Die aus den tatsächlich dekodierten Tile-/Variante-IDs deterministisch zusammengesetzte Raster-Signatur sorgt dafür, dass **jedes neu fertig dekodierte sichtbare Bild vor der anschließenden Nebel-Freigabe** im Raster landet. Die Cache-Hits verändern die Signatur nicht. Der Browser zeichnet den fertigen statischen Teil in Zwischenframes nicht mehr jedes Mal neu.

Per `&streamCache=0` kann für einen kontrollierten Test das exakt bisherige Verhalten zurückgeschaltet werden. `&prefetchGuard=0` bleibt davon unabhängig; so können die Decoder- und Compositor-Effekte separat verglichen werden. `report()` und `&perf=1` zählen jetzt `overviewStreamingBuilds` und `overviewStreamingHits`.

**Unverändert:** Welt-/Fog-Maskengeometrie, LOD-Schwellen, 1×-/2×-PNG-Images, Wolken-Dissolve, Bildqualität, Schatten/Tiefenordnung, `maxDecodedPixels=95M`, persistente Datenbanken, ZIP-Archive und Server-Sicherheitsanforderungen. Wir bearbeiten **nur temporäre Canvas-Raster**, keine Benutzerdatei.

## Automatisierte Abnahme, keine Benutzeraktion nötig

Ergänzung `tests/test_rendering_step25f_streaming_world_20261103.cjs`: Ein synthetisches 2-Tile-Scenario hält die zweite sichtbare Bilddekodierung absichtlich offen und prüft:

1. Das bereits verfügbare Terrain wird **trotz** ausstehendem sichtbaren Decode als vollständiges Ground/Scenery-Raster bis zur Fenstermaske gepuffert.
2. Bei weiteren `draw()`-Aufrufen ohne neuen PNG-Eingang wird der Cache **wiederverwendet**: keine weiteren `overviewRasterBuilds` oder Welt-Direct-Fallbacks.
3. Fog bleibt über der noch nicht fertig dekodierten Kachel opak.
4. Wird die zweite PNG-Anforderung freigegeben, ändert sich die Signatur und beide Ebenen werden **neu** in den Raster aufgenommen.
5. `streamingWorldCache=false` konserviert für A/B den bisherigen Direct-Painter.
6. Keine Originaldatei-, WorldTile- oder Fog-Migration.

Bestehende GitHub-Actions `.github/workflows/frozen-map-ci.yml` führt die **gesamte Step21–25*-Node-Suite** inklusive 25F automatisch aus und startet danach echten Headless-Firefox.

Die Playwright-E2E-Tests wurden erweitert: Der vorherige CI-Pfad hat den kompletten **Cold-Start vor der Vollsichtbarkeit weggeworfen**. Jetzt archiviert er für Default, alte Prefetch-Policy und neue `streamCache=0`-Kontrollgruppe zusätzlich jeweils `firefox-<mode>-cold.json`, beginnend beim allerersten ImageBitmap-Laden bis zum ersten vollständigen Viewport. Der Browser fährt weiterhin die festgelegte Mausroute und die 1×-/2×-Zoomsequenz; pro Szenario gibt es Warm- und Cold-Metriken, Raster-Fallbacks, Streaming-Builds und Streaming-Hits. Die Assertions stellen sicher, dass die neue Funktion **wirklich benutzt** wird, und dass die alte Option deaktivierbar ist.

## Zweite Iteration — inkrementelle Tile-Schmutzrechtecke statt Voll-Cache-Neubau

Die erste 25F-Version hat das Raster für **jedes** neu fertig dekodierte WorldTile neu angelegt. Das reduzierte die Direct-Fallbacks, war aber unter realem Headless Firefox **langsamer** als der alte Direct-Renderer: [automatischer Lauf #41689154776](https://github.com/markusjungblut/asset_labor/actions/runs/41689154776) zeigte Cold-Draw p95 **168 statt 100ms** und Pan-Draw p95 **179 statt 93ms**. Diese schlechte Version wurde **nicht** nach `main` gemergt.

Neue `shownOverview()`- und `patchOverview()`-Logik behält das Canvas-Panorama im RAM und führt für höchstens fünf gleichzeitig geänderte Tile-Varianten ein **Gerätpixel-genaues Dirty-Rect-Update** durch. Das Gebiet umfasst den 512-WorldTile-Kern und alle `layer.pad`-Überhänge (mindestens 128 Welteinheiten für Baumkronen/Schatten), plus zwei physikalische Schutzpixel zur Vermeidung von Nahtfehlern. Der lokal gelöschte Ausschnitt wird mit **sämtlichen räumlich überlappenden Nachbartiles** neu gemalt und dabei in derselben globalen Welt-Y-Sortierung sowie Ground- und Scenery-Reihenfolge wie beim kompletten Zeichnen komponiert. Beschränkt sich der veränderte Ausschnitt nicht auf maximal 65 % der Canvas-Fläche, wird einmalig der gewöhnliche vollständige Welt-Renderer verwendet. Die Bild-/Fog-Freigabereihenfolge bleibt unverändert: Eine neue PNG-Ebene wird vor der Wolken-Entsiegelung innerhalb des aktualisierten Rasters dargestellt.

Neue Diagnosewerte: `overviewPatchBuilds`, `overviewPatchedTiles`, zusätzlich `worldCachePatchBuilds` und `worldCachePatchedTiles` im `&perf=1`-Frameverlauf. Node-Tests sichern die schmutzrechteckgenaue Teilausgabe, das Ausbleiben einer vollständigen Canvas-Neuallokation sowie unveränderten Fog-Schutz.

Die **zweite echte Browser-Iteration** im automatischen [CI-Lauf #41690304560](https://github.com/markusjungblut/asset_labor/actions/runs/41690304560) hat mit denselben synthetischen 120 vorbereiteten WorldTiles und drei Varianten bestanden:

| Messgröße | Alter Direct-Renderer (`streamCache=0`) | Neuer Tile-Dirt-Rect-Cache (`streamCache=1`) |
| --- | ---: | ---: |
| Cold-Draw p95 | 100ms | **99ms** |
| Cold-Draw-Mittelwert | 86,44ms | **64,30ms** |
| Kalte Welt-Direct-Fallbacks | 69 | **0** |
| Voll-Raster-Builds im Kaltstart | 2 | **1** |
| Begrenzte Tile-Patches im Kaltstart | 0 | **24** |
| Initiale vollständige Sichtbarkeit | 6549ms | **4853ms** |
| Pan-Draw p95 | 98ms | **43ms** |
| Pan-FrameGap p95 | 103ms | **52ms** |
| Weltphase beim Pan p95 | 85ms | **28ms** |

Dies sind **reale Firefox-Headless-Canvas-Zeiten auf einem Linux-GitHub-Runner mit synthetischen Bildern**, kein reproduzierter Windows-159-FPS-Wert auf der originalen 600MB-Karte. Gegenüber der ersten 25F-Iteration ist der wichtigste Erfolg, dass statt 32 teurer voller Panoramabauten nur noch **ein** voller Panorama-Aufbau und begrenzte lokale Kachelupdates stattfinden.

Die CI wurde anschließend verschärft: Node-Test und Firefox-`guarded`-vs-`noStream`-A/B müssen nun **echte** Pixel-Patches, ein begrenztes Voll-Build-Konto und p95-Zeichnungs-/Frameabstände innerhalb fester relativer Grenzen nachweisen. Eine Wiederholung der nachweislich langsamen ersten 25F-Iteration soll damit **nicht** mehr grün durchlaufen.

## Akzeptanz

Die neue automatische CI muss **Node + Firefox grün** abschließen. Der echte Firefox-CI-Vergleich von `guarded` und `noStream` muss zeigen, dass während der unvollständig geladenen Welt **nicht mehr jeder Frame direkt** alle Weltlayer zeichnet. Absolute 30/60-FPS-Werte auf der Windows-Maschine werden daraus nicht versprochen; Testdaten und CPU/GPU unterscheiden sich von den lokal gespeicherten 600MB. Falls die Zahl der Cache-Builds pro PNG-Ankunft zu hoch ist, wäre der folgende Schritt **inkrementelles Schmutzrechteck-Rendering** statt erneuter Vollkomposition. Sollte Fog weiterhin ca. 40–70ms pro Frame kosten, braucht es einen getrennten, dynamischen Fog-Kompositor / schmalen Masken-Update-Pfad.

**Keine weiteren manuellen Browser-, PowerShell- oder JSON-Tests durch den Benutzer einplanen.**
