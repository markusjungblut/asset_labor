# Icon-Inventar und Themenordner — Vedras Reiche

**Stand:** 12.11.2026 · **Quelle:** `markusjungblut/asset_labor`, Branch `main`, Bestand aus `main` vom 12.11.2026.

## Maßgebliche Ablage

Die Bilder liegen unverändert unter `assets/icons/<Themenordner>/<Dateiname>.png`. Die **Themenordner sind Kategorien**, keine Stufen `1–4`. Die tatsächlichen Dateipfade in Git sind die maßgebliche technische Quelle; für eine filterbare Vollübersicht siehe [ICON_KATALOG.csv](ICON_KATALOG.csv) (Semikolon-getrennt, UTF-8-BOM, Excel-kompatibel).

- **Gesamtbestand:** 721 PNG-Dateien in `assets/icons/`.
- **Themenordner:** 35.
- **Sonderablage `nicht benötigt`:** 28 PNGs; Dateien bleiben erhalten, gehören aber nicht in die aktive Auswahl.
- **Bilder nicht umbenennen, konvertieren, löschen oder grafisch überarbeiten**, um Kategorien zu korrigieren; Kategorisierung erfolgt über den Pfad. Alte interne IDs nicht aus Dateinamen erraten.

## Verbindliche Einordnung: Medaille und Pokal

| Bezeichnung | Alter Katalogeintrag (Referenz) | Verbindlicher GitHub-Pfad | Kategorie |
| --- | --- | --- | --- |
| Medaille (Dateiname bewusst `Medallie.png`) | ID 705, früher „Militärorden“ | `assets/icons/UI Icons/Medallie.png` | `UI Icons` |
| Goldene Trophäe / Pokal | ID 721 | `assets/icons/UI Icons/Goldene_Trophäe.png` | `UI Icons` |

**Ergebnis:** Die beiden Originaldateien befinden sich bereits gemeinsam im Ordner `UI Icons`. Keine weitere physische Verschiebung ist erforderlich. Der frühere beschreibende Titel „Militärorden“ wird nicht wiederhergestellt.

## Verzeichnisbestand

| Kategorie / Ordner | PNG-Dateien |
| --- | ---: |
| Ausrüstung & Alltag | 21 |
| Baustoffe & Gesteine | 42 |
| Chemikalien & Energie | 17 |
| Dokumente & Karten | 16 |
| Edelsteine | 34 |
| Erze & Mineralien | 9 |
| Farbstoffe & Pigmente | 7 |
| Feuer & Beleuchtung | 9 |
| Flaggen | 8 |
| Fortbewegungsmittel | 8 |
| Freizeit & Symbole | 6 |
| Gefäße & Behälter | 13 |
| Geld & Wertgegenstände | 11 |
| Getränke | 11 |
| Holz & Forstwirtschaft | 34 |
| Industrie | 19 |
| Kleidung & Accessoires | 15 |
| Lebensmittel | 98 |
| Menschen | 14 |
| Metalle & Werkstoffe | 16 |
| moderne Rohstoffe | 21 |
| moderne Waffen | 19 |
| nicht benötigt | 28 |
| Papier & Schreibmaterial | 6 |
| Pflanzen | 27 |
| Pilze | 8 |
| Rüstung & Schilde | 47 |
| Schifffahrt & Navigation | 9 |
| sehr moderne Waffen | 5 |
| Textilien & Leder | 11 |
| Tiere | 11 |
| Tierische Rohstoffe | 19 |
| UI Icons | 14 |
| Waffen & Munition | 68 |
| Werkzeuge & Handwerk | 20 |
| **Gesamt** | **721** |

## Präzisierungen vom 10.11.2026

- `Eisennägel.png` wird im Katalog **Sechs Eisennägel** genannt.
- `Nägel.png` wird im Katalog **Sechzehn Eisennägel** genannt.
- `Papierrolle.png` gehört zu **Industrie** (wie `Elektromotor.png`). Die frühere Kategorie `vorläufig inaktiv` beruhte auf einem Missverständnis und existiert nicht mehr. Original-PNGs bleiben unverändert, und Dateinamen müssen für diese Benennungen nicht geändert werden.

## UI und ausgeschlossene Motive (12.11.2026)

**UI-Ressourcenanzeigen** (kein eigenständiger Gacha-Gegenstand allein aufgrund dieses Symbolbilds):
- Nahrung: `UI Icons/Gemischte_Lebensmittel.png`
- Holz: `UI Icons/Holzscheite.png`
- Stein: `UI Icons/Steinblöcke.png`
- Eisen: `UI Icons/Rötliches_Eisenerz.png`
- Geld: `UI Icons/Kupfermuenzen.png`, `UI Icons/Silbermünzen.png`, `UI Icons/Goldmünzenstapel.png`

**In `nicht benötigt` umsortiert:** `Wasser.png` und `Goldmünzen.png` (nicht mit anderen Münzen-Icons gleichsetzen).

Alle neun Original-PNGs wurden ohne inhaltliche Änderung ausschließlich per Git-Baumpfad verschoben. M26s Item-/Anbieterkatalog benötigt nach dieser Sortierung ebenfalls eine Pfadkorrektur.

## Pflege- und Abgleichregeln

1. Bei einer physischen Umordnung eines Icons stets den Original-PNG-Inhalt unverändert lassen und die Katalogzeile (Kategorie und GitHub-Pfad) anpassen.
2. Nach jeder Umordnung prüfen, dass **jeder PNG-Pfad genau einmal** im Verzeichnis-Katalog steht und dass für alle Katalogpfade tatsächlich eine Datei existiert.
3. Der Verzeichnis-Katalog enthält Namen, aktuelle Themenkategorie, Pfad und eindeutige Ablagezustände aus Sonderordnern. Er ersetzt **keine** separaten fachlichen Freigaben, Unterkategorien oder redaktionellen Notizen.
4. Vorhandene Spiel- bzw. Sprite-Metadaten in `assets/terrain/` und `assets/nature/` bleiben hiervon unberührt.
5. Die vorher im Chat verwendete Excel-Datei ist **nicht** im Repository unter `docs/` versioniert. Bis eine aktualisierte `.xlsx` dort ergänzt wird, ist die vollständig aus Git rekonstruierbare [CSV-Liste](ICON_KATALOG.csv) der belastbare maschinenlesbare Bestandsabgleich. Das ist ein noch offener Dokumentationspunkt.

> Katalogzeilen: 721. Prüfen lässt sich dies unabhängig über alle `*.png` unter `assets/icons/`.
