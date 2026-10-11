// Deterministic navigation/clock tests for the actual provider. Browser checks
// cover rendering, iframe audio, focus, and inert; these cover asynchronous races.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(resolve('components/transitions/workspace-entry-transition.tsx'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const routeModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(await readFile(resolve('lib/page-route.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, routeModule);

function fixture({ reduced = false, path = '/', throwNavigation = false } = {}) {
  let now = 0, sequence = 0, url = new URL(path, 'http://localhost');
  const jobs = new Map(), effects = [], cleanups = [], trace = [], pushes = [], phases = [];
  const listeners = new Map();
  const on = (type, callback) => { const set = listeners.get(type) ?? new Set(); set.add(callback); listeners.set(type, set); };
  const off = (type, callback) => listeners.get(type)?.delete(callback);
  const schedule = (callback, delay) => { const id = ++sequence; jobs.set(id, { at: now + delay, callback }); return id; };
  class Element {
    isConnected = true;
    style = { setProperty: (key, value) => { this.style[key] = value; } };
    focus() {}
    contains() { return false; }
    closest() { return this; }
    hasAttribute(name) { return this[name] === true; }
  }
  const document = { documentElement: { lang: 'en' }, activeElement: new Element(), body: { children: [] },
    addEventListener: on, removeEventListener: off, querySelector: () => null };
  const window = { get location() { return url; }, matchMedia: () => ({ matches: reduced }),
    addEventListener: on, removeEventListener: off,
    dispatchEvent: event => { trace.push({ type: event.type, detail: event.detail, at: now }); listeners.get(event.type)?.forEach(fn => fn(event)); } };
  const router = { prefetch() {}, push: href => {
    assert.equal(surface.overlay.style.opacity, '1', 'route changes only behind an opaque mask');
    assert.equal(trace.at(-1)?.type, 'linkeai-workspace-entry-covered');
    if (throwNavigation) throw new Error('navigation failed');
    pushes.push(href); url = new URL(href, url);
  } };
  const react = { createContext: value => ({ Provider: 'Provider', value }), useCallback: fn => fn, useContext: context => context.value,
    useMemo: fn => fn(), useRef: current => ({ current }),
    useState: initial => [initial, next => { const value = typeof next === 'function' ? next(phases.at(-1) ?? initial) : next; phases.push(value); }],
    useEffect: fn => effects.push(fn) };
  const jsx = (type, props) => ({ type, props });
  const sandbox = { exports: {}, require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx }
    : name === 'next/navigation' ? { useRouter: () => router, usePathname: () => url.pathname }
    : name === '@/lib/page-route' ? routeModule.exports : {},
    URL, URLSearchParams, Element, HTMLElement: Element, window, document, performance: { now: () => now },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    requestAnimationFrame: fn => schedule(() => fn(now), 16), cancelAnimationFrame: id => jobs.delete(id),
    setTimeout: schedule, clearTimeout: id => jobs.delete(id), MutationObserver: class { observe() {} disconnect() {} } };
  vm.runInNewContext(compiled, sandbox, { filename: 'workspace-entry-transition.tsx' });
  const tree = sandbox.exports.WorkspaceEntryProvider({ children: null });
  const surface = {};
  const attach = node => {
    if (!node?.props) return;
    if (node.props.ref) {
      const element = new Element(); node.props.ref.current = element;
      const key = node.props.className?.replace('workspace-entry-', ''); surface[key] = element;
    }
    const children = node.props.children;
    (Array.isArray(children) ? children : [children]).forEach(attach);
  };
  attach(tree);
  effects.forEach(fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); });
  const advance = until => {
    let count = 0;
    while (jobs.size) {
      const [id, job] = [...jobs].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (job.at > until) break;
      assert.ok(++count < 10000, 'clock must converge');
      now = job.at; jobs.delete(id); job.callback();
    }
    now = until;
  };
  const phase = () => phases.at(-1)?.phase ?? 'idle';
  const dispatch = (type, event = {}) => listeners.get(type)?.forEach(fn => fn(event));
  return { ...tree.props.value, advance, phase, pushes, trace, jobs, surface, dispatch, Element,
    home: () => { url = new URL('http://localhost/'); }, cleanup: () => cleanups.forEach(fn => fn()) };
}

let checks = 0;
function test(name, run) { run(); checks++; console.log(`PASS ${name}`); }

test('query/hash preserved; route waits for cover; repeated clicks ignored', () => {
  const f = fixture(); f.enterWorkspace('/app?view=api&prompt=a%20b#example'); f.enterWorkspace('/app');
  f.advance(159); assert.equal(f.pushes.length, 0); f.advance(160);
  assert.deepEqual(f.pushes, ['/app?view=api&prompt=a%20b#example']);
  f.workspaceReady('/app'); f.advance(600); assert.equal(f.phase(), 'waiting');
  f.workspaceReady('/app?view=api&prompt=a%20b'); f.advance(1240); assert.equal(f.phase(), 'idle'); assert.equal(f.jobs.size, 0);
});
test('early readiness cannot skip the 240ms covered interval', () => {
  const f = fixture(); f.enterWorkspace('/app'); f.workspaceReady('/app');
  f.advance(399); assert.equal(f.phase(), 'waiting'); f.advance(400); assert.equal(f.phase(), 'revealing');
  f.advance(1040); assert.equal(f.phase(), 'idle'); assert.equal(f.trace.at(-1).detail.outcome, 'complete');
});
test('static-host trailing slash readiness completes the same transition', () => {
  const f = fixture(); f.enterWorkspace('/app/?view=models');
  f.advance(160); f.workspaceReady('/app?view=models'); f.advance(1040);
  assert.equal(f.phase(), 'idle'); assert.equal(f.trace.at(-1).detail.outcome, 'complete');
});
test('slow preparation holds a fully covered mask until ready', () => {
  const f = fixture(); f.enterWorkspace('/app'); f.advance(3000);
  assert.equal(f.phase(), 'waiting'); assert.equal(f.surface.overlay.style.opacity, '1');
  f.workspaceReady('/app'); f.advance(3640); assert.equal(f.phase(), 'idle');
});
test('5s timeout releases the mask; stale ready notifications cannot restart it', () => {
  const f = fixture(); f.enterWorkspace('/app'); f.advance(5159); assert.equal(f.phase(), 'waiting');
  f.advance(5200); assert.equal(f.phase(), 'idle'); assert.equal(f.trace.at(-1).detail.outcome, 'timeout');
  f.workspaceReady('/app'); f.advance(6000); assert.equal(f.jobs.size, 0);
  f.home(); f.enterWorkspace('/app'); assert.equal(f.phase(), 'covering'); f.cleanup(); assert.equal(f.jobs.size, 0);
});
test('back before cover cancels navigation and all scheduled work', () => {
  const f = fixture(); f.enterWorkspace('/app'); f.advance(64); f.dispatch('popstate'); f.advance(1000);
  assert.equal(f.phase(), 'idle'); assert.equal(f.pushes.length, 0); assert.equal(f.jobs.size, 0);
});
test('back during reveal cancels and restores an idle controller', () => {
  const f = fixture(); f.enterWorkspace('/app'); f.workspaceReady('/app'); f.advance(500); f.dispatch('popstate'); f.advance(1000);
  assert.equal(f.phase(), 'idle'); assert.equal(f.trace.at(-1).detail.outcome, 'cancelled'); assert.equal(f.jobs.size, 0);
});
test('navigation exception cannot strand the cover or timeout', () => {
  const f = fixture({ throwNavigation: true }); f.enterWorkspace('/app'); f.advance(1000);
  assert.equal(f.phase(), 'idle'); assert.equal(f.trace.at(-1).detail.outcome, 'cancelled'); assert.equal(f.jobs.size, 0);
});
test('reduced and static animations finish within 100ms, excluding actual loading', () => {
  for (const options of [{ reduced: true }, { path: '/?motion=static' }]) {
    const f = fixture(options); f.enterWorkspace('/app'); f.workspaceReady('/app'); f.advance(100);
    assert.equal(f.phase(), 'idle'); assert.ok(f.trace.at(-1).at <= 100);
  }
});
test('direct app, galaxy, and external navigation do not create a transition', () => {
  for (const path of ['/app', '/galaxy']) { const f = fixture({ path }); f.enterWorkspace('/app'); assert.equal(f.phase(), 'idle'); }
  const f = fixture(); f.enterWorkspace('https://example.com/app'); f.enterWorkspace('/galaxy'); assert.equal(f.phase(), 'idle');
});
test('native modified/new-tab/download clicks remain native; ordinary clicks enter', () => {
  const f = fixture(); const anchor = new f.Element(); anchor.href = 'http://localhost/app?view=api'; anchor.target = '';
  let prevented = 0; const click = { target: anchor, button: 0, preventDefault: () => prevented++, stopImmediatePropagation() {} };
  f.dispatch('click', { ...click, metaKey: true }); f.dispatch('click', { ...click, button: 1 });
  anchor.target = '_blank'; f.dispatch('click', click); anchor.target = ''; anchor.download = true; f.dispatch('click', click);
  assert.equal(prevented, 0); anchor.download = false; f.dispatch('click', click); assert.equal(prevented, 1);
  f.advance(160); assert.deepEqual(f.pushes, ['/app?view=api']); f.cleanup(); assert.equal(f.jobs.size, 0);
});
console.log(`Verified ${checks} entry-transition scenarios.`);
