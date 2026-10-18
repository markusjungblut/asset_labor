# GitHub: Asset-Labor v0.11.0

Repository: https://github.com/markusjungblut/asset_labor

## Versionierter Inhalt

Ab v0.11.0 ist der Quellcode mit Renderer, Editor, Tests und `plans/sprite_catalog_plan.json` als eigener GitHub-Stand vorgesehen. Den Live-Stand im Repository prüfen; ausgelieferte ZIP-Versionen enthalten denselben Quellstand.

## Lokal arbeiten

```bash
git clone https://github.com/markusjungblut/asset_labor.git
cd asset_labor
```

Der Ordner `assets/` ist **nicht** Bestandteil des öffentlichen Repositories. Für lokale Tests den eigenen vorhandenen `assets/`-Ordner in die Arbeitskopie übernehmen. Benutzerkataloge und Nutzergrafiken nicht ins Repository committen.

```bash
python server.py
```

Windows: `START_WINDOWS.bat`; Linux/macOS: `START_MAC_LINUX.sh`.

## Updates

Änderungen ausschließlich an Programm, Tests und Planungskatalog einchecken. Vor Katalog-Migrationen den privaten `assets/`-Ordner sichern und Materialmetadaten nicht ungefragt normalisieren.