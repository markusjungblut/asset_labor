"""Developer-only importer for existing worldgen-geography.js JSON exports.

Usage:
  python world_region_pipeline.py --db data/vedras_world.sqlite import \
    --world vedras-main --file worldgen_export.json --content-version launch-1

Never use this CLI as an unauthenticated multiplayer API. Batch imports publish
one region at a time: keep source files to replay/recover an interrupted import.
"""
import argparse
from collections import defaultdict
import json
from pathlib import Path

from persistent_world_store import PersistentWorldStore


def import_geography(store, world_id, exported, content_version="content-v1",
                     region_size=16, allow_updates=False):
    if not isinstance(exported, dict):
        raise ValueError("expected geography-v2 export object")
    seed = exported.get("seed")
    version = exported.get("generatorVersion") or exported.get("version")
    if not isinstance(seed, str) or not seed:
        raise ValueError("export is missing world seed")
    if not isinstance(version, str) or not version.startswith("geography-"):
        raise ValueError("unsupported or missing geography generator version")
    raw = exported.get("cells")
    if not isinstance(raw, list) or not raw:
        raise ValueError("geography export must include generated cells")
    grouped = defaultdict(list)
    seen = set()
    # Validate all coordinates and region ownership BEFORE creating any region.
    for c in raw:
        if not isinstance(c, dict):
            raise ValueError("invalid cell entry")
        q, r = c.get("q"), c.get("r")
        if (not isinstance(q, int) or isinstance(q, bool) or
            not isinstance(r, int) or isinstance(r, bool) or
            not isinstance(c.get("terrainId"), str) or not c["terrainId"]):
            raise ValueError("invalid q/r or terrainId in geography cell")
        if (q, r) in seen:
            raise ValueError("duplicate generated hex: %s" % ((q, r),))
        seen.add((q, r))
        grouped[q // region_size, r // region_size].append(c)
    identity = store.world(world_id)
    if identity is None:
        store.create_world(world_id, seed, version, region_size)
    elif identity["seed"] != seed or identity["region_size"] != region_size:
        raise ValueError("world seed/region geometry must remain immutable")
    # Existing worlds may accept NEW generator versions in still-undiscovered
    # regions while keeping their global seed and earlier frozen geography.
    # Refuse implicit overwrites; unrelated known regions are left untouched.
    originals = {}
    for rq, rr in grouped:
        existing = store.region(world_id, rq, rr)
        if existing and not allow_updates:
            raise ValueError("region %d,%d exists; explicit --allow-updates required" % (rq, rr))
        originals[rq, rr] = existing["revision"] if existing else 0
    published = []
    for (rq, rr), cells in sorted(grouped.items()):
        published.append(store.publish_region(
            world_id, rq, rr, cells, version, content_version,
            expected_revision=originals[rq, rr]))
    return {"world_id": world_id, "source_version": version,
            "regions": len(published), "hexes": len(seen),
            "revisions": published}


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Vedras Reiche local world-publication pipeline")
    parser.add_argument("--db", required=True, help="persistent SQLite file")
    commands = parser.add_subparsers(dest="command", required=True)
    imp = commands.add_parser("import", help="import exported worldgen geography")
    imp.add_argument("--world", required=True)
    imp.add_argument("--file", required=True, type=Path)
    imp.add_argument("--content-version", default="content-v1")
    imp.add_argument("--region-size", type=int, choices=(16, 32), default=16)
    imp.add_argument("--allow-updates", action="store_true",
                     help="republish undiscovered cells; keep discovered cells")
    view = commands.add_parser("view", help="inspect a player's fog-safe map DTO")
    view.add_argument("--world", required=True)
    view.add_argument("--player", required=True)
    view.add_argument("--q", type=int, required=True)
    view.add_argument("--r", type=int, required=True)
    view.add_argument("--visible", action="store_true")
    discover = commands.add_parser("discover", help="record a local test discovery")
    discover.add_argument("--world", required=True)
    discover.add_argument("--player", required=True)
    discover.add_argument("--q", type=int, required=True)
    discover.add_argument("--r", type=int, required=True)
    args = parser.parse_args(argv)
    store = PersistentWorldStore(args.db)
    if args.command == "import":
        with args.file.open(encoding="utf-8") as stream:
            source = json.load(stream)
        output = import_geography(store, args.world, source,
            content_version=args.content_version, region_size=args.region_size,
            allow_updates=args.allow_updates)
    elif args.command == "discover":
        output = store.discover(args.world, args.player, [(args.q, args.r)])
    else:
        output = store.player_view(args.world, args.player, [(args.q, args.r)],
            visible=[(args.q, args.r)] if args.visible else [])
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
