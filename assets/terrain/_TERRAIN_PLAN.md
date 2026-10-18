# Terrain: 25 aktive Kategorien – Bestandsmapping

Der Terrain-Katalog wird aus `plans/terrain_catalog_seed.json` geladen, sofern kein lokaler Katalog existiert. Bei vorhandenem Nutzerkatalog werden ausschließlich **fehlende** Geländearten, Kategorien und bereits bekannte PNG-Pfadzuordnungen in der Laufzeitansicht ergänzt; bestehende manuelle Zuordnungen bleiben erhalten. **Es wird kein Bild generiert oder verschoben.**

| Terrain | ID | Zugeordnete PNGs | Bäume % | Sträucher % | Kleinbewuchs % |
|---|---|---:|---|---|---|
| Badlands | `badlands` | 4 | 0–3 | 6–18 | 5–12 |
| Küstenwasser | `coastal_water` | 4 | 0–0 | 0–0 | 0–0 |
| Gefrorene Tundra | `frozen_tundra` | 4 | 0–0 | 3–10 | 8–22 |
| Grasland | `grassland` | 4 | 7–20 | 12–32 | 25–55 |
| Halbwüste | `semi_desert` | 4 | 1–6 | 10–24 | 12–30 |
| Hochland | `highland` | 4 | 5–16 | 10–28 | 20–45 |
| Eisiger Ozean | `icy_ocean` | 4 | 0–0 | 0–0 | 0–0 |
| Karges Weideland | `sparse_pasture` | 4 | 1–8 | 12–28 | 20–45 |
| Lehmwüste | `clay_desert` | 4 | 0–1 | 3–10 | 2–10 |
| Marschland | `marshland` | 4 | 0–8 | 10–24 | 30–65 |
| Moor | `moor` | 4 | 1–8 | 12–30 | 30–60 |
| Ozean | `ocean` | 4 | 0–0 | 0–0 | 0–0 |
| Ödland | `wasteland` | 4 | 0–1 | 2–8 | 2–10 |
| Sandige steinige Wüste | `sandy_rocky_desert` | 4 | 0–3 | 5–16 | 5–15 |
| Sandige Badlands | `sandy_badlands` | 4 | 0–2 | 4–14 | 3–12 |
| Savanne | `savanna` | 4 | 5–18 | 7–22 | 25–50 |
| Schneefeld | `snowfields` | 4 | 0–0 | 0–1 | 0–3 |
| Steinige Badlands | `rocky_badlands` | 4 | 0–2 | 5–17 | 4–13 |
| Steinige Wüste | `rocky_desert` | 4 | 0–4 | 6–20 | 5–16 |
| Stürmischer Ozean | `stormy_ocean` | 8 | 0–0 | 0–0 | 0–0 |
| Sumpf | `swamp` | 4 | 12–32 | 15–34 | 30–55 |
| Tundra | `tundra` | 4 | 0–3 | 8–25 | 25–45 |
| Waldboden | `forest_floor` | 4 | 75–100 | 20–55 | 25–65 |
| Weideland | `pasture` | 4 | 3–14 | 12–28 | 25–50 |
| Wüste | `desert` | 4 | 0–2 | 4–14 | 3–12 |

Waldboden `forest_floor`: Terrain-Oberfläche, aber kein eigenständiges Bioklima. Die ursprüngliche Klassifikation kann in `forestBaseBiomeByHex` erhalten werden. Das Asset Labor bietet einen Waldboden-Test über sieben Hexe und sechs Waldprofile: Laubwald, Mischwald, Nadelwald, Trockenwald, Feuchtwald, Dschungel. Tropischer Dschungel kann Waldboden als eigenständige Landschaft nutzen. Baumdichte und Artgewichte werden unabhängig von der gezeichneten Bodenfläche bestimmt.

Die vier zusätzlichen archivierten Testflächen sowie die historischen `coast`-/`jungle`-IDs bleiben für ältere Szenen vorhanden, gehören aber **nicht** zu den 25 aktiven Terrains.
