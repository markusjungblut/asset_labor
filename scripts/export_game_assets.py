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
    """Offline exact distance-field mountain ground shadow matching `shadow-system.js`."""
    mcfg = dict(MOUNTAIN_SHADOW_DEFAULTS)
    m_meta = meta.get("mountain") or {}
    if isinstance(m_meta.get("shadowOpacity"), (int, float)):
        mcfg["opacity"] = float(m_meta["shadowOpacity"])
    if mcfg["opacity"] <= 0:
        return None

    anchor = meta.get("anchor") or {}
    ax = clamp(float(anchor.get("x", 0.5)), 0.0, 1.0)
    ay = clamp(float(anchor.get("y", 0.67)), 0.0, 1.0)
    foot_x, foot_y = compute_alpha_foot(trimmed, ax, ay)

    aspect = trimmed.height / max(1, trimmed.width)
    ref_h = ref_width * aspect

    # Tuck shadow root solidly behind the mountain's left-base flank (never detached outside the silhouette!)
    # and keep the right fade strictly left of the sunlit east ridge (x <= -0.04 * ref_width).
    origin_x = ref_width * clamp(foot_x + 0.18, -0.32, -0.14)
    origin_y = ref_h * clamp(foot_y, -0.06, 0.12) + ref_width * 0.045

    rad = math.radians(mcfg["angle"])
    dir_x, dir_y = math.cos(rad), math.sin(rad)
    norm_x, norm_y = -dir_y, dir_x
    length = ref_width * max(0.84, mcfg["length"])
    r0 = max(0.28, mcfg["rootWidth"]) * ref_width
    r1 = max(0.22, mcfg["midWidth"]) * ref_width
    r2 = max(0.11, mcfg["tipWidth"]) * ref_width
    soft = max(1.8, mcfg["softness"] * (ref_width / max(1.0, float(meta.get("logicalWidth") or 360.0))))
    contact_len = ref_width * max(0.36, mcfg["contactLength"])
    contact_w = ref_width * max(0.18, mcfg["contactWidth"])

    p2_x = origin_x + dir_x * length
    p2_y = origin_y + dir_y * length
    max_r = max(r0, r1, r2, contact_w)
    pad = max_r + max(6.0, soft) * 1.5

    x0 = int(math.floor(min(origin_x, p2_x) - pad))
    x1 = int(math.ceil(origin_x + ref_width * 0.22 + 2))
    y0 = int(math.floor(min(origin_y, p2_y) - pad))
    y1 = int(math.ceil(max(origin_y, p2_y) + pad))
    bw = max(1, x1 - x0)
    bh = max(1, y1 - y0)

    alpha_buf = bytearray(bw * bh)
    for py in range(bh):
        wy = y0 + py + 0.5
        dy = wy - origin_y
        row_off = py * bw
        for px in range(bw):
            wx = x0 + px + 0.5
            # Soft smoothstep right-edge gate tucked behind mountain base (zero vertical knife edge!)
            right_gate = 1.0 - smoothstep(origin_x + ref_width * 0.04, origin_x + ref_width * 0.20, wx)
            if right_gate <= 0.002:
                continue
            dx = wx - origin_x
            t = dx * dir_x + dy * dir_y
            lateral = dx * norm_x + dy * norm_y
            if t < length * 0.43:
                rr = r0 + (r1 - r0) * clamp(t / (length * 0.43), 0.0, 1.0)
            else:
                rr = r1 + (r2 - r1) * clamp((t - length * 0.43) / (length * 0.57), 0.0, 1.0)
            along = -t if t < 0 else (t - length if t > length else 0.0)
            signed = math.hypot(abs(lateral), along) - rr
            root_gate = smoothstep(-ref_width * 0.14, ref_width * 0.04, t)
            cast_fade = (
                (1.0 - smoothstep(-soft * 0.18, soft * 0.95, signed))
                * (1.0 - smoothstep(length * 0.88, length + r2 + soft, t))
                * root_gate
            )
            c_axis = clamp(t, -contact_len * 0.12, contact_len * 0.88)
            c_dist = math.hypot(lateral, t - c_axis) - contact_w
            c_fade = (1.0 - smoothstep(-soft * 0.12, soft * 0.78, c_dist)) * smoothstep(
                -ref_width * 0.12, ref_width * 0.03, t
            )
            # Normalized coverage (0..1) so WebGL2 applies global shadow opacity once!
            cover = clamp(max(0.90 * cast_fade, 0.62 * c_fade) / 0.90 * right_gate, 0.0, 1.0)
            a = int(round(cover * 255.0))
            if a > 0:
                alpha_buf[row_off + px] = a

    alpha_img = Image.frombytes("L", (bw, bh), bytes(alpha_buf))
    bbox = alpha_img.point(lambda v: 255 if v > 2 else 0).getbbox()
    if not bbox:
        return None
    cx0, cy0, cx1, cy1 = bbox
    cropped_a = alpha_img.crop((cx0, cy0, cx1, cy1))
    out = Image.new("RGBA", cropped_a.size, (0, 0, 0, 0))
    out.putalpha(cropped_a)
    bounds = [
        round((x0 + cx0) / ref_width, 5),
        round((y0 + cy0) / ref_width, 5),
        round((x0 + cx1) / ref_width, 5),
        round((y0 + cy1) / ref_width, 5),
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

    softness = clamp(float(merged.get("softness", 4.5)), 0.0, 30.0)
    # Screen-consistent softness (do NOT blow up blur 3x on small 52px sprites like cacti!).
    blur_px = clamp(softness * 0.55, 0.6, 7.5)
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
        mask = mask.filter(ImageFilter.GaussianBlur(radius=clamp(blur_px * 0.72 * scale, 0.5, 4.5)))
        # Normalize blurred peak so slender polygons (e.g. columnar cacti) match full-peak union shadows!
        lo_hi = mask.getextrema()
        peak = lo_hi[1] if isinstance(lo_hi, tuple) else 0
        if 24 < peak < 248:
            gain = min(2.4, 250.0 / peak)
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

    angle = float(merged.get("angle", 142.0))
    length_f = float(merged.get("length", 0.72))
    width_f = clamp(float(merged.get("width", 0.91)), 0.2, 1.8)
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
    eff_blur = clamp(blur_px * 0.65 * scale, 0.6, 8.0)
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
            ImageFilter.GaussianBlur(radius=max(0.5, eff_blur * 0.65))
        )
        # Union max(cast, contact) so contact grounds the foot without over-darkening.
        cb = cast_mask.tobytes()
        kb = contact_mask.tobytes()
        merged_bytes = bytes(a if a >= b else b for a, b in zip(cb, kb))
        cast_mask = Image.frombytes("L", (cw, ch), merged_bytes)

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


def export_infrastructure_and_clouds(
    assets_dir: Path,
    out_dir: Path,
    page_size: int,
    webp_quality: int,
    extra_walls_dir: Path | None = None,
) -> tuple[dict[str, Any], dict[str, Any], int]:
    """Export walls (palisade + stone v7 + gates), shorelines, and Fog-of-War clouds."""
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
