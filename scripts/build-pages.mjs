import { spawnSync } from 'node:child_process';
import { access, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
  cwd: root,
  env: { ...process.env, LINKEAI_GITHUB_PAGES: '1', NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// Next versions with a custom distDir may export into that directory directly.
const out = existsSync(path.join(root, 'out/index.html')) ? path.join(root, 'out') : path.join(root, '.next-pages');
await access(path.join(out, 'index.html'));
await access(path.join(out, 'app/index.html'));
await access(path.join(out, 'galaxy/index.html'));
await writeFile(path.join(out, '.nojekyll'), '');
await writeFile(path.join(out, 'build-info.json'), JSON.stringify({ builtAt: new Date().toISOString(), routes: ['/', '/app/', '/galaxy/'] }, null, 2));
await rm(path.join(root, 'pages-dist'), { recursive: true, force: true });
await rename(out, path.join(root, 'pages-dist'));
console.log('GitHub Pages export ready: pages-dist/');
