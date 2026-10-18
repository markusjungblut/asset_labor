# GitHub: Asset-Labor v0.11.0

Repository: https://github.com/markusjungblut/asset_labor

## Versionierter Inhalt

Ab v0.11.0 ist der Quellcode mit Renderer, Editor, Tests und `plans/sprite_catalog_plan.json` als eigener GitHub-Stand vorgesehen. Den Live-Stand im Repository prüfen; ausgelieferte ZIP-Versionen enthalten denselben Quellstand.

## Lokal arbeiten

```bash
git clone https://github.com/markusjungblut/asset_labor.git
cd asset_labor
```

**Aktueller Stand:** Seit dem Asset-Import-Commit `2933ec5` enthält das öffentliche Repository bereits echte PNG-Dateien in `assets/`. Bereits getrackte Dateien werden nicht durch `.gitignore` versteckt; am 18.10.2026 wurden die PNG-/Katalog-Ignore-Regeln vom Nutzer entfernt und beide tatsächlichen Kataloge eingecheckt. Neue Grafikdateien sind jetzt ebenfalls manuell über `git add`/`git commit`/`git push` versionierbar. Benutzerkataloge vor Änderungen und Migrationen lokal sichern. Keine PNGs auf Verdacht löschen oder umbenennen.

```bash
python server.py
```

Windows: `START_WINDOWS.bat`; Linux/macOS: `START_MAC_LINUX.sh`.

## Updates

Änderungen ausschließlich an Programm, Tests und Planungskatalog einchecken. Vor Katalog-Migrationen den privaten `assets/`-Ordner sichern und Materialmetadaten nicht ungefragt normalisieren.