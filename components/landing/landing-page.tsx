'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { Badge, Button, Card, Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input, Textarea } from '@/components/beautiful-ui/primitives';
import { DemoProvider, useDemoState } from '@/lib/mock/use-demo';
import { MockService } from '@/lib/mock/service';
import { LANDING_LANGUAGES, LANDING_MESSAGES, LANDING_METEOR_MODELS, type LandingLocale, type LandingError, type LandingModalKind as ModalKind } from '@/lib/landing-i18n';
import { showcaseToAsset, type LandingShowcaseItem } from '@/lib/landing-showcase';
import { LandingStartButton } from './landing-start-button';
import { ModelConstellation } from './model-constellation';
import { ModelMeteors } from './model-meteors';
import { LandingShowcase } from './landing-showcase';
import './landing.css';
import './landing-menu.css';
import './landing-entrance.css';
import './landing-scroll.css';

const GalaxyScene = dynamic(
  () => import('./galaxy-scene').then(module => module.GalaxyScene),
  { ssr: false, loading: () => <div className="galaxy-scene" aria-hidden="true"><div className="galaxy-static" /></div> },
);

export default function LandingPage() {
  return <DemoProvider><LandingContent /></DemoProvider>;
}

function LandingContent() {
  const state = useDemoState();
  const favorites = new Set(state.assets.filter(asset => asset.favorite).map(asset => asset.url));
  const locale: LandingLocale = state.preferences.language === 'en' ? 'en' : 'zh-CN';
  const t = LANDING_MESSAGES[locale];
  const language = LANDING_LANGUAGES.find(option => option.locale === locale)!.label;
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [activeWork, setActiveWork] = useState<LandingShowcaseItem | null>(null);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<LandingError | ''>('');
  const [entranceComplete, setEntranceComplete] = useState(false);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const doorwayRef = useRef<HTMLElement>(null);
  const revealForeground = useCallback(() => setEntranceComplete(true), []);
  const displayedWork = activeWork ? showcaseToAsset(activeWork, locale) : null;
  const errorMessage = actionError ? t.errors[actionError] : '';

  useEffect(() => {
    // Keep the viewport as the scroll container so the galaxy's native camera
    // and the section visibility observers continue to follow the same scroll.
    const root = document.documentElement;
    root.classList.add('landing-scroll-snap');
    if (new URLSearchParams(window.location.search).get('motion') === 'static') {
      root.classList.add('landing-scroll-static');
    }
    return () => root.classList.remove('landing-scroll-snap', 'landing-scroll-static');
  }, []);

  useEffect(() => {
    const copy = heroCopyRef.current;
    const section = copy?.closest('section');
    const doorway = doorwayRef.current;
    if (!copy || !section || !doorway) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    let frame = 0;
    let dirty = true;
    let target = 0;
    let progress: number | undefined;
    let distance = 0;
    let span = 1;
    let previousTime = 0;
    const ease = (start: number, end: number, value: number) => {
      const fraction = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return fraction * fraction * (3 - 2 * fraction);
    };
    const render = (time: number) => {
      frame = 0;
      if (dirty) {
        const bounds = section.getBoundingClientRect();
        span = Math.max(1, doorway.getBoundingClientRect().top - bounds.top);
        distance = Math.max(0, -bounds.top);
        target = Math.min(1, distance / span);
        dirty = false;
      }
      const still = reduced.matches || forcedStatic || document.querySelector<HTMLElement>('.galaxy-scene')?.dataset.renderMode === 'static';
      const elapsed = previousTime ? Math.min(50, time - previousTime) : 1000 / 60;
      previousTime = time;
      // Follow wheel/trackpad motion without restarting a CSS transition each frame.
      progress = progress === undefined || still ? target : progress + (target - progress) * (1 - Math.exp(-elapsed / 200));
      if (Math.abs(target - progress) < .0005) progress = target;
      const opacity = 1 - ease(.06, .88, progress);
      const nextOpacity = ease(.42, .96, progress) * (1 - ease(.02, .14, opacity));
      copy.style.setProperty('--hero-scroll-opacity', opacity.toFixed(4));
      // Let the text recede gently rather than sweep rapidly into the fixed menu.
      copy.style.setProperty('--hero-scroll-offset', `${still ? 0 : Math.min(distance, span) * .78}px`);
      copy.dataset.scrollProgress = progress.toFixed(4);
      doorway.style.setProperty('--doorway-scroll-opacity', nextOpacity.toFixed(4));
      copy.inert = !entranceComplete || opacity <= .02 || target >= .98;
      doorway.inert = nextOpacity <= .02;
      if (progress !== target) frame = requestAnimationFrame(render);
      else previousTime = 0;
    };
    const schedule = () => { dirty = true; if (!frame) frame = requestAnimationFrame(render); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduced.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      copy.style.removeProperty('--hero-scroll-opacity');
      copy.style.removeProperty('--hero-scroll-offset');
      doorway.style.removeProperty('--doorway-scroll-opacity');
      doorway.inert = false;
    };
  }, [entranceComplete]);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = t.metadata.title;
    if (description) description.content = t.metadata.description;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, [t.metadata]);

  function openModal(kind: ModalKind) {
    setSubmitted(false); setCopied(false); setActionError(''); setModal(kind);
  }

  async function submitLocalForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const emailInput = event.currentTarget.querySelector<HTMLInputElement>('input[type="email"]');
    const invalid: LandingError | '' = !formName.trim() ? 'name' : !formEmail.trim() || emailInput?.validity.typeMismatch ? 'email' : modal !== 'register' && !formMessage.trim() ? 'message' : '';
    if (invalid) {
      setActionError(invalid);
      const selector = invalid === 'name' ? 'input[autocomplete="name"]' : invalid === 'email' ? 'input[type="email"]' : 'textarea';
      event.currentTarget.querySelector<HTMLElement>(selector)?.focus();
      return;
    }
    setIsSubmitting(true);
    setActionError('');
    try {
      await MockService.initialize();
      if (MockService.getState().storageError) throw Error(MockService.getState().storageError);
      const key = modal === 'register' ? 'linkeai-demo-registration' : 'linkeai-demo-contact';
      localStorage.setItem(key, JSON.stringify({ name: formName, email: formEmail, message: formMessage, type: modal, createdAt: Date.now() }));
      if (modal === 'register') {
        MockService.register(formName.trim(), formEmail.trim());
      } else {
        const category = modal === 'business' ? '商务合作' : modal === 'support' ? '客服咨询' : '内容举报';
        MockService.addFeedback(`${formName.trim()} / ${formEmail.trim()}\n${formMessage.trim()}`, category);
      }
      await MockService.flush();
      if (MockService.getState().storageError) throw Error(MockService.getState().storageError);
      setSubmitted(true);
    } catch {
      setSubmitted(false);
      setActionError('save');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeLanguage(value: LandingLocale) {
    setActionError('');
    try {
      await MockService.initialize();
      MockService.setPreferences({ language: value });
      await MockService.flush();
      if (MockService.getState().storageError) throw Error(MockService.getState().storageError);
      setLanguageMenuOpen(false);
    } catch {
      setActionError('language');
    }
  }

  async function toggleWorkFavorite(item: LandingShowcaseItem) {
    if (isSavingFavorite) return;
    setIsSavingFavorite(true);
    setActionError('');
    try {
      await MockService.initialize();
      if (MockService.getState().storageError) throw Error(MockService.getState().storageError);
      const existing = MockService.getState().assets.find(asset => asset.url === item.src);
      if (existing) MockService.toggleFavoriteAsset(existing.id);
      else MockService.addAsset({ ...showcaseToAsset(item, 'zh-CN'), favorite: true, createdAt: Date.now() });
      await MockService.flush();
      if (MockService.getState().storageError) throw Error(MockService.getState().storageError);
    } catch {
      setActionError('favorite');
    } finally {
      setIsSavingFavorite(false);
    }
  }

  async function copyEmail() {
    try { await navigator.clipboard.writeText('liaowei@ai6800.com'); setCopied(true); }
    catch { setCopied(false); }
  }

  return <main className="landing linkeai-home beautiful-ui" lang={locale} data-locale={locale} data-entrance={entranceComplete ? 'ready' : 'pending'}>
    <GalaxyScene onEntranceComplete={revealForeground} frameTitle={t.galaxy} />
    <header className="landing-nav landing-menu-header landing-entrance-menu" inert={!entranceComplete}>
      <Link className="brand" href="/" aria-label={t.nav.home}>LinkeAI</Link>
      <nav className="landing-menu-nav" aria-label={t.nav.navigation}>
        <Button variant="quiet" size="md" className="landing-nav-api" asChild><Link href="/app?view=api">{t.nav.api}</Link></Button>
        <Button variant="quiet" size="md" className="landing-menu-business" onClick={() => openModal('business')}>{t.nav.business}</Button>
        <Button variant="quiet" size="md" className="landing-menu-support" onClick={() => openModal('support')}>{t.nav.support}</Button>
        <DropdownMenu open={languageMenuOpen} onOpenChange={open => { setLanguageMenuOpen(open); if (open) setActionError(''); }}>
          <DropdownMenuTrigger asChild><Button variant="quiet" size="md" className="landing-menu-language" aria-label="Language / 语言" title="Language / 语言"><span lang={locale}>{language}</span><ChevronDown size={13} strokeWidth={1.5} aria-hidden="true" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="landing-language-menu" lang={locale}>
            {LANDING_LANGUAGES.map(option => <DropdownMenuItem key={option.locale} role="menuitemradio" aria-checked={locale === option.locale} onSelect={event => { event.preventDefault(); void changeLanguage(option.locale); }}><span lang={option.locale}>{option.label}</span>{locale === option.locale && <span className="landing-choice-state">{t.nav.current}</span>}</DropdownMenuItem>)}
            {errorMessage && <p className="bui-alert" role="alert">{errorMessage}</p>}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>

    <section id="opening" className="landing-hero landing-section" data-galaxy-section="opening">
      <ModelMeteors enabled={entranceComplete} models={LANDING_METEOR_MODELS[locale]} />
      <div ref={heroCopyRef} className="landing-hero-copy" inert={!entranceComplete}>
        <div className="landing-entrance-copy">
          <h1>{t.hero.first}<br /><span>{t.hero.second}</span></h1>
          <p>{t.hero.description}</p>
        </div>
        <div className="hero-actions landing-entrance-actions"><LandingStartButton label={t.hero.start} /></div>
      </div>
    </section>

    <section ref={doorwayRef} id="doorway" className="landing-section landing-doorway" data-galaxy-section="doorway"><div className="landing-text-block">
      <h2>{t.doorway.title}</h2>
      <p>{t.doorway.description}</p>
      <div className="hero-actions landing-doorway-actions"><LandingStartButton label={t.hero.start} /></div>
    </div><ModelConstellation enabled={entranceComplete} models={LANDING_METEOR_MODELS[locale]} label={t.doorway.modelsLabel} /></section>

    <section id="capabilities" className="landing-section landing-capabilities" data-galaxy-section="capabilities">
      <div className="landing-section-heading"><h2>{t.capabilities.title}</h2><p>{t.capabilities.description}</p></div>
      <div className="landing-capability-grid">{t.capabilities.items.map(({ kind, title, label, copy }) => <Card asChild key={kind}><Link href={`/app?view=models&kind=${kind}`} className="landing-capability-card">
        <div className="landing-capability-top"><Badge>{label}</Badge></div><h3>{title}</h3><p>{copy}</p>
      </Link></Card>)}</div>
    </section>

    <LandingShowcase locale={locale} copy={t.gallery} onOpenWork={item => { setActionError(''); setActiveWork(item); }} />

    <div className="landing-final-screen">
    <section id="signup" className="landing-section landing-signup" data-galaxy-section="signup">
      <h2>{t.signup.title}</h2><p>{t.signup.description}</p><div className="hero-actions"><Button variant="primary" size="md" onClick={() => openModal('register')}>{t.signup.register}</Button><Button size="md" onClick={() => openModal('support')}>{t.signup.support}</Button></div><small>{t.signup.offer}</small>
    </section>

    <footer className="landing-footer">
      <div className="landing-footer-main"><div><Link className="brand" href="/" aria-label={t.nav.home}>LinkeAI</Link><p>{t.footer.description}</p><Button variant="quiet" size="xs" className="landing-email" onClick={() => openModal('support')}>{t.footer.email}</Button></div><div className="landing-footer-links"><Button variant="quiet" size="xs" onClick={() => openModal('support')}>{t.nav.support}</Button><Button variant="quiet" size="xs" onClick={() => openModal('feedback')}>{t.footer.feedback}</Button><Button variant="quiet" size="xs" onClick={() => openModal('about')}>{t.footer.about}</Button><Button variant="quiet" size="xs" onClick={() => openModal('privacy')}>{t.footer.privacy}</Button><Button variant="quiet" size="xs" onClick={() => openModal('terms')}>{t.footer.terms}</Button></div></div>
      <div className="landing-footer-bottom"><span>© CORTEXIQ PTE. LTD.</span><div className="landing-payment-logos" aria-label={t.footer.payments}><strong>VISA</strong><strong>Mastercard</strong><strong>PayPal</strong></div></div>
    </footer>
    </div>

    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}>
      <DialogContent className="landing-dialog" lang={locale}>
        <DialogHeader><DialogTitle>{modal ? t.modals[modal].title : ''}</DialogTitle><DialogDescription>{modal ? t.modals[modal].description : ''}</DialogDescription></DialogHeader>
        {errorMessage && <p id="landing-form-error" role="alert" className="bui-alert">{errorMessage}</p>}
        {modal === 'about' ? <div className="landing-dialog-prose">
          {t.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <DialogFooter><DialogCloseButton label={t.form.close} /><Button variant="primary" asChild><Link href="/app">{t.form.workspace}</Link></Button></DialogFooter>
        </div> : modal === 'privacy' || modal === 'terms' ? <div className="landing-dialog-prose">
          {t[modal].map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <DialogFooter><DialogCloseButton label={t.form.close} /><Button variant="primary" onClick={() => setModal(null)}>{t.form.understood}</Button></DialogFooter>
        </div> : submitted ? <div className="landing-form-success" role="status">
          <span><Check size={24} aria-hidden="true" /></span><h3>{modal === 'register' ? t.form.accountCreated : t.form.submitted}</h3>
          <p>{modal === 'register' ? t.form.accountSuccess(state.points) : t.form.contactSuccess}</p>
          <DialogFooter><DialogCloseButton label={t.form.close} /><Button variant="primary" asChild><Link href={modal === 'register' ? '/app?view=account' : '/app'}>{t.form.workspace}</Link></Button></DialogFooter>
        </div> : <form className="landing-contact-form" onSubmit={submitLocalForm} noValidate>
          {modal === 'support' && <div className="landing-contact-address"><span>liaowei@ai6800.com</span><Button variant="quiet" size="sm" onClick={copyEmail}>{copied ? t.form.copied : t.form.copyEmail}</Button></div>}
          <label>{t.form.name}<Input value={formName} onChange={event => setFormName(event.target.value)} placeholder={t.form.namePlaceholder} autoComplete="name" aria-invalid={actionError === 'name'} aria-describedby={actionError === 'name' ? 'landing-form-error' : undefined} required /></label>
          <label>{t.form.email}<Input type="email" value={formEmail} onChange={event => setFormEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={actionError === 'email'} aria-describedby={actionError === 'email' ? 'landing-form-error' : undefined} required /></label>
          {modal !== 'register' && <label>{modal === 'feedback' ? t.form.feedback : modal === 'business' ? t.form.business : t.form.support}<Textarea value={formMessage} onChange={event => setFormMessage(event.target.value)} placeholder={modal === 'business' ? t.form.businessPlaceholder : t.form.messagePlaceholder} rows={4} aria-invalid={actionError === 'message'} aria-describedby={actionError === 'message' ? 'landing-form-error' : undefined} required /></label>}
          <DialogFooter><DialogCloseButton label={t.form.close} /><Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t.form.submitting : modal === 'register' ? t.form.register : t.form.submit}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>

    <Dialog open={activeWork !== null} onOpenChange={open => { if (!open) setActiveWork(null); }}>
      <DialogContent className="landing-work-dialog" lang={locale}>{displayedWork && <>
        <div className="landing-work-preview"><img src={displayedWork.url} alt={displayedWork.name} width={activeWork?.width} height={activeWork?.height} /></div>
        <div className="landing-work-detail">
          <DialogHeader><DialogTitle>{displayedWork.name}</DialogTitle><DialogDescription>{t.gallery.views(displayedWork.views ?? 0)} · {t.gallery.uses(activeWork?.uses ?? 0)}</DialogDescription></DialogHeader>
          {displayedWork.prompt && <div className="landing-work-prompt"><Badge>{t.gallery.prompt}</Badge><p>{displayedWork.prompt}</p></div>}
          <DialogFooter className="landing-work-actions"><DialogCloseButton label={t.form.close} /><Button disabled={!state.hydrated || isSavingFavorite} aria-busy={isSavingFavorite} aria-pressed={favorites.has(displayedWork.url)} onClick={() => { if (activeWork) void toggleWorkFavorite(activeWork); }}>{favorites.has(displayedWork.url) ? t.gallery.favorited : t.gallery.favorite}</Button><Button variant="primary" asChild><Link href={`/app?view=agents&agent=universal-images-s2&prompt=${encodeURIComponent(displayedWork.prompt || displayedWork.name)}`}>{t.gallery.create}</Link></Button></DialogFooter>
          {errorMessage && <p role="alert" className="bui-alert">{errorMessage}</p>}
        </div>
      </>}</DialogContent>
    </Dialog>
  </main>;
}
