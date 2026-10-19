# Hexmitten-Wege / Trampelpfade und Straßen-Upgrades (v0.11.4)

## Prinzip

Straßen folgen einem **ungerichteten Hexnachbar-Graphen**. Jedes Hex darf gleichzeitig **0 bis 6** Verbindungen besitzen (64 Bitmaskenkombinationen); ein Abschnitt ist eine einzigartige Verbindung zwischen genau zwei benachbarten Hexkoordinaten. Die gerenderte Mittellinie läuft **vom Mittelpunkt eines Hexes zum Mittelpunkt des anderen**, mit einem exakt getroffenen **Seitenmittelpunkt** dazwischen. Die Straßenfläche ist damit bei beliebig vielen Abzweigen und zwischen allen Hexgrenzen lückenlos.

Eine früher fest einprogrammierte Demo-Straße wurde in drei **echte, editierbare Trampelpfad-Verbindungen** am Kartenzentrum überführt. Die Szene speichert `roadEdges` (Liste von `{a:[q,r], b:[q,r], level:'trail'|'packed'|'stone'}`), `roadShown` und `roadMaterial`. Alte Szenen bleiben ladbar; vorhandene Flussdaten und Terrain werden nicht verändert. Die letzten 3 Demo-Verbindungen sind nur der **Startwert** für Szenen ohne bisher gespeicherte Wege. Nach dem Entfernen bleiben sie entfernt.

## Prozedurale Oberfläche

Der separate Renderer `roads.js` verwendet je Abschnitt mehrere gleichgerichtete runde Strich-Pässe, ergänzt um **überlagerungsfreie kreisförmige Mittenknoten**. Alle Abschnitte eines Materials werden pro Schicht gezeichnet; sechs am selben Knoten mündende Arme bleiben eine zusammenhängende Wegefläche anstatt sechs übereinanderliegender Hex-Muster. Leichte deterministische Kurvenbewegungen enden jeweils exakt an den Hexmittelpunkten und dem Seitenmittelpunkt. Für Reliefhöhen wird die Mittellinie entlang der Geländeoberfläche resampelt.

Materialprofile (gleiche Topologie, nur andere Optik und Breite):

- **Trampelpfad** (`trail`): warmbraune ausgelaufene Erde, dunkler ausgefranster Bankbereich, heller staubiger Pfadkern, wiederholbare körnige Erdtextur
- **Befestigter Erdweg** (`packed`): etwas breiter, sandgraues Packmaterial und steinige Körnung
- **Steinstraße** (`stone`): breiter, graubeige Oberflächentextur und dunklerer Kantenkörper

Die Materialtextur wird deterministisch direkt auf einem 128×128-Canvas erzeugt und als weltverankerte `CanvasPattern` verwendet; **keine statischen 64 × 3 PNG-Varianten** und keine Änderungen an Wald-Bodentexturen nötig. Upgrade verändert nur die Materialstufe eines bestehenden Abschnitts; die Verbindungen bleiben intakt.

## Bedienung

Im neuen Panel **Wege & Straßen · Hexmitte zu Hexmitte**:
1. Ein Hex auswählen. Die sechs Buttons zeigen Richtung und Nachbar-Koordinaten. Klick legt den Abschnitt an, ändert bei abweichender Materialauswahl seine Stufe oder löscht bei gleicher Materialstufe die Verbindung.
2. Alternativ **Hex für Hex zeichnen** wählen: Starthex klicken, direkt benachbartes Hex klicken, und für jeden weiteren Abschnitt fortfahren.
3. **Sechsarmige Kreuzung testen** fügt an allen sechs verfügbaren, bebaubaren Land-Nachbarn Verbindungen an; Verlängerungen auf erreichbaren Folgehexen erzeugen eine kontrollierte Testszene.
4. Pfade separat von Flüssen ein-/ausblenden. Wege können nicht in Wasserhexe gelegt werden; Out-of-map- und Fernverbindungen werden verworfen.
5. JSON-Szenenexport/-import erhält alle Wege, Upgrade-Stufen und Sichtbarkeit. **Alle Testzuweisungen entfernen** löscht auch die Verbindungen.

## Nachprüfbarkeit

`tests/test_hex_roads.cjs` prüft alle **64** Verbindungsmasken, Gegenrichtung/Idempotenz, gemeinsame Hexseitenmittelpunkte, Upgrade ohne Topologieänderung, Wasser-/Kartenbegrenzungen, Canvas-Renderer sowie die UI-/Szenenanbindung. Zusätzliche Regressionstests sichern Flüsse, Terrain, Naturgrößen und Bergschatten ab. Eine visuelle Prüfung mit realen Terraintexturen in verschiedenen Zoomstufen wird für die endgültige grafische Abnahme empfohlen.
