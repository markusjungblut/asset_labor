# Schritt 25AC – ZIP-Wiederherstellung als neue Browserkarte

**Stand: 17.11.2026.** Experimenteller Draft; baut ausschließlich auf dem [read-only ZIP-Vorprüfer #144](https://github.com/markusjungblut/asset_labor/pull/144) auf. **Keine Änderungen an `main`, der vorhandenen Karte `v1-0374527a` oder dem ursprünglichen ZIP.** Die bereits getrennt geprüfte UI-/Renderer-Integration bleibt [Draft #143](https://github.com/markusjungblut/asset_labor/pull/143).

## Implementierter Ablauf

Eine separate Seite `static-map-import.html` liest auf ausdrücklichen Dateiauswahl-Klick zunächst nur ZIP-Metadaten und das Manifest (wie #144); auf dem normalen Asset-Labor und im Standalone-Viewer ist sie **nicht verlinkt**, damit sie nicht unbeabsichtigt als freigegebene Produktfunktion verwendet wird. Sie zeigt Herkunfts-Szenen-ID, Detailgrad, erwartete/exportierte Tile-Zahl, Layer-Zahl, Dateigröße und Vollständigkeit an. Eine zweite Aktion verlangt **explizite Bestätigung** und bei unvollständigen Karten nochmals eine Zustimmung zum Teilkartenimport.

`static-map-zip-importer.js` stellt `restore(file,{confirmed:true})` bereit. Der Import bekommt immer eine **neue kryptografisch zufällige `v1-xxxxxxxx`-Szenen-ID**, nie die ursprüngliche Quell-Szenenkennung. Der vorhandene `vedras-frozen-world-v1`-IndexedDB-Store (`tiles`, Schema 1) wird ohne Datenbankmigration genutzt. Die neu erzeugte Szenenkennung wird in einer `readwrite`-Transaktion kollisionsfrei als `scene|import-pending` reserviert; bestehende oder bereits reservierte Szenennamen sind damit gesperrt. Jede Quelldatei wird per CRC32 und PNG-Signatur geprüft, bevor das betreffende Tile in einer eigenen `add`-Transaktion gespeichert wird – kein vorhandener Datensatz wird per `put` überschrieben. Bis zur letzten Schicht ist nur die unveröffentlichte `import-pending`-Markierung vorhanden.

**Erst wenn alle Kacheln erfolgreich angelegt wurden**, legt eine einzelne Transaktion das `scene|manifest` im bekannten Standalone-Viewer-Schema an und entfernt die Pending-Markierung. Das Ziel ist damit erst nach dem letzten erfolgreichen Tile im Viewer auffindbar. Bei einem erkannten Fehler rollt `rollback(scene,token)` ausschließlich die mit dem **exakten Import-Token** gekennzeichneten Einträge des neuen Szenenpräfixes zurück. Aus einem Browserabsturz können unveröffentlichte Restdaten bleiben; **es gibt absichtlich keinen automatischen Scan, der fremde Szenen bereinigt oder löscht**. Vor einem zukünftigen allgemeinen Release gehört eine dedizierte, vom Nutzer bestätigte Wiederherstellung/Bereinigung solcher Reste auf die Roadmap.

Im Erfolgsfall erhält der Nutzer den Link `frozen-map-game.html?scene=<NEU>&lod=<LOD>`. Der Original-Atlas bleibt unabhängig und unter seiner bisherigen Szenenkennung weiter lesbar. ZIP-Import berechnet keine Terrain-Landschaft neu; abgeleitete 1×-/2×-Cachebilder kann der Viewer danach nach Bedarf separat erzeugen.

## Tests und Grenzen

- Tests gegen **den unveränderten Exporter** `frozen-map-package.js`, den Vorprüfer #144 und den neuen Importer mit isoliertem synthetischem Store. Sie decken eine korrekte Wiederherstellung, Quelle/Ziel-Trennung, bereits belegte Zielkennung, absichtlichen Quota-Fehler in der zweiten Kachel, Commit-Fehler, beschädigte spätere PNG-Datei, unvollständigen Export, fehlende Bestätigung, ungültige Hex-Geometrie und Progress-Callbacks ab.
- Sparse Node-22-CI erweitert den bestehenden ZIP-Vorprüfworkflow. **Bis zur echten Browser-IndexedDB-Regression** darf diese Abnahme noch nicht als vollständige Persistenzprüfung gelten. Ebenso **keine** Aussage über eine etwa 600 MB große reale Datei, Browser-Speicherplatz oder das Öffnen der Originalkarte.
- Im Manifest werden Hex-Geometrie und lokale Sichtbarkeits-Previewzustände für die **lokale Testkarte** gespeichert, nicht als Multiplayer-Autorisierung. Nur die explizite Export-Policy `local-test-all-authored; multiplayer requires server Fog` wird angenommen; für Multiplayer bleibt serverseitige Sichtfilterung Pflicht.
- Strikte Schutzmaßnahmen: `confirmed:true`, `add` statt `put`, atomare Reservierung, Manifest zuletzt, tokengebundene begrenzte Rollback-Löschung, prüfpflichtige PNG-Dateien, keine Re-Bake-Worker, keine stillen Status-Migrationen, kein inkrementelles Überschreiben der vorhandenen Szenen.
- Gezielte Browser-Abnahme in einem **frischen synthetischen Firefox-Profil** und anschließend separat auf Windows mit einer **Kopie** eines kontrollierten kleinen ZIP-Archivs. Den originalen 600-MB-Atlas **nicht** zum Ersttest verwenden. Bei jedem Test im bestehenden Profil: Origin/Port beachten (`127.0.0.1:8780`), keine Browserdaten löschen, Originalszene nie als Ziel verwenden.

## Offener Freigabeblock

1. Node-CI und ein echter Firefox-IndexedDB-Test des frisch importierten Mini-Atlas: Import → neues Manifest → zwei fertige Tile-Records → eigenständigen Viewer auf neuem `scene` öffnen → Browserneustart → dieselbe Karte lesbar → Originalszene weiterhin unverändert.
2. Fehlerfälle mit echten `QuotaExceededError`/unterbrochenem Import; versteckte, nicht veröffentlichte Reste ohne Löschen der Hauptkarte behandeln.
3. Große ZIP-Dateien hinsichtlich Speichernutzung, CPU/CRC, Speicherkapazität und Browser-Transaktionsdauer; bei Bedarf explizite Abbruch-/Fortsetzen-Funktion. Unvollständige Atlas-Dateien sind weiterhin keine fertigen Karten.
4. Fog-Sicherheitsmodell strikt von dieser lokalen Singleplayer-Archivfunktion getrennt halten. Kein Multiplayer-Client darf seine Sichtbarkeit aus dem Import-ZIP ableiten.
5. Erst nach diesen Prüfungen darf diese separate Importseite sichtbar mit Editor/Spielviewer verlinkt oder ein Merge vorgeschlagen werden.

**Dieser PR ist bewusst eine noch nicht freigegebene Implementierung**, nicht der Nachweis, dass die vorhandene 600-MB-Karte erfolgreich importiert wurde.
