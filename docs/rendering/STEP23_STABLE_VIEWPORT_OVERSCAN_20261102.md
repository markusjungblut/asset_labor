# Schritt 23 – Stabiles Kartenfenster, quadratfreies Herauszoomen und gecachter Pan

Stand: 02.11.2026. Gestapelter Draft-PR auf Schritt 22. **Originalatlas v1-0374527a (4×), eigenständiger 2×-PNG-Cache, Hex-Geometrie und Schattenparameter bleiben unverändert.** Keine Weltneuberechnung.

## Nutzerbefund

- Beim raschen Herauszoomen ist das **rechteckige Ende der bisherigen Bildschirmkopie** als graues Quadrat zu sehen.
- Die beiden langen Diagnosezeilen am unteren Bildrand können umbrechen. Dadurch wird die Canvas-Fläche dynamisch höher/niedriger, was einen erneuten Rasteraufbau und visuelle Skalierung erzwingt.
- **Panning und Zoomen bleiben langsam**, obwohl 2× und echte Wolkenüberblendung bereits merkliche Verbesserungen brachten.
- Hinter der letzten Wolkenreihe ist noch grauer Untergrund sichtbar; für den Testplayer vorläufig akzeptabel, für das eigentliche Spiel ein ausdrücklich **offenes Darstellungsproblem**.

## Korrektur A – HUD darf den Spielbereich niemals verschieben

`frozen-map-game.html` erhält einen **festen 36px hohen Footer** mit `flex-wrap:nowrap` und ellipsierten, horizontal unveränderlichen `#message/#metrics`. Der vollständige Text bleibt als Tooltip auf Hover erhalten; detaillierte Messzahlen weiterhin via `window.__vedrasFrozenGameTest.stats()`.

Die Labels `#zoom` und `#rasterQuality` reservieren konstante Mindestbreiten. Laufende Statusaktualisierungen werden in `frozen-map-game.js` auf circa **180 ms** begrenzt statt pro Animationsframe die gleichen DOM-Knoten ständig neu zu befüllen.

Ein `ResizeObserver` löst nur dann eine Neuzeichnung aus, wenn sich **tatsächlich die physische CSS-Breite/-Höhe des Kartenfensters geändert hat**, und bündelt mehrfache Beobachtungen in einen `requestAnimationFrame`. Derselbe Szenenschlüssel und bereits dekodierte Tile-Bilder werden dabei wiederverwendet. Ein echtes größeres Fenster kann neue angrenzende Tiles zum Nachladen benötigen – keine Terrain-Neuberechnung.

## Korrektur B – Kein quadratisches altes Bildschirmbild beim Zoom-out

Die alte Zwischenbildroutine kopierte genau den sichtbaren Canvas. Beim Herauszoomen (`ratio<1`) schrumpfte dieser in ein kleineres Rechteck. Die restliche Fläche wurde einfarbig grau gefüllt, weshalb ein deutliches Quadrat entstand.

`beginZoomPreview({zoomOut:true})` komponiert jetzt **einmalig einen erweiterten Weltbereich** von bis zu 1,45 zusätzlichen Bildschirmbreiten/-höhen pro Seite aus den **bereits dekodierten 2×-WorldTile-PNGs**, demselben Hex-Clip, dem tatsächlichen Wolkenfeld, ggf. noch nicht fertig geladenen Hexwolken und den deckenden Frontier-Wolken. Die Zwischenbitmap ist auf **4 Mio Pixel** beschränkt und nur eine temporäre Anzeige. Auflösung und Position der Originalbilder ändern sich nicht.

Die anschließende Zoom-/Pan-Zeichnung transformiert diese größere Rasterbitmap, während der bestehende Tile-Reader die nächsten benötigten Kacheln im Hintergrund lädt. Beim Verbrauch von ca. 60 % der Zoomreserve bzw. 85 % der Panreserve wird die Bitmap aus dem *aktuellen* autorisierten Weltzustand neu aufgebaut. Sollte bei einem extremen Zoomsprung die Vorlage nicht mehr den gesamten Viewport abdecken, fällt der Renderer auf die **echte Weltkomposition** zurück – niemals auf ein scharfkantiges, verkleinertes Screenshot-Rechteck.

Die Vorbereitung eines größeren Rasters kann einmalig aufwendiger sein. Entscheidend ist, dass danach viele Eingabeframes ohne vollständige Re-Komposition funktionieren. Der Zwischenstand darf während der Bewegung etwas unschärfer sein; er wird beim Loslassen bzw. nach 145 ms Zoomruhe auf die korrekte Schärfe zurückgestellt.

## Korrektur C – Nicht nur Übersichtspan, auch normales Panning beschleunigen

`paintOverview()` wird bei ausreichend kleinem Canvas nun in **jeder Zoomstufe** genutzt (nicht nur ≤52 % und während Wolkenauflösung), mit bestehendem **8,5-MP-Rasterlimit**.

Auch `clouds.drawBase()` wird in ein separates **erweitertes Cloud-Backdrop-Canvas** mit höchstens **6,5 Mio Pixeln** gecacht. Bei kurzen Panbewegungen wird nur dessen Ausschnitt verschoben, statt Hunderte Wolkenstempel zweimal (Hard/Soft) pro Frame zu zeichnen. Bei einem Wechsel der Wolkenassets wird dieser Cache invalidiert; die echte Ladewolkenauflösung bleibt dynamisch darüber.

Beim Mouse-Drag wird dieselbe erweiterte autorisierte Kartenvorschau wie beim Zoomen benutzt. Sie wird erst beim Überschreiten einer 3px-Bewegung initialisiert, bei langen Drags bedarfsabhängig erneuert und nach dem Loslassen einmalig scharf neu gerendert. Gleichzeitig werden die zukünftig benötigten Tile-Bilder wie bisher weitergestreamt.

Die Bildspeicherlimits verhindern riesige zusätzliche Neben-Canvases. Auf **sehr großen Monitoren** muss der Player teilweise auf direkten Rasteraufbau zurückfallen; seine Framerate ist durch dieses Paket noch nicht garantiert.

## Offener separater Task – Wolken jenseits der Karte

`cloud-artwork.js/drawBase()` zeichnet derzeit eine hexagonale Cloud-Kachelmatrix nur innerhalb des sichtbaren Bereichs. Zusätzlich existiert eine Schutzgrenze `if(hexes.length>1400) return 0`, die bei extrem weiten Übersichten nur den grauen Hintergrund zurücklassen kann. Für einen vollständigen Multiplayer-Spielmodus ist eine **kontinuierliche, grenzenlose Wolkendecke** nötig; die rendertechnische Lösung muss zugleich auf große Zoom-Out-Flächen skalieren und darf keine nicht autorisierten Kartendaten sichtbar machen. Das wird **nicht** durch diesen PR vorgetäuscht oder mit mehr als 1400 ungebremsten Einzelstempeln gelöst.

## Test (Firefox, dieselbe Origin)

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step23-stable-viewport-zoom-overscan-20261102
git pull --ff-only origin feat/step23-stable-viewport-zoom-overscan-20261102
node --test tests/test_rendering_step23_stable_viewport_20261102.cjs
```

Danach unverändert:

`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near`

**Abnahmefälle:**
1. Mindestens 20 Sekunden lang Ladewolken, Cachetreffer und Tile-Zähler beobachten: **untere Statuszeile bleibt exakt 36px hoch**, der Kartenrand bewegt sich nicht, Tooltips geben den vollen Text wieder.
2. Von 100 % zügig auf 25–30 % herauszoomen: **kein sichtbares Rechteck** des alten Bildschirmausschnitts. Zwischenansicht zeigt umliegende vorbereitete Hexbilder bzw. die zugehörige Wolkenmaskierung, danach scharfe Karte.
3. Normal zoomen, dann über zehn kurze und mehrere lange Panbewegungen ziehen: `overviewRasterHits` und `cloudBackdropHits` sollten schneller steigen als `overviewRasterBuilds/cloudBackdropBuilds`, sofern der Rasterspeicher ausreicht.
4. Bei tatsächlichem Resize (Browsergröße ändern): Kamera auf dem gleichen Weltpunkt, kein Neubake, Bildkacheln weiterhin aus gespeicherter 2×-DB. Zusätzliche neu sichtbare Rand-Tiles dürfen nachgeladen werden.
5. Schatten, Wolkentransparenz, Küsten-/WorldTile-Nähte und autorisierte/verborgene Hexfelder weiterhin korrekt.

**Technischer Status:** JS-Dateien wurden syntaktisch geprüft. Ein isolierter Runtime-Test mit neun Mock-Paketen zeigte nach Aufwärmen **1 Terrain-Raster-Build und 1 Wolken-Raster-Build**, anschließend **fünf Terrain-Raster-Hits und mehrere Wolken-Raster-Hits ohne weitere Builds**. Das erweiterte Zoom-Out-Zwischenbild bedeckte bei einem Halbieren des Zoomwerts den gesamten simulierten Viewport; bei einem extremen Sprung wurde das unzureichende Screenshot-Bild nicht angezeigt. Ein echter Windows/Firefox-Test mit der 120-Kachel-Szene steht noch aus; PR bleibt Draft.
