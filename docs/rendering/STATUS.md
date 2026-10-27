# Rendering-Status

**Stand:** 2026-10-27
**Repository:** markusjungblut/asset_labor, Branch main
**Bestandsaufnahme:** Schritt 1 (v0.23) – **statische Prüfung abgeschlossen; Live-Messung ausstehend**.
**Implementierungsstatus:** Kein Renderer-Code verändert. v0.22.6 bleibt Ausgangsstand.
**Vorheriger HEAD:** `ee769a37f3ca2adfd4d5b2db8dcf8765787ce479` (Release v0.22.6, 2026-10-27T11:06:02Z).
**Gesicherter Ausgangsstand:** Branch `backup/v0.23-step1-before-docs-20261027` zeigt unverändert auf den vorherigen HEAD.
**Dokumentations-Commit:** aktueller main-Commit (Git-Log prüfen; Hash kann nicht sinnvoll in demselben Commit selbst referenziert werden).

## Geprüft
- Tatsächliches Projekt `asset_labor` identifiziert; `browsergame` ist nicht der Source-Stand dieser Sprite-/Tile-Vorschau.
- v0.22.6 in `README.md` und `index.html` bestätigt. Historische Kopfkommentare einzelner Module tragen ältere Teilversionsnummern.
- Relevante Module und konkrete Haupt-/Fastpfade statisch untersucht; Details in `ARCHITECTURE.md`.
- Ursache reduzierter Interaktivqualität bestätigt: 1,5×-DPR-Kappung bei mehr als 500 Naturinstanzen, zusätzlich 1024/512-Pixel-Vorschaugrenzen im Bildpool.
- Bestehender Worker/OffscreenCanvas, Tile-Renderer, Static-Scene-Cache, GPU-Optionen, LOD und Tests gefunden.
- Baseline-Zahlen unverändert aus Benutzermessung in `BASELINE.md` übertragen.
- CI-Abdeckung geprüft: GitHub Actions baut Sprite-Atlanten; keine Renderer-FPS-/Browser-Regressions-CI nachgewiesen.

## Nicht geprüft
- Kein Live-Browser geöffnet und keine frischen Framezeiten gemessen.
- Node-/Python-Tests in dieser Connector-Sitzung nicht lokal ausgeführt. Die 79/79 sind die bereits im v0.22.6-README dokumentierten historischen Resultate.
- Kein lokaler Git-Arbeitsbaum einsehbar; GitHub-main und Backup-Branch sind verifiziert.
- Ungeklärte „67 Terrain ausstehend“ sind kein bereits gefundener Einzeldefekt; dafür Schritt 2 instrumentieren.

## Nächster Schritt (genau einer)
**Schritt 2 – Sichtbare Terrain-/World-Tile-Aufträge und deren Status lückenlos nachvollziehbar machen.**
Zuerst `chunks.js` Queue/Flight/Epoch/Fehler/Version sowie `world-tile-streamer.js`-Source-Ergebnisse (`null`, Fehler, Abort) messen; `app.js`-Ready-/Painted-Gates zuordnen. Keine Reparatur vor Diagnose, keine LOD-/Qualitäts- oder GPU-Änderungen.

## Sicherheitsregeln
- Originalgrafiken, Asset-Kataloge, Szenen und Weltstände bleiben unverändert.
- Eine abgeschlossene Dokumentationsaufgabe bedeutet nicht, dass das Performanceproblem gelöst ist.
- Ein einzelner Schritt je Folge-Commit; Testergebnisse und manuelle Prüfungen klar trennen.
