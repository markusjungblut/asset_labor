# Priorität 3: Visueller Qualitätsausbau und Naturverteilung

Stand: 20.10.2026. Änderungen nur an Anwendungscode und Tests; **keine** Änderung an Quell-PNGs oder an den nutzergepflegten JSON-Katalogen.

## Die verbindlichen Punkte 5 und 6 aus dem Grafik-Chat

- **5. Objektperspektive leicht angleichen:** Es wird beim Rendern relativ zum Sprite-Anker eine subtile vertikale Darstellungsskala `0.965` und minimale X-Scherung `0.012` angewendet. Gilt auch bei aktiven Bergschatten; 2D-Quellbilder, Fußpunkte, Gameplay-Hexe und Asset-Katalogdimensionen werden nicht verändert. Die bestehende Kartenprojektion `PROJECT_Y = 0.85` bleibt wie bisher.
- **6. Bäume 10 % größer und etwas dichter:** Die bestehende runtimebasierte Größenbalance wird für **lebende Bäume** mit `1.10` multipliziert. Stehendes Totholz, verschneite Totholzbäume, liegende Äste, Stämme und Stümpfe behalten ihre früheren Ausnahmen. Dichte Waldhexe können ca. sieben statt bisher fünf Zielbäume erhalten; lichte bleiben deutlich offener. Weitere Baumplätze sind durch objektfreie Lichtungen, Gebäude, Straßen, Flüsse und Mindestabstände begrenzt. Es wird keine künstliche zehnprozentige Erhöhung der gespeicherten Baum-Assets vorgenommen.

## Zusätzlich gemeldete und behobene Fälle

- **Waldcharakter und Worldgen-Dichte:** Aus dem Geografie-Labor importierte Hexe übertragen `forestClass` **und** numerische `forestDensity` an `VedrasForest` (`densityOverrides`). „Natur verteilen“ liest sie, verteilt lebende Baumkronen in den Waldklassen dichter und bildet weiterhin kleinere Lichtungen und weichere Waldränder. Im Nature-Inspector werden angepasste effektive Größen transparent ausgewiesen.
- **Boulder-Varianten:** `boulder_01.png` und künftig importierte `boulder_02.png`, `boulder_03.png` usw. werden über den Namen der Nature-Klasse `stones`/Typ `rock` zugeordnet. Der Runtime-Größenfaktor der Klasse `stones` (`rock`/ `cluster`) beträgt **25 % des vorherigen Wertes**. Für automatisch platzierte Findlinge wählt der Generator deterministisch aus **allen aktuell geladenen Varianten**; er greift nicht nur auf die erste Datei zurück. Es findet keine Manipulation der gespeicherten Zielhöhen oder der Quell-PNGs statt. Im Repository war beim Implementieren nur `nature/boulder_01.png` enthalten; weitere nur lokal importierte Varianten werden unterstützt, sobald sie tatsächlich eingelesen und katalogisiert sind. Keine boulder/stone-Vorkommen in `snowfields` oder `frozen_tundra`.
- **Berge bei „Natur verteilen“:** Das Kommando erkennt `reliefClass === 'mountain'` aus der geografischen Testszene beziehungsweise die alte Demo-Kategorie `mountain`. Bergsprites werden vor der übrigen Natur platziert, bestehende manuelle Berginstanzen bleiben erhalten. Der vorhandene `VedrasMountains.candidate()`-Schutz verhindert Belegung von Gebäudekernen oder widersprüchliche Überschneidungen. Räumlich verbundene Berge teilen eine Ketten-ID und dürfen als Formationen auftreten. In der Bestätigung wird `platzierte Berge/Zielhexe` angezeigt; wegen Silhouetten-/Belegungsregeln kann die Zahl niedriger als die Zahl der Mountain-Hexe sein. Der logische Berghex-Status bleibt unabhängig von der Spritezahl.
- **Dünne rechteckige Nähten:** Die cached Chunk-Ebenen werden mit jeweils **2 Welteinheiten Überzeichnung** aus ihrem bereits vorhandenen Halo gerendert, statt bei Bruchteilszoom auf exakt derselben fraktionalen Pixelkante beschnitten zu werden. Dieser Ansatz beseitigt typische 1-Pixel-Lücken durch Subpixel-/Canvas-Skalierung ohne Änderungen an Terrainbildern. Eine vollständige visuelle Abnahme bei verschiedenen Zooms und Geräten bleibt erforderlich.

## Bedienung

1. Im Asset-Labor eine geografisch erzeugte Karte übernehmen. `worldCells` enthalten dann unter anderem `reliefClass`, `forestClass`, `forestDensity` und das Terrain.
2. In der Kartenansicht **Natur verteilen** anklicken. Der Verteiler benutzt nun Waldklassen und -dichten, die tatsächlichen Terrains sowie Berg-Kernhexe. Die zugehörigen PNGs müssen im geöffneten Grafikordner vorhanden sein.
3. Optional im **Nature-Inspector** die individuellen Freigaben, Größen und Dichteparameter der Spriteklassen prüfen. Manuell platzierte Objekte bleiben bei einer erneuten Verteilung erhalten, soweit ihre Standorte zulässig bleiben.
4. Bei vermuteten Artefakten die Kartenansicht bei 50 %, 100 % und 200 % Zoom prüfen. Nach Merge die lokale Version mit `git pull` aktualisieren und **START_WINDOWS.bat** neu starten; Browser hart aktualisieren (`Strg+F5`).

## QA und Grenzen

`node tests/test_p3_visual_quality_20261020.cjs` prüft die drei wesentlichen Größenverträge (+10 % lebende Bäume, 25 % Stones, unverändertes Totholz), automatische Erkennung mehrerer Boulder-Nummern, Schnee-Ausschlüsse, dichte/lichte Waldbäume, Transport der Geografie-Walddichte, tatsächliches Berggenerieren und Skript-Caching. Weitere vorhandene Regressionstests sichern Bergschatten und Chunk-LOD.

Die geographische Weltgenerierung v2.1, ihre dauerhaften Ocean-Terrain-Typen, die **Flüsse auf Hexkanten** und bestehende Spielweltdaten werden durch Priorität 3 nicht verändert. Eine finale Browser-Screenshot-/Performanceabnahme, insbesondere bei 397 Hexen und dichtem Wald, ist noch nicht durchlaufen.
