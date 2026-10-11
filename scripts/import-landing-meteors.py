"""Freeze the inspected public model list and port only the meteor stylesheet."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shutil
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / 'docs/research/cc888-meteors'
ICONS = ROOT / 'public/landing-model-icons'


def meteor_stylesheet(stylesheet):
    """Port the source motion and apply the Landing-only warm palette."""
    start = stylesheet.index('.xl-liuxing[data-v-025f3ed1]')
    end = stylesheet.index('@media(max-width:64rem)', start)
    css = stylesheet[start:end].replace('[data-v-025f3ed1]', '')
    css = css.replace('xl-liuxing', 'landing-model-meteors')
    css = css.replace('xl-meteor-', 'landing-meteor-').replace('xl-meteor', 'landing-meteor')
    css = css.replace('-025f3ed1', '')
    variables = {'jiao': 'angle', 'shi': 'duration', 'suo': 'scale',
                 'liang': 'brightness', 'wei': 'tail', 'zhuan': 'flare-rotation',
                 'yuan': 'spark-distance', 'pian': 'spark-offset', 'mono': 'mono'}
    for old, new in variables.items():
        css = css.replace('--xl-' + old, '--meteor-' + new)
    css = css.replace('var(--i)', 'var(--meteor-spark-index)')
    css = css.replace('--dx', '--meteor-character-offset').replace('--jc', '--meteor-character-distance')
    css = css.replace('translate(26rem)', 'translate(var(--meteor-travel, 26rem))')

    css = re.sub(r'rgba\(95,224,240,([^)]+)\)', r'rgb(var(--meteor-champagne) / \1)', css)
    css = re.sub(r'rgba\(255,255,255,([^)]+)\)', r'rgb(var(--meteor-warm-white) / \1)', css)
    # Keep the original hexadecimal alpha values when replacing glow colors.
    for original, token in [('5fe0f0', 'champagne'), ('48f0bc', 'warm-white'),
                            ('c9b6ff', 'lilac'), ('9a7bff', 'lilac'), ('ffffff', 'warm-white')]:
        def recolor(match):
            alpha = match.group(1)
            if alpha:
                return f'rgb(var(--meteor-{token}) / {int(alpha, 16) / 255:.9f})'
            return f'rgb(var(--meteor-{token}))'
        css = re.sub(r'#' + original + r'([0-9a-f]{2})?(?![0-9a-f])', recolor, css, flags=re.I)
    css = css.replace('background:#fff;', 'background:rgb(var(--meteor-warm-white));')
    # Both rings, the underline and all text glow use gold; glyphs stay white.
    for block in ['.landing-meteor-ring-b{', '.landing-meteor-line{', '@keyframes landing-meteor-zi{']:
        start = css.index(block)
        end = css.find('@keyframes', start + len(block)) if block.startswith('@keyframes') else css.index('}', start) + 1
        if end == -1:
            end = len(css)
        css = css[:start] + css[start:end].replace('--meteor-warm-white', '--meteor-champagne') + css[end:]

    assert css.count('@keyframes ') == 12
    css = css.replace('}.', '}\n.').replace('}@keyframes', '}\n@keyframes')
    css += '''
/* Landing integration and the requested small-screen variant. */
.landing-model-meteors{inset:0;width:100%;height:100%;z-index:1;--meteor-mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace}
/* Warm white #FFF9EF, champagne #E9CBA7, lilac #D1C5E8. */
.landing-model-meteors{--meteor-warm-white:255 249 239;--meteor-champagne:233 203 167;--meteor-lilac:209 197 232}
.landing-meteor-label{filter:drop-shadow(0 1px 2px rgba(0,0,0,.85))}
.landing-model-meteors[data-state="paused"]{visibility:hidden}
.landing-model-meteors[data-state="paused"] *, .landing-model-meteors[data-state="disabled"] *{animation-play-state:paused!important}
.landing-model-meteors[data-state="disabled"]{display:none}
.landing-model-meteors[data-view="compact"]{left:24px;right:24px;width:auto;overflow:clip}
.landing-model-meteors[data-view="compact"] .landing-meteor-label{font-size:12px}
@media(prefers-reduced-motion:reduce){.landing-model-meteors{display:none}}
'''
    return '/* Port of cc888.ai MoBan_02 meteor keyframes; see docs/research/cc888-meteors. */\n' + css


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', type=Path, default=RESEARCH / 'models-upstream.json')
    parser.add_argument('--stylesheet', type=Path, default=RESEARCH / 'upstream.css')
    parser.add_argument('--component', type=Path, default=RESEARCH / 'upstream.js')
    args = parser.parse_args()
    models = json.loads(args.snapshot.read_text())
    assert len(models) == 50 and len({model['id'] for model in models}) == 50
    urls = list(dict.fromkeys(model['模型图标'] for model in models))
    assert len(urls) == 13
    RESEARCH.mkdir(parents=True, exist_ok=True)
    ICONS.mkdir(parents=True, exist_ok=True)
    mapping = {}
    for url in urls:
        name = url.rsplit('/', 1)[-1]
        if name == '20260723022627_afed8e9e83001476.svg':
            name = 'suno.svg'
        assert re.fullmatch(r'[\w.-]+\.svg', name), name
        assert name not in mapping.values(), name
        mapping[url] = name

    def download(url):
        request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read()
        assert ET.fromstring(data).tag.endswith('svg'), url
        destination = ICONS / mapping[url]
        destination.write_bytes(data)
        return {'url': url, 'path': str(destination.relative_to(ROOT)),
                'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

    with ThreadPoolExecutor(max_workers=4) as pool:
        assets = list(pool.map(download, urls))
    fixture = [{'id': model['id'], 'name': model['展示名称'],
                'iconSrc': '/landing-model-icons/' + mapping[model['模型图标']]}
               for model in models]
    (ROOT / 'lib/landing-models.json').write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + '\n')

    (ROOT / 'components/landing/model-meteors.css').write_text(
        meteor_stylesheet(args.stylesheet.read_text()))
    sources = []
    for source, name, url in [(args.stylesheet, 'upstream.css', 'https://cc888.ai/assets/MoBan_02-DLnmM-Rc.css'),
                              (args.component, 'upstream.js', 'https://cc888.ai/assets/MoBan_02-DgB6Q6Hl.js'),
                              (args.snapshot, 'models-upstream.json', 'https://cc888.ai/houduan/peizhi/shouye_moxing')]:
        destination = RESEARCH / name
        if source.resolve() != destination.resolve():
            shutil.copyfile(source, destination)
        sources.append({'url': url, 'path': str(destination.relative_to(ROOT)),
                        'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()})
    manifest = {'sourcePage': 'https://cc888.ai/zh-CN',
                'capturedAt': datetime.fromtimestamp(args.snapshot.stat().st_mtime, timezone.utc).isoformat(),
                'modelCount': len(fixture), 'iconCount': len(assets),
                'sources': sources, 'assets': assets,
                'adaptations': ['Vue to React lifecycle', 'CSS scope and variable names',
                                'Local model snapshot and icons', 'Post-entrance activation',
                                'Compact layout at 1024px and below',
                                'Copy-relative anchors above and beside the bottom-left hero',
                                'Label collision guards and glyph shadow for the current galaxy',
                                'Warm white, champagne and lilac Landing palette',
                                'Pause/resume and teardown']}
    (RESEARCH / 'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print('Imported 50 models, 13 SVG icons and all 12 native meteor keyframes.')


if __name__ == '__main__':
    main()
