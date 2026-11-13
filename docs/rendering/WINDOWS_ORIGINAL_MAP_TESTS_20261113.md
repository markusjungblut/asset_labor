# Windows-Tests: gespeicherte Originalkarte (13.11.2026)

**Status: Praezisions-Suite v3 in PR #139 implementiert, auf der Originalkarte noch nicht ausgefuehrt.** Die 51 Laeufe der alten v2-Suite waren funktional erfolgreich, zeigten aber starke Zeitdrift. Der iframe lag damals unter einer wachsenden Ergebnistabelle und konnte ausserhalb des sichtbaren Bereichs geraten. Die neue Suite behebt diese Stoerquellen; gehoert zu Issue #137.

## Empfohlen: Praezisions-Suite v3 mit einem Startknopf

Die beiden isolierten Test-Worktrees und der Werkzeug-Worktree existieren bereits. **Prepare nicht wiederholen.** Laufenden Server auf Port 8780 mit Strg+C stoppen, dann:

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git switch --detach origin/test/windows-original-map-renderer-20261113
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action All -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Falls der Werkzeug-Worktree lokale Aenderungen anzeigt, vorher pruefen und nicht verwerfen. Niemals Reset, Clean, Stash oder Merge am Originalrepository ausfuehren.

Im **bisherigen Firefox-Profil**, in dem die Karte bereits gespeichert ist, http://127.0.0.1:8780/renderer-original-map.html oeffnen und auf **"Alle Tests automatisch (1 Klick)"** klicken. Tab im Vordergrund lassen. Der Bericht wird als ein lokales JSON gespeichert. Wenn der automatische Download blockiert ist, die Schaltflaeche **"Gesamtbericht erneut speichern"** verwenden.

### Testplan: 124 Fahrten nach gemeinsamer Vorwaermung

- **6 Baseline-Fahrten** auf main: Warm-Pan, Zoomwechsel und Regionsfahrt am Anfang und Ende zur Laufzeit-Driftkontrolle.
- **104 isolierte Kandidaten-Fahrten**: vier Optimierungen (lodRecency, leadPrefetch, visibleBorrow, parallelDecode) auf je drei Routen plus eine zusaetzliche schnelle Regionswechselstrecke fuer visibleBorrow. Je Gruppe **A/B/B/A und B/A/A/B**, also vier A- und vier B-Messungen. Alle drei anderen untersuchten Optimierungen sind bei jedem isolierten A/B-Test explizit ausgeschaltet.
- **11 Kandidaten-Kontrollfahrten** auf denselben Strecken mit allen vier Features ausgeschaltet, ueber die Testserie verteilt zur Erkennung von Browser-/GPU-Zeitdrift.
- **3 Produktionskonfigurations-Fahrten** am Schluss mit den normalen Kandidaten-Standardschaltern (parallelDecode bleibt standardmaessig deaktiviert).

Der Viewer steht neu oberhalb einer festen, scrollbaren Ergebnistabelle; er wird vor einer Fahrt sichtbar positioniert. Bei unzureichender Sichtbarkeit, inaktivem Tab, Ladefehlern und zu wenigen Frames wird die Messung abgelehnt oder als ungueltig markiert. Kein ausdruecklicher Aufruf einer Garbage Collection und kein erzwungenes Leeren von Caches.

**Messdaten:** Renderer-Draw-p95, rAF-Tick-p50/p95/p99, FrameGap, Weltbild-Kopiervorgaenge, 1x/2x-Varianten und Wechsel, sichtbare und vorgezogene Reads, Cache-Evictions, Decode-Wiederholungen, Start-RAM-Cachezustand sowie beobachtete Anzahl und Dauer unvollstaendiger sichtbarer Kacheln. Sichtbare Luecken werden stichprobenbasiert erfasst, nicht lueckenlos auf GPU-/Monitor-Ebene.

### Qualitaetsgates im JSON

Der v3-Export enthaelt den Bereich statistics.comparisons. Jede Feature/Route-Gruppe hat acht A/B-Laeufe und wird als NICHT BELASTBAR gekennzeichnet, falls:

- Der Wirkmechanismus bei eingeschaltetem Feature nicht tatsaechlich ausgeloest wurde: lodRecencyEvictions, prefetchLeadingStarts, visibleBorrowStarts bzw. parallelTileDecodes.
- Ein Lauf nicht mindestens ausreichend viele sichtbare Frames/rAF-Ticks enthaelt, bei Zoom die beiden LODs fehlen oder bei der Regionsfahrt keine neuen sichtbaren Reads entstehen.
- Waerend der Messung persistente abgeleitete 1x/2x-Caches neu erzeugt werden, die A/B-RAM-Anfangszustaende stark abweichen, Profilmessungen ueberlaufen oder Kontrollfahrten deutlich driften.
- Die symmetrischen A/B-Crossover-Bloecke widerspruechliche, nicht vernachlaessigbare Effekte zeigen.

Unterschiede von wenigen Millisekunden werden nicht als klare Regressions-/Gewinnbeweise dargestellt. Die Berichtsauswertung bleibt konservativ. **Keine automatische GO-/Mergefreigabe.**

### Zweite unabhaengigere Sitzung

Die Reihenfolge ist im Dropdown **"Testreihenfolge"** waehlbar: beim ersten Durchlauf **Standard**. Dann das Gesamt-JSON speichern, **Firefox vollstaendig schliessen und neu starten**, denselben Kombiserver weiterlaufen lassen und **"Umgekehrt (2. Sitzung)"** auswaehlen. Wieder mit nur einem Klick laufen lassen. Beide JSONs zusammen auswerten. Keine Browser- oder IndexedDB-Daten loeschen.

### Grenzen und Sicherheit

Die lokale Original-IndexedDB, Frozen-PNG, ZIP, Manifest, Fog-Rechte und das Originalrepository werden nicht geloescht oder ueberschrieben. Der Frozen-Viewer kann wie zuvor **separate abgeleitete 1x-/2x-Cachebilder** persistieren. Die Messung ist ein kontrollierter **RAM-cold / persistenter-Cache-warm**-Vergleich, kein garantiertes Disk-Cold-Experiment. TestPose-Aenderungen nutzen die Diagnose-API testPan und werden im Profiler als pan bezeichnet, auch wenn die Zoomroute effektiv zwischen LODs wechselt. rAF- und Drawzeiten sind **keine GPU-Present-FPS**, physische Eingabelatenz oder messbarer Monitor-Refresh; GPU-Speicher und Langzeit-Firefox-Heap brauchen gesonderte Werkzeuge. Visuelle Kontrollen auf Fog, Wassernaehte und Scenery-Fehler bleiben manuell.

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


## Historische Einzeltests (v2, nicht fuer die neue Praezisionsauswertung)

Die folgenden Befehle fuer separat gestartete Baseline-/Kandidatenserver bleiben fuer gezielte, unqualifizierte Einzeltests verfuegbar. **Fuer die 124-Laeufe-Gesamtsuite ausschliesslich -Action All wie oben verwenden.**

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