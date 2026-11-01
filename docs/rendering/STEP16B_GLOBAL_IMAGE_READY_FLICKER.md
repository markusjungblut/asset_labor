# Schritt 16B – Wolkenblinken bei globaler Gelände-Bildnachladung

## Ausgangssituation

Der Benutzer meldete am 01.11.2026 im **normalen Firefox-Asset-Labor**
bei Qualität **4×** eine erneut hinter Wolken verschwindende Landschaft
(etwa 1 Sekunde nach vorher sichtbaren Hexen) und extrem langsamen
Kartenwechsel mit nur ca. 4–8 sichtbaren Kacheln. Im Screenshot
war `renderer16B: true` und `quality: "4"` bestätigt;
die Browser-Skript-Cachekennung aus PR #93 hatte den Fehler nicht beseitigt.

Die drei bereits bestandenen, vorgewärmten 397-Hex-Windows-Audits
und 94/94 nativen Regressionstests prüfen **nicht** den normalen
Cold-Streaming-Fall mit weiteren asynchron eintreffenden PNGs.

## Konkreter Codefehler

`app.js` bündelt nachgeladene Ground-Grafiken im
`imagePool.onReady`-Pfad mit 120/900-ms-Debounce. Wenn keine
präzisen abhängigen Tiles berechnet werden können,
wird `worldTiles.invalidate('image-ready-ground')` aufgerufen.

Bisher hat `world-tile-streamer.js → invalidate()` für **alle
Gründe** sämtliche Caches zerstört und zusätzlich
`visibleTiles=[]` und **`fogCells=[]`** zurückgesetzt.
Damit konnte eine nachträgliche PNG-Dekodierung die bereits
vollständige Landschaft kurz nach ihrer Anzeige erneut durch
eine reine Wolkenfläche ersetzen. Die Demo-/Fog-Freigabemaske
wurde ohne explizite Änderung verloren.

## Isolierte Änderung

**Nur** bei `reason==='image-ready-ground'`:

- Stabile abgeschlossene, aktuell **sichtbare und autorisierte**
  Tile-Pakete werden im Cache gehalten und als **`dirty`**
  markiert; dadurch weder `exact` noch frisch/`ready` gezählt.
  Diese Bilder sind ausschließlich **temporäre visuelle Fallbacks**,
  bis die fertige Quellversion atomar eintrifft.
- Preview-/inkomplette, unbekannte oder nicht mehr sichtbare
  Cacheeinträge werden weiterhin freigegeben.
- Laufende frühere Quelljobs werden wie bisher mittels
  Generation/Epoch/Abort invalidiert. Die neue Quelle muss erneut
  über die normale Source-Ready-/Revision-Prüfung laden.
- Das **bestehende Fog-Maskenobjekt** und die autorisierten
  sichtbaren Tile-Deskriptoren bleiben unverändert erhalten.
  Bei `request()` mit nicht autorisierten Tiles werden diese
  weiterhin gefiltert; der Kompositor clippt an der autorisierten
  Hexmaske. Keine neuen Daten werden freigegeben.
- Alle anderen Gründe (`scene-change`, Editor-Aktionen,
  strategischer Modus usw.) nutzen weiterhin den bisherigen
  **vollständigen** Cache-/Fog-Reset. Keine Änderung an Budget,
  DPR, LOD, Bildquellen oder Pixeln.

Das nutzt den bereits in PR #83 vorhandenen Vertrag
`dirty`-Retain für selektive Bildrevisionen und erweitert ihn
auf den **globalen Bildnachlade-Fallback**. Ein gestapelter
Draft-PR auf #93, keine Merges.

## Tests

Sieben zusätzliche deterministische Node-Regressionen prüfen:

1. Globale Image-Ready-Invalidierung hält abgeschlossene sichtbare
   Pakete als **stale**, nicht `exact`.
2. Nachgeladenes Ground erhält die **gleiche Fog-Clip-Maske**;
   als `unknown` markierte Kacheln bleiben unsichtbar.
3. Nicht sichtbare Pakete und Preview werden verworfen.
4. Neue fertige Quelldaten ersetzen den alten Cache **atomar**.
5. Blockierte Quellgrafiken behalten die sichtbare alte Landschaft,
   ohne falsche readiness oder Endlosschleifen.
6. Echte Karten-/Editoränderungen leeren den Cache weiterhin.
7. Mehrere Bildnachlade-Callbacks halten den Cache begrenzt.

Die **sieben Fälle wurden isoliert mit dem echten
`world-tile-streamer.js`-Code** ausgeführt und bestanden (7/7).
Der Windows-Launcher wurde entsprechend auf **101/101**
Pflichtfälle in neun Suites erweitert. **Dieser geänderte Branch
ist noch nicht nativ im Browser bestätigt.**

## Windows-Nachprüfung

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-retain-fog-on-global-image-ready-20261101
git pull --ff-only origin fix/step16b-retain-fog-on-global-image-ready-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Danach den lokalen Server **neu starten**, Firefox mit
**Strg + Umschalt + R** neu laden und normal (ohne
`configureCameraWarmFootprint` oder andere Audit-Aufwärmung)
bei Qualität 4× und ausgeschaltetem Demo-Fog testen.

Der Fix sollte **nur** das erneute Blinken durch globale
Bildnachladungen verhindern. Es bleibt zu messen, wie stark
der erstmalige Chunk-Bake, die ImagePool-Evictions
und die LOD-/Cachebudgets beim **Pannen in neue Gebiete**
die Reaktionszeit einschränken. Wenn weiterhin nur 4–8
Hex-/Weltkacheln sichtbar werden, zum Zeitpunkt des Problems
`v.tileDiagnostics({limit:24})` samt Gründen und
`v.worldTileStats()`/`v.assetMemory()` erfassen.
**Die Nutzerbeobachtung allein beweist nicht, dass dieser eine
Bug alle Cold-Streaming-Engpässe erklärt.**

### Nicht erreicht

Keine echte Firefox-Cold-Streaming-Abnahme und keine
Wiederholung der drei Warm-Audits auf diesem Branch.
`Issue #92` bleibt offen und vor der spekulativen
Ozeannaht `#90` priorisiert. Drafts bleiben ungemergt.
