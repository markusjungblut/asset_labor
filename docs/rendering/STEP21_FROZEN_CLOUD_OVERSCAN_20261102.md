# Schritt 21 – Wolken außerhalb der Spielfläche vorbereiten und weit herausgezoomte Kamera beschleunigen

Stand: 02.11.2026 · Branch `feat/step21-frozen-cloud-overscan-dissolve-20261102` · Basis PR #105

## Auslöser: Nutzerbeobachtung

- Der umgestellte 2×-Viewer zeigt eine **spürbare Verbesserung**.
- Vom tatsächlichen Firefox-Browser: `converted:110`, `hits:277`, `volatileHits:0`, `bytes:208434278`, `failures:0`, `pending:0` – die abgeleiteten Kartenbilder sind erfolgreich persistent gespeichert.
- **Fehler:** Beim Verlassen des Sichtfelds erschienen Hex-Wolken wieder, die beim Zurückschwenken rasch verschwanden. Der Wechsel war abrupt und lenkte von der Landschaft ab.
- **Zusätzlich:** Bei sehr weit herausgezoomter Karte war das Verschieben weiterhin langsam.

## Maßnahmen

### 1. Mindestens ein vollständiges Hex zusätzlich zum Viewport laden

`frozen-map-view-policy.js`: `MARGIN_WORLD=320`, entspricht einer vollen Hexbreite von **256 Welteinheiten** plus **64 Welt-Überhang**. `screenBounds()` bestimmt vierseitig die zusätzlichen Grenzen in Weltkoordinaten – korrekt für Zoom und `projectY=.85`.

Der Frozen-Player lädt zuerst sichtbare Kacheln; danach werden **alle zusätzlichen 512er WorldTiles, die den erweiterten Weltraum schneiden**, in derselben begrenzten asynchronen Warteschlange vorbereitet. Sichtbare und vorausgeladene Kacheln sind vor LRU-Eviction geschützt, solange sie den erweiterten Viewport berühren. Die Original-IndexedDB und die bestehenden 2×-PNG-Varianten bleiben unverändert.

**Grenze:** Die ersten Besuche bzw. schnelle Kamerasprünge können weiterhin Wolken zeigen, bis die benötigten Bilder fertig sind. Das ist ein Schutz gegen tatsächlich fehlende Bildinhalte, kein Fehler der Schatten-/Bildgeometrie. Die Maßnahme verspricht keine unmögliche sofortige Freigabe ungeladener oder nicht autorisierter Welt.

### 2. Auflösen statt hartem Wolkenwechsel

Die bestehenden Wolken-Illustrationen und die echte Hex-Sichtgeometrie bleiben identisch. Nur beim Übergang von **sichtbar beobachtetem „ungeladen“** zu **vollständig geladen** wird die Wolkendeckung in **560 ms** mit `smoothstep` stufenlos ausgeblendet. Fertige Hexfelder, die erstmals ins Bild kommen, erhalten **keine neue Wolkenanimation**. Der Status `cloudDissolveActive` wird im Viewer angezeigt.

**Sicherheit:** Explorations-/Autorisierungsgrenzen werden nicht ausgeblendet. Es wird nur über ein bereits freigegebenes und vollständig dekodiertes Hex geblendet. Der aktuelle Offline-Test markiert alle authored Hexfelder lokal als sichtbar; Multiplayer muss weiterhin serverseitige Sichtrechte durchsetzen.

### 3. Weite Kartenübersicht schneller machen

Bei normalem Zoom bleibt das gewünschte **2×-Ausgabeprofil**. Für stark herausgezoomte Ansichten **≤42 %** wird die physische Canvas-DPR auf **1,25×** reduziert, zwischen 42 % und 52 % weich interpoliert und bei ≥52 % wieder auf **2×** gesetzt. Dadurch ändert sich **nicht** die Auflösung, der Inhalt oder die Archivierung der 2×-Bilder.

Bei **≤52 % Zoom** fasst der Renderer die fertigen Ground- und Scenery-PNGs einschließlich derselben `pad/crop`-Koordinaten zu einem **temporären, erweiterten Panorama-Canvas** zusammen (logischer Rand 110–280 CSS-Pixel). Solange Kamera/Zoom und die geladenen Bildkacheln es zulassen, verschiebt der Player nur den passenden bereits berechneten Bildausschnitt. Die statischen Baum-/Schattenlayer werden **nicht für jeden Pointer-Move vollständig neu gezeichnet**. Der Cache ist auf 8,5 Mio physische Pixel begrenzt und existiert ausschließlich im RAM. Beim Verlassen des Zusatzrandes, Zoomwechsel oder Eintreffen neuer Weltbilder wird er neu erstellt. Die Kachel-Signatur ist unabhängig von ihrer wechselnden LRU-Reihenfolge stabil.

Zusätzlich:
- Das Untergrund-Wolkenmuster wird **nicht mehr vollständig unter alle ohnehin bekannten Weltfelder gezeichnet**, sondern nur in tatsächlich unbekannten Gebieten. Fehlende, aber autorisierte Kacheln erhalten ihre normale Ladewolke.
- Die unveränderten Sichtberechtigungs-Grenzkanten werden **einmal pro Szene** statt einmal pro Frame aufgebaut.
- In der weiten Übersicht verwendet das Bitmap-Compositing weniger aufwendiges Image-Smoothing, während Nahansicht weiterhin hohe Qualität behält.

## Testverfahren Firefox / Windows

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step21-frozen-cloud-overscan-dissolve-20261102
git pull --ff-only origin feat/step21-frozen-cloud-overscan-dissolve-20261102
node --test tests/test_rendering_step21_cloud_overscan_20261102.cjs
```

Server unverändert mit `127.0.0.1:8780` betreiben (gleiche Origin/Firefox-Profil, **keine IndexedDB-Daten löschen**):

`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near`

1. Einige Sekunden dieselbe Kartengegend betrachten, bis die Ladeanzeigen `0 PNG-Lesevorgänge` melden. Einen kompletten Hexring hin und zurück schwenken. **Bereits vollständig geladene Bereiche dürfen keine temporären Wolken am Rand bekommen.**
2. In ein bisher noch nicht besuchtes Gebiet schwenken. Falls echte Bilder fehlen, Wolken erlauben; beim Abschluss sollten sie **über rund 560 ms ausblenden**, nicht schlagartig verschwinden. Bei bereits vorbereiteten Bereichen dürfen sie nicht erneut aufpoppen.
3. Weit herauszoomen (z. B. 25–35 %) und die Welt langsam und diagonal verschieben. `Raster 1.25×` muss angezeigt werden; `Übersicht-Canvas [Treffer] / [Neuaufbauten]` soll viele Treffer bei wenigen Neuaufbauten zeigen, solange man im Zusatzrand bleibt.
4. Auf 70–100 % hereinzoomen: `Raster 2×` und unveränderte Schärfe, Schatten, Flüsse/Ufer, Baumkronen und keine neuen Tile-Nähte.
5. Wenn keine fremden Hexfelder angezeigt werden dürfen, muss deren Terrain durch die Wolken maskiert bleiben. **Keinen Workaround verwenden, der verborgene Weltbilder enthüllt.**

Beispiel-Diagnose in Firefox-Konsole:

```javascript
window.__vedrasFrozenGameTest.stats()
window.__vedrasFrozenGameTest.derived2x()
```

Zu beobachten: `overviewRasterHits/overviewRasterBuilds`, `overviewRasterMiB`, `cloudDissolveActive`, `decodedPixels`, `paintMs`, `pending`, `derived2x.hits/converted/failures`.

## Grenzen / Definition of Done

- Das Testbild muss mit echter 120-Tile-Karte bestätigt werden. Die Code-Syntax und ein isolierter Runtime-/Kamera-Mock wurden geprüft; **keine echten Firefox-Frametimes oder Video-Abnahme vorhanden**.
- Der neue Panorama-Canvas betrifft die **weite Ansicht**; die normale nahe Ansicht nutzt weiterhin das direkte Bild-Compositing.
- Der 2×-Standard ist **nicht rückgängig gemacht** und der originale 4×-Atlas bleibt unverändert.
- Bei schnelleren Schwenks als der vorbereitete 1-Hex-Buffer kann Streaming weiterhin sichtbar werden; dann liegt die Priorität auf adaptivem Vorladen.
- Keine Karten-Neuberechnung, kein ZIP-Import und keine Löschung lokaler Bildcaches.
