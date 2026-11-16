#!/usr/bin/env python3
"""Archive GitHub traffic events, not installs. No plugin runtime telemetry."""
import argparse
import csv
import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

FIELDS = ['date', 'stars', 'forks', 'clones_14d', 'clones_uniq_14d', 'views_14d', 'views_uniq_14d']

def api(route):
    error = ''
    for attempt in range(2):
        try:
            p = subprocess.run(['gh', 'api', route], capture_output=True, text=True, timeout=30)
            if p.returncode == 0:
                return json.loads(p.stdout)
            error = p.stderr.strip()[:300]
        except (subprocess.TimeoutExpired, json.JSONDecodeError) as e:
            error = str(e)[:300]
        if attempt == 0:
            time.sleep(1)
    raise RuntimeError('GitHub API failed: ' + route + ': ' + error)

def integer(value):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError('Invalid nonnegative metric')
    return value

def validate(repo, clones, views):
    integer(repo['stargazers_count']); integer(repo['forks_count'])
    for data, kind in ((clones, 'clones'), (views, 'views')):
        integer(data['count']); integer(data['uniques'])
        if data['uniques'] > data['count']:
            raise ValueError('Unique count exceeds total')
        if not isinstance(data[kind], list):
            raise ValueError('Missing daily traffic series')
        for row in data[kind]:
            dt.datetime.fromisoformat(row['timestamp'].replace('Z', '+00:00'))
            integer(row['count']); integer(row['uniques'])

def atomic(path, content):
    fd, name = tempfile.mkstemp(prefix='.' + path.name, dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='') as f:
            f.write(content); f.flush(); os.fsync(f.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)  # Exact tempfile returned by mkstemp, never a computed deletion.

def archive(out, day, repo, clones, views):
    import io
    validate(repo, clones, views)  # Reject partial/failed responses before touching the archive.
    out.mkdir(parents=True, exist_ok=True)
    with (out / '.snapshot.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        path = out / 'traffic-log.csv'
        rows = []
        if path.exists():
            with path.open(newline='') as f:
                reader = csv.DictReader(f)
                if reader.fieldnames != FIELDS:
                    raise ValueError('Unexpected CSV header; historical file left untouched')
                rows = list(reader)
                if not (out / 'traffic-log.before-v2.csv').exists():
                    atomic(out / 'traffic-log.before-v2.csv', path.read_text())
        raw = {'sampledAt': dt.datetime.now(dt.timezone.utc).isoformat(),
               'metric': 'GitHub clone/view events; not installations or users',
               'repository': repo, 'clones': clones, 'views': views}
        rawdir = out / 'raw'; rawdir.mkdir(exist_ok=True)
        atomic(rawdir / (day + '.json'), json.dumps(raw, ensure_ascii=False, indent=2) + '\n')
        row = dict(zip(FIELDS, [day, repo['stargazers_count'], repo['forks_count'], clones['count'], clones['uniques'], views['count'], views['uniques']]))
        # Same local date is an upsert; do not add overlapping windows together.
        rows = [r for r in rows if r['date'] != day] + [row]
        rows.sort(key=lambda r: r['date'])
        text = io.StringIO(); writer = csv.DictWriter(text, fieldnames=FIELDS)
        writer.writeheader(); writer.writerows(rows)
        atomic(path, text.getvalue())
        return row

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='skyzhao1223/dsh-agent-token-stats')
    parser.add_argument('--out', type=Path, default=Path.home() / 'dsh-plugins/stats-archive')
    parser.add_argument('--fixture', type=Path, help='Offline fixture JSON with repository/clones/views')
    args = parser.parse_args()
    try:
        if args.fixture:
            fixture = json.loads(args.fixture.read_text())
            repo, clones, views = (fixture[k] for k in ('repository', 'clones', 'views'))
        else:
            repo = api('repos/' + args.repo)
            clones = api('repos/' + args.repo + '/traffic/clones')
            views = api('repos/' + args.repo + '/traffic/views')
        row = archive(args.out, dt.date.today().isoformat(), repo, clones, views)
        timestamps = [r['timestamp'] for r in clones['clones']]
        print('snapshot:', json.dumps(row, ensure_ascii=False))
        print('Clone daily window (UTC):', min(timestamps) if timestamps else 'empty', 'to', max(timestamps) if timestamps else 'empty')
        print('Counts are clone/download activity, NOT installations, active users, or an additive lifetime total.')
    except (RuntimeError, ValueError, KeyError, OSError) as e:
        print('Snapshot failed; no empty CSV row appended:', e, file=__import__('sys').stderr)
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
