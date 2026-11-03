# Schritt 16B – sichtbare World-Tiles während Asset-Refresh behalten

## Auslöser: ZIP 10 (30. Oktober 2026)

Die identische 397-Hex-/2631-Vegetation-Referenzszene zeigte mit
PR #82 erstmals 0 fehlgeschlagene Sprite-Source-Bakes und erfolgreiche
initiale Readiness nach ~29,8 Sekunden. Während des 4×-Schwenkens
wurden jedoch 24 Terrain-PNGs bereitgestellt. Ein selektiver
`image-ready-ground-selective`-Batch invalidierte **114 World-Tiles**,
darunter alle vier aktuell sichtbaren. Der Pan-Endzustand verlor
dadurch sämtliche vier sichtbaren Kacheln (Coverage 0 %); rAF-p95
173,6 ms war **kein** gültiger Warm-FPS-Wert. Zoom p95 16,8 ms
diagnostisch, End-Coverage 100 %, ohne vollständige Warm-Abnahme.
Die spätere Zoom-/Küsten-Sichtprüfung zeigte 100 % Coverage und READY,
die dünnen senkrechten Wasserlinien bleiben ein separates Thema.

### Technischer Mechanismus

`world-tile-streamer.js::invalidateTiles` hat bisher fertige
Bitmap-Pakete sofort gelöscht und ihre Ressourcen geschlossen,
auch wenn ein Asset nur neue Farb-/Materialpixel bereitstellt.
Solange neue Terrain-, Shoreline- und Sprite-Quellen noch verarbeitet
werden, rendert der Tile-Compositor stattdessen nur Wolken/Leerräume.

## Implementierte Änderung

1. **Stale-while-revalidate ausschließlich bei
   `image-ready-ground-selective` und bei nachfolgenden
   `terrain-core-revision-changed`-Revisionen.** Es werden
   nur bereits vollständige, nichtprovisorische, **aktuell sichtbare**
   Pakete erhalten; alle außerhalb des Sichtbereichs und alle
   Vorschaupakete werden wie bisher freigegeben.
2. Erhaltene Bitmaps bleiben unter dem bisherigen Fog-/Sichtbarkeitsfilter
   als *vorläufig ältere Darstellung* sichtbar. Sie sind explizit
   `dirty` und werden in `render().stale`,
   `stats().staleTiles`, `stats().progress.stale` und
   `diagnostics().tiles[].stale` getrennt ausgewiesen;
   `progress.exact` zählt sie **nicht** als fertig.
3. `request()` und das Source-Retry-System behandeln solche
   `dirty`-Pakete als **neu anzufordernde** Quellen, nicht als
   Cache-Hit. Der vorhandene Source-Gate für Terrain/Ufer/Sprites
   bleibt. Bei kompletter neuer Quelle wird die alte Bitmap
   **atomar ersetzt und ordnungsgemäß freigegeben**.
4. Revisionsabgleiche verwerfen ein bereits als `dirty`
   gekennzeichnetes Paket nicht noch einmal, während das
   vorbereitete Terrain nachzieht. Dadurch entstehen keine
   unnötigen Lücken, wenn der Decode-Batch und
   `reconcileGroundRevisions` zeitlich versetzt eintreffen.
5. **Alle harten Invalidierungen bleiben hart**:
   `invalidate()`, Szenen-/Geometrie-/Editoränderungen mit
   anderen `invalidateTiles`-Gründen, nicht autorisierte
   Fog-Tiles und unvollständige Vorschaukacheln erhalten
   keinen überdauernden Materialfallback. Weggefallene
   Sichtberechtigungen werden unverändert maskiert.
6. `scripts/rendering-step16a-audit.mjs` und
   `scripts/rendering-step13-browser.mjs::settle()`
   zählen vorübergehend sichtbare alte Pixel **nie** als
   erfolgreich *warm* oder als *READY*-Screenshot.
   Eine optisch durchgängige Ansicht darf daher 100 %
   Coverage melden, aber gleichzeitig `stale>0`
   und `ready=false` zeigen. Dies ist beabsichtigt.

### Abgrenzung

Dies ist **kein** Umgehen der echten Bildinvalidierung und
**keine** Änderung an Texturen, 4×-Dichte, Küstengrafiken,
Wassermischung, Fog-Rechten oder finalem PNG-Export.
Ältere Texturpixel bleiben kurzzeitig sichtbar, bis die
neue autorisierte Quelle fertig ist; bei einem dauerhaften
Ladeproblem kann der Fallback bestehen bleiben,
**wird jedoch niemals als aktueller fertiger Tile bewertet**.
Diagnosen weisen Zeit/Grund explizit aus.

Die neue Strategie reduziert die Zahl der Tile-Neuberechnungen
nicht automatisch. Sie soll vor allem den sichtbaren
0-%-Abdeckungsrückfall während dieser Berechnungen vermeiden.

## Tests

**63/63 gezielte Regressionen im isolierten V8 bestanden**:
50 bestehende Terrain/Ufer/Sprite/Kamera-Tests plus
13 neue Retained-Stale-Tests (einschließlich:
sichtbarer Bitmap-Fallback, 0 `exact` während Refresh,
Bitmap-Freigabe erst nach fertigem Ersatz, erneute
Source-Anforderung, Source-Gate, Source-Fehler,
Revisions-Race, harte Invalidierungen, andere LODs,
Preview- und Offscreen-Budget, keine verdeckten Hexes
und echte Visual-/Warm-Readiness).

**Native Windows-/Chromium-Abnahme und wirklicher 4×-Bench fehlen.**
Keine neue FPS-Zahl und kein Merge. Visuelle Küsten-Tile-Seams
und Step16C/17 bleiben offen.

### Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-retain-visible-ground-until-replacement-20261030
git pull --ff-only origin fix/step16b-retain-visible-ground-until-replacement-20261030
node --test tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_shoreline_side_20261030.cjs tests/test_rendering_step16b_sprite_source_gate_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

Vergleichen: `progress.stale` / `staleTiles` und `exact`,
Abdeckung während Pan, akzeptierte Ersatzpakete,
`tile.stale-retained`, Source-Bakes, Readiness/Quiet-Gates,
Bitmap-Budget, Fog-Screenshots und Wasserlinien.
Nur **stale=0** plus sonstige Gates kann Warm-READY sein.
