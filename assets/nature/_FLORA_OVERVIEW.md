# Nature – FloraV2 Soll-/Ist-Katalog

**Keine Platzhalterbilder.** Die vorhandenen Bilder stehen weiterhin in `assets/nature/`. Neue Pflanzen können in die nachfolgend vorbereiteten Unterordner gelegt werden. Pro Pflanzenfamilie existiert nur die Textdatei `_ASSET_PLAN.md` mit der Liste von Soll-PNGs, der zulässigen Biome und ihren Zielgrößen.

Es wurden **104 geplante Nature-Kategorien** definiert und **148 vorhandene PNGs** unter ihrem ursprünglichen Dateinamen zugeordnet. Die 41 generischen Büsche werden als gemäßigte Sträucher geführt; `tree_12` bis `tree_19` bleiben unklassifizierte Dschungelbäume. Die `tanne_*`- und `tanne_schnee_*`-Grafiken werden auf Tanne, Fichte, Kiefer und Pinie verteilt, ausdrücklich als **optische Stellvertreter** ohne bestätigte botanische Identifikation.

## Vorgehen

1. Im passenden Ordner die `_ASSET_PLAN.md` öffnen und den Eintrag mit Status **noch nicht vorhanden** suchen.
2. Eine **echte freigestellte PNG** im genannten Unterordner unter exakt dem Soll-Namen speichern (keine Bild-Platzhalter und keine leeren Fake-PNGs).
3. Asset Labor neu starten oder **Neu einlesen** klicken. Der `sprite-planner.js` ordnet die Grafik automatisch zu und übernimmt Art, visuelle Größe, Terrain-IDs und Spawn-Gewichtung.
4. Die Metadaten auf der rechten Seite prüfen. Bestehende eigene Einträge werden bei erneutem Einlesen **nicht überschrieben**.
5. Die globale, dauerhafte Sortierung liegt in `plans/flora_v2_registry.json`; diese Textpläne dienen nur der menschenlesbaren Übersicht.

## Verfügbare Unterordner (37)

- `assets/nature/trees/deciduous_trees/`: 8 geplante Arten
- `assets/nature/trees/conifers/`: 7 geplante Arten
- `assets/nature/trees/snow_conifers/`: 3 geplante Arten
- `assets/nature/trees/savanna_trees/`: 3 geplante Arten
- `assets/nature/trees/palms/`: 2 geplante Arten
- `assets/nature/trees/tropical_trees/`: 4 geplante Arten
- `assets/nature/shrubs/heath/`: 1 geplante Arten
- `assets/nature/shrubs/dry_bushes/`: 7 geplante Arten
- `assets/nature/shrubs/temperate_bushes/`: 5 geplante Arten
- `assets/nature/shrubs/flowering_bushes/`: 1 geplante Arten
- `assets/nature/ground/herbs/`: 1 geplante Arten
- `assets/nature/trees/riparian_trees/`: 2 geplante Arten
- `assets/nature/shrubs/cold_bushes/`: 5 geplante Arten
- `assets/nature/ground/mosses/`: 2 geplante Arten
- `assets/nature/ground/lichens/`: 2 geplante Arten
- `assets/nature/ground/alpine_herbs/`: 3 geplante Arten
- `assets/nature/ground/wet_grasses/`: 2 geplante Arten
- `assets/nature/ground/grasses/`: 2 geplante Arten
- `assets/nature/ground/meadow_herbs/`: 5 geplante Arten
- `assets/nature/ground/dry_grasses/`: 3 geplante Arten
- `assets/nature/ground/savanna_grasses/`: 2 geplante Arten
- `assets/nature/shrubs/tropical_bushes/`: 2 geplante Arten
- `assets/nature/ground/ferns/`: 1 geplante Arten
- `assets/nature/ground/jungle_herbs/`: 3 geplante Arten
- `assets/nature/shrubs/wet_bushes/`: 4 geplante Arten
- `assets/nature/ground/wet_herbs/`: 4 geplante Arten
- `assets/nature/ground/reeds/`: 3 geplante Arten
- `assets/nature/trees/wet_trees/`: 2 geplante Arten
- `assets/nature/trees/mangroves/`: 1 geplante Arten
- `assets/nature/trees/dry_trees/`: 3 geplante Arten
- `assets/nature/shrubs/succulents/`: 1 geplante Arten
- `assets/nature/ground/dry_herbs/`: 1 geplante Arten
- `assets/nature/trees/deadwood/`: 1 geplante Arten
- `assets/nature/ground/deadwood/`: 3 geplante Arten
- `assets/nature/ground/rocks/`: 3 geplante Arten
- `assets/nature/ground/ice/`: 1 geplante Arten
- `assets/nature/ground/snowy_mountains/`: 1 geplante Arten

**Dateiumbenennung:** Bestands-PNGs wurden absichtlich nicht physisch umbenannt, weil gespeicherte Referenzen und Szenen sonst brechen können. Die Pflanzenarten und Varianten besitzen im neuen Metadatenkatalog eindeutige IDs und Aliase. Ein späteres kontrolliertes Rename muss Referenzen atomar migrieren.

**Statusgrenzen:** Der Asset-Plan beschreibt erwartete Vegetation und konkrete Dateinamen. Die Grafikprüfung (korrekte botanische Silhouette, Alpha, Kamerawinkel und Schatten) bleibt eine gesonderte Abnahme. Die Einordnung der Tannenbilder in andere Nadelholzrollen ist vorläufig.
