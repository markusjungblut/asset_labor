#!/usr/bin/env python3
"""Batch PNG intake, alpha/halo quality audit, catalog registration & contact-sheet tool.

Implements `MASTER_ASSET_ROADMAP.md` Part 3 §2 so newly generated PNG batches can be
audited, normalized, registered into `assets/nature/nature_catalog.json` (including
non-colliding `ground_decal` micro-decals, `snow_mountain`, `water_boulder`, trees,
shrubs, rocks, buildings/units/sites), exported into WebP GPU atlases, and previewed on
a dark-checkerboard contact sheet with ground-anchor crosshair + pre-baked shadow.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass, field
import json
from pathlib import Path
import re
import shutil
import sys
from typing import Any

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import export_game_assets  # noqa: E402


KIND_DEFAULTS: dict[str, dict[str, Any]] = {
    "tree": {
        "family": "temperate_trees",
        "sizeClass": "large",
        "logicalWidth": 96,
        "scaleMin": 0.84,
        "scaleMax": 1.18,
        "anchorY": 0.94,
        "density": 0.16,
        "minSpacing": 72,
        "canCluster": True,
        "shadowMode": "generic_medium_round",
    },
    "shrub": {
        "family": "temperate_bushes",
        "sizeClass": "medium",
        "logicalWidth": 52,
        "scaleMin": 0.80,
        "scaleMax": 1.22,
        "anchorY": 0.88,
        "density": 0.22,
        "minSpacing": 36,
        "canCluster": True,
        "shadowMode": "generic_small_round",
    },
    "rock": {
        "family": "stones",
        "sizeClass": "medium",
        "logicalWidth": 62,
        "scaleMin": 0.68,
        "scaleMax": 2.40,
        "anchorY": 0.86,
        "density": 0.14,
        "minSpacing": 34,
        "canCluster": True,
        "shadowMode": "generic_small_round",
    },
    "ground_cover": {
        "family": "herbs",
        "sizeClass": "small",
        "logicalWidth": 42,
        "scaleMin": 0.82,
        "scaleMax": 1.20,
        "anchorY": 0.84,
        "density": 0.24,
        "minSpacing": 28,
        "canCluster": True,
        "shadowMode": "none",
    },
    "ground_decal": {
        "family": "ground_decal",
        "sizeClass": "small",
        "logicalWidth": 54,
        "scaleMin": 0.85,
        "scaleMax": 1.25,
        "anchorY": 0.50,
        "density": 0.34,
        "minSpacing": 18,
        "canCluster": False,
        "shadowMode": "none",
    },
    "mountain": {
        "family": "mountains",
        "sizeClass": "giant",
        "logicalWidth": 310,
        "scaleMin": 0.92,
        "scaleMax": 1.12,
        "anchorY": 0.72,
        "density": 1.0,
        "minSpacing": 160,
        "canCluster": False,
        "shadowMode": "mountain_field",
    },
    "cluster": {
        "family": "temperate_bushes",
        "sizeClass": "medium",
        "logicalWidth": 76,
        "scaleMin": 0.85,
        "scaleMax": 1.15,
        "anchorY": 0.88,
        "density": 0.14,
        "minSpacing": 54,
        "canCluster": False,
        "shadowMode": "generic_medium_round",
    },
    "special": {
        "family": "special",
        "sizeClass": "medium",
        "logicalWidth": 72,
        "scaleMin": 0.88,
        "scaleMax": 1.12,
        "anchorY": 0.90,
        "density": 0.04,
        "minSpacing": 96,
        "canCluster": False,
        "shadowMode": "generic_small_round",
    },
}


def slugify_filename(name: str) -> str:
    """Normalize German umlauts, spaces & punctuation into clean ASCII snake_case stem."""
    s = name.lower()
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "asset"


@dataclass
class AuditIssue:
    severity: str  # "error" | "warning"
    code: str
    message: str


@dataclass
class PngAuditResult:
    source: Path
    slug: str
    width: int
    height: int
    trim_bbox: tuple[int, int, int, int] | None
    estimated_anchor_x: float
    opaque_border_ratio: float
    clipped_edge_ratio: float
    fringe_ratio: float
    issues: list[AuditIssue] = field(default_factory=list)

    @property
    def status(self) -> str:
        if any(i.severity == "error" for i in self.issues):
            return "FAIL"
        if any(i.severity == "warning" for i in self.issues):
            return "WARN"
        return "PASS"


def audit_png(path: Path) -> PngAuditResult:
    """Inspect a candidate PNG for alpha cutout cleanliness, white halos, edge clipping & foot anchor."""
    slug = slugify_filename(path.stem)
    with Image.open(path) as raw:
        rgba = raw.convert("RGBA")
        w, h = rgba.size
        px = rgba.load()
        alpha = rgba.getchannel("A")
        bbox = alpha.point(lambda v: 255 if v > 12 else 0).getbbox()

        issues: list[AuditIssue] = []
        if w < 32 or h < 32:
            issues.append(AuditIssue("error", "too_small", f"Bild zu klein ({w}x{h}px, Minimum 32px)"))
        elif w > 4096 or h > 4096:
            issues.append(AuditIssue("warning", "very_large", f"Sehr großes Rohbild ({w}x{h}px)"))

        if bbox is None:
            issues.append(AuditIssue("error", "empty_image", "Keine sichtbaren Pixel (Alpha komplett 0)"))
            return PngAuditResult(path, slug, w, h, None, 0.5, 0.0, 0.0, 0.0, issues)

        # 1. Border check: detect opaque un-keyed background AND sprite edge clipping
        border_total = max(1, 2 * w + 2 * h - 4)
        opaque_border = 0
        clipped_border = 0
        for x in range(w):
            for y in (0, h - 1):
                a = px[x, y][3]
                if a > 200:
                    opaque_border += 1
                if a > 32:
                    clipped_border += 1
        for y in range(1, h - 1):
            for x in (0, w - 1):
                a = px[x, y][3]
                if a > 200:
                    opaque_border += 1
                if a > 32:
                    clipped_border += 1

        opaque_ratio = opaque_border / border_total
        clipped_ratio = clipped_border / border_total
        if opaque_ratio > 0.80:
            issues.append(
                AuditIssue(
                    "error",
                    "opaque_background",
                    f"Kein freigestellter Hintergrund ({opaque_ratio * 100:.0f}% opaker Bildrand)",
                )
            )
        elif clipped_ratio > 0.025:
            issues.append(
                AuditIssue(
                    "warning",
                    "edge_clipped",
                    f"Motiv berührt den Bildrand ({clipped_ratio * 100:.1f}% Randpixel sichtbar)",
                )
            )

        # 2. Semi-transparent bright matte halo check (white fringe detector)
        tx0, ty0, tx1, ty1 = bbox
        semi_count = 0
        bright_semi = 0
        opaque_luma_sum = 0.0
        opaque_count = 0
        # Subsample large images for <15ms audit speed
        step = max(1, max(tx1 - tx0, ty1 - ty0) // 256)
        for y in range(ty0, ty1, step):
            for x in range(tx0, tx1, step):
                r, g, b, a = px[x, y]
                if a >= 235:
                    opaque_luma_sum += 0.299 * r + 0.587 * g + 0.114 * b
                    opaque_count += 1
                elif 12 < a < 215:
                    semi_count += 1
                    if r > 224 and g > 224 and b > 224:
                        bright_semi += 1

        avg_opaque_luma = opaque_luma_sum / max(1, opaque_count)
        fringe_ratio = bright_semi / max(1, semi_count)
        if semi_count >= 16 and fringe_ratio > 0.32 and avg_opaque_luma < 195:
            issues.append(
                AuditIssue(
                    "warning",
                    "white_fringe",
                    f"Heller weißer Freistell-Saum erkannt ({fringe_ratio * 100:.0f}% der Randpixel >224); --auto-defringe empfohlen",
                )
            )

        # 3. Estimate ground anchor X from bottom 12% foot silhouette
        foot_y0 = max(ty0, ty1 - max(2, int((ty1 - ty0) * 0.12)))
        wx_sum = 0.0
        w_sum = 0.0
        for y in range(foot_y0, ty1):
            for x in range(tx0, tx1):
                a = px[x, y][3]
                if a > 32:
                    wx_sum += (x - tx0 + 0.5) * a
                    w_sum += a
        est_ax = 0.5
        if w_sum > 0 and (tx1 - tx0) > 0:
            est_ax = round(max(0.2, min(0.8, (wx_sum / w_sum) / (tx1 - tx0))), 3)

        return PngAuditResult(
            source=path,
            slug=slug,
            width=w,
            height=h,
            trim_bbox=bbox,
            estimated_anchor_x=est_ax,
            opaque_border_ratio=opaque_ratio,
            clipped_edge_ratio=clipped_ratio,
            fringe_ratio=fringe_ratio,
            issues=issues,
        )


def defringe_rgba(img: Image.Image, passes: int = 4) -> Image.Image:
    """Remove white/bright matte halos on semi-transparent boundary pixels via iterative color dilation."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    cur = rgba.copy()

    for _ in range(max(1, passes)):
        src = cur.load()
        nxt = cur.copy()
        dst = nxt.load()
        changed = False
        for y in range(h):
            for x in range(w):
                r, g, b, a = src[x, y]
                if not (8 <= a <= 220):
                    continue
                if r < 205 or g < 205 or b < 205:
                    continue
                sr = sg = sb = cnt = 0
                for dy in (-2, -1, 0, 1, 2):
                    ny = y + dy
                    if ny < 0 or ny >= h:
                        continue
                    for dx in (-2, -1, 0, 1, 2):
                        nx = x + dx
                        if nx < 0 or nx >= w:
                            continue
                        nr, ng, nb, na = src[nx, ny]
                        # Accept either opaque interior pixels or already-cleaned edge pixels
                        if na >= 230 or (na >= 16 and not (nr >= 205 and ng >= 205 and nb >= 205)):
                            sr += nr
                            sg += ng
                            sb += nb
                            cnt += 1
                if cnt > 0:
                    dst[x, y] = (sr // cnt, sg // cnt, sb // cnt, a)
                    changed = True
        cur = nxt
        if not changed:
            break
    return cur


def build_nature_catalog_entry(
    *,
    slug: str,
    filename: str,
    kind: str,
    biomes: list[str],
    excluded_biomes: list[str],
    family: str | None = None,
    size_class: str | None = None,
    logical_width: int | None = None,
    anchor_x: float = 0.5,
    anchor_y: float | None = None,
    density: float | None = None,
    tags: list[str] | None = None,
    description: str = "",
) -> dict[str, Any]:
    """Create a schema-compliant `assets/nature/nature_catalog.json` entry."""
    defaults = KIND_DEFAULTS.get(kind, KIND_DEFAULTS["shrub"])
    eff_family = family or defaults["family"]
    eff_size_class = size_class or defaults["sizeClass"]
    eff_width = logical_width if logical_width is not None else defaults["logicalWidth"]
    eff_ay = anchor_y if anchor_y is not None else defaults["anchorY"]
    eff_density = density if density is not None else defaults["density"]
    eff_tags = list(dict.fromkeys([*(tags or []), "ingested"]))
    if kind == "ground_decal" and "micro_decal" not in eff_tags:
        eff_tags.append("micro_decal")

    return {
        "id": slug,
        "description": description or f"Importiertes Asset: {slug} ({kind})",
        "sourceReference": f"Bestandsdatei: {filename}",
        "family": eff_family,
        "kind": kind,
        "sizeClass": eff_size_class,
        "sizeMode": "class",
        "logicalWidth": eff_width,
        "scaleMin": defaults["scaleMin"],
        "scaleMax": defaults["scaleMax"],
        "anchor": {"x": round(anchor_x, 3), "y": round(eff_ay, 3)},
        "shadow": {
            "mode": defaults["shadowMode"],
            "path": "",
            "offsetX": -0.20,
            "offsetY": 0.02,
            "widthScale": 0.68,
            "depthScale": 0.18,
        },
        "terrainPresetId": "",
        "allowedTerrainCategories": [],
        "allowedTerrainTypes": biomes,
        "excludedTerrainTypes": excluded_biomes,
        "placement": {
            "weight": 1,
            "density": eff_density,
            "minSpacing": defaults["minSpacing"],
            "canCluster": defaults["canCluster"],
            "edgeMargin": 12,
        },
        "mountain": {
            "radius": 1,
            "coreRadius": 0,
            "shadowOpacity": 0.23,
            "flatten": True,
        },
        "artStatus": "candidate",
        "tags": eff_tags,
        "targetHeight": round(eff_width * 1.25),
    }


def render_contact_sheet(
    items: list[tuple[PngAuditResult, Image.Image, dict[str, Any] | None]],
    out_path: Path,
    *,
    cell_size: int = 220,
    cols: int = 4,
) -> Path:
    """Render a dark-checkerboard contact sheet with pre-baked shadow preview & red anchor crosshair."""
    if not items:
        raise ValueError("Cannot render empty contact sheet")
    cols = max(1, min(cols, len(items)))
    rows = (len(items) + cols - 1) // cols
    pad = 14
    label_h = 44
    tile_w = cell_size
    tile_h = cell_size + label_h
    sheet_w = cols * tile_w + (cols + 1) * pad
    sheet_h = rows * tile_h + (rows + 1) * pad

    sheet = Image.new("RGBA", (sheet_w, sheet_h), (18, 22, 28, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, (audit, rgba, meta) in enumerate(items):
        r = idx // cols
        c = idx % cols
        ox = pad + c * (tile_w + pad)
        oy = pad + r * (tile_h + pad)

        # Dark checkerboard preview tile
        chk = 16
        for cy in range(0, cell_size, chk):
            for cx in range(0, cell_size, chk):
                col = (34, 40, 50, 255) if ((cx // chk + cy // chk) % 2 == 0) else (26, 31, 40, 255)
                draw.rectangle(
                    [ox + cx, oy + cy, ox + min(cell_size, cx + chk) - 1, oy + min(cell_size, cy + chk) - 1],
                    fill=col,
                )

        bbox = export_game_assets.trim_alpha_bbox(rgba)
        trimmed = rgba.crop(bbox)
        max_inner = cell_size - 28
        scale = min(max_inner / max(1, trimmed.width), max_inner / max(1, trimmed.height))
        pw = max(1, round(trimmed.width * scale))
        ph = max(1, round(trimmed.height * scale))
        preview = trimmed.resize((pw, ph), Image.Resampling.LANCZOS)

        ax = float((meta or {}).get("anchor", {}).get("x", audit.estimated_anchor_x))
        ay = float((meta or {}).get("anchor", {}).get("y", 0.90))
        px_x = ox + (cell_size - pw) // 2
        px_y = oy + (cell_size - ph) // 2

        # Optional pre-baked shadow preview beneath sprite
        if meta and meta.get("shadow", {}).get("mode") != "none":
            baked = export_game_assets.bake_sprite_shadow(
                trimmed, meta, {}, {}, float(meta.get("logicalWidth", 64)), ref_width=96.0
            )
            if baked is not None:
                sh_img, sh_bounds, _ = baked
                anchor_screen_x = px_x + ax * pw
                anchor_screen_y = px_y + ay * ph
                sx0 = round(anchor_screen_x + sh_bounds[0] * pw)
                sy0 = round(anchor_screen_y + sh_bounds[1] * pw)
                sw = max(1, round((sh_bounds[2] - sh_bounds[0]) * pw))
                sh = max(1, round((sh_bounds[3] - sh_bounds[1]) * pw))
                sh_vis = sh_img.resize((sw, sh), Image.Resampling.BILINEAR)
                # Tint shadow alpha with 54% soft black
                sh_a = sh_vis.getchannel("A").point(lambda v: int(v * 0.54))
                sh_tint = Image.new("RGBA", sh_vis.size, (0, 0, 0, 0))
                sh_tint.putalpha(sh_a)
                sheet.alpha_composite(sh_tint, (sx0, sy0))

        sheet.alpha_composite(preview, (px_x, px_y))

        # Red ground-anchor crosshair
        acx = round(px_x + ax * pw)
        acy = round(px_y + ay * ph)
        draw.line([acx - 7, acy, acx + 7, acy], fill=(240, 72, 72, 255), width=2)
        draw.line([acx, acy - 7, acx, acy + 7], fill=(240, 72, 72, 255), width=2)

        # Status border + caption
        status_col = (
            (58, 178, 108, 255)
            if audit.status == "PASS"
            else (225, 168, 52, 255)
            if audit.status == "WARN"
            else (225, 72, 72, 255)
        )
        draw.rectangle([ox, oy, ox + tile_w - 1, oy + tile_h - 1], outline=status_col, width=2)
        draw.rectangle([ox + 1, oy + cell_size, ox + tile_w - 2, oy + tile_h - 2], fill=(22, 27, 35, 255))
        draw.text((ox + 8, oy + cell_size + 6), f"{audit.slug[:24]} [{audit.status}]", fill=(235, 240, 248, 255))
        kind_lbl = (meta or {}).get("kind", "raw")
        draw.text(
            (ox + 8, oy + cell_size + 24),
            f"{trimmed.width}x{trimmed.height} · {kind_lbl} · ax={ax:.2f}",
            fill=(165, 178, 198, 255),
        )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, format="PNG")
    return out_path


def collect_input_pngs(inputs: list[Path]) -> list[Path]:
    found: list[Path] = []
    for p in inputs:
        if p.is_dir():
            found.extend(sorted(p.rglob("*.png")))
        elif p.is_file() and p.suffix.lower() == ".png":
            found.append(p)
    return found


def ingest_batch(
    *,
    inputs: list[Path],
    repo_root: Path = ROOT,
    kind: str = "shrub",
    biomes: list[str] | None = None,
    excluded_biomes: list[str] | None = None,
    family: str | None = None,
    size_class: str | None = None,
    logical_width: int | None = None,
    density: float | None = None,
    tags: list[str] | None = None,
    target_subdir: str = "nature",
    register_nature_catalog: bool = True,
    auto_defringe: bool = False,
    overwrite: bool = False,
    dry_run: bool = False,
    contact_sheet: Path | None = None,
    run_export: bool = False,
    sync_to: Path | None = None,
) -> dict[str, Any]:
    pngs = collect_input_pngs(inputs)
    if not pngs:
        raise FileNotFoundError("Keine PNG-Dateien in den angegebenen Pfaden gefunden.")

    assets_dir = repo_root / "assets"
    dest_dir = assets_dir / target_subdir
    catalog_path = assets_dir / "nature" / "nature_catalog.json"

    catalog: dict[str, Any] | None = None
    if register_nature_catalog and target_subdir == "nature" and catalog_path.is_file():
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))

    eff_biomes = biomes if biomes is not None else ["grassland", "pasture"]
    eff_excluded = excluded_biomes or []

    results: list[dict[str, Any]] = []
    sheet_items: list[tuple[PngAuditResult, Image.Image, dict[str, Any] | None]] = []
    ingested_count = 0
    failed_count = 0
    skipped_count = 0

    for src in pngs:
        audit = audit_png(src)
        with Image.open(src) as raw_img:
            img = defringe_rgba(raw_img) if auto_defringe else raw_img.convert("RGBA")

        filename = f"{audit.slug}.png"
        rel_key = f"{target_subdir}/{filename}"
        dest_file = dest_dir / filename
        entry_meta: dict[str, Any] | None = None

        if register_nature_catalog and (
            target_subdir == "nature" or target_subdir.startswith("nature/")
        ):
            entry_meta = build_nature_catalog_entry(
                slug=audit.slug,
                filename=filename,
                kind=kind,
                biomes=eff_biomes,
                excluded_biomes=eff_excluded,
                family=family,
                size_class=size_class,
                logical_width=logical_width,
                anchor_x=audit.estimated_anchor_x,
                density=density,
                tags=tags,
            )

        sheet_items.append((audit, img, entry_meta))

        if audit.status == "FAIL":
            failed_count += 1
            results.append(
                {
                    "source": str(src),
                    "slug": audit.slug,
                    "status": "FAIL",
                    "action": "rejected",
                    "issues": [i.__dict__ for i in audit.issues],
                }
            )
            continue

        if dest_file.exists() and not overwrite:
            skipped_count += 1
            results.append(
                {
                    "source": str(src),
                    "slug": audit.slug,
                    "status": audit.status,
                    "action": "skipped_exists",
                    "dest": str(dest_file),
                    "issues": [i.__dict__ for i in audit.issues],
                }
            )
            continue

        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)
            if auto_defringe:
                img.save(dest_file, format="PNG")
            elif src.resolve() != dest_file.resolve():
                shutil.copy2(src, dest_file)
            if catalog is not None and entry_meta is not None:
                catalog.setdefault("entries", {})[rel_key] = entry_meta

        ingested_count += 1
        results.append(
            {
                "source": str(src),
                "slug": audit.slug,
                "status": audit.status,
                "action": "dry_run" if dry_run else "ingested",
                "dest": str(dest_file),
                "catalog_key": rel_key if entry_meta else None,
                "anchor_x": audit.estimated_anchor_x,
                "issues": [i.__dict__ for i in audit.issues],
            }
        )

    if not dry_run and catalog is not None and ingested_count > 0:
        catalog["revision"] = int(catalog.get("revision", 1)) + 1
        catalog_path.write_text(
            json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    sheet_written: str | None = None
    if contact_sheet is not None and sheet_items:
        render_contact_sheet(sheet_items, contact_sheet)
        sheet_written = str(contact_sheet)

    export_summary: dict[str, Any] | None = None
    if run_export and not dry_run and ingested_count > 0:
        export_summary = export_game_assets.export_game_assets(
            repo_root=repo_root,
            out_dir=repo_root / "dist" / "game-assets",
            sync_to=sync_to,
        )

    return {
        "total_scanned": len(pngs),
        "ingested": ingested_count,
        "skipped": skipped_count,
        "failed": failed_count,
        "dry_run": dry_run,
        "contact_sheet": sheet_written,
        "exported_pack_hash": export_summary.get("packHash") if export_summary else None,
        "items": results,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Batch-audit, defringe, register, contact-sheet & WebP-export new Vedras PNGs."
    )
    parser.add_argument("inputs", nargs="+", type=Path, help="PNG file(s) or inbox directory")
    parser.add_argument("--repo-root", type=Path, default=ROOT)
    parser.add_argument("--kind", choices=sorted(KIND_DEFAULTS.keys()), default="shrub")
    parser.add_argument("--decal", action="store_true", help="Shortcut for --kind ground_decal")
    parser.add_argument("--biomes", default="grassland,pasture", help="Comma-separated allowed terrain types")
    parser.add_argument("--exclude-biomes", default="", help="Comma-separated excluded terrain types")
    parser.add_argument("--family", default=None)
    parser.add_argument("--size-class", default=None)
    parser.add_argument("--logical-width", type=int, default=None)
    parser.add_argument("--density", type=float, default=None)
    parser.add_argument("--tags", default="", help="Comma-separated extra tags")
    parser.add_argument("--target-subdir", default="nature", help="Subdir under assets/ (default: nature)")
    parser.add_argument("--no-catalog", action="store_true", help="Copy files only, do not update nature_catalog.json")
    parser.add_argument("--auto-defringe", action="store_true", help="Clean white halo pixels on alpha edges")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="Audit & contact sheet only, no repo writes")
    parser.add_argument("--contact-sheet", type=Path, default=None, help="Output PNG path for visual contact sheet")
    parser.add_argument("--export", action="store_true", help="Rebuild WebP atlases via export_game_assets.py")
    parser.add_argument("--sync-to", type=Path, default=None, help="Sync exported WebP pack to browsergame/public/game-assets")
    args = parser.parse_args(argv)

    kind = "ground_decal" if args.decal else args.kind
    biomes = [b.strip() for b in args.biomes.split(",") if b.strip()]
    excl = [b.strip() for b in args.exclude_biomes.split(",") if b.strip()]
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    summary = ingest_batch(
        inputs=[p.resolve() for p in args.inputs],
        repo_root=args.repo_root.resolve(),
        kind=kind,
        biomes=biomes,
        excluded_biomes=excl,
        family=args.family,
        size_class=args.size_class,
        logical_width=args.logical_width,
        density=args.density,
        tags=tags,
        target_subdir=args.target_subdir,
        register_nature_catalog=not args.no_catalog,
        auto_defringe=args.auto_defringe,
        overwrite=args.overwrite,
        dry_run=args.dry_run,
        contact_sheet=args.contact_sheet.resolve() if args.contact_sheet else None,
        run_export=args.export,
        sync_to=args.sync_to.resolve() if args.sync_to else None,
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if summary["failed"] > 0 and summary["ingested"] == 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
