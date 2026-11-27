# Vedras Reiche – Roh-Grafik-Archiv (`asset_labor`, Option 1)

Dieses Repository ist seit der **P4b-/Option-1-Konsolidierung** das schlanke, reine **Roh-PNG- & Katalog-Archiv** von *Vedras Reiche*.

Sämtlicher ausführbarer Code — **WebGL2 Asset-Studio**, **Geografie-Labor**, **WebP-Export-Pipeline** und **ChatGPT-Inbox-Importer** — lebt ab sofort zentral im Haupt-Repository **`browsergame/tools/asset-studio/`**, damit es nur noch **ein** Entwicklungs-Repo ohne Doppel-PRs gibt und `browsergame/.git` dauerhaft bei ~21 MB bleibt.

## Inhalt dieses Archivs

- **`assets/`** — alle originalen Roh-PNGs & Kataloge (100 % erhalten):
  - `assets/terrain/` + `terrain_catalog.json` (31 Terrain-Typen)
  - `assets/nature/` + `nature_catalog.json` (Bäume, Büsche, Felsen, Berge, Boden-Decals)
  - `assets/shadows/` + `sprite_shadow_profiles.json` (278 Schattenprofile inkl. 155 handgemalter Polygone)
  - `assets/walls/` (Palisade v5, Steinmauern v7, Stein- & Palisadentore v1)
  - `assets/bridges/`, `assets/buildings/`, `assets/sites/`, `assets/actors/`, `assets/clouds/`, `assets/shorelines/`
  - `assets/icons/` (721 Roh-Icon-PNGs für M26 & Basis-UI)
  - `assets/_inbox/` (Ablageordner für neue ChatGPT-/RigForge-PNGs)
- **`plans/`** — Art-Planungs-JSONs (`terrain_asset_plan.json`, `sprite_catalog_plan.json` usw.)
- **`docs/ICON_INVENTAR.md` & `docs/ICON_KATALOG.csv`** — Roh-Icon-Bestandsliste

## Benutzung (gewohnter Doppelklick funktioniert weiter!)

Voraussetzung: `browsergame` und `asset_labor` liegen nebeneinander im selben Oberordner:

```text
<projektordner>/
├── browsergame/     <-- Haupt-Repo (Spiel, WebGL2-Engine, Asset-Studio & Skripte)
└── asset_labor/     <-- Dieses Roh-Grafik-Archiv (assets/)
```

- **WebGL2 Asset-Studio starten:** Doppelklick auf `START_WINDOWS.bat` (oder `browsergame\tools\asset-studio\START_STUDIO_WINDOWS.bat` bzw. `npm run studio` in `browsergame/`).
- **Neue ChatGPT-PNGs importieren:** Bilder in `assets\_inbox\...` ablegen → Doppelklick auf `IMPORT_CHATGPT_INBOX.bat` (baut die WebP-Atlanten direkt nach `browsergame\public\game-assets\`).
