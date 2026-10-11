import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('docs/research/cc888-showcase/source-manifest.json', root), 'utf8'));
const data = JSON.parse(await readFile(new URL('lib/landing-showcase-data.json', root), 'utf8'));
assert.equal(manifest.items.length, 99);
assert.equal(data.length, 99);
assert.equal(new Set(data.map(item => item.id)).size, 99);
for (const [index, source] of manifest.items.entries()) {
  const item = data[index];
  const bytes = await readFile(new URL(source.file, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file);
  assert.equal(bytes.length, source.size, source.file);
  assert.equal(item.id, source.id);
  assert.equal(item.src, source.file.replace(/^public/, ''));
  assert.equal(item.size, source.size);
  assert.equal(item.width, source.width);
  assert.equal(item.height, source.height);
  assert.ok(item.width > 0 && item.height > 0);
  assert.ok(item.title['zh-CN'] && item.title.en);
  assert.ok(!/[\u4e00-\u9fff]/u.test(item.title.en));
  assert.ok(item.src.startsWith('/showcase/'));
  assert.ok(Number.isFinite(item.views) && Number.isFinite(item.uses));
  assert.equal(item.prompt, undefined, 'The source snapshot does not expose prompts');
}
console.log('Verified 99 original image hashes, dimensions, local paths and bilingual titles.');
