# Schritt 25Y – Wie sich PNG-Komplexität und Auflösung auf die Decode-Pipeline auswirken

**Datum:** 12. November 2026  
**Draft:** PR #135 auf #134 → #133 → #132 → #131 → #130 → #129 → #128  
**Entscheidung:** `parallelDecode=0` bleibt Standard. Keine weitere Produktiv-Codeänderung.

## Fragestellung

Die bisherigen Firefox-Vergleiche nutzten wenige, mehrfach verwendete PNG-Blobs. Bei Schritt 25X brachte `parallelDecode=1` keinen konsistenten End-to-End-Vorteil. Schritt 25Y isoliert deshalb drei unterschiedliche komprimierte Bildlasten, ohne den Viewer oder seinen ursprünglichen Kartenatlas zu verändern.

## Test

Der zusätzliche CI-Test `tests/automated_browser_png_workloads.cjs` berechnet drei **synthetische** 99-Tile-Szenen vor, speichert sie in einer separaten, ausschließlich dem CI-Browser gehörenden IndexedDB und liest danach nur diese fertigen PNG-Pakete. Er benutzt echte `IDBObjectStore.get`, `createImageBitmap` und `CanvasRenderingContext2D`.

Jede Kachel hat eine Ground- und eine Scenery-PNG. Der Grundriss bleibt bei 512 Weltkoordinaten pro Kachel; verändert werden ausschließlich die **natürlichen PNG-Pixelmaße** und die codierten Bildmuster.

| Testklasse | Ground PNG | Scenery PNG | Muster | Unterschiedliche Muster je Klasse | Durchschnittliche PNG-Bytes pro Paket |
|---|---:|---:|---|---:|---:|
| Smooth | 512² | 768² | Einfarbige Flächen mit wenigen Rechtecken | 8 | **22.072 B** |
| Textured | 512² | 768² | Deterministische, kleinteilige Farb-/Alphatextur | 8 | **139.310 B** |
| Textured-Large | 1024² | 1536² | Dieselbe Texturart in höherer Pixeldichte | 6 | **551.989 B** |

Jede Klasse verwendet **vier alternierende A/B-Fahrten**: sequentiell, parallel, parallel, sequentiell. `visibleBorrow=1` bleibt für alle Fahrten gleich, der restliche Viewer ebenfalls. Die Kamera fährt **0 → −800 → −1600 → −800 → 0**; je Fahrt werden 14 Tile-Pakete aus der echten CI-IndexedDB geladen. In Summe waren es **12 vollständige A/B-Fahrten**.

Die Messungen erfassen Storage-Zeit, `createImageBitmap`-Zeit pro Layer, `decodeMs` pro Tile, `visibleReadyMs` bis zum vollständig gezeichneten sichtbaren Viewport, Renderzeit, Bitmap-Pixelbudget und einen Hash des finalen Canvas. **Keine** Mindestbeschleunigung wird verlangt.

## Messergebnisse

Vollständiger erfolgreicher CI-Lauf: [GitHub Actions #43209257979](https://github.com/markusjungblut/asset_labor/actions/runs/43209257979), [Codecommit `2484614`](https://github.com/markusjungblut/asset_labor/commit/248461488545264863135091e4193da7493959bf).

In den folgenden Zeilen ist jede Zahl das **arithmetische Mittel der Mediane aus zwei vollständigen gleichartigen Fahrten**. Das sind bewusst **keine** gepoolten p50-Werte und keine FPS-Messungen.

| Lastklasse | Decode p50-Mittel alt | Decode p50-Mittel parallel | Visible-ready p50-Mittel alt | Visible-ready p50-Mittel parallel |
|---|---:|---:|---:|---:|
| Smooth, 512/768 | 22 ms | **16 ms** | 52,5 ms | **48,5 ms** |
| Textured, 512/768 | 22 ms | **19,5 ms** | **47 ms** | 51,5 ms |
| Textured, 1024/1536 | **70 ms** | 83 ms | 148,5 ms | **145,5 ms** |

**Interpretiert:** Mehr PNG-Bytes bedeuteten in diesem synthetischen Fall bei gleicher Pixelauflösung nicht automatisch teurere Dekodierung. Der Wechsel zur vierfachen Pixelanzahl pro Layer machte die Dekodierung dagegen wesentlich kostspieliger. Parallelisierung half punktuell bei Tile-`decodeMs`, erzeugte aber in keiner Größenklasse einen robusten, konsistenten **End-to-End**-Vorteil. Insbesondere bei texturierten 512/768-Kacheln wurde die vollständige Sichtbarkeit messbar langsamer, obwohl die Tile-Dekodierung schneller war.

Die individuellen Fahrten hatten folgende sichtbare `visibleReadyMs`-Mediane:

- Smooth sequentiell: 56, 49 ms; parallel: 54, 43 ms.
- Textured sequentiell: 48, 46 ms; parallel: 52, 51 ms.
- Textured-Large sequentiell: 133, 164 ms; parallel: 157, 134 ms.

Die endgültigen Pixelhashes stimmten **innerhalb jeder Lastklasse bei allen vier Fahrten** überein: Smooth `74c2b66d`, Textured `3d6698c4`, Textured-Large `c6c4a292`.

Wichtiges Gegenargument für voreilige Speicheroptimierung: **Alle zwölf Fahrten meldeten null Evictions.** Trotz verschiedener Pixelbudgets wurde hier **kein tatsächlicher Cache-/RAM-Druckfall** ausgelöst. Die Arbeit testet Dateigröße, Pixelauflösung und sichtbare Dekodierlatenz; sie belegt nichts darüber, wie viel Speicher ein dichter Originalatlas unter harten Cache-Evictions braucht.

## Abnahme, Grenzen und Kostendisziplin

[CI #43209257979](https://github.com/markusjungblut/asset_labor/actions/runs/43209257979) erfolgreich:

- **95/95 Node-Tests** (alle alten und die 25X-Fehler-/Reihenfolge-/Bitmap-Cleanup-Tests).
- Vollständige bisherige 120-WorldTile-Firefox-Regression mit Pan, Zoom, Fog, Caches und 1×/2×.
- Sechsfache Step25V-Zeitmessung, achtfache Step25W-/25X-Messung und neue zwölf Fahrten über drei echte PNG-Lastklassen.
- Kein Layer-Fehler, keine Verletzung der Pixel-RAM-Grenze, identische Endpixel innerhalb jeder Lastklasse.

Der erste Lauf [CI #43208527152](https://github.com/markusjungblut/asset_labor/actions/runs/43208527152) absolvierte bereits alle zwölf Tests, scheiterte jedoch an der **Bilddaten-Kontrollassertion**, weil die angeblich glatte Testklasse zunächst teure Gradienten statt ausreichend komprimierbarer flächiger Muster hatte. Die Fixture wurde korrigiert; in der erfolgreichen CI zeigt die flache Klasse tatsächlich ca. 22 KB gegenüber ca. 139 KB für die vergleichbar große Texturklasse. An der Viewer-Logik wurde nichts verändert. Weitere CI-Reruns sind nicht erforderlich; dieses Dokument verwendet `[skip ci]`.

Die PNG-Bilder sind **synthetisch**, keine Bilder aus dem nicht verfügbaren Windows-Originalatlas. Die Firefox-CI ist nicht der Windows-GPU-/I/O-Stack, die originale Kartendichte und ihre Fog-Schutzregeln wurden nicht dadurch produktiv validiert.

## Entscheidung

Die in Draft #134 eingebaute Option `?parallelDecode=1` bleibt **opt-in**, die alte sequentielle Variante (`parallelDecode=0`) bleibt die Standardeinstellung. Eine automatische Umschaltung nach PNG-Größe/Bytes wäre auf diesen Zahlen methodisch unbegründet. **Als nächste sinnvolle Hypothese** bleibt ein gezielter RAM-/Eviction-Test mit größeren sichtbaren Pixelmengen, allerdings nur dann, wenn dessen zusätzlicher Nutzen und CI-Kosten gerechtfertigt sind; spätestens bei Verfügbarkeit des Windows-PCs ist ein Originalatlas-Profil vorzuziehen.

Draft #135 enthält **nur die neue Firefox-Teststrecke** und Workflow-Einbindung; `main` und die lokalen Dateien wurden nicht verändert. PR #127 ist kein Teil dieses Stapels.
