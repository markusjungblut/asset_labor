# Wald- und Dschungelsystem v0.12.0

## Verbindliche Trennung: Untergrund, Biom und Bewaldung

**Dschungel** ist ein eigenständiges logisches Biom `jungle` in der Terrainkategorie `warm_regions`. Es ist kein Ersatzname für die Textur `wald_01.png`. Bis eine eigene Jungle-Bodengrafik vorhanden ist, darf das Asset-Labor auf bereits vorhandenen Waldboden `forest_floor` als **rein visuelle Textur** zurückfallen. Das logische Biom bleibt dabei `jungle`.

**Lichter Wald** (`light_forest`) und **dichter Wald** (`dense_forest`) sind zusätzliche Vegetationsklassen. Sie können auf mehreren Grundbiomen liegen: Gras-/Weideland, feuchtes Gelände, warme und kalte Landregionen, teilweise trockene Landregionen. Ein Wald-Hex verändert nicht automatisch seine Terrainart oder seine gespeicherte Terrain-PNG. Offene Wasserflächen und explizite Ufermaterialien sind ausgeschlossen.

**Waldrand** ist kein eigenes Grundbiom: Ein Hex neben dichtem Wald erhält einen zusätzlichen, gedämpften `edgeInfluence`, auch wenn seine eigene `forestClass` `none` bleibt. Der Übergang reicht genau einen Hexring weit und überschreibt keine manuell freigehaltenen Hexfelder.

## Technische Module

- `forest.js`: reine, deterministische Berechnung von zusammenhängenden Waldgebieten, Biomverträglichkeit, `forestClass`, `baseDensity`, `edgeInfluence`, `density`, Jungle-Flags und einer Baumquote. Keine DOM-Abhängigkeit und keine Bildproduktion.
- `app.js`: Bewaldung als eigener Zustand `state.forest`, Visualisierung über den Debug-Schalter, getrennte Textur- und Biomauflösung, persistente Einstellungen, Szenenimport und -export.
- `forest-ui.js`: Waldanteil, Rand-Auslauf, manuelle Waldklassen, automatische Rücksetzung sowie Dschungel-Testgebiete.
- `nature-ui.js`: Sprite-Auswahl nach bestehenden Gelände-/Biomeignungen aus dem Nature-Katalog. Wald-Hexe setzen zuerst mehr Bäume, lichte Waldhex weniger; danach passende Sträucher und Bodenobjekte. Nachbarhexe mit Waldrand-Einfluss erhalten zusätzliche einzelne Bäume. Schatten und Anker der bestehenden Sprites bleiben erhalten.

Ein fixer Seed sorgt dafür, dass Waldkerne, Randwirkung und Sprite-Positionen reproduzierbar sind. Die Waldregeln funktionieren ohne Sonderbilder; die Größe einer Waldfläche hängt von `coverage` und der Klimaeignung ab. Manuelle Hexmarkierungen (`none`, `light_forest`, `dense_forest`) haben Vorrang vor zufälligen Waldkernen. Die Testfunktion für Dschungel markiert das ausgewählte Land-Hex und bis zu sechs direkte Landnachbarn.

## Bedienung im Asset-Labor

1. Testkarte öffnen, unter **Natur auf Karte verteilen → Wälder & Dschungel** den Waldgenerator aktivieren.
2. **Waldanteil** und **Waldrand-Auslauf** einstellen. Die optionale farbige Debug-Anzeige zeigt Waldklassen und Dschungelbiome ohne zusätzliche PNGs.
3. **Wald und Natur auf Testkarte neu verteilen** erzeugt die bewaldete Szene. Die reguläre Schaltfläche **Natur verteilen** verwendet dieselben Waldregeln.
4. Ein Hex wählen und mit **Lichter Wald**, **Dichter Wald**, **Freifläche** oder **Wieder automatisch** seinen Waldstatus festlegen. Bei manueller Freifläche entfallen Waldbaum-Spawn und Waldrand-Einfluss; Sträucher bleiben unabhängig davon grundsätzlich möglich.
5. **Dschungelgebiet (bis 7 Hexe) erzeugen** wechselt das logische Biom für die ausgewählten Land-Hexe und triggert die Natur-Neuverteilung. **Dschungelmarkierungen entfernen** stellt den vorherigen Geländetyp wieder her.

**Hinweis zum Labor:** Die Neubepflanzung durch den Nature-Verteilungsbutton ersetzt, wie schon zuvor, die aktuell vorhandenen automatisch/manuell platzierten Nature-Instanzen der Testszene. Individuelle Grafik-Metadaten werden nicht geändert. Die Einstellung `candidate` bleibt eine Produktionsprüfung, schließt aber eine Testverteilung nicht aus.

## Datenformat und Kompatibilität

`state.forest` (auch in `vedras_scene.json`):

```json
{
  "enabled": true,
  "seed": 12345,
  "coverage": 0.38,
  "edgeStrength": 0.72,
  "debug": false,
  "overrides": {"0,0": "dense_forest", "1,0": "none"},
  "jungleHexes": {"-1,1": true}
}
```

`forestByHex` im Szenenexport enthält die berechnete `biome`, `forestClass`, `density`, `edgeInfluence` und `jungle`-Kennzeichnung pro Hex. Alte Szenen ohne diese Daten bleiben kompatibel und verwenden Standardwerte für `state.forest`. Die früheren `terrainByHex`- und `terrainByBiome`-Zuordnungen werden nicht geändert.

## Bestehende Vegetation

- Laubbäume und Nadelhölzer erscheinen nur auf kompatiblen Terrainarten, z. B. `grassland` oder `snowfields`.
- Auf `jungle` nutzt die Engine derzeit passende warme Nature-Sprites wie die vorhandenen Palmen. Savannenbäume werden nicht automatisch in geschlossene Dschungel gepflanzt.
- Die acht `tree_12.png` bis `tree_19.png` sind **reguläre Kapokbäume** (`kind=tree`, `family=jungle_trees`, IDs `kapok_tree_12` bis `kapok_tree_19`). Sie dürfen im Dschungel manuell und automatisch platziert werden; die irrtümlich eingeführte Journal-API und deren Sperren sind entfernt.
- Nicht zugeordnete Arten werden nicht zufällig als Wald- oder Dschungelbaum eingesetzt.

## Tests und Grenzen

`node tests/test_forest.cjs`: deterministische Waldkerne, `light_forest`/`dense_forest`, einen Ring Waldrand, manuelle Overrides, Jungle und Wassersperren.

`node tests/test_forest_integration.cjs`: reale Nature-Familien und Biomverträglichkeit, Baumquote, echte Kapokbäume und Export/UI-Verknüpfung.

`python tests/test_v110_browser.py`: Browser-Test für die 37-Hex-Szene, Wald-Eingriffe und Dschungelerzeugung (benötigt Playwright, Chromium und Pillow).

**Nicht Bestandteil dieser Änderung:** Die tatsächliche Spielwelt-Generierung des separaten Hauptspiel-Repositories und großflächige Weltkarten-Performance. `forest.js` und das exportierte `forestByHex` liefern die Basis dafür. Die visuelle Feinabstimmung der Höhen, Baumschatten und Biomenge bleibt erforderlich.
