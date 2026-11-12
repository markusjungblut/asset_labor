# Windows-Ergebnisprotokoll – Frozen-Viewer Originalkarte (Vorlage)

**Diese Datei ist eine Vorlage, kein bereits absolvierter Test.** Nicht mit synthetischen Firefox-Messwerten aus CI ausfüllen.

## Laufumgebung

- Datum/Uhrzeit / Prüfende: **OFFEN**
- Prüfende Git-SHAs: `main`: ___ · Kandidat: ___ · lokal uncommittet / separate Sicherung: ___
- Szenenkennung und Manifest (Level, gespeicherte Tile-Zahl, vollständiges Atlasmanifest): ___
- Original-ZIP SHA-256 vorher/nachher (identisch?): ___ / ___
- Browser/Version, Profil, Origin (Hostname + Port), Windows-Version, GPU/Treiber: ___
- Viewport CSS, Canvas Backing-Pixel, OS-Skalierung, DPR, Zoom-Hysterese, RAM-Budget: ___
- Derived 1×/2× bereits persistiert? Konvertierungen vor/nach: ___
- `sampleLimit.droppedFrames` / `droppedTiles` (beide 0 pro gültigem Intervall?): ___
- Fehler/Status sichtbarer Tiles vor/nach: ___
- Warme Zielbereiche / tatsächlich vorhandene Hex-/Tile-IDs: ___

## A/B-Messung – pro Feature und Szenario eine Zeile

| Szenario / Modus | Block/Fahrt | p50 `frameGapMs` aktiv | p95 `frameGapMs` aktiv | p95 `drawMs` | Sichtbar-ready Zeit | Δ `visibleReadStarts` | Δ `decodeRepeats` | Δ `evictions` | Peak `decodedPixels` | Fehler/Fog/Seams |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| warm pan / A | ABBA-1 | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| warm pan / B | ABBA-1 | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| return pan / A | ABBA-2 | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| return pan / B | ABBA-2 | offen | offen | offen | offen | offen | offen | offen | offen | offen |

**Feature einzeln kontrollieren**: `lodRecency` 0/1 · `leadPrefetch` 0/1 · `visibleBorrow` 0/1 · `parallelDecode` 0/1. Referenz `main` separat, identische Szene, gleiche Displaybedingungen. Mehr Zeilen pro Szenario ergänzen.

## Funktionale Screenshots

- Wald/Schatten/Scenery-Overhang, identische Kamera/Zoom/LOD, A vs. B: **OFFEN**
- Küste/Land/Wasser-Kachelnaht, identische Kamera/Zoom/LOD, A vs. B: **OFFEN**
- Fog-Grenze/unbekannte Hexe während Nachladen und danach, A vs. B: **OFFEN**
- LOD-Swap 1×→2×→1× ohne Bildloch, vorher/während/nachher, A vs. B: **OFFEN**

## Rohdaten / Ergebnis

- Lokaler Pfad der umbenannten `vedras_profile_*.json`: ___
- Firefox-Performance-Traces (GPU/Frame-Present separat interpretiert): ___
- RAM- und Persistenzwerte nach ≥5 Minuten + Ruhephase: ___
- Sichtbare Pending-Reads nach 60 s / dauerhaft hängende Anfragen: ___
- Unterschied zwischen CPU-`drawMs`, aktivem `frameGapMs` und Browser-Präsentationszeiten beschrieben? ___
- Ergebnis je Schalter: `lodRecency` **OFFEN** · `leadPrefetch` **OFFEN** · `visibleBorrow` **OFFEN** · `parallelDecode` **OFFEN**
- Funktionale Gate-Blocker: ___
- Entscheidung **GO / CONDITIONAL / NO-GO** und explizite Mergefreigabe: **NO-GO, bis reale Messungen vorliegen**
