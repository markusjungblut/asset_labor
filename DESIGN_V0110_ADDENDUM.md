# Grafikdesign-Vertrag v0.11.0 – Sprite-Katalog, Größe, Workspace

1. `sprite_catalog_plan.json` ist ein **geplanter Soll-Katalog**, nicht eine Kopie des Nature-Ist-Katalogs. Jedes geplante Objekt hat stabile ID, deutsche Bezeichnung, exakten Dateinamen, Familie, Klasse, Größenklasse, Zielhöhe, Biome, Dichte und Mindestabstand.
2. `nature_catalog.json` bleibt der einzige verbindliche Ist-Stand der tatsächlich importierten Nature-Grafiken. Existierende Benutzer-Metadaten werden von automatischen Plandateinamen **niemals** überschrieben.
3. Für `sizeMode=class` bestimmt die sichtbare Höhen-Sollgröße die Darstellung; nach dem Alphabeschnitt berechnet sich Breite = Zielhöhe × Ausschnittbreite/Ausschnitthöhe. Für `manual` bleibt `logicalWidth` wirksam. Alte Daten ohne `sizeMode` entsprechen **manual**.
4. Die Zielhöhen in Welteinheiten sind künstlerische **relative Skalen**, keine botanischen Meterangaben. Ein sehr kleiner Busch darf nicht automatisch einen großen Baum überragen. Klassenprofile sind nach Objektklasse getrennt.
5. Die Kameraprojektion (pointy-top, 256, feste Y-Projektion) bleibt unverändert. Terrain Auto-Tiling, Wasser-Sampling, Ufer-Overlays und Berge sind unabhängige Layer.
6. Zulässige Nature-Anker neben Bergen werden nicht pauschal verboten; wenn der Fußpunkt optisch vor einer opaken Bergsilhouette läge, wird das Sprite dahinter gezeichnet. Nur das Berg-Kernhex ist platzierungsblockiert. Keine Versetzung oder Löschung der Originalinstanz.
7. 37 Hexfelder bilden eine erste größere Kartenansicht. Wegen CPU-Raster-Limits mit adaptiver Qualität. Kein Ersatz für den geplanten 30×30-Weltgenerator.
8. Git: Source-Code und Planungsmanifest versionieren, echte PNGs/Kataloge zunächst lokal schützen; später separate freigegebene Art-Assets gezielt hinzufügen.