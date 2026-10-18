# Flusssystem v0.14.0 – neutrale Wasser-Overlays

## Geometrie und Nachbarschaft

Der alte, fest gezeichnete Demo-Fluss mit sandfarbenen Strichen ist entfernt. \`river.js\` benutzt die **exakte Hex-Seitenkonvention der Küstenlogik** (\`shoreline.js\`): Richtungen \`[(1,-1),(1,0),(0,1),(-1,1),(-1,0),(0,-1)]\`, Hexseiten 0 bis 5 zwischen Eckpunkten \`i\` und \`i+1\`.

Eine gültige Flussroute besteht aus einer geordneten Folge unmittelbar benachbarter Hexkoordinaten. Das erste und alle Zwischenhexe sind **Land**, das letzte Hex muss tatsächlich als **Wasser** klassifiziert sein. Fehlt die Mündung, wird der Fluss nicht gezeichnet. Zwischenlandhexe haben ein Eingangs- und ein Ausgangssegment mit **Anschlusspunkten exakt in der Mitte der betreffenden Hexseiten**. Die Wassergeometrie wird als EIN kontinuierlicher Kanal ausgegeben; dadurch gibt es keine sichtbaren Nahtkanten und kein Doppelmischen an Hexübergängen. Die Segmentmetadaten \`inSide\`, \`outSide\` und \`kind\` unterscheiden \`straight\`, \`curve\`, \`source\`, \`mouth\` und \`source_mouth\`.

## Quelle – ausdrücklich kein Sondermotiv

An der Quelle wird **dasselbe Wasser** wie im restlichen Fluss verwendet. Ihr offenes Ende liegt auf der ausgewählten Hex-Ecke (\`corner=0..5\`, standardmäßig gegenüber dem Ausgang). Die **einzige Sonderbehandlung ist das abgerundete Ende**. Ein dekorativer Quellsee, Wasserfall, Stein- oder Brunnen-Asset existiert nicht.

## Biome, Wasser und Küsten

Das Overlay zeichnet ausschließlich Wasser mit sanftem Alphaverlauf über das reale Bodentile. Es enthält **keinen Strand, Sand, Ufersaum oder Vegetationsstreifen**. Die Wasserfarbe und -Textur wird aus dem tatsächlichen Wasserbild des Mündungshex übernommen; ohne geladenes Bild bleibt ein einfacher blauer Fallback. Das Wasser-Overlay läuft in das Mündungshex hinein und verblasst dort, damit kein abgeschnittener Flusskörper sichtbar ist.

An einer Küste wird der normale Küsten-Ufersaum **nur** an jener Land-Wasser-Hexseite übersprungen, an der eine gültige und sichtbare Flussroute mündet. Alle anderen Küstenseiten behalten die bestehende \`VedrasShoreline\`-Logik, auch mehrfache Eckkontakte. Die Höhenform wird über die schon vorhandene Relief-Funktion abgetastet, sodass sich der Wasserlauf an die Bodendarstellung anpasst.

## Bedienung

1. Wähle per Gelände-Editor zunächst ein Wasser-Terrain auf mindestens einem Hex.
2. Wähle ein beliebiges **Landhex** als Quellhex.
3. Klicke auf **Ausgewähltes Landhex als Quelle → nächstes Wasserhex**. Eine deterministische Breitensuche erzeugt einen Weg bis zum nächsten erreichbaren Wasserhex. Ohne Wasser lässt sich kein Fluss platzieren.
4. Stelle die Breite ein (12–70 Welteinheiten) oder aktiviere die Anschlussdiagnose. Bei geänderten Geländearten ungültige Flüsse werden nicht gerendert, aber nicht kommentarlos aus gespeicherten Szenen gelöscht.
5. Nutze **Letzten Fluss entfernen** oder **Alle Flüsse entfernen**.

\`state.riverPaths\` persistiert die Hexliste und optionale Quell-Ecknummer je Fluss in lokalen Szenen; \`state.riverWidth\` und \`state.riverDebug\` werden ebenfalls gespeichert und exportiert. Alte Szenen ohne Flussdaten haben standardmäßig keine gültige Route; der früher frei schwebende Demo-Fluss erscheint nicht mehr.

Die separate bisherige Teststraße bleibt erhalten und kann weiterhin über den gemeinsam benannten Schalter „Flüsse & Demo-Straße anzeigen“ eingeblendet werden.

## Prüfungen

\`node tests/test_rivers.cjs\` prüft alle sechs Seiten, gerade und gebogene Verbindungen, exakte Nahtpunkte, Quelle an der Ecke, abgerundeten Anfang, Mündung ins Wasser, kein Fluss ohne Wasser, Ausschluss der Küsten-Ufergrafik nur an der Mündung und das biome-neutrale Alpha-Wasser-Overlay. Ein ausführlicher Browser-/Grafikvergleich bleibt eine separate visuelle QA.

## Platzierungserleichterung (19. Oktober 2026)

Auf der Standard-Testkarte sind zunächst 0 Wasserhexe vorhanden. Der ursprüngliche Flussknopf konnte deshalb nie einen Fluss erzeugen. Der neue Knopf **Testfluss mit Wasserhex erzeugen** sucht eine bereits geladene reale Ozean-Wassertextur, setzt sie auf ein bisher unzugewiesenes Randhex und legt eine gültige Flussroute von der ausgewählten Landquelle bis dort an. **Manuelle Flüsse:** Zunächst ein Landhex wählen, auf **Fluss Hex für Hex zeichnen** klicken und dann jeweils direkt benachbarte Hexfelder anklicken. Eine gestrichelte Vorschau markiert den noch unvollständigen Verlauf. Sobald ein Wasserhex als letztes Feld gewählt wird, wird die reguläre, richtungsabhängige Flussdarstellung erzeugt. Ein nicht verbundener Verlauf wird nicht als fertiger Fluss gespeichert. Eigens gesetzte Wasserhexe bleiben beim Löschen der Flüsse bestehen, damit die Karte nicht unerwartet verändert wird.
