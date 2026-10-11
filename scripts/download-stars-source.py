"""Vendor the exact public Stars galaxy files, with checksums for provenance."""
from pathlib import Path
from urllib.request import urlopen,Request
from concurrent.futures import ThreadPoolExecutor
import gzip, hashlib, json
base='https://stars.chromeexperiments.com/'
paths=['js/three.min.js','js/galaxy.js','js/lensflare.js','shaders/galacticstars.vsh','shaders/galacticstars.fsh','images/galactic_sharp.png','images/galactic_blur.png','images/galactictop.png','images/lensflare/lensflare0.png','images/lensflare/lensflare1.png','images/lensflare/lensflare2.png','images/lensflare/lensflare3.png','images/glowspan.png']
root=Path('public/stars-clone')
def save(path):
 response=urlopen(Request(base+path,headers={'User-Agent':'Mozilla/5.0'}),timeout=40)
 data=response.read()
 if data[:2]==b'\x1f\x8b':data=gzip.decompress(data)
 target=root/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 return {'path':path,'source':base+path,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
with ThreadPoolExecutor(max_workers=4) as pool:
 rows=list(pool.map(save,paths))
for row in rows:print(row['path'],row['bytes'])
(root/'upstream-manifest.json').write_text(json.dumps({'origin':base,'retrieved':'2026-10-09','files':rows},indent=2)+'\n')
