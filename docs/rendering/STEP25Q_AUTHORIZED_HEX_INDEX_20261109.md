# Schritt 25Q – Räumlicher Vorfilter für autorisierte World-Blit-Hexe

Stand: 09.11.2026 · **Draft-PR #127, Node-/Firefox-CI erfolgreich; lokale Windows-Abnahme offen**.

## Ausgangslage

Nach 25P ist die Tile-Schlüssel-Auswahl bei großen Karten indexiert,
aber die 25O-World-Band-Planung iteriert bei jedem Renderaufruf weiterhin
über sämtliche `cells` aus dem schreibgeschützten Kartenmanifest.
Der 25P-Firefox-A/B zeigt im kombinierten Default eine uneinheitliche
p95-Frame-Kadenz. Die Ursache ist damit **nicht** belegt.

## Isolierter Versuch

- Bei mindestens **400 Hexzellen** wird bei `load()` einmalig eine
  nach `cell.x` sortierte Indexliste autorisierter `visible`-/
  `explored`-Hexe gebildet. Die Metadaten werden nicht persistiert.
- Ein konservatives Sichtfenster berücksichtigt den **größten**
  geometrischen Hex-Radius, Scenery-Halo **+45 Welteinheiten** und
  **6 Gerätepixel** Reserve. X-Binärsuche und Y-Filter bestimmen
  Kandidaten; `plan()` berechnet weiterhin die **unveränderten**
  echten devicepixelgenauen World-Blit-Rechtecke.
- Bei invaliden Metadaten, ungültiger Kamerageometrie, unter 400 Zellen
  oder ausgeschaltetem Modus bleibt die vollständige Legacy-Schleife.
- Default für den großen Kartenviewer: Index **an**, separat
  abschaltbar über `&bandIndex=0` und die sichtbare Checkbox.
  `worldBands=0` schaltet die gesamte 25O-Bandplanung ab.
- Statistik: `worldBandIndexEntries`, `worldBandIndexQueries`,
  `worldBandIndexCandidateCells`, `worldBandLegacyCandidateCells`.
  Dies zählt dem Planer übergebene Kandidaten, nicht gemessene CPU-Zeit.

**Nicht verändert:** 25O-Planer, Blit-`drawImage`-Geometrie,
Fog-Berechtigungen, Cloud-/850-ms-Fade, World-/Scenery-Masken,
1×-/2×-LOD, Canvas-RAM-/DPR-/Pixelbudgets, Tile-Read-/Decode-Reihenfolge,
Original-/Derivat-Atlasbilder und IndexedDB.

## Prüfplan und Freigabegate

1. Node: 15.000 gemischte Hexe, verschiedene Radien, DPR/Zoom/Pan,
   Vergleich der gesamten 25O-Gerätepixel-Rechtecklisten mit dem
   alten Vollscan. Zusätzlich große Edge-Radien, kleine Karten,
   invalide Metadaten, Load/Stop-Lifecycle und Index-Opt-out.
2. Headless-Firefox: vorhandene 120-Tile-Bild- und Fog-Abnahme;
   separat 15.000 synthetische Hex-Metadaten direkt im Browser,
   identische 25O-Rechteckpläne mit/ohne Index; alle sichtbaren
   Checkboxen und URL-Navigationen.
3. Erst nach grüner CI ist die **Korrektheit des synthetischen
   Vergleichergebnisses** akzeptiert. Eine echte Beschleunigung,
   p95-Wirkung und 60-FPS-Garantie erfordern anschließend
   gepaarte Messungen auf der privaten Windows-Karte.
   Bei relevant schlechterer Browser-Gesamtzeit: kein Merge.

Kein Browser-Performance-Ergebnis und keine vollständige Pixelidentität
der privaten Karte sind mit diesem Implementierungscommit behauptet.

## Abnahmebericht: GitHub Actions (09.11.2026)

- Commit: [`c45ecc5`](https://github.com/markusjungblut/asset_labor/commit/c45ecc5e4aab87f2bff48ab36d34b7fe4a05ccf0).
- Vollständige CI: [Actions-Lauf #42676610398](https://github.com/markusjungblut/asset_labor/actions/runs/42676610398) **erfolgreich**.
- **75/75 Node-Tests bestanden, 0 fehlgeschlagen**. Darin enthalten sind fünf neue 25Q-Prüfungen.
- Echter Headless-Firefox-Test (120 synthetische World-Tiles) vollständig erfolgreich. Der zusätzliche 15.000-Hex-Browsertest hat für sieben gleiche Kameraposen **identische 25O-Gerätepixel-Blit-Rechtecke** geprüft und den Kandidatenscan auf **weniger als 10 %** des alten Vollscans reduziert (CI-Akzeptanzgate). Die sichtbaren Schalter inklusive `bandIndex=0` wurden mit echten URL-Neuladungen getestet.
- Browserartefakt: [`frozen-map-firefox-85`](https://github.com/markusjungblut/asset_labor/actions/runs/42676610398/artifacts/13700033581) mit Profil- und Screenshot-Dateien; Aufbewahrung der CI-Artefakte ist zeitlich begrenzt.
- **Abnahmegrenze:** Die synthetischen Korrektheits- und Auswahltests beweisen keine reale p95-/GPU-/60-FPS-Beschleunigung der privaten Windows-Karte. Im Schritt-25Q-Test wurden keine belastbaren gepaarten World-Blit-Zeiten für 15.000 echte Hexes auf der Zielhardware erhoben. **Draft bleibt offen**, bis ein gültiger Benchmark und die Risikoabwägung vorliegen. `main` bleibt unverändert.
