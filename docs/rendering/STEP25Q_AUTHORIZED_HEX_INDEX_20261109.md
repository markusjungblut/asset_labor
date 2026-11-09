# Schritt 25Q – Räumlicher Vorfilter für autorisierte World-Blit-Hexe

Stand: 09.11.2026 · **Experimenteller Branch / PR-Abnahme offen**.

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
