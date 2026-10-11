'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { isStorytellingLocale, STORYTELLING_LANGUAGES, STORYTELLING_LANGUAGE_COPY, storytellingLanguageLabel } from '@/lib/storytelling-languages';
import type { StorytellingLocale } from '@/lib/storytelling-types';
import '@/scripts/noomo/edition/linke-language.css';

export function StorytellingLanguageMenu({ locale, onLocale }: {
  locale: StorytellingLocale;
  onLocale: (locale: StorytellingLocale) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({ top: 12, left: 12 });
  const copy = STORYTELLING_LANGUAGE_COPY[locale];

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !menu.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const width = menu.current.offsetWidth;
      const height = menu.current.offsetHeight;
      const below = rect.bottom + 10;
      const top = below + height <= window.innerHeight - 12 ? below : rect.top - height - 10;
      setPosition({ top: Math.max(12, top), left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) });
    };
    place();
    const chosen = menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    chosen?.focus({ preventScroll: true });
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !trigger.current?.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside, true);
    return () => document.removeEventListener('pointerdown', outside, true);
  }, [open]);

  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === 'Tab') { close(true); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    if (!items.length) return;
    const current = items.findIndex(item => item === document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
    items[next].focus({ preventScroll: true });
  }

  return <div className="storytelling-language-control">
    <button ref={trigger} type="button" className="linke-language-trigger dark" aria-label={copy.choose}
      aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => open ? close() : setOpen(true)}
      onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
      <span className="linke-language-globe" aria-hidden="true" /><span>{storytellingLanguageLabel(locale)}</span><span className="linke-language-chevron" aria-hidden="true" />
    </button>
    {open ? createPortal(<div ref={menu} id={id} className="linke-language-menu" role="menu" aria-label={copy.choose}
      data-theme="dark" style={position} onKeyDown={keys}>
      {STORYTELLING_LANGUAGES.map(option => <button key={option.code} type="button" className="linke-language-item"
        role="menuitemradio" aria-checked={option.code === locale} disabled={!option.enabled} tabIndex={-1}
        onClick={() => { if (!option.enabled || !isStorytellingLocale(option.code)) return; close(true); if (option.code !== locale) onLocale(option.code); }}>
        <span className="linke-language-check" aria-hidden="true" /><span lang={option.code}>{option.label}</span>
        {!option.enabled ? <span className="linke-language-status">{copy.unavailable}</span> : null}
      </button>)}
    </div>, document.body) : null}
  </div>;
}
