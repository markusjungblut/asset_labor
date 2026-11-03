# Schritt 25G – Adaptive Wolkenrandbreite statt Wolken-Cache-Fallback

Stand: 03.11.2026 · auf `main` nach dem bestätigten [Step-25F-Merge #116](https://github.com/markusjungblut/asset_labor/pull/116).

## Warum die Wolken trotz Cache weiterhin teuer sind

Das letzte Firefox-Profil der echten Karte `v1-0374527a` hat **378 Wolken-Cache-Fallbacks bei 596 Frames** sowie `cloudMs p95=91ms` dokumentiert. Anders als die statische Weltkomposition kommen die Wolken aus dem `cloud-artwork.js`-Bitmapfeld. Bei einem großen Browserfenster kann das programmatisch vorbereitete Cloud-Backdrop-Raster mehr als die **8,5 Mio. begrenzten Rasterpixel** benötigen. Die bisherige Funktion `paintCloudBackdrop()` entscheidet dann `return false` und lässt in `draw()` jedes Mal `clouds.drawBase()` die teuren Originalstempel unmittelbar auf den Anzeigecanvas malen.

Der Code verwendet bei einer 2859×1382 großen CSS-Ansicht und 85% Zoom bisher rund 272px CSS-Overscan auf jeder Seite. Die weichen Wolken selbst werden bereits in **1,25×** gerendert; ein hartes A/B mit weniger Wolkenqualität wäre nicht akzeptabel, weil es die Fehlerquelle verschleiert.

## Umsetzung

`adaptiveCloudCache=true` reduziert nur die **Randbreite der unsichtbaren Vorhaltekacheln**, bis `Math.ceil((width+2*pad)*cacheDpr) × Math.ceil((height+2*pad)*cacheDpr)` **unter derselben existierenden 8,5-MP-Grenze** liegt. Dabei ist `cacheDpr` unverändert die bestehende `min(1.25,dpr)`-Berechnung. Der mathematisch ermittelte maximale quadratische Rand wird zusätzlich per ganzzahligen Pixel-Checks verifiziert; kein neues unbeschränktes Offscreen-Canvas.

Der vorhandene stabile Wolken-Rastercache kann dadurch auch bei ultrabreiten 2×-Terrain-Spielansichten eingerichtet werden. **Ein Cache ist aber nicht immer schneller:** Auf dem getesteten Linux-/Firefox-Runner kostete allein das Kopieren des großen 1,25×-Canvas deutlich mehr als das direkte Zeichnen der einfachen Wolkenstempel.

Deshalb ist `autoCloudStrategy=true` nun Standard: Für die aktuelle Kombination aus **Viewportgröße, Zoomstufe, Geräte-DPR und Wolken-Asset-Version** zeichnet der Viewer vier Frames direkt und anschließend vier bereits warm gespeicherte Cache-Hits (der erste, einmalige Cache-Aufbau zählt nicht als Warm-Hit). Danach wird der Cache nur dann weiter verwendet, wenn die gemessene Cachedraw-Zeit **mindestens 15 % geringer** ist. Andernfalls zeichnet die Karte weiter direkt und verwirft den unbenötigten großen Cloud-Canvas. Bei Zoom-/Fenster-/Asset-Wechsel kalibriert sie neu. Bei extrem großen Fenstern bleibt die 8,5-MP-Grenze unverändert. Wolkengrafiken, Hintergrundfarben, Fog und Übergänge sind in beiden Pfaden unverändert; es wird ausschließlich die Bildschirmkomposition ausgewählt. Das Raster bleibt im gecachten Fall genau an die Welt gebunden; `previous.pad===pad` ist Teil der Gültigkeitsbedingungen.

**Keine Änderung** an echten Cloud-PNGs, Fog-Dissolve, Cloud-Zellklassifizierung, alpha-prämultiplizierter Darstellung, Welt-/Ground-DPR, Scenery, Panorama-Patches, 1×-/2×-LOD, Original-IndexedDB, Rasterbudget, Authoring oder ZIPs.

Für A/B setzt `&cloudPad=0` den alten großen Overscan mit direktem Fallback wieder ein; `&cloudAuto=0` erzwingt den neuen großflächigen Cache ohne Laufzeitwahl. Beide Flags sind unabhängig von `&streamCache=0` und `&prefetchGuard=0`. Der Runtime-Bericht und `perf=1`-Frameverlauf zeigen `adaptiveCloudCache`, `cloudEffectivePad`, `cloudPadClamps`, `cloudAutoMode`, `cloudAutoDirectMs`, `cloudAutoCachedMs` und die Anzahl der erfassten Entscheidungen.

## Automatische Testabdeckung

`tests/test_rendering_step25g_adaptive_cloud_pad_20261103.cjs` stellt mit einem simulierten 2859×1382-Canvas Folgendes sicher: Bei Zoom .85 und 1.25× Cloud-DPR entsteht ein Panorama **mit exakt dem bisherigen 8,5-MP-/32,4-MiB-Limit**, dessen Rand zwar kleiner als 272px, aber weiterhin ausreichend groß zum Schwenken ist. Alle nachfolgenden unveränderten Frames verwenden den Cache und zeichnen keine Cloud-Basis neu. Mit `adaptiveCloudCache=false` bleibt der bisherige direkte Wolkenfallback erhalten.

Der GitHub-Workflow führt diese Node-Regression automatisch aus. Zusätzlich öffnet Playwright die echte Browser-Spielansicht mit 120 synthetischen Weltpaketen, 399 Fog-Hexes und vier vorbereiteten Cloud-Dateien und vergleicht **fünf** Varianten: `guarded` (neue Automatik), `legacy` (ältere Tile-Prefetch-Strategie), `noStream` (alter Welt-Renderer), `noCloudPad` (alter Wolken-Pfad) und `forceCloud` (neuer Cloud-Cache ohne automatische Auswahl). Die Testserie archiviert Kaltstart-/Warm-Pan-JSON-Berichte und Screenshots. Die Performance-Gates vergleichen direkt gerenderte p95-Draw- und FrameGap-Zeiten und verhindern eine schwere Regression durch den Cloud-Cache.

## Nachgewiesener Firefox-Performancevergleich

Der erste echte Browser-Lauf **#41692544777** war *funktional erfolgreich, aber langsamer*: Das ungeprüft erzwungene Wolken-Raster verursachte **76ms Draw-p95 und 79ms FrameGap-p95**, gegenüber **55ms und 66ms** beim unveränderten direkten Zeichnen. Eine pauschale Aktivierung ist deshalb ausdrücklich verworfen worden.

Der zweite automatische Browser-Lauf [**#41696084702**](https://github.com/markusjungblut/asset_labor/actions/runs/41696084702) mit der neuen Selbstkalibrierung hat **Node- und Firefox-Tests vollständig bestanden**. Dieselbe 2859×1382-Synthetikszene mit 120 WorldTiles, 399 Fog-Hexes und 4 Wolkenbasen ergab:

| Variante | Warm-Pan Draw p95 | FrameGap p95 | Ergebnis |
| --- | ---: | ---: | --- |
| `guarded` – Automatische Wahl | **52ms** | 68ms | Wahl: **direkt**; 4 direkte und 4 gecachte Warm-Hits zum Vergleich |
| `noCloudPad` – Alte Direktvariante | 57ms | **61ms** | Keine zusätzlichen großen Raster |
| `forceCloud` – Cache erzwungen | 83ms | 84ms | 1.25×-Raster auf dieser Hardware klar schlechter |
| `noStream` – Alter Welt-Direct-Fallback | 187ms | 196ms | 25F-Weltpanorama bleibt notwendig |
| `legacy` – Alter Prefetch | 103ms | 104ms | Andere Laufzeitbedingungen durch mehr Prefetch |

In der `guarded`-Messung betrug die kalibrierte direkte Cloud-Zeichenzeit **21,8ms im Mittel**, die warme Cachedraw-Zeit **22,5ms**; der Puffer war damit nicht mindestens 15% schneller und wurde folgerichtig abgeschaltet. In der separaten `legacy`-Variante betrugen die Werte **29,8ms vs. 21,3ms**; hier entschied sich die neue Funktion tatsächlich für den **Cache**. Damit wurden *beide* Entscheidungszweige im echten Firefox durchlaufen.

**Einordnung:** Die Warm-Pan-Ergebnisse sind nicht hardwaregleich mit dem Windows-Firefox des Nutzers. Die 1×-/2×-Terrain- und Fog-Qualität wurde nicht verändert. Die Auswahl nutzt gemessene Browserlaufzeiten statt blind zusätzliche Speicherbudgets zu beanspruchen. Keine manuellen Kartentests durch den Nutzer mehr voraussetzen.

**Status:** Funktionelle Node- und reale Firefox-Abnahme auf der synthetischen Referenzkarte grün; PR zur Integration bereit, sobald der neue Dokumentations-Commit denselben CI-Check erfolgreich durchläuft.
