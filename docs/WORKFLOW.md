# Grafik- und Metadatenworkflow (Asset-Labor v0.11.0)

1. Die 45 zukünftigen Nature-Profile stehen in `plans/sprite_catalog_plan.json`. Fehlende Bilder existieren **nicht** als Platzhalterdateien.
2. Die vorhandenen 148 Nature-PNGs werden vom Regelwerk `existing-asset-rules.js` vorsortiert. Dateiname, grobe Objektklasse, Größe, plausible Biom-Kategorien und Dichte sind Vorschläge, keine visuell bestätigte Artbestimmung.
3. Acht Journal-Spezialbäume `tree_12.png` bis `tree_19.png` besitzen stabile `journal_tree_*`-IDs für `GET /api/journal-trees`. Sie sind keine normalen Kartenbäume.
4. Das Terrain-Bestandsmanifest `plans/terrain_asset_plan.json` führt exakt 25 vom Nutzer benannte Quellfamilien mit 104 realen PNG-Dateien. Die Berg-Testgrafik `mountain_01.png` ist separat. Bestehende technische Test-/Legacy-Typen werden aus Kompatibilitätsgründen nicht gelöscht.
5. Beim Einlesen werden Nature-/Terrain-Vorschläge **nur für Dateien ohne bestehenden Katalogeintrag** gemacht. Dateien mit ungültiger Geometrie erhalten keine Terrain-Zuweisung. Bearbeitete Benutzerkataloge dürfen niemals stillschweigend ersetzt werden.
6. Nature-Bestandsbilder sind bis zur manuellen Prüfung `candidate` und mit `needs_art_review` markiert. Diese werden nicht automatisch verteilt, bis sie ausdrücklich freigegeben (`approved`) werden. Manuelle Testplatzierung ist weiterhin möglich; Journal-Spezialbäume bleiben vollständig gesperrt.
7. Waldboden ist ein Sonderfall: als Walduntergrund/Overlay innerhalb eines Basisbioms oder optional als Dschungel-Optik, nicht pauschal ein eigenständiges Biom. Es gibt **keine** automatische Umbenennung oder Festlegung zu Dschungel.
8. Änderungen an Benutzerkatalogen vor einem lokalen Update sichern. Automatische Speicherung erstellt `.bak`-Dateien. Für den Git-Upload bleiben die tatsächlichen Benutzerkataloge und neue Grafiken ohne ausdrückliche Freigabe ausgeschlossen.
9. Tests: `node tests/test_asset_inventory.cjs` prüft die 25 Terrainfamilien, 104 Zuordnungen, alle 148 Nature-Profile, Sonderbäume, Unicode-Namen und Bestandsschutz. Der synthetische Browsertest `python tests/test_v110_browser.py` benötigt Chromium/Playwright und Pillow.

**Bekannte offene QA-Punkte:** Bildbetrachtung der 41 unbestimmten Büsche, 11 Palmen, der Nadelbaumarten, vorhandener Schnee-/Schattenvarianten; Prüfung der vier ungewöhnlichen `stormy_ocean_0?1.png`-Dateinamen; finale Silhouetten-, Größen- und Performance-Tests mit den echten PNGs. Bestehende Bilder und Referenzen werden nicht auf Verdacht umbenannt.
