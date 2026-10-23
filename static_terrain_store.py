"""Versioned on-disk cache of terrain-only chunk rasters.

Paths are derived exclusively from 64-char SHA-256 keys, not user file names.
Original assets and live world state are never modified. Recomputable data.
"""
from __future__ import annotations
import base64
import binascii
import json
import math
import os
from pathlib import Path
import re
import struct
import threading

SCHEMA = 2
KEY = re.compile(r"^[a-f0-9]{64}$")
PNG = b"\x89PNG\r\n\x1a\n"
LOCK = threading.Lock()
MAX_REQUEST = 28_000_000
MAX_LAYER = 12_000_000
MAX_RECORDS = 600


def _check_layer(raw: dict) -> tuple[dict, bytes]:
    if not isinstance(raw, dict):
        raise ValueError("Terrain layer is not an object")
    values = (raw.get("x"), raw.get("y"), raw.get("width"),
              raw.get("height"), raw.get("density"))
    if any(isinstance(v, bool) or not isinstance(v, (int, float)) or
           not math.isfinite(v) for v in values):
        raise ValueError("Invalid terrain geometry")
    x, y, width, height, density = values
    if not(-100_000 <= x <= 100_000 and -100_000 <= y <= 100_000
           and 0 < width <= 3000 and 0 < height <= 3000
           and 0.1 <= density <= 4):
        raise ValueError("Terrain dimensions out of bounds")
    encoded = raw.get("png")
    if not isinstance(encoded, str) or len(encoded) > MAX_LAYER * 4 // 3 + 16:
        raise ValueError("Terrain PNG too large")
    try:
        data = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("Invalid PNG base64") from exc
    if len(data) < 33 or len(data) > MAX_LAYER or not data.startswith(PNG) or \
            data[12:16] != b"IHDR":
        raise ValueError("Not a PNG file")
    pixel_w, pixel_h = struct.unpack(">II", data[16:24])
    if not(1 <= pixel_w <= 4096 and 1 <= pixel_h <= 4096) or \
            abs(pixel_w - width * density) > 5 or \
            abs(pixel_h - height * density) > 5:
        raise ValueError("Invalid PNG pixel geometry")
    return {"x": x, "y": y, "width": width, "height": height,
            "density": density}, data


def store(root: Path, payload: dict) -> dict:
    if not isinstance(payload, dict) or payload.get("schemaVersion") != SCHEMA:
        raise ValueError("Unknown static terrain cache version")
    key = payload.get("key")
    if not isinstance(key, str) or not KEY.fullmatch(key):
        raise ValueError("Invalid chunk hash")
    land, land_png = _check_layer(payload.get("land"))
    water = payload.get("water")
    if water is not None:
        water, water_png = _check_layer(water)
    else:
        water_png = None
    directory = root / key[:2]
    directory.mkdir(parents=True, exist_ok=True)
    prefix = "precomputed/terrain/" + key[:2] + "/" + key
    land["file"] = prefix + ".land.png"
    if water:
        water["file"] = prefix + ".water.png"
    manifest = {"schemaVersion": SCHEMA, "key": key,
                "land": land, "water": water}
    with LOCK:
        for kind, blob in (("land", land_png), ("water", water_png)):
            if blob is None:
                continue
            dest = directory / f"{key}.{kind}.png"
            tmp = directory / f"{key}.{kind}.png.tmp"
            tmp.write_bytes(blob)
            os.replace(tmp, dest)
        meta = directory / f"{key}.json"
        tmp = meta.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
        os.replace(tmp, meta)
        # Bounded number of snapshots; old variants can always be rebuilt.
        records = list(root.glob("[a-f0-9][a-f0-9]/*.json"))
        if len(records) > MAX_RECORDS:
            records.sort(key=lambda p: p.stat().st_mtime)
            for old in records[:len(records) - MAX_RECORDS]:
                stem = old.stem
                old.unlink(missing_ok=True)
                for kind in ("land", "water"):
                    old.with_name(stem + "." + kind + ".png").unlink(missing_ok=True)
    return manifest


def load(root: Path, key: str) -> dict | None:
    if not isinstance(key, str) or not KEY.fullmatch(key):
        return None
    path = root / key[:2] / (key + ".json")
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text("utf-8"))
        if data.get("key") != key or data.get("schemaVersion") != SCHEMA:
            return None
        return data
    except (OSError, ValueError):
        return None


def index(root: Path) -> dict:
    keys = [p.stem for p in root.glob("[a-f0-9][a-f0-9]/*.json")
            if KEY.fullmatch(p.stem)]
    return {"schemaVersion": SCHEMA, "keys": sorted(keys)}
