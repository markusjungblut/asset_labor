"""python -m unittest discover -s tests -p 'test_persistent_world_store.py'"""
import tempfile
import unittest
from pathlib import Path

from persistent_world_store import PersistentWorldStore, WorldConflict, UnknownCell


class PersistentWorldTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / "world.sqlite3"
        self.store = PersistentWorldStore(self.db)
        self.store.create_world("vedras", "fixed-seed-203", "geography-v2.1", region_size=16)

    def tearDown(self):
        self.temp.cleanup()

    def publish(self, cells, *, rq=0, rr=0, revision=0,
                generator="geography-v2.1", content="base-v1", edges=None):
        return self.store.publish_region(
            "vedras", rq, rr, cells, generator, content,
            edge_constraints=edges or {}, expected_revision=revision)

    def test_global_coordinates_include_negative_axes_and_new_regions(self):
        self.publish([{"q": -1, "r": -1, "terrainId": "mountain"}],
                     rq=-1, rr=-1)
        self.publish([{"q": 16, "r": 0, "terrainId": "forest"}], rq=1, rr=0)
        self.assertEqual(self.store.discover("vedras", "alice", [(-1, -1)])[
            "global_first_discoveries"], 1)
        view = self.store.player_view("vedras", "alice", [(-1, -1), (16, 0)],
                                      visible=[(-1, -1)])
        self.assertEqual(view[0]["base"]["terrainId"], "mountain")
        self.assertEqual(view[1], {"q": 16, "r": 0, "visibility": "unknown"})

    def test_global_discovery_freezes_origin_for_every_player(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest",
                       "features": ["hidden-ruin"]},
                      {"q": 1, "r": 0, "terrainId": "swamp"}])
        self.assertEqual(self.store.discover("vedras", "alice", [(0, 0)]),
                         {"global_first_discoveries": 1,
                          "player_first_discoveries": 1})
        self.assertEqual(self.store.player_view(
            "vedras", "bob", [(0, 0)], visible=[(0, 0)]),
            [{"q": 0, "r": 0, "visibility": "unknown"}])
        with self.assertRaises(WorldConflict):
            self.publish([{"q": 0, "r": 0, "terrainId": "desert"},
                          {"q": 1, "r": 0, "terrainId": "swamp"}], revision=1)
        self.assertEqual(self.publish([
            {"q": 0, "r": 0, "terrainId": "forest",
             "features": ["hidden-ruin"]},
            {"q": 1, "r": 0, "terrainId": "swamp",
             "features": ["alligators"]}], revision=1, content="base-v2")["revision"], 2)
        self.store.discover("vedras", "bob", [(0, 0)])
        self.assertEqual(self.store.player_view(
            "vedras", "bob", [(0, 0)])[0]["base"]["terrainId"], "forest")
        self.assertEqual(self.store.discover("vedras", "bob", [(0, 0)]),
                         {"global_first_discoveries": 0,
                          "player_first_discoveries": 0})

    def test_locked_geography_cannot_be_deleted(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        self.store.discover("vedras", "alice", [(0, 0)])
        with self.assertRaises(WorldConflict):
            self.publish([], revision=1)
        self.assertEqual(self.store.region("vedras", 0, 0)["revision"], 1)

    def test_undiscovered_region_can_regenerate_and_rollback(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        self.publish([{"q": 0, "r": 0, "terrainId": "jungle"}],
                     revision=1, generator="geography-v3", content="wildlife-v2")
        self.assertEqual(self.store.rollback_region(
            "vedras", 0, 0, target_revision=1, expected_revision=2)["revision"], 3)
        self.store.discover("vedras", "alice", [(0, 0)])
        self.assertEqual(self.store.player_view("vedras", "alice", [(0, 0)])[0][
            "base"]["terrainId"], "forest")

    def test_rollback_cannot_remove_discovered_geography(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        self.publish([{"q": 0, "r": 0, "terrainId": "jungle"}], revision=1)
        self.store.discover("vedras", "alice", [(0, 0)])
        with self.assertRaises(WorldConflict):
            self.store.rollback_region("vedras", 0, 0, 1, expected_revision=2)
        self.assertEqual(self.store.region("vedras", 0, 0)["revision"], 2)

    def test_discovery_batch_is_atomic_if_hex_does_not_exist(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        with self.assertRaises(UnknownCell):
            self.store.discover("vedras", "alice", [(0, 0), (12, 12)])
        self.assertEqual(self.store.player_view(
            "vedras", "alice", [(0, 0)]), [
                {"q": 0, "r": 0, "visibility": "unknown"}])

    def test_optimistic_revision_conflicts(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        with self.assertRaises(WorldConflict):
            self.publish([{"q": 0, "r": 0, "terrainId": "desert"}],
                         revision=0)
        self.assertEqual(self.store.region("vedras", 0, 0)["revision"], 1)

    def test_pinned_edge_contract_cannot_mutate_after_discovery(self):
        border = {"eastRiver": [28.5, 66.0]}
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}], edges=border)
        self.store.discover("vedras", "alice", [(0, 0)])
        with self.assertRaises(WorldConflict):
            self.publish([{"q": 0, "r": 0, "terrainId": "forest"}],
                         revision=1, edges={"eastRiver": [45.0, 77.0]})
        self.assertEqual(self.store.region("vedras", 0, 0)[
            "edge_constraints"], border)

    def test_game_events_are_separate_from_frozen_world_basis(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        self.store.discover("vedras", "alice", [(0, 0)])
        self.store.append_event("vedras", "road_001", 0, 0, "road_built",
                                {"owner": "alice"}, visibility="discovered")
        self.store.append_event("vedras", "army_001", 0, 0, "army_moved",
                                {"owner": "bob"}, visibility="visible")
        explored = self.store.player_view("vedras", "alice", [(0, 0)])[0]
        self.assertEqual(explored["visibility"], "explored")
        self.assertEqual([e["type"] for e in explored["events"]], ["road_built"])
        visible = self.store.player_view(
            "vedras", "alice", [(0, 0)], visible=[(0, 0)])[0]
        self.assertEqual([e["type"] for e in visible["events"]],
                         ["road_built", "army_moved"])
        self.assertEqual(visible["base"]["terrainId"], "forest")

    def test_persistence_after_reopening_database(self):
        self.publish([{"q": 0, "r": 0, "terrainId": "forest"}])
        self.store.discover("vedras", "alice", [(0, 0)])
        second = PersistentWorldStore(self.db)
        self.assertEqual(second.player_view("vedras", "alice", [(0, 0)])[0][
            "base"]["terrainId"], "forest")
        self.assertEqual(second.player_view("vedras", "bob", [(0, 0)])[0][
            "visibility"], "unknown")

    def test_world_seed_cannot_be_changed(self):
        with self.assertRaises(WorldConflict):
            self.store.create_world("vedras", "other", "geography-v2.1")
        self.assertEqual(self.store.create_world(
            "vedras", "fixed-seed-203", "geography-v2.1")["region_size"], 16)


if __name__ == "__main__":
    unittest.main()
