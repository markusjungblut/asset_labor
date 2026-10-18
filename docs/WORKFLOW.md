# Grafik- und Metadatenworkflow (Asset-Labor v0.11.0)

1. Die 45 zukünftigen Nature-Profile stehen in `plans/sprite_catalog_plan.json`. Fehlende Bilder existieren **nicht** als Platzhalterdateien.
2. Die vorhandenen 148 Nature-PNGs werden vom Regelwerk `existing-asset-rules.js` vorsortiert. Dateiname, grobe Objektklasse, Größe, plausible Biom-Kategorien und Dichte sind Vorschläge, keine visuell bestätigte Artbestimmung.
3. Acht Journal-Spezialbäume `tree_12.png` bis `tree_19.png` besitzen stabile `journal_tree_*`-IDs für `GET /api/journal-trees`. Sie sind keine normalen Kartenbäume.
4. Das Terrain-Bestandsmanifest `plans/terrain_asset_plan.json` führt exakt 25 vom Nutzer benannte Quellfamilien mit 104 realen PNG-Dateien. Das früher vorhandene `mountain_01.png` ist im aktuellen Git-Bestand nicht mehr vorhanden. Bestehende technische Test-/Legacy-Typen werden aus Kompatibilitätsgründen nicht gelöscht.
5. Beim Einlesen werden Nature-/Terrain-Vorschläge **nur für Dateien ohne bestehenden Katalogeintrag** gemacht. Dateien mit ungültiger Geometrie erhalten keine Terrain-Zuweisung. Bearbeitete Benutzerkataloge dürfen niemals stillschweigend ersetzt werden.
6. Nature-Bestandsbilder sind bis zur manuellen Prüfung `candidate` und mit `needs_art_review` markiert. Diese dürfen ausschließlich auf der **Testkarte** automatisch verteilt werden, auch ohne `approved`. Die Produktionsfreigabe bleibt unverändert. Manuelle Testplatzierung ist weiterhin möglich; Journal-Spezialbäume bleiben vollständig gesperrt.
7. Waldboden ist ein Sonderfall: als Walduntergrund/Overlay innerhalb eines Basisbioms oder optional als Dschungel-Optik, nicht pauschal ein eigenständiges Biom. Es gibt **keine** automatische Umbenennung oder Festlegung zu Dschungel.
8. Änderungen an Benutzerkatalogen vor einem lokalen Update sichern. Automatische Speicherung erstellt `.bak`-Dateien. Die beiden realen Kataloge sind seit dem Nutzer-Commit vom 18.10.2026 bereits versioniert; neue Bilder erscheinen nach dem Entfernen der PNG-Ignore-Regeln im Git-Status und müssen explizit hinzugefügt/committed/gepusht werden.
9. Tests: `node tests/test_asset_inventory.cjs` prüft die 25 Terrainfamilien, 104 Zuordnungen, alle 148 Nature-Profile, Sonderbäume, Unicode-Namen und Bestandsschutz. Der synthetische Browsertest `python tests/test_v110_browser.py` benötigt Chromium/Playwright und Pillow.

**Bekannte offene QA-Punkte:** Bildbetrachtung der 41 unbestimmten Büsche, 11 Palmen, der Nadelbaumarten, vorhandener Schnee-/Schattenvarianten; der inzwischen einheitlich umbenannten `stormy_ocean_01` bis `_08`-Varianten; finale Silhouetten-, Größen- und Performance-Tests mit den echten PNGs. Bestehende Bilder und Referenzen werden nicht auf Verdacht umbenannt.

## Importbeispiele

- `assets/nature/marula_01.png`, `marulabaum1.png` oder `marula-baum_01.png`: bekannte Familie `savanna_trees`, Vorschlagsstatus `candidate`.
- `assets/nature/wacholder4.png` oder `wacholder_04.png`: bekannte Familie `conifers`, Objektklasse `shrub`.
- Ein unbekannter Name wie `dschungelbaum_a.png` erscheint nach **Neu einlesen** zwar in der Bibliothek, benötigt aber ausdrücklich Metadaten im Inspektor (oder eine neue Namensregel). Keine automatische Artbestimmung aus Bildpixeln.
- `palme_01`–`palme_05`: mittelgroß; `palme_06`–`palme_11`: groß. Gemeinsame bestehende Familie `palms` und explizite Größengruppen-Tags.
- Im Terminal nach neuen Dateien `git status`, `git add assets/nature/...`, `git commit`, `git push` ausführen. Git erkennt neue Bilder nicht automatisch auf dem Remote-Server. Wenn Änderungen an den Katalogen uncommitted sind, vor einem `git pull` zunächst sichern oder committen.
