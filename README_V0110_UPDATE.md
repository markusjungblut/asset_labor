# Vedras Reiche · Asset-Labor v0.11.0 – Katalog & Workspace

## Ziel
Strukturelle Neuorganisation ohne Verlust vorhandener Sprite-, Terrain- oder Nature-Daten. Die Programmdateien bleiben kompatibel zu v0.10.9; das kleine Update enthält keine `assets/`-Dateien.

## Neue Funktionen

- **37 Hexfelder (Radius 3)**: In „Testszene“ auswählbar, auch regionaler Gelände-Test. 7 und 19 bleiben nutzbar. Bei 37 Feldern wird der CPU-Terrainbuffer auf rund 1,1 Mio. Ausgabepixel begrenzt, damit der lokale Test bedienbar bleibt.
- **Aufklappbare Arbeitsbereiche**: Nature-Verteilung, Berge, Terrain-Tests, Relief, Ufer, Ansicht & Schärfe und Testszene. Der lange Nature-Editor ist ebenfalls in drei aufklappbare Gruppen unterteilt. Schnelle Aktionen „Natur verteilen“, „Bergketten“, „37 Hexe“ oben an der Karte.
- **45 geplante Nature-/Objektarten** in `plans/sprite_catalog_plan.json`. Darin stehen Name, exakter PNG-Dateiname, Objektklasse, Familie, Zielhöhe, Größenklasse, plausible Terrainkategorien, Mindestabstand und Dichte. Die Arten sind Pläne, **keine bereits vorhandenen oder freigegebenen Grafiken**.
- **Automatischer Metadatenvorschlag beim Einlesen**: Nur bei exakter Übereinstimmung mit einem geplanten PNG-Dateinamen; bereits katalogisierte Grafiken werden nicht verändert. Sidecar-JSONs lassen sich auch vor der Grafikerstellung im Planungskatalog herunterladen.
- **Automatische Größenprofile**: `sizeMode=class` berechnet die tatsächliche Sprite-Breite aus Zielhöhe und Alphabeschnitt/Seitenverhältnis. Alte Dateien bleiben mit `sizeMode=manual` unverändert. Die Option „Bestehende Größenklassen übernehmen“ gilt ausschließlich nach Bestätigung und mit vorheriger Katalogsicherung.
- **Berg-Nachbarobjekte**: Anker auf benachbarten Hexfeldern bleiben zulässig, aber bei projizierter Überdeckung einer opaken Bergsilhouette wird der Nature-Sprite hinter dem Berg gezeichnet. Das ist keine geometrische 3D-Kollision oder Fußpunktplatzierung auf dem Hang.
- **Berg-Biomregeln auch beim Rendern**: Bereits gesetzte Berge mit nun ungültigem Terrain werden nicht gelöscht, aber nur auf erlaubten Landbiomen gerendert. Vorhandene vom Nutzer ausdrücklich freigegebene Terrainarten werden berücksichtigt.

## Nutzung
1. v0.10.9 beenden und den gesamten `assets/`-Ordner sichern.
2. `Vedras_Asset_Labor_v0.11.0_Update.zip` in den bisherigen Laborordner entpacken und nur die Programmdateien ersetzen.
3. `START_WINDOWS.bat` starten; im Browser v0.11.0 (Standardport 8780) prüfen.
4. Links den „Sprite-Planungskatalog“ aufklappen und gewünschte künftige Grafik ansehen. Bilddatei genau als z. B. `assets/nature/thyme_01.png` speichern; „Neu einlesen“ importiert dazu vorgeschlagene Metadaten – keine Änderung bei bestehendem Eintrag.
5. Vor der einmaligen Umstellung bereits katalogisierter Sprite-Größen den Nature-Katalog exportieren.

## GitHub
Das eigene GitHub-Repository `markusjungblut/asset_labor` dient als Quellcode- und Planungskatalog-Repository; das ergänzende Source-ZIP eignet sich für lokale Backups und Offline-Betrieb. `.gitignore` schließt persönliche Grafiken und echte Kataloge unter `assets/` weiterhin aus.

## Grenzen und QA
Synthetischer Chromium-Test v0.11.0 erfolgreich: 37 Hexe, einklappbare Bereiche, 45 Planposten, automatisch katalogisierte Testbilder `birch_01.png` und `thyme_01.png`, keine JavaScript-Ausnahmen. Alte Node-Tests für 7/19-Berggeometrie, Relieffunktionen und sechs Uferkanten bestanden. Optischer Volltest mit sämtlichen realen Nutzer-PNGs sowie 37-Hex-Performance auf schwächerer Hardware bleiben offen. Die AABB-/Alpha-Verdeckung ist eine optische Schichtregel, keine echte 3D-Okklusion.