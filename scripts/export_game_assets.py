#!/usr/bin/env python3
"""Deterministic offline WebP game-asset & pre-baked shadow exporter (Decision 0123).

Converts raw artist PNGs and JSON catalogs from `asset_labor/assets/` into a compact,
CDN-ready WebP asset pack for the unified TypeScript/WebGL2 `vedras-map-engine`:

  - `terrain/*.webp`: 512x512 seamless terrain textures for WebGL2 TEXTURE_2D_ARRAY
  - `atlases/nature_*.webp`: height-sorted, alpha-trimmed 2048x2048 WebP sprite atlases
    with 2px extruded gutters and exact preserved ground anchors (`Design.md §3.5`)
  - `atlases/shadows_*.webp`: offline pre-baked soft alpha shadow atlas reproducing
    all 155 hand-drawn shadow polygons (`sprite_shadow_profiles.json`), all 21 mountain
    distance-field casts (`shadow-system.js`), and automatic directional silhouette casts
    -> 0 ms runtime blur in the browser
  - `atlases/infra_*.webp`: walls (palisade + stone v7 + gates when present) & shorelines
  - `clouds/*.webp`: 512x512 Fog-of-War cloud artwork overlays
  - `manifest.json`: schema `vedras-game-assets-v1` with SHA-256 content hash, UVs,
    anchors, shadow bounds, and VRAM budget estimates.

Raw source PNGs under `assets/` are NEVER modified.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter, ImageStat

SCHEMA = "vedras-game-assets-v1"
PAGE_SIZE = 2048
GUTTER = 2

# Matches `sprite-planner.js` targetHeight profiles (world units at W_hex = 256).
TARGET_HEIGHT_PROFILES: dict[str, dict[str, float]] = {
    "ground_cover": {"tiny": 10, "small": 17, "medium": 27},
    "shrub": {"tiny": 22, "small": 34, "medium": 49, "large": 72},
    "cluster": {"small": 38, "medium": 69, "large": 105},
    "tree": {"tiny": 55, "small": 82, "medium": 126, "large": 174, "giant": 225},
    "rock": {"tiny": 12, "small": 35, "medium": 67, "large": 110},
    "mountain": {"giant": 310},
}
FALLBACK_SIZE_HEIGHT: dict[str, float] = {
    "tiny": 16,
    "small": 36,
    "medium": 75,
    "large": 130,
    "giant": 225,
}

# Smart per-kind maximum pixel side in the WebP atlas (saves massive VRAM on mobile
# while preserving crisp 2x HiDPI detail relative to W_hex = 256).
NATURE_MAX_SIDE_BY_KIND: dict[str, int] = {
    "mountain": 512,
    "tree": 384,
    "cluster": 384,
    "special": 384,
    "shrub": 256,
    "rock": 256,
    "ground_cover": 224,
}

# Canonical terrain aliases (geography-v2.1.2, worldgen-v0.1, untextured catalog stubs).
TERRAIN_ALIASES: dict[str, str] = {
    "coastal_waters": "coastal_water",
    "coast": "coastal_water",
    "snow_fields": "snowfields",
    "grazing_land": "pasture",
    "poor_grazing_land": "sparse_pasture",
    "marsh": "marshland",
    "barren_land": "badlands",
    "sandy_desert": "desert",
    "jungle": "forest_floor",
    "hilly_ground": "highland",
    "mountain_ground": "rocky_badlands",
    "dry_ground": "sparse_pasture",
}

# Mountain shadow defaults matching `shadow-system.js`.
MOUNTAIN_SHADOW_DEFAULTS: dict[str, float] = {
    "opacity": 0.44,
    "reach": 0.9,
    "softness": 17.0,
    "originX": -0.10,
    "originY": 0.015,
    "spread": 1.28,
    "contact": 1.10,
    "angle": 150.0,
    "length": 0.72,
    "rootWidth": 0.26,
    "midWidth": 0.21,
    "tipWidth": 0.105,
    "contactWidth": 0.16,
    "contactLength": 0.33,
}


def clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else (hi if v > hi else v)


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    denom = edge1 - edge0
    t = clamp((x - edge0) / (denom if denom != 0 else 1.0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def trim_alpha_bbox(rgba: Image.Image, threshold: int = 12) -> tuple[int, int, int, int]:
    """Return tight visible bounding box matching `app.js` `visibleBounds` (alpha > 12)."""
    alpha = rgba.getchannel("A")
    mask = alpha.point(lambda v: 255 if v > threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        return (0, 0, max(1, rgba.width), max(1, rgba.height))
    return bbox


def visual_world_width(meta: dict[str, Any], trim_w: int, trim_h: int) -> float:
    """Exact port of `sprite-planner.js` `visualWidth(meta, img, bounds)`."""
    kind = str(meta.get("kind") or "")
    size_mode = str(meta.get("sizeMode") or "manual")
    if size_mode != "class" or kind == "mountain":
        val = meta.get("logicalWidth")
        return float(val) if isinstance(val, (int, float)) and val > 0 else 52.0
    size_class = str(meta.get("sizeClass") or "medium")
    target_h = meta.get("targetHeight")
    if not isinstance(target_h, (int, float)) or target_h <= 0:
        target_h = TARGET_HEIGHT_PROFILES.get(kind, {}).get(
            size_class, FALLBACK_SIZE_HEIGHT.get(size_class, 65.0)
        )
    return clamp(float(target_h) * max(1, trim_w) / max(1, trim_h), 4.0, 400.0)


def extrude_sprite(page: Image.Image, sprite: Image.Image, x: int, y: int, gutter: int) -> None:
    """Paste sprite onto atlas page with extruded border pixels to avoid WebGL2 bleed."""
    w, h = sprite.size
    page.paste(sprite, (x, y))
    if gutter <= 0:
        return
    left_strip = sprite.crop((0, 0, 1, h))
    right_strip = sprite.crop((w - 1, 0, w, h))
    top_strip = sprite.crop((0, 0, w, 1))
    bottom_strip = sprite.crop((0, h - 1, w, h))
    tl = sprite.crop((0, 0, 1, 1))
    tr = sprite.crop((w - 1, 0, w, 1))
    bl = sprite.crop((0, h - 1, 1, h))
    br = sprite.crop((w - 1, h - 1, w, h))
    for p in range(1, gutter + 1):
        page.paste(left_strip, (x - p, y))
        page.paste(right_strip, (x + w - 1 + p, y))
        page.paste(top_strip, (x, y - p))
        page.paste(bottom_strip, (x, y + h - 1 + p))
        page.paste(tl, (x - p, y - p))
        page.paste(tr, (x + w - 1 + p, y - p))
        page.paste(bl, (x - p, y + h - 1 + p))
        page.paste(br, (x + w - 1 + p, y + h - 1 + p))


@dataclass
class PackedItem:
    key: str
    image: Image.Image
    metadata: dict[str, Any]
    extrude: bool = True


def pack_atlas_group(
    items: list[PackedItem],
    out_dir: Path,
    prefix: str,
    page_size: int,
    gutter: int,
    webp_quality: int,
) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    """Height-sorted shelf packer writing compact 2048x2048 RGBA WebP atlas pages."""
    out_dir.mkdir(parents=True, exist_ok=True)
    # Sort descending by height, then width, then deterministic key for tight packing.
    sorted_items = sorted(
        items, key=lambda it: (-it.image.height, -it.image.width, it.key)
    )

    pages_meta: list[dict[str, Any]] = []
    entries: dict[str, dict[str, Any]] = {}

    if not sorted_items:
        return pages_meta, entries

    page = Image.new("RGBA", (page_size, page_size), (0, 0, 0, 0))
    x = 0
    y = 0
    row_h = 0
    page_has_items = False

    def flush_page() -> None:
        nonlocal page, x, y, row_h, page_has_items
        if not page_has_items:
            return
        idx = len(pages_meta)
        filename = f"{prefix}_{idx:03d}.webp"
        dest = out_dir / filename
        # Trim unused bottom height on the final page (rounded up to a power-of-two
        # height) so partially filled last pages never waste GPU VRAM on mobile.
        used_h = min(page_size, y + row_h)
        target_h = page_size
        if used_h <= 512:
            target_h = 512
        elif used_h <= 1024:
            target_h = 1024
        save_img = page if target_h == page_size else page.crop((0, 0, page_size, target_h))
        save_img.save(dest, format="WEBP", quality=webp_quality, method=5)
        pages_meta.append(
            {
                "file": f"atlases/{filename}",
                "width": page_size,
                "height": target_h,
                "bytes": dest.stat().st_size,
            }
        )
        page = Image.new("RGBA", (page_size, page_size), (0, 0, 0, 0))
        x = 0
        y = 0
        row_h = 0
        page_has_items = False

    max_inner = page_size - 2 * gutter
    for item in sorted_items:
        img = item.image
        if img.width > max_inner or img.height > max_inner:
            scale = min(max_inner / img.width, max_inner / img.height)
            img = img.resize(
                (max(1, round(img.width * scale)), max(1, round(img.height * scale))),
                Image.Resampling.LANCZOS,
            )
        sw, sh = img.size
        ow = sw + 2 * gutter
        oh = sh + 2 * gutter
        if x + ow > page_size:
            x = 0
            y += row_h
            row_h = 0
        if y + oh > page_size:
            flush_page()
        px = x + gutter
        py = y + gutter
        if item.extrude:
            extrude_sprite(page, img, px, py, gutter)
        else:
            page.paste(img, (px, py))
        page_idx = len(pages_meta)
        entries[item.key] = {
            "page": page_idx,
            "rect": [px, py, sw, sh],
            **item.metadata,
        }
        x += ow
        row_h = max(row_h, oh)
        page_has_items = True

    flush_page()

    # Fill normalized UVs now that final page heights are known.
    for entry in entries.values():
        pm = pages_meta[entry["page"]]
        px, py, sw, sh = entry["rect"]
        pw, ph = pm["width"], pm["height"]
        entry["uv"] = [
            round(px / pw, 6),
            round(py / ph, 6),
            round((px + sw) / pw, 6),
            round((py + sh) / ph, 6),
        ]

    return pages_meta, entries


def compute_alpha_foot(trimmed: Image.Image, anchor_x: float, anchor_y: float) -> tuple[float, float]:
    """Port of `shadow-system.js` `alphaFoot(data, w, h, anchor)` for mountain casts."""
    w, h = trimmed.size
    if w <= 0 or h <= 0:
        return (-0.27, 0.0)
    # Downsample to <= 128px for fast, deterministic foot sampling (matches browser 64-110 samples).
    scale = min(1.0, 128.0 / max(w, h))
    sw = max(1, round(w * scale))
    sh = max(1, round(h * scale))
    sample = trimmed.resize((sw, sh), Image.Resampling.BILINEAR) if scale < 1.0 else trimmed
    alpha_bytes = sample.getchannel("A").tobytes()

    ay = clamp(anchor_y, 0.1, 0.95)
    ymin = max(0, int(math.floor(sh * (ay - 0.065))))
    ymax = min(sh - 1, int(math.ceil(sh * (ay + 0.135))))
    xs: list[float] = []
    ys: list[float] = []
    min_count = max(2.0, sw * 0.035)
    for yy in range(ymin, ymax + 1):
        row_off = yy * sw
        first = -1
        count = 0
        for xx in range(sw):
            if alpha_bytes[row_off + xx] >= 72:
                if first < 0:
                    first = xx
                count += 1
        if first >= 0 and count >= min_count:
            xs.append(first / sw)
            ys.append(yy / sh)
    if len(xs) < 3:
        return (-0.27, 0.0)
    xs.sort()
    ys.sort()
    med_x = xs[len(xs) // 2]
    med_y = ys[len(ys) // 2]
    return (
        clamp(med_x + 0.035 - anchor_x, -0.65, -0.08),
        clamp(med_y - ay, -0.14, 0.18),
    )


def bake_mountain_shadow(
    trimmed: Image.Image,
    meta: dict[str, Any],
    ref_width: float = 180.0,
) -> tuple[Image.Image, list[float], str] | None:
    """Monumental per-mountain 2.5D column-height raycast shadow + grounded contact rim.

    Combines each mountain's real individual peak/ridge silhouette with the broad,
    velvety valley presence of legacy `shadow-system.js` along the unified 142-deg
    oblique sun direction matching trees, boulders, and fortifications — with zero
    flank detachment gap and zero sunlit-right bleed.
    """
    mcfg = dict(MOUNTAIN_SHADOW_DEFAULTS)
    m_meta = meta.get("mountain") or {}
    if isinstance(m_meta.get("shadowOpacity"), (int, float)):
        mcfg["opacity"] = float(m_meta["shadowOpacity"])
    if mcfg["opacity"] <= 0:
        return None

    anchor = meta.get("anchor") or {}
    ax = clamp(float(anchor.get("x", 0.5)), 0.0, 1.0)
    ay = clamp(float(anchor.get("y", 0.67)), 0.0, 1.0)
    aspect = trimmed.height / max(1, trimmed.width)
    sw = max(32, int(round(ref_width)))
    sh = max(32, int(round(ref_width * aspect)))
    alpha_bytes = (
        trimmed.getchannel("A")
        .resize((sw, sh), Image.Resampling.BILINEAR)
        .tobytes()
    )

    col_top = [sh] * sw
    col_bottom = [-1] * sw
    for x in range(sw):
        for y in range(sh):
            if alpha_bytes[y * sw + x] >= 72:
                col_top[x] = y
                break
        if col_top[x] < sh:
            for y in range(sh - 1, -1, -1):
                if alpha_bytes[y * sw + x] >= 72:
                    col_bottom[x] = y
                    break

    valid = [x for x in range(sw) if col_bottom[x] >= 0]
    if not valid:
        return None

    # Smooth ridge-width ground plane: slightly wider vertical footprint for monumental mass
    ground_y = [ay * sh] * sw
    for x in valid:
        u = x / max(1, sw - 1)
        back_lift = (1.0 - min(1.0, u / 0.55)) * 0.14 * sh
        ground_y[x] = 0.62 * col_bottom[x] + 0.38 * (ay * sh) - back_lift

    # Unified sun cast matching trees/boulders/walls (~166-deg screen cast from upper-right)
    cast_dx = -1.32
    cast_dy = 0.27
    ox_px = ax * sw
    oy_px = ay * sh
    max_h = max(1.0, max(ground_y[x] - col_top[x] for x in valid))
    pad = 32
    min_x = int(math.floor(-ox_px + cast_dx * max_h - pad))
    max_x = int(math.ceil((sw - ox_px) + pad))
    min_y = int(math.floor(-oy_px - pad))
    max_y = int(math.ceil((sh - oy_px) + cast_dy * max_h + pad))
    cw = max(8, max_x - min_x)
    ch = max(8, max_y - min_y)

    mask = Image.new("L", (cw, ch), 0)
    draw = ImageDraw.Draw(mask)

    # 1. Exact per-mountain peak & ridge silhouette cast with soft penumbra cone widening
    for i in range(len(valid) - 1):
        x0 = valid[i]
        x1 = valid[i + 1]
        if x1 - x0 > 3:
            continue
        h0 = max(0.0, ground_y[x0] - col_top[x0])
        h1 = max(0.0, ground_y[x1] - col_top[x1])
        u0 = x0 / max(1, sw - 1)
        u1 = x1 / max(1, sw - 1)

        by0_top = ground_y[x0] - max(0.0, 0.52 - u0) * 0.62 * h0
        by1_top = ground_y[x1] - max(0.0, 0.52 - u1) * 0.62 * h1
        by0_bot = col_bottom[x0] if u0 < 0.62 else ground_y[x0]
        by1_bot = col_bottom[x1] if u1 < 0.62 else ground_y[x1]

        bx0 = x0 - ox_px - min_x
        bx1 = x1 - ox_px - min_x

        spread0 = 0.14 * h0
        spread1 = 0.14 * h1
        tx0 = bx0 + cast_dx * h0
        ty0_top = (by0_top - oy_px - min_y) + cast_dy * h0 - spread0 * 0.45
        ty0_bot = (by0_bot - oy_px - min_y) + cast_dy * h0 + spread0 * 0.55
        tx1 = bx1 + cast_dx * h1
        ty1_top = (by1_top - oy_px - min_y) + cast_dy * h1 - spread1 * 0.45
        ty1_bot = (by1_bot - oy_px - min_y) + cast_dy * h1 + spread1 * 0.55

        draw.polygon(
            [
                (bx0, by0_top - oy_px - min_y),
                (bx1, by1_top - oy_px - min_y),
                (tx1, ty1_top),
                (tx0, ty0_top),
            ],
            fill=255,
        )
        draw.polygon(
            [
                (bx0, by0_bot - oy_px - min_y),
                (bx1, by1_bot - oy_px - min_y),
                (tx1, ty1_bot),
                (tx0, ty0_bot),
            ],
            fill=255,
        )
        draw.polygon(
            [(tx0, ty0_top), (tx1, ty1_top), (tx1, ty1_bot), (tx0, ty0_bot)],
            fill=255,
        )
        if u0 < 0.62:
            draw.polygon(
                [
                    (bx0, by0_top - oy_px - min_y),
                    (bx1, by1_top - oy_px - min_y),
                    (bx1, by1_bot - oy_px - min_y),
                    (bx0, by0_bot - oy_px - min_y),
                ],
                fill=255,
            )

    # 2. Grounded mountain-foot contact rim under left-center base (zero detachment on 2.5D hills)
    cx_foot = -0.22 * sw - min_x
    cy_foot = 0.05 * sw - min_y
    rx_foot = 0.42 * sw
    ry_foot = 0.18 * sw
    draw.ellipse(
        [cx_foot - rx_foot, cy_foot - ry_foot, cx_foot + rx_foot, cy_foot + ry_foot],
        fill=215,
    )

    # 3. Smooth east-side clip (sunlit right grass stays crisp) + far-tip atmospheric dissolve
    buf = bytearray(mask.tobytes())
    clip_start = -0.02 * sw
    clip_end = 0.24 * sw
    inv_span = 1.0 / max(1.0, clip_end - clip_start)
    for py in range(ch):
        row = py * cw
        for px in range(cw):
            v = buf[row + px]
            if v == 0:
                continue
            wx = px + min_x
            if wx >= clip_end:
                buf[row + px] = 0
                continue
            fade = 1.0
            if wx > clip_start:
                t = (wx - clip_start) * inv_span
                fade *= 1.0 - t * t * (3.0 - 2.0 * t)
            if wx < -0.88 * sw:
                td = min(1.0, (-0.88 * sw - wx) / (0.68 * sw))
                fade *= 1.0 - 0.32 * td * td
            buf[row + px] = int(round(v * fade))
    mask = Image.frombytes("L", (cw, ch), bytes(buf))

    # 4. Velvety mountain-scale atmospheric penumbra blur
    blur_r = clamp(7.0 * (ref_width / 180.0), 4.0, 9.0)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=blur_r))
    lo_hi = mask.getextrema()
    peak = lo_hi[1] if isinstance(lo_hi, tuple) else 0
    if 32 < peak < 252:
        gain = min(2.0, 252.0 / peak)
        mask = mask.point(lambda v: min(255, int(round(v * gain))))

    bbox = mask.point(lambda v: 255 if v > 3 else 0).getbbox()
    if not bbox:
        return None
    cx0, cy0, cx1, cy1 = bbox
    cropped = mask.crop((cx0, cy0, cx1, cy1))
    out = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
    out.putalpha(cropped)
    bounds = [
        round((min_x + cx0) / ref_width, 5),
        round((min_y + cy0) / ref_width, 5),
        round((min_x + cx1) / ref_width, 5),
        round((min_y + cy1) / ref_width, 5),
    ]
    return out, bounds, "mountain_field"


def bake_sprite_shadow(
    trimmed: Image.Image,
    meta: dict[str, Any],
    profile: dict[str, Any],
    global_cfg: dict[str, Any],
    world_w: float,
    ref_width: float = 144.0,
) -> tuple[Image.Image, list[float], str] | None:
    """Offline pre-baked soft alpha shadow for manual polygons or auto directional casts."""
    kind = str(meta.get("kind") or "")
    if kind == "ground_decal":
        return None
    if kind == "mountain":
        return bake_mountain_shadow(trimmed, meta, ref_width=144.0)

    if profile.get("enabled") is False:
        return None
    shadow_meta = meta.get("shadow") or {}
    manual = profile.get("manual")
    has_manual = isinstance(manual, dict) and bool(manual.get("polygons"))
    if not has_manual and str(shadow_meta.get("mode") or "") == "none" and not profile:
        return None

    # Merge global defaults with per-sprite profile (matches sprite-shadow-editor.js).
    merged = dict(global_cfg)
    for k, v in profile.items():
        if k != "manual" and isinstance(v, (int, float)):
            merged[k] = float(v)
    if float(merged.get("opacity", 0.5)) <= 0:
        return None

    # Harmonize penumbra softness across all sprites (eliminates harsh 1px edges & washed blurs).
    softness = clamp(float(merged.get("softness", 4.5)), 2.8, 6.2)
    # Screen-consistent softness (do NOT blow up blur 3x on small 52px sprites like cacti!).
    blur_px = clamp(softness * 0.55, 1.4, 5.2)
    pad = int(math.ceil(blur_px * 3.0)) + 4
    offset_x = float(merged.get("offsetX", -0.12))
    offset_y = float(merged.get("offsetY", -0.03))
    contact = float(merged.get("contact", 0.7))

    if has_manual:
        polygons: list[list[list[float]]] = manual["polygons"]
        xs = [pt[0] * ref_width for poly in polygons for pt in poly]
        ys = [pt[1] * ref_width for poly in polygons for pt in poly]
        if kind == "rock" and contact > 0:
            ox = ref_width * (offset_x - 0.10)
            oy = ref_width * offset_y
            xs.extend([ox - ref_width * 0.23, ox + ref_width * 0.23])
            ys.extend([oy - ref_width * 0.075, oy + ref_width * 0.075])
        x0 = int(math.floor(min(xs))) - pad
        y0 = int(math.floor(min(ys))) - pad
        x1 = int(math.ceil(max(xs))) + pad
        y1 = int(math.ceil(max(ys))) + pad
        bw = max(4, min(512, x1 - x0))
        bh = max(4, min(512, y1 - y0))
        # Clamp oversized canvas cleanly if extreme polygon coordinates exist.
        scale = min(1.0, 384.0 / max(bw, bh))
        cw = max(4, round((x1 - x0) * scale))
        ch = max(4, round((y1 - y0) * scale))

        mask = Image.new("L", (cw, ch), 0)
        draw = ImageDraw.Draw(mask)
        if kind == "rock" and contact > 0:
            ox = (ref_width * (offset_x - 0.10) - x0) * scale
            oy = (ref_width * offset_y - y0) * scale
            rx = ref_width * 0.23 * scale
            ry = max(1.0, ref_width * 0.075 * scale)
            draw.ellipse([ox - rx, oy - ry, ox + rx, oy + ry], fill=255)
        for poly in polygons:
            if len(poly) < 3:
                continue
            pts = [((pt[0] * ref_width - x0) * scale, (pt[1] * ref_width - y0) * scale) for pt in poly]
            draw.polygon(pts, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(radius=clamp(blur_px * 0.72 * scale, 1.1, 4.5)))
        # Normalize blurred peak so every shadow matches one unified neutral gray/black tone!
        lo_hi = mask.getextrema()
        peak = lo_hi[1] if isinstance(lo_hi, tuple) else 0
        if 24 < peak < 252:
            gain = min(2.4, 252.0 / peak)
            mask = mask.point(lambda v: min(255, int(round(v * gain))))
        bbox = mask.point(lambda v: 255 if v > 3 else 0).getbbox()
        if not bbox:
            return None
        cx0, cy0, cx1, cy1 = bbox
        cropped = mask.crop((cx0, cy0, cx1, cy1))
        out = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
        out.putalpha(cropped)
        bounds = [
            round((x0 + cx0 / scale) / ref_width, 5),
            round((y0 + cy0 / scale) / ref_width, 5),
            round((x0 + cx1 / scale) / ref_width, 5),
            round((y0 + cy1 / scale) / ref_width, 5),
        ]
        return out, bounds, "manual_polygon"

    # Automatic directional silhouette cast + contact ellipse (`sprite-shadow-editor.js:97-120`).
    family = str(meta.get("family") or "")
    is_log = family == "snow_fallen_logs"
    anchor = meta.get("anchor") or {}
    ax = clamp(float(anchor.get("x", 0.5)), 0.0, 1.0)
    ay = clamp(float(anchor.get("y", 0.96)), 0.0, 1.0)
    aspect = trimmed.height / max(1, trimmed.width)
    ref_h = ref_width * aspect

    # Harmonize auto-cast sun direction around global 142 deg & clamp outlier shadow lengths by kind!
    angle = clamp(float(merged.get("angle", 142.0)), 136.0, 148.0)
    raw_len = float(merged.get("length", 0.72))
    if kind == "tree":
        length_f = clamp(raw_len, 0.58, 1.15)
    elif kind == "ground_cover":
        length_f = clamp(raw_len, 0.42, 0.72)
    else:
        length_f = clamp(raw_len, 0.50, 0.96)
    width_f = clamp(float(merged.get("width", 0.91)), 0.35, 1.35)
    rad = math.radians(angle)
    reach = ref_width * length_f
    cast_x = reach * math.cos(rad)
    cast_y = reach * math.sin(rad) * (0.14 if is_log else 0.30)
    ox = ref_width * offset_x
    oy = ref_width * offset_y
    slant = 0.01 if is_log else 0.035

    # Forward affine transform from sprite-local (lx, ly) to anchor-relative shadow (px, py):
    #   px = ox + width_f * lx - (cast_x / ref_h) * ly
    #   py = oy + slant * lx   - (cast_y / ref_h) * ly
    a11 = width_f
    a12 = -cast_x / max(1.0, ref_h)
    a21 = slant
    a22 = -cast_y / max(1.0, ref_h)
    det = a11 * a22 - a12 * a21
    if abs(det) < 1e-6:
        return None

    corners_x = [-ref_width * ax, ref_width * (1.0 - ax)]
    corners_y = [-ref_h * ay, 0.0]
    proj_x = [ox + a11 * lx + a12 * ly for lx in corners_x for ly in corners_y]
    proj_y = [oy + a21 * lx + a22 * ly for lx in corners_x for ly in corners_y]

    c_x = ox + cast_x * (0.40 if is_log else 0.22)
    c_y = oy + cast_y * (0.36 if is_log else 0.20)
    c_rx = ref_width * (0.53 if is_log else 0.24) * max(0.25, width_f) * (1.0 + contact)
    c_ry = ref_width * (0.075 if is_log else 0.085) * (contact + 0.25)
    if contact > 0:
        proj_x.extend([c_x - c_rx, c_x + c_rx])
        proj_y.extend([c_y - c_ry, c_y + c_ry])

    x0 = int(math.floor(min(proj_x))) - pad
    y0 = int(math.floor(min(proj_y))) - pad
    x1 = int(math.ceil(max(proj_x))) + pad
    y1 = int(math.ceil(max(proj_y))) + pad
    bw = max(4, x1 - x0)
    bh = max(4, y1 - y0)
    scale = min(1.0, 256.0 / max(bw, bh))
    cw = max(4, round(bw * scale))
    ch = max(4, round(bh * scale))

    # Source silhouette cropped to rows above ground anchor (y <= ay * height).
    src_alpha = trimmed.getchannel("A")
    cut_y = max(1, min(src_alpha.height, int(round(src_alpha.height * ay))))
    src_alpha = src_alpha.crop((0, 0, src_alpha.width, cut_y))
    # Map output pixel (ix, iy) -> anchor-relative (px, py) -> sprite-local (lx, ly) -> source pixel (sx, sy).
    # px = x0 + ix / scale, py = y0 + iy / scale
    # lx = (a22*(px - ox) - a12*(py - oy)) / det
    # ly = (-a21*(px - ox) + a11*(py - oy)) / det
    # sx = (lx + ref_width * ax) * (src_w / ref_width)
    # sy = (ly + ref_h * ay) * (src_h / (ref_h * ay))
    sx_scale = src_alpha.width / ref_width
    sy_scale = src_alpha.height / max(1.0, ref_h * ay)

    inv11 = a22 / det
    inv12 = -a12 / det
    inv21 = -a21 / det
    inv22 = a11 / det

    ma = (inv11 / scale) * sx_scale
    mb = (inv12 / scale) * sx_scale
    mc = (inv11 * (x0 - ox) + inv12 * (y0 - oy) + ref_width * ax) * sx_scale
    md = (inv21 / scale) * sy_scale
    me = (inv22 / scale) * sy_scale
    mf = (inv21 * (x0 - ox) + inv22 * (y0 - oy) + ref_h * ay) * sy_scale

    cast_mask = src_alpha.transform(
        (cw, ch),
        Image.Transform.AFFINE,
        (ma, mb, mc, md, me, mf),
        resample=Image.Resampling.BILINEAR,
    )
    # Normalize alpha silhouette to crisp solid shape before applying Gaussian softness
    # (matches shadow-tone.js withMaskPass() full-opacity union mask before single composite).
    cast_mask = cast_mask.point(lambda v: 255 if v > 32 else int(v * 255 / 32))
    eff_blur = clamp(blur_px * 0.65 * scale, 1.0, 5.5)
    cast_mask = cast_mask.filter(ImageFilter.GaussianBlur(radius=eff_blur))

    if contact > 0:
        contact_mask = Image.new("L", (cw, ch), 0)
        cdraw = ImageDraw.Draw(contact_mask)
        ecx = (c_x - x0) * scale
        ecy = (c_y - y0) * scale
        erx = c_rx * scale
        ery = max(1.0, c_ry * scale)
        cdraw.ellipse([ecx - erx, ecy - ery, ecx + erx, ecy + ery], fill=255)
        contact_mask = contact_mask.filter(
            ImageFilter.GaussianBlur(radius=max(0.8, eff_blur * 0.65))
        )
        # Union max(cast, contact) so contact grounds the foot without over-darkening.
        cb = cast_mask.tobytes()
        kb = contact_mask.tobytes()
        merged_bytes = bytes(a if a >= b else b for a, b in zip(cb, kb))
        cast_mask = Image.frombytes("L", (cw, ch), merged_bytes)

    lo_hi = cast_mask.getextrema()
    peak = lo_hi[1] if isinstance(lo_hi, tuple) else 0
    if 24 < peak < 252:
        gain = min(2.2, 252.0 / peak)
        cast_mask = cast_mask.point(lambda v: min(255, int(round(v * gain))))

    bbox = cast_mask.point(lambda v: 255 if v > 3 else 0).getbbox()
    if not bbox:
        return None
    cx0, cy0, cx1, cy1 = bbox
    cropped = cast_mask.crop((cx0, cy0, cx1, cy1))
    out = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
    out.putalpha(cropped)
    bounds = [
        round((x0 + cx0 / scale) / ref_width, 5),
        round((y0 + cy0 / scale) / ref_width, 5),
        round((x0 + cx1 / scale) / ref_width, 5),
        round((y0 + cy1 / scale) / ref_width, 5),
    ]
    return out, bounds, "auto_cast"


def repair_seamless_terrain(
    rgb: Image.Image,
    center_stripe: bool = False,
    edge_band: int = 32,
) -> Image.Image:
    """Exact 1:1 port of `asset_labor/water-texture.js` `repairPixels` for seamless WebGL2 tiles.

    - Repairs straight vertical center split seams in water artwork (`center_stripe=True`)
    - Smoothly blends outer `edge_band` texels across opposite edges (`8` for water, `32` for ground)
    - Raw PNG files on disk are NEVER modified.
    """
    w, h = rgb.size
    if w < 24 or h < 24:
        return rgb
    raw = rgb.tobytes()
    out = bytearray(raw)
    stride = w * 3

    if center_stripe:
        for cx in (w // 2 - 1, w // 2, w // 2 + 1):
            if cx < 3 or cx >= w - 3:
                continue
            hit = 0
            rows = 0
            for y in range(4, h - 4, 4):
                row_off = y * stride
                i_c = row_off + cx * 3
                i_l = row_off + (cx - 3) * 3
                i_r = row_off + (cx + 3) * 3
                dev = (
                    abs(raw[i_c] - 0.5 * (raw[i_l] + raw[i_r]))
                    + abs(raw[i_c + 1] - 0.5 * (raw[i_l + 1] + raw[i_r + 1]))
                    + abs(raw[i_c + 2] - 0.5 * (raw[i_l + 2] + raw[i_r + 2]))
                ) / 3.0
                if dev > 26.0:
                    hit += 1
                rows += 1
            if rows and hit / rows > 0.72:
                for y in range(h):
                    row_off = y * stride
                    i_l = row_off + (cx - 3) * 3
                    i_r = row_off + (cx + 3) * 3
                    lr, lg, lb = raw[i_l], raw[i_l + 1], raw[i_l + 2]
                    rr, rg, rb = raw[i_r], raw[i_r + 1], raw[i_r + 2]
                    for dx in range(-2, 3):
                        t = (dx + 3) / 6.0
                        inv_t = 1.0 - t
                        i_x = row_off + (cx + dx) * 3
                        out[i_x] = int(round(lr * inv_t + rr * t))
                        out[i_x + 1] = int(round(lg * inv_t + rg * t))
                        out[i_x + 2] = int(round(lb * inv_t + rb * t))
                break

    band = max(1, min(int(edge_band), min(w, h) // 6))
    weights = [0.5 * (1.0 - smoothstep(0.0, 1.0, d / band)) for d in range(band)]

    # Left <-> Right wrap feather
    for y in range(h):
        row_off = y * stride
        for d in range(band):
            wt = weights[d]
            inv_wt = 1.0 - wt
            ia = row_off + d * 3
            ib = row_off + (w - 1 - d) * 3
            for c in range(3):
                first = out[ia + c]
                last = out[ib + c]
                out[ia + c] = int(round(first * inv_wt + last * wt))
                out[ib + c] = int(round(last * inv_wt + first * wt))

    # Top <-> Bottom wrap feather
    for d in range(band):
        wt = weights[d]
        inv_wt = 1.0 - wt
        top_off = d * stride
        bot_off = (h - 1 - d) * stride
        for x in range(stride):
            first = out[top_off + x]
            last = out[bot_off + x]
            out[top_off + x] = int(round(first * inv_wt + last * wt))
            out[bot_off + x] = int(round(last * inv_wt + first * wt))

    return Image.frombytes("RGB", (w, h), bytes(out))


def polish_terrain_rgb(
    rgb: Image.Image,
    material_class: str,
    terrain_id: str,
    amount: float = 0.35,
) -> Image.Image:
    """Exact 1:1 port of `asset_labor/polish.js` `terrainRGB` (gentle ground contrast/saturation balance)."""
    v = clamp(amount, 0.0, 1.0)
    if v <= 0.0 or material_class != "ground" or terrain_id in ("snowfields", "frozen_tundra", "forest_floor"):
        return rgb
    contrast = 1.0 - 0.12 * v
    saturation = 1.0 - 0.14 * v
    raw = rgb.tobytes()
    out = bytearray(len(raw))
    for i in range(0, len(raw), 3):
        r = raw[i]
        g = raw[i + 1]
        b = raw[i + 2]
        y = 0.2126 * r + 0.7152 * g + 0.0722 * b
        nr = (y + (r - y) * saturation - 128.0) * contrast + 128.0
        ng = (y + (g - y) * saturation - 128.0) * contrast + 128.0
        nb = (y + (b - y) * saturation - 128.0) * contrast + 128.0
        out[i] = 0 if nr < 0 else (255 if nr > 255 else int(round(nr)))
        out[i + 1] = 0 if ng < 0 else (255 if ng > 255 else int(round(ng)))
        out[i + 2] = 0 if nb < 0 else (255 if nb > 255 else int(round(nb)))
    return Image.frombytes("RGB", rgb.size, bytes(out))


def export_terrain(
    assets_dir: Path,
    out_dir: Path,
    terrain_size: int,
    max_variants: int,
    webp_quality: int,
) -> tuple[dict[str, Any], int]:
    """Export seamless WebP terrain layers + catalog mapping for GPU TEXTURE_2D_ARRAY."""
    tc_path = assets_dir / "terrain" / "terrain_catalog.json"
    tc = json.loads(tc_path.read_text(encoding="utf-8"))
    terrain_out = out_dir / "terrain"
    terrain_out.mkdir(parents=True, exist_ok=True)

    by_type_raw: dict[str, list[str]] = {}
    for rel_path, meta in sorted(tc.get("assets", {}).items()):
        tid = str(meta.get("terrainTypeId") or "")
        if tid:
            by_type_raw.setdefault(tid, []).append(rel_path)

    layers: list[dict[str, Any]] = []
    by_type: dict[str, dict[str, Any]] = {}
    raw_bytes = 0

    for tt in tc.get("terrainTypes", []):
        tid = str(tt["id"])
        material_class = str(tt.get("materialClass") or "ground")
        is_water = material_class == "water"
        files = sorted(by_type_raw.get(tid, []))[:max_variants]
        if not files:
            continue
        layer_indices: list[int] = []
        color_acc = [0.0, 0.0, 0.0]
        for v_idx, rel_path in enumerate(files):
            src = assets_dir / rel_path
            if not src.is_file():
                continue
            raw_bytes += src.stat().st_size
            with Image.open(src) as im:
                rgb = im.convert("RGB")
                resized = rgb.resize((terrain_size, terrain_size), Image.Resampling.LANCZOS)
                # Apply 1:1 asset_labor seamless tile & water center-seam repair offline (0 ms runtime!).
                repaired = repair_seamless_terrain(
                    resized,
                    center_stripe=is_water,
                    edge_band=8 if is_water else 32,
                )
                polished = polish_terrain_rgb(repaired, material_class, tid, amount=0.35)
                mean = ImageStat.Stat(polished).mean
                for c in range(3):
                    color_acc[c] += mean[c]
                fname = f"{tid}_{v_idx:02d}.webp"
                dest = terrain_out / fname
                polished.save(dest, format="WEBP", quality=webp_quality, method=5)
            layer_idx = len(layers)
            layer_indices.append(layer_idx)
            layers.append(
                {
                    "layer": layer_idx,
                    "terrainTypeId": tid,
                    "variant": v_idx,
                    "file": f"terrain/{fname}",
                    "source": f"assets/{rel_path}",
                    "width": terrain_size,
                    "height": terrain_size,
                    "bytes": dest.stat().st_size,
                }
            )
        if layer_indices:
            n = len(layer_indices)
            by_type[tid] = {
                "layers": layer_indices,
                "categoryId": tt.get("categoryId"),
                "materialClass": material_class,
                "transitionProfileId": tt.get("transitionProfileId", "standard_ground"),
                "avgColor": [int(round(color_acc[c] / n)) for c in range(3)],
            }

    # Resolve untextured catalog types & geography-v2.1.2 / worldgen-v0.1 aliases.
    for alias, target in sorted(TERRAIN_ALIASES.items()):
        if alias not in by_type and target in by_type:
            by_type[alias] = {**by_type[target], "aliasOf": target}

    return {
        "textureSize": terrain_size,
        "maxVariantsPerType": max_variants,
        "layerCount": len(layers),
        "layers": layers,
        "byType": by_type,
        "transitionProfiles": tc.get("transitionProfiles", []),
    }, raw_bytes


def export_nature_and_shadows(
    assets_dir: Path,
    out_dir: Path,
    page_size: int,
    webp_quality: int,
    shadow_quality: int,
) -> tuple[dict[str, Any], dict[str, Any], int]:
    """Export trimmed WebP nature sprite atlases AND offline pre-baked soft shadow atlases."""
    nc_path = assets_dir / "nature" / "nature_catalog.json"
    sc_path = assets_dir / "shadows" / "sprite_shadow_profiles.json"
    nc = json.loads(nc_path.read_text(encoding="utf-8"))
    sc = json.loads(sc_path.read_text(encoding="utf-8"))
    global_shadow = sc.get("global", {})
    shadow_profiles: dict[str, dict[str, Any]] = sc.get("profiles", {})

    nature_items: list[PackedItem] = []
    shadow_items: list[PackedItem] = []
    shadow_counts = {"manual_polygon": 0, "mountain_field": 0, "auto_cast": 0, "none": 0}
    raw_bytes = 0

    for rel_key, meta in sorted(nc.get("entries", {}).items()):
        src = assets_dir / rel_key
        if not src.is_file():
            continue
        raw_bytes += src.stat().st_size
        asset_key = f"assets/{rel_key}"
        kind = str(meta.get("kind") or "tree")
        max_side = NATURE_MAX_SIDE_BY_KIND.get(kind, 320)

        with Image.open(src) as im:
            rgba = im.convert("RGBA")
            src_w, src_h = rgba.size
            x0, y0, x1, y1 = trim_alpha_bbox(rgba, threshold=12)
            trimmed = rgba.crop((x0, y0, x1, y1))

        trim_w, trim_h = trimmed.size
        world_w = visual_world_width(meta, trim_w, trim_h)
        world_h = world_w * (trim_h / max(1, trim_w))
        # Target crisp ~1.8 px per logical world unit (2x HiDPI crispness at normal zoom),
        # bounded by [48 .. kind_cap], eliminating 5x-7x oversampling on small shrubs/props.
        desired_px = int(math.ceil(max(world_w, world_h) * 1.8))
        target_side = max(48, min(max_side, desired_px))
        scale = min(1.0, target_side / max(trim_w, trim_h))
        if scale < 1.0:
            packed_img = trimmed.resize(
                (max(1, round(trim_w * scale)), max(1, round(trim_h * scale))),
                Image.Resampling.LANCZOS,
            )
        else:
            packed_img = trimmed

        anchor = meta.get("anchor") or {"x": 0.5, "y": 0.96}
        ax = round(clamp(float(anchor.get("x", 0.5)), 0.0, 1.0), 4)
        ay = round(clamp(float(anchor.get("y", 0.96)), 0.0, 1.0), 4)

        # Pre-bake shadow offline from trimmed image + artist shadow profile.
        profile = shadow_profiles.get(asset_key) or shadow_profiles.get(rel_key) or {}
        baked = bake_sprite_shadow(
            trimmed, meta, profile, global_shadow, world_w, ref_width=96.0
        )
        has_shadow = baked is not None
        if baked is not None:
            shadow_img, shadow_bounds, shadow_mode = baked
            shadow_counts[shadow_mode] += 1
            shadow_items.append(
                PackedItem(
                    key=asset_key,
                    image=shadow_img,
                    metadata={
                        "mode": shadow_mode,
                        "boundsInSpriteWidth": shadow_bounds,
                    },
                    extrude=False,
                )
            )
        else:
            shadow_counts["none"] += 1

        entry_meta: dict[str, Any] = {
            "id": meta.get("id"),
            "kind": kind,
            "family": meta.get("family"),
            "sizeClass": meta.get("sizeClass"),
            "sizeMode": meta.get("sizeMode", "manual"),
            "sourceReference": meta.get("sourceReference", ""),
            "artStatus": meta.get("artStatus", "candidate"),
            "tags": meta.get("tags", []),
            "terrainPresetId": meta.get("terrainPresetId", ""),
            "sourceSize": [src_w, src_h],
            "trim": [x0, y0, trim_w, trim_h],
            "aspect": round(trim_h / max(1, trim_w), 5),
            "worldWidth": round(world_w, 2),
            "scaleRange": [
                round(float(meta.get("scaleMin", 0.85)), 3),
                round(float(meta.get("scaleMax", 1.15)), 3),
            ],
            "anchor": [ax, ay],
            "allowedTerrainCategories": meta.get("allowedTerrainCategories", []),
            "allowedTerrainTypes": meta.get("allowedTerrainTypes", []),
            "excludedTerrainTypes": meta.get("excludedTerrainTypes", []),
            "placement": meta.get("placement", {}),
            "hasShadow": has_shadow,
        }
        if isinstance(meta.get("mountain"), dict):
            entry_meta["mountain"] = meta["mountain"]

        nature_items.append(
            PackedItem(
                key=asset_key,
                image=packed_img,
                metadata=entry_meta,
                extrude=True,
            )
        )

    shadow_items.extend(bake_wall_shadows(global_shadow))
    shadow_items.extend(bake_building_shadows(assets_dir, global_shadow))

    atlases_dir = out_dir / "atlases"
    nature_pages, nature_entries = pack_atlas_group(
        nature_items, atlases_dir, "nature", page_size, GUTTER, webp_quality
    )
    shadow_pages, shadow_entries = pack_atlas_group(
        shadow_items, atlases_dir, "shadows", page_size, GUTTER, shadow_quality
    )

    return (
        {
            "pages": nature_pages,
            "spriteCount": len(nature_entries),
            "presets": nc.get("presets", {}),
            "sprites": nature_entries,
        },
        {
            "global": global_shadow,
            "counts": shadow_counts,
            "pages": shadow_pages,
            "spriteCount": len(shadow_entries),
            "sprites": shadow_entries,
        },
        raw_bytes,
    )


def _convex_hull_2d(pts: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Monotone chain 2D convex hull matching `walls.js:192-202` `sweptFootprint`."""
    uniq = sorted(set(pts))
    if len(uniq) <= 2:
        return uniq

    def cross(o: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower: list[tuple[float, float]] = []
    for p in uniq:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 1e-8:
            lower.pop()
        lower.append(p)
    upper: list[tuple[float, float]] = []
    for p in reversed(uniq):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 1e-8:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def bake_wall_shadows(global_cfg: dict[str, Any]) -> list[PackedItem]:
    """Pre-bake exact `walls.js:182-233` swept ground shadows for stone/palisade edges & posts.

    Bounds are normalized by `ref_scale = 100.0` world units relative to vertex A (for edges)
    or vertex center (for corner/end posts), so Layer 3 `gl.MAX` union composites them with
    zero double-darkening at shared wall corners and zero extra draw calls!
    """
    ref_scale = 100.0
    hex_r = 256.0 / math.sqrt(3.0)
    proj_y = 0.85
    angle_deg = float(global_cfg.get("angle", 160.0))
    wall_rad = math.radians(clamp(angle_deg, 130.0, 172.0))
    wall_h = 62.0
    wall_len = 1.05
    base_dx = math.cos(wall_rad) * wall_h * wall_len
    base_dy = math.sin(wall_rad) * wall_h * wall_len * 0.30
    sx = -0.07 * wall_h
    sy = 0.025 * wall_h
    blur_px = 3.2
    pad = int(math.ceil(blur_px * 3.0)) + 4
    px_per_wu = 0.85

    items: list[PackedItem] = []

    def pack_mask(key: str, mask: Image.Image, x0: float, y0: float) -> None:
        blurred = mask.filter(ImageFilter.GaussianBlur(radius=blur_px * px_per_wu))
        lo_hi = blurred.getextrema()
        peak = lo_hi[1] if isinstance(lo_hi, tuple) else 0
        if 24 < peak < 248:
            gain = min(2.0, 250.0 / peak)
            blurred = blurred.point(lambda v: min(255, int(round(v * gain))))
        bbox = blurred.point(lambda v: 255 if v > 3 else 0).getbbox()
        if not bbox:
            return
        cx0, cy0, cx1, cy1 = bbox
        cropped = blurred.crop((cx0, cy0, cx1, cy1))
        out = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
        out.putalpha(cropped)
        bounds = [
            round((x0 + cx0 / px_per_wu) / ref_scale, 5),
            round((y0 + cy0 / px_per_wu) / ref_scale, 5),
            round((x0 + cx1 / px_per_wu) / ref_scale, 5),
            round((y0 + cy1 / px_per_wu) / ref_scale, 5),
        ]
        items.append(
            PackedItem(
                key=key,
                image=out,
                metadata={
                    "mode": "wall_swept",
                    "boundsInSpriteWidth": bounds,
                },
                extrude=False,
            )
        )

    for material in ("stone", "palisade"):
        thickness = 24.0 if material == "stone" else 16.0
        reach = 0.62 if material == "stone" else 1.0
        cast_x = base_dx * reach + sx
        cast_y = base_dy * reach + sy
        stroke_w = 11.0 if material == "stone" else 7.0

        for side in range(6):
            ang_a = -math.pi * 0.5 + side * math.pi / 3.0
            ang_b = -math.pi * 0.5 + ((side + 1) % 6) * math.pi / 3.0
            ax, ay = hex_r * math.cos(ang_a), hex_r * math.sin(ang_a) * proj_y
            bx, by = hex_r * math.cos(ang_b), hex_r * math.sin(ang_b) * proj_y
            p_a = (0.0, 0.0)
            p_b = (bx - ax, by - ay)
            dx, dy = p_b[0], p_b[1]
            seg_len = math.hypot(dx, dy)
            nx, ny = -dy / seg_len, dx / seg_len
            if ny < 0.0 or (abs(ny) < 1e-9 and nx < 0.0):
                nx, ny = -nx, -ny
            dep_x, dep_y = nx * thickness * 0.5, ny * thickness * 0.62 * 0.5
            base_pts = [
                (p_a[0] - dep_x, p_a[1] - dep_y),
                (p_b[0] - dep_x, p_b[1] - dep_y),
                (p_b[0] + dep_x, p_b[1] + dep_y),
                (p_a[0] + dep_x, p_a[1] + dep_y),
            ]
            cast_pts = [(px + cast_x, py + cast_y) for px, py in base_pts]
            hull = _convex_hull_2d(base_pts + cast_pts)
            xs = [p[0] for p in hull] + [p_a[0], p_b[0]]
            ys = [p[1] for p in hull] + [p_a[1], p_b[1]]
            x0 = math.floor(min(xs) - stroke_w) - pad
            y0 = math.floor(min(ys) - stroke_w) - pad
            x1 = math.ceil(max(xs) + stroke_w) + pad
            y1 = math.ceil(max(ys) + stroke_w) + pad
            cw = max(8, int(round((x1 - x0) * px_per_wu)))
            ch = max(8, int(round((y1 - y0) * px_per_wu)))
            mask = Image.new("L", (cw, ch), 0)
            draw = ImageDraw.Draw(mask)
            draw.polygon([((px - x0) * px_per_wu, (py - y0) * px_per_wu) for px, py in hull], fill=255)
            draw.line(
                [
                    ((p_a[0] - x0) * px_per_wu, (p_a[1] - y0) * px_per_wu),
                    ((p_b[0] - x0) * px_per_wu, (p_b[1] - y0) * px_per_wu),
                ],
                fill=255,
                width=max(2, int(round(stroke_w * px_per_wu))),
            )
            pack_mask(f"wall_shadow:{material}:dir{side}", mask, float(x0), float(y0))

        post_rx = 22.0 if material == "stone" else 13.0
        post_ry = post_rx * 0.65
        ring = [
            (post_rx * math.cos(k * math.pi / 6.0), post_ry * math.sin(k * math.pi / 6.0))
            for k in range(12)
        ]
        hull_p = _convex_hull_2d(ring + [(px + cast_x * 1.05, py + cast_y * 1.05) for px, py in ring])
        xs = [p[0] for p in hull_p]
        ys = [p[1] for p in hull_p]
        x0 = math.floor(min(xs)) - pad
        y0 = math.floor(min(ys)) - pad
        x1 = math.ceil(max(xs)) + pad
        y1 = math.ceil(max(ys)) + pad
        cw = max(8, int(round((x1 - x0) * px_per_wu)))
        ch = max(8, int(round((y1 - y0) * px_per_wu)))
        mask = Image.new("L", (cw, ch), 0)
        draw = ImageDraw.Draw(mask)
        draw.polygon([((px - x0) * px_per_wu, (py - y0) * px_per_wu) for px, py in hull_p], fill=255)
        pack_mask(f"wall_shadow:{material}:post", mask, float(x0), float(y0))

    # Directional water/bank drop shadows for the 3 bridge crossing axes (dir 0/3 = -55.8 deg, 1/4 = 0 deg, 2/5 = +55.8 deg).
    bridge_axes = [
        (0, math.radians(-55.81)),
        (1, 0.0),
        (2, math.radians(55.81)),
    ]
    b_half_len = 46.0
    b_half_wid = 16.5
    b_cast_x = base_dx * 0.28 + sx * 0.45
    b_cast_y = base_dy * 0.28 + sy * 0.45 + 6.5
    for axis_idx, rad in bridge_axes:
        tx, ty = math.cos(rad), math.sin(rad)
        nx, ny = -ty, tx
        deck_pts = [
            (tx * (-b_half_len) + nx * (-b_half_wid), ty * (-b_half_len) + ny * (-b_half_wid)),
            (tx * b_half_len + nx * (-b_half_wid), ty * b_half_len + ny * (-b_half_wid)),
            (tx * b_half_len + nx * b_half_wid, ty * b_half_len + ny * b_half_wid),
            (tx * (-b_half_len) + nx * b_half_wid, ty * (-b_half_len) + ny * b_half_wid),
        ]
        cast_pts = [(px + b_cast_x, py + b_cast_y) for px, py in deck_pts]
        hull_b = _convex_hull_2d(deck_pts + cast_pts)
        xs = [p[0] for p in hull_b]
        ys = [p[1] for p in hull_b]
        x0 = math.floor(min(xs)) - pad
        y0 = math.floor(min(ys)) - pad
        x1 = math.ceil(max(xs)) + pad
        y1 = math.ceil(max(ys)) + pad
        cw = max(8, int(round((x1 - x0) * px_per_wu)))
        ch = max(8, int(round((y1 - y0) * px_per_wu)))
        mask = Image.new("L", (cw, ch), 0)
        draw = ImageDraw.Draw(mask)
        draw.polygon([((px - x0) * px_per_wu, (py - y0) * px_per_wu) for px, py in hull_b], fill=255)
        pack_mask(f"bridge_shadow:axis{axis_idx}", mask, float(x0), float(y0))

    return items


BUILDING_SHADOW_ANCHORS: dict[str, tuple[float, float]] = {
    "buildings/tier1/watchtower": (0.5, 0.87),
    "buildings/tier1/quarry": (0.5, 0.68),
    "buildings/tier1/farm": (0.5, 0.70),
    "buildings/centers/capital_t1": (0.5, 0.74),
    "buildings/tier1/fortress": (0.5, 0.74),
}


def bake_building_shadows(
    assets_dir: Path,
    global_cfg: dict[str, Any],
) -> list[PackedItem]:
    """Pre-bake unified 142-deg soft ground shadows for all painted settlement centers & buildings."""
    bldg_root = assets_dir / "buildings"
    if not bldg_root.is_dir():
        return []
    items: list[PackedItem] = []
    for path in sorted(bldg_root.rglob("*.png")):
        rel = path.relative_to(bldg_root).as_posix()
        logical_key = f"buildings/{rel.rsplit('.', 1)[0]}"
        ax, ay = BUILDING_SHADOW_ANCHORS.get(logical_key, (0.5, 0.72))
        with Image.open(path) as im:
            rgba = im.convert("RGBA")
            x0, y0, x1, y1 = trim_alpha_bbox(rgba, threshold=12)
            trimmed = rgba.crop((x0, y0, x1, y1))
        is_tall = logical_key.endswith("watchtower") or logical_key.endswith("capital_t1")
        meta = {
            "kind": "building",
            "anchor": {"x": ax, "y": ay},
            "shadow": {"mode": "generic_large_round"},
        }
        profile = {
            "angle": 142.0,
            "length": 0.78 if is_tall else 0.56,
            "width": 0.86 if is_tall else 0.92,
            "softness": 5.2,
            "offsetX": -0.10,
            "offsetY": -0.02,
            "contact": 0.45,
        }
        baked = bake_sprite_shadow(
            trimmed, meta, profile, global_cfg, world_w=210.0, ref_width=120.0
        )
        if baked is None:
            continue
        shadow_img, shadow_bounds, _ = baked
        items.append(
            PackedItem(
                key=f"building_shadow:{logical_key}",
                image=shadow_img,
                metadata={
                    "mode": "building_cast",
                    "boundsInSpriteWidth": shadow_bounds,
                },
                extrude=False,
            )
        )
    return items


def export_infrastructure_and_clouds(
    assets_dir: Path,
    out_dir: Path,
    page_size: int,
    webp_quality: int,
    extra_walls_dir: Path | None = None,
) -> tuple[dict[str, Any], dict[str, Any], int]:
    """Export walls (palisade + stone v7 + gates), painted bridges, buildings, shorelines, and Fog-of-War clouds."""
    infra_items: list[PackedItem] = []
    raw_bytes = 0
    wall_roots = [assets_dir / "walls"]
    if extra_walls_dir is not None and extra_walls_dir.is_dir():
        wall_roots.append(extra_walls_dir)

    seen_wall_keys: set[str] = set()
    # Discover palisade, stone v7, stone gates v1, palisade gates v1 cleanly (skip preview/source sheets).
    skip_stems = {"source_atlas", "source_atlas_v4", "geometry_preview"}
    for wall_root in wall_roots:
        if not wall_root.is_dir():
            continue
        for ext in ("*.webp", "*.png"):
            for path in sorted(wall_root.rglob(ext)):
                if path.stem in skip_stems:
                    continue
                rel = path.relative_to(wall_root).as_posix()
                logical_key = f"walls/{rel.rsplit('.', 1)[0]}"
                if logical_key in seen_wall_keys:
                    continue
                seen_wall_keys.add(logical_key)
                raw_bytes += path.stat().st_size
                with Image.open(path) as im:
                    rgba = im.convert("RGBA")
                    src_w, src_h = rgba.size
                    # Keep full frame for directional wall edge segments so vertex alignment stays 1:1.
                    max_side = 512
                    scale = min(1.0, max_side / max(src_w, src_h))
                    if scale < 1.0:
                        rgba = rgba.resize(
                            (max(1, round(src_w * scale)), max(1, round(src_h * scale))),
                            Image.Resampling.LANCZOS,
                        )
                infra_items.append(
                    PackedItem(
                        key=logical_key,
                        image=rgba,
                        metadata={
                            "category": "wall",
                            "sourceSize": [src_w, src_h],
                        },
                        extrude=True,
                    )
                )

    # Painted river-crossing bridges (timber + stone × 6 directions -> 320px WebP in infra atlas).
    bridges_root = assets_dir / "bridges"
    if bridges_root.is_dir():
        for mat in ("timber", "stone"):
            mat_dir = bridges_root / mat
            if not mat_dir.is_dir():
                continue
            for path in sorted(mat_dir.glob("bridge_dir_*.png")):
                raw_bytes += path.stat().st_size
                with Image.open(path) as im:
                    rgba = im.convert("RGBA")
                    src_w, src_h = rgba.size
                    max_side = 320
                    scale = min(1.0, max_side / max(src_w, src_h))
                    if scale < 1.0:
                        rgba = rgba.resize(
                            (max(1, round(src_w * scale)), max(1, round(src_h * scale))),
                            Image.Resampling.LANCZOS,
                        )
                infra_items.append(
                    PackedItem(
                        key=f"bridges/{mat}/{path.stem}",
                        image=rgba,
                        metadata={
                            "category": "bridge",
                            "material": mat,
                            "sourceSize": [src_w, src_h],
                        },
                        extrude=True,
                    )
                )

    # Painted P0 Settlement Centers & Tier-1..4 Buildings (`assets/buildings/**/*.png` -> 384-448px WebP in infra atlas).
    bldg_root = assets_dir / "buildings"
    if bldg_root.is_dir():
        for path in sorted(bldg_root.rglob("*.png")):
            rel = path.relative_to(bldg_root).as_posix()
            logical_key = f"buildings/{rel.rsplit('.', 1)[0]}"
            raw_bytes += path.stat().st_size
            with Image.open(path) as im:
                rgba = im.convert("RGBA")
                x0, y0, x1, y1 = trim_alpha_bbox(rgba, threshold=12)
                trimmed = rgba.crop((x0, y0, x1, y1))
                src_w, src_h = trimmed.size
                max_side = 448 if "/centers/" in logical_key else 384
                scale = min(1.0, max_side / max(src_w, src_h))
                if scale < 1.0:
                    trimmed = trimmed.resize(
                        (max(1, round(src_w * scale)), max(1, round(src_h * scale))),
                        Image.Resampling.LANCZOS,
                    )
            infra_items.append(
                PackedItem(
                    key=logical_key,
                    image=trimmed,
                    metadata={
                        "category": "building",
                        "sourceSize": [src_w, src_h],
                    },
                    extrude=True,
                )
            )

    # Shorelines (6 directional overlays -> 512px WebP in infra atlas).
    shore_dir = assets_dir / "shorelines"
    if shore_dir.is_dir():
        for path in sorted(shore_dir.glob("*.png")):
            raw_bytes += path.stat().st_size
            with Image.open(path) as im:
                rgba = im.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
            infra_items.append(
                PackedItem(
                    key=f"shorelines/{path.stem}",
                    image=rgba,
                    metadata={"category": "shoreline", "sourceSize": [1024, 1024]},
                    extrude=True,
                )
            )

    infra_pages, infra_entries = pack_atlas_group(
        infra_items, out_dir / "atlases", "infra", page_size, GUTTER, webp_quality
    )

    # Clouds (8 overlays -> 512x512 WebP files for Fog of War).
    clouds_out = out_dir / "clouds"
    clouds_out.mkdir(parents=True, exist_ok=True)
    cloud_entries: list[dict[str, Any]] = []
    clouds_dir = assets_dir / "clouds"
    if clouds_dir.is_dir():
        for path in sorted(clouds_dir.glob("*.png")):
            raw_bytes += path.stat().st_size
            with Image.open(path) as im:
                rgba = im.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
                fname = f"{path.stem}.webp"
                dest = clouds_out / fname
                rgba.save(dest, format="WEBP", quality=82, method=5)
            cloud_entries.append(
                {
                    "id": path.stem,
                    "file": f"clouds/{fname}",
                    "width": 512,
                    "height": 512,
                    "bytes": dest.stat().st_size,
                }
            )

    return (
        {
            "pages": infra_pages,
            "spriteCount": len(infra_entries),
            "sprites": infra_entries,
        },
        {"count": len(cloud_entries), "files": cloud_entries},
        raw_bytes,
    )


def compute_content_hash(out_dir: Path) -> str:
    h = hashlib.sha256()
    for path in sorted(out_dir.rglob("*.webp")):
        h.update(path.relative_to(out_dir).as_posix().encode("utf-8"))
        h.update(b"\0")
        h.update(path.read_bytes())
        h.update(b"\0")
    return h.hexdigest()


def estimate_vram_mb(terrain: dict[str, Any], *atlas_groups: dict[str, Any]) -> dict[str, float]:
    """Estimate uncompressed GPU RGBA + mipmap (1.33x) VRAM footprint for desktop vs mobile."""
    t_layers = terrain["layerCount"]
    t_size = terrain["textureSize"]
    desktop_terrain = t_layers * t_size * t_size * 4 * 1.33
    mobile_terrain = t_layers * min(256, t_size) ** 2 * 4 * 1.33

    atlas_pixels = 0
    for grp in atlas_groups:
        for p in grp.get("pages", []):
            atlas_pixels += p["width"] * p["height"]
    desktop_atlas = atlas_pixels * 4 * 1.33
    # Mobile can downsample atlas textures to 0.5x on upload if needed, or keep native.
    mobile_atlas = atlas_pixels * 4 * 1.33 * 0.5
    return {
        "desktopMb": round((desktop_terrain + desktop_atlas) / (1024 * 1024), 1),
        "mobileMb": round((mobile_terrain + mobile_atlas) / (1024 * 1024), 1),
        "terrainDesktopMb": round(desktop_terrain / (1024 * 1024), 1),
        "terrainMobileMb": round(mobile_terrain / (1024 * 1024), 1),
        "atlasesDesktopMb": round(desktop_atlas / (1024 * 1024), 1),
    }


def export_all(
    assets_dir: Path,
    out_dir: Path,
    terrain_size: int = 512,
    max_terrain_variants: int = 2,
    page_size: int = PAGE_SIZE,
    webp_quality: int = 86,
    shadow_quality: int = 82,
    extra_walls_dir: Path | None = None,
    sync_to: Path | None = None,
) -> dict[str, Any]:
    t0 = time.perf_counter()
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    terrain, raw_t = export_terrain(
        assets_dir, out_dir, terrain_size, max_terrain_variants, min(84, webp_quality)
    )
    nature, shadows, raw_n = export_nature_and_shadows(
        assets_dir, out_dir, page_size, webp_quality, shadow_quality
    )
    infra, clouds, raw_i = export_infrastructure_and_clouds(
        assets_dir, out_dir, page_size, webp_quality, extra_walls_dir=extra_walls_dir
    )

    raw_total = raw_t + raw_n + raw_i
    webp_total = sum(p.stat().st_size for p in out_dir.rglob("*.webp"))
    content_hash = compute_content_hash(out_dir)
    vram = estimate_vram_mb(terrain, nature, shadows, infra)
    elapsed = round(time.perf_counter() - t0, 2)

    manifest: dict[str, Any] = {
        "schema": SCHEMA,
        "contentHash": content_hash,
        "projection": {
            "hexWidth": 256,
            "projectY": 0.85,
            "objectDisplayScaleY": 0.965,
            "objectDisplayShearX": 0.012,
        },
        "stats": {
            "rawInputBytes": raw_total,
            "exportedWebpBytes": webp_total,
            "compressionRatio": round(raw_total / max(1, webp_total), 1),
            "elapsedSeconds": elapsed,
            "vramEstimate": vram,
        },
        "terrain": terrain,
        "nature": nature,
        "shadows": shadows,
        "infrastructure": infra,
        "clouds": clouds,
    }

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    manifest["stats"]["manifestBytes"] = manifest_path.stat().st_size

    if sync_to is not None:
        if sync_to.exists():
            shutil.rmtree(sync_to)
        shutil.copytree(out_dir, sync_to)

    return manifest


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Export raw asset_labor PNGs & shadow profiles into a compact WebP WebGL2 pack."
    )
    parser.add_argument("--assets", type=Path, default=root / "assets")
    parser.add_argument("--out", type=Path, default=root / "dist" / "game-assets")
    parser.add_argument("--terrain-size", type=int, default=512)
    parser.add_argument("--max-terrain-variants", type=int, default=2)
    parser.add_argument("--atlas-size", type=int, default=PAGE_SIZE)
    parser.add_argument("--webp-quality", type=int, default=86)
    parser.add_argument("--shadow-quality", type=int, default=82)
    parser.add_argument("--extra-walls-dir", type=Path, default=None)
    parser.add_argument("--sync-to", type=Path, default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest = export_all(
        assets_dir=args.assets,
        out_dir=args.out,
        terrain_size=args.terrain_size,
        max_terrain_variants=args.max_terrain_variants,
        page_size=args.atlas_size,
        webp_quality=args.webp_quality,
        shadow_quality=args.shadow_quality,
        extra_walls_dir=args.extra_walls_dir,
        sync_to=args.sync_to,
    )
    st = manifest["stats"]
    raw_mb = st["rawInputBytes"] / (1024 * 1024)
    out_mb = st["exportedWebpBytes"] / (1024 * 1024)
    print(f"=== Vedras Game Asset Export ({SCHEMA}) ===")
    print(f"Content hash : {manifest['contentHash'][:16]}")
    print(f"Raw input    : {raw_mb:.1f} MB -> Exported WebP: {out_mb:.2f} MB ({st['compressionRatio']}x smaller)")
    print(f"Terrain      : {manifest['terrain']['layerCount']} layers ({manifest['terrain']['textureSize']}px)")
    print(
        f"Nature atlas : {manifest['nature']['spriteCount']} sprites across {len(manifest['nature']['pages'])} pages"
    )
    print(
        f"Shadow atlas : {manifest['shadows']['spriteCount']} pre-baked shadows "
        f"{manifest['shadows']['counts']} across {len(manifest['shadows']['pages'])} pages"
    )
    print(
        f"Infra atlas  : {manifest['infrastructure']['spriteCount']} sprites across "
        f"{len(manifest['infrastructure']['pages'])} pages | Clouds: {manifest['clouds']['count']}"
    )
    print(f"VRAM est.    : Desktop {st['vramEstimate']['desktopMb']} MB | Mobile {st['vramEstimate']['mobileMb']} MB")
    print(f"Elapsed      : {st['elapsedSeconds']}s -> {args.out}")


if __name__ == "__main__":
    main()
