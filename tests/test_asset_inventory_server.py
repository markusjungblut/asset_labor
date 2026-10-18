"""Integration tests for ordinary Kapok trees and Unicode catalog paths."""
import json
import threading
import unittest
from urllib.request import urlopen

from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class AssetInventoryServerTests(unittest.TestCase):
    def test_kapok_trees_are_regular_nature_assets(self):
        httpd = server.ThreadingHTTPServer((server.HOST, 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            with urlopen(f'http://{server.HOST}:{httpd.server_port}/api/nature-catalog', timeout=8) as response:
                self.assertEqual(response.status, 200)
                payload = json.load(response)
            for number in range(12, 20):
                item = payload['entries'][f'nature/tree_{number}.png']
                self.assertEqual(item['id'], f'kapok_tree_{number}')
                self.assertEqual(item['kind'], 'tree')
                self.assertEqual(item['family'], 'jungle_trees')
                self.assertIn('jungle', item['allowedTerrainTypes'])
                self.assertGreater(item['placement']['density'], 0)
                self.assertGreater(item['placement']['weight'], 0)
                self.assertNotIn('journal_api', item['tags'])
                self.assertNotIn('no_auto_spawn', item['tags'])
        finally:
            httpd.shutdown()
            httpd.server_close()
            thread.join(timeout=5)

    def test_unicode_nature_filenames(self):
        def entry(identifier):
            return {
                'id': identifier, 'description': 'Real asset proposal',
                'sourceReference': 'Bestandsdatei', 'family': 'conifers',
                'kind': 'tree', 'sizeClass': 'medium',
                'logicalWidth': 110, 'scaleMin': .85, 'scaleMax': 1.15,
                'anchor': {'x': .5, 'y': .96},
                'shadow': {'mode': 'generic_medium_round', 'path': ''},
                'allowedTerrainCategories': ['cold_regions'],
                'allowedTerrainTypes': [],
                'placement': {'weight': 1, 'density': .12, 'minSpacing': 90,
                              'canCluster': False, 'edgeMargin': 12},
                'artStatus': 'candidate', 'tags': ['needs_art_review'],
            }
        metadata = {'schemaVersion': 1, 'revision': 0, 'presets': {},
                    'entries': {'nature/lärche1.png': entry('existing_larche1'),
                                'nature/weißdorn1.png': entry('existing_weissdorn1')}}
        server.validate_nature_catalog(metadata)

    def test_eight_kapok_image_files_exist(self):
        self.assertEqual(
            sorted(x.name for x in (server.ASSETS / 'nature').glob('tree_*.png')),
            [f'tree_{n}.png' for n in range(12, 20)]
        )


if __name__ == '__main__':
    unittest.main()
