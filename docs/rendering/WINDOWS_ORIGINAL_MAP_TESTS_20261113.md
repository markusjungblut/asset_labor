# Windows-Tests: gespeicherte Originalkarte (13.11.2026)

**Status: Ein-Klick-Gesamtsuite ergaenzt; bisherige Warm-Pans liefen auf Windows, neue Zoom-/Regions-Matrix steht zur Ausfuehrung bereit.** Zugeordnet zu [Issue #137](https://github.com/markusjungblut/asset_labor/issues/137). Alle Tests laufen mit der echten lokal gespeicherten Frozen Map. Keine Änderungen an Original-ZIP, IndexedDB, Fog-Quelle, Asset-Labor-Editor oder main. Keine automatischen Merges/Resets.

## Empfohlen: Vollstaendiger Vergleich mit **einem** Startknopf

Die zwei isolierten Test-Worktrees sind bereits erzeugt; **Prepare nicht wiederholen**. Der neue localhost-Server liefert beide Renderer-Versionen unter derselben Origin und verschiedenen URL-Pfaden. Firefox sieht deshalb dieselbe lokale IndexedDB-Karte; alle 51 Fahrten koennen mit **einem einzigen Klick** laufen.

1. Laufenden Server auf Port 8780 mit Strg+C beenden.
2. Einmal den Testwerkzeuge-Zweig aktualisieren und den Kombiserver starten:

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git switch --detach origin/test/windows-original-map-renderer-20261113
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action All -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Falls der **Werkzeug-Worktree** vor dem Wechsel lokale Aenderungen anzeigt, erst pruefen statt diese zu verwerfen; niemals Reset, Clean oder Stash am Original. Die bestehenden Baseline-/Kandidaten-Worktrees werden von -Action All nicht geaendert.

3. Im **gleichen Firefox-Profil wie bisher** http://127.0.0.1:8780/renderer-original-map.html oeffnen und **"Alle Tests automatisch (1 Klick)"** druecken. Der Tab muss im Vordergrund bleiben.

Die Suite laedt die Viewer als /baseline/frozen-map-game.html bzw. /candidate/frozen-map-game.html **ohne Aenderung von Hostname oder Port**. Drei Referenzrouten unter main, danach 48 Kandidatenlaeufe (vier Flags mal drei Szenarien mal A/B/B/A), automatische Fortschrittsanzeige, Abbruchmoeglichkeit und **ein gemeinsames JSON**. Keine Quelldaten werden hochgeladen. Eine Browser-Download-Berechtigung kann das automatische Speichern verhindern; dann die Schaltflaeche "Gesamtbericht erneut speichern" verwenden.

Die bisherigen Aktionen -Action Baseline und -Action Candidate und ihre Einzeltests bleiben optional fuer Nachmessungen. -Action All prueft nur statische GET/HEAD-Dateien, hat keinerlei Editor-POST-Endpunkte und erstellt keine Karten oder Repositories.

---

## Vorbereitung ohne Eingriff in lokale Änderungen

PowerShell im bisherigen Repo (Pfad ggf. ändern):

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short -uall
git fetch --no-tags origin
git worktree add --detach ..\asset_labor_renderer_tools origin/test/windows-original-map-renderer-20261113
cd ..\asset_labor_renderer_tools
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Prepare -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Das erstellt zwei weitere, **isolierte** Worktrees neben dem Original: baseline aus origin/main und candidate aus origin/perf/step25z-real-ram-eviction-20261112 (Draft #136, enthält #128–#135). Die vorhandenen Originaldateien einschließlich lokaler uncommitteter Änderungen bleiben unangetastet. Die Vorbereitung dokumentiert Git-Status und Diffs. **Untracked-Dateien werden nur aufgelistet, nicht gesichert.** Existierende Testverzeichnisse werden nicht überschrieben.

## Ein-Klick-Gesamttest (aktualisierte PR #139)

**Keine erneute Vorbereitung erforderlich.** Die beiden isolierten Test-Worktrees aus "Prepare" bleiben erhalten. Bei "Baseline" bzw. "Candidate" kopiert das PowerShell-Startskript die aktualisierte Testoberflaeche und die neue Suite in das jeweilige Testverzeichnis.

### Testwerkzeug aktualisieren

Alle ggf. laufenden Server auf Port 8780 zuerst mit Strg+C beenden:

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git switch --detach origin/test/windows-original-map-renderer-20261113
~~~

Falls git status lokale Aenderungen **im Werkzeug-Worktree** meldet, vorher pruefen. Kein Reset, Stash oder Clean. Der Befehl veraendert nicht das Originalrepository.

### 1. Baseline (ein Klick)

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Baseline -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Im **bisherigen Firefox-Profil** die URL http://127.0.0.1:8780/renderer-original-map.html aufrufen und **"Alle Tests automatisch (1 Klick)"** druecken. Die Suite erkennt "main" automatisch. Drei Routen werden nacheinander gefahren: warme Fahrt mit Rueckfahrt, wiederholte 1x/2x-Zoomwechsel (0,44 zu 0,96, inklusive Rueckkehr), mehrere neue Regionen mit Rueckfahrt. Das Ergebnis wird als **eine JSON-Datei** lokal heruntergeladen.

### 2. Kandidat (ein Klick)

Baseline-Server mit Strg+C beenden. In demselben Werkzeuge-Ordner:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Candidate -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Gleiche Firefox-URL, gleiches Profil, erneut **"Alle Tests automatisch (1 Klick)"** druecken. Die Suite erkennt den Kandidaten und prueft alle **vier Schalter** (lodRecency, leadPrefetch, visibleBorrow, parallelDecode) mit **allen drei Fahrten** und jeweils A/B/B/A (0/1/1/0): **48 Laeufe**, genau ein gemeinsamer JSON-Export.

### Testdesign und Datenintegritaet

- Neue Regionen: kein starrer Versatz; der Runner liest per **readonly IndexedDB-Transaktion ausschliesslich Kachelschluessel** und waehlt vorhandene, weit entfernte Near-Kachelkoordinaten. Keine Kachelinhalte werden fuer die Routenplanung ausgelesen oder hochgeladen.
- Camera-Pan und Zoom per originaler Diagnose-API, rAF-gesteuert statt vorgegebener 40-ms-Pause. Gemessen: FrameGap-p95, Draw-p95, rAF-Tick-p95, LOD-Varianten, neue Reads, Cache-Evictions, Dekodierungen und sichtbare Bildbereitschaft.
- Bleibt eine LOD-Variante aus oder werden in der Regionsfahrt keine neuen Kacheln gelesen, markiert der Bericht die eingeschraenkte Aussagekraft. Der Runner bricht bei fehlender Startkarte ab. Einzelne fehlgeschlagene Laeufe werden als Fehler festgehalten, nicht still ignoriert.
- Den Firefox-Tab im Vordergrund behalten; bei inaktivem Tab wird die laufende Messung beendet. Ein Stopp-Knopf ermoeglicht Teilergebnis-Export.
- **Kein** Cache-Clear, keine Original-Atlas- oder Fog-Mutationen, kein Neu-Baking, keine privaten Bilddaten im Repo, kein automatischer Merge. Der Viewer kann persistente **abgeleitete** 1x/2x-Bilder wie bisher ergaenzen; ABBA ist somit nicht vollstaendig "cold-cache-identisch".
- FrameGap und rAF-Gaps sind **keine GPU-Present-FPS**. Test-Pose-Aenderungen werden in der vorhandenen Diagnose-API formal als "pan" gemeldet, obwohl die Zoomroute zwischen den LODs umschaltet. Visuelle Kontrolle und mehrminuetiger RAM-Test bleiben fuer die Abnahme notwendig.

---

## Baseline (alte Einzeltests, optional)

Alle bisherigen Server auf Port **8780** stoppen. Aus dem Werkzeuge-Worktree:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Baseline
~~~

Im **bisherigen Firefox-Profil**, in dem die Karte als IndexedDB gespeichert ist, aufrufen:

http://127.0.0.1:8780/renderer-original-map.html

Kartenkennung prüfen (v1-0374527a nur Default). Dashboard: **Baseline / Standard**, Warm-Pan starten, JSON speichern; dann ggf. Zoomwechsel und neue Region. Falls Karte fehlt: **nicht neu backen und Browserdaten nicht löschen**. Hostname und Port müssen exakt zur bisherigen Origin passen, ebenso das Firefox-Profil.

## Kandidat (A/B/B/A; alte Einzeltests, optional)

Baseline-Server mit Strg+C beenden, dann:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Candidate
~~~

Selbe URL, gleiches Firefox-Profil und Fenster. Modus **Kandidat A/B/B/A**; einzeln vergleichen:

1. **25T** lodRecency=0/1: Zoomwechsel (Priorität 1) und warmer Pan
2. **25S** leadPrefetch=0/1: neue Region + Rückfahrt
3. **25U** visibleBorrow=0/1: neue Region + Rückfahrt
4. **25X** parallelDecode=0/1: explorativ, Standard bleibt aus

A=0 und B=1; **nur ein Parameter pro Test**. Jede Fahrt startet den iframe-Viewer neu, Warm-Pan und Zoomstrecke werden vorgewärmt. Eine kalte Region kann durch die ersten Läufe persistente 1×/2×-Cacheeinträge erzeugen und dadurch spätere Läufe beeinflussen. Dies getrennt interpretieren.

Node-Tests optional:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Node
~~~

## Abnahmegrenzen

JSON enthält rohe Profilerwerte, FrameGap-p95, Draw-p95, Read-Starts, Decode-Wiederholungen, Evictions und Sichtbarkeits-/Fehlerdaten. Warmer FrameGap-p95 ≤33,3 ms ist erster Richtwert, langfristig 16,7 ms; **keine GPU-Present-FPS-Garantie**. Bei >10 % reproduzierbarem p95-Rückschritt, Grafikfehlern oder Fog-Leaks keine Integration. Falls sampleLimit.droppedFrames/droppedTiles >0, das Messintervall nicht für belastbare Perzentile verwenden.

Der Runner nutzt die testPan-Diagnoseschnittstelle auch für Zoom-Pose-Änderungen: byGesture kann diese Eingaben als pan bezeichnen, die separat ausgewiesenen Zoomfahrten und Gesamt-FrameGaps bleiben vergleichbar.

Zusätzlich **manuell** Screenshots bei identischer Kamera/Zoom für (1) Wald/Schatten/Scenery-Überhang, (2) Wasser-/Küstennaht (Issue #90), (3) Fog/Cloud-Fade und (4) 1×/2×-Wechsel aufnehmen. Fünf Minuten mit Pan/Zoom und anschließender Ruhephase auf Speicher-/GPU-/Read-Probleme prüfen. Für GPU-Present Firefox-Performance-Trace ergänzen.

Produktivfreigabe **noch offen**. [Integrationsplan](https://github.com/markusjungblut/asset_labor/blob/perf/step25z-real-ram-eviction-20261112/docs/rendering/FROZEN_VIEWER_INTEGRATION_AND_WINDOWS_ACCEPTANCE_20261112.md) und [Windows-Messbogen](https://github.com/markusjungblut/asset_labor/blob/perf/step25z-real-ram-eviction-20261112/docs/rendering/FROZEN_VIEWER_WINDOWS_RESULTS_TEMPLATE_20261112.md). Private Original-PNGs, ZIPs und Screenshots nicht ungefragt öffentlich hochladen.