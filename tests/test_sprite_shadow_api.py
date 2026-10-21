"""Regression for the local sprite shadow profile persistence API.
Run: python -m unittest discover -s tests -p 'test_sprite_shadow_api.py'
"""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import server


class SpriteShadowApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.initial = json.loads(
            (ROOT / "assets" / "shadows" / "sprite_shadow_profiles.json")
            .read_text(encoding="utf-8")
        )

    def test_initial_profile_valid(self):
        server.validate_sprite_shadows(self.initial)

    def test_global_controls_and_individual_sprite(self):
        data = copy.deepcopy(self.initial)
        data["global"]["strength"] = 2
        data["global"]["angle"] = 180
        data["profiles"]["assets/nature/Baumstumpf_16.png"] = {
            "opacity": 0.7, "length": 1.7, "offsetX": -0.35, "enabled": True
        }
        server.validate_sprite_shadows(data)

    def test_stale_or_unknown_fields_are_rejected(self):
        data = copy.deepcopy(self.initial)
        data["global"]["angle"] = 300
        with self.assertRaises(ValueError):
            server.validate_sprite_shadows(data)
        data = copy.deepcopy(self.initial)
        data["profiles"]["assets/nature/Oak.png"] = {"opacity": 5}
        with self.assertRaises(ValueError):
            server.validate_sprite_shadows(data)

    def test_bad_path_is_rejected(self):
        for name in ["../secrets", "assets/nature/../secret.png",
                     "assets/nature/evil\\sprite.png", "/etc/passwd"]:
            data = copy.deepcopy(self.initial)
            data["profiles"][name] = {"length": 1.25}
            with self.subTest(name=name), self.assertRaises(ValueError):
                server.validate_sprite_shadows(data)

    def test_enabled_boolean_is_required(self):
        data = copy.deepcopy(self.initial)
        data["profiles"]["assets/nature/Oak.png"] = {"enabled": False}
        server.validate_sprite_shadows(data)
        data["profiles"]["assets/nature/Oak.png"]["enabled"] = "no"
        with self.assertRaises(ValueError):
            server.validate_sprite_shadows(data)


if __name__ == "__main__":
    unittest.main()
