# Schritt 16B – verifizierbare Ground-Asset-Abhängigkeiten

## Warum ein selektiver Pfad nötig ist

`step16a-audit(6).zip` (30.10.2026) bestätigt eine identische
397-Hex-/2.631-Nature-Referenzszene und 0 JavaScript-Fehler.
4×-Zoom: 7 nachgeladene Terrain-PNGs, 1 globaler
`image-ready-ground`-Reset, 16 Terrain-Builds und
17 World-Tile-Bake-Ereignisse; rAF-p95 133,40 ms.
Die Zoomphase ist **nicht warm-valide**.

Die sieben PNGs waren `grassland_03`, `grassland_04`,
`halbwueste_03` und `cosatal_water_01`–`04` im
`assets/terrain/`-Verzeichnis. Es handelt sich um echte
Bildbereitstellungen; der Trace unterscheidet nicht
verlässlich Erstdekodierung von Resolution-Upgrade.

## Einfache Landmaterialien: selektive Invalidierung

- `drawGroundImpl` speichert die tatsächlich ausgewählten
  opaken Ground-Materialpfade pro Hexfeld.
- `imagePool.onReady` prüft für ein gültiges nicht-wassergebundenes
  Landmaterial die Auswahl aller Hexfelder **vor/nach**
  dem neuen Bild. Dies erkennt auch Reindexierungen, die
  durch das Hinzufügen einer Materialvariante auftreten und
  andere Varianten betreffen.
- Eine unveränderte Auswahl mit neuem Bildinhalt invalidiert
  trotzdem ihre Quellzellen, sofern derselbe Dateipfad benutzt wird.
- Der Vergleich verwendet `imageForBiome(cell,false)` inklusive read-only\n  `typeOfCell`/`baseBiomeOf`: **keine**
  ImagePool-Ensure-/Upgrade-Anforderungen während des
  Diagnose-Durchgangs über 397 Hexfelder.
- Betroffene World-Tiles werden mit denselben Zellnachbarn
  ermittelt wie `terrainChunks.stampTile`. Der bestehende
  Batch ruft für diese Menge `worldTiles.invalidateTiles` auf;
  alle nicht betroffenen fertigen Kacheln bleiben erhalten.
- Der FrameMemo-Neuaufbau, die Source-Revision-Prüfung,
  Bitmap-Paket-Checks, vorhandene LOD/Readiness/Fog-Gates
  und der originale finale PNG-Export bleiben bestehen.

## Konservativer Sicherheits-Fallback

Bei Wassertexturen (`materialClass=water`), Waldboden-Overlays,
Relief-Modus, ungültigen/fehlenden Materialtypen oder fehlender
bisheriger Materialauswahl bleibt der ursprüngliche
**globale** Ground-Reset aktiv. Uferlinien und
reliefabhängige Gebäude/Berge nutzen denselben globalen Pfad.
Wenn auch nur ein Asset in einem Batch diesen Fallback
benötigt, wird der komplette Ground-Batch konservativ
global invalidiert.

**Wichtig:** Die vier verspäteten `cosatal_water`-Texturen
aus ZIP6 fallen noch in diese Wasser-Ausnahme. Deshalb
wird für diesen konkreten gemischten Zoom-Batch noch
**keine** Reduktion der globalen Invalidierung behauptet.
Für eine sichere Wasser-Optimierung sind zusätzlich
River-Route-, Ufer-/Bank- und Water-Sampling-Abhängigkeiten
pro World-Tile nötig.

## Regressionen und Diagnose

Zehn neue gezielte Regressionen am produktiven Funktionscode:
Pixel-Upgrade bei gleicher Auswahl, per-Biom-Variantenverschiebung,
unabhängige Terrainmaterialien, mehrfacher Decode,
globaler Wasser-/Forest-Floor-/Relief-/Unbekannt-Fallback,
exakte Chunk-Nachbarschaft (inklusive entfernter Tiles),
selektiver/globaler Branch im Batch sowie nachgewiesen
nebenwirkungsfreier `imageForBiome(false)`-Pfad auch über\n`typeOfCell` und `baseBiomeOf`.

**10/10 im isolierten V8 bestanden**, native Node-
und Windows-Chromium-Abnahme noch offen.

Der Step16A-Audit berichtet pro Kamera-Phase zusätzlich
`groundAssetDependencyModes` und Details der
`ground.asset-dependency`-Ereignisse (`mode`, Anzahl
Quellen, betroffene Hexfelder und World-Tiles).

## Abnahmekriterien vor Merge

1. Native Tests auf Windows sowie Vergleich des
   gleichen 397-Hex-Szenen-Hashs.
2. Nachladen eines einzelnen Landmaterials muss nur
   dessen Quell-Nachbarschaft invalidieren, ohne
   entfernte fertige World-Tiles zu verwerfen.
3. Varianten-Neuordnung muss ALLE geänderten Zellquellen
   erfassen. Keine veralteten Texturen oder Kachelseams.
4. Wasser, Coastline, Relief, Fog und finales PNG
   müssen visuell unverändert bleiben; unbekannte
   Abhängigkeiten müssen explizit global zurückfallen.
5. Kein behaupteter 4×-Warm-FPS-Gewinn, solange Readiness
   und Quiet-Gate nicht vollständig bestehen.

Schritt 16C/17 bleiben gesperrt. Die vorherigen
gestapelten Draft-PRs werden nicht gemergt.
