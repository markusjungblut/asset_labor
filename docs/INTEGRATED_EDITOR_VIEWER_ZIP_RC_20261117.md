# Gemeinsamer Integrationskandidat – Editor, Spielkarte und ZIP-Wiederherstellung

**Stand: 17.11.2026 · Draft, nicht gemergt.** Branch `integration/vedras-combined-map-zip-rc-20261117`, **Basis aktuelles `main`** inklusive Geografie v2.1.1. Dieser Stand integriert die bereits separat geprüften Drafts [#143](https://github.com/markusjungblut/asset_labor/pull/143) (Asset-Labor-UI, Frozen-Viewer, opt-in 1×-Cache) und [#146](https://github.com/markusjungblut/asset_labor/pull/146) (lesender ZIP-Prüfer, expliziter neuer-Szene-Import, IndexedDB-/Firefox-Regression). Kein fremder historischer Branch gemergt, stattdessen überprüfte Snapshots mit identischen ursprünglichen Base-Versionen gezielt auf aktuellem main abgebildet.

## Gezielt aufgelöster Konflikt mit neuer Geografie

Der aktuelle `main`-Commit `9cb2423` hat Geografie 2.1.1 aktualisiert und `index.html` angepasst. Der ältere UI-Draft enthielt noch die Script-Referenzen `worldgen-geography.js?v=2.1.0` und `app.js` ohne den Parameter `geography=2.1.1`. Im gemeinsamen Branch übernimmt `index.html` **beide** neuen Geografie-Referenzen und behält **gleichzeitig** `ui-organizer.js?v=0.35.0&cleanup=20261112` sowie die korrigierten UI-Defaults. `app.js`, `geography-lab.js`, `worldgen-geography.js`, `geography-lab.html`, die aktualisierten Geografie-Tests und die dazugehörigen Dokumente kommen unangetastet aus aktuellem `main`.

## Automatisierte Tests in einer einzigen Codebasis

- UI-Workflow: Native Editor↔Viewer-Verträge, UI-Default-/Cache-Flags, eigener DOM-Firefox-Smoke **und** vorhandene Geografie-2.1.1-Regression.
- Frozen-Map-Workflow: Vorhandene Renderer-Node-Tests und synthetischer 120-Kachel-Firefox-Smoke samt 1×-Cache aktivieren/deaktivieren.
- ZIP-Workflow: ZIP32-Metadaten, interne PNG-Chunk-CRCs, neue Ziel-Szenenkennung, tokengebundener Rollback, synthetischer Firefox-IndexedDB-Import und Wiederöffnung im Standalone-Viewer; zusätzlich neuer **Editor/Geografie/ZIP/Viewer-Vertragstest**.
- Alle Tests arbeiten nur mit synthetischen Karten beziehungsweise Root-Quelldateien; es werden **keine** privaten PNG-/ZIP-/Browser-Originaldaten in CI kopiert.

## Noch harte Freigabegates

1. **Alle drei CI-Workflows** auf genau diesem kombinierten Code-Commit müssen grün sein. Tests auf getrennten Drafts genügen nicht.
2. Reale Windows-Abnahme auf dem bereits gespeicherten `v1-0374527a` unter der *gleichen* Firefox-Origin `http://127.0.0.1:8780`: Kalt-RAM, 1×-Vorwärmung, scharfe 2×-Bildnachladung, Tile-/Fog-/Küsten-/Waldränder, längeres Schwenken/Zoomen, Stabilität des Speicherbudgets.
3. **ZIP-Import** zuerst ausschließlich mit *kleiner eigens erzeugter Testkarte*, nicht mit dem privaten großen Atlas: neuer Szenenname, Neustart über das gesamte Firefox-Profil, Importfehler, Fortbestehen der alten Originalkarte und Speicherlimit. Browser-Page-Reload wurde bereits synthetisch getestet; Profilneustart noch nicht.
4. Große Karten, 600-MB-ZIP, unterbrochene Browserimporte und lokale Fog-Berechtigungen sind weitere eigene Gates. Kein Import-ZIP darf jemals serverseitige Multiplayer-Fog-Freigaben erteilen.
5. **Keine öffentliche Produktverlinkung** auf `static-map-import.html`, keine Default-Aktivierung von `fallbackAtlas` oder den vier alten Optimierungsschaltern und **kein Merge nach `main`**, bevor die vorstehenden Gates kontrolliert freigegeben sind.

**Operativer Schutz:** Keine `git reset --hard`, `git clean`, `git stash`, keine Änderungen am lokalen uncommitteten Windows-Hauptordner. Die separaten Drafts bleiben für Diagnose und Rollback erhalten.
