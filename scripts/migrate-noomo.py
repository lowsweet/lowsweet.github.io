#!/usr/bin/env python3
"""Rebuild the isolated LinkeAI edition from immutable upstream snapshots."""
from pathlib import Path
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/research/noomo-source'
OUTPUT = ROOT / 'public/noomo-clone'

def load_patches(name):
    path = ROOT / 'scripts/noomo' / (name + '.py')
    if not path.exists():
        return None
    spec = importlib.util.spec_from_file_location('noomo_' + name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def localize_paths(text):
    return re.sub(r'(["\'`(])/(models|textures|timelines|audio|libs|images)/',
                  r'\1/noomo-clone/\2/', text)

def main():
    # Authored bridge/styles/fallback/font inputs are separate from both the
    # immutable upstream archive and the generated public edition.
    edition = ROOT / 'scripts/noomo/edition'
    shutil.copytree(edition, OUTPUT, dirs_exist_ok=True)
    subprocess.run(['node', str(ROOT / 'scripts/noomo/logo-assets.mjs'),
                    str(edition / 'images/svg/linke-logo.svg'),
                    str(OUTPUT / 'textures/linke-logo.png')], check=True)
    engine = load_patches('engine')
    content = load_patches('content')
    if content and hasattr(content, 'write_messages'):
        content.write_messages()
    manifest = json.loads((SOURCE / 'manifest.json').read_text())
    for asset in manifest['assets']:
        path = asset['path']
        if path == 'index.html':
            continue
        source, target = SOURCE / path, OUTPUT / path
        if hashlib.sha256(source.read_bytes()).hexdigest() != asset['sha256']:
            raise RuntimeError('Upstream snapshot changed: ' + path)
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix in ('.js', '.css'):
            text = source.read_text()
            if path == '_nuxt/CbdjwYMp.js':
                if engine:
                    text = engine.patch_engine(text)
                if content:
                    text = content.patch_main_content(text)
                text = text.replace('name:"index",path:"/",component:', 'name:"index",path:"/",alias:"/index.html",component:')
                # Public-assets helpers must not add the prefix twice.
                text = text.replace('return n.length?cP(t,...n):t',
                                    'return n.length?(String(n[0]).startsWith("/noomo-clone/")?cP(...n):cP(t,...n)):t')
            if path == '_nuxt/FZFS71Nt.js' and content:
                text = content.patch_home(text)
            target.write_text(localize_paths(text))
        else:
            shutil.copyfile(source, target)
    config = {
        'public': {'device': {'defaultUserAgent': ''}, 'gtag': {'enabled': False, 'initMode': 'manual',
                   'id': '', 'initCommands': [], 'config': {}, 'tags': [], 'loadingStrategy': 'defer', 'url': ''}},
        'app': {'baseURL': '/noomo-clone/', 'buildId': '78d24864-e7ac-4700-9d87-77655fc8a92f',
                'buildAssetsDir': '/_nuxt/', 'cdnURL': ''},
    }
    html = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>LinkeAI · 链接想象与天空</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/noomo-clone/_nuxt/entry.BEbxiOYI.css"><link rel="stylesheet" href="/noomo-clone/_nuxt/index.CeGRoErV.css"><link rel="stylesheet" href="/noomo-clone/linke-content.css"><link rel="modulepreload" href="/noomo-clone/_nuxt/FZFS71Nt.js"><style>html,body{margin:0;background:#c9c0e4}body{min-height:100vh}</style></head><body><div id="__nuxt"></div><script>window.__NUXT__={serverRendered:false,config:CONFIG};</script><script src="/noomo-clone/linke-bridge.js"></script><script type="module" src="/noomo-clone/_nuxt/CbdjwYMp.js"></script></body></html>'''.replace('CONFIG', json.dumps(config, ensure_ascii=False))
    if content:
        html = re.sub(r'<title>[^<]*</title>',
                      f'<title>LinkeAI · {content.MESSAGES["zh-CN"]["heroLead"]}</title>', html, count=1)
    html = html.replace('</head>', '<link rel="stylesheet" href="/noomo-clone/linke-language.css"></head>')
    (OUTPUT / 'index.html').write_text(html)
    generated = []
    for file in OUTPUT.rglob('*'):
        if file.is_file() and file.name != 'generated-manifest.json':
            data = file.read_bytes()
            generated.append({'path': file.relative_to(OUTPUT).as_posix(), 'bytes': len(data),
                              'sha256': hashlib.sha256(data).hexdigest()})
    (OUTPUT / 'generated-manifest.json').write_text(json.dumps({'source': manifest['source'],
        'enginePatched': bool(engine), 'contentPatched': bool(content), 'assets': generated}, indent=2) + '\n')
    print(json.dumps({'generated': len(generated), 'enginePatched': bool(engine), 'contentPatched': bool(content)}))

if __name__ == '__main__':
    main()
