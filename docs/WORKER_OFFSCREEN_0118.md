# Asset-Labor v0.11.8 – Web Worker + OffscreenCanvas

## Implementierung

Die bisherige weltverankerte Chunk-Engine (v0.11.7) bleibt erhalten. Für **Terrain- und Relief-Chunks** wird der teure CPU-/Pixelaufbau auf einen eigenen Web Worker ausgelagert, sofern `Worker`, `OffscreenCanvas` und `createImageBitmap` unterstützt werden. Die eigentliche Canvas-Karte bleibt auf dem Hauptthread und ist während der Berechnung weiterhin bedienbar.

### Dateien und Pipeline

- **`terrain-worker-client.js`** ist der Hauptthread-Adapter. Er startet `terrain-worker.js` beim ersten angeforderten Chunk, überträgt jedes verwendete PNG **einmal je geladenem Image-Element** als `ImageBitmap` (Transfer-Liste), verarbeitet Job-IDs und Fehler, und liefert dem Chunk-Cache das gerenderte Ergebnis als Promise.
- **`terrain-worker.js`** erstellt `OffscreenCanvas`-Zeichenflächen, importiert die bestehenden Module `autotile.js`, `polish.js`, `relief.js`, führt das ursprüngliche Auto-Tiling mit den Weltkoordinaten-/Halo-Bounds aus und überträgt die fertigen Land-/Relief- und Wasser-Bitmaps via Ownership-Transfer zurück.
- **`autotile.js`** akzeptiert als Texturquelle nun sowohl HTMLImageElement (`naturalWidth/Height`) als auch ImageBitmap (`width/height`). Die übrige Materialgewichtung, Farbmischung und Wassertrennung ist unverändert.
- **`chunks.js`** versteht synchrones `buildTile()` **und** asynchrone Promise-Ergebnisse. Während eine Worker-Anfrage läuft, werden Maus-, Zoom- und UI-Eingaben nicht durch den Pixelrenderer blockiert. Beim Szenenwechsel veraltete Ergebnisse verwerfen und `ImageBitmap.close()` verwenden; im LRU freigegebene Bitmaps werden geschlossen.
- **`app.js`** bildet Materialklassen, Materialskalierung, Übergangsregeln, Terrain-Polishing und Reliefparameter in serialisierbare Jobbeschreibungen ab. Die ursprüngliche `autotile.build()`/`relief.make()`-Pipeline ist unverändert als **Fallback** verfügbar.
- **`index.html`** bietet einen Schalter **Web Worker + OffscreenCanvas für Terrain-Chunks verwenden** im Testszene-Panel. Die Chunkdiagnose zeigt, ob der Worker aktiv ist oder der Hauptthread-Fallback läuft.

Die Küstennähe des Reliefs wird aus denselben Hex-Wasserklassen in der Worker-Seite rekonstruiert. Wasser bleibt exakt flach; der Höhenversatz bleibt auf der separaten Land-/Relief-Ebene. Jede alte und neue Chunkposition verwendet dieselben absoluten Weltkoordinaten.

### Sicherheit und Browserkompatibilität

- Die Workerdatei wird als normaler same-origin JavaScript-Worker geladen; kein externes CDN, kein Netzwerkzwang.
- Der Worker erhält **keinen Zugriff auf DOM oder sichtbares Canvas**. Es werden nur offscreen Canvasflächen und Bilddaten verwendet.
- Quellbilder werden nicht als riesige RGBA-Arrays für jeden Chunk hin- und herkopiert. Sie werden einmal als `ImageBitmap` hochgeladen; fertige Chunk-Bilder werden ebenfalls als `ImageBitmap` übertragen.
- Bei fehlender Browser-Unterstützung, nicht ladbarem Worker oder Renderfehler nutzt der Chunk-Renderer wieder den bisherigen Hauptthread-Code.
- Aktive Jobs erhalten eine ID und einen Timeout. Die Chunk-Engine verwirft Ergebnisse aus einer alten Szenengeneration, inklusive Freigabe der übertragenen Bitmaps. Die bestehenden Cache- und Sichtbarkeitsgrenzen bleiben aktiv.

## Was bleibt auf dem Hauptthread?

**Noch nicht ausgelagert:** Darstellung der bereits fertigen Bitmap-Chunks, Küsten-/Ufer-Builds, Straßen-Chunk-Oberflächen, globaler Wald-Boden-Maskenrenderer, Sprites, Schatten-Overlay und dynamische Spielobjekte. Diese Ebenen werden weiterhin über ihre bisher eingeführten Caches und Sichtbarkeitsprüfungen optimiert. Der neue Worker verbessert in erster Linie die **Reaktionsfähigkeit** beim Erzeugen von Terrain-/Relief-Chunks; er erhöht nicht zwangsläufig die fps, wenn Sprites, Küsten oder der globale Waldboden dominieren.

Die originale `forest-ground.js`, Waldtexturen, Waldmasken und alle Original-Terrain-/Nature-PNGs bleiben unberührt.

## Prüfen im Browser

1. `git pull origin main`, Server neu starten und die Seite hart neu laden.
2. Asset-Labor **v0.11.8** prüfen, unter **Testszene** eine **169- oder 397-Hex-Karte** auswählen.
3. **Worker verwenden** aktiv lassen und Kamera bewegen. Die Statuszeile `Terrain: ... Worker/OffscreenCanvas aktiv` muss bei unterstütztem Browser erscheinen; der Zähler abgeschlossener Worker-Chunks sollte steigen.
4. Den Worker-Schalter **deaktivieren**, dieselbe Kartengröße erneut bewegen und die Zeiten unter `Ansicht & Schärfe` vergleichen.
5. Falls `Hauptthread-Fallback` erscheint, in der Browserkonsole nach `Terrain Worker unavailable` oder nach Script-Ladefehlern suchen.
6. Bei Relief-Einsatz kontrollieren, dass Küstenwasser flach und Landplattformen auf gleicher Höhe bleiben.

Technische Tests:
- `tests/test_worker_pipeline_0118.cjs`: Quellbildtransfer, Einmal-Upload, Job-IDs, Worker-Abschaltung, asynchrone Chunks, Freigabe und veraltete Szenen
- `tests/test_worker_raster_parity_0118.cjs`: bytegleicher Worker-/Hauptthread-Auto-Tiling-Raster über **22.300 synthetische Pixel** mit zwei angrenzenden Biomen, getrenntes Wasser/Relief und aktives Heightfield
- bestehende Chunk-, Fluss-, Küsten-, Natur-, Straßen- und Schattentests

Die Tests können ein echtes Browser-Profiling und einen Screenshot-Vergleich mit allen Originalgrafiken nicht ersetzen.

## Weitere Ausbauschritte für das Browsergame

Wenn sich Terrain im Worker bewährt, können als nächstes Ufer-Chunks, statische Weggrafiken und eventuell Waldregionsmasken in dieselbe Pipeline aufgenommen werden. Langfristig ist ein Worker-Pool mit Priorisierung neuer sichtbarer Chunks, gezielter Chunk-Invalidierung und optionalen GPU-Texturatlanten sinnvoll. Ein Worker-Pool sollte erst eingeführt werden, wenn die Datenübertragung, das Renderbudget und die Reaktionsfähigkeit auf Zielgeräten gemessen wurden.
