from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
files=['2026.01/22/20260122192439_188d09de785cd554ea5a.jpg','2026.01/21/20260121193701_188cbbf684d5cab0f72a.jpeg','2026.01/21/20260121192904_188cbb877aaa4cc44002.jpeg','2026.01/21/20260121193419_188cbbd0d9a5b4e0a74c.jpeg','2026.01/22/20260122192847_188d0a182c907e848dbc.jpg','2026.01/22/20260122192524_188d09e8dfa2438478f8.jpg','2026.01/21/20260121192848_188cbb83e9cc3cb0bdae.png','2026.01/22/20260122192413_188d09d87376528c4226.jpg','2026.01/22/20260122192041_188d09a6f1252d0c6f38.jpg','2026.01/22/20260122192337_188d09d017ee0d18ee1b.jpg','2026.01/22/20260122192122_188d09b09620e0a4b6f5.jpg','2026.01/22/20260122192321_188d09cc40b611f4d735.jpg','2026.01/22/20260122192442_188d09df1d4a602c4c26.jpg','2026.01/22/20260122192601_188d09f1727e5118c452.jpg','2026.01/21/20260121193623_188cbbedd5c195e8a69a.jpeg','2026.01/22/20260122192537_188d09ebe9299aa88b5f.jpg','2026.01/22/20260122192415_188d09d8c944e070bbd2.jpg','2026.01/22/20260122192120_188d09b02135d7b8f869.jpg','2026.01/22/20260122192226_188d09bf6aa95b906aac.jpg','2026.01/22/20260122192154_188d09b7f8855034c3be.jpg']
out=Path('public/media');out.mkdir(parents=True,exist_ok=True)
def save(row):
 i,path=row; target=out/f"gallery-{i+1:02d}.{'png' if i==6 else 'jpg'}"
 if target.exists():return target.name
 data=urlopen(Request('https://cos.lingkeai.vip/uploads/'+path,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
 target.write_bytes(data);return target.name
with ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(save,enumerate(files)):print(result)
