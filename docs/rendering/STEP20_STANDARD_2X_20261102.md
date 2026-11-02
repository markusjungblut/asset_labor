# Schritt 20 – 2× als Grafikstandard und nicht-destruktiver 2×-Spielkarten-Cache

Stand: 02.11.2026 · **Implementiert im Draft-Branch, lokale Firefox-Abnahme ausstehend** · [Roadmap #103](https://github.com/markusjungblut/asset_labor/issues/103).

## Entscheidung

**2× wird vorerst der Standard.** Der zweite A/B-Bericht mit 10 tatsächlich bebilderten WorldTiles von `v1-0374527a` ergab: 4× Original **65,66 MiB Datei / 245,92 MiB RGBA**, 2× PNG **20,81 MiB Datei / 61,51 MiB RGBA** (−68,3 % Datei, −75 % Pixel), 1× PNG **6,27 MiB / 15,37 MiB RGBA**. Das visuelle Urteil des Nutzers: 2× sieht fast so gut aus wie 4×. **Kein automatischer Qualitäts- oder FPS-Nachweis für die komplette Welt.** 4× ist im Editor vorerst pausiert, aber die vorhandenen Originale bleiben unverändert.

## Aktueller Problembericht aus 397-Hex-Editor

- Ø **1288,3 ms / Frame** (gleitende Editor-Messung; noch nicht stabile 2×-Abnahme).
- Gelände **426,8 ms**, Wege/Flüsse **258,9 ms**, Sprites/Schatten **397,5 ms**.
- Innerhalb des letzten Geländeaufbaus **Diagnose 356,0 ms** – dies enthält nicht-visuelle DOM- und Katalogauswertungen, die bei unverändertem Szeneninhalt nicht mehrfach bei Kamerabewegung berechnet werden müssen.
- Hintergrund-Canvas **13,5 MP** mit Komposition **183 ms**, Scenery-Layer **17 MP** und Komposition **87 ms**.
- Noch **114** Bilder in Warteschlange / **4** aktiv; **64** Terrain-Chunks ausstehend, **103/214** Spritebilder vorhanden, **2146** Naturinstanzen sichtbar.
- Diese hohen Werte stammen aus dem **live zeichnenden Asset-Labor**, nicht dem isolierten Frozen-Map-Player. Start-/Chunkaufbauzeiten dürfen nicht als warme Spielkamerazeiten verkauft werden.

## Änderung 1: Editor standardmäßig 2×

- `index.html`: Auswahl **2× · neuer Grafikstandard** als Default; 4× im UI deaktiviert, nicht aus Code oder Archiv entfernt. 1×, 2×, 3×, Schnell und Auto bleiben verfügbar.
- `app.js`: `state.quality='2'`; Auswahl und Zustand beim `restoreScene()` synchron.
- `render-quality-policy.js`: Standardfallback ebenfalls 2×. Für dichte Szenen bleibt das bestehende Schutzbudget (hier maximal **8 Millionen Canvas-Pixel**) bestehen; 2× ist die gewünschte, **nicht garantierte** effektive Rasterdichte. Bei 1252×540 CSS-Pixeln ist tatsächlich 2× möglich; Gelände-/Sprite-Vorschaugrenzen sind 768/576 px in dichten Szenen.
- **Keine Änderung** an den existierenden 4×-Baked-WorldTiles und ihrem `v1-0374527a`-Szenenschlüssel.
- Die bisherige **4×-Offline-Tour** bleibt als Legacy-Code vorhanden, ist aber über die normale Qualitätsauswahl vorerst nicht erreichbar.

## Änderung 2: Teure nicht-visuelle Diagnose auf Szeneänderungen begrenzen

`drawGroundImpl()` berechnete bei jedem Aufbau u. a. Nachbarprofil- und Wasserkantenlisten, Gebäudefundamentbeispiele und HTML für das ausgewählte Hex. Im bisherigen Beispiel kostete der gesamte gemessene Diagnoseabschnitt **356 ms**.

`groundInfoCache` überspringt nur diese **informativen DOM-Auswertungen**, wenn Autotile-Graph, ausgewähltes Hex, Reliefobjekt, Wasser- und Uferoptionen sowie Weltzellen unverändert sind. Die echten visuellen Debug-Overlays (Hexraster, Kanten, Auswahl) werden weiterhin pro Renderdurchlauf aktualisiert. Bei Szene-/Auswahländerung aktualisieren sich die Informationsfelder erneut.

**Noch nicht gelöst:** 64 ausstehende Terrain-Chunks, 114 wartende Bildquellen, komplettes großes Hintergrund-/Scenery-Canvas bei kaltem Aufbau. Die Maßnahme allein garantiert noch keine 60 FPS.

## Änderung 3: Spiel-Viewer rendert mit 2× und zieht 2×-Quellen aus dem bestehenden Atlas

Der alte Standalone-Viewer übernahm die im Manifest hinterlegte `pose.dpr=4` **direkt als Display-Canvas-DPR**. Nun gilt für den Standalone-Viewer bei Standardfenstergröße **2×** Ausgabedichte; sie wird unabhängig von der ursprünglichen 4×-Quelle berechnet, mit einem Schutzbudget von **8 Mio Pixeln / maximal 4096 px je Kante**.

Zusätzlich enthält `frozen-map-derived-2x.js` einen reinen **Lese-Zugriff auf die ursprüngliche `vedras-frozen-world-v1`** über `window.VedrasFrozenMap.indexedStore()`. Für vorhandene, **vollständig gespeicherte `near`-Atlanten mit Manifest-DPR ≥3** werden sichtbare 4×-Blobs nur bei ihrem **ersten** Laden auf halbe Kantenlänge abgeleitet, als PNG neu kodiert und in einer **separaten IndexedDB** `vedras-frozen-derived-2x-v1` gespeichert. Weitere Browseröffnungen verwenden **direkt** diese 2×-Dateien.

- Bis zu drei gleichzeitige Tile-Dekodierungen und -Ableitungen (bestehendes `frozen-map-runtime.js`-Limit); **keine** Konvertierung der gesamten 600-MB-Quelle bei Seitenstart.
- Grund- und Scenery-/Structure-PNGs erhalten neue Rastergrößen; **pad und Weltkoordinaten bleiben gleich**, vorhandene Scenery-`crop.{x,y,fullWidth,fullHeight}` werden proportional skaliert.
- Autorensprites, Terrainmaterialien, eingebettete Schatten und Sichtrechte werden **nicht neu generiert**, sondern nur die bereits vorberechneten Pixel verkleinert.
- Die ursprünglichen Bilder und das `v1-0374527a`-Manifest werden **nie überschrieben oder gelöscht**, auch nicht bei Speicherproblemen.
- Bei abgelehnter Cache-Schreiboperation (beispielsweise Browser-Speicherquota) läuft die temporäre 2×-Ansicht weiter, mit einem begrenzten **48 MiB RAM-Fallback**; die Statuszeile meldet Speicherwarnungen.
- Für echte native 2×-Atlanten (Manifest-DPR unter 3, oder anderer LOD als `near`) wird **keine erneute Verkleinerung** durchgeführt.
- **Kaltstart-Nachteil:** Beim **ersten** Besuch eines 4×-Originaltiles muss dieses weiterhin gelesen und dekodiert werden. Die einmalige Konvertierung und PNG-Kodierung kann diesen ersten Besuch verlangsamen. Das Versprechen betrifft vor allem **spätere Aufrufe, gespeicherte Varianten und den Speicherverbrauch**.
- Dieser Cache ist **kein ZIP-Import** und ersetzt die Rückimport-Roadmap nicht.

## Lokaler Abnahmelauf

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step20-standard-2x-viewer-performance-20261102
git pull --ff-only origin feat/step20-standard-2x-viewer-performance-20261102
node --test tests/test_rendering_step20_standard2x_20261102.cjs
```

Den gewohnten Server auf Port 8780 starten, mit dem **ursprünglichen Firefox-Profil / derselben Origin** prüfen:

1. `http://127.0.0.1:8780/`: Asset-Labor zeigt **2× als ausgewählte Grafikqualität**. Eine vorher gespeicherte Testszene bleibt dieselbe; keine Neu-Bake-Tour. Kalt- und Warm-Messung aus `perfStats`, `backgroundPerfStats`, `terrainDetailStats` dokumentieren, insbesondere **Diagnose** und **Hintergrund-Komposition**.
2. `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near`: Standalone lädt **dieselbe 120-Tile-Originalkarte**. Die Statuszeile zählt **2×-Cache Treffer / einmalig erzeugte Kacheln** und Speicherwarnungen. Einmal durch einen repräsentativen Bereich schwenken.
3. Browser-Tab schließen und **dieselbe URL erneut öffnen**. Erwartung: Cachetreffer steigen; bereits optimierte Kacheln werden ohne 4×-Neu-Kodierung genutzt. Bei identischer Kamera Ladezeit und `paintMs` vergleichen; eventuelle Wolkenlücken/Nahtstellen prüfen.
4. Aus der Browserkonsole `window.__vedrasFrozenGameTest.derived2x()` und `window.__vedrasFrozenGameTest.stats()` auslesen und die Werte melden.
5. Bei Schatten/Küsten/Alpha-Seams oder Renderingfehlern PR **nicht mergen**; Originalatlas bleibt unter derselben Kennung und das ZIP unverändert.

## Definition of Done

- [ ] 2× ist in Editor und Standalone aktiver Standard, auf 1×-Windows-DPR-Geräten echte 2× Ausgabe, solange das Canvas-Budget reicht.
- [ ] Keine Änderung am gespeicherten Original-`v1-0374527a` (120 Tiles) und ZIP.
- [ ] Gleicher Bild-/Schattenbezug zwischen 4× und 2× ohne neue Kachelnähte oder Fog-Freigaben.
- [ ] Zweiter Standalone-Aufruf nutzt persistierte 2×-Varianten, keine Terrain-Jobs.
- [ ] Warmes Pan/Zoom reproduzierbar messen, echte Vollkarten-Performance/Streaming noch separat optimieren.
- [ ] Native Node-Regressionen und Firefox E2E bestätigen. **Bis dahin PR Draft und keine Erfolgsbehauptung.**
