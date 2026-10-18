# FloraV2 · ground/herbs

Nur Text-Sollplan; **keine Bilder, keine Dummy-PNGs**. Neue echte Grafiken als `herbs`-Arten entsprechend der Spalte **Ziel-PNG** in diesen Ordner kopieren, dann im Asset Labor **Neu einlesen**. Die erlaubten Geländearten, Größen und Spawn-Gewichte sind in `plans/flora_v2_registry.json` versioniert. Vorhandene Altdateien bleiben im Stammordner `assets/nature/` und werden über Alias-Zuordnungen erkannt.

| Kategorie | Ziel-PNG (falls neu) | Schon vorhandene Varianten | Zielhöhe WE | Erlaubte Terrain-IDs |
|---|---|---|---:|---|
| Thymian | `thyme_01.png` | `thymian_01.png`, `thymian_02.png`, `thymian_03.png` | 10 | sparse_pasture, semi_desert, highland, grassland, rocky_desert |

> Bei einem bestehenden Alias darf die neue Variante auch als zusätzliche PNG mit kanonischem Zielnamen ergänzt werden. Vorhandene Bilder nicht umbenennen oder überschreiben.
