import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const remote = 'https://github.com/lowsweet/lowsweet.github.io.git';
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}
run(process.execPath, [path.join(root, 'scripts/build-pages.mjs')]);
const directory = await mkdtemp(path.join(tmpdir(), 'linkeai-pages-'));
try {
  run('git', ['clone', '--branch', 'gh-pages', '--single-branch', remote, directory]);
  for (const entry of await readdir(directory)) {
    if (entry !== '.git') await rm(path.join(directory, entry), { recursive: true, force: true });
  }
  await cp(path.join(root, 'pages-dist'), directory, { recursive: true });
  run('git', ['add', '--all'], directory);
  const changes = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: directory });
  if (changes.status === 1) {
    run('git', ['commit', '-m', 'Deploy LinkeAI static website'], directory);
    run('git', ['push', 'origin', 'gh-pages'], directory);
  }
  console.log('Published branch updated: https://lowsweet.github.io/');
} finally {
  if (existsSync(directory)) await rm(directory, { recursive: true, force: true });
}
