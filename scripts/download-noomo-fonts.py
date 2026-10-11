#!/usr/bin/env python3
"""Keep local CJK font subsets aligned with both editions of the new copy."""
from pathlib import Path
import concurrent.futures
import json
import re
import shutil
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'public/noomo-clone/fonts'
INPUTS = ROOT / 'scripts/noomo/edition/fonts'

def main():
    texts = [(ROOT / 'scripts/noomo/content.py').read_text(), (ROOT / 'lib/storytelling-types.ts').read_text()]
    texts += [file.read_text() for file in (ROOT / 'components/storytelling').glob('*.tsx')]
    glyphs = ''.join(sorted(set(re.findall(r'[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]', ''.join(texts)))))
    FOLDER.mkdir(parents=True, exist_ok=True)
    INPUTS.mkdir(parents=True, exist_ok=True)
    def download(pair):
        family, filename = pair
        target, record = FOLDER / filename, FOLDER / (filename + '.source.json')
        if target.exists() and record.exists() and json.loads(record.read_text())['glyphs'] == glyphs:
            return {'font': filename, 'bytes': target.stat().st_size, 'cached': True}
        url = 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(family) + ':wght@400;600&display=swap&text=' + urllib.parse.quote(glyphs)
        request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36'})
        css = urllib.request.urlopen(request, timeout=30).read().decode()
        source = re.findall(r'url\(([^)]+)\)', css)[0]
        data = urllib.request.urlopen(source, timeout=30).read()
        target.write_bytes(data)
        record.write_text(json.dumps({'css': url, 'source': source, 'glyphs': glyphs, 'bytes': len(data)}, ensure_ascii=False, indent=2))
        shutil.copyfile(target, INPUTS / filename)
        shutil.copyfile(record, INPUTS / record.name)
        return {'font': filename, 'bytes': len(data), 'cached': False}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        print(json.dumps(list(executor.map(download, [('Noto Sans SC', 'noto-sans-sc.woff2'), ('Noto Serif SC', 'noto-serif-sc.woff2')]))))

if __name__ == '__main__':
    main()
