#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import tempfile

spec = importlib.util.spec_from_file_location('traffic', Path(__file__).with_name('traffic-snapshot.py'))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
def fixture(count):
    return {'count': count, 'uniques': count, 'clones': [{'timestamp':'2026-11-16T00:00:00Z','count':count,'uniques':count}]}
with tempfile.TemporaryDirectory() as tmp:
    out=Path(tmp)
    repo={'stargazers_count':0,'forks_count':1}
    views={'count':3,'uniques':2,'views':[{'timestamp':'2026-11-16T00:00:00Z','count':3,'uniques':2}]}
    m.archive(out,'2026-11-16',repo,fixture(2),views)
    m.archive(out,'2026-11-16',repo,fixture(4),views)
    assert len((out/'traffic-log.csv').read_text().splitlines())==2
    assert json.loads((out/'raw/2026-11-16.json').read_text())['clones']['count']==4
    before=(out/'traffic-log.csv').read_bytes()
    bad=fixture(4); bad['count']=None
    try:
        m.archive(out,'2026-11-17',repo,bad,views)
        raise AssertionError('Invalid metric accepted')
    except ValueError: pass
    assert before==(out/'traffic-log.csv').read_bytes()
    assert not (out/'raw/2026-11-17.json').exists()
print('traffic regression PASS: validated responses, same-day upsert, raw daily series, failure leaves history intact')
