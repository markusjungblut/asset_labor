#!/usr/bin/env python3
"""Export active M26 icons, Basis-UI icons, and Schatzkarte into ASCII WebP assets.

Reads the canonical M26 catalog CSVs (M26_SETS_KONSOLIDIERT_40.csv +
M26_PREISARBEITSKATALOG.csv) so M26 output filenames match `item_key` in
`browsergame/domain/collections/catalog-data.ts` 1:1, without umlauts or spaces.

Also exports the 17 Basis-UI icons (`assets/icons/UI Icons/*.png` -> `ui/<key>.webp`)
and `Schatzkarte.png` (`ui/treasure_map.webp`), writes `manifest.json` and
`unused_icons.json`, and supports `--sync-to ../browsergame/public/icons`.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_M26_DOCS = ROOT.parent / "browsergame" / "docs" / "milestones"
DEFAULT_ASSETS_ICONS = ROOT / "assets" / "icons"
DEFAULT_OUT = ROOT / "dist" / "icons-webp"

UI_ICON_SPECS: tuple[tuple[str, str, str], ...] = (
    ("wood", "Holz", "assets/icons/UI Icons/Holzscheite.png"),
    ("stone", "Stein", "assets/icons/UI Icons/Steinblöcke.png"),
    ("food", "Nahrung", "assets/icons/UI Icons/Gemischte_Lebensmittel.png"),
    ("iron", "Eisen", "assets/icons/UI Icons/Rötliches_Eisenerz.png"),
    ("copper_coins", "Kupfermünzen", "assets/icons/UI Icons/Kupfermuenzen.png"),
    ("silver_coins", "Silbermünzen", "assets/icons/UI Icons/Silbermünzen.png"),
    ("gold_coins", "Goldmünzen", "assets/icons/UI Icons/Goldmünzenstapel.png"),
    ("chest_closed", "Geschlossene Schatztruhe", "assets/icons/UI Icons/Geschlossene_Schatztruhe.png"),
    ("chest_open", "Offene Schatztruhe", "assets/icons/UI Icons/Offene_Schatztruhe.png"),
    ("vault", "Tresor", "assets/icons/UI Icons/Tresor.png"),
    ("worker_hammer", "Arbeitskräfte & Handwerk", "assets/icons/UI Icons/Arbeiterarm_mit_Hammer.png"),
    ("crossed_swords", "Kampf & Militär", "assets/icons/UI Icons/Gekreuzte_Schwerter.png"),
    ("handshake", "Diplomatie & Handel", "assets/icons/UI Icons/Handschlag.png"),
    ("gold_trophy", "Trophäe & Rangliste", "assets/icons/UI Icons/Goldene_Trophäe.png"),
    ("medal", "Medaille & Auszeichnung", "assets/icons/UI Icons/Medallie.png"),
    ("palm_island", "Insel & Entdeckung", "assets/icons/UI Icons/Palmeninsel.png"),
    ("pirate_medallion", "Piratenmedaillon", "assets/icons/UI Icons/Piratenmedaillon.png"),
)

TREASURE_MAP_SPEC: tuple[str, str, str] = (
    "treasure_map",
    "Schatzkarte",
    "assets/icons/Dokumente & Karten/Schatzkarte.png",
)


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


def _export_single_webp(
    src: Path,
    dst: Path,
    *,
    max_dim: int,
    square: bool,
    quality: int,
) -> tuple[int, int, str]:
    """Resize PNG cleanly to WebP (either fixed square or aspect-preserving max_dim)."""
    with Image.open(src) as img:
        rgba = img.convert("RGBA")
        if square:
            out_img = rgba.resize((max_dim, max_dim), Image.Resampling.LANCZOS)
        else:
            w, h = rgba.size
            scale = min(1.0, max_dim / max(1, max(w, h)))
            out_img = rgba.resize(
                (max(1, round(w * scale)), max(1, round(h * scale))),
                Image.Resampling.LANCZOS,
            )
        dst.parent.mkdir(parents=True, exist_ok=True)
        out_img.save(dst, format="WEBP", quality=quality, method=6)
    raw = dst.read_bytes()
    return out_img.size[0], len(raw), hashlib.sha256(raw).hexdigest()[:12]


def sync_icon_pack(out_dir: Path, sync_to: Path, size: int) -> None:
    """Mirror exported WebP icon pack (`{size}/`, `ui/`, `manifest.json`) to browsergame/public/icons."""
    sync_to.mkdir(parents=True, exist_ok=True)
    for sub in (str(size), "ui"):
        src_sub = out_dir / sub
        dst_sub = sync_to / sub
        if dst_sub.exists():
            shutil.rmtree(dst_sub)
        if src_sub.is_dir():
            shutil.copytree(src_sub, dst_sub)
    manifest_src = out_dir / "manifest.json"
    if manifest_src.is_file():
        shutil.copy2(manifest_src, sync_to / "manifest.json")


def export_icons(
    repo_root: Path,
    m26_docs: Path,
    out_dir: Path,
    size: int = 128,
    quality: int = 85,
    treasure_map_max_dim: int = 768,
    strict: bool = True,
    dry_run: bool = False,
    limit: int | None = None,
    sync_to: Path | None = None,
) -> dict[str, Any]:
    entries = load_active_catalog(m26_docs)
    active_paths = {e["github_path"] for e in entries}

    # Include present UI icons and Schatzkarte as active (not unused) when present in repo.
    present_ui_specs = [spec for spec in UI_ICON_SPECS if (repo_root / spec[2]).is_file()]
    for _, _, rel_path in present_ui_specs:
        active_paths.add(rel_path)
    has_treasure_map = (repo_root / TREASURE_MAP_SPEC[2]).is_file()
    if has_treasure_map:
        active_paths.add(TREASURE_MAP_SPEC[2])

    unused = find_unused_icon_pngs(repo_root, repo_root / "assets" / "icons", active_paths)

    work_entries = entries[:limit] if limit is not None else entries
    target_dir = out_dir / str(size)
    ui_dir = out_dir / "ui"
    if not dry_run:
        target_dir.mkdir(parents=True, exist_ok=True)

    missing: list[dict[str, str]] = []
    manifest_items: list[dict[str, Any]] = []
    ui_items: list[dict[str, Any]] = []
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

        _, out_bytes, digest = _export_single_webp(
            src, dst, max_dim=size, square=True, quality=quality
        )
        total_out_bytes += out_bytes
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

    # Export Basis-UI icons (`ui/<key>.webp`)
    for ui_key, label, rel_path in present_ui_specs:
        src = repo_root / rel_path
        src_size = src.stat().st_size
        total_src_bytes += src_size
        out_name = f"{ui_key}.webp"
        dst = ui_dir / out_name
        if dry_run:
            ui_items.append(
                {
                    "key": ui_key,
                    "label": label,
                    "source_path": rel_path,
                    "webp_file": f"ui/{out_name}",
                    "source_bytes": src_size,
                }
            )
            continue
        _, out_bytes, digest = _export_single_webp(
            src, dst, max_dim=size, square=True, quality=quality
        )
        total_out_bytes += out_bytes
        ui_items.append(
            {
                "key": ui_key,
                "label": label,
                "source_path": rel_path,
                "webp_file": f"ui/{out_name}",
                "source_bytes": src_size,
                "webp_bytes": out_bytes,
                "sha256_12": digest,
            }
        )

    # Export Schatzkarte (`ui/treasure_map.webp`)
    treasure_map_entry: dict[str, Any] | None = None
    if has_treasure_map:
        tm_key, tm_label, tm_rel = TREASURE_MAP_SPEC
        src = repo_root / tm_rel
        src_size = src.stat().st_size
        total_src_bytes += src_size
        out_name = f"{tm_key}.webp"
        dst = ui_dir / out_name
        if dry_run:
            treasure_map_entry = {
                "key": tm_key,
                "label": tm_label,
                "source_path": tm_rel,
                "webp_file": f"ui/{out_name}",
                "source_bytes": src_size,
            }
        else:
            out_w, out_bytes, digest = _export_single_webp(
                src, dst, max_dim=treasure_map_max_dim, square=False, quality=quality
            )
            total_out_bytes += out_bytes
            treasure_map_entry = {
                "key": tm_key,
                "label": tm_label,
                "source_path": tm_rel,
                "webp_file": f"ui/{out_name}",
                "width": out_w,
                "source_bytes": src_size,
                "webp_bytes": out_bytes,
                "sha256_12": digest,
            }

    summary: dict[str, Any] = {
        "schema_version": "vedras-web-icons-v2",
        "size": size,
        "quality": quality,
        "active_catalog_count": len(entries),
        "exported_count": len(manifest_items),
        "ui_exported_count": len(ui_items),
        "has_treasure_map": treasure_map_entry is not None,
        "missing_count": len(missing),
        "unused_source_png_count": len(unused),
        "total_source_bytes": total_src_bytes,
        "total_webp_bytes": total_out_bytes,
        "missing": missing,
        "ui_icons": ui_items,
        "treasure_map": treasure_map_entry,
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
                    "note": "PNGs under assets/icons/ not referenced by the active 580-item M26 catalog, UI icons, or Schatzkarte. Kept intact as raw artwork until reviewed.",
                    "paths": unused,
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        if sync_to is not None:
            sync_icon_pack(out_dir, sync_to, size)

    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Export active M26 icons, Basis-UI icons, and Schatzkarte to WebP."
    )
    parser.add_argument("--repo-root", type=Path, default=ROOT)
    parser.add_argument("--m26-docs", type=Path, default=DEFAULT_M26_DOCS)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--size", type=int, default=128)
    parser.add_argument("--quality", type=int, default=85)
    parser.add_argument("--treasure-map-max-dim", type=int, default=768)
    parser.add_argument("--sync-to", type=Path, default=None)
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
        treasure_map_max_dim=args.treasure_map_max_dim,
        strict=not args.no_strict,
        dry_run=args.dry_run,
        limit=args.limit,
        sync_to=args.sync_to.resolve() if args.sync_to else None,
    )
    src_mb = summary["total_source_bytes"] / (1024 * 1024)
    out_mb = summary["total_webp_bytes"] / (1024 * 1024)
    sync_note = f" | synced -> {args.sync_to}" if args.sync_to and not args.dry_run else ""
    print(
        f"Exported {summary['exported_count']}/{summary['active_catalog_count']} M26 icons + "
        f"{summary['ui_exported_count']} UI icons + treasure_map={summary['has_treasure_map']} "
        f"({args.size}px WebP): {src_mb:.1f} MB PNG -> {out_mb:.2f} MB WebP | "
        f"missing={summary['missing_count']} | unused_raw_pngs={summary['unused_source_png_count']}{sync_note}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
