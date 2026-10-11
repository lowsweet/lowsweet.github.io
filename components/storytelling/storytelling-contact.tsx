'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Textarea } from '@/components/beautiful-ui/primitives';
import { MockService } from '@/lib/mock/service';
import { LANDING_MESSAGES } from '@/lib/landing-i18n';
import type { StorytellingDialogKind, StorytellingLocale } from '@/lib/storytelling-types';

type ContactKind = 'business' | 'support' | 'feedback';
type FormError = 'name' | 'email' | 'message' | 'save' | 'copy';

const COPY = {
  'zh-CN': {
    business: '商务合作', support: '联系 LinkeAI 客服',
    businessDescription: '介绍你的团队、应用场景与合作需求。', supportDescription: '告诉我们你遇到的问题或想咨询的内容。',
    name: '称呼', namePlaceholder: '怎么称呼你', email: '邮箱', message: '需求或问题',
    messagePlaceholder: '填写你想咨询的内容…', submit: '保存需求', submitting: '保存中…',
    close: '关闭', copy: '复制邮箱', copied: '已复制', saved: '需求已保存',
    savedDescription: '需求已保存在当前浏览器。你也可以通过邮箱联系，或进入工作台开始创作。',
    workspace: '进入工作台',
    errors: { name: '请填写你的称呼。', email: '请填写有效的邮箱地址。', message: '请填写你的需求或问题。', save: '保存失败，请检查浏览器存储后重试。', copy: '复制失败。请手动复制邮箱地址。' },
  },
  en: {
    business: 'Partner with LinkeAI', support: 'Contact LinkeAI',
    businessDescription: 'Tell us about your team, use case, and partnership ideas.', supportDescription: 'Tell us what you need help with or what you would like to know.',
    name: 'Name', namePlaceholder: 'What should we call you?', email: 'Email', message: 'Your needs or question',
    messagePlaceholder: 'Tell us what you would like to ask…', submit: 'Save request', submitting: 'Saving…',
    close: 'Close', copy: 'Copy email', copied: 'Copied', saved: 'Request saved',
    savedDescription: 'Your request is saved in this browser. You can also contact us by email, or open the workspace to start creating.',
    workspace: 'Open workspace',
    errors: { name: 'Please enter your name.', email: 'Please enter a valid email address.', message: 'Please describe your needs or question.', save: 'We couldn’t save this. Check browser storage, then try again.', copy: 'Copy failed. Please copy the email address manually.' },
  },
} satisfies Record<StorytellingLocale, {
  business: string; support: string; businessDescription: string; supportDescription: string;
  name: string; namePlaceholder: string; email: string; message: string; messagePlaceholder: string;
  submit: string; submitting: string; close: string; copy: string; copied: string; saved: string;
  savedDescription: string; workspace: string; errors: Record<FormError, string>;
}>;

export function StorytellingContact({ kind, locale, onClose }: { kind: StorytellingDialogKind | null; locale: StorytellingLocale; onClose: () => void }) {
  const t = COPY[locale];
  const landing = LANDING_MESSAGES[locale];
  const infoKind = kind === 'about' || kind === 'privacy' || kind === 'terms' ? kind : null;
  const formKind = kind === 'business' || kind === 'support' || kind === 'feedback' ? kind : null;
  return <Dialog open={kind !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="storytelling-contact" lang={locale}>
      <DialogHeader>
        <DialogTitle>{kind ? landing.modals[kind].title : ''}</DialogTitle>
        <DialogDescription>{kind ? landing.modals[kind].description : ''}</DialogDescription>
      </DialogHeader>
      {infoKind ? <div className="storytelling-footer-prose">
        {landing[infoKind].map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <DialogFooter><DialogCloseButton label={t.close} /></DialogFooter>
      </div> : formKind && <ContactForm key={formKind} kind={formKind} locale={locale} />}
    </DialogContent>
  </Dialog>;
}

function ContactForm({ kind, locale }: { kind: ContactKind; locale: StorytellingLocale }) {
  const t = COPY[locale];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText('liaowei@ai6800.com');
      setCopied(true);
      setError(null);
    } catch {
      setError('copy');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const emailField = form.querySelector<HTMLInputElement>('input[type="email"]');
    const invalid: FormError | null = !name.trim() ? 'name' : !email.trim() || emailField?.validity.typeMismatch ? 'email' : !message.trim() ? 'message' : null;
    if (invalid) {
      setError(invalid);
      const selector = invalid === 'name' ? 'input[autocomplete="name"]' : invalid === 'email' ? 'input[type="email"]' : 'textarea';
      form.querySelector<HTMLElement>(selector)?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await MockService.initialize();
      if (MockService.getState().storageError) throw new Error('Storage unavailable');
      MockService.addFeedback(`${name.trim()} / ${email.trim()}\n${message.trim()}`, kind === 'business' ? '商务合作' : kind === 'feedback' ? '举报与反馈' : '客服咨询');
      await MockService.flush();
      if (MockService.getState().storageError) throw new Error('Storage unavailable');
      setSubmitted(true);
    } catch {
      setError('save');
    } finally {
      setSubmitting(false);
    }
  }

  return submitted ? <div className="storytelling-contact-saved" role="status">
    <h3>{t.saved}</h3><p>{t.savedDescription}</p>
    <div className="storytelling-contact-address"><span>liaowei@ai6800.com</span><Button variant="quiet" onClick={copyAddress}>{copied ? t.copied : t.copy}</Button></div>
    {error && <p role="alert" className="bui-alert">{t.errors[error]}</p>}
    <DialogFooter><DialogCloseButton label={t.close} /><Button variant="primary" asChild><Link href="/app">{t.workspace}</Link></Button></DialogFooter>
  </div> : <form className="storytelling-contact-form" onSubmit={submit} noValidate>
    <div className="storytelling-contact-address"><span>liaowei@ai6800.com</span><Button variant="quiet" onClick={copyAddress}>{copied ? t.copied : t.copy}</Button></div>
    {error && <p id="storytelling-contact-error" role="alert" className="bui-alert">{t.errors[error]}</p>}
    <label>{t.name}<Input value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder={t.namePlaceholder} required aria-invalid={error === 'name'} aria-describedby={error === 'name' ? 'storytelling-contact-error' : undefined} /></label>
    <label>{t.email}<Input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={error === 'email'} aria-describedby={error === 'email' ? 'storytelling-contact-error' : undefined} /></label>
    <label>{t.message}<Textarea value={message} onChange={event => setMessage(event.target.value)} rows={4} placeholder={t.messagePlaceholder} required aria-invalid={error === 'message'} aria-describedby={error === 'message' ? 'storytelling-contact-error' : undefined} /></label>
    <DialogFooter><DialogCloseButton label={t.close} /><Button variant="primary" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? t.submitting : t.submit}</Button></DialogFooter>
  </form>;
}
