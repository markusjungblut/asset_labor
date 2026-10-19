# Asset-Labor v0.11.5 – sandige Wege, Flussbrücken und freie Straßenkorridore

## Wegoberfläche
`roads.js` zeichnet weiterhin ein ungerichtetes Netz mit bis zu sechs Nachbarn pro Hex. Die Grundform bleibt vom Hexzentrum über den echten Seitenmittelpunkt bis zum Nachbarzentrum konsistent und ermöglicht T-, X-, 5- und 6-armige Knoten ohne starre Einzel-Tiles. Die v0.11.5-Trampelpfade sind **schmaler, heller, sandig-ockerfarben und weicher ausgefranst**, mit niedrigem Kontrast, dezenter Körnung und geringfügig organischer Verlaufsachse. Befestigter Erdweg und Steinstraße haben ebenfalls überarbeitete, zurückhaltende Farbprofile, benutzen aber exakt dieselben Anschlüsse.

## Flüsse und Brücken
Die **bestehende Flussgeometrie und ihre Wassertexturen bleiben unverändert**. In `app.js:drawRoads()` werden erst die Wasserläufe gezeichnet, dann die Straßen und zuletzt die Brücken. `bridges.js:candidates()` schneidet die Wegmittelachse mit dem **wirklichen, abgerundeten Flussverlauf** aus `VedrasRivers.sections/coursePoints`. Die Brücke erscheint nur an einer gültigen, nicht parallelen Kreuzung. Auf demselben Weg werden dicht beieinanderliegende mathematische Kreuzungstreffer entdoppelt. Die Brückenlänge berücksichtigt Flussbreite und transparenten Ufersaum; bei aktivem Relief wird ihre Mitte auf die projizierte Bodenhöhe gelegt.

Sechs **echte, transparente, skalierbare SVG-Grafiken** für Hex-Richtungen 0–5 liegen in:
- `assets/bridges/bridge_dir_00.svg` (−60°)
- `assets/bridges/bridge_dir_01.svg` (0°)
- `assets/bridges/bridge_dir_02.svg` (+60°)
- `assets/bridges/bridge_dir_03.svg` (+120°)
- `assets/bridges/bridge_dir_04.svg` (+180°)
- `assets/bridges/bridge_dir_05.svg` (+240°)

Jede Richtung enthält eine texturierte sandfarbene Holzfahrbahn, Fugen, dunkle tragende Seitenhölzer und dezente niedrige Randpfosten. Ein einfaches Fallback zeigt bis zum Laden eine hellbraune Brückenfläche. Die Bilder werden von `bridges.js` automatisch geladen und exakt ausgerichtet, unabhängig vom Weg-Upgrade `trail / packed / stone`.

Die Brücken folgen bestehenden Landhex-Straßenquerungen über schmale Flussarme; reguläre Straßen, die auf vollständigen Wasserhexen enden, bleiben wie bisher ausgeschlossen. Eine spätere eigenständige Hafen- oder Wasserhex-Brücke kann einen separaten Mechanismus nutzen.

## Pflanzen und Objekte
Beim **Hinzufügen** einer Straßenkante ruft `app.js:applyRoadChanges()` zentral `roads.clearCorridor()` auf, egal ob die Kante mit den sechs Nachbarbuttons, dem Karten-Zeichenmodus oder dem Kreuzungstest erzeugt wurde. Die Berechnung prüft den tatsächlichen Weltkoordinaten-Bodenanker gegen die breitenabhängige Straßenmaske:

- kollidierende automatisch oder manuell verteilte **Nature-Sprites werden aus `state.natureInstances` entfernt**
- im Weg-/Baufundamentkorridor liegende **platzierte `state.hexObject`-Objekte werden entfernt**
- außerhalb liegende Bäume bleiben bestehen, auch wenn ihre Krone oder einzelne Äste über den Weg hinausragen
- Berg-PNGs und Terrain werden nicht entfernt
- eingebaute Demo-Objekte werden in der Darstellung unterdrückt, sobald ihre Standfläche den Weg belegt
- `nature-ui.js` blockiert neue automatische/manuelle Anker auf bestehenden Wegen, damit sie nicht später wieder zuwachsen
- ein bloßes Weg-**Upgrade** oder das Entfernen eines Wegabschnitts löscht keine weiteren Objekte

Bestehende gespeicherte Szenen und die Szenenexportstruktur bleiben kompatibel. Der globale Sichtbarkeitsregler von Wegen funktioniert unabhängig vom Flussregler.

## Regression und Einschränkungen
`tests/test_road_bridges.cjs` prüft reale Fluss-Schnittpunkte, leere/nicht geschnittene Szenen, sechs orientierte Brückenbilder, geometrische Kollision, Objekt-/Natur-Bereinigung, die Renderreihenfolge und künftige Pflanzverbote. Die bisherigen Tests für 64 Wegeknoten, Nature-Maßstäbe, Flüsse, Küste und Bergschatten laufen zusätzlich.

**Wald-Bodentexturen und ihr Renderer sowie sämtliche Original-Terrain- und Nature-PNGs bleiben unverändert.** Eine visuelle Abnahme mit echten Grafiken bei verschiedenen Zoomstufen wurde nicht durch die automatisierten Tests ersetzt.
