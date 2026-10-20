# Asset-Labor v0.11.7 – Chunk-basierte große Karten

## Ziel und Umfang

Das Asset-Labor kann jetzt 7, 19, 37, **91, 169, 271 oder 397 Hexfelder** erzeugen. Die Karten bleiben axial aus denselben 256-Welteinheiten-Hexen aufgebaut, nicht aus skalierten Einzelgrafiken. Szenen-JSON akzeptiert/speichert die neue `sceneSize` sowie den optionalen A/B-Schalter `chunkRendering`.

**Bei mehr als 37 Hexfeldern ist Chunk-Rendering automatisch aktiv.** Kleinere Karten behalten zunächst den Legacy-Renderer und besitzen einen Schalter zum direkten Vergleich. In der Ansicht `Testszene` können die Größen gewechselt werden. `Home` bringt den Kamera-Zoom auf eine der Kartengröße entsprechende Ausgangsstufe.

## Architektur

| Ebene | Umsetzung v0.11.7 |
|---|---|
| Terrain + weiche Biomübergänge | **512 × 512 Welt-Einheiten-Chunks**, mit 128 Einheiten Halo für Verläufe und Relief. `autotile.build(...,{bounds})` rastert nur den Weltbereich des jeweiligen Chunks, aber bezieht benachbarte echte Hexzellen in die Materialinterpolation ein |
| Wasser-/Landtrennung und Höhenrelief | Pro Terrainchunk korrekt getrennte Wasser-/Landraster und bei Relief ein lokal gecachter Höhenraster; der Clip schneidet nur die fertige Core-Region und lässt den Halo unsichtbar |
| Küsten-/Ufergrafiken | **Separate sichtbare Küstenchunks**. Die tatsächlich existierenden globalen Land/Wasser-Grenzsegmente werden geteilt, sodass bei Chunkrändern keine künstlichen Küsten entstehen. Küstenwasser-Portale aus Flüssen bleiben erhalten |
| Wege | **Statische Wegtexturen in eigenen sichtbaren Chunks** statt mehrfacher vollständiger Neuzeichnung; Flussüberquerungen bleiben als separate Brücken-Overlays erhalten |
| Flüsse + Brücken | Gleiche Hexkanten-Flussgeometrie und sechs Brückenorientierungen, aber **Offscreen-Culling** beim Zeichnen; Schnittpunkte werden weiter gecacht |
| Nature-Sprites und Berge | Vor teurer Sprite-Validierung **frühe Kamera-Sichtbarkeitsprüfung**, bei Bergen mit größerem Puffer für hohe PNG-Kronen/Gipfel; Bergschatten sind bereits lokal gerastert/cached |
| Wald-Bodentextur | **Absichtlich weiterhin globaler, zusammenhängender Waldregions-Renderer** aus `forest-ground.js`. Die komplette Union ist wichtig für nahtlose, unveränderte Wald-Bodentexturen. Für große Karten ist die Rasterauflösung über Zoom stabil, um nicht beim Scrollen/Zoomen die ganze Maske neu aufzubauen |

Damit ist die Chunk-Architektur bereits nutzbar, aber **noch kein komplett entkoppelter Worker-/GPU-Renderer**. Die unveränderte globale Waldregionsmaske bleibt der nächste mögliche Schritt für sehr große Karten; sie darf nicht in einzelne Hexstempel mit Nahtproblemen zerlegt werden.

## Cache und Sichtbarkeit

`chunks.js` berechnet anhand des Kameraausschnitts die tatsächlich sichtbaren Chunks. Die alte Karte oder außerhalb liegende Chunks werden **nicht vorab komplett gerastert**. Fehlende Chunks landen in einer Warteschlange und werden **maximal einzeln pro Idle-Callback** erzeugt. Die Kamera bleibt währenddessen interaktiv; ein einzelner synchroner Chunkaufbau kann dennoch kurz den Browser-Hauptthread blockieren.

- Stabiler Weltkoordinaten-Ursprung: `Math.floor(x/512)`, auch bei negativen Weltkoordinaten
- Weltverankerte Pixeltexturen und ein Berechnungshalo verhindern doppelte/weiche Übergangsnähte
- LRU-Caches für Terrain, Wege und Küste mit separaten Speichergrenzen
- Sichtbare Chunks sind vor direkter Verdrängung geschützt; diese Regel verhindert endlose `Render → Evict → Render`-Schleifen bei niedriger Zoomstufe
- Geländedichte unter 75 % Zoom: **0,5 Rasterpixel pro Welteinheit**; bei höherem Zoom 1 Pixel/Welteinheit
- Bei Terrain- oder Reliefänderung Invalidierung; bei Kamera-Pan nur Wiederverwendung sichtbarer Raster
- Automatische DPR des Canvas bleibt wie zuvor auf maximal 2× begrenzt

## Diagnostik

Die neue Anzeige **„Chunk-Renderer“** im Panel `Testszene` enthält sichtbare und gezeichnete Terrain-Chunks, ausstehende Builds, Cache-Größe, gepufferte MiB und die letzte Chunk-Bauzeit. Unter `Ansicht & Schärfe` bleibt die Zeitmessung von Gelände, Wege/Flüsse und Sprites/Schatten.

Für Entwickler sind außerdem `window.__vedrasChunkProfile`, `window.__vedrasShoreChunkProfile` und `window.__vedrasRenderProfile` verfügbar.

## Warum keine 397 Einzel-Hexraster?

Chunk-Raster fassen mehrere Hexe in einem **weltverankerten Pixelfeld** zusammen. Kantenverlaufsberechnungen beziehen echte benachbarte Hexe über die Chunkgrenze hinweg ein; bei einem naiven Einzel-Hexrendering würden Biomübergänge, Wasserstreifen und Alpha-Ränder unterschiedliche Normierungen aufweisen und sichtbare Nähte erzeugen.

## Weitere Ausbaustufen für das spätere Spiel

1. **Worker / OffscreenCanvas für Chunkbau:** Der Pixelaufbau ist aktuell noch synchron innerhalb eines Idle-Callbacks. Für große Karten und weitere Biome gehört er mittelfristig in Web Workers, mit begrenztem CPU-Budget pro Frame
2. **Speicherbudget pro Gerät:** Qualität und Anzahl der Chunks am tatsächlichen RAM/GPU-Budget ausrichten; entladene Chunks bei Bedarf wiederherstellen
3. **Waldregionen in stabilen Chunk-Masken:** Nur mit einem geteilten, regionseinheitlichen Außenrand/Opacity-Feld, nicht als einzeln ausgeblendete Sechsecke
4. **Räumliche Entitäten-Indizes:** Bei viel mehr als 397 Hexen und mehreren Tausend Figuren Sprite-Suche und Sortierung mittels Spatial Hash/Quadtree durchführen
5. **GPU-Atlas und instanziertes Zeichnen:** Bei größeren Karten später WebGL/WebGPU für Textur-Atlanten, Tiles, Decals, Shader-basierte Bodenschattierung
6. **Gezielte Invalidation:** Wenn ein Weg gebaut wird, nur die betroffenen Wegchunks invalidieren; größere Terraforming-Änderungen invalidieren nachbarbeteiligte Geländechunks

## Abnahmekriterien

Automatisierte Regression `tests/test_chunk_rendering_0117.cjs` prüft alle sieben Szenengrößen, sichtbare vs. nicht sichtbare Chunks, verzögerten Bau, Cancelling veralteter Aufgaben, LRU, Weltkoordinaten und Integration der Editor-/Szenendaten. Die älteren Fluss-, Küsten-, Berg-, Nature- und Wegtests laufen weiterhin.

**Offen:** echte visuelle Browserabnahme und Profiling beim Laden einer 397-Hex-Karte, Pan/Zoom und Straßenplatzierung. Ohne diese Messung kann noch keine konkrete Verbesserung in FPS oder Millisekunden garantiert werden. Die Originalgrafiken und Wald-Bodentexturen bleiben unangetastet.
