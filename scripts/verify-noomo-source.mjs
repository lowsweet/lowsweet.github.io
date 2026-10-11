import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'docs/research/noomo-source');
const output = resolve(root, 'public/noomo-clone');
const manifest = JSON.parse(await readFile(resolve(source, 'manifest.json'), 'utf8'));
const failures = [];
let originalBytes = 0;
for (const asset of manifest.assets) {
  const buffer = await readFile(resolve(source, asset.path));
  originalBytes += buffer.length;
  if (createHash('sha256').update(buffer).digest('hex') !== asset.sha256) failures.push(`Source changed: ${asset.path}`);
  if (asset.path !== 'index.html' && !/\.(js|css)$/.test(asset.path)) {
    const copy = await readFile(resolve(output, asset.path));
    if (!buffer.equals(copy)) failures.push(`Original binary changed: ${asset.path}`);
  }
}
for (const path of ['index.html', 'linke-bridge.js', 'linke-content.css', 'messages.json', 'poster.jpg',
  'fonts/noto-sans-sc.woff2', 'fonts/noto-serif-sc.woff2']) {
  try { if (!(await stat(resolve(output, path))).size) failures.push(`Empty local dependency: ${path}`); }
  catch { failures.push(`Missing local dependency: ${path}`); }
}
const html = await readFile(resolve(output, 'index.html'), 'utf8');
if (/googletagmanager|google-analytics/.test(html)) failures.push('Upstream analytics in HTML');
const messages = JSON.parse(await readFile(resolve(output, 'messages.json'), 'utf8'));
if (!messages.messages?.['zh-CN'] || !messages.messages?.en || !messages.sceneHtml?.['zh-CN'] || !messages.sceneHtml?.en) failures.push('Bilingual content incomplete');
const generated = JSON.parse(await readFile(resolve(output, 'generated-manifest.json'), 'utf8'));
let generatedBytes = 0;
for (const asset of generated.assets) {
  try {
    const buffer = await readFile(resolve(output, asset.path));
    generatedBytes += buffer.length;
    if (buffer.length !== asset.bytes || createHash('sha256').update(buffer).digest('hex') !== asset.sha256) failures.push(`Generated dependency changed: ${asset.path}`);
  } catch { failures.push(`Missing generated dependency: ${asset.path}`); }
}
console.log(JSON.stringify({ originals: manifest.assets.length, originalBytes, generated: generated.assets.length, generatedBytes, failures }, null, 2));
if (failures.length) process.exitCode = 1;
