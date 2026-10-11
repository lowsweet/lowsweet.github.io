"""Import the frozen public gallery, preserving original bytes and source order."""
import hashlib
import io
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / 'docs/research/cc888-showcase'
OUTPUT = ROOT / 'public/showcase'
OUTPUT.mkdir(parents=True, exist_ok=True)
snapshot = json.loads((RESEARCH / 'public-snapshot.json').read_text())
english = json.loads((RESEARCH / 'english-titles.json').read_text())
assert len(snapshot['items']) == len(english) == 99
assert len({item['sourceUrl'] for item in snapshot['items']}) == 99


def import_image(row):
    index, source = row
    source_url = source['sourceUrl']
    identity = 'showcase-' + hashlib.sha256(source_url.encode()).hexdigest()[:16]
    existing = list(OUTPUT.glob(identity + '.*'))
    data = existing[0].read_bytes() if existing else None
    if data is None:
        for attempt in range(3):
            try:
                data = urlopen(Request(source_url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read()
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(attempt + 1)
    with Image.open(io.BytesIO(data)) as image:
        width, height = image.size
        extension, mime = {'JPEG': ('jpg', 'image/jpeg'), 'PNG': ('png', 'image/png'),
                           'WEBP': ('webp', 'image/webp')}[image.format]
        image.verify()
    filename = identity + '.' + extension
    (OUTPUT / filename).write_bytes(data)
    item = {'id': identity, 'src': '/showcase/' + filename, 'width': width, 'height': height,
            'mime': mime, 'size': len(data), 'title': {'zh-CN': source['title'], 'en': english[index]},
            'views': source['views'], 'uses': source['uses']}
    provenance = {'id': identity, 'sourceUrl': source_url, 'file': 'public/showcase/' + filename,
                  'sha256': hashlib.sha256(data).hexdigest(), 'size': len(data), 'width': width, 'height': height}
    print(f'{index + 1:02d}/99 {filename} {width}x{height}', flush=True)
    return item, provenance


with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(import_image, enumerate(snapshot['items'])))
(ROOT / 'lib/landing-showcase-data.json').write_text(json.dumps([row[0] for row in results], ensure_ascii=False, indent=2) + '\n')
(RESEARCH / 'source-manifest.json').write_text(json.dumps({'source': snapshot['source'],
    'capturedOn': snapshot['capturedOn'], 'items': [row[1] for row in results]}, ensure_ascii=False, indent=2) + '\n')
print(f'Imported {len(results)} original images, {sum(row[0]["size"] for row in results):,} bytes.')
