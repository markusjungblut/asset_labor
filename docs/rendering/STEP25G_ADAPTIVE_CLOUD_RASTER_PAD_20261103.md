# Schritt 25G – Adaptive Wolkenrandbreite statt Wolken-Cache-Fallback

Stand: 03.11.2026 · auf `main` nach dem bestätigten [Step-25F-Merge #116](https://github.com/markusjungblut/asset_labor/pull/116).

## Warum die Wolken trotz Cache weiterhin teuer sind

Das letzte Firefox-Profil der echten Karte `v1-0374527a` hat **378 Wolken-Cache-Fallbacks bei 596 Frames** sowie `cloudMs p95=91ms` dokumentiert. Anders als die statische Weltkomposition kommen die Wolken aus dem `cloud-artwork.js`-Bitmapfeld. Bei einem großen Browserfenster kann das programmatisch vorbereitete Cloud-Backdrop-Raster mehr als die **8,5 Mio. begrenzten Rasterpixel** benötigen. Die bisherige Funktion `paintCloudBackdrop()` entscheidet dann `return false` und lässt in `draw()` jedes Mal `clouds.drawBase()` die teuren Originalstempel unmittelbar auf den Anzeigecanvas malen.

Der Code verwendet bei einer 2859×1382 großen CSS-Ansicht und 85% Zoom bisher rund 272px CSS-Overscan auf jeder Seite. Die weichen Wolken selbst werden bereits in **1,25×** gerendert; ein hartes A/B mit weniger Wolkenqualität wäre nicht akzeptabel, weil es die Fehlerquelle verschleiert.

## Umsetzung

`adaptiveCloudCache=true` reduziert nur die **Randbreite der unsichtbaren Vorhaltekacheln**, bis `Math.ceil((width+2*pad)*cacheDpr) × Math.ceil((height+2*pad)*cacheDpr)` **unter derselben existierenden 8,5-MP-Grenze** liegt. Dabei ist `cacheDpr` unverändert die bestehende `min(1.25,dpr)`-Berechnung. Der mathematisch ermittelte maximale quadratische Rand wird zusätzlich per ganzzahligen Pixel-Checks verifiziert; kein neues unbeschränktes Offscreen-Canvas.

Der vorhandene stabile Wolken-Rastercache kann dadurch auch bei ultrabreiten 2×-Terrain-Spielansichten eingerichtet werden. Kleine Kameraschwenks verwenden denselben Raster ohne erneute `clouds.drawBase()`-Stempel; bei größeren Kamerabewegungen wird das geometrisch korrekte Voll-Raster wie bisher neu erzeugt. Das Raster bleibt genau an die Welt gebunden, `previous.pad===pad` ist Teil der Gültigkeitsbedingungen.

**Keine Änderung** an echten Cloud-PNGs, Fog-Dissolve, Cloud-Zellklassifizierung, alpha-prämultiplizierter Darstellung, Welt-/Ground-DPR, Scenery, Panorama-Patches, 1×-/2×-LOD, Original-IndexedDB, Rasterbudget, Authoring oder ZIPs.

Für A/B ist `&cloudPad=0` unabhängig von `&streamCache=0` und `&prefetchGuard=0` verfügbar. Der Runtime-Bericht und `perf=1`-Frameverlauf bekommen `adaptiveCloudCache`, `cloudEffectivePad`, `cloudPadClamps`.

## Automatische Testabdeckung

`tests/test_rendering_step25g_adaptive_cloud_pad_20261103.cjs` stellt mit einem simulierten 2859×1382-Canvas Folgendes sicher: Bei Zoom .85 und 1.25× Cloud-DPR entsteht ein Panorama **mit exakt dem bisherigen 8,5-MP-/32,4-MiB-Limit**, dessen Rand zwar kleiner als 272px, aber weiterhin ausreichend groß zum Schwenken ist. Alle nachfolgenden unveränderten Frames verwenden den Cache und zeichnen keine Cloud-Basis neu. Mit `adaptiveCloudCache=false` bleibt der bisherige direkte Wolkenfallback erhalten.

Der GitHub-Workflow führt diese Node-Regression automatisch aus. Zusätzlich öffnet Playwright die echte Browser-Spielansicht mit 120 synthetischen Weltpaketen, 399 Fog-Hexes und vier vorbereiteten Cloud-Dateien und vergleicht vier Varianten: `guarded`, `legacy`, `noStream` und neuerdings `noCloudPad`. Dabei werden Real-Canvas-Canvas, Renderprofil, Wolken-Cache-Hit/Fallback, RAM, Pan p95 und FPS-Abstände erfasst. Der neue Wolkenpfad muss in echt einen Puffer erzeugen; der A/B-Kontrollpfad weiterhin direkt stempeln. Die Gesamt-Draw-Dauer darf im Vergleich zur gleichen Streaming-Strategie nicht unvertretbar ansteigen.

**Status vor CI-Abnahme:** Anpassungen in separatem PR. Keine native Windows-Testkarte oder manuelle Nutzeraktion erforderlich. Erst nach tatsächlichem grünem Browser-A/B und überprüften Zahlen freigeben; keine extrapolierte FPS-Garantie.
