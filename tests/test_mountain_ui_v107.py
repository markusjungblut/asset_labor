"""Legacy v0.10.7 smoke cases consolidated into the v0.10.8 browser regression.""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('test_mountain_ui_v108.py')),run_name='__main__')