# Schritt 25C – Große Firefox-Fenster: Kompositions-Caches dürfen nicht abschalten

Stand: 02.11.2026. Draft auf PR #111 (Schritt 25B); unveränderter 2×-/1×-Atlas.

## Ausgangspunkt – Nutzerbericht Step25B

Gespeicherter Firefox-Bericht `vedras_profile_v1-0374527a_cached(2).json`, Fenster 2859×929 CSS, 1.227 Frames, 524 Bildpakete, 391 Pan-Eingaben und 98 Zoom-Eingaben. Full-Reportdaten:
- 120 separate persistierte 1×-Kacheln wurden erfolgreich aus dem 2×-Cache erzeugt (kein Fehler), 123 weitere 1×-Cachetreffer.
- `drawMs p50=4ms p95=156ms`, `frameGapMs p50=33ms p95=172ms`, `decodeMs p50=60ms p95=778ms`; `evictions=465`, `loads=524`, `decodedPixels=93,291,071`.
- In 470 interaktiven Frames: `worldMs p95=77ms`, `cloudMs p95=74ms`, `fogMs p95=43ms`. Die längsten Zeichenvorgänge (~170ms) enthalten gleichzeitig 40–80ms World- und 40–100ms Cloud-Operationen.
- Originalregeln: Der Cache `paintOverview` wurde bei **padded canvas >8.5MP** ausgeschaltet; `paintCloudBackdrop` bei **>6.5MP**. Bei maximal ~8.0MP Display-Canvas und zusätzlichem World-Overhang passen beide Cache-Puffer nicht. Das war kein Cache-Miss, sondern permanent direkter Boden-/Scenery- und mehrhundertfacher Wolken-Stempel pro Kameraframe.
- Zeitanalyse: In den ersten ~60 s des Berichts dominieren 3–6 ms Renderframes; sechs Minuten später zeichnete der Viewer bei ~49%, 72%, 96% Zoom teilweise ~140–175ms pro Frame. In diesen langsamen Abschnitten steigt **keine** Panorama-/Wolken-Raster-Neuaufbauzahl, weil die Größengrenzen bereits vorher verweigern. Dieser Befund ist stärker belegt als eine pauschale „ImageBitmap decode ist allein schuld“-Hypothese.
- Messabschnitte sind **nicht** unter identischer Last; der Bericht enthält auch die erstmalige Konvertierung 120×1×. Daher keine direkte A/B-Prozentbehauptung gegenüber Schritt 25A.

## Umsetzung – bessere Caches statt neue Daten oder unscharfe Voransicht

- `frozen-map-runtime.js`: World-Cache darf bei `largeViewportCache=true` jetzt **16.5 Millionen gepufferte Pixel** halten (~63 MiB RGBA). Er wird **mit exakt dem gleichen Canvas-DPR wie die scharfe Spielkarte** gemalt – keine Downscaling-Kompromisse bei Bäumen, Boden oder Schatten; gleiche sortierte WORLD-Y/X-Scenery-Reihenfolge. Sicherheitsgrenze max. 8192px Kantenlänge, weiterhin nur ein World-Raster gleichzeitig.
- Wolkenhintergrund (`drawBase`) als eigenständiger, **1.25×-DPR**-Cache (vorher identisch zum teuren Terrain-DPR). Wolken sind intrinsisch weich; **Unready/Reveal-Fade und Fog-Transitions werden weiter live** in der eigentlichen Canvas-Auflösung gezeichnet. Wolkenraster-Maximum **8.5MP** (~32 MiB RGBA). Reuse-Versatz berücksichtigt Cloud-Cache-DPR statt Canvas-DPR. Kein Änderung der authored Fog-Hexes, Cloud-PNGs oder Freigabelogik.
- **Offscreen-prefetch** blockiert die Erzeugung des World-Panoramas nicht mehr, sobald **alle tatsächlich sichtbaren Kacheln fertig dekodiert** sind; fehlende sichtbare Bilder bleiben unter Wolken und werden weiterhin live gerendert. Ein unvollständiges sichtbares Panorama wird nicht als fertige Landschaft ausgegeben.
- `?cacheLarge=0`: Kontrollgruppe mit den ursprünglichen **8.5M-/6.5M-Pixel-Grenzen und Voll-DPR-Wolken**. Diese Option ändert keine Daten/LOD/Cache-RAM-Budgets.
- Neue Runtime-Zähler `worldCacheFallbackFrames`, `cloudCacheFallbackFrames`, `cloudBackdropMiB`, `worldRasterLimit`, `cloudRasterLimit`. `&perf=1` exportiert pro Frame beide Direkt-Fallback-Zähler sowie `worldRasterMiB`/`cloudRasterMiB`. Dadurch können wir beweisen, **ob** die verlangsamten Frames jetzt stattdessen Cache-Hits werden.
- Cachebusting der beiden Viewer-Skripte im HTML; vorhandene persistenten Bildpakete **nicht** löschen/ersetzen/neu backen.

## Reproduzierbare Tests

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step25c-large-viewport-composite-cache-20261102
git pull --ff-only origin feat/step25c-large-viewport-composite-cache-20261102
node --test tests/test_rendering_step24_live_camera_depth_20261102.cjs
node --test tests/test_rendering_step25a_profiler_20261102.cjs
node --test tests/test_rendering_step25b_lod_retention_20261102.cjs
node --test tests/test_rendering_step25c_wide_raster_20261102.cjs
```

Originaldarstellung (25C an): `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`

**A/B ohne 25C**, aber **mit 25B**: `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1&cacheLarge=0`

1. Bei *warmem* 49%-Zoom nach 1×-Cache-Aufbau und ohne Datenläufe: `profileReset()`, dann 15 Sekunden pannen und JSON speichern. Zweites Mal warm wiederholen. **Cloud/World-Fallback-Zähler** sollen bei 25C erheblich seltener steigen; Raster-Hits sollen zunehmen; Canvas `drawMs p95` und `frameGapMs p95` müssen sich real verbessern.
2. Gleiches in 96%-2×-Nahansicht: Bildschärfe, Pixelkanten, Texturen und Kronensortierung 25B vs 25C auf identischem Screen vergleichen.
3. Auf Backing-Budget achten: Der volle Welt-Raster-Cache kann ~63 MiB zusätzlich beanspruchen, der Cloud-Cache ~32 MiB. Zusammen mit bis zu 95M gepinnten/geretenten ImageBitmap-Pixeln (≥362 MiB), Canvas und GPU-Duplikaten kann der Browser einige hundert MiB zusätzlich belegen. Die größeren Caches **nicht blind in einer 15.000-Hex-Welt globalieren**; genau ein gepufferter Kameraausschnitt pro Cache bleibt erhalten.
4. **Cold-Streaming bleibt ein separates Problem:** Solange sichtbare Kacheln fehlen, kann der Viewer bewusst keinen endgültigen Welt-Raster verwenden. Hintergrund- und Tile-Prefetch-Mechanik muss gegebenenfalls mit Priorisierung optimiert werden. Wenn `pendingTiles>0` selbst im warmen Test lange anhält, erst erklären, welche Tiles fehlen. Aktuelle Version garantiert weiterhin keine 60 FPS bei erster Initialisierung.

## Prüfstatus

Isolierter V8-Laufzeitversuch mit 9 gespeicherten WorldTiles und dem ultrabreiten **2859×929**-Viewport, Zoom 96%, DPR 1.735: Neuer Wolkencache 4274×1862 (~7.96MP), voller World-Raster 5932×2584 (~15.33MP). Beide werden **genau einmal** angelegt; nächstes Kamerapanning (+12,+5) erhöht `overviewRasterHits` und `cloudBackdropHits` ohne erneuten Vollzeichenvorgang. `worldCacheFallbackFrames` und `cloudCacheFallbackFrames` bleiben dabei konstant. Die Node-Regression liegt im Repo. Native Node- und Windows-Firefox-End-to-End-Abnahme **noch offen**. PR bleibt Draft.


## Nutzerabnahme nach 25C: echte Firefox-Messung

Aus Upload `vedras_profile_v1-0374527a_cached(3).json` (2026-11-02 16:23:44Z), gleiche Testszene und Fenster 2859×929 CSS, **917 Frames, 489 Pan- und 71 Zoom-Eingaben**. `firstFullyVisibleMs=1206` gegenüber ~6658ms im vorherigen Profil; das vorige Profil enthielt aber den erstmaligen 1×-Umbau, dieses nicht – kein isolierter Startzeit-Benchmark.

| Metrik | vorher Step25B (cold 1×) | Step25C (warm 1×) | Befund |
|---|---:|---:|---|
| `drawMs p95` | 156ms | **6ms** | Großer Welt- und Wolken-Canvas-Bottleneck entfernt |
| `worldMs p95` | 77ms | **1ms** | Welt-Hits statt Vollzeichner |
| `cloudMs p95` | 74ms | **4ms** | Wolken-Backdrop-Hits |
| `frameGapMs p95` | 172ms | **259ms** | Trotz schnelleren Zeichnens immer noch hängende Darstellung |
| `decodeMs p95` | 778ms (enthielt 120 1×-Konvertierungen) | **79ms** (vollständig warmer 1×-Cache) | Decode unabhängig von Convert immer noch dominant |
| Kachelladevorgänge | 524 | **797** | Unterschiedliche Gesten, kein normalisierter Vergleich |
| Kachelverdrängungen | 465 | **731** | Sichtbare Re-Decode-/Eviction-Last |

Im 25C-Bericht liegen **490** aktive Frame-Gap-Messungen vor:
- Wenn `pendingTiles=0`: 318 Messungen, p50 **17ms**, p95 **54.9ms**, nur **10** Gaps >100ms.
- Wenn `pendingTiles>0`: 172 Messungen, p50 **57.5ms**, p95 **290.7ms**, **74** Gaps >100ms.
- Besonders bei Zoom **0.77×** (61 aktive Frames, p95 Gap ~309ms) und **0.70×** (35, p95 ~323ms) ist `pendingTiles` beinahe dauerhaft >0; bei **0.48×** (294 aktive Frames) p95 Gap ~52ms und nur ~5% der Frames enthalten laufende Tile-Anforderungen. Diese auffällige Korrelation rechtfertigt **Decode-/Eviction-Churn als Hauptarbeitsfeld** statt weiteres Draw-Microtuning. Sie beweist nicht allein, ob die tatsächliche Blockierung durch Firefox ImageBitmap-Decode, GPU-Upload, GC oder Input-/Event-Loop-Starvation entsteht. Auch direktes `drawMs` misst weder tatsächliche GPU-Präsentation noch Display-FPS.

Weltcache `overviewRasterHits=501`, `overviewRasterBuilds=198`, Wolken `cloudBackdropHits=561`, `cloudBackdropBuilds=45`. Die zusätzlichen Builds sind bei Lade-/Zoomwechseln erwartbar, sollten später jedoch als sekundäres Cache-Invalidierungsproblem isoliert optimiert werden. Roh-Loads `797` unter liegen 750 detaillierte `tileReads`, 47 Einträge wurden vom Profiler-Limit verworfen.

**Zusätzliche Testkorrektur:** Ursprünglicher Node-Test `test_rendering_step25b_lod_retention_20261102.cjs` konnte bei `awaitReads()` zu früh am Ende eines Dreier-Batches (`pending=0`, nur `decoded1x=3`) stoppen, weil die Testumgebung `requestAnimationFrame` unterdrückt. Geändert auf Warten bis **9** 1×-Kacheln plus stabilem weiterem `draw()`; isolierte V8-Reproduktion erfolgreich. Korrigiert in **beiden** Branches #111 und #112. Noch kein erneutes natives Node-Ergebnis des Nutzers.

### Weiterer Schritt (in Roadmap festhalten, nicht ungemessen im 25C-PR hineinmischen)

**25D: Speicherresidenten-Tiles und Dekodierpipeline**: Messung für spekulative Offscreen-Reads vs. tatsächlich sichtbare Tile-Anfragen erweitern; Eviction→Reload pro logischem Tile verfolgen; Budget-/Prefetch-Policy so anpassen, dass mehrfaches Dekodieren kurz zuvor verworfener 2×-Tiles bei 70–93 % vermieden wird, ohne die sichtbare Full-Resolution-Welt oder Fog-Sicherheit zu beeinträchtigen. Keine blind größere Cache-Grenze, kein Atlas-Rebake. Das neue Profil macht klar, dass ein weiterer reiner Canvas-Cache-Patch das 259ms-Gap-Problem nicht lösen wird.
