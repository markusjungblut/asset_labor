# Rendering-Fahrplan nach Schritt 14 – verbindliche Arbeitsreihenfolge

**Stand:** 29.10.2026  
**Status:** Plan beschlossen; **keine** der Phasen 15–20 ist dadurch bereits implementiert oder abgenommen.  
**Startpunkt:** `main` nach PR #65 (`4d35703`).  
**Geltungsbereich:** Browsergame/Asset-Labor, vor allem die 397-Hex-Referenzszene.  
**Messprotokolle:** [Schritt 14: Atlas A/B](STEP14_ATLAS_AB.md), [bisheriger Renderingstatus](STATUS.md).

> **Arbeitsauftrag für spätere Entwicklungsrunden:** Dieses Dokument **vor jeder neuen Rendering-Optimierung lesen**, die *erste noch offene Phase* bearbeiten, keine Phase ohne belegte Abnahme als abgeschlossen markieren. Neue Befunde dürfen die Reihenfolge nur mit begründeter, hier dokumentierter Entscheidung verändern. Eine einzelne Änderung pro PR, getrennte Vorher-/Nachher-Messung; keine willkürlichen Atlas-, Cache- und GPU-Eingriffe gleichzeitig.

## 0. Gesicherter Ausgangspunkt und Unsicherheiten

- Referenzszene: **397 Hexfelder, 2.631 Vegetationsinstanzen, 0 fehlende Asset-Pfade**; Szenendatei `artifacts/rendering-step13/vedras_scene.json`.
- Die zweite Step-13-Messung hatte eine Bildpool-Nachladeschleife (74.166 Lade-/74.025 Eviktionsvorgänge); nach dem Pool-Fix waren es im dritten Durchlauf 388 Lade-/100 Eviktionsvorgänge. Der Bildpool hat sich **deutlich stabilisiert**, nicht zwingend die Gesamtperformance.
- Step 14: Atlas AN führte zu **37.350 Atlas-Zeichenversuchen**, aber nur **463 Treffern** (ca. 1,24 %); **634 Atlas-Seitenladungen und 634 Verdrängungen**. Atlas AUS verhinderte diese Seitenvorgänge. Die tatsächlichen Auswirkungen auf die Rendergeschwindigkeit sind **nicht verlässlich quantifiziert**, da der gesamte A/B-Lauf ungültige Teilpaare enthält.
- Beim 4×-Schwenken betrug die gemessene tatsächliche Testdauer ca. **88,25 s** (AN) bzw. **94,43 s** (AUS) für eine nominell 1,8-sekündige Eingabegeste. Chrome-CDP-Taskzeit lag bei ca. **81,5 s** bzw. **83,2 s**. Das sind keine repräsentativen FPS-Messungen; die Interaktion wurde massiv blockiert.
- In diesem 4×-Test wurden `tile.bakeWallMs` ca. 82,1/84,8 s und `tile.groundRoadsMs` ca. 69,6/77,2 s (AN/AUS) berichtet. **Diese Messungen sind teilweise verschachtelt, umfassen bei `bakeWallMs` auch Wartezeit und dürfen nicht summiert werden.** Sie zeigen auf den **Terrain-/World-Tile-Bake-Pfad** als Hauptkandidaten für die nächste Untersuchung.
- Nur **2 der 6** direkten Step-14-Szenariopaare waren technisch vergleichbar, beide bei `auto`; die **4×-Paare waren nicht vollständig ladebereit**. Folglich **kein** belastbarer Nachweis, dass Atlas AN oder AUS höhere FPS liefert.
- Offene visuelle Abweichungen aus Schritt 13/14: `open-water` bei Hex `(-4,5)` erscheint teils wie grünes Gelände, und der Fog-Vergleich ist teilweise vollflächig bewölkt. Ob Kameraausrichtung, Kachelzustand oder tatsächliche Terrain-/Fog-Logik dafür verantwortlich sind, **ist noch ungeklärt**.
- Bereits vorhanden: WebGL2-Bausteine `gpu-terrain.js` und `gpu-sprite-layer.js`, aber die schnelle World-Tile-Kamera verwendet den Canvas-2D-Kompositor `world-tile-streamer.js`. **Ein neuer GPU-Renderer ist noch nicht als notwendig oder überlegen belegt.**

**Vorläufige Architekturentscheidungen:** Der bestehende automatische Atlas-Bypass für dichte Szenen bleibt aktiv. Der Atlas wird weder weiter optimiert noch vollständig entfernt, bevor ein valider Nutzen nachgewiesen ist. Keine Migration zu WebGL2/WebGPU/PixiJS als Ersatz für CPU-seitige Bake-Arbeit. Canvas-2D-Fallback und PNG-Export müssen erhalten bleiben.

## 1. Messvertrag und Definition von „vergleichbar“

### Festes Szenario

- Gespeicherte Referenz-JSON, Browser/Hardware, 1280×820 Chrome-Fenster, DPR 1, identische Renderqualität und identischer Kamerapfad.
- Kernprofile: **`auto` und `4`**; wenn 4× unready bleibt, zunächst `1` oder `2` als zusätzliche Diagnose aufnehmen, aber 4× **nicht** als bestanden ausgeben.
- Testpositionen: Kartenmitte `(0,0)`, dichter Wald `(-3,0)`, Küste `(1,3)`, Gebirge `(-10,3)`, Moor `(-7,4)`, Meer `(-4,5)`; Kamerapositionen gegen tatsächliche Darstellung prüfen.
- Getrennte Fälle: **Warm-Pan**, **Warm-Zoom**, **Cold-Zoom** sowie Kamerapfad über noch nicht vorbereitete Regionen. Niemals Warm- und Cold-Ergebnisse vermischen.
- Bestehende Befehle: `START_RENDERTEST_WINDOWS.cmd` (Schritt 13) und `START_ATLAS_AB_WINDOWS.cmd` (Schritt 14). A/B-Wiederholungen mit `--order on,off` und `--order off,on`.
- Mindestens **3 Wiederholungen pro Konfiguration** auf derselben Hardware für eine endgültige Performanceentscheidung. Wenn eine Konfiguration keine vollständigen Start-/Endbilder liefert, Ergebnisse als **diagnostisch/ungültig** führen und die Ladeursache beheben, bevor eine FPS-Rangfolge behauptet wird.

### Pflichtkennzahlen für jedes PR

1. Zeit pro `drawGround`-/`drawRoads`-Aufruf, Aufrufzahl, Herkunft des Aufrufs (normale Editorzeichnung, World-Tile-Fallback, tatsächliche Änderung); `bakeWorldTile`: Anzahl, Reuse-Hits, Fallbacks, Ablehnungsgrund.
2. Chrome-CDP-Main-Thread-Taskzeit und tatsächliche Wandzeit; **nicht** als gesamte CPU-Auslastung ausgeben. rAF-p50/p95 **mit Samplezahl**, LongTasks, Anzahl Framepausen über 100 ms und längste Pause.
3. Terrain-/Scenery-Chunk-Neuerzeugungen, World-Tile-Queue-Pending/Completed/Failed/Retry-Exhausted, sichtbare Kacheln, Abdeckung, `exact`/provisional/missing, LOD-Status.
4. Bildpool-Loads/Evictions/Bytes/Budget, Atlas-Seitenloads und -Hits, geschätzte World-Tile-/GPU-Bytes, CDP-JS-Heap. **Kein** behaupteter physischer RAM/VRAM aus Schätzwerten.
5. PNG-Vergleich bei festen Biomen, Schatten, Ufern, Fog, Nahtstellen, 4×-Schärfe; richtige Kamera/Tile-Koordinaten dokumentieren.

**Fairness:** Gleiches Bildmaterial und gleiche tatsächliche Auflösung; bei Atlas AN können native Seiten schärfer sein als die reduzierte ImagePool-Vorschau – die Qualität daher separat prüfen. Messungen sind **keine** GPU-/Decoder-Zeit, wenn die zugänglichen APIs dies nicht liefern. Verschachtelte Profilzeiten niemals addieren.

## 2. Schrittfolge (nur in dieser Reihenfolge abarbeiten)

### Schritt 15 – Kachel- und Kamerazustände beweisbar machen

> **Implementierung:** [Schritt-15-Kachel- und Kameradiagnostik](STEP15_TILE_CAMERA_DIAGNOSTICS.md) ist als Messinstrument eingebaut; echte Windows-Abnahme und Befundauswertung stehen aus. Die Phase bleibt bis dahin offen.

**Ziel:** Bevor Code weiter optimiert wird, präzise erklären, *warum* beim 4×-Schwenken Terrain-Bakes stattfinden und weshalb Kamera-/Biome-/Fog-Bilder teils nicht zum Szenenmodell passen.

**Arbeitsumfang:**
- `app.js`/`bakeWorldTile`/`drawGround`/`drawRoads`/`fastRender` und `world-tile-streamer.js` instrumentieren: Anlass, Tile-ID, Weltkoordinaten, LOD, Revision, Cache-Hit/Miss, Snapshot-Hit/Miss, Start/Ende und Kosten, ohne aufwendiges Logging im Normalbetrieb.
- Tile-Invalidierungen klassifizieren: **Szenenänderung**, **Qualitäts-/LOD-Wechsel**, **Kamerabewegung**, **Bildnachladung**. Kameraänderung allein darf keine semantische Terrain-Revision auslösen.
- Screenshot-/Lade-Gates für `(-4,5)` und die Fog-Testposition auf korrekte Kamera- und Quell-Tile-Zuordnung prüfen; mögliche Anzeigeabweichung **reproduzieren, nicht unbelegt beheben**.
- Kleine deterministische Regressionstests für `same scene + pan` / `same LOD + zoom` / `changed terrain` und sichtbare Kachel-Revisionen ergänzen.

**Abnahme:** Für Warm-4× ist im JSON erkennbar, welche exakt benannten Tile-Aufträge die langen Aufgaben auslösen und warum Wiederverwendung scheitert. Mindestens ein klar belegter Hotspot mit reproduzierbaren Vorher-Messwerten; keine Renderingänderung nötig, sofern Instrumentierung genügt.

### Schritt 16 – Redundanten Terrain-/Straßenaufbau im World-Tile-Bake eliminieren

**Ziel:** Fertige und aktuelle Terrain-/Straßen-Chunks bzw. Snapshots direkt in Weltkacheln übernehmen, statt für jedes Tile wieder großflächig `drawGround()` und `drawRoads()` auszuführen.

**Arbeitsumfang:**
- Bestehenden schnellen `snapshotTile()`-Pfad und Bedingungen in `bakeWorldTile()` nachvollziehen. Hit-Miss-Gründe (Auflösung, Snapshotgrenzen, veraltete Revision, unvollständiges Terrain) aus Schritt 15 gezielt korrigieren.
- **Nur** vollständig fertige, zur Scene-Revision und zum LOD passende Chunks zusammensetzen; keine vorläufigen Grasflächen als `complete` speichern. Tile-Padding/Gutter und Overlay-Owner-Anker beibehalten.
- Separate Revisionen für **Ground**, **Scenery/Schatten** und **dynamische Einheiten**. Geländeänderungen dürfen betroffene Tiles invalidieren, aber ein nachgeladenes Baum-PNG darf nicht ohne Grund alle Ground-Tiles neu zeichnen.
- Bestehende `drawGround`-Fallbacks vorerst beibehalten, aber als teuer sichtbar machen. Keine globale Komplett-Deaktivierung von Invalidierung.

**Abnahme:** In einem **vorgewärmten, vollständig geladenen** Kameraablauf (gleiche Scene/LOD/Revision) **0 erneute `drawGround`-/`drawRoads`-Aufrufe durch World-Tile-Fallbacks**. Gezielte Terrain-Edits regenerieren ausschließlich abhängige Tiles. Keine Lücken/Wasser- oder Bergschattenregression. Realer Windows-Vorher-/Nachher-Vergleich dokumentiert.

### Schritt 17 – Interaktive Kamera vom Kachel-Backen entkoppeln

**Ziel:** Pan und Zoom müssen auf bereits fertigen Bildquellen reagieren können, auch wenn im Hintergrund weitere Tiles vorbereitet werden.

**Arbeitsumfang:**
- Eingaben verändern Kameratransformation und sichtbare Tileauswahl; in der Eingabebehandlung **keine** synchronen Terrain-/Straßen-/Schatten-Neuaufbauten.
- Teure fehlende Tiles priorisiert und abbrechbar außerhalb des unmittelbaren Input-Frames vorbereiten. Falls Main-Thread-Staging unvermeidlich ist: messbare Zeitscheiben und Yielding, ohne unfertige Tiles als fertig zu deklarieren.
- Bereits fertige LOD-Tiles beim Zoom bis zur höheren Auflösung anzeigen; inkompatible/sichtbar veraltete Inhalte nicht als exakte Ergebnisse melden.
- Queue-Priorität und Cachebudget anhand von Kameraabstand/aktuellem LOD und realem Verbrauch festlegen; keine wiederholte Eviktion/Neuanforderung während derselben Bewegung.

**Abnahme:** Warm-Pan/Zoom hat **0 synchrone Terrain-/Scenery-Bakes im Inputpfad**. Ein Wechsel in eine **kalte** Region darf asynchron laden, blockiert aber die Eingabeverarbeitung nicht sekundenlang. Die Bildabnahme unterscheidet `complete`, `provisional`, `missing`; CPU- und rAF-Werte vor/nach dokumentiert.

### Schritt 18 – Zoom-/LOD-Vertrag und visuelle Korrektheit stabilisieren

**Ziel:** Render-DPR, World-LOD und Quellassetauflösung voneinander trennen; Kacheln bei Zoombereichen nicht permanent neu erstellen.

**Arbeitsumfang:**
- Auflösung/DPR des sichtbaren Bildschirm-Canvas ist **kein** Grund, identisches semantisches Terrain nach jeder minimalen Zoomänderung neu zu zeichnen. LOD-Stufen/Hysterese, Tile-IDs und Qualitätswechsel prüfen.
- Fehler bei `open-water (-4,5)`, Fog-Preview und Wolkenfront anhand der Schritt-15-Diagnose **gezielt** beheben; Weltgrenze nicht mit unbekanntem Fog verwechseln.
- Sichtbare Vegetation, Schattenüberhänge, Shoreline-Raster und Objekt-Tiefensortierung in `auto`, `1×`, `4×` validieren. Mehr Auflösung darf die Welt nicht semantisch ändern.

**Abnahme:** Beim Zoom innerhalb derselben LOD-Stufe keine vermeidbare Voll-Neuerzeugung; Wechsel der Stufe maximal für tatsächlich betroffene Tiles. Referenzbilder zeigen korrektes Terrain bei Meer, Küste, Wald, Moor und Berg. Fog-ON/OFF zeigt eine **begründbare**, reproduzierbare Änderung, keine ungewollten Vollwolken.

### Schritt 19 – Canvas-2D gegen WebGL2 **nur für fertige Kachelkomposition** testen

**Voraussetzung:** Schritte 15–18 sind auf Zielhardware abgenommen; sonst **nicht** den GPU-Renderer als Lösungsersatz bauen.

**Arbeitsumfang:**
- Gleiche vorbereitete, unveränderliche Tile-Bitmaps; ein Pfad Canvas 2D, ein Pfad WebGL2. Die Bildquellen-/Bake-Pipeline bleibt **identisch**.
- Vorhandene `gpu-terrain.js`/`gpu-sprite-layer.js` prüfen und nur um den tatsächlich benötigten Kompositor ergänzen; kein neues Framework/3D-System ohne separate Begründung.
- GPU-Uploadzahl, Textur-Cache-Hits, rAF-Intervalle, Main-Thread-Kosten, Kachelspeicher und Context-Loss-Fallback messen. Unnötige Neuuploads im Kamerapfad sichtbar machen.

**Entscheidungstor:** WebGL2 nur als Standard wählen, wenn auf der 397-Hex-Szene wiederholt ein **klarer, reproduzierbarer Vorteil** gegenüber Canvas 2D bei *identischen fertigen Tiles* entsteht und visuelle/Memory-Regressionen ausbleiben. Richtwert: mindestens **20 % niedrigere p95-Framezeit bei warmen Bewegungen** über mehrere gültige Wiederholungen; falls beide bereits stabil im Zielbudget sind, zusätzliche Komplexität ausdrücklich gegen kleinen Vorteil abwägen. Sonst bei Canvas 2D bleiben und GPU-Experiment nicht als „abgeschlossen erfolgreich“ deklarieren.

### Schritt 20 – Stabilität, Regression und finale Rendering-Abnahme

- Vollständige 397-Hex-Szenenabnahme in allen relevanten Biomen/Fog-Zuständen, mit den bestehenden Step-13-Regionalscreenshots.
- Warm/Kalt und kleine/große Karten, mehrere Wiederholungen, Browserkontextverlust, Cache-Invalidierung nach Edits, Exportgleichheit, Speicherverlauf prüfen.
- Render-Dokumentation, Qualitätsprofile und nachweislich unnötige Test-/Fallbackpfade **erst nach gesicherter Ablösung** vereinfachen; Atlas ggf. entfernen, wenn nach wiederholten gültigen A/B-Läufen weiterhin kein Nutzen besteht.
- Kein Abschluss, solange wichtige Kacheln fehlen, Camera/Fog/Biome falsch erscheinen, die Eingaben wiederholt sekundenlang blockiert sind oder die Testfälle als ungültig markiert werden.

## 3. Vorläufige Performance-Ziele (keine bereits erreichten Resultate)

| Kriterium | Ziel | Messbedingung |
|---|---|---|
| Warm-Pan | 0 synchrone Ground-/Scenery-Bakes; p95 idealerweise <= 25–33 ms | Volle Tilebereitschaft, konstantes LOD |
| Warm-Zoom | Bild sofort aus fertigen Tiles; keine sekundenlangen Input-Blockaden | Mit und ohne LOD-Grenzübertritt getrennt messen |
| Cold-Pan/Cold-Zoom | Sichtbare Interaktion bleibt ansprechbar; Fortschritt/Fallback klar markiert | Unvollständige Tiles nicht als READY ausgeben |
| Hauptthread | Keine wiederholten >100-ms-LongTasks durch Weltkachel-Erzeugung | Auf der Zielhardware, 3+ Wiederholungen |
| Speicher | Kein ungebremstes Wachstum oder Eviktion-/Nachlade-Sturm | Bildpool, World-Tiles, GPU-Texturen getrennt |
| Grafik | Alle sechs Regionen + Fog korrekt; keine fehlenden Nature-/Schatten-/Wasserinhalte | Visuell plus deterministische Szenenkoordinaten |

Bei neuen technischen Beweisen dürfen Zielwerte nach begründeter Dokumentation angepasst werden. Es gibt **keine** automatische Abnahme allein anhand von syntaktisch gültigem JavaScript oder Mock-Tests.

## 4. Regeln für zukünftige Codeänderungen und Übergaben

1. **Beginn jeder Arbeit:** `docs/rendering/RENDERING_ROADMAP_AFTER_STEP14.md`, `docs/rendering/STATUS.md` und die letzte echte `result.json`/Screenshot-ZIP lesen. Erst offene Phase identifizieren; keine Ergebnisse oder Dateien erfinden.
2. **Ein PR pro Ursache:** Erst Hypothese und erwartete konkrete Zähleränderung notieren, dann nur den eng betroffenen Renderpfad ändern. Keine gleichzeitige Veränderung von Atlas, Terrain-LOD, GPU, Schatten und Speicherbudget.
3. **Vorher-/Nachher:** Gleiche JSON-Szene, gleicher Browser/PC, gleiche Gesten, gleiche Qualität. Native Unit-/Integrations-Tests, dann echter lokaler Chromium-Test. Ohne Hardwaremessung Status **„Implementiert – grafische/Performance-Abnahme offen“**.
4. **Risikovermeidung:** Server-Fog-Berechtigungen, Objekt-/Schatten-Overhang, Weltgrenzen, ImagePool-Lebensdauer, LOD-Provisional-Markierungen und PNG-Export nicht für einen scheinbaren FPS-Gewinn beschädigen.
5. **Abnahmebericht:** Jede Phase in `STATUS.md` mit PR/Commit, Zahlen vorher/nachher, Vergleichsgültigkeit, Nebenwirkungen, ungeklärten Fragen, Reproduktionsbefehl und *nächster offener Phase* ergänzen.
6. **Wenn ein Schritt scheitert:** Nachweise sichern, Änderung zurücknehmen oder eingrenzen, gleiche Phase offen lassen und keine nächste „Optimierung auf Verdacht“ beginnen.

## 5. Aktueller Aufgabenstand

- [x] Schritt 13: erste echte Rendering-Messungen und Diagnosebilder (keine komplette Performanceabnahme).
- [x] Schritt 14: Atlas A/B und Zoom-Kostenprofil implementiert und einmal real ausgeführt (A/B nicht durchgehend gültig).
- [ ] **Schritt 15 (NÄCHSTER SCHRITT):** Tile-Miss-/Invalidierungsursachen und Kamerakorrektheit instrumentieren und reproduzieren.
- [ ] Schritt 16: Ground-/Straßen-Reuse im Tile-Bake belegen und implementieren.
- [ ] Schritt 17: Eingabepfad von Kachelbakes entkoppeln.
- [ ] Schritt 18: LOD und biome-/fog-visuelle Korrektheit stabilisieren.
- [ ] Schritt 19: isolierter Canvas-2D-/WebGL2-Kompositionsvergleich.
- [ ] Schritt 20: abschließende Rendering-Abnahme und Aufräumarbeiten.
