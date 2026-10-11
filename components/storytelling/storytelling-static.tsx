'use client';

import Link from 'next/link';
import { LANDING_MESSAGES } from '@/lib/landing-i18n';
import { CRYSTAL_CAPABILITIES, STORYTELLING_COPY, type StorytellingAction, type StorytellingLocale } from '@/lib/storytelling-types';
import { StorytellingLanguageMenu } from './storytelling-language-menu';

export function StorytellingStatic({ locale, onLocale, onAction, onRetry }: {
  locale: StorytellingLocale;
  onLocale: (locale: StorytellingLocale) => void;
  onAction: (action: StorytellingAction) => void;
  onRetry?: () => void;
}) {
  const t = STORYTELLING_COPY[locale];
  const footer = LANDING_MESSAGES[locale];
  return <main className="storytelling-static" lang={locale} data-render-mode="static">
    <header className="storytelling-static-nav">
      <Link href="/" className="storytelling-brand storytelling-nav-brand"><span className="storytelling-brand-symbol" aria-hidden="true" /><span>LinkeAI</span></Link>
      <nav aria-label={t.nav}>
        <button onClick={() => onAction('api')}>{t.api}</button>
        <button onClick={() => onAction('business')}>{t.business}</button>
        <button onClick={() => onAction('support')}>{t.support}</button>
        <StorytellingLanguageMenu locale={locale} onLocale={onLocale} />
      </nav>
    </header>
    <section className="storytelling-static-hero">
      <div className="storytelling-static-poster" aria-hidden="true" />
      <div className="storytelling-static-hero-copy">
        <h1>{locale === 'zh-CN' ? t.hero.split('\n').map(line => <span className="storytelling-hero-line" key={line}>{line}</span>) : t.hero}</h1><p>{t.phoenix}</p>
        <div className="storytelling-static-actions"><Link href="/app" className="storytelling-pill">{t.start}</Link>{onRetry ? <button onClick={onRetry} className="storytelling-pill storytelling-pill-quiet">{t.retry}</button> : <a href="#storytelling-capabilities" className="storytelling-pill storytelling-pill-quiet">{t.explore}</a>}</div>
      </div>
    </section>
    <section className="storytelling-static-ideas">
      <h2>{t.departure}</h2><p className="storytelling-static-sensory">{t.sensory.map(word => <span key={word}>{word}</span>)}</p>
      <div className="storytelling-static-principles">{t.principles.map((principle, index) => <p key={principle}><span aria-hidden="true">0{index + 1}</span>{principle}</p>)}</div>
    </section>
    <section id="storytelling-capabilities" className="storytelling-static-capabilities">
      <h2>{t.crystals}</h2>
      <div className="storytelling-static-capability-grid">{CRYSTAL_CAPABILITIES.map(capability => <article key={capability.id}>
        <span className="storytelling-static-capability-number" aria-hidden="true">0{capability.modelIndex + 1}</span><h3>{capability.title[locale]}</h3><p>{capability.copy[locale]}</p>
        <ul>{capability.usecases[locale].map(usecase => <li key={usecase}>{usecase}</li>)}</ul>
        <Link href="/app" className="storytelling-pill storytelling-pill-quiet">{t.start}</Link>
      </article>)}</div>
    </section>
    <section className="storytelling-static-final"><h2>{t.final}</h2>
      <div className="storytelling-static-actions storytelling-footer-actions"><Link href="/app" className="storytelling-pill">{t.start}</Link><button onClick={() => onAction('support')} className="storytelling-pill storytelling-pill-quiet">{footer.signup.support}</button></div>
      <div className="storytelling-footer-gift">
        <Link href="/app" className="storytelling-pill storytelling-pill-quiet storytelling-footer-offer">{locale === 'en' ? 'Sign up for a welcome pack' : '注册领取礼包'}</Link>
        <p className="storytelling-footer-offer-copy">{locale === 'en' ? 'Create with image, video, and chat tools for free.' : '新人免费大礼包，AI 绘画 / 视频 / 对话免费开用'}</p>
      </div>
    </section>
    <footer className="storytelling-static-footer storytelling-footer-revised">
      <div className="storytelling-footer-info"><span>© CORTEXIQ PTE. LTD.</span><span>{footer.footer.description}</span><a href="mailto:liaowei@ai6800.com">{footer.footer.email}</a></div>
      <nav className="storytelling-footer-links" aria-label={locale === 'en' ? 'Footer links' : '页脚链接'}>
        <button onClick={() => onAction('support')}>{t.support}</button><button onClick={() => onAction('feedback')}>{footer.footer.feedback}</button><button onClick={() => onAction('about')}>{footer.footer.about}</button><button onClick={() => onAction('privacy')}>{footer.footer.privacy}</button><button onClick={() => onAction('terms')}>{footer.footer.terms}</button>
      </nav>
      <div className="storytelling-footer-payments" role="group" aria-label={footer.footer.payments}>
        {/* These small local SVGs preserve the payment brands' original colors. */}
        <img src="/noomo-clone/images/payments/visa.svg" alt="Visa" width={38} height={24} /><img src="/noomo-clone/images/payments/mastercard.svg" alt="Mastercard" width={38} height={24} /><img src="/noomo-clone/images/payments/paypal.svg" alt="PayPal" width={38} height={24} />
      </div>
    </footer>
  </main>;
}
