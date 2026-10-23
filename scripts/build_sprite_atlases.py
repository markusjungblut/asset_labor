#!/usr/bin/env python3
"""Deterministic offline sprite atlas builder for Vedras Reiche.

Requires Pillow: python -m pip install Pillow
Run: python scripts/build_sprite_atlases.py [--assets assets] [--out atlases]

No source PNG is changed. Transparent bounding boxes are trimmed. Two
resolution tiers (desktop 1024, mobile 512) and extruded page gutters are
generated as ordinary static PNG + JSON files, suitable for HTTP caching.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

KINDS = ("nature", "buildings", "units")
TIERS = {"desktop": 1024, "mobile": 512}
PAGE = 2048
GUTTER = 2
SCHEMA = 1


def fingerprint(paths: list[Path], root: Path) -> str:
    digest = hashlib.sha256()
    digest.update(f"vedras-atlas-v1:{PAGE}:{GUTTER}:{TIERS}".encode())
    for path in paths:
        digest.update(path.relative_to(root).as_posix().encode("utf-8"))
        digest.update(b"\0")
        with path.open("rb") as original:
            for block in iter(lambda: original.read(1024 * 1024), b""):
                digest.update(block)
        digest.update(b"\0")
    return digest.hexdigest()


def bbox_rgba(source: Image.Image) -> tuple[int, int, int, int]:
    rgba = source.convert("RGBA")
    alpha = rgba.getchannel("A")
    # Alpha > 1 keeps semitransparent antialiasing; fully transparent pads go.
    return alpha.point(lambda v: 255 if v > 1 else 0).getbbox() or (0, 0, 1, 1)


def trimmed(path: Path, longest: int, available: int) -> tuple[Image.Image, dict]:
    with Image.open(path) as source:
        rgba = source.convert("RGBA")
        width, height = rgba.size
        x0, y0, x1, y1 = bbox_rgba(rgba)
        crop = rgba.crop((x0, y0, x1, y1))
    scale = min(1.0, longest / max(crop.size), available / max(crop.size))
    new_size = (
        max(1, round(crop.width * scale)),
        max(1, round(crop.height * scale)),
    )
    if crop.size != new_size:
        crop = crop.resize(new_size, Image.Resampling.LANCZOS)
    return crop, {
        "source": [width, height],
        "trim": [x0, y0, x1 - x0, y1 - y0],
        "scale": round(scale, 8),
    }


def extrude(page: Image.Image, sprite: Image.Image, x: int, y: int) -> None:
    w, h = sprite.size
    page.paste(sprite, (x, y))
    for p in range(1, GUTTER + 1):
        page.paste(sprite.crop((0, 0, 1, h)), (x - p, y))
        page.paste(sprite.crop((w - 1, 0, w, h)), (x + w - 1 + p, y))
        page.paste(sprite.crop((0, 0, w, 1)), (x, y - p))
        page.paste(sprite.crop((0, h - 1, w, h)), (x, y + h - 1 + p))
        for xx, xx0 in ((x - p, 0), (x + w - 1 + p, w - 1)):
            for yy, yy0 in ((y - p, 0), (y + h - 1 + p, h - 1)):
                page.paste(sprite.crop((xx0, yy0, xx0 + 1, yy0 + 1)), (xx, yy))


def pack_tier(paths: list[Path], assets: Path, out: Path, tier: str, max_side: int) -> dict:
    directory = out / tier
    directory.mkdir(parents=True, exist_ok=True)
    # Clear prior generated pages only when rebuilding this tier.
    for old in directory.glob("page_*.png"):
        old.unlink()
    pages = []
    entries = {}
    page = Image.new("RGBA", (PAGE, PAGE))
    x = y = row_height = 0

    def flush() -> None:
        nonlocal page, x, y, row_height
        name = f"page_{len(pages):03}.png"
        page.save(directory / name, optimize=True, compress_level=6)
        pages.append({"file": f"{tier}/{name}", "width": PAGE, "height": PAGE})
        page = Image.new("RGBA", (PAGE, PAGE))
        x = y = row_height = 0

    for path in paths:
        sprite, info = trimmed(path, max_side, PAGE - 2 * GUTTER)
        sw, sh = sprite.size
        outer_w, outer_h = sw + 2 * GUTTER, sh + 2 * GUTTER
        if x + outer_w > PAGE:
            x = 0
            y += row_height
            row_height = 0
        if y + outer_h > PAGE:
            flush()
        px, py = x + GUTTER, y + GUTTER
        extrude(page, sprite, px, py)
        key = "assets/" + path.relative_to(assets).as_posix()
        entries[key] = {
            "page": len(pages),
            "rect": [px, py, sw, sh],
            **info,
        }
        x += outer_w
        row_height = max(row_height, outer_h)
    if entries and (x or y or not pages):
        flush()
    return {"pages": pages, "sprites": entries}


def build(assets: Path, out: Path, *, force: bool = False) -> dict:
    assets, out = assets.resolve(), out.resolve()
    paths = sorted(
        (p for folder in KINDS for p in (assets / folder).rglob("*.png")
         if p.is_file()),
        key=lambda p: p.relative_to(assets).as_posix().lower(),
    )
    fp = fingerprint(paths, assets)
    manifest_path = out / "manifest.json"
    if not force and manifest_path.is_file():
        try:
            previous = json.loads(manifest_path.read_text(encoding="utf-8"))
            if previous.get("fingerprint") == fp and all(
                (out / p["file"]).is_file()
                for tier in previous.get("tiers", {}).values()
                for p in tier.get("pages", [])
            ):
                print(f"Atlas unchanged: {len(paths)} sprites, {len(previous['tiers'])} tiers.")
                return previous
        except (ValueError, KeyError, OSError):
            pass
    out.mkdir(parents=True, exist_ok=True)
    tiers = {name: pack_tier(paths, assets, out, name, limit)
             for name, limit in TIERS.items()}
    manifest = {
        "schemaVersion": SCHEMA,
        "fingerprint": fp,
        "atlasSize": PAGE,
        "gutter": GUTTER,
        "tiers": tiers,
    }
    tmp = manifest_path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    tmp.replace(manifest_path)
    for name, tier in tiers.items():
        print(f"{name}: {len(tier['sprites'])} sprites / {len(tier['pages'])} pages")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", type=Path, default=Path("assets"))
    parser.add_argument("--out", type=Path, default=Path("atlases"))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    build(args.assets, args.out, force=args.force)


if __name__ == "__main__":
    main()
