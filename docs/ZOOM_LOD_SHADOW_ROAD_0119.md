# Asset-Labor v0.11.9 – stabiles Zoom/LOD, vereinte Wege und globale Schatten bis 200 %

## 1. Schnelles Zoomen ohne leere Terrain-Chunks

Der bisherige Chunkrenderer verwarf beim Überschreiten von 75 % Zoom seinen gesamten Raster-Cache, weil die Rasterqualität Bestandteil der Szenensignatur war. In der Zwischenzeit wurden Waldboden und Küsten weiterhin gezeichnet, das eigentliche Basis-Terrain musste jedoch auf den Worker warten.

Jetzt gilt:

- **LOD-Hysterese**: von hoher Qualität auf die halbe Rasterauflösung erst **unter 48 % Zoom** wechseln; zurück zu hoher Qualität erst **über 76 %**. Die Zwischenzone verhindert wiederholtes Umschalten.
- **Zwei Bildqualitäten gleichzeitig halten**: `chunks.js` bewahrt beim Wechsel innerhalb derselben Karte vorherige Chunk-Bitmaps auf. Sie werden beim Rendern weiterhin sichtbar gezeichnet, bis der fertig berechnete Ziel-Chunk den Platz übernimmt.
- **Zoom zurück**: Bereits fertig berechnete Qualität wird wiederverwendet, ohne einen erneuten Worker-Job anzufordern.
- **Szenenwechsel / echte Änderungen**: Sobald Terrain, Relief, Bergbelegung, Gebäude oder Worker-Pfad wechseln, dürfen alte Chunk-Bilder nicht wiederverwendet werden; beide Varianten werden inklusive ImageBitmap-Freigabe invalidiert.
- **Speicherverwaltung**: Die bestehenden LRU-Budgets gelten weiterhin über alle LOD-Varianten hinweg. Zuerst verschwinden abseits der Kamera liegende Bilder. Sichtbare noch verwendete Varianten sind geschützt.
- **Warm-up**: Der Generator fordert Terrain leicht über den sichtbaren Rand hinaus an, um schnelle Panbewegungen und Zoomschritte besser vorzubereiten.
- **Straßen** verwenden denselben familiengebundenen Wechsel ihrer statischen Chunks. Küste und bisheriger Wald-Boden-Renderer bleiben unverändert.
- Die neue Chunk-Statuszeile nennt die Anzahl der Chunks, die vorübergehend aus der früheren Auflösung übernommen wurden.

Ein Wechsel in die **strategische Symbol-/Namensansicht** erfolgt jetzt erst **unter 17 %**, die grafische Welt erscheint beim Hineinzoomen wieder **über 23 %**. Der Minimalzoom wurde auf 12 % abgesenkt. Bei 50 % und 35 % bleiben die vorhandenen Sprites weiterhin sichtbar.

## 2. Keine dunklen Überlappungen an Wegeknicken

Bisher wurden weiche, halbtransparente Farbschichten **separat für jede Straßenkante** mit `source-over` gerendert. An einem Knick oder einer Kreuzung überdeckten sich die Endkappen, weshalb mehr Äste zu einem künstlich dunklen Fleck führten.

`roads.js` führt nun pro Materialebene und Schicht alle Wegearme und Knoten auf einer **voll deckenden gemeinsamen Maskenfläche** zusammen und füllt diese anschließend nur **ein einziges Mal** mit Erdtextur und eingestellter Deckkraft.

Diese Vereinigungslogik gilt für den dunklen Erdrand, den weichen Rand und die eigentliche Trampel-/Erd-/Pflasteroberfläche. Die bisherige Hexmitte-zu-Hexmitte-Geometrie, die bis zu sechs Nachbarn, organische Wellenform, Materialupgrades und Flussbrücken bleiben erhalten. Eine eigene Offscreen-Zeichenfläche wird pro Canvas wiederverwendet. Der Regressionsfall prüft sechs Arme und erwartet genau drei einmalige Kompositionsdurchgänge statt dreifacher und mehrfacher Segment-Alphaüberlagerung.

## 3. Globale Schatten 0–200 % (wirklich dunkler)

Der bereits vorhandene Multiplikator `shadowGlobal` war intern auf 1 (=100 %) begrenzt. Jetzt akzeptiert `shadow-system.js` **0–2**. Die bisherigen unabhängigen Obergrenzen für Berg-Projektion, Kontakt-Ellipsen und transparente Sprite-Schatten wurden so angepasst, dass Werte oberhalb 100 % echte zusätzliche Verdunkelung erzeugen. Es gelten weiterhin sinnvolle Alpha-Grenzen, damit Bodenflächen und Silhouetten nicht komplett schwarz werden.

Der Regler ist sowohl bei den Berg-Schatteneinstellungen als auch unter **Ansicht & Schärfe** erreichbar. Beide Slider zeigen denselben gespeicherten Zustand und aktualisieren sich gegenseitig; Szenenexport/-import enthält weiterhin `shadowGlobal`. Geometrie, Länge, Richtung und Form der einzelnen Berge bleiben eigenständig konfigurierbar. Der bisherige Standardwert von **68 %** bleibt erhalten.

## Tests / Grenzen

`tests/test_zoom_shadows_road_union_0119.cjs` prüft den späteren Symbolmodus, Schatten-Intensität über 100 %, die LOD-Szenenfamilie, Bildrückfall in alter Auflösung während Worker-Chunk-Nachladung, sofortige Rückkehr zu einer schon gerenderten LOD, Invalidierung bei einer anderen Karte und die einmalige Sechsarm-Wegkomposition.

Bestehende Tests für Worker/OffscreenCanvas, Flüsse, Nature, Relief, Straßen-/Brückentopologie und Bergschatten laufen zusätzlich. Diese automatisierten Prüfungen sind **keine visuelle Browserabnahme**: Kontrolliert werden sollten insbesondere mehrere schnelle Zoombewegungen rund um 48/76 %, eine vollständige 397-Hex-Karte, 6-armige Kreuzungen, gemischte Straßenausbauten und Schatten bei 100/150/200 %.

**Unverändert:** Wald-Bodentexturen, ihr Renderer, Originalgrafiken, Waldregionen, Flussgeometrie und Hexkoordinaten.
