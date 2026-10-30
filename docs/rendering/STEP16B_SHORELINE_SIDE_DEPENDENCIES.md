# Schritt 16B – Ufer-PNG-Revisionen pro Küstenseite und Tile

## Hardwarebefund ZIP 8 (30.10.2026)

Unveränderte Referenzszene: 397 Hexfelder, 2631 Nature-Instanzen,
SHA-256 `1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.
4×-Windows-Audit: fünf aktuelle PNG-Prüfbilder, null JS-Fehler und null Warnungen.

ZIP 7 → ZIP 8:

| Indikator | ZIP 7 | ZIP 8 |
|---|---:|---:|
| Pan: rAF-p95 (diagnostisch) | 250,24 ms | 16,86 ms |
| Pan: WorldTile-Bakes | 21 | 2 |
| Pan: Coverage Ende | 50 % | 100 % |
| Zoom: rAF-p95 (diagnostisch) | 200,22 ms | 327,76 ms |
| Zoom: WorldTile-Bakes | 12 | 6 |
| Zoom: Coverage Ende | 100 % | 25 % |

Beide realen Kameraphasen **ungültig** als Warm-Benchmark:
Pan: GateReady=true, aber Quiet=false, zwei Bakes und neue Cache-Misses.
Zoom: GateReady=true/Quiet=true vor der Geste; währenddessen vier
Terrain-PNGs selektiv invalidiert (78 Hexfelder → 76 WorldTiles)
sowie vier Ufer-PNGs in zwei separaten globalen Paketen.
Die Zoomphase enthält 6 Bakes, darunter drei
`shoreline-chunk-not-ready`, und einen Bake mit ~3039 ms Wandzeit.
Ende: ein exaktes sichtbares Tile, drei fehlende; keine Terminal-Retries.
Bildpool: Zoomende 233 Evictions (Start 149), Bildbudget am Ende nicht
überschritten, aber zu Beginn ~55 MiB über Budget.

Die 4×-Küstenaufnahme zeigt weiterhin deutlich unterschiedliche
Ozeanmaterialien und geradlinige Wassergrenzen.
Die Küstenansicht war bei der Aufnahme **nicht READY** (`missing:2`).
Keine visuelle Schritt-16C-Abnahme.

## Eng begrenzter Patch

1. `shorelineSideCells(asset)` leitet aus den bereits vorbereiteten
   `VedrasShoreline.segments` die LAND-Hexfelder ab, die genau
   `SHORE_EDGE_PATHS.indexOf(asset.path)` verwenden. Nur deren
   konservativ über `VedrasChunks.neighbors` erweiterte
   World-Tiles werden invalidiert.
2. Unbekannte PNG-Pfade, fehlende Küstensegmente, alte Wet-Basis,
   geänderte Land-/Wasserklassifikation und unbekannte Render-Modi
   bleiben beim **globalen** Fallback; deaktivierte Shoreline hat
   keine Bildabhängigkeit.
3. `shorelineChunks.configure` verwendet eine stabile, von
   Bildrevisionen unabhängige **Geometrie-Familie**. Die individuellen
   Chunk-Stempel enthalten ausschließlich die Seiten und
   `mtime`/`imageRevision` der PNGs, deren Küstensegmente
   den Chunk inklusive `HALO + 260` berühren.
   Fremde Seiten-Updates verwerfen dadurch keine intakten
   Ufer-Raster mehr. Wet-/River-Mouth-Topologieänderungen
   wechseln weiterhin die Geometrie-Familie.
4. `canStartSource` prüft jetzt sowohl fertigen Terrain-Kern als
   auch `shorelineTileStatus(tile,true)`. Noch ausstehende Ufer-Chunks
   erzeugen keine garantiert unvollständigen WorldTile-Bakes.
   Die fertigen Shoreline-Worker signalisieren schon bisher
   `worldTiles.terrainReady(...)` und fordern einen Redraw an.

Keine Änderung an Materialfarben, Bildern, Wassersampling,
Terrain-DPR, Fog-Rechten oder PNG-Export.

## Tests / bekannte Grenzen

**34/34 isolierte V8-Regressionen**: 25 vorherige
Ground-Abhängigkeitstests plus 9 neue Ufer-Tests.
Nachweis von Seitenzuordnung, entfernter Seitenunabhängigkeit,
Chunk-Halo und Bildrevision, Water-Wet-Fallback,
unknown/global, Quelle-Ready-Gate und Production-Batch.

Native Node-/Windows-Chrome-/Screenshots des **neuen Patches**
fehlen noch. Das vorherige 4×-ZIP 8 beweist die Ursache, nicht den
Erfolg des neuen Fixes. Visuelle Tile-Kanten und 4×-Warm-Gates
bleiben offene Abnahmepunkte.

### Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-shoreline-side-stamped-source-gate-20261030
git pull --ff-only origin fix/step16b-shoreline-side-stamped-source-gate-20261030
node --test tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_shoreline_side_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 12000 --visual
```

Kontrollieren: `groundAssetDependencyModes` für Shoreline-PNGs,
Kachelcache/Coverage, `shoreline-chunk-not-ready`-Bakes, 
Road/River-Source-Revisionen, Warm-Gates und visuelle
4×-Ufer-/Fog-Korrektheit. **Nicht mergen; Schritt 16C/17 gesperrt.**
