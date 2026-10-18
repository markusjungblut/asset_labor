# Vedras Reiche · Asset-Labor

Modulares 2,5D-Karten- und Nature-Sprite-Labor. Dieses Repository soll künftig der **kanonische Quellstand für Programmcode und Grafikkontrakte** sein.

## Struktur (ab v0.11.0)

- `app.js`, `autotile.js`, `nature-ui.js`, `mountain.js`, `relief.js`, `shoreline.js`: Renderer und UI
- `sprite-planner.js` + `plans/sprite_catalog_plan.json`: **geplante** Sprites, Dateinamen, Größen, Biome und Verteilung
- `nature_catalog.js`: gültiger Nature-Metadatenvertrag
- `tests/`: Regressionstests
- `assets/`: **lokale Benutzerdateien** (werden zunächst absichtlich nicht versioniert)

Die Programmquellen werden aus dem getesteten `Vedras_Asset_Labor_v0.11.0_Source.zip` eingespielt. **Dieses README initialisiert das bisher leere Repository; es enthält noch nicht den vollständigen Programmcode.**

## Erste Übernahme der Programmdateien

1. Repository klonen: `git clone https://github.com/markusjungblut/asset_labor.git`
2. Das v0.11.0-`Source.zip` in den geklonten Ordner entpacken (Verzeichnisinhalt ins Repository-Stammverzeichnis).
3. Lokal `git add .`, `git commit -m "feat: import asset laboratory v0.11.0"`, `git push` ausführen.
4. Der bestehende lokale `assets/`-Ordner bleibt am bisherigen Standort; Bilder und echte Kataloge **nicht** versehentlich committen.

## Größen- und Datenregeln

Die Größenklasse ist bei `sizeMode=class` eine verbindliche **sichtbare Höhe** (nach Alphabeschnitt), nicht mehr nur ein Label. Alte Nature-Datensätze ohne `sizeMode` bleiben manuell skaliert. Automatisches Registrieren geplanter Dateinamen ändert keine bestehenden Katalogeinträge. Wasser bleibt flach; Ufer und Berg-Sprites bleiben getrennte Systeme.

Die vollständige technische Dokumentation im bisherigen Browsergame-Projekt bleibt Referenz bis zur kontrollierten Übernahme.
