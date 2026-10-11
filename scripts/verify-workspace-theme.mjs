// Exercise the actual pre-paint reader and React gates without changing browser data.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { build } from 'esbuild';

const compile = source => ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const readerCode = compile(await readFile('lib/workspace-theme.ts', 'utf8'));
const workspaceCode = compile(await readFile('components/studio/workspace.tsx', 'utf8'));
const providerCode = compile(await readFile('lib/mock/use-demo.tsx', 'utf8'));
const jsx = (type, props) => ({ type, props });
const themeType = () => null;

function fixture({ path = '/app', stored = '{"theme":"light"}', denied = false } = {}) {
  const root = { dataset: {}, lang: 'zh-CN', classList: { toggle() {}, remove() {} } };
  const effects = [], writes = [];
  const storage = { getItem: () => { if (denied) throw Error('storage denied'); return stored; },
    setItem: (key, value) => { if (denied) throw Error('storage denied'); writes.push({ key, value }); } };
  const window = { location: { pathname: path }, localStorage: storage };
  const context = { exports: {}, window, localStorage: storage, document: { documentElement: root } };
  vm.runInNewContext(readerCode, context);
  const reader = context.exports;
  const bootstrap = () => vm.runInNewContext(reader.WORKSPACE_THEME_BOOTSTRAP, context);
  let state = { hydrated: false, preferences: { theme: 'dark', language: 'zh-CN' } };
  const react = { useLayoutEffect: callback => effects.push(callback), useEffect: callback => effects.push(callback),
    useSyncExternalStore: () => state };
  const load = (code, imports) => {
    const target = { ...context, exports: {}, require: name => imports[name] ?? {} };
    vm.runInNewContext(code, target); return target.exports;
  };
  const workspace = load(workspaceCode, {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    './lobe-ui': { WorkspaceTheme: themeType },
    '@/lib/mock/use-demo': { useDemoState: () => state, DemoProvider: 'DemoProvider' },
    '@/lib/workspace-theme': reader,
    '@/lib/mock/catalog': { MODELS: [{ id: 'suno', vendor: 'Suno' }] },
  });
  const provider = load(providerCode, {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    './service': { MockService: { initialize: async () => {}, getSnapshot: () => state } },
    './webmcp': { registerDemoTools: () => () => {} }, '@/components/ui/sonner': { Toaster: 'Toaster' },
  });
  return { root, reader, storage, writes, bootstrap, context,
    state: next => { state = next; },
    render: () => workspace.default().props.children.type(),
    provider: () => provider.DemoProvider({ children: null }),
    commit: () => effects.splice(0).map(callback => callback()).filter(Boolean),
  };
}

let checks = 0;
function test(name, run) { run(); checks++; console.log(`PASS ${name}`); }

test('saved light and dark are applied before any workspace markup', () => {
  for (const theme of ['light', 'dark']) {
    const f = fixture({ stored: JSON.stringify({ theme }) });
    f.bootstrap(); assert.equal(f.root.dataset.workspaceTheme, theme); assert.equal(f.writes.length, 0);
    const placeholder = f.render(); assert.equal(placeholder.props.role, 'status'); assert.notEqual(placeholder.type, themeType);
    f.commit(); assert.equal(f.root.dataset.workspaceTheme, theme);
  }
});
test('missing, malformed, invalid, and inaccessible storage use the existing dark default', () => {
  for (const options of [{ stored: null }, { stored: '{' }, { stored: 'null' }, { stored: '[]' },
    { stored: '{"theme":"unexpected"}' }, { denied: true }]) {
    const f = fixture(options); f.bootstrap(); assert.equal(f.root.dataset.workspaceTheme, 'dark');
    assert.equal(f.reader.readWorkspaceTheme(), 'dark');
  }
  const server = { exports: {} }; vm.runInNewContext(readerCode, server);
  assert.equal(server.exports.readWorkspaceTheme(), 'dark');
});
test('bootstrap never changes either landing page or unrelated routes', () => {
  for (const path of ['/', '/galaxy', '/application']) {
    const f = fixture({ path }); f.bootstrap(); assert.deepEqual(f.root.dataset, {});
  }
  const f = fixture({ path: '/app/' }); f.bootstrap(); assert.equal(f.root.dataset.workspaceTheme, 'light');
});
test('unrestored provider cannot overwrite the pre-paint theme', () => {
  const f = fixture(); f.bootstrap(); f.provider(); f.commit();
  assert.equal(f.root.dataset.workspaceTheme, 'light'); assert.equal(f.root.dataset.theme, undefined);
});
test('Strict Mode cleanup/setup keeps the saved theme and route exit clears the marker', () => {
  const f = fixture(); f.bootstrap(); f.render(); f.commit().forEach(cleanup => cleanup());
  assert.equal(f.root.dataset.workspaceTheme, undefined);
  f.render(); f.commit(); assert.equal(f.root.dataset.workspaceTheme, 'light');
  f.state({ hydrated: true, preferences: { theme: 'light', language: 'en' } });
  const tree = f.render(); assert.equal(tree.type, themeType); assert.equal(tree.props.appearance, 'light');
  f.provider(); const cleanups = f.commit(); assert.equal(f.root.dataset.theme, 'light');
  assert.equal(f.root.lang, 'en'); cleanups.forEach(cleanup => cleanup());
  assert.equal(f.root.dataset.workspaceTheme, undefined); assert.equal(f.root.dataset.theme, undefined);
});
test('live theme changes update the page and component together', () => {
  const f = fixture();
  for (const theme of ['light', 'dark', 'light']) {
    f.state({ hydrated: true, preferences: { theme, language: 'zh-CN' } });
    assert.equal(f.render().props.appearance, theme); f.provider(); f.commit();
    assert.equal(f.root.dataset.workspaceTheme, theme); assert.equal(f.root.dataset.theme, theme);
  }
});

// SSR optimizers replace window with undefined; the inline script must still
// contain a real browser storage read rather than a serialized dark fallback.
const optimizedReader = await build({ entryPoints: ['lib/workspace-theme.ts'], bundle: true,
  platform: 'node', format: 'cjs', write: false, define: { window: 'undefined' }, minify: true });
const optimizedModule = { exports: {} };
vm.runInNewContext(optimizedReader.outputFiles[0].text, { module: optimizedModule, exports: optimizedModule.exports });
for (const theme of ['light', 'dark']) {
  const f = fixture({ stored: JSON.stringify({ theme }) });
  vm.runInNewContext(optimizedModule.exports.WORKSPACE_THEME_BOOTSTRAP, f.context);
  assert.equal(f.root.dataset.workspaceTheme, theme);
}
checks++; console.log('PASS SSR optimization preserves pre-paint browser preference reading');

// Hold the actual MockService's asynchronous DB open: the first visible tree
// must remain a cached-theme placeholder throughout restoration.
const service = await build({ entryPoints: ['lib/mock/service.ts'], bundle: true, platform: 'node',
  format: 'cjs', write: false, external: ['idb'] });
let release;
const dbPromise = new Promise(resolve => { release = resolve; });
const f = fixture(); f.bootstrap();
const serviceModule = { exports: {} };
const context = { exports: serviceModule.exports, module: serviceModule, require: name => name === 'idb' ? { openDB: () => dbPromise } : {},
  localStorage: f.storage, setTimeout, clearTimeout, Blob, Date, crypto: globalThis.crypto };
vm.runInNewContext(service.outputFiles[0].text, context);
const mock = serviceModule.exports.MockService;
const restoring = mock.initialize();
assert.equal(mock.getState().hydrated, false); f.state(mock.getState());
assert.equal(f.render().props.role, 'status'); f.provider(); f.commit();
assert.equal(f.root.dataset.workspaceTheme, 'light'); assert.equal(f.root.dataset.theme, undefined);
release({ get: async () => undefined, put: async () => {} });
await restoring; f.state(mock.getState());
assert.equal(f.render().props.appearance, 'light'); f.provider(); f.commit();
assert.equal(f.root.dataset.theme, 'light'); assert.equal(mock.getState().hydrated, true);
assert.equal(mock.getState().points, 1000); assert.equal(mock.getState().projects.length, 2);
await mock.flush();
checks++; console.log('PASS slow preference restoration with the actual store preserves theme and data');
console.log(`Verified ${checks} workspace-theme scenarios.`);
