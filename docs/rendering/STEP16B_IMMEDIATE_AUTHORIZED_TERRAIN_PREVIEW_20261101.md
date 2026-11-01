# Schritt 16B – sofortige autorisierte Hex-Texturvoransicht (Experimental-Draft)

## Ausgangslage, 01.11.2026

Die reale Firefox-Rückmeldung für PR #98: **Das vorherige
Wolkenblinken ist beseitigt**, aber die weißen horizontalen und
vertikalen Kachel-/Chunk-Grenzen sind weiterhin sichtbar, und
die Landschaft wird bei Qualität 4× unerträglich langsam
**einzeln Kachel für Kachel** aufgebaut. Ziel des Benutzers:
**mindestens 50-fach bessere Performance**.

Die beigefügte native Datei `result(1).json` bestätigt **118/118
bestandene Tests** auf Commit `de8465d23687681224b6c111bbaf08c76e8693c3`
(PR #98), Node `v24.19.0`, Windows, 0 Fehler/Skip/Cancel.
Ein modifiziertes Git-Arbeitsverzeichnis wurde ausschließlich durch
**zwei unversionierte vorhandene native Auditordner** gemeldet;
diese dürfen nicht gelöscht werden.

Die Terrain-Worker-Architektur ist CPU-pixelbasiert:
`autotile.js → VedrasAutotile.build` verarbeitet für jeden
512er-Chuck bis zu **850.000 Pixel**, inklusive World-Sampling,
Hexklassifikation, Materialgewichten, Terrainton und teils
Küsten-/Relief-Arbeit. `terrain-worker.js` verarbeitet
`onmessage`-Builds auf **einem** Worker sequenziell.
Zwei Request-Lanes aus #96 erzeugen keine zwei physisch
unabhängigen Terrain-Worker.

**Wichtig: Dieser PR verspricht nicht, dass volle native 4×-Qualität
50-mal schneller fertig ist.** Eine solche Zielbeschleunigung
benötigt voraussichtlich eine grundlegend schnellere Rasterpipeline
(z. B. Shader-Kompositor oder vorproduzierte Material-Atlanten).
Diese experimentelle Umsetzung adressiert jetzt **Time to First
Visible Terrain** – die Zeit, bis in einer neu angefahrenen Region
überhaupt authentisches Gelände statt Einzel-Cloud-Tiles erscheint.

## Neue zweistufige Darstellung

1. **Vorläufige sofortige Materialansicht:** Beim normalen Live-Pannen
   zeichnet `quick-terrain-preview.js` für bis zu 128 Hexe pro Frame
   bereits dekodierte, dem Hex zugeordnete **echte Materialtexturen**
   direkt über natives `Canvas2D.drawImage()` in
   die echte Hex-Kontur. Keine 850k-Pixel-JS-Schleife,
   kein `getImageData`, keine Rasterkopie/Worker-Quelle,
   kein zusätzlicher WorldTile-Cache.
2. **Originale 4×-Qualität:** Der bestehende Chunk-/Shore-/
   WorldTile-Renderer backt unverändert Materialmischung,
   Küstenform, Wege, Relief und Scenery. Sobald eine Kachel
   vollständig vorliegt, übermalt sie die provisorische
   Textur in derselben Komposition. Der endgültige Raster-
   und Qualitätsvertrag bleibt unverändert.
3. **Fog strikt beibehalten:** Die Vorschau darf nur
   `visibility==='visible'` in der bereits durch
   `worldTiles.setFogCells()` freigegebenen Hexmaske
   zeichnen. `unknown` und `explored` bekommen keine
   eigene Texturvoransicht. Ein explizit leeres Fog-Array
   zeichnet weiterhin keinerlei Gelände; auch unvorbereitete
   Bilddateien werden nie vorab als sichtbar anerkannt.
4. **Kein falscher Render-PASS:** `previewHexes` und
   `previewMs` werden separat in
   `v.worldTileStats().progress` erfasst.
   `exact`, `missing`, `tiles`, `completed` und
   `pending` bleiben echte WorldTile-Metriken;
   Vorschauen werden dort nicht mitgezählt.
5. **Kein Warm-Overhead:** Nur wenn mindestens eine angeforderte
   WorldTile nicht existiert (`missing>0`) wird die
   zusätzliche schnelle Vorschau überhaupt aufgerufen.
   Ein vollständig warmer Kamerabereich bleibt unverändert.
6. **Kein vollständiger Ersatz:** Materialtexturen werden
   kurzfristig hexlokal gestreckt; sie besitzen noch keine
   korrekte kontinuierliche Nachbarmischung, detaillierte
   Uferpixel und Relief. Diese **bewusst geringere
   Übergangsqualität** wird nach Fertigstellung der echten
   Renderer-Pakete entfernt. Nicht mit finalem Export
   oder der Qualität der fertigen Karte verwechseln.

Der neue Build ist via Browser-Cachekennung
`step16b=20261101-instant-preview1`
und sichtbarem Text **`16B-Sofortvorschau`**
eindeutig von #98 unterscheidbar.

## Tests

**8/8 neue gezielte Tests** im isolierten V8-Harness PASS:

- Voransicht aus einer echten, bereits dekodierten Materialquelle;
- Fog `unknown` / `explored` niemals zeigen;
- unvorbereitete/noch nicht dekodierte Image-Objekte
  (auch bei `width`-Metadaten) niemals zeichnen;
- kleine bzw. leere Fog-Maske und Far-Zoom zeichnen nichts;
- Anzahl sichtbarer Vorschau-Hexe pro Frame begrenzt;
- noch fehlendes WorldTile darf Materialvorschau anzeigen,
  zählt aber **weiterhin als missing**, nicht exact;
- leere Fog-Maske verhindert selbst eine bösartige
  Preview-Callback-Autorisierung;
- bereits vollständig warmes WorldTile überspringt die
  Preview-Ebene vollständig, und
  Integration der echten `app.js`-Kamerafunktion.

Die native Windows-Gesamtsuite verlangt **126/126 Fälle**
in 14 Testdateien. Für den neuen Commit steht der
native Test **noch aus**. Die 118/118 im Upload betreffen
**nur den vorigen SHA**, nicht diesen PR.

## Windows und Firefox-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch feat/step16b-fast-hex-preview-before-cold-tiles-20261101
git pull --ff-only origin feat/step16b-fast-hex-preview-before-cold-tiles-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Auf vorhandene `artifacts/`-Ordner und manuelle
Assetänderungen achten; **nicht** resetten/aufräumen.
Lokalen Server komplett neu starten, Firefox
`Strg+Umschalt+R`, sichtbarer
Checkbox-Text `16B-Sofortvorschau`.

In Firefox normal (keine Audit-Warmfunktion)
397-Hex-Karte 4× laden, in **zuvor ungesehene
Region** pannen. Erwartung: Die Materialtextur
der sichtbaren freigegebenen Hexe erscheint,
sobald die Quelle dekodiert ist, ohne
nacheinander auf alle Vollqualitäts-WorldTiles
zu warten; die aufwendigen Küsten-, Misch- und
Baumschichten vervollständigen sich danach.

Konsole:

```js
const v=window.VedrasAssetLabor;
console.log({
 quality:v.state.quality,
 world:v.worldTileStats().progress,
 previewMs:v.worldTileStats().progress.previewMs,
 terrain:v.streamingStats().terrain,
 worker:v.tileDiagnostics({limit:80}).worker
});
```

**Messgrößen bitte getrennt protokollieren:**
1. *Time to First Visible Material* nach Pan in ein
   noch ungesehenes Gebiet (Ziel: spürbar ohne
   sichtbares einzelnes Aufpoppen voller Tiles).
2. *Time to 90% exact WorldTile coverage*
   (Ziel 50× schneller; **noch nicht erreicht**).
3. Preview-Kompositionszeit `previewMs`,
   Frame-p95 und echte Tile-Bake-Workerzeit.
4. Weiße Linien quer über Land/Wasser vor und nach
   vollständiger Terrain-Bereitschaft.

**Ausstehende Arbeit:** Das eigentliche Ziel
50× bei voller 4×-Ausgabe ist ein separater
Material-Compositor-/GPU-Performanceauftrag,
nicht durch eine bloße Sofortvorschau bewiesen.
[Live-Performance #92](https://github.com/markusjungblut/asset_labor/issues/92)
und [Ground-Seams #90](https://github.com/markusjungblut/asset_labor/issues/90)
bleiben offen. **Draft, kein Merge.**
