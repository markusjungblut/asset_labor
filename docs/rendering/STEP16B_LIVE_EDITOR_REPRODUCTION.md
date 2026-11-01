# Schritt 16B: normale Asset-Labor-Kamera ≠ vorgewärmter Audit

## Echte Nutzerbeobachtung (01.11.2026)

In der normalen Editor-UI bei Qualität **4×** wird die Landschaft
nach dem Aufbau nur kurz angezeigt und etwa eine Sekunde später wieder
durch Wolken verdeckt. Beim Schwenken erscheinen lange nur ca. 4–8
Kacheln. Dies ist eine **hohe Produktpriorität**, separat von der
kleinen Screenshot-Ozeannaht in [Issue #90](https://github.com/markusjungblut/asset_labor/issues/90).
Die neue echte Reproduktionsaufgabe ist [Issue #92](https://github.com/markusjungblut/asset_labor/issues/92).

Die 3× gültigen Windows-Warm-Audits vom 31.10.2026 und
94/94 bestandenen nativen Regressionstests bleiben korrekt,
**belegen aber nicht die flüssige Navigation in ungeöffnete
Gebiete**: Der Audit nutzt eine ausschließlich dafür aktivierte
Quellen-/WorldTile-Reservierung und besucht sämtliche Kamerastationen
**vor** dem Messen. Der normale Browser kann im aktuellen
Kamera-Viewport noch unvorbereitete Terrain-, Shore- und Scenery-
Quellen haben. Die Qualität 4× ist eine hohe Auflösung, kein
Performance-Beschleunigungsmodus.

## Branch-/Browser-Identität

`main` enthielt bei Prüfung am 01.11.2026 weiterhin **nicht**
die gestapelten, ungemergten Draft-PRs #83–#91.
Deren Test-SHA laut nativem Node-Ergebnis ist `aee8e87`.
Die HTML-Skript-URLs von `main` und #91 waren bisher identisch.
Dieser **separate Draft-Branch** versieht deswegen die beiden
zentralen Skripte `app.js` und `world-tile-streamer.js` mit
einer neuen eindeutigen Cachekennung und benennt den
Tile-Renderer-Teststand ausdrücklich als `16B-Teststand`.
Das ändert **keine Renderingpixel, Cachebudgets oder Fog-Gates**.
Die neue URL beseitigt eine mögliche veraltete Browser-Skriptversion,
nicht zwangsläufig den gemeldeten Cold-Loading-Fehler.

## Benutzerprüfung auf derselben Arbeitskopie

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-live-browser-cache-identification-20261101
git pull --ff-only origin fix/step16b-live-browser-cache-identification-20261101
```

**Falls lokale Änderungen vorliegen, nicht zurücksetzen.** Lokalen
Asset-Labor-Server beenden und vom obigen Branch neu starten, danach
im Browser `Strg+Umschalt+R`. Der Checkbox-Text muss
`Echter Tile-Renderer · 16B-Teststand` anzeigen.

Sollte der UI-Text nicht erscheinen, wird noch eine andere
Browser-/Serverkopie geladen: zuerst diesen Punkt klären, keine
Performancebehauptungen ableiten.

Im Browser **F12 → Console**:

```js
(() => {
 const v=window.VedrasAssetLabor;
 return {
  step16bLoaded: typeof v?.warmWorldTileStatus === 'function',
  quality: v?.state?.quality,
  fastCamera: v?.state?.fastCamera,
  fogPreview: document.getElementById('fogPreview')?.checked,
  actualDpr: v?.qualityStats?.().effectiveDpr,
  tileMode: v?.cameraStats?.().active
 };
})()
```

Erwartung: `step16bLoaded=true`, `fastCamera=true`,
`fogPreview=false`, Qualität bewusst `4`.
Die UI kann andere editier-/debugbezogene Optionen enthalten,
die `fastAllowed()` absichtlich blockieren; echte
Kamerabewegung darum im normalen Kartenmodus ohne Debug-/Seam-
Overlays überprüfen.

**Falls Blinken weiterhin auftritt:** direkt währenddessen ein
diagnostisches Snapshot aus der Browser-Konsole auslesen:

```js
(() => {
 const v=window.VedrasAssetLabor;
 const w=v.worldTileStats(),p=v.assetMemory(),
  c=v.cameraStats(),d=v.tileDiagnostics({limit:24});
 return {time:new Date().toISOString(),
  quality:v.state.quality,actualDpr:v.qualityStats().effectiveDpr,
  camera:{active:c.active,interacting:c.interacting,
   backgroundBuilds:c.backgroundBuilds,sceneryBuilds:c.sceneryBuilds},
  world:{tiles:w.tiles,pixels:w.pixels,budgetBytes:w.budgetBytes,
   evicted:w.evicted,completed:w.completed,failed:w.failed,
   pending:w.pending,visible:w.visible,
   progress:w.progress,visiblePreviews:w.visiblePreviews,
   retryExhausted:w.retryExhausted,selectiveInvalidations:w.selectiveInvalidations},
  images:{decodedBytes:p.decodedBytes,limitBytes:p.limitBytes,
   overLimitBytes:p.overLimitBytes,evicted:p.evicted,
   queued:p.queued,active:p.active,protectedBytes:p.protectedBytes},
  blocked:d.artwork.filter(x=>!x.ready).map(x=>({
   id:x.id,reason:x.reason,waitingAssets:x.waitingAssets?.slice(0,4)
  })).slice(0,15)
 };
})()
```

Die Auswertung unterscheidet:

- Weltkachel-Cache/Budget/Eviktion versus unvorbereitete Quellbilder.
- `terrain-not-painted`, `terrain-core-not-ready`,
  `sprite-source-not-ready` versus andere Tile-Blocker.
- Einen aktiven Tile-Kompositor versus normale Editor-Neuzeichnung.
- Cold-Aufbau-Lag versus gemessene Warm-rAF-Stabilität.

Für eine zielgerichtete Codeänderung sind **die Werte bei sichtbarem
Blinken und direkt danach** nötig. Die bisherigen 94/94 Tests
sollen dafür **nicht ständig erneut gestartet** werden. Das
Reproduktionsproblem selbst bleibt bis zur normalen
Browsermessung und korrektem visuellem Resultat offen.

**Unverändert:** 16B technisch Warm-Pfad erfolgreich, echte
Cold-/Normal-Performance nicht abgenommen. **Kein Merge,
Draft; #92 vorrangig vor #90.**
