# Schritt 18 – Stabilität und Bildqualität des eingefrorenen Spielkarten-Viewers

**Stand:** 2026-11-01 · gestapelter Draft auf Schritt 17 (#101)

## Problembericht (Firefox, lokaler Spielkarten-Test)

- Rasch flackernde Streifen aus mehreren Chunks bei Pan/Zoom, obwohl die Kamerabewegung selbst flüssig ist.
- Starre, vertikale/rechteckige Chunk-Kanten und scheinbar fehlende Regionen.
- Keine Wolken außerhalb der bereits generierten Welt bzw. über unfertigen Kacheln.
- 4×-Renderqualität aus dem Asset-Labor wird im eigenständigen Viewer nur mit höchstens 2× ausgegeben. Der vorige Ganzkarten-Export verwendet außerdem die Zoom-abhängige WorldTile-LOD: bei 28% oft nur `far` (0,85 Pixel/Welteinheit).

## Änderungen

1. **Sichtbarer PNG-Cache gepinnt.** Die LRU-Budgetierung entfernt nur noch Bilder außerhalb des aktuellen Kamerabereichs. Eine Tile wird erst nach vollständiger Dekodierung **aller** PNG-Layer in den sichtbaren Cache aufgenommen. Keine erneute LRU-Verdrängung derselben sichtbaren PNGs bei jedem Kamera-Frame. **Hinweis:** Bei sehr vielen zugleich sichtbaren großen PNG-Kacheln darf die normale 30-MPixel-Cache-Grenze temporär überschritten werden; dies priorisiert Stabilität, muss aber auf speicherarmen Clients gesondert gemessen werden.
2. **Ground-Nähte.** Jede Terrainkachel erhält weiterhin exakt gerundete Geräte-Kernkoordinaten. Bei vorhandenen Original-Gutter-Pixeln verwendet der Viewer einen höchstens 0,65 Device-Pixel breiten, aus dem *wirklichen* Quellgutter entnommenen Überzug. Damit lassen sich bilineare Sampling-/Subpixel-Spalten schließen. Scenery erhält wie im ursprünglichen WorldTile-Compositor einen eigenständigen 45-Welteinheiten-Hex-Halo. **Einschränkung:** Fehler, die bereits *im Original-Ground-PNG* an der Kachelgrenze eingebrannt sind, sind durch Sampler-Überzug allein nicht vollständig korrigierbar. Das bestehende Source-Seam-Issue #90 bleibt deshalb unabhängig offen.
3. **Wolken als eigener Layer.** Der Standalone-Viewer lädt `cloud-artwork.js` sowie maximal die vier bereits im Asset-Labor verwendeten Cloud-PNGs. Wolken-Seed und relative Bildpfade werden im lokalen Szenenmanifest abgelegt. Der Player zeichnet dieselbe deterministic Hex-Wolkenbasis, verdeckt aktuell nicht dekodierte Hexkerne und kaschiert Kartengrenzen nach den Terrain-/Scenery-Layern. Keine zusätzlichen Terrain-Worker und keine Neuberechnung von Biom-Übergängen im Spielviewer. Bereits vorhandene Archive ohne Wolkenmetadaten lassen sich durch erneute Kartenvorbereitung aktualisieren.
4. **4×-Ausgabe.** Standalone-Canvas respektiert die im Kartenmanifest gespeicherte Authoring-Renderauflösung bis 4× (nicht mehr auf 2× begrenzt); eine sichtbare Qualitätsanzeige und Unvollständigkeitsmeldung sind hinzugefügt.
5. **Echte 4×-Quellgrafik im Offline-Modus.** Wenn die Qualitätsauswahl beim Start der Ganzkarten-Vorbereitung **4×** ist, werden pro Chunk im **Editor und nur in der Offline-Tour** Near-Terrain und Scenery mit je 4 Pixeln pro Welteinheit gebacken. Der normale Live-WorldTile-Stream behält seine bisherige 0,85/1,5/2,5-LOD-Architektur. Die Offline-Tour nimmt kein bereits gecachtes 2,5×-Near-Bild als 4×-Quelle. Die Source-Pixelbreite wird vor dem Speichern geprüft. `atlas-4x` und `atlas-native` besitzen getrennte Szenenfingerprints; bereits vorhandene Low-LOD-Kacheln können nicht irrtümlich als 4× gelten. Die Gesamtgröße des 4×-Archivs und der einmalige Vorbereitungsaufwand sind deutlich höher.
6. **Archivstatus.** Das Manifest erhält eine erwartete Tile-Zahl; der Standalone-Viewer meldet gespeicherte/erwartete Bilder und kennzeichnet unvollständige Karten. Der ZIP-Manifestexport enthält zusätzlich die Cloud-Metadaten; die eigentlichen Cloud-Bildquellen liegen weiterhin im Asset-Labor-Asset-Verzeichnis und sind **nicht** im ZIP enthalten.

## So nachtesten

1. Branch auschecken und den lokalen Server aus dem neuen Branch starten; Firefox neu laden (Cache ggf. hart leeren).
2. In der Editoransicht `Renderqualität: 4×` wählen, Fog-Demo aus. **Gesamte Karte einmalig als Spielkacheln vorbereiten** erneut ausführen. Der Qualitäts-/Renderer-Fingerprint trennt neue Bildarchive von alten. Abgebrochene Touren können erneut gestartet werden.
3. Abschlussstatus prüfen: erst ein gespeichertes Paket für **jeden erwarteten Chunk** bedeutet vollständige Karte. **Fertige Spielkarte ohne Asset-Labor öffnen** – dort den neuen Zähler, Wolken-Layer und `Raster 4×` prüfen.
4. Lange diagonale Kamerafahrten, 28–100% Zoom, Grenzbereiche der Karte und bekannte Chunk-Seam-Stellen prüfen. Erwartung: keine zyklisch flackernden, wiederholt verdrängten Dekodierungen. Wenn eine starre Kante **im gespeicherten Pixelmaterial** liegt, sie als reproduzierbares Source-Seam-Issue mit Welt-Tile-ID protokollieren.
5. Wiederholung mit `Renderqualität 2×`, um die niedrigere Datenmenge und die unabhängige Archivkennung zu prüfen.
6. Speichernutzung bei großer Übersichtskarte kontrollieren. Zu viele gleichzeitig sichtbare 4×-PNG-Bilder können Speichergrenzen überschreiten; hier ist für künftige große Spielwelten ein separater Mipmap-/LOD-Bildatlas empfehlenswert.

## Validierung

- `tests/test_rendering_step18_frozen_map_stability_20261101.cjs` prüft gepinnte sichtbare Tiles gegen LRU-Flackern, Gutter-Überzug, Cloud-Basis/Frontier, 4×-Canvasauflösung und die getrennte Offline-4×-Quelllogik.
- JavaScript-Syntax wurde bei der Änderung validiert. Ein isolierter V8-Smoke-Test mit realem Produktionsskript ergab 7/7 Bilddateien einmal geladen und anschließend 0 erneute Decodes trotz eines absichtlich zu kleinen Cache-Budgets; Wolkenaufrufe und 4×-Canvasbreite waren vorhanden.
- **Windows-Testsuite und echter Firefox-End-to-End-Test sind noch nicht auf der Zielmaschine ausgeführt.** Ohne solche Abnahme keine Garantie, dass jede sichtbare starre Source-Seam vollständig behoben ist.
