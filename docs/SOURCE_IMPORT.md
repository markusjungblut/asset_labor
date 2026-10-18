# v0.11.0 – Quellcode-Übernahme

Die erste Version des Asset-Labors mit 37-Hex-Karte, 45 geplanten Sprite-Arten und aufklappbaren Bedienfeldern wurde lokal erstellt und getestet.

**Wichtig:** Die Datei `plans/sprite_catalog_plan.json` ist ein Soll-Katalog, keine Kopie persönlicher Nature-Metadaten. Echte Nutzerdateien unter `assets/` werden nicht in dieses öffentliche Repository eingecheckt.

## Verfügbare Pakete
- `Vedras_Asset_Labor_v0.11.0_Update.zip`: Programmupdate für bestehenden lokalen Ordner
- `Vedras_Asset_Labor_v0.11.0_Source.zip`: Versionierbarer Quellstand ohne `assets/`
- `Vedras_Asset_Labor_v0.11.0.zip`: separate Demo-Vollinstallation

## Erster Quellimport
1. Repository klonen.
2. `Source.zip` direkt in den Repository-Ordner entpacken.
3. `git status` prüfen: **keine** Dateien aus `assets/` oder persönliche Kataloge.
4. `git add . && git commit -m "feat: import asset lab v0.11.0" && git push`.
5. Für den lokalen Betrieb den vorhandenen persönlichen `assets/`-Ordner separat in den Arbeitsordner kopieren.

## Abwärtskompatibilität
- Alte Nature-Datensätze ohne `sizeMode` bleiben **manuell**.
- Nur neue exakt passend benannte PNGs erhalten geplante Metadaten automatisch.
- Bestehende Größen dürfen nur nach Sicherung und expliziter Nutzerbestätigung neu kalibriert werden.
- Wasser, Ufer, Berge und Geländearten werden nicht stillschweigend überschrieben.

**Status:** Programmquellen noch nicht direkt im Repo; hier sind die kanonischen Katalog-/Migrationsregeln versioniert. Der Quellimport ist ein separater Schritt.
