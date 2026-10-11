#!/usr/bin/env python3
"""Archive the public Noomo homepage dependencies without running source code."""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / 'docs/research/noomo-source'
BASE = 'https://storytelling.noomoagency.com/'

def download(path):
    target = SNAPSHOT / path
    if not target.exists():
        request = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=35) as response:
            data = response.read()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    data = target.read_bytes()
    return {'path': path, 'url': BASE + path, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def main():
    paths = set()
    for file in SNAPSHOT.rglob('*'):
        if file.is_file() and file.suffix in ('.html', '.js', '.css'):
            content = file.read_text()
            for match in re.finditer(r'["\'`(](/(?:images|models|textures|timelines|audio|libs|_nuxt)/[^"\'`\s)<>]+)', content):
                path = match.group(1)[1:]
                if '${' not in path:
                    paths.add(path)
            for match in re.finditer(r'url\(["\']?([^\s)"\']+\.(?:otf|ttf|woff2|woff))["\']?\)', content):
                paths.add('_nuxt/' + match.group(1).split('/')[-1])
    for i in range(7):
        paths.update((f'models/crystal{i}.glb', f'textures/crystals/{i}.jpg'))
    paths.update(('models/v20.glb', 'models/feather.glb', 'timelines/cam.glb', 'timelines/cam-mob.glb', 'timelines/dev.glb',
                  'textures/wooden_studio_19_1k.hdr', 'libs/draco/draco_wasm_wrapper.js', 'libs/draco/draco_decoder.wasm',
                  'libs/draco/draco_decoder.js', 'libs/basis/basis_transcoder.js', 'libs/basis/basis_transcoder.wasm',
                  '_nuxt/builds/latest.json', 'fav.png'))
    html = (SNAPSHOT / 'index.html').read_text()
    paths.update(re.findall(r'href="/(_nuxt/builds/meta/[^"]+)"', html))
    # The raw contact/case chunks are archived for the transition mechanisms;
    # project videos are intentionally replaced by LinkeAI capability details.
    paths = {p for p in paths if not p.endswith('/') and not p.startswith('images/cases/')}
    results, failures = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download, path): path for path in sorted(paths)}
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as error:
                failures.append({'path': futures[future], 'error': str(error)})
    # Include the scripts and source HTML already captured during reconnaissance.
    known = {item['path'] for item in results}
    for file in SNAPSHOT.rglob('*'):
        if file.is_file() and file.name != 'manifest.json':
            path = file.relative_to(SNAPSHOT).as_posix()
            if path not in known:
                data = file.read_bytes()
                results.append({'path': path, 'url': BASE + ('' if path == 'index.html' else path), 'bytes': len(data),
                                'sha256': hashlib.sha256(data).hexdigest()})
    manifest = {'source': BASE, 'assets': sorted(results, key=lambda item: item['path']), 'failures': failures}
    (SNAPSHOT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'assets': len(results), 'bytes': sum(item['bytes'] for item in results), 'failures': failures}, ensure_ascii=False))

if __name__ == '__main__':
    main()
