import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve('public/stars-clone');
const manifest = JSON.parse(await readFile(resolve(root, 'full-upstream-manifest.json'), 'utf8'));
const adapted = new Set(manifest.localAdaptations.map(entry => entry.split(':')[0]));
for (const file of manifest.files) {
  if (adapted.has(file.path)) continue;
  const bytes = await readFile(resolve(root, file.path));
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== file.sha256) throw new Error(`Original asset changed: ${file.path}`);
}
if (manifest.missing.length) throw new Error('Source assets are missing');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
if (/googletagmanager\.com\/gtm|gstatic\.com\/glue|\/\/fonts\.googleapis\.com/.test(html)) throw new Error('Remote runtime dependency remains');
console.log(`Verified ${manifest.files.length} source assets; documented adaptations: ${adapted.size}.`);
