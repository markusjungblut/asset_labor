# Asset-Labor v0.11.6 · Wege, Bergsperren und Render-Performance

## Warum die Straßen in v0.11.5 künstlich wirkten

Die Pfadbreite war konstant und der 128×128-Oberflächenstempel nahezu homogen, außerdem lieferte der alte Renderer durchgängige runde Außenlinien. Durch diese Kombination sahen alle drei Ausbaustufen wie gleichmäßig eingefärbte Röhren aus.

Die Geometrie bleibt weiterhin korrekt: **Jedes Hex kann 0–6 Straßenverbindungen besitzen**, und jede Straße läuft von einer Hexmitte über den gemeinsamen Seitenmittelpunkt zur nächsten Hexmitte. Nur die Oberflächendarstellung wird verfeinert.

## Neue drei Materialstufen

**Trampelpfad:** Sehr schmaler eingelaufener Erdkern, unregelmäßige Seitenbreite, leicht dunklere Bodenvertiefung, warmbraune Erdkörnung, zufällige einzelne helle Sandpunkte und dezente Fußspuren. Die eigentliche Bodenstruktur ist absichtlich partiell transparent, sodass Gras-/Waldbodenfarbe durchscheint und der Weg nicht wie ein aufgeklebter Streifen wirkt.

**Befestigter Erdweg:** Größere Straßenbreite, verdichteter hellerdiger Untergrund, zwei zurückhaltende eingefahrene Radspuren und vereinzelte Kiesel. Der Materialton ist von Trampelpfaden abgesetzt, aber an natürliche Erde angepasst.

**Steinstraße:** Eigene grau-beige Steinschüttung mit stärkerer Abgrenzung, kleinen fragmentierten Steinkörnern und gelegentlichen quer zur Fahrtrichtung sichtbaren Pflasterfugen. Die Kurven- und Knotentopologie bleibt identisch.

Alle drei Materialprofile verwenden granulare, deterministische Weltkoordinaten-Texturen. Die optische Straßengrundfläche besitzt beidseits **unregelmäßige kompaktierte Kanten**, die genau an den Knoten wieder auf ihren Anschlusswert übergehen. Mikrospuren und Steinpartikel werden nur bei Zoom >= 80 % gezeichnet; kleinere Zoomstufen verzichten darauf.

## Keine Straßen auf oder unter Bergmassiven

- Straßen sind auf dem Biom `mountain` bzw. Terrain `mountain_ground` nicht platzierbar.
- Zusätzlich sperren tatsächliche platzierte Berggrafiken auch die angrenzende **Berg-Einflussfläche** (`VedrasMountains.influence`), damit kein Straßenarm unter den sichtbaren Bergen verschwindet.
- Diese Prüfung gilt zentral in `normalizeEdges` und `setEdge`, im Sechs-Nachbarn-Editor, Karten-Zeichenmodus, bei gespeicherten Straßendaten und beim Szenenexport.
- Bereits vorhandene, unzulässige Kanten werden nicht dargestellt und beim nächsten Szenenspeichern entfernt. Gelände darf von der Sperrlogik nicht verändert werden.

## Markantere Holzbrücken

Die vorhandenen sechs richtungsabhängigen SVG-Assets in `assets/bridges/` wurden mit klar getrennten Eichendielen, kräftigeren dunklen Trägern, sichtbaren Holzmaserungen, Bolzen, Posten und Schatten überarbeitet. Die automatische Position bleibt am echten Schnittpunkt der Straße mit dem Hexkanten-Fluss; die Brücken liegen weiterhin **über** Fluss und Straße.

## Behobene Performance-Risiken (generatorseitig)

| Bisher | Neu |
|---|---|
| Für jeden Berg bei **jedem** Redraw große Schattenraster neu erzeugen, Bilddaten über den ganzen Viewport auslesen und zusammenführen | Enge lokale Schattenmaske pro Größe/Profil/Intensität **einmal rasterisieren und cachen**; beim Bewegen direkt zeichnen |
| Schatten-Canvas kann bei großem Zoom sehr groß werden und sich mit verschiedenen Einstellungen ansammeln | Schatten-Maskenbreite auf ~320 interne Pixel begrenzt, Cache **max. 18 Einträge / 5 Mio. Pixel** |
| Reliefmaterial auch beim Straßenklick oder Pan erneut deformieren | Relief-Raster **nur bei Änderung der Gelände-/Reliefparameter** neu erstellen |
| Auto-Tiling-Graph bei jedem Render-Aufruf ermitteln | Graph gemeinsam mit Terrain-Raster cachen und bei echten Geländeänderungen invalidieren |
| Berg-PNG-Alpha-Kollision während Array-Sortierung immer wieder prüfen | Zugehörige Berg-Überdeckung **pro Pflanzen-/Bergpaar einmal** berechnen, anschließend Set-Lookup |
| Road-Polyline für jeden Pflanzenanker und jede Zeichnung erneut konstruieren | Weltkoordinaten-Wegkurven mit einem begrenzten Cache wiederverwenden und Rechteckvorprüfung vor Distanztests |
| Fluss-Kanten-/Fillet-Geometrie für jeden Nature-Kollisionspunkt erneut ableiten | Gleichbleibende Flussrouten für kollisionsrelevante Punkte per WeakMap cachen; bei Geländeänderungen oder veränderter Route invalidieren |
| Brückenkandidaten für jede Kamera-Bewegung erneut berechnen | Brückenschnittpunkte werden nur bei Änderung der Straßen-/Flussstruktur neu berechnet |
| Automatische Canvas-Auflösung bis 3× / 18 Mio. Pixel | **Auto maximal 2×**, Pixelbudget **7,6 Mio.**; manuell bleiben höhere Qualitätsstufen verfügbar |
| Nicht nachvollziehbare Framerateeinbrüche | Live-UI **Renderprofil** mit Ø ms pro Frame für Gelände, Wege/Flüsse, Sprites/Schatten und Trefferquote des Bergschatten-Caches; `window.__vedrasRenderProfile` liefert strukturierte Werte |

Die alten Wald-Bodentexturen, Wald-Regiomaske und sämtliche Terrain-Nature-PNGs werden **nicht** bearbeitet. Die Flussgeometrie wird beim Kollisions-Caching unverändert übernommen.

## Verwendung der Renderdiagnose

Im rechten Panel unter **Ansicht & Schärfe** erscheint ein Diagnosefeld mit der durchschnittlichen Berechnungsdauer der letzten 16 Render-Aufrufe. Das ist die **gemessene CPU-/Canvas-Aufrufzeit beim lokalen Browser**, keine fixe FPS-Angabe: Ohne Bewegung zeichnet der Generator nur auf Anfrage (requestAnimationFrame), darum bedeutet 15 ms/Render **nicht automatisch 66 fortlaufende FPS**. Zur Ursachenanalyse Straßen anklicken, Karte verschieben, Schatten deaktivieren und Zoomstufe wechseln; die jeweils hohen Teilzeiten identifizieren die Engpässe. Der Leistungsgewinn muss im echten lokalen Browser noch gemessen werden.

## Später im Browsergame

1. Behalte Terrain, Straßen und Flüsse **statisch pro Chunk** in wenigen Offscreen-Canvases; nur geänderte Chunks neu generieren
2. Lade Atlas-Texturen und die 3 Straßenoberflächen nur einmal; keine zahlreichen separaten Bild-/Canvas-Layer pro Hex oder pro Stein
3. Rendere nur **sichtbare Sprites** mittels Bildschirm-Culling und Chunk-/Spatial-Index statt alle Figuren global zu sortieren
4. Cache Schatten von Bergmassiven sowie dekorativen statischen Pflanzen. Für bewegliche Einheiten reichen einfache Bodenkontakt-Ellipsen
5. Verwende Zoom-abhängige LOD-Stufen (fern: weniger Details, nahe: Dielen/Spurrillen). Ein Max-Frame-Budget verhindert, dass ein Mousemove teure Generatorfunktionen auslöst
6. Berechne Grundkarten-/Regio-Masken und ressourcenintensive Terrain-Uploads auf einem Worker/OffscreenCanvas, sofern die Zielbrowser es erlauben; Hauptthread bleibt für Interaktion frei
7. Profile am echten Zielgerät vor Optimierung: Messwerte von Rendering, GPU-Upload, Sprite-Layout, Schatten, Speicherverbrauch und Input-Latenz vergleichen

## Testabdeckung und Grenzen

`tests/test_organic_roads_perf_0116.cjs` prüft neue Biomsperren, Materialien, detailreduzierten LOD, sechs Brückenbilder und Vorhandensein der Cache-Mechanik; ältere Tests sichern Brücken, 64 Wegeknoten, Flüsse, Naturgrößen und Bergschatten.

**Wichtig:** Automatisierte JavaScript-Regressionen prüfen die Logik; sie ersetzen weder eine visuelle Grafikabnahme noch eine echte browserbasierte Messung der Eingabeverzögerung. Das Profil zeigt nach dem lokalen Update, ob die gemessene Verzögerung vollständig behoben ist.
