# Semantische Spielkarte: Speichern, Wiederöffnen, Viewer und ZIP

Stand 18. November 2026 · **Draft nach PR #149** · lokale Originalkarte nicht verändert.

## Problem und Bestand
- `worldgen-geography.js` liefert deterministische Landschaft, Klima, Relief und Flüsse. Das Geografie-Labor überträgt davon derzeit einen **7–397-Hex-Ausschnitt** in den Asset-Labor-Editor, nicht eine ganze 60.000-Hex-Welt.
- Der frühere Editor-JSON-Export enthielt Zuordnungen, **aber nicht alle tatsächlich generierten `worldCells`**. Der JSON-Import erzeugte stattdessen zunächst eine Demo-Karte und restaurierte nur bestimmte Wasser-Terrains. Dies war kein verlustfreier Weltstand.
- Das bisherige Frozen-Manifest enthält Hex-Geometrie, LOD, Kamera und PNG-Layer – genug für das Bild, aber nicht für Terrain-IDs, Relief, Spiel-/Ressourcenlogik oder den ursprünglichen Generator.
- Die alte reale Szene `v1-0374527a` enthält keine unabhängige, verlässlich vollständige semantische Weltbeschreibung. Keine erzwungene Migration oder Ground-/Shadow-Neukodierung.

## Neues additives Modell
1. **Worldgen / Authoring**: `authoredSceneSnapshot()` speichert das tatsächliche Array `worldCells` mit `q/r`, optionalen `worldQ/worldR`, Biomen, Terrain-IDs, Relief, Features und Klima. Enthält außerdem alle bisherigen Editor-Zuordnungen (Natur, Berge, Schatten, Wege, Flüsse etc.) sowie `geographySource` mit Generatorversion, Seed, Parametern, Größe und Ursprung. Dieses Format ist `vedras-asset-labor-scene-0.8`, `schemaVersion:3`.
2. **Unveränderliches World-Record**: Unter `<scene>|world` in der **bestehenden** IndexedDB `vedras-frozen-world-v1`. Append-only; Wiederholung mit identischen Daten ist erlaubt, abweichende Daten unter derselben Kennung werden zurückgewiesen. Andere Schlüssel, Original-PNGs und bestehende IndexedDB-Struktur bleiben unverändert.
3. **Render-Atlas**: Wie zuvor `<scene>|manifest` und `<scene>|near|<tileId>` etc. Speicherung vollständiger Ground-/Scenery-PNGs, auch für bestehende scenery-only-Nachfolger mit Ground-Referenz. Keine semantischen Weltdaten in jeder Bildkachel.
4. **Laufzeit**: Der Standalone-Viewer liest Manifest und Bildkacheln wie bisher. Semantische Daten werden nur beim Klick auf **Hexwelt-Daten** geladen; dieser Zugriff ist weder im `requestAnimationFrame`-Loop noch im normalen Startpfad.
5. **Dynamik**: Spieler, Städte, Einheiten, Fog-of-War-Sichtbarkeit, Besitz und Bauaufträge gehören nicht in diesen eingefrorenen Weltstand. Für Multiplayer muss der Server die Informationsfreigabe autorisieren.

## Bedienung
- Geografische Welt im Geografie-Labor generieren und in die Testszene übernehmen. Seed, Worldgen-Konfiguration und die **konkreten übertragenen Zellen** bleiben gespeichert.
- Beim manuellen Erfassen oder bei **Gesamte Karte einmalig als Spielkacheln vorbereiten** wird zuerst die Weltbeschreibung append-only gespeichert, dann das Manifest und die fertigen PNG-Kacheln. Fehlt ein PNG, bleibt die Teilkarte als unvollständig erkennbar.
- Im Editor im Bereich **Spielkarten-Test** eine Kartenkennung eingeben:
  - **Gespeicherte Hexwelt im Asset-Labor öffnen**: tatsächliche Weltzellen und Einstellungen ohne Weltgenerierung restaurieren. Der Vorgang ersetzt die Arbeitsansicht **erst nach Bestätigung**.
  - **Gespeicherte Karte direkt im schnellen Viewer öffnen**: auch für alte reine Bildatlanten. Stellt keine Editor-Restaurierbarkeit in Aussicht.
- Ein exportiertes `vedras_scene.json` enthält jetzt ebenfalls die tatsächlichen `worldCells`; `sceneImport` versteht die neue v3-Version und behält die alten v0.6–v0.8-Importe bei.
- Der ZIP-Export enthält bei neuen Karten zusätzlich das Feld `authoredWorld` in `manifest.json`. Das alte ZIP-Schema bleibt Version 1; reine Bildatlanten bleiben lesbar. Der read-only ZIP-Inspector validiert die semantischen Daten und exakte Übereinstimmung der Hex-Koordinaten. Der Importer veröffentlicht World-Record und Manifest **in derselben IndexedDB-Schreibtransaktion** unter einer neuen Szenen-ID.

## Identitäten und Datenmigration
- Der Autoren-Fingerprint wird für **neue** Szenen auf `game-map-export-renderer-v4-semantic-world` angehoben und berücksichtigt den Generator-Ursprung. Das verhindert, dass bestehende v3-Bildatlanten stillschweigend als semantisch vollständig gelten.
- Alte `v1-0374527a`-PNGs bleiben unter ihrer eigenen ID erreichbar. Die Änderungen von PR #149 an Schatten und River-Readiness sind weiterhin Voraussetzung; sie ändern alte PNGs nicht rückwirkend.
- Die neue Welt ist **ein lokaler Snapshot**, kein mit der Quelldatei synchronisiertes Bearbeitungsobjekt. Änderungen am Editor erfordern ein neues Atlas-Fingerprint und eine gezielte neue Backrunde.
- Die ZIP-Restore-ID ist zufällig und kann sich von einer beim erneuten Export erzeugten Autoren-ID unterscheiden. Die vorhandene Atlas-ID ist jederzeit direkt im Viewer aufrufbar.

## Performance, Prüfungen und Grenzen
- Kein zusätzlicher Worldgen-/Terrain-/PNG-Decode pro Viewer-Frame. Das World-Record wird nur bei ausdrücklichem Capture/Import oder manueller Hexdaten-Inspektion gelesen.
- Das Format begrenzt neue Hex-Snapshots auf 60.000 Zellen und 28 MiB für den serialisierten Weltstand; das ZIP-Manifest darf insgesamt 32 MiB groß sein. **Sehr große Welten brauchen später mehrere semantische Sektorpakete** statt einer einzigen Manifest-JSON.
- Node-Regression `tests/test_persisted_authored_world_20261118.cjs`: gültige/ungültige Zellen, append-only, separates Laden, ZIP-Inspektion, staging publish und fauler Viewer-Lesezugriff. Nicht mit echtem Atlas ausgeführt.
- Browser-Smokes der bestehenden Frozen-/ZIP-CI erhalten die neue Moduldatei in Sparse-Checkout und Server-Allowlist. Kein Originalatlas und keine privaten Firefox-Profile in CI.

## Abnahmekriterien (noch offen)
1. GitHub-PR-CI für neue und bisherige Tests grün; vor Merge eventuelle Test-/Integrationsfehler korrigieren.
2. Frisches Firefox-Profil: 397-Hex-Geografie generieren, Schatten/Flüsse/Natur platzieren, vor Backen Editor-JSON sichern; Near-Atlas vorbereiten; Editor per `<scene>|world` rekonstruieren; semantische Hex-Diff vergleichen.
3. ZIP exportieren, in **neuem** Browserprofil importieren, gleiche Weltinformationen erneut öffnen. Verifizieren: keine vollständige Neugenerierung, keine Änderungen an bestehendem Archiv, keine fehlenden Tile-Layer.
4. Original-Windows-Profil: alten `v1-0374527a`-Atlas direkt öffnen; PR #149 neue Schatten-/Chunknaht-/Flusskorrekturen getrennt A/B abnehmen und Performance-JSON vergleichen. **Kein automatisches River-only-Rebake ohne alpha-aware Diagnose.**
5. Erst nach diesen Checks für 15k+ Hex eine sektor-/chunkweise semantische Weltpersistenz und differenziellen statischen Tile-Bake planen. Die aktuelle editorseitige Gesamtberechnung ist auf kleine Testkarten ausgelegt.

## Risiko / Rollback
- Nur Feature-Branch, keine automatische Migration und kein Löschpfad. Bestehende `scene|manifest` und `scene|near|tile` bleiben unverändert.
- Alte ZIP-Archive werden ohne `authoredWorld` wie bisher importiert. Neue Archivdaten müssen vor Schreibbeginn durch Inspector und Vertrag.
- Bei Regression den Branch nicht mergen; die ursprüngliche 4×-Bildwelt bleibt unabhängig nutzbar.
