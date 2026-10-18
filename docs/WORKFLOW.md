# Grafik- und Metadatenworkflow

1. Neue geplante Sprite-ID, deutscher Name, Familie, Objektklasse, Zielhöhe, Biome und Gewichtung kommen in `plans/sprite_catalog_plan.json`.
2. Das tatsächliche Bild wird im lokalen Labor unter `assets/nature/<geplanter_dateiname>.png` abgelegt.
3. Das Labor übernimmt Metadaten bei exakter Namensübereinstimmung, **nur wenn kein bestehender Katalogeintrag existiert**.
4. Existierende individuelle Sprite-Metadaten bleiben erhalten. Bei Bedarf Größenmodus `class` freiwillig aktivieren; vorher Katalog exportieren.
5. Software und Planungsdateien gehören in Git; Nutzergrafiken und lokale Kataloge zunächst nicht.
6. Berg-PNGs werden unverändert gezeichnet, Shadow-Pass separat; Wasser bleibt flach und die Ufer sind Overlays.

Der erste vollständige Quellimport aus dem lokalen `Vedras_Asset_Labor_v0.11.0_Source.zip` steht noch aus. Die Repository-Dateien hier allein sind **nicht** ausführbar.
