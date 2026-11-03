# Schritt 16B – reproduzierbare Warm-Vorbereitung der Kamerastrecke

## Ausgangslage (Windows-Audit 30.10.2026, 20:40)

Unveränderte 397-Hex-/2631-Natur-Szene, Qualität 4, Basis PR #85:
- Die 27 identischen Redecodes beim Pan erzeugten keine zusätzlichen
  Ground-Inhaltsrevisionen mehr.
- Während des vermeintlich warmen Pan wurden jedoch acht Terrain- und
  zwei Shoreline-Texturen von 512 auf 768 Pixel hochgestuft.
  Die damit verbundenen echten Ground-Änderungen führten zu
  selektiven Tile-Invalidierungen und Stale-Tiles.
- Beim Zoom fielen keine neuen Ground-Asset-Ereignisse an, aber während
  der Bewegung wurden 28 nicht geschützte Naturbilder aus dem Bildpool
  entfernt. Der Bildpool lag zuvor etwa 62,5 MiB über seinem
  576-MiB-Budget. Damit war der Zoom ebenfalls kein gültiger Warm-Test.
- Die zeitweise senkrechten Wasserlinien an 512-Welteinheiten-Kachelgrenzen
  sind eine **separate offene visuelle Abweichung**.

Diese Änderungen behaupten weder, dass die Hardware schneller rendert,
noch dass die visuelle Abweichung behoben wurde.

## Opt-in Vorbereitung (keine Änderung des normalen Spielablaufs)

**Nur** der Step16A-/16B-Windows-Audit ruft die zusätzlichen
`window.VedrasAssetLabor`-Funktionen auf:

1. `configureCameraWarmFootprint(poses)` ermittelt die Vereinigung
   der tatsächlich benötigten Material-, Shore-, Natur-, Berg- und
   Gebäudequellen entlang einer **begrenzten Kamerastrecke**.
   Die normalen kamerabezogenen Schutzmengen werden nur temporär um
   diese Quellen erweitert. Keine Pinning-Erhöhung im normalen Gameplay.
2. `prepareCameraWarmImages(timeoutMs)` fordert fehlende Quellen und
   Qualitäts-Upgrades im **nicht gemessenen** Abschnitt an.
   Das Bildpool-Limit, die maximale parallele Dekodierung und die
   höchstens zwei parallelen Promotions bleiben unverändert.
   Bei fehlenden Quellen, verbleibenden Upgrades oder Budgetüberschreitung
   meldet es `ready:false`.
3. `pruneIdleImagePool()` entfernt vor dem Warm-Test **nur so viele
   ungeschützte** residente Bilder, wie zur Einhaltung des unveränderten
   Speicherbudgets nötig sind. Anders als `prune(true)` leert es den
   Cache nicht willkürlich; die normale Schutzfrist greift weiterhin
   während des Spielbetriebs.
4. Der Audit besucht beide Pan-Extrema (±90 px horizontal, ±20 px vertikal),
   beziehungsweise das Zoom-Maximum (+0,11), und anschließend die
   Ausgangskamera. Jede Station muss die bestehenden vollständigen
   World-Tile-Bereitschaftsregeln bestehen.
5. **Erst danach** werden die bisherigen Trace- und Quiet-Gates
   gestartet. Ein fehlgeschlagenes `prewarm.ready` macht die
   Messphase ausdrücklich ungültig. `tile.invalidate`,
   `tile.cache-miss`, `tile.bake`, `asset.invalidate`,
   ImagePool-`ready`- und `evicted`-Differenzen bleiben unverändert
   Ausschlusskriterien während der eigentlichen Kamerabewegung.
6. Nach der Phase wird die temporäre Kamerastrecken-Pinmenge wieder
   freigegeben. Bei unzureichendem Speicher erfolgt **keine**
   Budgeterhöhung; stattdessen werden Schutzzahl, Rest-Work und
   Decoded-/Protected-/Limit-Bytes protokolliert.

Die Vorbereitungsphase wird separat im `result.json` unter
`real[].prewarm` mit Stationsstatus, Quellenzahl und Speicherstand
dokumentiert. Framezeiten während der Vorbereitung sind **keine**
Warm-Performance-Daten.

## Bestehende Artefakte schützen

Der bisherige Windows-Launcher löschte vor jeder Ausführung rekursiv
`artifacts/rendering-step16a-audit/`. Da in diesem Verzeichnis
bereits Nutzervergleiche liegen, ist das nun abgeschafft.
Jeder Lauf schreibt in einen **neuen Zeitstempelordner**
`artifacts/rendering-step16b-warm-YYYYMMDDHHMMSSmmm/`
oder in einen explizit neu gewählten `--out`-Ordner.
Existierende Ausgabeordner werden nicht überschrieben.
Das Pack-Skript erzeugt die ZIP-Datei im neuen Ordner.

## Regressionsprüfung und Windows-Abnahme

Neuer Test: `tests/test_rendering_step16b_warm_trajectory_20261030.cjs`.
Er testet Schutz und Entlastung des Decoded-Image-Pools,
unverändertes Budget, korrekte Material-/Natur-/Shore-Footprints,
Pan-/Zoom-Extrema, konservative nicht-bereit-Meldung und
unveränderte Warm-Ausschlusskriterien.

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch fix/step16b-warm-camera-footprint-preparation-20261030
git pull --ff-only origin fix/step16b-warm-camera-footprint-preparation-20261030
node --test tests/test_rendering_step16b_warm_trajectory_20261030.cjs tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

**Noch nicht nativ auf Windows ausgeführt:** Alle vorigen 58/58
Regressionen sind auf PR #85 grün; die neuen Regressionen und die
Warm-Phase dieses PR benötigen einen frischen Windows-Lauf.

Abnahmevergleich: `prewarm.ready`, Rest-Promotions,
Pan-/Zoom-Tile-Bakes, ImagePool-Evictions während der Geste,
Ground-Invalidierungen, exakte/stale/missing World-Tiles,
vollständiges Quiet-Gate und rAF-p95 nur bei `valid:true`.
Die Küsten- und Fog-Screenshots weiterhin manuell prüfen.

**Gestapelte Draft-PR; kein Merge. Schritt 16C/17 bleibt gesperrt.**
