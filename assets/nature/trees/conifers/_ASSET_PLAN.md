# FloraV2 · trees/conifers

Nur Text-Sollplan; **keine Bilder, keine Dummy-PNGs**. Neue echte Grafiken als `conifers`-Arten entsprechend der Spalte **Ziel-PNG** in diesen Ordner kopieren, dann im Asset Labor **Neu einlesen**. Die erlaubten Geländearten, Größen und Spawn-Gewichte sind in `plans/flora_v2_registry.json` versioniert. Vorhandene Altdateien bleiben im Stammordner `assets/nature/` und werden über Alias-Zuordnungen erkannt.

| Kategorie | Ziel-PNG (falls neu) | Schon vorhandene Varianten | Zielhöhe WE | Erlaubte Terrain-IDs |
|---|---|---|---:|---|
| Lärche | `larch_01.png` | `lärche1.png` | 174 | highland, tundra, forest_floor |
| Tanne (auch ähnliche Nadelhölzer) | `fir_01.png` | `tanne_01.png`, `tanne_02.png`, `tanne_03.png`, `tanne_04.png` | 174 | highland, forest_floor, grassland, tundra |
| Fichte (Tannenbild als Stellvertreter) | `spruce_01.png` | `tanne_05.png`, `tanne_06.png`, `tanne_07.png` | 174 | highland, forest_floor, grassland, tundra |
| Kiefer (Tannenbild als Stellvertreter) | `pine_01.png` | `tanne_08.png`, `tanne_09.png` | 174 | highland, forest_floor, grassland, tundra, sparse_pasture, moor |
| Pinie (Tannenbild als Stellvertreter) | `stone_pine_01.png` | `tanne_10.png`, `tanne_11.png` | 174 | highland, forest_floor, semi_desert |
| Zeder | `cedar_01.png` | `zeder1.png`, `zeder2.png`, `zeder3.png`, `zeder4.png`, `zeder5.png`, `zeder6.png` | 174 | highland, forest_floor, semi_desert, rocky_desert |
| Zypresse | `cypress_01.png` | `zypresse1.png`, `zypresse2.png`, `zypresse3.png`, `zypresse4.png`, `zypresse5.png` | 126 | highland, forest_floor, semi_desert, rocky_desert |

> Bei einem bestehenden Alias darf die neue Variante auch als zusätzliche PNG mit kanonischem Zielnamen ergänzt werden. Vorhandene Bilder nicht umbenennen oder überschreiben.
