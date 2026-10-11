'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizePagePath } from '@/lib/page-route';
import './workspace-entry-transition.css';

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing';
type Outcome = 'complete' | 'cancelled' | 'timeout';
type Entry = {
  href: string;
  reduced: boolean;
  ready: boolean;
  coveredAt: number | null;
  frame: number | null;
  minimumTimer: ReturnType<typeof setTimeout> | null;
  deadline: ReturnType<typeof setTimeout> | null;
  previousFocus: Element | null;
};

const EntryContext = createContext({
  enterWorkspace: (_href: string): void => {},
  workspaceReady: (_href: string): void => {},
});

// The source loader's power3.inOut curve, without adding another animation runtime.
const power3InOut = (t: number) => t < .5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4;
const routeKey = (url: URL) => normalizePagePath(url.pathname) + url.search;
const signal = (stage: 'start' | 'covered' | 'end', detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(`linkeai-workspace-entry-${stage}`, { detail }));

export function useWorkspaceEntry() { return useContext(EntryContext); }

export function WorkspaceEntryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const entryRef = useRef<Entry | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const focusFrameRef = useRef<number | null>(null);
  const [view, setView] = useState({ phase: 'idle' as Phase, reduced: false, english: false });
  const active = view.phase !== 'idle';

  const finish = useCallback((outcome: Outcome) => {
    const entry = entryRef.current;
    if (!entry) return;
    entryRef.current = null;
    if (entry.frame !== null) cancelAnimationFrame(entry.frame);
    if (entry.minimumTimer !== null) clearTimeout(entry.minimumTimer);
    if (entry.deadline !== null) clearTimeout(entry.deadline);
    setView(current => ({ ...current, phase: 'idle' }));
    signal('end', { outcome });
    // Restore focus after React removes inert, including a cancelled navigation.
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      const target = outcome === 'complete' ? document.querySelector<HTMLElement>('.studio-workspace main')
        : entry.previousFocus?.isConnected && entry.previousFocus instanceof HTMLElement ? entry.previousFocus : null;
      target?.focus({ preventScroll: true });
    });
  }, []);

  const animate = useCallback((entry: Entry, duration: number, draw: (progress: number) => void, done: () => void) => {
    const start = performance.now();
    const tick = (now: number) => {
      if (entryRef.current !== entry) return;
      const progress = Math.min(1, (now - start) / duration);
      draw(progress);
      if (progress < 1) entry.frame = requestAnimationFrame(tick);
      else { entry.frame = null; done(); }
    };
    entry.frame = requestAnimationFrame(tick);
  }, []);

  const revealIfReady = useCallback(() => {
    const entry = entryRef.current;
    if (!entry || !entry.ready || entry.coveredAt === null || entry.frame !== null) return;
    if (performance.now() - entry.coveredAt < (entry.reduced ? 0 : 240)) return;
    if (entry.deadline !== null) { clearTimeout(entry.deadline); entry.deadline = null; }
    setView(current => ({ ...current, phase: 'revealing' }));
    animate(entry, entry.reduced ? 40 : 600, progress => {
      const eased = power3InOut(progress);
      if (entry.reduced) {
        if (overlayRef.current) overlayRef.current.style.opacity = String(1 - progress);
      } else {
        surfaceRef.current?.style.setProperty('--reveal-radius', `${200 * eased}vmax`);
        if (loaderRef.current) {
          loaderRef.current.style.opacity = String(1 - progress);
          loaderRef.current.style.transform = `scale(${1 - .08 * progress})`;
        }
      }
    }, () => finish('complete'));
  }, [animate, finish]);

  const workspaceReady = useCallback((href: string) => {
    const entry = entryRef.current;
    if (!entry || routeKey(new URL(href, window.location.origin)) !== routeKey(new URL(entry.href, window.location.origin))) return;
    entry.ready = true;
    revealIfReady();
  }, [revealIfReady]);

  const enterWorkspace = useCallback((href: string) => {
    // Direct /app loads, the galaxy edition, modified clicks, and external links
    // never enter this controller. The iframe uses the same explicit entry point.
    if (entryRef.current || window.location.pathname !== '/') return;
    const target = new URL(href, window.location.href);
    if (target.origin !== window.location.origin || normalizePagePath(target.pathname) !== '/app') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || new URLSearchParams(window.location.search).get('motion') === 'static';
    const entry: Entry = { href: target.pathname + target.search + target.hash, reduced, ready: false,
      coveredAt: null, frame: null, minimumTimer: null, deadline: null, previousFocus: document.activeElement };
    entryRef.current = entry;
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
    surfaceRef.current?.style.setProperty('--reveal-radius', '0vmax');
    if (loaderRef.current) { loaderRef.current.style.opacity = '1'; loaderRef.current.style.transform = 'scale(1)'; }
    setView({ phase: 'covering', reduced, english: document.documentElement.lang === 'en' });
    signal('start', { href: entry.href });
    animate(entry, reduced ? 40 : 160, progress => {
      if (overlayRef.current) overlayRef.current.style.opacity = String(1 - (1 - progress) ** 3);
    }, () => {
      entry.coveredAt = performance.now();
      setView(current => ({ ...current, phase: 'waiting' }));
      signal('covered');
      entry.deadline = setTimeout(() => finish('timeout'), 5000);
      entry.minimumTimer = setTimeout(revealIfReady, reduced ? 0 : 240);
      try { router.push(entry.href); }
      catch { finish('cancelled'); }
    });
  }, [animate, finish, revealIfReady, router]);

  useEffect(() => {
    if (pathname === '/') router.prefetch('/app');
  }, [pathname, router]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!anchor || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return;
      const target = new URL(anchor.href, window.location.href);
      if (window.location.pathname !== '/' || target.origin !== window.location.origin || normalizePagePath(target.pathname) !== '/app') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      enterWorkspace(target.href);
    };
    const back = () => finish('cancelled');
    document.addEventListener('click', click, true);
    window.addEventListener('popstate', back);
    return () => { document.removeEventListener('click', click, true); window.removeEventListener('popstate', back); };
  }, [enterWorkspace, finish]);

  useEffect(() => {
    if (entryRef.current && normalizePagePath(pathname) !== '/' && normalizePagePath(pathname) !== '/app') finish('cancelled');
  }, [pathname, finish]);

  useEffect(() => {
    if (!active) return;
    overlayRef.current?.focus({ preventScroll: true });
    // Dialogs/toasts can be portalled beside the provider. Keep those inert too,
    // and restore each node's original state when the transition ends.
    const previous = new Map<HTMLElement, boolean>();
    const isolate = () => {
      for (const child of document.body.children) {
        if (!(child instanceof HTMLElement) || child === overlayRef.current || child === contentRef.current
          || child.contains(overlayRef.current) || ['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) continue;
        if (!previous.has(child)) previous.set(child, child.inert);
        child.inert = true;
      }
    };
    isolate();
    const observer = new MutationObserver(isolate);
    observer.observe(document.body, { childList: true });
    const preventScroll = (event: Event) => event.preventDefault();
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      observer.disconnect();
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      previous.forEach((inert, node) => { node.inert = inert; });
    };
  }, [active]);

  useEffect(() => () => {
    const entry = entryRef.current;
    entryRef.current = null;
    if (entry?.frame != null) cancelAnimationFrame(entry.frame);
    if (entry?.minimumTimer != null) clearTimeout(entry.minimumTimer);
    if (entry?.deadline != null) clearTimeout(entry.deadline);
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
  }, []);

  const context = useMemo(() => ({ enterWorkspace, workspaceReady }), [enterWorkspace, workspaceReady]);
  return <EntryContext.Provider value={context}>
    <div ref={contentRef} className="workspace-entry-content" inert={active}>{children}</div>
    <div ref={overlayRef} className="workspace-entry-overlay" data-phase={view.phase} data-reduced={view.reduced}
      hidden={!active} role="status" aria-live="polite" aria-busy={active} tabIndex={-1}>
      <div ref={surfaceRef} className="workspace-entry-surface" aria-hidden="true" />
      {!view.reduced && <span ref={loaderRef} className="workspace-entry-loader" aria-hidden="true" />}
      <span className="sr-only">{view.english ? 'Opening your workspace…' : '正在进入工作台…'}</span>
    </div>
  </EntryContext.Provider>;
}
