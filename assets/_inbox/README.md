# Vedras Asset-Inbox (ChatGPT Plus / RigForge / Ludo.ai)

Neue **transparente Einzel-PNGs** einfach in den passenden Unterordner legen und danach **`IMPORT_CHATGPT_INBOX.bat`** doppelklicken (läuft komplett auf CPU – keine NVIDIA-GPU nötig!):

```text
assets/_inbox/
├── sites/
│   ├── watchtower_ruin/      -> watchtower_ruin_01.png .. watchtower_ruin_05.png
│   ├── forgotten_iron_mine/  -> forgotten_iron_mine_01.png .. 05.png
│   ├── abandoned_house/      -> abandoned_house_01.png .. 05.png
│   ├── dilapidated_barn/     -> dilapidated_barn_01.png .. 05.png
│   ├── waterhole/            -> waterhole_01.png .. 05.png
│   ├── oasis/                -> oasis_01.png .. 05.png
│   ├── obelisk/              -> obelisk_01.png .. 05.png
│   ├── stone_circle/         -> stone_circle_01.png .. 05.png
│   └── iron_deposit/         -> iron_deposit_01.png .. 05.png
├── buildings/
│   ├── centers/              -> outpost.png, settlement.png, city.png, metropolis.png, capital_t1.png ...
│   └── tier1/                -> farm_t1.png, lumber_camp_t1.png, quarry_t1.png, watchtower_t1.png, fortress_t1.png ...
├── decals/                   -> neue Boden-Decals (Steingeröll, Laub, Blumen, Büschel)
├── nature/                   -> neue Bäume, Sträucher, Felsen
└── actors/
    ├── fauna/                -> horizontale Sprite-Strips (4/8/12/16 Frames, z. B. deer.png, horse.png, sheep.png)
    └── units/                -> horizontale Einheiten-Strips (army, scout, merchant ...)
```

**Was `IMPORT_CHATGPT_INBOX.bat` automatisch erledigt:**
1. Prüft echte Transparenz (rettet versehentliche weiße Hintergründe automatisch per `--auto-key-bg` & säubert Ränder per `--auto-defringe`).
2. Misst die **Lichtrichtung** (rechte vs. linke Objekthälfte) und spiegelt links-beleuchtete Sprites per `--auto-flip-light` automatisch auf **Vedras-Rechtslicht (142°-Schatten)** *(horizontale Animations-Strips unter `actors/` werden bewusst NICHT gespiegelt)*.
3. Erzeugt einen visuellen Prüf-Kontaktbogen `assets/_inbox/_qa_*.png` inkl. Ankerkreuz & Schatten-Vorschau.
4. Baut die WebP-Atlanten automatisch neu und synchronisiert sie ins `browsergame`!

**Vollständige Prompt-Vorlagen & ChatGPT-Projekt-Einrichtung:** siehe `browsergame/docs/graphics/CHATGPT_ASSET_WORKFLOW.md`.
