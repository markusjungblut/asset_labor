# Windows-Tests: gespeicherte Originalkarte (13.11.2026)

**Status: vorbereitet, nicht auf Windows getestet.** Zugeordnet zu [Issue #137](https://github.com/markusjungblut/asset_labor/issues/137). Alle Tests laufen mit der echten lokal gespeicherten Frozen Map. Keine Änderungen an Original-ZIP, IndexedDB, Fog-Quelle, Asset-Labor-Editor oder main. Keine automatischen Merges/Resets.

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

## Baseline

Alle bisherigen Server auf Port **8780** stoppen. Aus dem Werkzeuge-Worktree:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Baseline
~~~

Im **bisherigen Firefox-Profil**, in dem die Karte als IndexedDB gespeichert ist, aufrufen:

http://127.0.0.1:8780/renderer-original-map.html

Kartenkennung prüfen (v1-0374527a nur Default). Dashboard: **Baseline / Standard**, Warm-Pan starten, JSON speichern; dann ggf. Zoomwechsel und neue Region. Falls Karte fehlt: **nicht neu backen und Browserdaten nicht löschen**. Hostname und Port müssen exakt zur bisherigen Origin passen, ebenso das Firefox-Profil.

## Kandidat (A/B/B/A)

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