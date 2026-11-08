# Schritt 25L – DOM-Compositor für den bereits maskierten World-Rastercache (A/B)

Stand: 08.11.2026 · **experimenteller Draft, nicht im Standard aktiviert**.

## Messproblem und Entscheidungshypothese

Schritt 25I/25K haben wiederholt einen hohen synchronen World-Canvas-Blit
während aktiver Pan-Frames gemessen. Im finalen 25K-Firefox-Vergleich
[#42510464245](https://github.com/markusjungblut/asset_labor/actions/runs/42510464245)
lag die gesamte Pan-Zeichenzeit bei 40 ms p95 und der Frame-Abstand bei
47 ms p95 (je 30 aktive synthetische Firefox-Frames). `worldBlitMs`
umfasst einen Browser-Canvas-Aufruf, nicht die separat gemessene
GPU-Present-Zeit. Der 25J-Versuch, stattdessen das volle Raster durch
eine andere `drawImage`-Signatur zu kopieren, wurde als langsamere
Alternative verworfen.

Hypothese: **CSS-/DOM-Verschieben des *bereits vorhandenen* World-Rasters**
ersetzt den synchronen `drawImage`-Viewport-Kopiervorgang beim Pan,
ohne neue Spielkartenbilder zu erzeugen oder die bestehende Auflösung
zu ändern. Das kann vom Browser-Grafik-Compositor beschleunigt werden,
kann aber auch zusätzlichen GPU-Speicher oder teure Layersynchronisierung
auslösen. Es ist daher ausdrücklich **nicht** ungeprüft schneller.

## Optionale Architektur

- `&worldDOM=1` aktiviert ausschließlich den Diagnosepfad.
  Der normale Viewer behält die bekannte 9-Argument-`drawImage`-
  Weltkomposition. `#worldLayer` ist ohne Opt-in versteckt und kann keine
  Pointer-, Zoom- oder Drag-Events abfangen.
- Statt das `overviewRaster.canvas` bei jedem Pan auf `#game` zu
  kopieren, wird **dieselbe** auf 16,5 Mio. Pixel/8192 Pixel Kantenlänge
  begrenzte Raster-Canvas-Instanz als HTML-Canvas in `#worldLayer`
  eingehängt und per `translate3d(-sx/dpr,-sy/dpr,0)` verschoben.
  Die Pixelkoordinaten entsprechen dem bislang verwendeten
  `drawImage(m.canvas,sx,sy,width*dpr,height*dpr,0,0,width,height)`.
  CSS-Breite/-Höhe entsprechen dem bestehenden Raster-DPR.
- Der opake Cloud-Backdrop bleibt auf `#game` **unter** der Welt.
  Der autorisierte dynamische Fog wird unverändert auf der transparenten
  `#fogOverlay`-Ebene **über** der Welt gemalt. `#worldLayer` beschneidet
  auf die `main`-Viewport-Grenzen. Der World-Raster enthält weiterhin
  ausschließlich die bekannten/explorierten Hexmasken einschließlich
  Scenery-Überhang und ursprünglicher Sortierung.
- Bei neuem Decode, Dirty-Patch, LOD-, Zoom-, DPR-, Projektions-, Kamera-,
  Viewport- oder Cloud-Asset-Wechsel gelten die bisherigen Raster-
  Invalidierungsregeln. Der neue DOM-Pfad zeigt exakt den so
  zusammengesetzten neuen/angepassten Raster, **niemals** ein ungeprüftes
  Original-Tile.
- Ist der Panorama-Cache nicht nutzbar oder läuft eine Snapshot-
  Zoomvorschau, bleibt der bisherige direkte World-Zeichenpfad
  verfügbar. Für eine Zoom-in-Vorschau werden der Cloud-Hintergrund,
  die sichtbare DOM-World-Quelle und das autorisierte Fog-Overlay in
  dieser Reihenfolge in die temporäre Vorschau kopiert. Die zusätzlichen
  Ebenen werden während der Vorschau verdeckt.
- Das DOM verwendet **die bereits allokierte Raster-Canvas selbst**,
  statt sie erneut zu duplizieren. Der aktivierte Fog-Canvas erfordert
  jedoch zusätzlich bis zu etwa 8 Mio. Display-Pixel (~30,5 MiB).
  Die tatsächlichen möglichen GPU-Compositor-Kopien lassen sich nicht
  allein an diesem JS-Counter ablesen und sind gesondert zu bewerten.

## Automatische Abnahme

- Native Tests `tests/test_rendering_step25l_dom_world_20261108.cjs`:
  Rasteridentität/Positionsformel, Pan-Reuse ohne `drawImage`,
  unveränderte 25F-Dirty-Patches nach asynchroner Tile-Ankunft,
  Fog über unbereitem/unerlaubtem Terrain, Legacy-Ein-Canvas-Pfad,
  Canvas-Reihenfolge in der Zoomvorschau, keine Archivlöschung.
- Automatisches Headless-Firefox-A/B mit derselben synthetischen
  120-WorldTile-/399-Fog-Hex-Karte und identischem 30-Frame-Pan:
  `guarded` (alter Produktionsstandard) gegen `domWorld`
  (`worldDOM=1`). Zusätzlich zu `drawMs` und `frameGapMs` werden
  `worldBlitMs`, `worldMs`, DOM-aktive Pan-Frames, CSS-Layer-
  Geometrie sowie ein Screenshot aller zusammengesetzten Ebenen erfasst.
- Die bereits vorhandenen 25K-Fog-Animationstests und 1×/2×-LOD-
  Continuity-Tests bleiben verpflichtend. Ein Renderpfad darf nicht
  nur aufgrund eines schnelleren JS-Zeitwerts angenommen werden:
  der DOM-/GPU-Kompositor kann die eigentliche Präsentation verzögern.
- **Entscheidung erst nach echten CI-Werten und Bildgegenprüfung.**
  Bei Regression, sichtbar anderer Geometrie oder unklaren
  Hardware-/Compositor-Folgen bleibt 25L außerhalb von `main`.
  Bei funktionaler Abnahme ohne ausreichenden Hardware-Nachweis
  allenfalls ein streng opt-in Schalter, niemals automatische Aktivierung.

Keine manuellen Windows-Tests durch den Nutzer, keine Änderungen am
privaten ~600-MB-Originalatlas, der Original-/1×-/2×-IndexedDB,
Fog-Autorisierung, 850-ms-Dissolve-Interpolation, PNG-Rasterauflösung,
Cachebudgets oder Terrain-Worker-Aufträgen. Kein 60-FPS-Versprechen.
