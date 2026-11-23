#!/usr/bin/env python3
"""Export active M26 icons from raw 1024x1024 PNGs into ASCII-named WebP assets.

Reads the canonical M26 catalog CSVs (M26_SETS_KONSOLIDIERT_40.csv +
M26_PREISARBEITSKATALOG.csv) so output filenames match `item_key` in
`browsergame/domain/collections/catalog-data.ts` 1:1, without umlauts or spaces.

Also writes `manifest.json` and `unused_icons.json` (reporting unreferenced PNGs
under `assets/icons/` without deleting raw source artwork).
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import sys
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_M26_DOCS = ROOT.parent / "browsergame" / "docs" / "milestones"
DEFAULT_ASSETS_ICONS = ROOT / "assets" / "icons"
DEFAULT_OUT = ROOT / "dist" / "icons-webp"


def slugify_key(name: str) -> str:
    """Exact mirror of `slugifyKey` in `browsergame/scripts/generate-m26-catalog.mts`."""
    s = name.lower()
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def read_semicolon_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh, delimiter=";", quotechar='"')
        return [dict(row) for row in reader]


def load_active_catalog(m26_docs: Path) -> list[dict[str, str]]:
    sets_csv = m26_docs / "M26_SETS_KONSOLIDIERT_40.csv"
    prices_csv = m26_docs / "M26_PREISARBEITSKATALOG.csv"
    if not sets_csv.is_file() or not prices_csv.is_file():
        raise FileNotFoundError(
            f"Expected M26_SETS_KONSOLIDIERT_40.csv and M26_PREISARBEITSKATALOG.csv in {m26_docs}"
        )

    set_rows = read_semicolon_csv(sets_csv)
    price_rows = read_semicolon_csv(prices_csv)
    price_by_name = {row["Iconname"].strip(): row for row in price_rows if row.get("Iconname")}

    used_keys: set[str] = set()
    entries: list[dict[str, str]] = []
    for row in set_rows:
        name = (row.get("Iconname") or "").strip()
        if not name:
            continue
        price_row = price_by_name.get(name)
        if not price_row:
            raise ValueError(f"Missing price catalog row for M26 item: {name}")
        github_path = (price_row.get("GitHub-Pfad") or "").strip()
        if not github_path:
            raise ValueError(f"Missing GitHub-Pfad for M26 item: {name}")

        item_key = slugify_key(name)
        if item_key in used_keys:
            suffix = 2
            while f"{item_key}_{suffix}" in used_keys:
                suffix += 1
            item_key = f"{item_key}_{suffix}"
        used_keys.add(item_key)

        entries.append(
            {
                "item_key": item_key,
                "name": name,
                "set_id": (row.get("Set-ID") or "").strip(),
                "category": (price_row.get("Kategorie") or "").strip(),
                "github_path": github_path,
            }
        )
    return entries


def find_unused_icon_pngs(
    repo_root: Path, assets_icons_dir: Path, active_paths: set[str]
) -> list[str]:
    if not assets_icons_dir.is_dir():
        return []
    unused: list[str] = []
    for png in sorted(assets_icons_dir.rglob("*.png")):
        rel = png.relative_to(repo_root).as_posix()
        if rel not in active_paths:
            unused.append(rel)
    return unused


def export_icons(
    repo_root: Path,
    m26_docs: Path,
    out_dir: Path,
    size: int = 128,
    quality: int = 85,
    strict: bool = True,
    dry_run: bool = False,
    limit: int | None = None,
) -> dict[str, Any]:
    entries = load_active_catalog(m26_docs)
    active_paths = {e["github_path"] for e in entries}
    unused = find_unused_icon_pngs(repo_root, repo_root / "assets" / "icons", active_paths)

    work_entries = entries[:limit] if limit is not None else entries
    target_dir = out_dir / str(size)
    if not dry_run:
        target_dir.mkdir(parents=True, exist_ok=True)

    missing: list[dict[str, str]] = []
    manifest_items: list[dict[str, Any]] = []
    total_src_bytes = 0
    total_out_bytes = 0

    for entry in work_entries:
        src = repo_root / entry["github_path"]
        if not src.is_file():
            missing.append(
                {"item_key": entry["item_key"], "name": entry["name"], "path": entry["github_path"]}
            )
            continue

        src_size = src.stat().st_size
        total_src_bytes += src_size
        out_name = f"{entry['item_key']}.webp"
        dst = target_dir / out_name

        if dry_run:
            manifest_items.append(
                {
                    "item_key": entry["item_key"],
                    "name": entry["name"],
                    "set_id": entry["set_id"],
                    "source_path": entry["github_path"],
                    "webp_file": f"{size}/{out_name}",
                    "source_bytes": src_size,
                }
            )
            continue

        with Image.open(src) as img:
            rgba = img.convert("RGBA")
            resized = rgba.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(dst, format="WEBP", quality=quality, method=6)

        out_bytes = dst.stat().st_size
        total_out_bytes += out_bytes
        digest = hashlib.sha256(dst.read_bytes()).hexdigest()[:12]
        manifest_items.append(
            {
                "item_key": entry["item_key"],
                "name": entry["name"],
                "set_id": entry["set_id"],
                "source_path": entry["github_path"],
                "webp_file": f"{size}/{out_name}",
                "source_bytes": src_size,
                "webp_bytes": out_bytes,
                "sha256_12": digest,
            }
        )

    if strict and missing:
        raise FileNotFoundError(
            f"{len(missing)} active M26 icon PNG(s) missing; first: {missing[0]}"
        )

    summary: dict[str, Any] = {
        "schema_version": "m26-web-icons-v1",
        "size": size,
        "quality": quality,
        "active_catalog_count": len(entries),
        "exported_count": len(manifest_items),
        "missing_count": len(missing),
        "unused_source_png_count": len(unused),
        "total_source_bytes": total_src_bytes,
        "total_webp_bytes": total_out_bytes,
        "missing": missing,
        "items": manifest_items,
    }

    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "manifest.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        (out_dir / "unused_icons.json").write_text(
            json.dumps(
                {
                    "unused_count": len(unused),
                    "note": "PNGs under assets/icons/ not referenced by the active 580-item M26 catalog. Kept intact as raw artwork until reviewed.",
                    "paths": unused,
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export active M26 icons to WebP.")
    parser.add_argument("--repo-root", type=Path, default=ROOT)
    parser.add_argument("--m26-docs", type=Path, default=DEFAULT_M26_DOCS)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--size", type=int, default=128)
    parser.add_argument("--quality", type=int, default=85)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-strict", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args(argv)

    summary = export_icons(
        repo_root=args.repo_root.resolve(),
        m26_docs=args.m26_docs.resolve(),
        out_dir=args.out.resolve(),
        size=args.size,
        quality=args.quality,
        strict=not args.no_strict,
        dry_run=args.dry_run,
        limit=args.limit,
    )
    src_mb = summary["total_source_bytes"] / (1024 * 1024)
    out_mb = summary["total_webp_bytes"] / (1024 * 1024)
    print(
        f"Exported {summary['exported_count']}/{summary['active_catalog_count']} M26 icons "
        f"({args.size}px WebP): {src_mb:.1f} MB PNG -> {out_mb:.2f} MB WebP | "
        f"missing={summary['missing_count']} | unused_raw_pngs={summary['unused_source_png_count']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
