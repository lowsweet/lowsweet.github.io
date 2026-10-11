'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DemoProvider, useDemoState } from '@/lib/mock/use-demo';
import { MockService } from '@/lib/mock/service';
import { normalizePagePath } from '@/lib/page-route';
import { useWorkspaceEntry } from '@/components/transitions/workspace-entry-transition';
import { CRYSTAL_CAPABILITIES, STORYTELLING_COPY, type StorytellingAction, type StorytellingDialogKind, type StorytellingLocale } from '@/lib/storytelling-types';
import { StorytellingContact } from './storytelling-contact';
import { StorytellingStatic } from './storytelling-static';
import './storytelling.css';

type RenderMode = 'detecting' | 'interactive' | 'static' | 'failed';

export default function StorytellingPage() {
  return <DemoProvider><StorytellingContent /></DemoProvider>;
}

function StorytellingContent() {
  const state = useDemoState();
  const router = useRouter();
  const { enterWorkspace } = useWorkspaceEntry();
  const locale: StorytellingLocale = state.preferences.language === 'en' ? 'en' : 'zh-CN';
  const t = STORYTELLING_COPY[locale];
  const [mode, setMode] = useState<RenderMode>('detecting');
  const [contact, setContact] = useState<StorytellingDialogKind | null>(null);
  const [languageError, setLanguageError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const closeContact = useCallback(() => setContact(null), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    const check = () => setMode(reducedMotion.matches || forcedStatic ? 'static' : 'interactive');
    check();
    reducedMotion.addEventListener('change', check);
    return () => reducedMotion.removeEventListener('change', check);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('storytelling-immersive', mode === 'detecting' || mode === 'interactive');
    return () => root.classList.remove('storytelling-immersive');
  }, [mode]);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = t.title;
    if (description) description.content = t.description;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, [t.title, t.description]);

  const changeLocale = useCallback(async (nextLocale: StorytellingLocale) => {
    setLanguageError(false);
    try {
      await MockService.initialize();
      MockService.setPreferences({ language: nextLocale });
      await MockService.flush();
      if (MockService.getState().storageError) throw new Error('Storage unavailable');
    } catch {
      setLanguageError(true);
    }
  }, []);

  const navigate = useCallback((path: string) => {
    if (normalizePagePath(new URL(path, window.location.origin).pathname) === '/app') enterWorkspace(path);
    else router.push(path);
  }, [enterWorkspace, router]);
  const handleAction = useCallback((action: StorytellingAction) => {
    if (action === 'api') enterWorkspace('/app?view=api');
    else setContact(action);
  }, [enterWorkspace]);
  const fail = useCallback(() => setMode('failed'), []);
  const retry = useCallback(() => { setAttempt(value => value + 1); setMode('interactive'); }, []);

  return <div className="storytelling-host" lang={locale} data-render-mode={mode}>
    {mode === 'static' || mode === 'failed' ? <StorytellingStatic locale={locale} onLocale={value => { void changeLocale(value); }} onAction={handleAction} onRetry={mode === 'failed' ? retry : undefined} /> : mode === 'interactive' && state.hydrated ? <StorytellingFrame key={attempt} locale={locale} paused={contact !== null} onLocale={changeLocale} onNavigate={navigate} onAction={handleAction} onError={fail} /> : <StorytellingLoader locale={locale} />}
    {languageError && <p className="storytelling-language-error" role="alert">{t.languageError}</p>}
    <StorytellingContact kind={contact} locale={locale} onClose={closeContact} />
  </div>;
}

function StorytellingLoader({ locale }: { locale: StorytellingLocale }) {
  return <div className="storytelling-loader" role="status" aria-live="polite" aria-label={STORYTELLING_COPY[locale].loading}><span className="storytelling-loader-icon" aria-hidden="true" /></div>;
}

function StorytellingFrame({ locale, paused, onLocale, onNavigate, onAction, onError }: {
  locale: StorytellingLocale;
  paused: boolean;
  onLocale: (locale: StorytellingLocale) => Promise<void>;
  onNavigate: (path: string) => void;
  onAction: (action: StorytellingAction) => void;
  onError: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [source] = useState(() => `/noomo-clone/index.html?locale=${locale}`);
  const [ready, setReady] = useState(false);

  const post = useCallback((payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage({ namespace: 'linke-story', ...payload }, window.location.origin);
  }, []);

  useEffect(() => {
    const frameElement = iframeRef.current;
    const frameWindow = frameElement?.contentWindow;
    function receive(event: MessageEvent<unknown>) {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow || !event.data || typeof event.data !== 'object') return;
      const data = event.data as Record<string, unknown>;
      if (data.namespace !== 'linke-story') return;
      if (data.type === 'ready' || data.type === 'status' && data.ready === true) {
        readyRef.current = true;
        setReady(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else if (data.type === 'error') {
        onError();
      } else if (data.type === 'navigate' && typeof data.path === 'string') {
        let destination: URL;
        try { destination = new URL(data.path, window.location.origin); }
        catch { return; }
        if (destination.origin !== window.location.origin || !['/app', '/galaxy'].includes(normalizePagePath(destination.pathname))) return;
        if (normalizePagePath(destination.pathname) === '/galaxy') post({ type: 'shutdown' });
        onNavigate(destination.pathname + destination.search + destination.hash);
      } else if (data.type === 'action' && (data.action === 'api' || data.action === 'business' || data.action === 'support' || data.action === 'feedback' || data.action === 'about' || data.action === 'privacy' || data.action === 'terms')) {
        onAction(data.action);
      } else if (data.type === 'locale' && (data.locale === 'zh-CN' || data.locale === 'en')) {
        void onLocale(data.locale);
      }
    }
    window.addEventListener('message', receive);
    if (!readyRef.current) timeoutRef.current = setTimeout(onError, 20_000);
    post({ type: 'status' });
    return () => {
      window.removeEventListener('message', receive);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // A Fast Refresh effect cleanup keeps the same connected iframe. Only
      // dispose a removed document; the child also handles its own unload.
      queueMicrotask(() => {
        if (frameElement && !frameElement.isConnected) {
          frameWindow?.postMessage({ namespace: 'linke-story', type: 'shutdown' }, window.location.origin);
        }
      });
    };
  }, [onAction, onError, onLocale, onNavigate, post]);

  useEffect(() => {
    const mute = () => post({ type: 'mute' });
    const dispose = () => post({ type: 'shutdown' });
    const end = (event: Event) => {
      // If navigation fails while the covered scene was disposed, offer the
      // existing readable fallback instead of leaving a frozen iframe behind.
      if ((event as CustomEvent<{ outcome: string }>).detail.outcome !== 'complete' && window.location.pathname === '/' && disposed) onError();
    };
    let disposed = false;
    const covered = () => { disposed = true; dispose(); };
    window.addEventListener('linkeai-workspace-entry-start', mute);
    window.addEventListener('linkeai-workspace-entry-covered', covered);
    window.addEventListener('linkeai-workspace-entry-end', end);
    return () => {
      window.removeEventListener('linkeai-workspace-entry-start', mute);
      window.removeEventListener('linkeai-workspace-entry-covered', covered);
      window.removeEventListener('linkeai-workspace-entry-end', end);
    };
  }, [onError, post]);

  useEffect(() => {
    const pause = () => post({ type: 'pause', paused: document.hidden || paused });
    document.addEventListener('visibilitychange', pause);
    pause();
    return () => document.removeEventListener('visibilitychange', pause);
  }, [paused, post]);

  useEffect(() => {
    post({ type: 'locale', locale });
  }, [locale, post]);

  function initialize() {
    // Every loaded iframe document needs its configuration, including a local
    // document reload that preserves the parent component during development.
    post({ type: 'init', locale, capabilities: CRYSTAL_CAPABILITIES });
    post({ type: 'locale', locale });
    post({ type: 'pause', paused: document.hidden || paused });
    post({ type: 'status' });
  }

  return <main className="storytelling-frame-shell" data-ready={ready}>
    <iframe ref={iframeRef} src={source} title={STORYTELLING_COPY[locale].title} className="storytelling-frame" onLoad={initialize} onError={onError} allow="autoplay; fullscreen" />
    {!ready && <StorytellingLoader locale={locale} />}
  </main>;
}
