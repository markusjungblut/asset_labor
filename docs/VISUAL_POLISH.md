# Block 4 – Fluss-/Küsten-Finish, Farb- und Naturkomposition

Stand: 19. Oktober 2026 · Asset-Labor, noch keine Integration ins separate Hauptspiel.

## 1. Flusskanal ohne sichtbare Halbkreis-Kanten

Die ursprüngliche Flussmaske aus `river.js` malte für jedes Hexkantensegment
gefüllte Rechtecke plus wiederholte Kreis-Endkappen in mehreren
Alphastufen. Durch die additive Überlagerung konnten Kreisbögen an Knicken
und Hexkanten sichtbar bleiben.

Der neue Renderer berechnet ein **einziges Distanzfeld über die vollständige
Hexkanten-Segmentkette** (`maskData`). Der Abstand zu allen Segmenten wird
per **MAX-Union** zusammengefasst: Die Mitte bleibt nahezu opak; vom
inneren Rand bis etwa 14 Welteinheiten außerhalb der halben Flussbreite
fällt die Deckkraft mit `smoothstep` weich auf null. Es gibt keine
übereinandergelegten Kappen und keine Sandkontur. Die verwendete
Wassertextur ist weiterhin jene des tatsächlichen Wasserhexes.

Für die Mündung läuft der Kanal vom letzten echten Hex-Eckpunkt **entlang
der letzten Hexkante bis zum gemeinsamen Land/Wasser-Seitenmittelpunkt**.
Er läuft ein Stück in das Wasserhex hinein und blendet erst *dort*
vollständig aus. Quelle und Kurven bleiben Bestandteil derselben Maske.
Fluss-Sperrflächen verwenden exakt diese Geometrie inklusive Mündung.

## 2. Strand an der Mündung bleibt erhalten

Das komplette Überspringen einer Land-Wasser-Hexkante war zu grob:
Ein Fluss löschte praktisch den gesamten Strand am Wasserhex.

`shoreline.js` generiert weiterhin **alle Küstenkanten**.
`mouthPortals` übergibt lediglich den exakten Kantenmittelpunkt,
die Orientierung und die Flussbreite. In der bereits vereinigten
Strandmaske öffnet dann eine schmale, zweidimensional weich
auslaufende Öffnung den Durchlass. Die restliche Sand-/Brandungsgrafik
bleibt erhalten. Die Küstenmasken addieren sich weiterhin nicht
unbeabsichtigt an gemeinsamen Ecken.

Test: `tests/test_block4_coast_aperture.cjs` prüft echte Alpha-Pixel der
Mündungsöffnung (Beispiel **0 → 91 → 190** auf der vorhandenen Küste).

## 3. Dezent einstellbare Render-Farbharmonie

`polish.js` führt drei reversible Regler ein:

- **Nature-Farbangleichung** (Vorgabe 40 %): leichte Reduktion von
  Sättigung/Helligkeit und moderater Kontrastausgleich nur bei
  Nature-Objekten. Berge bleiben farblich unangetastet. Schneegrafiken
  werden noch zurückhaltender verändert.
- **Terrainmuster beruhigen** (35 %): geringe Sättigungs- und
  Kontrastkompression im gemeinsamen Terrainraster *nach* dem
  Hex-Übergangsmixing. Ozean, Schnee und Waldboden erhalten keine
  globale Änderung. Die Raster-Cache-Signatur berücksichtigt den Regler.
- **Natürliche Pflanzengruppen** (100 %): steuert die unten beschriebene
  Mikrokomposition bei der nächsten Nature-Neugenerierung.

Alle Regler erlauben **0 = aus**, ändern keine PNG-Datei und werden
in lokalen Szenen sowie Export und Import mitgespeichert.

## 4. Kleine natürliche Pflanzeninseln statt Zufallsrasters

`VedrasPolish.patch` ermittelt ein korreliertes Dichtefeld aus dem
gewählten Seed, dem Hex und seinen sechs Nachbarhexen. So entsteht
regional mehr oder weniger Untervegetation statt identischer
Wahrscheinlichkeiten auf jedem Hex.

`localOffset` bevorzugt je nach Objektklasse einen gemeinsamen,
deterministischen Standortbereich für Busch- und Bodendekoration,
weicht bei erfolglosen Platzierungsversuchen aber wieder auf die
gesamte geeignete Hexfläche aus. Bestehende Abstandsregeln,
Bauflächen, Grundbiome, Waldklassen und River-Block-Zonen bleiben
unverändert gültig.

Bewaldete Hexe erhalten in einzelnen ruhigeren Flecken **einen
lebenden Baum weniger** als die reguläre Waldquote. Die Höchstquoten
und Reservierungen freier Bauhexe aus Block 2 bleiben erhalten.

## 5. Testumfang und Grenzen

Neue Tests:
- `tests/test_block4_visual_polish.cjs`: exakte Hexkanten, konsistente
  Alphamaske, keine Überhellung an Segmentverbindungen,
  Terrain-Transparenz, Seed-Reproduzierbarkeit, Regler und Integration.
- `tests/test_block4_coast_aperture.cjs`: Küstenkante bleibt vollständig
  bestehen und blendet nur am Flussdurchlass sanft aus.

Bestehende Fluss-, Habitat-, Wald-, Schatten- und Nature-Tests bleiben
als Regressionen verbindlich.

**Offen ist die visuelle Gesamtabnahme** mit den echten Gelände-/Nature-PNGs
bei verschiedenen Zoomstufen, Flussbreiten, Mündungsrichtungen und
Reliefhöhen. Die Einstellungen sind bewusst konservative Defaults, keine
finale Farbanpassung der Einzelgrafiken.
