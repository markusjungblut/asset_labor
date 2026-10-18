# FloraV2 · trees/snow_conifers

Nur Text-Sollplan; **keine Bilder, keine Dummy-PNGs**. Neue echte Grafiken als `snow_conifers`-Arten entsprechend der Spalte **Ziel-PNG** in diesen Ordner kopieren, dann im Asset Labor **Neu einlesen**. Die erlaubten Geländearten, Größen und Spawn-Gewichte sind in `plans/flora_v2_registry.json` versioniert. Vorhandene Altdateien bleiben im Stammordner `assets/nature/` und werden über Alias-Zuordnungen erkannt.

| Kategorie | Ziel-PNG (falls neu) | Schon vorhandene Varianten | Zielhöhe WE | Erlaubte Terrain-IDs |
|---|---|---|---:|---|
| Schneebedeckte Tanne | `snow_fir_01.png` | `tanne_schnee_01.png`, `tanne_schnee_02.png`, `tanne_schnee_03.png`, `tanne_schnee_04.png` | 174 | highland, tundra, forest_floor |
| Schneebedeckte Fichte (Tannenbild) | `snow_spruce_01.png` | `tanne_schnee_05.png`, `tanne_schnee_06.png`, `tanne_schnee_07.png` | 174 | highland, tundra, forest_floor |
| Schneebedeckte Kiefer (Tannenbild) | `snow_pine_01.png` | `tanne_schnee_08.png`, `tanne_schnee_09.png`, `tanne_schnee_10.png` | 126 | highland, tundra, forest_floor |

> Bei einem bestehenden Alias darf die neue Variante auch als zusätzliche PNG mit kanonischem Zielnamen ergänzt werden. Vorhandene Bilder nicht umbenennen oder überschreiben.
