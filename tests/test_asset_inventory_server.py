"""Integration tests for real journal-tree API and Unicode catalog paths."""
import json
import threading
import unittest
from urllib.request import urlopen

from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class AssetInventoryServerTests(unittest.TestCase):
    def test_journal_trees_endpoint(self):
        httpd = server.ThreadingHTTPServer((server.HOST, 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            with urlopen(f'http://{server.HOST}:{httpd.server_port}/api/journal-trees', timeout=8) as response:
                self.assertEqual(response.status, 200)
                payload = json.load(response)
            self.assertEqual(payload['schemaVersion'], 1)
            self.assertEqual(payload['count'], 8)
            self.assertEqual([item['id'] for item in payload['items']],
                             [f'journal_tree_{n}' for n in range(12, 20)])
            self.assertTrue(all(item['kind'] == 'special' and item['spawnable'] is False
                                and item['family'] == 'journal_trees' for item in payload['items']))
            self.assertTrue(all((server.BASE / item['path']).is_file() for item in payload['items']))
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

    def test_no_unexpected_journal_assets(self):
        self.assertEqual(
            sorted(x.name for x in (server.ASSETS / 'nature').glob('tree_*.png')),
            [f'tree_{n}.png' for n in range(12, 20)]
        )


if __name__ == '__main__':
    unittest.main()
