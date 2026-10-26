"""python -m unittest discover -s tests -p 'test_world_region_pipeline.py'"""
import tempfile
import unittest
from pathlib import Path

from persistent_world_store import PersistentWorldStore, WorldConflict
from world_region_pipeline import import_geography


def world(version="geography-v2.1.0", cells=None):
    if cells is None:
        cells = [{"q": 0, "r": 0, "terrainId": "forest"},
                 {"q": 16, "r": -1, "terrainId": "swamp"}]
    return {"version": version, "seed": "world-ancient",
            "width": 32, "height": 32, "originQ": 0, "originR": -16,
            "cells": cells, "riverPaths": []}


class GeographyImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / "vedras.sqlite3"
        self.store = PersistentWorldStore(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_import_existing_geography_v21_generator_file(self):
        result = import_geography(self.store, "shared", world())
        self.assertEqual(result["hexes"], 2)
        self.assertEqual(result["regions"], 2)
        self.assertEqual(self.store.region("shared", 0, 0)["revision"], 1)
        self.assertEqual(self.store.region("shared", 1, -1)["revision"], 1)

    def test_generator_updates_only_undiscovered_hexes(self):
        import_geography(self.store, "shared", world())
        self.store.discover("shared", "alice", [(0, 0)])
        new = world("geography-v3.0.0", [
            {"q": 0, "r": 0, "terrainId": "forest"},
            {"q": 16, "r": -1, "terrainId": "jungle"}])
        with self.assertRaises(ValueError):
            import_geography(self.store, "shared", new)
        result = import_geography(self.store, "shared", new,
                                  allow_updates=True, content_version="wildlife-v2")
        self.assertEqual(result["regions"], 2)
        self.assertEqual(self.store.world("shared")["generator_version"],
                         "geography-v2.1.0")
        self.assertEqual(self.store.region("shared", 1, -1)["generator_version"],
                         "geography-v3.0.0")
        self.assertEqual(self.store.player_view("shared", "alice", [(0, 0)])[0][
                         "base"]["terrainId"], "forest")

    def test_reject_republishing_discovered_geography(self):
        import_geography(self.store, "shared", world())
        self.store.discover("shared", "alice", [(0, 0)])
        new = world(cells=[{"q": 0, "r": 0, "terrainId": "desert"},
                           {"q": 16, "r": -1, "terrainId": "swamp"}])
        with self.assertRaises(WorldConflict):
            import_geography(self.store, "shared", new, allow_updates=True)
        self.assertEqual(self.store.region("shared", 0, 0)["revision"], 1)

    def test_reject_changed_global_seed(self):
        import_geography(self.store, "shared", world())
        updated = world()
        updated["seed"] = "other-seed"
        with self.assertRaises(ValueError):
            import_geography(self.store, "shared", updated, allow_updates=True)

    def test_reject_partial_invalid_generated_input(self):
        updated = world(cells=[
            {"q": 0, "r": 0, "terrainId": "forest"},
            {"q": 0, "r": 0, "terrainId": "swamp"}])
        with self.assertRaises(ValueError):
            import_geography(self.store, "shared", updated)
        self.assertIsNone(self.store.world("shared"))


if __name__ == "__main__":
    unittest.main()
