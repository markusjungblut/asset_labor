# Karten-ZIP: sichere Import-Vorprüfung ohne Schreibzugriff

**Stand: 17.11.2026 · Draft, keine Importfunktion freigegeben.**

Dieses Modul ist eine unabhängige Vorarbeit zu [Issue #103](https://github.com/markusjungblut/asset_labor/issues/103). Das vorhandene `frozen-map-package.js` exportiert ein klassisches **ZIP32-Archiv mit STORE-Einträgen** (PNG-Dateien ohne zweite ZIP-Kompression), zentralem Verzeichnis, CRC32 und `manifest.json` mit `schemaVersion:1`, `format:"vedras-static-game-map"`, `scene`, `level`, `complete`, `expectedTiles`, `exportedTiles`, `cells`, `initialPose` und `tiles/layers`.

## Jetzt implementiert

- `static-map-zip-inspector.js` stellt `window.VedrasStaticMapZipInspector.inspect(file)` bereit. Die Funktion prüft EOCD und zentralen ZIP-Index, STORE-Format, verbotene Flags, Pfade, Duplikate, ZIP-Grenzen, CRC des Manifests und die referenzierten Layer-Pfade/-Größen. Ein unvollständiges Manifest wird **nicht** stillschweigend als vollständig behandelt. Erlaubt sind nur `manifest.json` und `tiles/{near|mid|far}/{x}_{y}.{n}.png`; keine Pfad-Traversierung, versteckten Zusatzdateien oder verschlüsselten/komprimierten Einträge.
- Nur **ZIP-Endverzeichnis, Central Directory und Manifest** werden während `inspect()` vollständig gelesen; PNG-Payloads bleiben als `Blob.slice()` ungelesen. Eine private 600-MB-Karte wird dadurch **nicht** vollständig in den JavaScript-Speicher kopiert.
- Erst `result.verifyLayer(path)` prüft das gewünschte individuelle PNG blockweise auf ZIP-CRC32 und PNG-Signatur; es gibt anschließend ausschließlich einen `Blob`-Slice zurück, **keinen Storage-Write**.
- Sicherheitsgrenzen sind ausdrücklich gesetzt (ZIP32-Maximum, zentraler Index 16 MiB, Manifest 32 MiB, 60.000 Einträge, 30.000 WorldTiles, 200.000 Zellen, einzelne PNG-Layer maximal 512 MiB). Sie sind eine erste konservative Schutzschicht, **keine** Aussage über verfügbare Festplattenkapazität beim späteren Import.
- Synthetische Node-Tests prüfen erfolgreiches Lesen, Teilkarten-Status, unzulässige Metadaten, Kompressions-/Verschlüsselungs-Flags, CRC-Fehler, PNG-Signatur sowie die Begrenzung gelesener Daten. Eine separate sparsame CI führt **nur** diese Tests aus; keine Bildarchive, Playwright, Firefox oder Pixel-Bakes.

## Noch explizit NICHT vorhanden

**Kein** `IndexedDB.put`, ZIP-Auswahlmenü, Kartenbibliothek, Import-/Rollback-Transaktion, Überschreibungsschutz oder tatsächliche Rücksicherung des 600-MB-Originalarchivs. Für die spätere Implementierung müssen wir *atomar* neue Ziel-Szenenkennungen/Importmarker verwenden, Einträge schrittweise auf korrektes PNG prüfen, Speicherplatzfehler sauber rückrollen und das abschließende lesbare Manifest **erst nach vollständigem Erfolg** veröffentlichen. Das vorhandene `v1-0374527a` darf dabei nicht verändert werden. Bei `complete:false` muss der Import als Teilkarte gekennzeichnet bleiben.

**Multiplayer-Fog:** Das lokale Testmanifest enthält `visibilityPolicy:'local-test-all-authored; multiplayer requires server Fog'`. Daraus dürfen **keine** Sichtberechtigungen für spätere Multiplayer-Clients abgeleitet werden. Eine serverseitig autorisierte Sichtfilterung ist ein eigener Freigabeblock.

## Prüfkommando

```bash
node --test tests/test_static_map_zip_inspector_20261117.cjs
```

Der Code wird noch **nirgends** in die bestehende Spieleroberfläche eingebunden. Laufzeit und Speicherzustand der aktiven Originalkarte bleiben unverändert. Erst nach bestandener CI und unabhängiger Prüfung planen wir die schreibende Importphase auf einem separaten Draft.
