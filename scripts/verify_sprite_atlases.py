#!/usr/bin/env python3
"""Validate generated desktop/mobile atlases against the original repository PNGs."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from PIL import Image
from build_sprite_atlases import KINDS, PAGE, GUTTER, fingerprint


def verify(assets: Path, atlas: Path) -> dict:
    assets, atlas = assets.resolve(), atlas.resolve()
    manifest = json.loads((atlas / "manifest.json").read_text("utf-8"))
    originals = sorted(
        (p for kind in KINDS for p in (assets / kind).rglob("*.png") if p.is_file()),
        key=lambda p: p.relative_to(assets).as_posix().lower(),
    )
    assert manifest["schemaVersion"] == 1, "Unexpected atlas schema"
    assert manifest["fingerprint"] == fingerprint(originals, assets), "Stale source fingerprint"
    expected = {"assets/" + p.relative_to(assets).as_posix() for p in originals}
    report = {}
    for tier, payload in manifest["tiers"].items():
        entries, pages = payload["sprites"], payload["pages"]
        assert set(entries) == expected, f"{tier}: missing/stale sprite entries"
        bboxes = [[] for _ in pages]
        for path, entry in entries.items():
            assert 0 <= entry["page"] < len(pages)
            assert len(entry["trim"]) == len(entry["rect"]) == 4
            x, y, w, h = entry["rect"]
            trim_x, trim_y, tw, th = entry["trim"]
            sw, sh = entry["source"]
            assert 0 <= trim_x and 0 <= trim_y and 1 <= tw <= sw and 1 <= th <= sh
            assert trim_x + tw <= sw and trim_y + th <= sh
            assert w > 0 and h > 0 and x >= GUTTER and y >= GUTTER
            assert x + w + GUTTER <= PAGE and y + h + GUTTER <= PAGE
            with Image.open(assets.parent / path) as original:
                assert original.size == (sw, sh), f"{path} dimension mismatch"
            box = (x - GUTTER, y - GUTTER, x + w + GUTTER, y + h + GUTTER)
            for other in bboxes[entry["page"]]:
                assert box[2] <= other[0] or box[0] >= other[2] or \
                       box[3] <= other[1] or box[1] >= other[3], \
                       f"Overlapping sprite/gutters on {tier} page {entry['page']}"
            bboxes[entry["page"]].append(box)
        for p in pages:
            file = atlas / p["file"]
            assert file.is_file(), f"Missing atlas page {file}"
            with Image.open(file) as img:
                img.verify()
            with Image.open(file) as img:
                assert img.mode == "RGBA" and img.size == (PAGE, PAGE)
        report[tier] = {"sprites": len(entries), "pages": len(pages)}
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--assets", type=Path, default=Path("assets"))
    parser.add_argument("--atlas", type=Path, default=Path("atlases"))
    arguments = parser.parse_args()
    print(json.dumps(verify(arguments.assets, arguments.atlas), indent=2))
