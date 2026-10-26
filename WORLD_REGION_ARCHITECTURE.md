# Vedras Reiche – persistente Weltregionen und Entdeckung (v0.22, Entwurf)

## Zweck und Sicherheitsgrenzen

`persistent_world_store.py` implementiert eine **reale, dauerhaft gespeicherte**
SQLite-Datenbasis für eine gemeinsame Welt. `world_region_pipeline.py`
übernimmt bestehende Geografie-v2.1-JSON-Exporte als versionierte Regionen.

Dies ist bewusst eine **interne Daten- und Editor-Pipeline**, **kein**
fertiger Multiplayer-Server. Es werden keine ungeschützten HTTP-Endpunkte
für Entdeckung, Spieleridentitäten oder unbekannte Weltgrafiken geöffnet.

## Datenmodell

| Tabelle | Inhalt |
| --- | --- |
| `worlds` | Eine unveränderliche Welt-ID, Welt-Seed, anfängliche Generatorversion und Regiongröße |
| `regions` | Globale Regionkoordinaten, aktuelle Revision, lokale Generator- und Inhaltsversion, festgelegte Anschlussdaten |
| `hexes` | Weltweite axiale `(q,r)`-Koordinaten, unveränderliche geografische Ausgangsbasis nach erster Entdeckung |
| `region_revisions` | Archivierte Regionsfassungen für Rücksetzungen und Diagnose |
| `global_discoveries` | Erste Entdeckung eines Hexfelds durch irgendeinen Spieler; ab dann ist die Ausgangsbasis eingefroren |
| `player_discoveries` | Pro Spieler dauerhaft bekannte Hexfelder; unabhängig von der globalen Entdeckung |
| `world_events` | Straßen, Gebäude, Armeen usw. als separate, veränderliche Ereignisse statt überschreibender Weltbasis |

Die Region eines Hexfelds ist `(q // region_size, r // region_size)`.
Python-Floor-Division gewährleistet stabile Regionen auch für negative
Koordinaten. Es gibt keine künstliche maximale Weltgrenze. Die anfängliche
Regionsgröße beträgt 16 × 16 axiale Koordinaten; 32 × 32 ist ebenfalls erlaubt.
Geografische Weltregionen sind **nicht** dasselbe wie die 512-Welteinheiten-
Bildkacheln aus dem Renderer.

### Globale Unveränderlichkeit

Wenn Spieler A erstmals `(q=0,r=0)` erkundet, entsteht ein Datensatz in
`global_discoveries`. **Alle** späteren Generierungsrevisionen müssen dessen
ursprüngliche `base_json` bytegleich erhalten; auch ein Rollback darf diese
Grundlage nicht überschreiben oder löschen. Die gebundene
`base_revision` bleibt ermittelbar.

Die übrigen unentdeckten Felder derselben Region können mit neueren
Generator-/Inhaltsversionen regeneriert oder entfernt werden. Sobald irgendein
Feld einer Region global entdeckt wurde, bleiben auch die gespeicherten
`edge_constraints` dieser Region unverändert. Ein zukünftiger Weltgenerator
muss diese Randbedingungen beim Erweitern explizit einhalten.

### Individuelle Entdeckung und Sichtweite

Der interne Aufruf `player_view(world, player, coordinates, visible)` unterscheidet:

- **unknown**: nur `q`, `r` und der Status. Keine Terrain-ID, kein Biom, keine Fundorte, kein Regionsstand und keine Einheiten.
- **explored**: bekannte geografische Basis, aber keine nur aktuell sichtbaren dynamischen Ereignisse.
- **visible**: bekannte geografische Basis plus aktuell vom Spielserver freigegebene Einheiten/Ereignisse.

Die `visible`-Koordinaten müssen vom *vertrauenswürdigen Spielserver*
berechnet werden. Die externe Browseranfrage darf weder `player_id` noch
`visible` frei wählen. Besonders wichtig: Es reicht nicht, unbekannte
Grafiken mit dem Canvas-Nebel zu überdecken. Der Server muss bereits vor
dem Versand die unbekannten **Rasterpixel** und verborgenen Objekte aus
Tile-Bilddateien entfernen. Eine 512er-Grafikkachel kann bekannte und
unbekannte Hexfelder mischen.

Zusätzlicher Laufzeitstatus **visible-but-loading** gehört zum Tile-Client:
Auch vollständig erlaubtes Terrain bleibt unter opaken Wolken, bis das
passende Raster fertig geladen ist, anschließend weiche Einblendung.

## Lokaler Test mit vorhandenem Geografieexport

```bash
python world_region_pipeline.py --db data/vedras_world.sqlite import \
  --world vedras-main --file world_export.json \
  --content-version content-v1 --region-size 16

python world_region_pipeline.py --db data/vedras_world.sqlite discover \
  --world vedras-main --player alice --q 0 --r 0

python world_region_pipeline.py --db data/vedras_world.sqlite view \
  --world vedras-main --player alice --q 0 --r 0 --visible

python -m unittest discover -s tests -p 'test_persistent_world_store.py'
python -m unittest discover -s tests -p 'test_world_region_pipeline.py'
```

`import` akzeptiert `version: "geography-v2.1.0"` oder
`generatorVersion` sowie `seed` und `cells` aus dem bestehenden
Geografieexport. Neue Generatorversionen sind zulässig, solange der Seed und
die Weltkoordinaten unverändert bleiben und jede entdeckte Ausgangsbasis
erhalten bleibt.

`--allow-updates` ist für absichtliche Veröffentlichungen bestehender,
unentdeckter Regionen erforderlich. Sämtliche betroffenen Regionen werden
zuerst auf Revision und Discovery-Konflikte geprüft (Dry-Run) und danach
nacheinander gespeichert. **Ein Import mehrerer Regionen ist noch keine
einzige globale Datenbanktransaktion.** Bei einer gleichzeitigen
Bearbeitung könnten erfolgreiche frühere Regionen bereits veröffentlicht
sein, wenn später ein Konflikt auftritt. Die archivierten Revisionen erlauben
eine sichere Rücksetzung, soweit keine Entdeckungen dagegenstehen.

## Architekturanschluss an den Renderer

1. Ein zukünftiger authentifizierter Weltserver löst Nutzeridentität und
   Spielersichtweite aus der Spielsitzung auf.
2. `player_view` liefert ausschließlich genehmigte Hexdaten.
3. Eine autorisierte Tile-Publishing-Pipeline erzeugt Bilder **ohne**
   Informationen aus unbekannten Hexen und verwendet
   `world_id / region coordinates / region_revision / imagery_revision`
   als Cache-Versionierung.
4. Der Browser bekommt Sichtbarkeitsmasken und Kachelreferenzen, nie rohe
   versteckte Weltdateien.
5. Der v0.21.1-Fog legt Wolken über `unknown` und `loading`; `explored`
   bleibt gedämpft, `visible` bleibt klar und blendet geladene Grafiken ein.
6. Straßen, Armeen und andere veränderliche Zustände liegen oberhalb der
   eingefrorenen Weltbasis und dürfen diese nicht überschreiben.

## Noch offen vor einem echten Multiplayer-Release

- Authentifizierung, serverseitig berechnete Sichtweite, kontrollierte
  Entdeckungsereignisse und ein dafür entwickeltes HTTP/WebSocket-Protokoll.
- Tile-Publishing mit garantierter Geheimhaltung auch bei Kacheln, die
  bekannte und unbekannte Hexfelder schneiden.
- Großräumige Geografieplanung, river-network-Anschlüsse und tatsächliche
  Prüfung der `edge_constraints` über Regionsgrenzen hinweg.
- Ein gemeinsamer atomarer Batch-Publisher für sehr große Weltupdates,
  Backups und Migrationen für einen produktiven Online-Server.
- Integration des SQLite-Stores in den bestehenden Editor und in den
  späteren Spielserver; der lokale Asset-Labor-Server führt derzeit
  **keine** multiplayer-seitigen Datenoperationen aus.

Die Weltarchitektur ist damit konkret als persistente interne Datenbasis
implementiert, aber noch nicht als öffentlich zugängliches Onlinespiel
bereitgestellt.
