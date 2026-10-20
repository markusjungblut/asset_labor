# Bergschatten auf Sprites und Worldgen-Dateiimport (20.10.2026)

## Bergschatten – nicht länger ausschließlich auf Terrain

Das Verfahren berechnet bereits **identische gecachte Bergschattenmasken** auf dem Boden. Neu werden diese pro Frame in Bildschirmkoordinaten als `mountainCastsForFrame` mitgeführt.

Der bestehende, tiefensortierte Spritepass prüft beim Rendern eines Baums, Buschs, Gebäudes, einer Einheit, eines Fremd-Bergsprites oder anderer Objekte, ob deren sichtbare Projektionsfläche einen Bergschatten schneidet. Nur dann wird das Objekt auf eine wiederverwendete Offscreen-Fläche gezeichnet und der originale Bergschatten mit `source-atop` **ausschließlich auf seine sichtbaren Sprite-Pixel** komponiert. Das Ergebnis erscheint an derselben Renderposition und mit der bisherigen Tiefe.

- Die gleiche globale Schattenstärke (0–200 %) und die vorhandenen per-Berg-Parameter gelten für Terrain **und** Sprite.
- Ein Berg beschattet sein **eigenes** Hauptsprite nicht; sich überlagernde Berge können sich gegenseitig beschatten.
- Nicht betroffene Sprites benutzen ohne Offscreen-Aufwand den bisherigen Direktpfad.
- Die Schatten bleiben an Weltkoordinaten verankert und verändern nicht die logische Bebaubarkeit, Projektion, Hexnachbarschaft, Spriteanker, Original-PNGs oder Asset-Metadaten.
- Der Scratch-Canvas wird wiederverwendet und der Rastermaßstab pro Sprite auf einen Maximalbereich begrenzt; ein größerer visueller Performance-Test in echten dichten Waldregionen bleibt empfehlenswert.

**Prüfung:** `node tests/test_mountain_sprite_cast_20261020.cjs`, zusätzlich vorhandene Tests für Schattengeometrie, Schattenreihenfolge und Wald-/Nature-Regeln.

## Geografie-Labor wiederfinden

Der ursprüngliche Toolbar-Button `openGeography` bleibt bestehen. Zusätzlich ist im rechten, klebenden Schnellzugriffsbereich `shortcutGeography` vorhanden. Die Skript- und CSS-URLs besitzen aktualisierte Cache-Versionen. `START_WINDOWS.bat` startet weiterhin den lokalen Python-Server; der Standardport der aktuellen `server.py` ist **8780** (bei Belegung Ausweichport).

## Gespeicherte Geografie importieren

In der Kartenansicht **Geografie-JSON importieren** oder im rechten Schnellzugriff **Geografie-JSON importieren** wählen. Beide Fälle werden unterstützt:

1. **`vedras-worldgen-parameter.json`**: Das Labor rekonstruiert aus gespeichertem Weltseed, Kartengröße und den 60+ Parametern die komplette Welt deterministisch und wählt anschließend den mittleren Testausschnitt.
2. **`vedras-welt-<seed>.json`** beziehungsweise die CLI-Welt-Snapshot-JSON: Die geografische Welt wird absichtlich aus demselben Seed und der Konfiguration neu berechnet; fremde/alte Hexfelder werden nicht ungeprüft direkt in die Karte injiziert.

Es gibt eine **explizite Bestätigung**, bevor die bestehende Asset-Labor-Testszene ersetzt wird. Der Import erzeugt derzeit **einen 7–397-Hex-Ausschnitt** mit vorhandenen Terrain-Katalogbildern, Wald-/Jungle-Overrides und gültigen lokalen Flussrouten. Das vollständige Worldgen-JSON wird nicht zum produktiven Gameplay-Spielstand und ersetzt nicht `vedras_scene.json`.

**Sicherheit:** Erlaubt sind nur versionierte `geography-v2.0.0`-Daten. Die Dateigröße ist auf 30 MB begrenzt; der Generator selbst begrenzt die Gesamtzahl der Hexfelder. Grafikdateien und Terrain-/Nature-Kataloge werden durch den Worldgen-Import nicht verändert. Bereits manuell platzierte Szenenobjekte/Weghexe werden nur nach Bestätigung zurückgesetzt. Eine alte Szene sollte zuvor über den normalen Szenenexport gesichert werden.

## Teststand und ausstehende QA

Syntax sowie isolierte Schattenkompositions-Tests wurden geprüft. Eine Browser-Abnahme mit tatsächlichen hochauflösenden Nature-/Berg-PNGs und die Laufzeitmessung bei hoher Spritedichte sind noch offen. Der frühere reguläre Szenenimport/-export bleibt eigenständig bestehen.
