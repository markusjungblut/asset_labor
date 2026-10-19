# Habitat- und Flussprüfung – Asset-Labor v0.16

Stand: 19. Oktober 2026. Diese Prüfung umfasst die **im Repository tatsächlich erfassten 181 Nature-PNGs**, nicht bislang nur lokal erstellte Bilddateien. Der Nature-Katalog wurde familienspezifisch ausgewertet; die folgenden Kriterien werden bei generierter **und** manueller Nature-Platzierung mit `VedrasNatureCatalog.habitatOK()` zusätzlich zu den Katalog-Freigaben kontrolliert.

## Überprüfte bestehende Familien (17)

| Familie | Dateien | Tatsächliche Regel / fachliche Einordnung |
|---|---:|---|
| `savanna_trees` | 9 | Nur Savanne und Halbwüste; nicht Dschungel, Hochland oder Vollwüste. |
| `deciduous_trees` | 18 | Gras/Weideland, Feuchtgebiete, Hochland; Schneefelder und gefrorene Tundra ausgeschlossen. |
| `mountains` | 4 | Keine Pflanzen: separater Berg-Renderer und Reservierungslogik. |
| `heath` | 3 | Gras/Weideland und nicht schneebedeckte kühle Standorte; keine Schneefelder. |
| `temperate_bushes` | 40 | Gras/Weideland und Feuchtgebiete; keine Wüste oder Dschungel. |
| `dry_bushes` | 10 | Trockene Landbiome, Grasland und Savanne; kein Dschungel, Schnee oder Sumpf. |
| `flowering_bushes` | 9 | Gemäß Katalog Gras/Weideland und warme Landstandorte außer Dschungel. |
| `conifers` | 29 | Kühle/temperierte Landbiome; unverschneite Ausführungen nicht auf Schneefeldern. |
| `palms` | 11 | Ausschließlich Dschungel und Savanne; kein Moor, Sumpf, Marschland, Wasser, Hochland, Schnee. |
| `snow_conifers` | 10 | Kalte Geländearten einschließlich Schneefelder und gefrorener Tundra. |
| `herbs` | 3 | Sonniges Gras-/Weideland, trockene Biome und Savanne; nicht Dschungel oder Sumpf. |
| `jungle_trees` | 8 | Nur Dschungel; Kapokbäume bleiben gewöhnliche Bäume, keine Sonder-API. |
| `deadwood` | 8 | Baumstümpfe; nicht im Schnee ohne Schneeversion; nie auf Wasser oder Flusskanal. |
| `riparian_trees` | 8 | Erlen/Weiden auf Feuchtflächen; Weideland nur bei Wasser-/Feuchtgebiets-Nachbarschaft. |
| `cold_bushes` | 4 | Tundra, gefrorene Tundra, Hochland; mögliche Schneevarianten später separat. |
| `reeds` | 4 | Moor, Sumpf, Marschland; niemals direkt auf offenem Wasser. |
| `succulents` | 3 | Trockene Biome/Savanne; keine Nassgebiete oder Tundra. |

## Für neue und bestehende Mangroven

- **Ankerpunkt steht auf Land**, nie auf einem Ozean-/Küstenwasserhex. Äste, Blätter oder Wurzeln dürfen **optisch in angrenzendes Wasser hineinreichen**.
- Erlaubte Anker-Biome: `swamp`, `marshland` mit benachbartem Wasser oder warmer Savannen-/Dschungelumgebung (Klimanäherung).
- Verboten: `moor`, `highland`, `tundra`, `snowfields`, `savanna`, `grassland`, `ocean`, `coastal_water` und sonstiges offenes Wasser.
- Die Karte besitzt noch keine unabhängige Temperatur-/Salinitätskarte. Deshalb ist dieser standortbasierte Proxy nicht gleichbedeutend mit einer echten tropischen Brackwasserprüfung.

## Flüsse, Sperrflächen und vorhandene Instanzen

- `river.js` baut Wasserflächen aus **orientierten, gefüllten Polygonmasken je tatsächlicher Hexkante** auf. An Ecken gibt es gefüllte Übergänge, an der Quelle einen runden Abschluss. Die Wasserfüllung stammt aus der Wassertextur des Mündungshex. Die Außenbänder sind transparenter; es gibt kein Sandmotiv und keinen gemalten Linien-Renderer für den Wasserkörper.
- `VedrasRivers.blocksPoint()` kontrolliert dieselbe Geometrie bei der Naturplatzierung. Mit Objekt-Fußpunkt + Mindestabstand gilt die Sperre für alle Nature-Familien, auch für Baumstümpfe und Mangroven.
- Bereits bestehende `natureInstances` werden bei Fluss-, Terrain-/Nature-Katalog-Änderungen bereinigt; daneben gibt es **„Fehlplatzierungen prüfen und bereinigen“** als manuellen Knopf.
- Bereits gespeicherte Instanzen **unbekannter/nicht geladener PNGs** bleiben zunächst erhalten, statt ohne Katalogbeweis unwiederbringlich gelöscht zu werden. Sie werden nicht gerendert, solange das Bild fehlt. Nach dem Einlesen der Metadaten kann erneut geprüft werden.
- Legacy-/Demo-Sprites werden im Renderer aus echten Flusskorridoren ausgeblendet. Manuell per `hexObject` zugewiesene Nature-PNGs werden beim Rendern ebenfalls auf Habitat geprüft.
- Der Fluss ist derzeit im **Asset-Labor**, noch nicht in der separaten Hauptspiel-Kartenwelt integriert.

## Nutzerseitig erstellte Pflanzen (noch nicht im verbundenen Nature-Katalog)

`Farn`, `Dschungelbusch`, `Kaktus`, `Mangrove` (**einzeln, keine Gruppe**), `Toter Baum`, `Gefallener Baum` und Schneevarianten `Dead Tree 11–15` sind laut Nutzer erzeugt, aber hier **nicht als neue katalogisierte PNGs vorhanden**. Der Dateinamen-Classifier kennt die üblichen Varianten und kann sie nach einem Upload einlesen; tatsächliche Bildzuordnung, Anzahl, Transparenz und korrekte Schneeoptik müssen dann kontrolliert werden. Die abgeschlossenen Planposten sind als **`user_created_pending_repo_import`** gekennzeichnet, nicht als bereits erfolgreich importiert.

Die einzigen offenen **neuen Objekttypen** im Produktionsplan sind Findling, Felsgruppe, Eisblock und Schneeberg; sie zählen nicht zur Pflanzenliste. Für unverschneite Büsche, Stümpfe, liegende Stämme, Wacholder und ggf. kalte Laubbäume können zusätzliche Schnee-PNGs sinnvoll sein; ohne solche Varianten werden reguläre unverschneite Sprites von expliziten Schneefeldern gesperrt.

## Prüfstatus / Grenzen

- Katalogstruktur: 181 von 181 Einträgen weiterhin gültig.
- Programmlogik: richtungsorientierte Wasser-Masken, Flusskollision und harte Biomfälle mit gezielten JS-Smoke-Tests geprüft.
- Regressionsdateien: `tests/test_rivers.cjs`, `tests/test_river_nature_habitats.cjs`, `tests/test_vegetation_reconciliation.cjs`, `tests/test_new_nature_import.cjs`, `tests/test_v110_browser.py`.
- Eine echte optische Prüfung des Renderings in mehreren Biomen einschließlich konkreter PNG-Transparenz, Spriteüberhang und visueller Kanten bei Zoom/Relief bleibt notwendig. Die aktuellen Prüfungen ersetzen keinen Browser-Screenshot-Abgleich.
