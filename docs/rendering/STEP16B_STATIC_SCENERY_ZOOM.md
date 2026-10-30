# Schritt 16B – isolierter Befund: statisches Scenery-Raster wird pro Zoomframe neu gezeichnet

## Befund aus Step16A (30.10.2026, unveränderte 397 Hex / 2631 Nature)

Der Produktions-Compositor allein meldete valide 16/16 Tiles bei
0,4 ms Pan-/0,2 ms Zoom-Kompositionszeit (p95). Die rAF-p95-Zeiten
des synthetischen Kontrolllaufs waren 60,04 bzw. 33,50 ms;
Komposition und Browser-Frameintervalle dürfen nicht gleichgesetzt werden.

Reale Auto-Qualität: Pan rAF-p95 16,80 ms mit **2** neuen vollständigen
World-Tile-Bakes. Auto-Zoom rAF-p95 817,34 ms mit nur **13** Frames
(deshalb **keine** gültige warme FPS-Abnahme), aber **0** Tile-Bakes,
**0** Tile-Cache-Misses, **0** Asset-Events und **13 zusätzliche
StaticScenery-Builds** bei 13 Kamera-Anforderungen. Kein LOD-/
Asset-/Ground-Neubau erklärt hier den Zoom-Stau. 4×-Zoom hatte
5 neue Scenery-Builds bei 5 Sampleframes plus Tile-Revisionen;
4×-Pan hatte 27 zusätzliche Tile-Bakes und 13 Terrain-
Builds, also eine andere, unabhängig zu untersuchende Ursache.

## Nachgewiesener Codepfad

`static-object-layer.js` verglich den Zoom bislang exakt (`e.zoom===v.zoom`).
Schon kleinste Zoomänderungen erzeugen einen neuen gepaddeten
Vegetations-/Schatten-Canvas, während `drawFastStaticScenery()` auf
jeden Kamera-Frame `staticScenery.paint` anwendet.

## Minimaler 16B-Eingriff

Nur der Fast-Camera-Pfad darf bereits gezeichnete statische Scenery
kurzzeitig affine-reprojizieren (Zoomfaktor zwischen 0,85 und 1,18
zur zuletzt exakt gezeichneten Source, feste Revision, identisches
Viewport/DPR, volle Rasterdeckung). Positionierung berücksichtigt
den Bildmittelpunkt, Pan und den Overscan; alle anderen Aufrufer
behalten exakte Raster-Neuzeichnung bei Zoom. Nach 250 ms ohne
weiteren Zoom wird EIN nativ aufgelöstes neues Scenery-Raster
erzeugt. Geändert werden weder Ground/World-Cache, Bildpool,
Biomzuordnung, Fog, Source-LOD noch PNG-Export.

Die bloße Geometrie-Korrektheit ersetzt keine visuelle Prüfung:
Temporäres 18-%-Upscaling kann leicht unschärfer sein. Das darf
weder final gespeichert noch als exakte PNG-Ausgabe verwendet werden.

## Bisherige Tests und harte Grenzen

- JavaScript-Syntax von `app.js`, `static-object-layer.js` und neuer
  Regressionstestdatei im V8 geprüft.
- Reale statische Layerfunktion in isoliertem V8: Zoom .70→.77
  erzeugt **keinen neuen Scenery-Build** und repositioniert
  Canvas exakt affine; Zoom .70→.86 oder Inhaltsänderung erzwingt
  neuen Build.
- Sieben Node-Regressionstests für korrekte Geometrie, Pan, exakten
  Editor-/Export-Pfad, zu große Zoomdifferenz, unzureichenden
  Overscan, Inhaltsänderung und Clear geschrieben.
- Browser-/Windows-Hardwareabnahme und visuelle Szenenprüfung
  **noch nicht ausgeführt**. Keinen Performancegewinn behaupten.

## Erforderliche Abnahme

Nach Node-Tests `START_STEP16A_WINDOWS.cmd --qualities 4,auto
--frames 90 --settle-ms 12000` ausführen. Erwartete Zähler:
- Auto-Zoom: sehr deutlich weniger StaticScenery-Builds während
  Kamera-Frames (im Basislauf 13/13), 0 neue Tile-Bakes und
  0 Invalidierungen, nach Bewegungsende genau eine exakte Erneuerung.
- Auto-Pan: keine zusätzliche Scenery-Aufbereitung und keine
  erhöhte Terrain-/Image-Last.
- 4×: getrennt diagnostizieren, keine vorzeitige Readiness-Abnahme.
- Bildvergleich: Wasser (-4,5), Gelände, Wald-Überlappungen, Schatten,
  Küste und Fog vor/während/nach Zoom sowie exakter PNG-Export.
- Drei vergleichbare Windows-Läufe vor finaler 16C-Freigabe.

Schritt 17 bleibt gesperrt. Wenn die Zähler nicht deutlich besser
werden, diesen isolierten 16B-Eingriff zurücknehmen, statt
weitere Renderpfade blind anzupassen.
