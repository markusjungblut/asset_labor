# Schritt 16B – Selektive Wassertextur- und Flussquellen-Abhängigkeiten

## Ausgangslage

Windows-Hardwareaudit `step16a-audit(6).zip`: 4×-Zoom mit
7 späten Ground-Dateien, darunter `cosatal_water_01` bis `_04`.
Eine gebündelte globale `image-ready-ground`-Invalidierung,
17 Tile-Bakes und 16 Terrain-Builds. Die Phase ist **nicht**
warm-validiert; der Audit belegt keine Leistungsverbesserung.

Draft #78 hat die Materialauswahl pro Hexfeld bereits für
lokale Land-Texturen mit realer `VedrasChunks.neighbors`-
Tile-Abdeckung geprüft. Der Wasser-Fallback wurde dort
wegen zusätzlicher Fluss- und Uferabhängigkeiten konservativ
global gehalten.

## Ergänzung

**1. Wassertexturen:** `selectedGroundAssetChanges` darf
nun auch valide `materialClass=water`-Texturen selektiv
verarbeiten, solange die Land-/Wasserklassifikation
**jedes** Hexfelds mit der zuletzt gerenderten Basis
identisch bleibt. Die unveränderte Klassifikation ist
entscheidend, weil Küstensegmente, Ufermasken, Fluss-
normalisierung und Brückenbeziehungen davon abhängen.
Bei einem Wechsel wird weiterhin **global** invalidiert.

**2. Flüsse:** Die Rendererfunktion `drawRoadsImpl`
nimmt die Terraintextur am End-/Mündungshex des
Flusslaufs als Wasserbild für den gesamten Flussverlauf.
Wenn der gewählte Bildpfad oder dessen Pixelrevision
betroffen ist, werden alle Hexfelder dieses Flusslaufs
zusätzlich in die geänderte Quellmenge aufgenommen.
Die WorldTile-Abdeckung nutzt unverändert die exakte
Nachbarschaftsregel von `terrainChunks.stampTile`
(470 Welteinheiten um 512er-Kachelquellen).

**3. Flussraster-Revision:** Das Schlüsselmaterial von
`riverRasterCache` enthält nun auch `water.imageRevision`.
Damit können aktualisierte Bildpixel nicht mehr versehentlich
unter einem alten Cache-Schlüssel weiterverwendet werden,
wenn die natürliche Bildbreite unverändert ist.

**4. Unbekannte Fälle bleiben sicher:** Ungültige
Fluss-Geometrie, fehlende Bildvorbereitung, unbekannte
Mündungs-Quellzellen, forest_floor-Overlays, aktiviertes
Relief oder Änderungen des wet-Status erzwingen den
ursprünglichen globalen Pfad. Bilddateien der separaten
`assets/shorelines/`-Kantengrafiken behalten ebenfalls
globales Verhalten. Dazu gehören auch mögliche
weltweite Änderungen ihrer Chunk-Signaturen.

**5. Nebenwirkungen:** Material-/Biomvergleich arbeitet
durchgehend mit `imageForBiome(cell,false)`,
`typeOfCell(cell,false)` und `baseBiomeOf(...,false)`.
Er erzeugt keine zusätzlichen Bildladeaufträge.
Die Fog-Autorisierung, Originalbild-Exportlogik,
WorldTile-Readiness und Versionstests bleiben unangetastet.

## Automatisierte Prüfung

Erweiterung der bestehenden Dependency-Testdatei auf
**19/19 isolierte V8-Regressionen** (vorher 10/10):
Wasserbild mit gleichen Klassen, Land→Wasser und
Wasser→Land, Fluss-Quelltextur mit der gesamten Route,
unbeteiligtes Wasserbild, ungültige Flussroute,
`imageRevision`-Schlüssel sowie die bisherigen
Landmaterial-, Overlay-, Relief- und Read-only-Fälle.

**Noch keine native Windows-/Chromium-Abnahme.**
Eine geringere globale Invalidierungszahl im tatsächlichen
4×-Zoom ist damit eine Hypothese, kein Messresultat.
Falls die sieben Bilddateien im selben Debounce-Batch
auch ein unbekanntes Ground-Asset enthalten, ist der
globale Fallback weiterhin korrekt.

## Windows-Abnahme

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step16b-water-material-route-dependencies-20261030
git pull --ff-only origin fix/step16b-water-material-route-dependencies-20261030
node --test tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 12000
```

Vergleiche 4× `groundAssetDependencyModes` inklusive
Selektiv-/Global-Zahlen, betroffene Kacheln,
`tile.invalidate`, Cache-Misses, ImagePool-Überlauf,
Zoom-P95 als Diagnose, Bereitschaftsgate und
Küsten-/Fluss-Visuals. Pixelidentität mit unverändert
gerenderten Referenzkacheln vor dem Mergen prüfen.
**Schritt 16C und 17 weiterhin gesperrt.**
