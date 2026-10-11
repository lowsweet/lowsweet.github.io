import options from './storytelling-languages.json';
import type { StorytellingLocale } from './storytelling-types';

export const STORYTELLING_LANGUAGES: readonly {
  code: string;
  label: string;
  enabled: boolean;
}[] = options;

export function isStorytellingLocale(code: string): code is StorytellingLocale {
  return (code === 'zh-CN' || code === 'en')
    && STORYTELLING_LANGUAGES.some(option => option.code === code && option.enabled);
}

export function storytellingLanguageLabel(locale: StorytellingLocale) {
  return STORYTELLING_LANGUAGES.find(option => option.code === locale)?.label ?? locale;
}

export const STORYTELLING_LANGUAGE_COPY = {
  'zh-CN': { choose: '选择语言', unavailable: '暂未开放' },
  en: { choose: 'Choose language', unavailable: 'Coming soon' },
} as const;
